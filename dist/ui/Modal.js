import { createElement as h, useEffect } from 'react';
import { ensureControls } from './css.js';
import { t } from '../utils/i18n.js';
/**
 * 模态弹窗（自绘 overlay，**不用 react-dom 的 portal**，避免多一个必需依赖）。
 *
 * 定位：它是**呈现方式**，不是内容 —— 会话预览这类功能模块要用弹窗时用它来承载（需求文档 §4）。
 */
export function Modal(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const closeOnMask = props.closeOnMask !== false;
    const escClose = props.escClose !== false;
    useEffect(() => {
        if (!escClose || props.onClose === undefined)
            return;
        const onKey = (e) => {
            if (e.key === 'Escape')
                props.onClose?.();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [escClose, props.onClose]);
    return h('div', {
        className: 'dsh-tdt-modal-mask',
        onClick: () => {
            if (closeOnMask)
                props.onClose?.();
        },
    }, h('div', {
        className: 'dsh-tdt-modal',
        style: props.maxWidth === undefined ? undefined : { maxWidth: props.maxWidth },
        onClick: (e) => e.stopPropagation(),
    }, props.hideHeader === true || (props.title === undefined && props.onClose === undefined)
        ? null
        : h('div', { className: 'dsh-tdt-modal__head' }, h('div', { className: 'dsh-tdt-modal__title' }, props.title ?? ''), props.onClose === undefined
            ? null
            : h('button', {
                type: 'button',
                className: 'dsh-tdt-picker__trigger',
                'aria-label': tt('modalClose'),
                onClick: () => props.onClose?.(),
            }, '✕')), h('div', { className: 'dsh-tdt-modal__body' }, props.children ?? null), props.footer === undefined ? null : h('div', { className: 'dsh-tdt-modal__foot' }, props.footer)));
}
//# sourceMappingURL=Modal.js.map