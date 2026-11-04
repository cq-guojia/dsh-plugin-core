import { createElement as h, type ReactNode } from 'react';
import { type ModalSize } from './Modal.js';
import { type Translate } from '../utils/i18n.js';
/** 确认钮语义档（决定确认钮外观）。 */
export type ConfirmTone = 'primary' | 'danger' | 'warning';
export interface ConfirmModalProps {
    title?: ReactNode;
    /** 说明文字 / 任意内容。 */
    message?: ReactNode;
    /** 确认钮语义档（默认 primary；danger=红 / warning=黄）。 */
    tone?: ConfirmTone;
    /** 确认钮文案（默认 i18n「确定」）。 */
    confirmText?: string;
    /** 取消钮文案（默认 i18n「取消」）。 */
    cancelText?: string;
    /** 确认钮定宽（px 或任意 CSS 宽度值）；loading 转圈会把按钮撑宽，定宽后不跳。 */
    confirmWidth?: number | string;
    /** 取消钮定宽；同上。 */
    cancelWidth?: number | string;
    /**
     * loading 时是否保留按钮文案（默认 true）。传 `false`：loading 期间按钮清文字、
     * 锁在「有文案」的宽度上、只留一枚居中的圈，settle 后一起还原（见 `Button.loadingText`）。
     */
    loadingText?: boolean;
    /** 点遮罩是否关闭（默认 true；点了 = 取消）。 */
    closeOnMask?: boolean;
    /** 外部驱动确认钮 loading（如别处正在刷新）。与按钮自己的异步状态取或。 */
    confirmLoading?: boolean;
    /** 外部驱动取消钮 loading：同上。 */
    cancelLoading?: boolean;
    /** 底栏左侧的一行过程提示（换字即翻牌，超长省略 + hover 跑马灯）。不传 = 不占位。 */
    notice?: string;
    size?: ModalSize;
    /** 确认回调；**返回 Promise 自动转圈 + 整框锁死**，settle 后恢复（关闭与否由你决定）。 */
    onConfirm?: () => unknown;
    /** 取消 / 遮罩 / Esc 回调；异步语义同 `onConfirm`。 */
    onCancel?: () => unknown;
    translate?: Translate;
}
/**
 * 确认框（语义层，基于 Modal）：双按钮（取消 outline + 确认语义档）、无 ✕；无标题时整条头部消失。
 * 样式封闭：按钮只暴露语义档（tone → variant），不透传任意 className/style。
 *
 * 异步不在这里实现：`onConfirm` / `onCancel` 返回 Promise 时由 `Button` 自动转圈，
 * 它再把「在跑」报上来，这里只负责把它转成 `Modal` 的 `busy`（锁死遮罩 / Esc）。
 */
export declare function ConfirmModal(props: ConfirmModalProps): ReturnType<typeof h>;
//# sourceMappingURL=ConfirmModal.d.ts.map