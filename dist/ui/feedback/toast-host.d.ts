import type { ToastAction, ToastPosition, ToastVariant } from './Toast.js';
/** 全局注册表键：Symbol.for 跨 bundle 副本天然共享同一个符号。 */
export declare const TOAST_HOST_KEY: unique symbol;
/** 全局单例：已注册则直接返回（不触发 create），否则建一个并注册。 */
export declare function claimToastHost<T>(create: () => T): T;
export interface ToastPayload {
    message: string;
    variant: ToastVariant;
    /** native = showToast（sonner 原味）；card = notify（我们的卡）。 */
    style: 'native' | 'card';
    description?: string;
    durationMs: number;
    /** showToast 的整条自定义色（仅 native 有意义）。 */
    color?: string;
    onDismiss?: () => void;
    /** notify 的右侧按钮（仅 card，1–2 个）。 */
    actions?: ToastAction[];
}
export interface ToastHost {
    show(payload: ToastPayload): void;
    /** 全局统一位置：任一副本调用对所有插件生效。 */
    setPosition(position: ToastPosition): void;
}
//# sourceMappingURL=toast-host.d.ts.map