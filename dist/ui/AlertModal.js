import { createElement as h, useState } from 'react';
import { Modal } from './Modal.js';
import { Button } from './Button.js';
import { t } from '../utils/i18n.js';
import { ensureComponentStyles } from './css.js';
import { FEEDBACK_CSS } from './feedback-css.js';
const SEVERITY_GLYPH = {
    info: 'ⓘ',
    success: '✓',
    warning: '⚠',
    error: '✕',
};
/**
 * 警告框（语义层，基于 Modal）：单按钮 + 无 ✕ + severity 图标；无标题时整条头部消失。
 * 样式封闭：按钮只暴露语义档（primary），不透传任意 className/style。
 */
export function AlertModal(props) {
    ensureComponentStyles('feedback', FEEDBACK_CSS);
    const tt = props.translate ?? t;
    const severity = props.severity ?? 'info';
    const [running, setRunning] = useState(false);
    // 在跑（自己点的或外部传的）⇒ 遮罩 / Esc 一律不关。
    const busy = running || props.confirmLoading === true;
    return h(Modal, {
        icon: h('span', { className: `dshpc-alert-sev dshpc-alert-sev--${severity}` }, SEVERITY_GLYPH[severity]),
        title: props.title,
        size: props.size ?? 'sm',
        hideHeader: props.title === undefined,
        closable: false,
        closeOnMask: props.closeOnMask,
        busy,
        locked: props.locked,
        onClose: props.onConfirm,
        notice: props.notice,
        footer: h(Button, {
            variant: 'primary',
            width: props.confirmWidth,
            loadingText: props.loadingText,
            loading: props.confirmLoading === true,
            onBusyChange: setRunning,
            onClick: () => props.onConfirm?.(),
        }, props.confirmText ?? tt('dialogOk')),
    }, props.message ?? null);
}
//# sourceMappingURL=AlertModal.js.map