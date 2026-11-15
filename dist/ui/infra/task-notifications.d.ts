/** Protocol version lives in the keys: a different wire shape gets its own host. */
export declare const TASK_NOTIFICATIONS_PROTOCOL = 2;
export declare const TASK_NOTIFICATIONS_KEY: unique symbol;
export declare const TASK_NOTIFICATIONS_EVENTS_KEY: unique symbol;
export declare const TASK_NOTIFICATIONS_CHANNEL = "dsh-plugin-core/task-notifications/v2";
/** Default project lives on a global symbol: every inlined copy must see one value. */
export declare const TASK_NOTIFICATIONS_PROJECT_KEY: unique symbol;
/** 静默任务的默认回收窗口；与 TanStack Query 的 gcTime 默认值一致。 */
export declare const TASK_NOTIFICATIONS_HIDDEN_TTL_MS: number;
export type TaskNotificationStatus = 'running' | 'done' | 'failed';
/**
 * Detail payload: any JSON value. Objects and arrays cross pages through the
 * structured clone algorithm, so callers never stringify — the pool clones a
 * private copy on the way in. Functions, DOM nodes and class instances are
 * rejected with an explicit error.
 */
export type TaskNotificationDetail = string | number | boolean | null | readonly TaskNotificationDetail[] | {
    readonly [key: string]: TaskNotificationDetail;
};
/**
 * 一条任务上的按钮：`label` 是显示文案，`run` 是点击时执行的方法。
 *
 * `run` 是函数，只能在创建它的页面里执行，所以它**不进池、不过线**：池只存 label，
 * 方法按 `任务id#下标` 放在本页内存的注册表里。别的页面点按钮时，消息发回创建页由它执行
 * —— 与 VS Code 命令表、Chrome 通知按钮同一形态：边界上只走 id 与纯数据。
 */
export interface TaskNotificationAction {
    /** 文案；与 `icon` 至少给一个。只给 `icon` 时展示方画成正方形图标钮。 */
    readonly label?: string;
    /** 图标标识（`库名:图标名`）；与 `label` 至少给一个。 */
    readonly icon?: string;
    /**
     * 按钮色（任意 CSS 色值，如 `#dc2626` / `var(--dshpc-business)`）。
     * 不传 = 用展示方的默认档；传了就是实心底色。跨页只传这个字符串本身。
     */
    readonly color?: string;
    /** 点击时执行；匿名函数即可。抛错由池捕获并算作本次调用失败。 */
    readonly run: () => void;
}
/** 记录里能跨页的那部分：文案 + 图标 + 可选按钮色。下标即动作 id。 */
export interface TaskNotificationActionInfo {
    readonly label?: string;
    readonly icon?: string;
    readonly color?: string;
}
/**
 * 业务键：调用方给的身份。核心不解释含义、不做模式校验，只做相等判等 ——
 * 同一个键在池里最多对应一条记录。
 *
 * 传字符串就原样用；传数组（元组）按元素归一化成稳定串，免得手拼分隔符把两件事撞成一个键。
 */
export type TaskKey = string | readonly (string | number)[];
/** Plain, structured-cloneable data. No functions, no ReactNode, no components. */
export interface TaskNotificationRecord {
    readonly id: string;
    /** 归一化后的业务键（`taskKey()` 的结果）；同一 (project, key) 同时最多一条。 */
    readonly key?: string;
    /** First level: the project that owns this task. */
    readonly project: string;
    /** Second level: a group inside that project. Never empty; defaults to 'default'. */
    readonly group: string;
    /** Optional display name override for the project. */
    readonly projectLabel?: string;
    /** Optional display name override for the group. */
    readonly groupLabel?: string;
    readonly title: string;
    /** 图标标识（图标名 / 图标字体类名）。核心不解释它，由消费端渲染。 */
    readonly icon?: string;
    /** 原始 SVG 源，消费端自行渲染；核心只存不解释，注入风险由调用方承担。 */
    readonly iconSvg?: string;
    readonly detail?: TaskNotificationDetail;
    /** 按钮文案；下标即动作 id。方法本身留在创建页内存里，记录里不带函数。 */
    readonly actions?: readonly TaskNotificationActionInfo[];
    readonly status: TaskNotificationStatus;
    readonly startedAt: number;
    readonly updatedAt: number;
    /** Page that owns the task. Only the owning page can restore its dialog. */
    readonly origin: string;
    readonly backgrounded: boolean;
    /** 不进默认列表；池、事件、跨页、收尾一切照旧。可在运行时切换。 */
    readonly hidden?: boolean;
    /** 回收窗口（毫秒）。以最后一次活动（updatedAt）起算，到点由池结算为 failed。 */
    readonly timeoutMs?: number;
    readonly reason?: string;
}
export interface TaskNotificationInput {
    /** Defaults to the global default project; throws when neither is set. */
    project?: string;
    /** Second level; defaults to 'default'. */
    group?: string;
    readonly title: string;
    /**
     * 业务键。同页已有同键条目 → 就地更新这条并复用同一个句柄（不新增）；
     * 别的页面已有同键条目 → 抛 `TaskNotificationConflictError`（作业在它那一页，给了也点不动）。
     */
    key?: TaskKey;
    projectLabel?: string;
    groupLabel?: string;
    icon?: string;
    iconSvg?: string;
    detail?: TaskNotificationDetail;
    /** 按钮：文案 + 点击执行的方法。方法不会被序列化，只在创建它的页面里执行。 */
    actions?: readonly TaskNotificationAction[];
    /** 不进默认列表；默认关闭。开了之后默认带 5 分钟超时兜底。 */
    hidden?: boolean;
    /** 毫秒；0 = 不回收。缺省：hidden 用 5 分钟，可见任务不回收。 */
    timeoutMs?: number;
}
export interface TaskNotificationPatch {
    title?: string;
    detail?: TaskNotificationDetail;
    /** Second level only: a task never changes project. */
    group?: string;
    groupLabel?: string;
    icon?: string;
    iconSvg?: string;
    hidden?: boolean;
}
export type TaskNotificationLevel = 'info' | 'success' | 'warning' | 'error';
/**
 * 纯广播：只出 `message` 事件，**不进池、不进列表**，所以不会有任何一闪。
 * 常驻监控请用 notifyTask；这里的东西发完即止，没有 id 可查、也不可结束。
 */
export interface TaskNotificationMessage {
    readonly id: string;
    readonly project: string;
    readonly group: string;
    readonly title: string;
    readonly icon?: string;
    readonly iconSvg?: string;
    readonly detail?: TaskNotificationDetail;
    readonly level: TaskNotificationLevel;
    readonly at: number;
}
export interface TaskNotificationMessageInput {
    /** Defaults to the global default project; throws when neither is set. */
    project?: string;
    /** Second level; defaults to 'default'. */
    group?: string;
    readonly title: string;
    icon?: string;
    iconSvg?: string;
    detail?: TaskNotificationDetail;
    level?: TaskNotificationLevel;
}
/** `'*'` means every project, every group. An array means those groups of one project. */
export type TaskNotificationGroupFilter = readonly string[] | '*';
export interface TaskNotificationSelectOptions {
    /** Defaults to the global default project; `null` means "do not filter by project". */
    project?: string | null;
    /** Default false: `hidden` tasks stay out of every list unless asked for. */
    includeHidden?: boolean;
}
export interface TaskNotificationSettlement {
    readonly outcome: 'done' | 'failed';
    readonly reason?: string;
    readonly task: TaskNotificationRecord;
}
export interface TaskNotificationHandle {
    readonly id: string;
    readonly isSettled: boolean;
    /** Settles only when the task really ends; collapsing never settles it. */
    readonly settled: Promise<TaskNotificationSettlement>;
    update(patch: TaskNotificationPatch): void;
    background(): void;
    done(detail?: TaskNotificationDetail): void;
    fail(reason?: string): void;
    /** Promise-settle fallback: success and rejection both close the task. */
    track<T>(promise: Promise<T>): Promise<T>;
}
/**
 * 登记结果。`created === false` 说明本页已经有同键任务并复用了它 ——
 * 调用方不要为同一件事再起第二份活（作业只该有一个执行者，收尾也归它）。
 */
export interface TaskNotificationClaim {
    readonly handle: TaskNotificationHandle;
    readonly created: boolean;
}
export interface TaskNotificationSnapshot {
    readonly tasks: readonly TaskNotificationRecord[];
    /** Real monotonic counter of state changes on this page. */
    readonly revision: number;
}
export type TaskNotificationEvent = {
    readonly type: 'registered';
    readonly task: TaskNotificationRecord;
    readonly remote: boolean;
} | {
    readonly type: 'updated';
    readonly task: TaskNotificationRecord;
    readonly remote: boolean;
} | {
    readonly type: 'backgrounded';
    readonly task: TaskNotificationRecord;
    readonly remote: boolean;
} | {
    readonly type: 'settled';
    readonly outcome: 'done' | 'failed';
    readonly task: TaskNotificationRecord;
    readonly remote: boolean;
}
/** 纯广播：来了就是一条消息，池里没有它，列表不会因为它闪一下。 */
 | {
    readonly type: 'message';
    readonly message: TaskNotificationMessage;
    readonly remote: boolean;
}
/** Never crosses pages: restoring a dialog is local by contract. */
 | {
    readonly type: 'restored';
    readonly taskId: string;
    readonly remote: false;
} | {
    readonly type: 'peer-left';
    readonly origin: string;
    readonly remote: true;
};
export type TaskNotificationEventListener = (event: TaskNotificationEvent) => void;
export interface TaskNotificationEventBus {
    subscribe(listener: TaskNotificationEventListener): () => void;
    emit(event: TaskNotificationEvent): void;
}
/**
 * Liveness provider: one lock per page, held for the life of the page.
 *
 * The browser releases a page's locks when the document unloads or its agent
 * terminates (Web Locks spec §2.6), so "is that name still held?" answers
 * "is that page still there?" without timers, heartbeats or replies.
 */
export interface TaskNotificationLockManager {
    /**
     * Hold a lock until the page goes away. Idempotent per name.
     * 浏览器拒绝申请时（不透明 origin、存储分区、策略禁用）可以返回被拒的 promise；
     * 池会捕获它并在下一次 connect / refresh 重试，不会漏成 unhandled rejection。
     */
    hold(name: string): void | Promise<void>;
    /** true = no context holds that name right now, i.e. that page is gone. */
    free(name: string): Promise<boolean>;
}
export interface TaskNotificationPoolOptions {
    /** Defaults to a fresh per-page id. Inject only for deterministic tests. */
    origin?: string;
    /** Defaults to TASK_NOTIFICATIONS_CHANNEL. Use a private name in tests. */
    channelName?: string;
    /** true = never open a BroadcastChannel (single page / offline use). */
    offline?: boolean;
    /** Defaults to the global singleton bus. */
    events?: TaskNotificationEventBus;
    /** Defaults to browser detection; false keeps the pool free of lifecycle hooks. */
    lifecycle?: boolean;
    /** Defaults to `navigator.locks`; null disables dead-page cleanup. */
    locks?: TaskNotificationLockManager | null;
}
export interface TaskNotificationPool {
    readonly protocol: number;
    readonly origin: string;
    getSnapshot(): TaskNotificationSnapshot;
    getServerSnapshot(): TaskNotificationSnapshot;
    subscribe(listener: () => void): () => void;
    /** Open the cross-page channel and request the baseline. Idempotent. */
    connect(): void;
    /** Re-request the baseline after a suspended tab wakes up. */
    refresh(): void;
    select(groups?: TaskNotificationGroupFilter, options?: TaskNotificationSelectOptions): readonly TaskNotificationRecord[];
    register(input: TaskNotificationInput): TaskNotificationHandle;
    /** 幂等登记：带 `key` 时就地复用本页同键条目，并告诉你这条是不是刚建的。 */
    ensure(input: TaskNotificationInput): TaskNotificationClaim;
    /** 纯广播：只出 `message` 事件，不写池、不动快照。 */
    broadcast(input: TaskNotificationMessageInput): TaskNotificationMessage;
    /** Settle every task this page still owns; handles are not needed. */
    settleLocal(reason?: string): number;
    /**
     * 执行一条任务的按钮（`actions[index]`）。本页条目立即执行；跨页条目发回创建页执行并等它回 ack
     * （2s 没有回应算失败）。失败一律 false，不抛异常给调用方。
     */
    runAction(taskId: string, index: number): Promise<boolean>;
    canRestore(task: TaskNotificationRecord): boolean;
    /** Emits a local `restored` event. Returns false for cross-page tasks. */
    requestRestore(taskId: string): boolean;
    dispose(): void;
}
/** Set once at app start. `undefined` clears it (tests rely on this). */
export declare function setDefaultTaskProject(project: string | undefined): void;
export declare function getDefaultTaskProject(): string | undefined;
/**
 * 归一化业务键：元组按元素序列化（顺序与边界都由 JSON 保证），字符串原样。
 *
 * 只收扁平原值。对象 / 函数 / 时间戳当键会让「同一件事」每次算出不同键，等于没去重，
 * 所以在这里当场拒绝，而不是悄悄放行成「每次都是新的一条」。
 */
export declare function taskKey(key: TaskKey): string;
/**
 * 同一个键已经在**别的页面**登记着：那条作业的方法在它那一页，本页拿着也点不动，
 * 所以不返回假句柄，直接拒绝，让调用方提示「已在别处进行中」。
 *
 * 判冲突请用 `code`（core 被打进每个插件 bundle，跨副本 `instanceof` 不可靠）。
 */
export declare class TaskNotificationConflictError extends Error {
    readonly code = "TASK_NOTIFICATION_CONFLICT";
    readonly key: string;
    /** 持有该键的页面 origin。 */
    readonly ownerOrigin: string;
    constructor(key: string, ownerOrigin: string);
}
/**
 * Three tiers, in that order:
 *   - no filter / empty array: every group of the current project;
 *   - one or more names: only those groups of the current project;
 *   - `'*'`: every project and every group (pass `{ project }` to scope it).
 *
 * The returned reference is stable for the lifetime of the snapshot.
 */
export declare function selectTaskNotifications(snapshot: TaskNotificationSnapshot, groups?: TaskNotificationGroupFilter, options?: TaskNotificationSelectOptions): readonly TaskNotificationRecord[];
export declare function createTaskNotificationEventBus(): TaskNotificationEventBus;
export declare function claimTaskNotifications(create: () => TaskNotificationPool): TaskNotificationPool;
export declare function claimTaskNotificationEvents(create: () => TaskNotificationEventBus): TaskNotificationEventBus;
/** One lock per page, named by origin. Bumping the protocol gives a clean namespace. */
export declare const TASK_NOTIFICATIONS_LOCK_PREFIX = "dsh-plugin-core/task-notifications/v2/";
export declare function createTaskNotificationPool(options?: TaskNotificationPoolOptions): TaskNotificationPool;
export declare const taskNotifications: TaskNotificationPool;
export interface NotifyTaskOptions {
    /** 一级分组：缺省用全局默认项目；两者都没有则抛错。 */
    project?: string;
    /** 二级分组：缺省 'default'。 */
    group?: string;
    /** 业务键：同页重复登记就地复用同一条，跨页则抛冲突（见 `TaskNotificationInput.key`）。 */
    key?: TaskKey;
    /** 入池即带的详情；任意 JSON 值，库内部克隆一份私有副本。 */
    detail?: TaskNotificationDetail;
    /** 后台条目上的按钮：文案 + 点击执行的方法（匿名函数即可，不会被序列化）。 */
    actions?: readonly TaskNotificationAction[];
    projectLabel?: string;
    groupLabel?: string;
    /** 图标标识（图标名 / 字体类名），核心不解释，消费端渲染。 */
    icon?: string;
    /** 原始 SVG 源，消费端自行渲染。 */
    iconSvg?: string;
    /** 不进默认列表（仍进池、仍可 await）；不设 timeoutMs 时默认 5 分钟兜底。 */
    hidden?: boolean;
    /** 毫秒；0 = 不回收。缺省：hidden 用 5 分钟，可见任务不回收。 */
    timeoutMs?: number;
}
/**
 * 日常入口：只要一个标题，项目和二级分组都能省。
 *
 * 分工与 oraPromise / toast.promise / withProgress 一致：
 * 自己管结束用 `notifyTask(title, options?)`；包住一段异步用 `notifyTask.run(title, work, options?)`。
 * 前者返回句柄，后者返回 work 的原结果 —— 同一入口不靠参数把返回类型换掉。
 */
export interface NotifyTask {
    (title: string, options?: NotifyTaskOptions): TaskNotificationHandle;
    /** 幂等登记：带 key 时本页已有同键条目就地复用，并告诉你这条是不是刚建的。 */
    ensure(title: string, options?: NotifyTaskOptions): TaskNotificationClaim;
    /** 包住一段异步：成功走 done、失败走 fail，结果与异常原样透传。 */
    run<T>(title: string, work: Promise<T> | (() => Promise<T>), options?: NotifyTaskOptions): Promise<T>;
}
export interface NotifyMessageOptions {
    /** 一级分组：缺省用全局默认项目。 */
    project?: string;
    /** 二级分组：缺省 'default'。 */
    group?: string;
    detail?: TaskNotificationDetail;
    icon?: string;
    iconSvg?: string;
    /** 语义级别，缺省 info；核心只用它传数据，怎么显示由消费端决定。 */
    level?: TaskNotificationLevel;
}
/**
 * 纯广播：只发一个 `message` 事件，**不进池、不进列表**，所以不会有「出现一帧又消失」的闪动。
 *
 * 常驻、要进监控列表、要能被结束的，用 `notifyTask`。
 */
export declare function notifyMessage(title: string, options?: NotifyMessageOptions): TaskNotificationMessage;
export declare const notifyTask: NotifyTask;
export declare const taskNotificationEvents: TaskNotificationEventBus;
export declare function subscribeTaskNotificationEvents(listener: TaskNotificationEventListener): () => void;
export declare function emitTaskNotificationEvent(event: TaskNotificationEvent): void;
//# sourceMappingURL=task-notifications.d.ts.map