import { createElement as h, type ReactNode } from 'react';
import { type ModalSize } from './Modal.js';
import { type Translate } from '../utils/i18n.js';
/** Alert 信号档（图标 + 配色由头部 severity 图标承载）。 */
export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';
export interface AlertModalProps {
    /** 主标题（不传则整条头部消失，直接出说明文字）。 */
    title?: ReactNode;
    /** 说明文字 / 任意内容。 */
    message?: ReactNode;
    /** 信号档（默认 info）。 */
    severity?: AlertSeverity;
    /** 确认按钮文案（默认 i18n「知道了」）。 */
    confirmText?: string;
    /** 确认钮定宽（px 或任意 CSS 宽度值）；loading 转圈会把按钮撑宽，定宽后不跳。 */
    confirmWidth?: number | string;
    /**
     * loading 时是否保留按钮文案（默认 true）。传 `false`：loading 期间清文字、
     * 锁在「有文案」的宽度上、只留一枚居中的圈（见 `Button.loadingText`）。
     */
    loadingText?: boolean;
    /** 点遮罩是否关闭（默认 true）。 */
    closeOnMask?: boolean;
    /** 外部驱动确认钮 loading（如别处正在刷新）。与按钮自己的异步状态取或。 */
    confirmLoading?: boolean;
    /** 尺寸档（默认 sm 确认框宽度）。 */
    size?: ModalSize;
    /** 点击确认 / 遮罩 / Esc 的统一出口（单按钮弹窗，关闭即确认）；**返回 Promise 自动转圈 + 整框锁死**。 */
    onConfirm?: () => unknown;
    translate?: Translate;
}
/**
 * 警告框（语义层，基于 Modal）：单按钮 + 无 ✕ + severity 图标；无标题时整条头部消失。
 * 样式封闭：按钮只暴露语义档（primary），不透传任意 className/style。
 */
export declare function AlertModal(props: AlertModalProps): ReturnType<typeof h>;
//# sourceMappingURL=AlertModal.d.ts.map