import { createElement as h, useState } from 'react';
import { Modal } from './Modal.js';
import { Button } from './Button.js';
import { t } from '../utils/i18n.js';
/**
 * 确认框（语义层，基于 Modal）：双按钮（取消 outline + 确认语义档）、无 ✕；无标题时整条头部消失。
 * 样式封闭：按钮只暴露语义档（tone → variant），不透传任意 className/style。
 *
 * 异步不在这里实现：`onConfirm` / `onCancel` 返回 Promise 时由 `Button` 自动转圈，
 * 它再把「在跑」报上来，这里只负责把它转成 `Modal` 的 `busy`（锁死遮罩 / Esc）。
 */
export function ConfirmModal(props) {
    const tt = props.translate ?? t;
    const tone = props.tone ?? 'primary';
    const confirmVariant = tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'primary';
    const [confirmBusy, setConfirmBusy] = useState(false);
    const [cancelBusy, setCancelBusy] = useState(false);
    // 任一钮在跑（自己点的或外部传的）⇒ 整框不可关。
    const busy = confirmBusy || cancelBusy || props.confirmLoading === true || props.cancelLoading === true;
    return h(Modal, {
        title: props.title,
        size: props.size ?? 'sm',
        hideHeader: props.title === undefined,
        closable: false,
        closeOnMask: props.closeOnMask,
        busy,
        locked: props.locked,
        onClose: props.onCancel,
        notice: props.notice,
        footer: h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } }, h(Button, {
            variant: 'outline',
            width: props.cancelWidth,
            loadingText: props.loadingText,
            loading: props.cancelLoading === true,
            onBusyChange: setCancelBusy,
            onClick: () => props.onCancel?.(),
        }, props.cancelText ?? tt('cancel')), h(Button, {
            variant: confirmVariant,
            width: props.confirmWidth,
            loadingText: props.loadingText,
            loading: props.confirmLoading === true,
            onBusyChange: setConfirmBusy,
            onClick: () => props.onConfirm?.(),
        }, props.confirmText ?? tt('confirm'))),
    }, props.message ?? null);
}
//# sourceMappingURL=ConfirmModal.js.map