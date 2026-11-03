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
/** 点按钮的回调：返回 thenable 即视为「消费方要做异步处理」。 */
type DialogHandler = () => unknown;
export type ConfirmOptions = Omit<ConfirmModalProps, 'onConfirm' | 'onCancel' | 'confirmLoading' | 'cancelLoading'> & {
    skin?: 'core' | 'host';
    /** 确认回调；异步期间确认钮转圈、整框不可关，resolve 后按 `true` 关闭，reject 后恢复可点；返回 `false` 不关。 */
    onConfirm?: DialogHandler;
    /** 取消 / 遮罩 / Esc 回调；异步语义同 `onConfirm`，resolve 后按 `false` 关闭（返回 `false` 同样不关）。 */
    onCancel?: DialogHandler;
};
export type AlertOptions = Omit<AlertModalProps, 'onConfirm' | 'confirmLoading'> & {
    skin?: 'core' | 'host';
    /** 确认回调（遮罩 / Esc 同一个出口）；异步期间转圈并锁死关闭，settle 后才关，返回 `false` 不关。 */
    onConfirm?: DialogHandler;
};
/**
 * 命令式确认框：Promise 形式，`true`=确定 / `false`=取消（或点遮罩 / Esc）。`skin:"host"` 走宿主原生 Modal。
 * 回调返回 Promise 时进入 loading（按钮转圈 + 遮罩 / Esc 锁死），settle 后才真正关闭。
 */
export declare function confirmModal(opts: ConfirmOptions): Promise<boolean>;
/**
 * 命令式警告框：Promise 在关闭时 resolve（单按钮，关闭即确认）。`skin:"host"` 走宿主原生 Modal。
 * 回调返回 Promise 时进入 loading（按钮转圈 + 遮罩 / Esc 锁死），settle 后才真正关闭。
 * 回调返回 `false`（同步或 resolve 成 `false`）⇒ 本次当作没成，框不关。
 */
export declare function alertModal(opts: AlertOptions): Promise<void>;
export {};
//# sourceMappingURL=modal-host.d.ts.map