// 两个命令式能力 —— explorer 的对外入口：
//
//  · 方法 A `openFilePreview`：传文件/文件夹路径，打开右侧停靠预览（可拖宽、Esc 关）；
//  · 方法 B `pickWorkspaceFile`：Promise 返回选中的绝对路径（弹窗在锚点按钮旁弹出，
//    Esc / 点外部 / ✕ 关，选中即 resolve）。
//
// 两者共用同一套 FileBrowser 面板（用户 2026-10-20 拍板：同一套内容，两种展现形式）。
// 数据面 = 只读 FS 面（`src/host/fs-route.ts` 的 client 侧），**浏览不吃会话**；
// 会话只在两处出现：Office 预览（懒取一条）与相对路径的基准。
//
// ⚠️ 方法 A 的**侧边栏本体是核心 PanelDock**（用户 2026-10-21 拍板：不许自绘制外壳 + 拖拽条）。
// PanelDock 是布局成员（占宽度、挤窄主区），同 ui/modal-host.ts 的做法：自建 container 挂 + createRoot，
// 关闭即卸载回收，不残留空根；拖宽与关闭交给 PanelDock 自己的 resizer / header 关钮。
import { createElement as h, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { workspaceList } from '../ui/host-data.js';
import { DockPanel, PanelDock, createPanelDock } from '../ui/PanelDock.js';
import { FileBrowser } from './FileBrowser.js';
import { getFsFace } from './fs-face.js';
import { PICKER_MAX_H, PICKER_WIDTH, placePicker } from './picker-placement.js';
import { isAbsoluteish, normalizePath, workspaceOfPath } from './types.js';
import { ensureComponentStyles, getStyleKit } from '../ui/css.js';
import { PANEL_DOCK_CSS } from '../ui/panel-dock-css.js';
import { FEEDBACK_CSS } from '../ui/feedback-css.js';
import { OverlayMask } from '../ui/overlay.js';
import { PanelSurface } from '../ui/panel.js';
/**
 * 入参路径解析成**绝对路径**（`''` = 虚拟根）。用户 2026-11-03 定：绝对/相对都收。
 *
 * 相对路径必须有一个基准：显式 `sessionId` 所属工作区优先，其次「最近有会话的工作区」。
 * 解析不出 ⇒ `null`（调用方提示 `explorerNoBase`，不猜）。
 */
export function resolveStartPath(path, anchors, sessionId) {
    if (path === '')
        return '';
    if (isAbsoluteish(path))
        return normalizePath(path);
    const owner = sessionId === undefined
        ? undefined
        : anchors.find((item) => item.sessionIds?.includes(sessionId) === true && item.path !== undefined);
    const base = owner?.path ?? anchors.find((item) => item.path !== undefined)?.path;
    if (base === undefined)
        return null;
    return normalizePath(`${normalizePath(base)}/${path.replace(/^\/+/, '')}`);
}
/**
 * 给 `FileBrowser` 的 `rootPath`：路径所属工作区的真实根（dock 与 picker 共用这一份推导）。
 * 顺序 = 当前路径命中 > 指定会话所属 > 第一个带 path 的工作区（2026-11-03 从两处重复代码合并）。
 */
function rootPathOf(path, anchors, sessionId) {
    return workspaceOfPath(path, anchors)?.path
        ?? (sessionId === undefined
            ? undefined
            : anchors.find((item) => item.sessionIds?.includes(sessionId) === true)?.path)
        ?? anchors.find((item) => item.path !== undefined)?.path;
}
function warnNotWired(api, filesMissing) {
    console.warn(`[dsh-plugin-core/explorer] ${api}: `
        + (filesMissing
            ? '没有文件面（client apply 里没调 connectFs，或宿主没注册 serveFsRoute）'
            : '相对路径找不到工作区基准（宿主 workspaces 里没有带 path 的工作区）')
        + ' ⇒ 放弃本次操作');
}
/** 预览侧边栏的挂载容器 id（全站唯一，重复打开先关旧的）。 */
const PREVIEW_HOST_ID = 'dshpc-file-preview-host';
/** dock 里的面板 id（本 container 里只有一个）。 */
const PREVIEW_PANEL_ID = 'file-preview';
/**
 * 挂载宿主行自动补的类：主区伸展 / 子项不收溢出的规则挂在它下面（`src/ui/panel-dock.css`）。
 * 消费方不必自己写 —— 打开时加、关闭时摘。
 */
const DOCK_HOST_CLASS = 'dshpc-dock-host';
let activePreview = null;
/**
 * 打开工作区文件/文件夹的**停靠**预览（分栏：挤窄 `mount` 左边的兄弟，不是盖上去）。
 * 重复打开会关掉上一个（同侧边栏位）。
 *
 * 消费方最少写法（`connectHost(ctx)` + `connectFs({ path })` 已接线）：
 * `openFilePreview({ mount, path })` —— 路径解析、工作区匹配都由核心自己解。
 */
export function openFilePreview(options) {
    if (typeof document === 'undefined')
        return null;
    const mount = typeof options.mount === 'string'
        ? document.querySelector(options.mount)
        : options.mount;
    // 解析不到就放弃：绝不回落 body（那是浮层，不是分栏）。
    if (mount === null) {
        console.warn(`[dsh-plugin-core/explorer] openFilePreview: mount 选择器解析不到元素（${String(options.mount)}）`
            + ' ⇒ 放弃本次操作');
        return null;
    }
    const custom = options.content !== undefined;
    const files = getFsFace();
    const anchors = options.workspaceAnchors ?? workspaceList.getSnapshot();
    if (!custom && files === undefined) {
        warnNotWired('openFilePreview', true);
        return null;
    }
    const start = custom ? '' : resolveStartPath(options.path ?? '', anchors, options.sessionId);
    if (!custom && start === null) {
        warnNotWired('openFilePreview', false);
        return null;
    }
    // content 与 path 文档写的二选一：同传时 content 生效，但别让 handle.path
    // 回报一个根本没被使用的路径（2026-11-04）。
    if (custom && options.path !== undefined) {
        console.warn('[dsh-plugin-core/explorer] openFilePreview: content 与 path 只能二选一，path 已忽略');
    }
    // rootPath 的推导只有一份（`rootPathOf`）；调用方显式给了就听调用方的。
    const opts = {
        ...options,
        mount,
        path: custom ? undefined : options.path,
        rootPath: options.rootPath ?? rootPathOf(start ?? '', anchors, options.sessionId),
    };
    // 只允许一个预览。**已经开着 ⇒ 换内容**（用户 2026-10-28：侧栏已经在那了，点别的文件就该
    // 直接切 —— 不重播展开动效、也不改用户拖好的宽度）。换页面 / 换容器就地把挂载体搬过去。
    if (activePreview !== null) {
        activePreview.keepWidth();
        activePreview.adopt(mount);
        activePreview.draw(opts, start ?? '');
        return { close: activePreview.close, path: opts.path ?? '' };
    }
    const container = document.createElement('div');
    container.id = PREVIEW_HOST_ID;
    container.setAttribute('data-dshpc-file-preview', '');
    // display:contents ⇒ 容器自身不产生盒子，核心 .dshpc-dock 直接成为 mount 的 flex 子项
    // （这样才「挤」得动左边的兄弟；套一层真盒子会把 dock 变成 mount 的整行块）。
    container.style.cssText = 'display:contents';
    // 布局自愈：那行不必自己写成 flex —— 核心补（换位置 / 关闭时还原），只对「本来就是别的布局」不动手。
    let hostEl = null;
    let hostPrevDisplay = '';
    let hostHadClass = false;
    const restoreHost = () => {
        if (hostEl === null)
            return;
        hostEl.style.display = hostPrevDisplay;
        if (!hostHadClass)
            hostEl.classList.remove(DOCK_HOST_CLASS);
        hostEl = null;
    };
    const adopt = (next) => {
        if (next === hostEl)
            return;
        restoreHost();
        // 唯一仍算错的是传 body（那是浮层，不是分栏），只留痕不改行为。
        if (next === document.body) {
            console.warn('[dsh-plugin-core/explorer] openFilePreview: 不要传 document.body —— PanelDock 是布局成员'
                + '（停靠右侧 + 挤窄主区）。请传你页面里包住主区的那个元素。');
        }
        hostPrevDisplay = next.style.display;
        hostHadClass = next.classList.contains(DOCK_HOST_CLASS);
        next.classList.add(DOCK_HOST_CLASS);
        const display = typeof getComputedStyle === 'function' ? getComputedStyle(next).display : '';
        if (display !== 'flex' && display !== 'inline-flex')
            next.style.display = 'flex';
        // 已在文档里的节点 appendChild 就是「移动」，React 根不受影响。
        next.appendChild(container);
        hostEl = next;
    };
    adopt(mount);
    const dock = createPanelDock({
        maxPanels: 1,
        defaultWidth: options.width ?? 460,
        minWidth: options.minWidth ?? 320,
        // 宽度按面板 id 记（用户 2026-10-28：拖过一次，下次弹出还是这个宽）。
        // 关钮被点 ⇒ 整个挂载体回收（close 内部幂等，不受 onClose 回调顺序影响）。
        onClose: () => {
            close();
        },
    });
    dock.open(PREVIEW_PANEL_ID);
    let closed = false;
    const root = createRoot(container);
    const close = () => {
        if (closed)
            return;
        closed = true;
        if (activePreview?.close === close)
            activePreview = null;
        window.removeEventListener('keydown', onKeyDown);
        root.unmount();
        container.remove();
        // 还原 mount：只撤销我们自己加的那点，关掉后页面回到原样。
        restoreHost();
        options.onClose?.();
    };
    const onKeyDown = (event) => {
        if (event.key === 'Escape')
            close();
    };
    window.addEventListener('keydown', onKeyDown);
    ensureComponentStyles('panel-dock', PANEL_DOCK_CSS, getStyleKit());
    ensureComponentStyles('feedback', FEEDBACK_CSS, getStyleKit());
    // 宽度归用户：换内容前把当前渲染宽度钉回去（dock 状态里本该有，显式再钉一次；
    // 入场动效期间量到的是动画中间值，低于下限一律忽略，免得把栏钉窄）。
    let pinnedWidth = null;
    const keepWidth = () => {
        const panel = container.querySelector('.dshpc-dock__panel');
        if (panel === null)
            return;
        const width = Math.round(panel.getBoundingClientRect().width);
        if (width < (options.minWidth ?? 320))
            return;
        pinnedWidth = width;
        dock.setWidth(PREVIEW_PANEL_ID, width);
    };
    // 画（可重画：同一个 dock 换内容时只重渲染，不重建 DOM ⇒ 不重播展开动效）。
    // ⚠️ 内层**不重挂**：以前 key 带序号，点一次文件整棵 FileBrowser 重来——
    // 目录树 / 展开态 / 滚动位置全丢，还多打一次 list。现在序号改走 revision prop。
    let openSeq = 0;
    const draw = (o, start) => {
        // 用户把它收起来过 ⇒ 再点文件要自动弹回来（收着还换内容，等于点了没反应 —— 2026-10-28 真机）。
        if (dock.isCollapsed(PREVIEW_PANEL_ID))
            dock.expand(PREVIEW_PANEL_ID);
        const revision = ++openSeq;
        root.render(h('div', 
        // 高度吃调用方给的 --dshpc-dock-h（demo 的页面行给 100%）；退化成视口高是整页场景。
        { style: { display: 'contents', ['--dshpc-dock-h']: '100%' } }, h(PanelDock, { dock, mainMinWidth: o.mainMinWidth ?? 480, translate: o.translate }, h(DockPanel, {
            id: PREVIEW_PANEL_ID,
            // 不要头部（用户 2026-10-21：核心的『无 header』那版）——上面不再多一条线。
            header: null,
            // 关闭归**面板壳**（用户 2026-11-04 定：内容不承担关闭）：无头 ⇒ 浮在右上。
            // 文件 / content 两种模式位置一致；FileBrowser 那枚不再接，避免同一面板两枚 ✕。
            closeButton: 'floating',
            ariaLabel: o.title,
            // 重画时沿用用户拖出来的宽度（pinnedWidth），不回到默认值。
            width: pinnedWidth ?? o.width ?? 460,
            minWidth: o.minWidth ?? 320,
            maxWidth: o.maxWidth,
        }, o.content !== undefined
            // 自定义内容保持旧语义：每次打开都重挂（内容自带状态时不会被上一次残留）。
            ? h(Fragment, { key: `custom:${revision}` }, o.content())
            : h(FileBrowser, {
                files: getFsFace(),
                officeToPdf: o.officeToPdf ?? null,
                path: start,
                revision,
                workspaces: o.workspaces,
                workspaceAnchors: o.workspaceAnchors,
                onSelectWorkspace: o.onSelectWorkspace,
                translate: o.translate,
                // 不传 onClose：dock 的关闭已由上面的浮动 ✕ 提供（内容不画关）。
                style: { height: '100%', minHeight: 0 },
            })))));
    };
    draw(opts, start ?? '');
    activePreview = { adopt, keepWidth, draw, close };
    return { close, path: opts.path ?? '' };
}
/**
 * 弹出「选择文件」模态弹窗，Promise 返回选中结果；取消（Esc / 点外部 / ✕）resolve `null`。
 *
 * **面板内容与 `openFilePreview` 完完全全是同一个 `FileBrowser`**（不是复制一套）：
 * 差别只有 ① 承载（这里挂在锚点旁的弹窗面板里，那边挂在核心 PanelDock 分栏里）、
 * ② `picker` 形态参数（点文件即回传、行尾按钮变「选择」）。
 */
export function pickWorkspaceFile(options) {
    return new Promise((resolve) => {
        if (typeof document === 'undefined') {
            resolve(null);
            return;
        }
        const files = getFsFace();
        const anchors = workspaceList.getSnapshot();
        if (files === undefined) {
            warnNotWired('pickWorkspaceFile', true);
            resolve(null);
            return;
        }
        const start = resolveStartPath(options.path ?? '', anchors, options.sessionId);
        if (start === null) {
            warnNotWired('pickWorkspaceFile', false);
            resolve(null);
            return;
        }
        let settled = false;
        // 遮罩与面板都走浮层公共件（2026-11-03 皮肤统一）：遮罩 = `OverlayMask('plain')`，
        // 面板 = `PanelSurface('popover')`。这里只算**定位**（贴锚点、上下翻转、夹紧进视口），
        // 底色/描边/圆角/阴影归 panel.css —— 原来内联那套带 `#fff`/`#d0d7de` 兜底，换主题就脱节。
        const panelStyle = {
            position: 'fixed',
            display: 'flex',
            flexDirection: 'column',
        };
        const anchor = options.anchor ?? null;
        if (anchor !== null) {
            // 几何全在纯函数里（`picker-placement.ts`，可单测）：这里只把结果贴到 fixed 面板上。
            const box = placePicker(anchor.getBoundingClientRect(), { width: window.innerWidth, height: window.innerHeight }, options.placement ?? 'auto');
            panelStyle.left = box.left;
            panelStyle.top = box.top;
            panelStyle.width = box.width;
            panelStyle.height = box.height;
        }
        else {
            panelStyle.width = `min(${PICKER_WIDTH}px,calc(100vw - 24px))`;
            panelStyle.height = PICKER_MAX_H;
        }
        const finish = (result) => {
            if (settled)
                return;
            settled = true;
            window.removeEventListener('keydown', onKeyDown);
            root.unmount();
            mount.remove();
            if (result === null)
                options.onCancel?.();
            resolve(result);
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                finish(null);
        };
        window.addEventListener('keydown', onKeyDown);
        const mount = document.createElement('div');
        document.body.appendChild(mount);
        ensureComponentStyles('panel-dock', PANEL_DOCK_CSS, getStyleKit());
        ensureComponentStyles('feedback', FEEDBACK_CSS, getStyleKit());
        const root = createRoot(mount);
        root.render(h(OverlayMask, { kind: 'plain', closeOnMask: true, onClose: () => finish(null), attrs: { 'data-dshpc-picker-backdrop': '' } }, 
        // `data-dshpc-picker-panel` / `data-dshpc-picker-backdrop` 是既有定位钩子，继续保留。
        h(PanelSurface, {
            tier: 'popover',
            role: 'dialog',
            attrs: { 'data-dshpc-picker-panel': '', 'aria-modal': 'true' },
            style: panelStyle,
            stopPropagation: true,
        }, h(FileBrowser, {
            files,
            officeToPdf: options.officeToPdf ?? null,
            path: start,
            rootName: options.rootName,
            sessionId: options.sessionId,
            rootPath: rootPathOf(start, anchors, options.sessionId),
            workspaces: options.workspaces,
            onSelectWorkspace: options.onSelectWorkspace,
            picker: true,
            filter: options.filter,
            translate: options.translate,
            onPick: (picked) => finish(picked),
            onClose: () => finish(null),
            style: { flex: '1 1 auto', width: '100%', minWidth: 0, minHeight: 0 },
        }))));
    });
}
//# sourceMappingURL=open.js.map