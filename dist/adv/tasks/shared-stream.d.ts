/**
 * 同源跨标签 task SSE 单飞协调器。
 *
 * 工业界对标：`sse-coordinator@0.3.2`（Web Locks 排他锁 + 锁回调挂长 Promise、
 * BroadcastChannel 扇出、visibility/online 恢复、cleanup 一次收干净）。在此骨架上
 * 补本项目正确性必需项：随机届 epoch（相等比较，不依赖挂钟）、单调 seq + 缺口重拉、
 * owner-ready 基线握手、有界 notice 缓存（含 outbox 回放批次）。
 *
 * 两级生命周期（本版核心不变量）：
 *   Session —— 一个协调器实例的整个寿命；controller 只在 dispose() 时 abort。
 *   Lease   —— 一次持锁届；giveUp / watchdog / lifetime / pagehide 只 endLease()
 *               （让出锁），run loop 退避后自动重申请，绝不 abort session。
 *               因此断流不会永久离线，bfcache 恢复无需重建 session。
 *
 * 零 DOM at import time：navigator / BroadcastChannel / crypto / performance 只在函数内惰性读取。
 */
import { type TaskStreamGiveUpReason } from './stream.js';
/** 锁 / 通道的最小形状：浏览器原生即满足；测试注入内存实现。 */
export interface SharedLockLike {
    readonly signal: AbortSignal;
}
export interface SharedLockManager {
    request(name: string, options: {
        signal: AbortSignal;
    }, callback: (lock: SharedLockLike) => Promise<void>): Promise<void>;
}
export interface SharedChannelLike {
    postMessage(data: unknown): void;
    onmessage: ((event: {
        data: unknown;
    }) => void) | null;
    close(): void;
}
export type SharedChannelFactory = (name: string) => SharedChannelLike | null;
export type SharedLockFactory = () => SharedLockManager | null;
export interface SharedStreamOptions {
    readonly streamUrl: string;
    readonly onTask: (task: unknown, snapshot: boolean) => void;
    readonly onNotice?: (notice: unknown) => void;
    readonly headers?: () => Record<string, string>;
    readonly retryDelaysMs?: readonly number[];
    readonly onGiveUp?: (reason: TaskStreamGiveUpReason) => void;
    /** 测试注入内存锁 / 通道；不传则惰性取 navigator.locks / BroadcastChannel。 */
    readonly lockFactory?: SharedLockFactory;
    readonly channelFactory?: SharedChannelFactory;
    /** owner 的全量任务快照来源（taskStore.getSnapshot().tasks）。 */
    readonly getState: () => readonly unknown[];
    /** follower 收到基线后应用（幂等合并）。 */
    readonly applyBaseline: (tasks: readonly unknown[]) => void;
    /**
     * 页面生命周期监听宿主。实现方负责把 document 事件（freeze/resume/
     * visibilitychange）与 window 事件（pagehide/pageshow/online）路由到正确目标。
     * 不传则不挂（Node / 测试）。
     */
    readonly lifecycle?: SharedLifecycle;
}
export interface SharedLifecycle {
    addEventListener(type: string, listener: (...args: never[]) => void): void;
    removeEventListener(type: string, listener: (...args: never[]) => void): void;
}
/**
 * 加入同源单飞。返回 disposer：只释放本标签持有的引用，不替别的标签关流。
 * `connectTaskCenter` 负责按 streamUrl 幂等 + refcount，这里每个实例就是一条引用。
 */
export declare function connectSharedTaskStream(options: SharedStreamOptions): () => void;
//# sourceMappingURL=shared-stream.d.ts.map