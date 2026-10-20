import { type AlertModalProps } from './AlertModal.js';
import { type ConfirmModalProps } from './ConfirmModal.js';
export type ConfirmOptions = Omit<ConfirmModalProps, 'onConfirm' | 'onCancel'>;
export type AlertOptions = Omit<AlertModalProps, 'onConfirm'>;
/** 命令式确认框：Promise 形式，`true`=确定 / `false`=取消（或点遮罩 / Esc）。 */
export declare function confirmModal(opts: ConfirmOptions): Promise<boolean>;
/** 命令式警告框：Promise 在关闭时 resolve（单按钮，关闭即确认）。 */
export declare function alertModal(opts: AlertOptions): Promise<void>;
//# sourceMappingURL=modal-host.d.ts.map