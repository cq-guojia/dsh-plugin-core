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
    // 加载中整框锁死：遮罩 / Esc 都走 onClose，置空即封死（✕ 本来就没有）。
    const busy = props.confirmLoading === true || props.cancelLoading === true;
    return h(Modal, {
        title: props.title,
        size: props.size ?? 'sm',
        hideHeader: props.title === undefined,
        closable: false,
        closeOnMask: busy ? false : props.closeOnMask,
        onClose: busy ? undefined : props.onCancel,
        footer: h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } }, h(Button, { variant: 'outline', loading: props.cancelLoading === true, onClick: () => props.onCancel?.() }, props.cancelText ?? tt('cancel')), h(Button, { variant: confirmVariant, loading: props.confirmLoading === true, onClick: () => props.onConfirm?.() }, props.confirmText ?? tt('confirm'))),
    }, props.message ?? null);
}
//# sourceMappingURL=ConfirmModal.js.map