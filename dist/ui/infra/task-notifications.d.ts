/** Protocol version lives in the keys: a different wire shape gets its own host. */
export declare const TASK_NOTIFICATIONS_PROTOCOL = 2;
export declare const TASK_NOTIFICATIONS_KEY: unique symbol;
export declare const TASK_NOTIFICATIONS_EVENTS_KEY: unique symbol;
export declare const TASK_NOTIFICATIONS_CHANNEL = "dsh-plugin-core/task-notifications/v2";
/** Default project lives on a global symbol: every inlined copy must see one value. */
export declare const TASK_NOTIFICATIONS_PROJECT_KEY: unique symbol;
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
/** Plain, structured-cloneable data. No functions, no ReactNode, no components. */
export interface TaskNotificationRecord {
    readonly id: string;
    /** First level: the project that owns this task. */
    readonly project: string;
    /** Second level: a group inside that project. Never empty; defaults to 'default'. */
    readonly group: string;
    /** Optional display name override for the project. */
    readonly projectLabel?: string;
    /** Optional display name override for the group. */
    readonly groupLabel?: string;
    readonly title: string;
    readonly detail?: TaskNotificationDetail;
    readonly status: TaskNotificationStatus;
    readonly startedAt: number;
    readonly updatedAt: number;
    /** Page that owns the task. Only the owning page can restore its dialog. */
    readonly origin: string;
    readonly backgrounded: boolean;
    readonly reason?: string;
}
export interface TaskNotificationInput {
    /** Defaults to the global default project; throws when neither is set. */
    project?: string;
    /** Second level; defaults to 'default'. */
    group?: string;
    readonly title: string;
    projectLabel?: string;
    groupLabel?: string;
    detail?: TaskNotificationDetail;
}
export interface TaskNotificationPatch {
    title?: string;
    detail?: TaskNotificationDetail;
    /** Second level only: a task never changes project. */
    group?: string;
    groupLabel?: string;
}
/** `'*'` means every project, every group. An array means those groups of one project. */
export type TaskNotificationGroupFilter = readonly string[] | '*';
export interface TaskNotificationSelectOptions {
    /** Defaults to the global default project; `null` means "do not filter by project". */
    project?: string | null;
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
/**
 * Liveness provider: one lock per page, held for the life of the page.
 *
 * The browser releases a page's locks when the document unloads or its agent
 * terminates (Web Locks spec §2.6), so "is that name still held?" answers
 * "is that page still there?" without timers, heartbeats or replies.
 */
export interface TaskNotificationLockManager {
    /** Hold a lock until the page goes away. Idempotent per name. */
    hold(name: string): void;
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
    /** Settle every task this page still owns; handles are not needed. */
    settleLocal(reason?: string): number;
    canRestore(task: TaskNotificationRecord): boolean;
    /** Emits a local `restored` event. Returns false for cross-page tasks. */
    requestRestore(taskId: string): boolean;
    dispose(): void;
}
/** Set once at app start. `undefined` clears it (tests rely on this). */
export declare function setDefaultTaskProject(project: string | undefined): void;
export declare function getDefaultTaskProject(): string | undefined;
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
    /** 入池即带的详情；任意 JSON 值，库内部克隆一份私有副本。 */
    detail?: TaskNotificationDetail;
    projectLabel?: string;
    groupLabel?: string;
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
    /** 包住一段异步：成功走 done、失败走 fail，结果与异常原样透传。 */
    run<T>(title: string, work: Promise<T> | (() => Promise<T>), options?: NotifyTaskOptions): Promise<T>;
}
export declare const notifyTask: NotifyTask;
export declare const taskNotificationEvents: TaskNotificationEventBus;
export declare function subscribeTaskNotificationEvents(listener: TaskNotificationEventListener): () => void;
export declare function emitTaskNotificationEvent(event: TaskNotificationEvent): void;
//# sourceMappingURL=task-notifications.d.ts.map