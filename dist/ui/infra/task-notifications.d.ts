/** Protocol version lives in the keys: a different wire shape gets its own host. */
export declare const TASK_NOTIFICATIONS_PROTOCOL = 1;
export declare const TASK_NOTIFICATIONS_KEY: unique symbol;
export declare const TASK_NOTIFICATIONS_EVENTS_KEY: unique symbol;
export declare const TASK_NOTIFICATIONS_CHANNEL = "dsh-plugin-core/task-notifications/v1";
export type TaskNotificationStatus = 'running' | 'done' | 'failed';
/** Plain, structured-cloneable data. No functions, no ReactNode, no components. */
export interface TaskNotificationRecord {
    readonly id: string;
    /** Caller-supplied group id; core cannot discover a project name. */
    readonly group: string;
    /** Optional display name override for the group. */
    readonly groupLabel?: string;
    readonly title: string;
    readonly detail?: string;
    readonly status: TaskNotificationStatus;
    readonly startedAt: number;
    readonly updatedAt: number;
    /** Page that owns the task. Only the owning page can restore its dialog. */
    readonly origin: string;
    readonly backgrounded: boolean;
    readonly reason?: string;
}
export interface TaskNotificationInput {
    group: string;
    title: string;
    groupLabel?: string;
    detail?: string;
}
export interface TaskNotificationPatch {
    title?: string;
    detail?: string;
    group?: string;
    groupLabel?: string;
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
    done(detail?: string): void;
    fail(reason?: string): void;
    /** Promise-settle fallback: success and rejection both close the task. */
    track<T>(promise: Promise<T>): Promise<T>;
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
    select(groups?: readonly string[]): readonly TaskNotificationRecord[];
    register(input: TaskNotificationInput): TaskNotificationHandle;
    canRestore(task: TaskNotificationRecord): boolean;
    /** Emits a local `restored` event. Returns false for cross-page tasks. */
    requestRestore(taskId: string): boolean;
    dispose(): void;
}
/**
 * undefined / empty = show every group; one or more = show only those groups.
 * The returned reference is stable for the lifetime of the snapshot.
 */
export declare function selectTaskNotifications(snapshot: TaskNotificationSnapshot, groups?: readonly string[]): readonly TaskNotificationRecord[];
export declare function createTaskNotificationEventBus(): TaskNotificationEventBus;
export declare function claimTaskNotifications(create: () => TaskNotificationPool): TaskNotificationPool;
export declare function claimTaskNotificationEvents(create: () => TaskNotificationEventBus): TaskNotificationEventBus;
export declare function createTaskNotificationPool(options?: TaskNotificationPoolOptions): TaskNotificationPool;
export declare const taskNotifications: TaskNotificationPool;
export interface NotifyTaskOptions {
    /** 首屏就带的详情文案；之后仍可用 handle.update() 改。 */
    detail?: string;
    /** 分组显示名覆盖。 */
    groupLabel?: string;
}
/**
 * 日常入口：位置参数登记一条任务，返回句柄（等价 `taskNotifications.register({ ... })`）。
 *
 * 分工与 oraPromise / toast.promise / withProgress 一致：
 * 自己管结束用 `notifyTask(group, title)`；包住一段异步用 `notifyTask.run(group, title, work)`。
 * 前者返回句柄，后者返回 work 的原结果 —— 同一入口不靠参数把返回类型换掉。
 */
export interface NotifyTask {
    (group: string, title: string, options?: NotifyTaskOptions): TaskNotificationHandle;
    /** 包住一段异步：成功走 done、失败走 fail，结果与异常原样透传。 */
    run<T>(group: string, title: string, work: Promise<T> | (() => Promise<T>)): Promise<T>;
}
export declare const notifyTask: NotifyTask;
export declare const taskNotificationEvents: TaskNotificationEventBus;
export declare function subscribeTaskNotificationEvents(listener: TaskNotificationEventListener): () => void;
export declare function emitTaskNotificationEvent(event: TaskNotificationEvent): void;
//# sourceMappingURL=task-notifications.d.ts.map