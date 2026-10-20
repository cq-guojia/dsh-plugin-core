/**
 * 停靠面板（PanelDock）—— 可停靠的右侧分栏容器。
 *
 * 形态：**布局成员，不是浮层**。占宽度、把主区挤窄，因此必须由调用方放进自己的
 * flex 根容器里；不能像 Modal 那样自挂 `document.body`（自挂只能遮盖、挤不窄）。
 *
 * 分工照成熟组件库的通行做法（Ant Design `Tabs` / `Drawer` 同一套）：
 *   · **结构写在调用点** —— `<PanelDock dock={dock}><DockPanel id="files">…</DockPanel></PanelDock>`；
 *   · **显隐归状态** —— `dock.open('files')` / `dock.close('files')`，只传 id，不传内容；
 *   · **头部可控** —— `title` / `icon` / `extra` 三件套；要更自由就 `header` 整块替换，`header={null}` 表示不要头部；
 *   · **关闭钮可退让** —— `closable={false}` 不出；`closeButton="floating"` 浮在右上角，不占头部布局。
 */
import { Children, createElement as h, isValidElement, useRef, useSyncExternalStore } from 'react';
import { ensureControls } from './css.js';
import { t } from '../utils/i18n.js';
import { startResizeLayoutWidth } from './resizer.js';
import { DEFAULT_PANEL_ID, clampWidth, closePanel, emptyDock, isOpen, openPanel, othersWidth, setPanelWidth, } from './panel-dock-logic.js';
/**
 * 声明一个面板。**它自己不渲染任何东西**——由父级 `<PanelDock>` 读它的 props 后统一画。
 * 因此必须作为 `<PanelDock>` 的**直接子元素**（可以条件渲染成 `null`）。
 */
export function DockPanel(_props) {
    return null;
}
function readStoredWidth(key) {
    try {
        if (typeof localStorage === 'undefined')
            return null;
        const raw = localStorage.getItem(key);
        if (raw === null)
            return null;
        const value = Number(raw);
        return Number.isFinite(value) ? value : null;
    }
    catch {
        return null;
    }
}
function writeStoredWidth(key, width) {
    try {
        if (typeof localStorage === 'undefined')
            return;
        localStorage.setItem(key, String(width));
    }
    catch {
        /* 隐私模式 / 配额满：记忆失败不影响功能 */
    }
}
/**
 * 造一个面板控制器。状态在它身上，组件用 `useSyncExternalStore` 订阅。
 *
 * 为什么状态不放在组件里：开门/关门常常发生在按钮 onClick、事件回调里（命令式），
 * 而**内容与头部仍在调用点声明**——这正是 Tabs 那种「状态 + children」的分工。
 */
export function createPanelDock(options = {}) {
    const maxPanels = options.maxPanels ?? 3;
    const defaultWidth = options.defaultWidth ?? 460;
    const minWidth = options.minWidth ?? 320;
    const storageKey = options.storageKey ?? 'dshpc-dock';
    const widthKey = (id) => (storageKey === false ? '' : `${storageKey}:width:${id}`);
    let state = emptyDock();
    const listeners = new Set();
    const emit = (next) => {
        if (next === state)
            return;
        state = next;
        for (const listener of listeners)
            listener();
    };
    const controller = {
        defaults: { maxPanels, defaultWidth, minWidth },
        open(id = DEFAULT_PANEL_ID) {
            const { state: next, result } = openPanel(state, id, maxPanels);
            if (result.ok && result.created) {
                const stored = storageKey === false ? null : readStoredWidth(widthKey(id));
                emit(stored === null ? next : setPanelWidth(next, id, stored));
                options.onOpen?.({ id, created: true });
            }
            else if (result.ok) {
                emit(next);
            }
            else {
                options.onLimitReached?.({ id });
            }
            return result;
        },
        close(id = DEFAULT_PANEL_ID, reason = 'api') {
            if (!isOpen(state, id))
                return;
            if (options.onBeforeClose?.({ id, reason }) === false)
                return;
            emit(closePanel(state, id));
            options.onClose?.({ id, reason });
        },
        toggle(id = DEFAULT_PANEL_ID) {
            if (controller.isOpen(id)) {
                controller.close(id, 'api');
                return { ok: true, id, created: false };
            }
            return controller.open(id);
        },
        isOpen(id = DEFAULT_PANEL_ID) {
            return isOpen(state, id);
        },
        ids() {
            return state.ids;
        },
        setWidth(id, width) {
            const next = setPanelWidth(state, id, width);
            if (next === state)
                return;
            emit(next);
            if (storageKey !== false)
                writeStoredWidth(widthKey(id), width);
            options.onResize?.({ id, width });
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        getSnapshot() {
            return state;
        },
    };
    return controller;
}
/** 收集直接子元素里的 `<DockPanel>`；顺序即渲染顺序（与打开顺序无关，稳定）。 */
function panesOf(children) {
    const out = [];
    Children.forEach(children, (child) => {
        if (isValidElement(child) && child.type === DockPanel)
            out.push(child.props);
    });
    return out;
}
/** 停靠栏本体：只渲染「开着的」面板，结构取自对应的 `<DockPanel>`。 */
export function PanelDock(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const state = useSyncExternalStore(props.dock.subscribe, props.dock.getSnapshot, props.dock.getSnapshot);
    const rootRef = useRef(null);
    const panelRefs = useRef(new Map());
    const panes = panesOf(props.children);
    const { defaultWidth, minWidth: fallbackMin } = props.dock.defaults;
    const widthOf = (pane) => state.widths[pane.id] ?? clampWidth(pane.width ?? defaultWidth, pane.minWidth ?? fallbackMin, pane.maxWidth);
    // 打开但没声明的 id 得说出来，否则用户只会看到一个永远空白的面板。
    for (const id of state.ids) {
        if (!panes.some((pane) => pane.id === id)) {
            console.warn(`[dsh-plugin-core] PanelDock: 面板 "${id}" 已打开但没有对应的 <DockPanel id="${id}"> 声明`);
        }
    }
    const beginResize = (pane, event) => {
        const element = panelRefs.current.get(pane.id);
        if (element === undefined || typeof window === 'undefined')
            return;
        const startX = event.clientX;
        const startWidth = widthOf(pane);
        const min = pane.minWidth ?? fallbackMin;
        const mainMin = props.mainMinWidth ?? 480;
        startResizeLayoutWidth({
            startEvent: event,
            root: rootRef.current,
            rootClass: 'dshpc-dock--resizing',
            rafThrottle: true,
            compute: (clientX) => {
                const others = othersWidth(state, pane.id, (id) => {
                    const other = panes.find((item) => item.id === id);
                    return other === undefined ? defaultWidth : widthOf(other);
                });
                const viewportMax = window.innerWidth - others - mainMin;
                const businessMax = pane.maxWidth ?? Number.POSITIVE_INFINITY;
                const max = Math.min(viewportMax, businessMax);
                return clampWidth(startWidth + (startX - clientX), min, Math.max(min, max));
            },
            onMove: (width) => {
                element.style.width = `${width}px`;
            },
            onCommit: (width) => {
                props.dock.setWidth(pane.id, width);
            },
        });
    };
    // 关钮一律**绝对定位**在面板右上（top 10 / right 8，与内置头完全一致）：
    // ① 不占头部布局宽度 —— 自定义头因此拿到整行（下划线能顶到最右）；
    // ② 锚在面板上、不在 body 滚动内容里 —— 正文怎么滚它都不动；
    // ③ 内置头的标题区用 padding-right 预留出它的位置，谁也不压谁。
    const headerCloseOf = (pane) => {
        const closable = pane.closable !== false;
        const mode = pane.closeButton ?? 'auto';
        const hasHeader = pane.header !== null;
        if (!closable || !(mode === 'header' || (mode === 'auto' && hasHeader)))
            return null;
        return h('button', {
            type: 'button',
            className: 'dshpc-dock__close dshpc-dock__close--abs',
            'aria-label': tt('dockClose'),
            onClick: () => props.dock.close(pane.id, 'button'),
        }, pane.closeIcon ?? '✕');
    };
    const renderHeader = (pane) => {
        if (pane.header === null)
            return null;
        if (pane.header !== undefined) {
            // 自定义头部：整行都归调用方 —— 库不加内边距/边框/背景。
            return h('div', { className: 'dshpc-dock__head dshpc-dock__head--custom' }, pane.header);
        }
        return h('div', { className: 'dshpc-dock__head' }, pane.icon === undefined ? null : h('div', { className: 'dshpc-dock__lead' }, pane.icon), h('div', { className: 'dshpc-dock__title' }, pane.title), pane.extra === undefined ? null : h('div', { className: 'dshpc-dock__extra' }, pane.extra));
    };
    const floatingCloseOf = (pane) => {
        if (pane.closable === false)
            return null;
        const mode = pane.closeButton ?? 'auto';
        const hasHeader = pane.header !== null;
        if (mode !== 'floating' && !(mode === 'auto' && !hasHeader))
            return null;
        return h('button', {
            type: 'button',
            className: 'dshpc-dock__close dshpc-dock__close--floating',
            'aria-label': tt('dockClose'),
            onClick: () => props.dock.close(pane.id, 'button'),
        }, pane.closeIcon ?? '✕');
    };
    return h('div', {
        ref: rootRef,
        className: props.className === undefined ? 'dshpc-dock' : `dshpc-dock ${props.className}`,
    }, panes
        .filter((pane) => state.ids.includes(pane.id))
        .map((pane) => h('section', {
        key: pane.id,
        ref: (element) => {
            if (element === null)
                panelRefs.current.delete(pane.id);
            else
                panelRefs.current.set(pane.id, element);
        },
        className: 'dshpc-dock__panel',
        style: { width: `${widthOf(pane)}px` },
        'data-panel': pane.id,
        'aria-label': pane.ariaLabel ?? (typeof pane.title === 'string' ? pane.title : pane.id),
    }, h('div', {
        className: 'dshpc-dock__resizer',
        role: 'separator',
        'aria-orientation': 'vertical',
        'aria-label': tt('dockResize'),
        onPointerDown: (event) => {
            beginResize(pane, event);
        },
    }), renderHeader(pane), headerCloseOf(pane), floatingCloseOf(pane), h('div', { className: 'dshpc-dock__body' }, pane.children ?? null))));
}
//# sourceMappingURL=PanelDock.js.map