import type { ToastPayload } from './toast-queue.js';
/** 全局注册表键：`Symbol.for` 跨 bundle 副本天然共享同一个符号。 */
export declare const NOTIFY_BRIDGE_KEY: unique symbol;
/** 广播提示的停留时长与本页提示一致（2600ms）。 */
export declare const BROADCAST_TOAST_MS = 2600;
/** 本页是否已接上广播接收端（给发送侧判断「广播会不会有人收」）。 */
export declare function isNotifyBridgeConnected(): boolean;
/** 摘掉广播接收端（页面卸载 / 测试隔离用）：退订事件并清掉单例，可再次 connect。 */
export declare function disconnectNotifyBridge(): void;
/**
 * 确保本页已接上广播并开始监听（幂等：一页只挂一次）。
 *
 * `render` 由调用方（`notify.ts` 的 `pushToast`）提供 —— 本模块不反向依赖界面文件。
 * 顺手 `connect()`：页面没连过频道就收不到别的页面发来的消息。
 * 只有 connect 与订阅**都成功**才置位单例；失败时留空并告警，下次调用还能重试。
 */
export declare function ensureNotifyBridge(render: (payload: ToastPayload) => void): void;
//# sourceMappingURL=notify-bridge.d.ts.map