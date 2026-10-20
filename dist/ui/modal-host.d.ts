import { type AlertModalProps } from './AlertModal.js';
import { type ConfirmModalProps } from './ConfirmModal.js';
export interface HostConfirmArgs {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}
export interface HostAlertArgs {
    title?: string;
    description?: string;
    confirmText?: string;
}
export interface HostDialogHandlers {
    confirm: (opts: HostConfirmArgs) => Promise<boolean>;
    alert: (opts: HostAlertArgs) => Promise<void>;
}
export declare function registerHostDialog(handlers: HostDialogHandlers): void;
export type ConfirmOptions = Omit<ConfirmModalProps, 'onConfirm' | 'onCancel'> & {
    skin?: 'core' | 'host';
};
export type AlertOptions = Omit<AlertModalProps, 'onConfirm'> & {
    skin?: 'core' | 'host';
};
/** 命令式确认框：Promise 形式，`true`=确定 / `false`=取消（或点遮罩 / Esc）。`skin:"host"` 走宿主原生 Modal。 */
export declare function confirmModal(opts: ConfirmOptions): Promise<boolean>;
/** 命令式警告框：Promise 在关闭时 resolve（单按钮，关闭即确认）。`skin:"host"` 走宿主原生 Modal。 */
export declare function alertModal(opts: AlertOptions): Promise<void>;
//# sourceMappingURL=modal-host.d.ts.map