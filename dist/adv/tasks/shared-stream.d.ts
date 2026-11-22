/**
 * 同源跨标签 task SSE 单飞协调器。
 *
 * 工业界对标：`sse-coordinator@0.3.2`（Web Locks 排他锁 + 锁回调挂长 Promise、
 * BroadcastChannel 扇出、visibility/online 恢复、cleanup 一次收干净）。在此骨架上
 * 补本项目正确性必需项：Lamport 逻辑届（全序可比较）、单调 seq + 缺口重拉、
 * owner-ready 基线握手、session 级 notice 缓存、permanent giveUp 的 halted/resume。
 *
 * 核心不变量（本版）：
 *   Epoch      —— Lamport 届 {tick,id}，全序可比较；只有「更新」的届能安装，旧届任何消息被挡。
 *                 随机 epoch 无法比较新旧，是「新主 reply 被旧届校验拒绝→follower 永久脱节」的根因。
 *   signal     —— 纯 hint：只触发重拉基线，绝不改 currentEpoch/seenSeq。
 *   state-reply —— 唯一权威安装入口：带 owner 的届 + seq + tasks + notices。
 *   Session    —— 协调器实例整个寿命；controller 只在 dispose() 时 abort；noticeCache 在 session 级。
 *   Lease      —— 一次持锁届；giveUp / watchdog / lifetime / pagehide 只 endLease() 让出锁。
 *   halted     —— permanent giveUp（401）置位：让出锁、停重申请，等 recover/resume 唤醒。
 *
 * 协议 v2：届从 string 改为 Lamport 对象，锁/通道前缀同步升 v2，与旧版本物理隔离
 * （旧标签继续用 v1 各自单飞，刷新后自愈，不会出现新旧混用同一通道的死锁）。
 * 零 DOM at import time：navigator / BroadcastChannel / performance 只在函数内惰性读取。
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
    /** 可选：页面当前是否可见。visibilitychange 隐藏时也触发，只有可见时才能 recover（#7）。 */
    readonly isVisible?: () => boolean;
}
/** 连接句柄：可调用释放；resume 供 permanent giveUp 后显式恢复（刷新凭证）。 */
export interface SharedStreamHandle {
    (): void;
    resume(): void;
}
/**
 * 加入同源单飞。返回 disposer：只释放本标签持有的引用，不替别的标签关流。
 * `connectTaskCenter` 负责按 streamUrl 幂等 + refcount，这里每个实例就是一条引用。
 */
export declare function connectSharedTaskStream(options: SharedStreamOptions): SharedStreamHandle;
//# sourceMappingURL=shared-stream.d.ts.map