/** Protocol version lives in the keys: a different wire shape gets its own host. */
export declare const BACKGROUND_TASKS_PROTOCOL = 1;
export declare const BACKGROUND_TASKS_KEY: unique symbol;
export declare const BACKGROUND_TASKS_EVENTS_KEY: unique symbol;
export declare const BACKGROUND_TASKS_CHANNEL = "dsh-plugin-core/background-tasks/v1";
export type BackgroundTaskStatus = 'running' | 'done' | 'failed';
/** Plain, structured-cloneable data. No functions, no ReactNode, no components. */
export interface BackgroundTaskRecord {
    readonly id: string;
    /** Caller-supplied group id; core cannot discover a project name. */
    readonly group: string;
    /** Optional display name override for the group. */
    readonly groupLabel?: string;
    readonly title: string;
    readonly detail?: string;
    readonly status: BackgroundTaskStatus;
    readonly startedAt: number;
    readonly updatedAt: number;
    /** Page that owns the task. Only the owning page can restore its dialog. */
    readonly origin: string;
    readonly backgrounded: boolean;
    readonly reason?: string;
}
export interface BackgroundTaskInput {
    group: string;
    title: string;
    groupLabel?: string;
    detail?: string;
}
export interface BackgroundTaskPatch {
    title?: string;
    detail?: string;
    group?: string;
    groupLabel?: string;
}
export interface BackgroundTaskSettlement {
    readonly outcome: 'done' | 'failed';
    readonly reason?: string;
    readonly task: BackgroundTaskRecord;
}
export interface BackgroundTaskHandle {
    readonly id: string;
    readonly isSettled: boolean;
    /** Settles only when the task really ends; collapsing never settles it. */
    readonly settled: Promise<BackgroundTaskSettlement>;
    update(patch: BackgroundTaskPatch): void;
    background(): void;
    done(detail?: string): void;
    fail(reason?: string): void;
    /** Promise-settle fallback: success and rejection both close the task. */
    track<T>(promise: Promise<T>): Promise<T>;
}
export interface BackgroundTaskSnapshot {
    readonly tasks: readonly BackgroundTaskRecord[];
    /** Real monotonic counter of state changes on this page. */
    readonly revision: number;
}
export type BackgroundTaskEvent = {
    readonly type: 'registered';
    readonly task: BackgroundTaskRecord;
    readonly remote: boolean;
} | {
    readonly type: 'updated';
    readonly task: BackgroundTaskRecord;
    readonly remote: boolean;
} | {
    readonly type: 'backgrounded';
    readonly task: BackgroundTaskRecord;
    readonly remote: boolean;
} | {
    readonly type: 'settled';
    readonly outcome: 'done' | 'failed';
    readonly task: BackgroundTaskRecord;
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
export type BackgroundTaskEventListener = (event: BackgroundTaskEvent) => void;
export interface BackgroundTaskEventBus {
    subscribe(listener: BackgroundTaskEventListener): () => void;
    emit(event: BackgroundTaskEvent): void;
}
export interface BackgroundTaskPoolOptions {
    /** Defaults to a fresh per-page id. Inject only for deterministic tests. */
    origin?: string;
    /** Defaults to BACKGROUND_TASKS_CHANNEL. Use a private name in tests. */
    channelName?: string;
    /** true = never open a BroadcastChannel (single page / offline use). */
    offline?: boolean;
    /** Defaults to the global singleton bus. */
    events?: BackgroundTaskEventBus;
    /** Defaults to browser detection; false keeps the pool free of lifecycle hooks. */
    lifecycle?: boolean;
}
export interface BackgroundTaskPool {
    readonly protocol: number;
    readonly origin: string;
    getSnapshot(): BackgroundTaskSnapshot;
    getServerSnapshot(): BackgroundTaskSnapshot;
    subscribe(listener: () => void): () => void;
    /** Open the cross-page channel and request the baseline. Idempotent. */
    connect(): void;
    /** Re-request the baseline after a suspended tab wakes up. */
    refresh(): void;
    select(groups?: readonly string[]): readonly BackgroundTaskRecord[];
    register(input: BackgroundTaskInput): BackgroundTaskHandle;
    canRestore(task: BackgroundTaskRecord): boolean;
    /** Emits a local `restored` event. Returns false for cross-page tasks. */
    requestRestore(taskId: string): boolean;
    dispose(): void;
}
/**
 * undefined / empty = show every group; one or more = show only those groups.
 * The returned reference is stable for the lifetime of the snapshot.
 */
export declare function selectBackgroundTasks(snapshot: BackgroundTaskSnapshot, groups?: readonly string[]): readonly BackgroundTaskRecord[];
export declare function createBackgroundTaskEventBus(): BackgroundTaskEventBus;
export declare function claimBackgroundTasks(create: () => BackgroundTaskPool): BackgroundTaskPool;
export declare function claimBackgroundTaskEvents(create: () => BackgroundTaskEventBus): BackgroundTaskEventBus;
export declare function createBackgroundTaskPool(options?: BackgroundTaskPoolOptions): BackgroundTaskPool;
export declare const backgroundTasks: BackgroundTaskPool;
export declare const backgroundTaskEvents: BackgroundTaskEventBus;
export declare function subscribeBackgroundTaskEvents(listener: BackgroundTaskEventListener): () => void;
export declare function emitBackgroundTaskEvent(event: BackgroundTaskEvent): void;
//# sourceMappingURL=background-tasks.d.ts.map