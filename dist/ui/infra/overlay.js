/**
 * 浮层公共件 —— Modal 与 SideSheet 共用，**别各写一份**。
 *
 * 抽出来的判据：这两件在两种浮层里完全同构（遮罩让位分栏、头部四槽、Esc 判定），
 * 差异只在「面板怎么排」（居中 vs 贴边），那部分留在各自的控件里。
 */
import { createContext, createElement as h, useContext, useEffect, useRef, useSyncExternalStore } from 'react';
import { ensureComponentStyles } from './css.js';
import { OVERLAY_CSS } from './overlay-css.js';
import { PANEL_CSS } from './panel-css.js';
import { PanelClose } from './panel.js';
/**
 * 前台主浮层广播 —— 与 `LockedContext` 互补的另一条轴。
 *
 * LockedContext 管「弹窗锁死时 portal 出去的菜单要收」靠 React 树传递；这里要管的是
 * **不在弹窗子树里**的页面级浮层（TaskBar 面板）：Modal / SideSheet / 选文件弹窗一出现，
 * 它们就得让位。Context 跨不过去，所以用模块级外部 store + `globalThis[Symbol.for]` 跨副本收口。
 * 只登记 `OverlayMask` 三档主浮层，Picker / 日期那些 portal 菜单不登记 —— 它们仍可高于弹窗。
 */
const FOREGROUND_OVERLAY_KEY = Symbol.for('dshpc.foregroundOverlay.v1');
function isForegroundOverlayStore(value) {
    if (value === null || typeof value !== 'object')
        return false;
    const candidate = value;
    return typeof candidate.count === 'number' && candidate.listeners instanceof Set;
}
function foregroundStore() {
    const g = globalThis;
    const existing = g[FOREGROUND_OVERLAY_KEY];
    if (existing !== undefined) {
        if (!isForegroundOverlayStore(existing))
            throw new Error('[dsh-plugin-core] incompatible foreground overlay store');
        return existing;
    }
    const store = { count: 0, listeners: new Set() };
    g[FOREGROUND_OVERLAY_KEY] = store;
    return store;
}
function emitForegroundOverlay() {
    for (const listener of foregroundStore().listeners) {
        try {
            listener();
        }
        catch { /* 单个订阅者出错不影响其它订阅者 */ }
    }
}
/** 登记一个前台主浮层。与 `releaseForegroundOverlay` 成对使用（effect + cleanup）。 */
export function acquireForegroundOverlay() {
    foregroundStore().count += 1;
    emitForegroundOverlay();
}
/** 注销一个前台主浮层；计数不会低于 0。 */
export function releaseForegroundOverlay() {
    const store = foregroundStore();
    if (store.count === 0)
        return;
    store.count -= 1;
    emitForegroundOverlay();
}
export function getForegroundOverlayCount() {
    return foregroundStore().count;
}
/** SSR 快照：服务端永远没有前台浮层。 */
export function getForegroundOverlayServerCount() {
    return 0;
}
export function subscribeForegroundOverlay(listener) {
    const store = foregroundStore();
    store.listeners.add(listener);
    return () => { store.listeners.delete(listener); };
}
/** 只在 0 → 正数的边沿收起，嵌套浮层与计数回落都不重复触发。 */
export function shouldDismissOnForegroundOverlay(previous, current) {
    return previous === 0 && current > 0;
}
/** 任意瞬时浮层订阅本 hook：前台主浮层出现即收起，自己不倒回去自动恢复。 */
export function useDismissOnForegroundOverlay(onDismiss) {
    const count = useSyncExternalStore(subscribeForegroundOverlay, getForegroundOverlayCount, getForegroundOverlayServerCount);
    const previous = useRef(count);
    useEffect(() => {
        const prev = previous.current;
        previous.current = count;
        if (onDismiss !== undefined && shouldDismissOnForegroundOverlay(prev, count))
            onDismiss();
    }, [count, onDismiss]);
}
/**
 * 锁定广播：Modal / SideSheet `locked` 时把 true 传下去。
 * 为什么要有它：面板挂 `inert` 管不到 **portal 到 body** 的那几个浮层（Picker / 日期选择的菜单
 * 不在面板 DOM 里），锁定时它们还浮在屏幕上能点；那几个组件自己订阅这里、锁上就收起。
 */
const LockedContext = createContext(false);
/**
 * 例外域标记（由 `OverlayLockExempt` 挂）：锁定期间的焦点 / 变灰 / 核心控件自禁都对它开口。
 * 用 Context 而非仅靠 DOM 类，是因为 portal 到 body 的菜单不在面板子树里。
 */
const LockExemptContext = createContext(false);
/** 外层浮层是否锁死（不在浮层里 = false）。例外域内恒为 false。 */
export function useOverlayLocked() {
    return useContext(LockedContext) && !useContext(LockExemptContext);
}
/** 当前节点是否落在例外域里（焦点守卫用，含 portal 出来的菜单）。 */
export function useOverlayLockExempt() {
    return useContext(LockExemptContext);
}
export const OverlayLockedProvider = LockedContext.Provider;
/** 把子树标成锁定期的例外：仍可点、仍可 Tab、核心控件不自我禁用。 */
export function OverlayLockExempt(props) {
    return h(LockExemptContext.Provider, { value: true }, h('div', { className: `dshpc-lock-exempt${props.className !== undefined && props.className !== '' ? ` ${props.className}` : ''}` }, props.children ?? null));
}
/** 例外判定：DOM 类名（面板内）或 Context 标记（portal 内）任一命中即为例外。 */
function isLockExempt(target) {
    return target instanceof Element && target.closest('.dshpc-lock-exempt') !== null;
}
/**
 * 锁定期间的两道保险（消费方自绘的控件不是我们的，管不到它们的 `disabled`）：
 *  ① Tab 整个吃掉 —— 否则能 Tab 进他们的 input 打字；
 *  ② 把面板里没被禁用的活动元素 `blur` 掉 —— 否则锁定前已经停在里面的光标还能继续打字。
 * 例外域（`.dshpc-lock-exempt`）两者都放行。只认 `.dshpc-locked` 子树里的元素，不碰面板外面的焦点。
 */
export function useLockGuards(enabled) {
    useEffect(() => {
        if (!enabled || typeof document === 'undefined')
            return;
        const active = document.activeElement;
        if (active instanceof Element &&
            active.closest('.dshpc-locked') !== null &&
            !isLockExempt(active))
            active.blur();
        const onKey = (event) => {
            if (event.key === 'Tab' && !isLockExempt(event.target))
                event.preventDefault();
        };
        document.addEventListener('keydown', onKey, true);
        return () => document.removeEventListener('keydown', onKey, true);
    }, [enabled]);
}
/**
 * Esc 关闭。不传 `onClose` 或 `enabled=false` 时完全不挂监听
 * （无回调还挂监听，等于让 Esc 被白白吃掉）。
 */
export function useEscapeClose(enabled, onClose) {
    useEffect(() => {
        if (!enabled || onClose === undefined)
            return;
        const onKey = (event) => {
            if (event.key === 'Escape')
                onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [enabled, onClose]);
}
/** 遮罩 + 承载盒。右边界让位分栏的规则只有这一份。 */
export function OverlayMask(props) {
    ensureComponentStyles('overlay', OVERLAY_CSS);
    // backgrounded 是受控 prop，同一个 fiber 上 attrs 的键会 true↔false 变化；依赖必须是派生布尔值，
    // 不能是每次渲染新建的 props.attrs 对象，否则还原弹窗时不会重新登记（计数不增 ⇒ 面板不让位）。
    const foreground = props.attrs?.['data-dshpc-backgrounded'] === undefined;
    useEffect(() => {
        if (!foreground)
            return;
        acquireForegroundOverlay();
        return () => { releaseForegroundOverlay(); };
    }, [foreground]);
    return h('div', {
        ...props.attrs,
        className: `dshpc-overlay dshpc-overlay--${props.kind}`,
        onClick: () => {
            if (props.closeOnMask)
                props.onClose?.();
        },
    }, props.children ?? null);
}
/** 头部四槽：icon + 标题组 + 右侧动作 + 关闭钮。 */
export function OverlayHead(props) {
    ensureComponentStyles('overlay', OVERLAY_CSS);
    // 关闭钮的皮肤在 panel.css（浮层唯一那枚）；旧类名 `dshpc-overlay-head__close` 仍挂着做别名。
    ensureComponentStyles('panel', PANEL_CSS);
    const heading = props.header === null
        ? null
        : props.header === undefined
            ? h('div', { className: 'dshpc-overlay-head__heading' }, props.icon === undefined ? null : h('span', { className: 'dshpc-overlay-head__lead' }, props.icon), h('div', { className: 'dshpc-overlay-head__titlegroup' }, h('div', { className: 'dshpc-overlay-head__titlerow' }, h('div', { className: 'dshpc-overlay-head__title' }, props.title ?? ''), props.extra === undefined ? null : h('div', { className: 'dshpc-overlay-head__extra' }, props.extra)), props.subtitle === undefined ? null : h('div', { className: 'dshpc-overlay-head__sid' }, props.subtitle)))
            : h('div', { className: 'dshpc-overlay-head__heading dshpc-overlay-head__heading--custom' }, props.header);
    return h('div', { className: 'dshpc-overlay-head' }, heading, h('div', { className: 'dshpc-overlay-head__spacer' }), props.actions === undefined ? null : h('div', { className: 'dshpc-overlay-head__actions' }, props.actions), props.onClose === undefined
        ? null
        // 关闭钮只此一枚（`PanelClose`）；旧类名挂着做别名，消费方写在上面的覆盖仍生效。
        : h(PanelClose, { label: props.closeLabel, onClick: props.onClose, className: 'dshpc-overlay-head__close' }));
}
//# sourceMappingURL=overlay.js.map