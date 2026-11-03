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
import { isAbsoluteish, normalizePath, workspaceOfPath } from './types.js';
import { ensureComponentStyles, getStyleKit } from '../ui/css.js';
import { PANEL_DOCK_CSS } from '../ui/panel-dock-css.js';
import { FEEDBACK_CSS } from '../ui/feedback-css.js';
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
    const base = workspaceOfPath(start ?? '', anchors)?.path ?? anchors.find((item) => item.path !== undefined)?.path;
    const opts = { ...options, rootPath: options.rootPath ?? base };
    // 只允许一个预览。**已经开着 ⇒ 换内容**（用户 2026-10-28：侧栏已经在那了，点别的文件就该
    // 直接切 —— 不重播展开动效、也不改用户拖好的宽度）。换页面 / 换容器就地把挂载体搬过去。
    if (activePreview !== null) {
        activePreview.keepWidth();
        activePreview.adopt(opts.mount);
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
    adopt(options.mount);
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
            // 关闭钮不用核心浮动的（那是 absolute 固定偏移、不垂直居中）；关掉它的，
            // 改用 FileBrowser 自己的 ✕（和 pick 弹窗同一个 crumb-bar 钮，垂直居中）。
            closeButton: 'none',
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
                // 传 onClose ⇒ FileBrowser 在面包屑行尾渲染自己的 ✕（垂直居中，与 pick 一致）。
                onClose: close,
                style: { height: '100%', minHeight: 0 },
            })))));
    };
    draw(opts, start ?? '');
    activePreview = { adopt, keepWidth, draw, close };
    return { close, path: opts.path ?? '' };
}
/** 弹窗宽度（源实现 480，用户 2026-09-29 微调定值）。 */
const PICKER_WIDTH = 480;
/** 弹窗高度上限 / 保底。 */
const PICKER_MAX_H = 660;
/** 判定「下方放得下」的最小高度：低于它就翻到上方。 */
const PICKER_MIN_H = 240;
/** 硬地板：锚点上下都极窄时也要给出一个能滚动的高度（此时以夹紧进视口优先）。 */
const PICKER_MIN_FLOOR = 160;
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
        const backdrop = document.createElement('div');
        backdrop.setAttribute('data-dshpc-picker-backdrop', '');
        // 右边界读 PanelDock 发布的 --dshpc-page-inset-right，与 .dshpc-overlay 同款：
        // 不把右侧分栏（openFilePreview 的 dock）连同它的分隔线一起压暗（2026-10-23 真机）。
        backdrop.style.cssText = 'position:fixed;inset:0 var(--dshpc-page-inset-right,0px) 0 0;z-index:1099;background:rgba(0,0,0,0.28)';
        const panel = document.createElement('div');
        panel.setAttribute('data-dshpc-picker-panel', '');
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        const anchor = options.anchor ?? null;
        if (anchor !== null) {
            const rect = anchor.getBoundingClientRect();
            const GAP = 12;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const width = Math.min(PICKER_WIDTH, vw - 2 * GAP);
            // 垂直：先量锚点上下各自还剩多少，再决定往哪边展——高度必须跟着所选那侧的空间走
            // （旧实现先按「上方空间」定高，锚点靠顶时算出个矮条，还硬往上方塞）。
            const availBelow = vh - GAP - rect.bottom - GAP;
            const availAbove = rect.top - GAP - GAP;
            const below = availBelow >= PICKER_MIN_H || availBelow >= availAbove;
            const height = Math.max(Math.min(PICKER_MAX_H, below ? availBelow : availAbove), PICKER_MIN_FLOOR);
            // 水平：与锚点左缘对齐（下拉式），右侧放不下就整体左移，最后夹紧进视口——绝不溢出屏幕。
            const left = Math.max(GAP, Math.min(rect.left, vw - GAP - width));
            // 垂直：**优先落在锚点下方**（下缘 + 间距），下方不够才翻到上方（上缘 - 间距 - 高）。
            const top = below
                ? Math.min(rect.bottom + GAP, Math.max(GAP, vh - GAP - height))
                : Math.max(GAP, rect.top - GAP - height);
            panel.style.cssText =
                'position:fixed;z-index:1100;display:flex;flex-direction:column;overflow:hidden;' +
                    `left:${Math.round(left)}px;top:${Math.round(top)}px;` +
                    `width:${Math.round(width)}px;height:${Math.round(height)}px;` +
                    'background:var(--dshpc-surface-2,#fff);border:1px solid var(--dshpc-border,#d0d7de);' +
                    'border-radius:8px;box-shadow:var(--dshpc-shadow-2,none)';
        }
        else {
            panel.style.cssText =
                'position:fixed;z-index:1100;display:flex;flex-direction:column;overflow:hidden;' +
                    `width:min(${PICKER_WIDTH}px,calc(100vw - 24px));height:${PICKER_MAX_H}px;` +
                    'background:var(--dshpc-surface-2,#fff);border:1px solid var(--dshpc-border,#d0d7de);' +
                    'border-radius:8px;box-shadow:var(--dshpc-shadow-2,none)';
        }
        const finish = (result) => {
            if (settled)
                return;
            settled = true;
            window.removeEventListener('keydown', onKeyDown);
            backdrop.remove();
            root.unmount();
            panel.remove();
            if (result === null)
                options.onCancel?.();
            resolve(result);
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                finish(null);
        };
        backdrop.addEventListener('click', () => finish(null));
        window.addEventListener('keydown', onKeyDown);
        document.body.appendChild(backdrop);
        document.body.appendChild(panel);
        ensureComponentStyles('panel-dock', PANEL_DOCK_CSS, getStyleKit());
        ensureComponentStyles('feedback', FEEDBACK_CSS, getStyleKit());
        const root = createRoot(panel);
        root.render(h(FileBrowser, {
            files,
            officeToPdf: options.officeToPdf ?? null,
            path: start,
            rootName: options.rootName,
            rootPath: workspaceOfPath(start, anchors)?.path ?? anchors.find((item) => item.path !== undefined)?.path,
            workspaces: options.workspaces,
            onSelectWorkspace: options.onSelectWorkspace,
            picker: true,
            filter: options.filter,
            translate: options.translate,
            onPick: (picked) => finish(picked),
            onClose: () => finish(null),
            style: { flex: '1 1 auto', width: '100%', minWidth: 0, minHeight: 0 },
        }));
    });
}
//# sourceMappingURL=open.js.map