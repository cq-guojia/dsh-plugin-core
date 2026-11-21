/**
 * 同源跨标签 task SSE 单飞协调器。
 *
 * N 个标签各开一条常驻 SSE 会耗尽 http/1.1 每域 6 连接上限，宿主自己的请求全在浏览器排队。
 * 这里让同源所有标签共用一条：Web Locks 选一个 owner 建真 SSE，帧经 BroadcastChannel
 * 扇出给其它标签；owner 关闭 / 崩溃 / 失联后锁释放，等待者自动成为新 owner。
 *
 * 设计不变量：
 *   - 零 DOM at import time：navigator / BroadcastChannel 只在函数内惰性读取，Node 可直接 import。
 *   - 锁名 / 通道名只含协议版本 + streamUrl 命名空间（**不含 headers**，token 刷新不得击穿单飞）。
 *   - 帧带 epoch + 单调 seq：切主后的迟到旧帧丢弃；seq 缺口触发全量基线重拉。
 *   - 基线补齐靠 state-request/state-reply；owner 未 ready 时回 ready=false，绝不把空基线当权威。
 *   - notice 有界缓存含 outbox 回放批次，随 state-reply 补齐；回放批次不逐条广播，只发一次轻量信号。
 *   - 生命周期：AbortSignal + pagehide/freeze/onGiveUp/断流立即释放锁；pageshow(persisted) 重建 session。
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
    /** 注入点：测试用内存锁 / 通道；不传则惰性取 navigator.locks / BroadcastChannel。 */
    readonly lockFactory?: SharedLockFactory;
    readonly channelFactory?: SharedChannelFactory;
    /** owner 的全量任务快照来源（取 taskStore.getSnapshot().tasks）。 */
    readonly getState: () => readonly unknown[];
    /** follower 收到基线后应用（mergeBaseline：只填本地不存在的 key）。 */
    readonly applyBaseline: (tasks: readonly unknown[]) => void;
    /** 页面生命周期监听的宿主；不传则不挂（Node / 测试）。 */
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