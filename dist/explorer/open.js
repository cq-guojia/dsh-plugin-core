// 两个命令式能力（用户 2026-10-20 定义）—— explorer 的对外入口：
//
//  · 方法 A `openFilePreview`：传文件/文件夹路径，打开右侧停靠预览（可拖宽、Esc 关）；
//  · 方法 B `pickWorkspaceFile`：Promise 返回选中的工作区相对路径（弹窗在锚点按钮旁弹出，
//    Esc / 点外部 / ✕ 关，选中即 resolve）。
//
// 两者共用同一套 FileBrowser 面板（用户拍板：同一套内容，两种展现形式）。
//
// ⚠️ 方法 A 的**侧边栏本体是核心 PanelDock**（用户 2026-10-21 拍板：不许自绘制外壳 + 拖拽条）。
// PanelDock 是布局成员（占宽度、挤窄主区），同 ui/modal-host.ts 的做法：自建 container 挂 + createRoot，
// 关闭即卸载回收，不残留空根；拖宽与关闭交给 PanelDock 自己的 resizer / header 关钮。
import { createElement as h, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { ensureControls, getStyleKit } from '../ui/css.js';
import { getWorkspaceFiles, workspaceList } from '../ui/host-data.js';
import { DockPanel, PanelDock, createPanelDock } from '../ui/PanelDock.js';
import { FileBrowser } from './FileBrowser.js';
import { anchorSessionForTitle, pickWorkspaceAnchor, workspaceAnchorForPath } from './types.js';
/**
 * 预览体：`openFilePreview` 的 FileBrowser 包裹层。职责只有一个——**切工作区**：
 * ▾ 下拉点工作区 ⇒ 换该工作区的锚点会话、key 重挂载、path 回根。
 * 机制同兄弟项目 `dsh-task-dispatch-table/src/client/task-editor.tsx:2496-2508`：
 * list 的根来自 sessionId ⇒ 必须换会话 + 重挂载，只换 rootName 等于没切。
 * 没会话的工作区不进 ▾ 列表、点了也不切（宿主列不出文件，不给假入口）。
 *
 * 工作区清单：调用方显式传的 `workspaceAnchors` 优先；否则用宿主 workspaces 快照
 * （connectHost 注入的 workspaceList）——**调用方什么都不传也照常能切**。
 *
 * 「当前工作区」必须与面包屑根名同源（`workspaceAnchorForPath` 匹配优先，其次 rootName）：
 * 曾经这里直接拿 `rootName` 当初始状态，而 ▾ 菜单把 anchorMatch.title 当当前区；两者不一致时
 * 点 rootName 那个工作区 = setState 成同一个值 ⇒ React bail out ⇒ **点了完全没反应**（2026-10-23 真机）。
 * 同理「切没切」不能用「名字变没变」判断：点回入口工作区会把 path 又还原成入口文件，
 * 看起来就是「跳回第一个工作区」。现在改成「点过 = 进浏览态」，任何工作区（含入口那个）都回根。
 */
function PreviewBody(props) {
    const options = props.options;
    const hostWorkspaces = useSyncExternalStore(workspaceList.subscribe, workspaceList.getSnapshot);
    // HostWorkspaceItem 结构兼容 WorkspaceAnchorItem（多一个 workspaceId 无害）⇒ 统一注解收敛联合类型。
    const anchors = options.workspaceAnchors ?? hostWorkspaces;
    // 入口工作区：与 FileBrowser 的面包屑根名同源（两边口径必须一致，见上方注释）。
    const entryTitle = workspaceAnchorForPath(options.path ?? '', anchors)?.title ?? options.rootName ?? '';
    // null = 还在入口态（path 用调用方给的那个文件）；非 null = 用户点过工作区，从它的根开始列。
    const [picked, setPicked] = useState(null);
    const wsTitle = picked ?? entryTitle;
    const sessionId = anchorSessionForTitle(anchors, wsTitle)
        ?? options.sessionId
        ?? pickWorkspaceAnchor(anchors)?.sessionId
        ?? '';
    const switchable = anchors.filter((a) => (a.sessionIds?.length ?? 0) > 0).map((a) => a.title);
    return h(FileBrowser, {
        // key 带工作区+会话 ⇒ 切换即重挂载（FileBrowser 的 dir/listing/学根全属于旧工作区）。
        key: `${wsTitle}:${sessionId}`,
        workspaceFiles: options.workspaceFiles,
        officeToPdf: options.officeToPdf ?? null,
        sessionId,
        // 点过工作区就从它的根列（原 path 属于旧工作区，带着只会 404 / 跳回入口文件）。
        path: picked === null ? options.path : '',
        rootName: wsTitle === '' ? options.rootName : wsTitle,
        workspaces: switchable.length > 0 ? switchable : options.workspaces,
        onSelectWorkspace: (name) => {
            // 没会话的工作区列不出文件 ⇒ 不切（宿主能力边界，不给假入口）。
            if (anchorSessionForTitle(anchors, name) === null)
                return;
            setPicked(name);
        },
        // 空数组别传：会把 FileBrowser 内部「回落快照」的兜底挡住（空 ≠ 未传）。
        workspaceAnchors: anchors.length > 0 ? anchors : undefined,
        rootCache: options.rootCache,
        translate: options.translate,
        // 传 onClose ⇒ FileBrowser 在面包屑行尾渲染自己的 ✕（垂直居中，与 pick 一致）。
        onClose: props.onClose,
        style: { height: '100%', minHeight: 0 },
    });
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
 * 消费方最少写法（`connectHost(ctx)` 已接线）：
 * `openFilePreview({ mount, path })` —— 文件服务、会话 id 都由核心自己解。
 */
export function openFilePreview(options) {
    if (typeof document === 'undefined')
        return null;
    const custom = options.content !== undefined;
    // 接线归核心：服务来自 connectHost，会话按「路径所属工作区 → 最近有会话的工作区」解。
    const files = options.workspaceFiles ?? getWorkspaceFiles();
    const anchors = options.workspaceAnchors ?? workspaceList.getSnapshot();
    const sessionId = options.sessionId
        ?? workspaceAnchorForPath(options.path ?? '', anchors)?.sessionId
        ?? pickWorkspaceAnchor(anchors)?.sessionId;
    if (!custom && (files === undefined || sessionId === undefined)) {
        console.warn('[dsh-plugin-core/explorer] openFilePreview: '
            + (files === undefined
                ? '没有工作区文件服务（client apply 里没调 connectHost，或宿主没提供 remote.workspaceFiles）'
                : '找不到可用的工作区会话（宿主 workspaces 里没有带会话的工作区）')
            + ' ⇒ 不打开预览');
        return null;
    }
    const opts = { ...options, workspaceFiles: files, sessionId };
    // 只允许一个预览。**已经开着 ⇒ 换内容**（用户 2026-10-28：侧栏已经在那了，点别的文件就该
    // 直接切 —— 不重播展开动效、也不改用户拖好的宽度）。换页面 / 换容器就地把挂载体搬过去。
    if (activePreview !== null) {
        activePreview.keepWidth();
        activePreview.adopt(opts.mount);
        activePreview.draw(opts);
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
        // 每次打开都从默认宽度起步（预览是临时面板，不继承上次的落位）。
        storageKey: false,
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
    ensureControls(getStyleKit());
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
    // 内层以 path 作 key：目录 / 切过的工作区这些内部状态属于上一个文件，换文件必须重挂。
    const draw = (o) => {
        // 用户把它收起来过 ⇒ 再点文件要自动弹回来（收着还换内容，等于点了没反应 —— 2026-10-28 真机）。
        if (dock.isCollapsed(PREVIEW_PANEL_ID))
            dock.expand(PREVIEW_PANEL_ID);
        // 总是走 PreviewBody：调用方没自接 onSelectWorkspace 时，▾ 下拉「切工作区」由核心接管
        // （anchors 为空 ⇒ 回调空转，行为与旧版一致）。自接了 ⇒ 原样透传给 FileBrowser。
        const internalSwitch = o.onSelectWorkspace === undefined;
        const contentKey = o.path ?? '';
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
            ? o.content()
            : internalSwitch
                ? h(PreviewBody, { key: contentKey, options: o, onClose: close })
                : h(FileBrowser, {
                    key: contentKey,
                    workspaceFiles: o.workspaceFiles,
                    officeToPdf: o.officeToPdf ?? null,
                    sessionId: o.sessionId,
                    path: o.path,
                    rootName: o.rootName,
                    workspaces: o.workspaces,
                    workspaceAnchors: o.workspaceAnchors,
                    onSelectWorkspace: o.onSelectWorkspace,
                    rootCache: o.rootCache,
                    translate: o.translate,
                    // 传 onClose ⇒ FileBrowser 在面包屑行尾渲染自己的 ✕（垂直居中，与 pick 一致）。
                    onClose: close,
                    style: { height: '100%', minHeight: 0 },
                })))));
    };
    draw(opts);
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
 * 弹出「选择工作区文件」模态弹窗，Promise 返回选中结果；取消（Esc / 点外部 / ✕）resolve `null`。
 *
 * **面板内容与 `openFilePreview` 完完全全是同一个 `FileBrowser`**（不是复制一套）：
 * 差别只有 ① 承载（这里挂在锚点旁的弹窗面板里，那边挂在核心 PanelDock 分栏里）、
 * ② `picker` 形态参数（点文件即回传、行尾按钮变「选择」）。文案 / 根名 / 过滤都按调用时传的走。
 */
export function pickWorkspaceFile(options) {
    return new Promise((resolve) => {
        if (typeof document === 'undefined') {
            resolve(null);
            return;
        }
        const files = options.workspaceFiles ?? getWorkspaceFiles();
        const sessionId = options.sessionId ?? pickWorkspaceAnchor(workspaceList.getSnapshot())?.sessionId;
        if (files === undefined || sessionId === undefined) {
            console.warn('[dsh-plugin-core/explorer] pickWorkspaceFile: '
                + (files === undefined ? '没有工作区文件服务（client apply 里没调 connectHost）' : '找不到可用的工作区会话')
                + ' ⇒ 不弹选择框');
            resolve(null);
            return;
        }
        let settled = false;
        const backdrop = document.createElement('div');
        backdrop.setAttribute('data-dshpc-picker-backdrop', '');
        // 右边界读 PanelDock 发布的 --dshpc-page-inset-right，与 .dshpc-modal-mask 同款：
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
            // 水平：与锚点左缘对齐（下拉式），右侧放不下就整体左移，最后夹紧进视口——绝不溢出屏幕
            // （旧实现先往左展、再往右翻，弹窗会横着跑到离按钮很远的地方；改成左缘对齐后
            //  永远贴在所点按钮的正下方，第三方锚点靠左靠右都不会被推出屏外）。
            const left = Math.max(GAP, Math.min(rect.left, vw - GAP - width));
            // 垂直：**优先落在锚点下方**（下缘 + 间距），下方不够才翻到上方（上缘 - 间距 - 高）；
            // 最后再夹紧进视口——绝不溢出，也绝不因为锚点靠顶就默认往上弹。
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
        ensureControls(getStyleKit());
        const root = createRoot(panel);
        root.render(h(FileBrowser, {
            workspaceFiles: files,
            officeToPdf: options.officeToPdf ?? null,
            sessionId,
            path: '',
            rootName: options.rootName,
            rootCache: options.rootCache,
            workspaces: options.workspaces,
            onSelectWorkspace: options.onSelectWorkspace,
            picker: true,
            filter: options.filter,
            translate: options.translate,
            onPick: (path, isDir) => finish({ path, isDir }),
            onClose: () => finish(null),
            style: { flex: '1 1 auto', width: '100%', minWidth: 0, minHeight: 0 },
        }));
    });
}
//# sourceMappingURL=open.js.map