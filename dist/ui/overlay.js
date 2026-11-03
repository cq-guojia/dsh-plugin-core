/**
 * 浮层公共件 —— Modal 与 SideSheet 共用，**别各写一份**。
 *
 * 抽出来的判据：这两件在两种浮层里完全同构（遮罩让位分栏、头部四槽、Esc 判定），
 * 差异只在「面板怎么排」（居中 vs 贴边），那部分留在各自的控件里。
 */
import { createElement as h, useEffect } from 'react';
import { ensureComponentStyles } from './css.js';
import { OVERLAY_CSS } from './overlay-css.js';
import { PANEL_CSS } from './panel-css.js';
import { PanelClose } from './panel.js';
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
    return h('div', { className: 'dshpc-overlay-head' }, h('div', { className: 'dshpc-overlay-head__heading' }, props.icon === undefined ? null : h('span', { className: 'dshpc-overlay-head__lead' }, props.icon), h('div', { className: 'dshpc-overlay-head__titlegroup' }, h('div', { className: 'dshpc-overlay-head__titlerow' }, h('div', { className: 'dshpc-overlay-head__title' }, props.title ?? ''), props.extra === undefined ? null : h('div', { className: 'dshpc-overlay-head__extra' }, props.extra)), props.subtitle === undefined ? null : h('div', { className: 'dshpc-overlay-head__sid' }, props.subtitle))), h('div', { className: 'dshpc-overlay-head__spacer' }), props.actions === undefined ? null : h('div', { className: 'dshpc-overlay-head__actions' }, props.actions), props.onClose === undefined
        ? null
        // 关闭钮只此一枚（`PanelClose`）；旧类名挂着做别名，消费方写在上面的覆盖仍生效。
        : h(PanelClose, { label: props.closeLabel, onClick: props.onClose, className: 'dshpc-overlay-head__close' }));
}
//# sourceMappingURL=overlay.js.map