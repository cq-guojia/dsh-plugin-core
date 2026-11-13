/**
 * Toast 的发送 API（**纯 TS：零 React / 零 DOM / 零 sonner**）。
 *
 * 默认本页：把载荷投进本页队列，由 `mountToasts()` 挂的界面订阅渲染。
 * `{ broadcast: true }`：交给通知中心 `notifyMessage` 广播，本页也靠接收端弹。
 *
 * 通知中心不认识这里任何字段，只管把纯数据传出去；时长 / 位置 / 按钮的解释权全在 toast 层。
 */
import { type NotifyOptions, type ToastOptions } from './toast-queue.js';
/**
 * 接上广播接收端（纯逻辑，零 DOM）：此后别的页面广播的提示进入本页队列。
 * 页面加载时调一次即可；不挂在界面上，界面还没挂也能先收下。
 */
export declare function connectToasts(): void;
/**
 * 官方 Sonner 原生提示（**命令式投递**）。用于「官方的」对比 demo 与需要 Sonner 原味的场景。
 * 变体：info（中性卡）/ success（绿）/ error（红）/ warning（黄，richColors）。
 * 只投递数据、不碰 DOM：界面由 `mountToasts()` 挂；界面没挂时先留在队列里。
 */
export declare function showToast(message: string, opts?: ToastOptions): void;
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
export declare function notify(message: string, opts?: NotifyOptions): void;
//# sourceMappingURL=notify.d.ts.map