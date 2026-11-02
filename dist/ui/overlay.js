/**
 * 浮层公共件 —— Modal 与 SideSheet 共用，**别各写一份**。
 *
 * 抽出来的判据：这两件在两种浮层里完全同构（遮罩让位分栏、头部四槽、Esc 判定），
 * 差异只在「面板怎么排」（居中 vs 贴边），那部分留在各自的控件里。
 */
import { createElement as h, useEffect } from 'react';
import { ensureComponentStyles } from './css.js';
import { OVERLAY_CSS } from './overlay-css.js';
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
    return h('div', { className: 'dshpc-overlay-head' }, h('div', { className: 'dshpc-overlay-head__heading' }, props.icon === undefined ? null : h('span', { className: 'dshpc-overlay-head__lead' }, props.icon), h('div', { className: 'dshpc-overlay-head__titlegroup' }, h('div', { className: 'dshpc-overlay-head__titlerow' }, h('div', { className: 'dshpc-overlay-head__title' }, props.title ?? ''), props.extra === undefined ? null : h('div', { className: 'dshpc-overlay-head__extra' }, props.extra)), props.subtitle === undefined ? null : h('div', { className: 'dshpc-overlay-head__sid' }, props.subtitle))), h('div', { className: 'dshpc-overlay-head__spacer' }), props.actions === undefined ? null : h('div', { className: 'dshpc-overlay-head__actions' }, props.actions), props.onClose === undefined
        ? null
        : h('button', {
            type: 'button',
            className: 'dshpc-overlay-head__close',
            'aria-label': props.closeLabel,
            onClick: () => props.onClose?.(),
        }, '✕'));
}
//# sourceMappingURL=overlay.js.map