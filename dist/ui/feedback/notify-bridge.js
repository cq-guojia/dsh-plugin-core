/**
 * 广播提示的接收端（**toast 层的适配器**）：通知中心广播出来的 `message`，收到就转成
 * toast 载荷交给本页队列；通知中心不认识这些字段，也不认识本文件。
 *
 * 为什么单独一层：`notifyMessage` 只负责把消息发出去（本页 emit + 同源其它页面
 * `BroadcastChannel`），不负责显示。没有接收端，广播就是空放。
 *
 * 一页只挂一次：core 被内联进每个插件 bundle，每个副本各订阅一次的话，一条广播会
 * 弹多次。这里用 `Symbol.for` 单例收口（与 `toast-host.ts` / `loading-host.ts` 同一手法）。
 *
 * 与「本页弹」互斥：本页直接 `notify(msg)` 不进这条链路；`notify(msg, { broadcast: true })`
 * 才发广播，本页也靠这里收到的那份来弹（`broadcast()` 会同时 emit 一条 `remote: false`
 * 的本地事件，所以本页不必另弹一次）。
 */
import { subscribeTaskNotificationEvents, taskNotifications, } from '../infra/task-notifications.js';
/** 全局注册表键：`Symbol.for` 跨 bundle 副本天然共享同一个符号。 */
export const NOTIFY_BRIDGE_KEY = Symbol.for('dsh-plugin-core/notify-bridge');
/** 广播提示的停留时长与本页提示一致（2600ms）。 */
export const BROADCAST_TOAST_MS = 2600;
/** 本页是否已接上广播接收端（给发送侧判断「广播会不会有人收」）。 */
export function isNotifyBridgeConnected() {
    return globalThis[NOTIFY_BRIDGE_KEY] !== undefined;
}
/** 摘掉广播接收端（页面卸载 / 测试隔离用）：退订事件并清掉单例，可再次 connect。 */
export function disconnectNotifyBridge() {
    const g = globalThis;
    const slot = g[NOTIFY_BRIDGE_KEY];
    if (slot === undefined)
        return;
    slot.unsubscribe();
    delete g[NOTIFY_BRIDGE_KEY];
}
/**
 * 广播消息 → 本页 toast 载荷。
 *
 * 跨页只能传结构化克隆的纯数据：动作按钮（函数）跨不过来，`durationMs` / `position`
 * 也不随消息走 —— 显示口径由接收端统一。
 */
function toPayload(message) {
    const detail = message.detail;
    return {
        message: message.title,
        variant: message.level,
        style: 'card',
        ...(typeof detail === 'string' ? { description: detail } : {}),
        durationMs: BROADCAST_TOAST_MS,
    };
}
/**
 * 确保本页已接上广播并开始监听（幂等：一页只挂一次）。
 *
 * `render` 由调用方（`notify.ts` 的 `pushToast`）提供 —— 本模块不反向依赖界面文件。
 * 顺手 `connect()`：页面没连过频道就收不到别的页面发来的消息。
 * 只有 connect 与订阅**都成功**才置位单例；失败时留空并告警，下次调用还能重试。
 */
export function ensureNotifyBridge(render) {
    const g = globalThis;
    if (g[NOTIFY_BRIDGE_KEY] !== undefined)
        return;
    let unsubscribe;
    try {
        taskNotifications.connect();
        unsubscribe = subscribeTaskNotificationEvents((event) => {
            if (event.type !== 'message')
                return;
            render(toPayload(event.message));
        });
        g[NOTIFY_BRIDGE_KEY] = { unsubscribe };
    }
    catch (error) {
        // 不静默吞掉：接线失败要看得见，且不能把单例钉死在失败态。
        console.warn(`[dsh-plugin-core] 广播接收端接线失败：${String(error)}`);
    }
}
//# sourceMappingURL=notify-bridge.js.map