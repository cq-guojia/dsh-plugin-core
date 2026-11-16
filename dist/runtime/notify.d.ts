/**
 * 跨页通知：发一条 / 收一条，外加它需要的几样底座。
 *
 * 这个文件**不认识任务**。任务中心借它的通道发自己的分片，借它的事件总线发自己的事件；
 * 反过来它不知道有「任务」这回事，也不替任何消费方决定收到之后该干什么
 * （弹 toast 是 `ui/feedback/notify-bridge.ts` 的选择，不是这里的默认行为）。
 *
 * 底座都是「进程内唯一」的，因为 core 会被内联进每个插件 bundle：
 *   - 总线：`Symbol.for` 单例，避免两个副本各建一条导致事件分流；
 *   - 默认分组：同上，`setDefaultTaskProject()` 一次设置，每个副本都看得见；
 *   - 默认 scope：同上，一条通道、一份订阅者名单。
 *
 * 通道**不**收口成单例：`BroadcastChannel` 收不到自己 post 的消息，收口会让同一个上下文里
 * 的第二个逻辑端（测试里的第二页、或将来的第二个消费者）永远收不到。所以「一个 scope 一条实例」，
 * 测试可以 `createNotifyScope()` 造两个互通的端。
 *
 * 零 React / 零 DOM at import time：`BroadcastChannel` 在第一次收发时才开，
 * Node 与 SSR 可以直接 import 这个模块。
 */
/** 协议版本写进 key 里：线格式变了就换一个 host，旧副本不会被误认。 */
export declare const NOTIFY_PROTOCOL = 2;
/** 通道名。跨 bundle 副本靠它汇到一条线上，改名等于换协议。 */
export declare const NOTIFY_CHANNEL = "dsh-plugin-core/task-notifications/v2";
/** 默认分组挂在全局 symbol 上：每个内联副本必须看到同一个值。 */
export declare const NOTIFY_PROJECT_KEY: unique symbol;
/** 事件总线的全局槽位。 */
export declare const NOTIFY_EVENTS_KEY: unique symbol;
/**
 * 详情载荷：任意 JSON 值。对象与数组按结构化克隆算法过线，调用方不用自己
 * stringify —— 这里会在入口处克隆一份私有副本。函数、DOM 节点、类实例直接报错。
 */
export type NotifyDetail = string | number | boolean | null | readonly NotifyDetail[] | {
    readonly [key: string]: NotifyDetail;
};
export type NotifyLevel = 'info' | 'success' | 'warning' | 'error';
/**
 * 一条通知：只出事件、**不进任何列表**，所以不会有一闪的行、没有 id 可查、也不可结束。
 * 要常驻的状态请用任务。
 */
export interface NotifyMessage {
    readonly id: string;
    readonly project: string;
    readonly group: string;
    readonly title: string;
    readonly icon?: string;
    readonly iconSvg?: string;
    readonly detail?: NotifyDetail;
    readonly level: NotifyLevel;
    readonly at: number;
}
/** 除标题外的可选项。标题单独作第一个参数 —— 它永远必填，不该混在可选项里。 */
export interface NotifyMessageOptions {
    /** 缺省用全局默认分组；两者都没有直接报错。 */
    project?: string;
    /** 二级分组，缺省 `'default'`。 */
    group?: string;
    icon?: string;
    iconSvg?: string;
    detail?: NotifyDetail;
    level?: NotifyLevel;
}
/** 应用启动时调一次。传 `undefined` 清空（测试依赖这个）。 */
export declare function setDefaultTaskProject(project: string | undefined): void;
export declare function getDefaultTaskProject(): string | undefined;
/** 缺省取全局默认分组；`null` 表示「不按分组过滤」，只有查询侧会传。 */
export declare function resolveProject(project?: string | null): string | null;
export declare function normalizeGroup(group?: string): string;
/** JSON 值检查，带深度上限，避免环状载荷拖死解析。 */
export declare function isDetail(value: unknown, depth?: number): value is NotifyDetail;
/**
 * 入口处克隆一份私有副本：之后改原对象不许渗进来；
 * 线上带不了的东西必须在这里报错，而不是等开了通道之后才以另一种方式失败。
 */
export declare function cloneDetail(value: NotifyDetail | undefined): NotifyDetail | undefined;
/**
 * 开一条 `BroadcastChannel`，不可用时返回 `null`（Node / 旧浏览器 / 被策略禁用）。
 *
 * **不缓存、不收口**：同名实例在同一个上下文里互收，但**收不到自己 post 的消息**。
 * 所以「一个逻辑端一条实例」才是对的 —— 收口成单例会让同上下文里的第二个逻辑端
 * （测试里的第二页、或将来的第二个消费者）永远收不到。要收口的是**总线**，不是通道。
 */
export declare function openBroadcastChannel(name: string): BroadcastChannel | null;
export interface EventBus<E> {
    subscribe(listener: (event: E) => void): () => void;
    emit(event: E): void;
}
/** 建一个多播总线。**一个坏掉的监听者不许拖垮其它监听者**，所以逐个 try。 */
export declare function createEventBus<E>(): EventBus<E>;
/**
 * 跨 bundle 收口：同一个 `key` 全局只有一个总线。
 * 已有值形状不对时直接报错 —— 悄悄换一个会让事件分流且不报错。
 */
export declare function claimEventBus<E>(key: symbol, isValid: (value: unknown) => boolean, create: () => EventBus<E>): EventBus<E>;
export declare function isEventBusLike(value: unknown): boolean;
/** 线上格式：只带纯数据，`kind` 让同一条通道能承载多种用途。 */
export interface NotifyWire {
    readonly kind: 'notify';
    readonly origin: string;
    readonly message: NotifyMessage;
}
export declare function isNotifyWire(value: unknown): value is NotifyWire;
/** 第二个参数是「是否来自别的页面」，消费方据此决定要不要本地再弹一次。 */
export type NotifyListener = (message: NotifyMessage, remote: boolean) => void;
export interface NotifyScopeOptions {
    /** 缺省 `NOTIFY_CHANNEL`。测试用私有名字模拟两个页面。 */
    channelName?: string;
    /** 缺省随机生成；注入只用于确定性测试。 */
    origin?: string;
}
/** 一个逻辑端：一条通道 + 一份订阅者名单 + 自己的消息序号。 */
export interface NotifyScope {
    readonly origin: string;
    /** 发一条：先给本页订阅者，再发给同源的其它页。 */
    notifyMessage(title: string, options?: NotifyMessageOptions): NotifyMessage;
    /** 订阅。返回取消函数。 */
    subscribe(listener: NotifyListener): () => void;
    /** 关掉通道并清空订阅者（测试隔离 / 页面卸载用）。 */
    dispose(): void;
}
/**
 * 建一个逻辑端。同一个 `channelName` 的两个 scope 会互收（各自一条实例），
 * 这就是「跨页」在本模块里的形态 —— 真实浏览器里两个页面天然是两个 scope。
 */
export declare function createNotifyScope(options?: NotifyScopeOptions): NotifyScope;
/**
 * 默认逻辑端：跨 bundle 单例，一条通道一份订阅者名单。
 * 建过一次就挂在 globalThis 上，别的副本拿到同一个。
 */
export declare function defaultNotifyScope(): NotifyScope;
/**
 * 发一条通知：本地先通知本页订阅者，再发给同源的其它页。
 *
 * 没有默认行为 —— 想弹 toast 的那个消费方自己去订阅。
 */
export declare function notifyMessage(title: string, options?: NotifyMessageOptions): NotifyMessage;
/** 订阅默认逻辑端的通知。返回取消函数。 */
export declare function subscribeNotifications(listener: NotifyListener): () => void;
//# sourceMappingURL=notify.d.ts.map