import { createElement as h } from 'react';
import { Modal } from './Modal.js';
import { Button } from './Button.js';
import { t } from '../utils/i18n.js';
/**
 * 确认框（语义层，基于 Modal）：双按钮（取消 outline + 确认语义档）、无 ✕；无标题时整条头部消失。
 * 样式封闭：按钮只暴露语义档（tone → variant），不透传任意 className/style。
 */
export function ConfirmModal(props) {
    const tt = props.translate ?? t;
    const tone = props.tone ?? 'primary';
    const confirmVariant = tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'primary';
    return h(Modal, {
        title: props.title,
        size: props.size ?? 'sm',
        hideHeader: props.title === undefined,
        closable: false,
        closeOnMask: props.closeOnMask,
        onClose: props.onCancel,
        footer: h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } }, h(Button, { variant: 'outline', onClick: () => props.onCancel?.() }, props.cancelText ?? tt('cancel')), h(Button, { variant: confirmVariant, onClick: () => props.onConfirm?.() }, props.confirmText ?? tt('confirm'))),
    }, props.message ?? null);
}
//# sourceMappingURL=ConfirmModal.js.map