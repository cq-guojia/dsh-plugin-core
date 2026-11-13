/**
 * Toast 的发送 API（**纯 TS：零 React / 零 DOM / 零 sonner**）。
 *
 * 默认本页：把载荷投进本页队列，由 `mountToasts()` 挂的界面订阅渲染。
 * `{ broadcast: true }`：交给通知中心 `notifyMessage` 广播，本页也靠接收端弹。
 *
 * 通知中心不认识这里任何字段，只管把纯数据传出去；时长 / 位置 / 按钮的解释权全在 toast 层。
 */
import { pushToast, } from './toast-queue.js';
import { ensureNotifyBridge, isNotifyBridgeConnected } from './notify-bridge.js';
import { getDefaultTaskProject, notifyMessage } from '../infra/task-notifications.js';
const DEFAULT_MS = 2600;
/**
 * 接上广播接收端（纯逻辑，零 DOM）：此后别的页面广播的提示进入本页队列。
 * 页面加载时调一次即可；不挂在界面上，界面还没挂也能先收下。
 */
export function connectToasts() {
    ensureNotifyBridge((payload) => {
        pushToast(payload);
    });
}
/**
 * 官方 Sonner 原生提示（**命令式投递**）。用于「官方的」对比 demo 与需要 Sonner 原味的场景。
 * 变体：info（中性卡）/ success（绿）/ error（红）/ warning（黄，richColors）。
 * 只投递数据、不碰 DOM：界面由 `mountToasts()` 挂；界面没挂时先留在队列里。
 */
export function showToast(message, opts) {
    pushToast({
        message,
        variant: opts?.variant ?? 'info',
        style: 'native',
        durationMs: opts?.durationMs ?? DEFAULT_MS,
        position: opts?.position,
        color: opts?.color,
        onDismiss: opts?.onDismiss,
    });
}
/** 攒一条卡片提示的载荷（本页提示与广播失败降级共用）。 */
function cardPayload(message, opts) {
    return {
        message,
        variant: opts?.variant ?? 'info',
        style: 'card',
        description: opts?.description,
        durationMs: opts?.durationMs ?? DEFAULT_MS,
        actions: opts?.actions,
        position: opts?.position,
    };
}
/**
 * 我们封装好的提示（**推荐项目内使用**）：统一卡片样式（灰/绿/红/黄，跟随明暗皮肤），
 * 右侧可挂 1–2 个**我们自己的 Button** 动作按钮，点击后自动关闭并调用你的事件。
 *
 * **纯投递**：不碰 DOM / React，只把载荷交给本页队列。界面由 `mountToasts()` 挂，
 * 广播接收由 `connectToasts()` 接 —— 两者都不在本函数里发生。
 *
 * 传 `{ broadcast: true }` 走另一条路：交给通知中心广播，同源每个页面各弹一条，
 * 本页也靠接收端弹 —— 因此**不能带 `actions`**（函数跨不了页），类型上直接禁止。
 */
export function notify(message, opts) {
    if (opts?.broadcast === true) {
        broadcastNotify(message, opts);
        return;
    }
    pushToast(cardPayload(message, opts));
}
/**
 * 广播路径：本页**不直接弹**，交给通知中心发出去；本页也会收到同一条（`remote: false`），
 * 由 `notify-bridge` 收进本页队列 —— 所以整条提示只出现一次，开几个页面就各弹一次。
 */
function broadcastNotify(message, opts) {
    // 函数跨不了页。类型上已经禁止（actions?: never），这里是绕过类型的 JS 调用方的
    // 运行时兜底 —— 与 `detail` 传函数同一口径：当场抛错，不静默丢按钮。
    if (opts.actions !== undefined) {
        throw new Error('notify({ broadcast: true }) cannot carry actions: functions cannot cross pages (pass a plain-data message, or use a local toast)');
    }
    // 只准纯数据跨页：description 不是字符串会在通知中心克隆 detail 时抛错（那时还没发出本地事件）。
    if (opts.description !== undefined && typeof opts.description !== 'string') {
        throw new TypeError('notify({ broadcast: true }) description must be a string: only plain data crosses pages');
    }
    // 确定发不出去的情况，直接降级成本页提示，消息不丢。
    // 没有 DOM（Node / SSR）是正常环境，不刷告警；另外两种是接线缺失，要看得见。
    if (typeof document === 'undefined') {
        pushToast(cardPayload(message, opts));
        return;
    }
    if (getDefaultTaskProject() === undefined || !isNotifyBridgeConnected()) {
        console.warn('[dsh-plugin-core] 广播条件不满足，降级为本页提示（需设默认项目并在页面加载时调 connectToasts()）');
        pushToast(cardPayload(message, opts));
        return;
    }
    try {
        notifyMessage(message, {
            level: opts.variant ?? 'info',
            ...(opts.description === undefined ? {} : { detail: opts.description }),
        });
    }
    catch (error) {
        // 本地 message 事件可能已发出、桥已渲染过一条，这里不能再补一条 ⇒ 只告警不降级。
        console.warn(`[dsh-plugin-core] notify({ broadcast: true }) 广播未完全送达：${String(error)}`);
    }
}
//# sourceMappingURL=notify.js.map