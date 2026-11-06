/**
 * 浮层公共件 —— Modal 与 SideSheet 共用，**别各写一份**。
 *
 * 抽出来的判据：这两件在两种浮层里完全同构（遮罩让位分栏、头部四槽、Esc 判定），
 * 差异只在「面板怎么排」（居中 vs 贴边），那部分留在各自的控件里。
 */
import { createContext, createElement as h, useContext, useEffect } from 'react';
import { ensureComponentStyles } from './css.js';
import { OVERLAY_CSS } from './overlay-css.js';
import { PANEL_CSS } from './panel-css.js';
import { PanelClose } from './panel.js';
/**
 * 锁定广播：Modal / SideSheet `locked` 时把 true 传下去。
 * 为什么要有它：面板挂 `inert` 管不到 **portal 到 body** 的那几个浮层（Picker / 日期选择的菜单
 * 不在面板 DOM 里），锁定时它们还浮在屏幕上能点；那几个组件自己订阅这里、锁上就收起。
 */
const LockedContext = createContext(false);
/** 外层浮层是否锁死（不在浮层里 = false）。 */
export function useOverlayLocked() {
    return useContext(LockedContext);
}
export const OverlayLockedProvider = LockedContext.Provider;
/**
 * 锁定期间的两道保险（消费方自绘的控件不是我们的，管不到它们的 `disabled`）：
 *  ① Tab 整个吃掉 —— 否则能 Tab 进他们的 input 打字；
 *  ② 把面板里没被禁用的活动元素 `blur` 掉 —— 否则锁定前已经停在里面的光标还能继续打字。
 * 只认 `.dshpc-locked` 子树里的元素，不碰面板外面的焦点。
 */
export function useLockGuards(enabled) {
    useEffect(() => {
        if (!enabled || typeof document === 'undefined')
            return;
        const active = document.activeElement;
        if (active instanceof Element && active.closest('.dshpc-locked') !== null)
            active.blur();
        const onKey = (event) => {
            if (event.key === 'Tab')
                event.preventDefault();
        };
        document.addEventListener('keydown', onKey, true);
        return () => document.removeEventListener('keydown', onKey, true);
    }, [enabled]);
}
/**
 * 锁定时的**透明点击层**：盖住整块面板、不遮任何像素，只吃掉指针事件
 * （消费方自绘的元素也跟着点不动）。变灰由各控件自己的 `:disabled` 负责，这里不管外观。
 * 不做焦点接管：核心控件此刻已是真 disabled，Tab 自己就跳过它们。
 */
export function OverlayLockCatcher() {
    return h('div', {
        className: 'dshpc-lock-catcher',
        // 点它不能再冒到遮罩：否则等于点了外部，会顺带把弹窗关掉。
        onClick: (event) => event.stopPropagation(),
    });
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