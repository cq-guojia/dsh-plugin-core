import type { ToastPayload, ToastPosition } from './toast-queue.js';
/** 全局注册表键：Symbol.for 跨 bundle 副本天然共享同一个符号。 */
export declare const TOAST_HOST_KEY: unique symbol;
/** 全局单例：已注册则直接返回（不触发 create），否则建一个并注册。 */
export declare function claimToastHost<T>(create: () => T): T;
export interface ToastHost {
    show(payload: ToastPayload): void;
    /** 全局统一位置：任一副本调用对所有插件生效。 */
    setPosition(position: ToastPosition): void;
}
//# sourceMappingURL=toast-host.d.ts.map