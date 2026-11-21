/**
 * 后台任务的客户端 SSE 订阅。
 *
 * 只用 fetch / AbortController（浏览器与 Node 18+ 都有），不碰任何宿主模块。
 * 断线退避重连。三条 event 分流（用户 2026-11-19，参照 ledger 的通道 A/B 不变量）：
 *   - `task-snapshot`（基线）/ `task`（状态增量）→ onTask：只投影列表，**不弹卡**。
 *   - `task-notice`（一次性完成通知）→ onNotice：只有它弹卡，客户端按 notice.id 持久去重。
 * 状态可安全重放；通知的一次性由服务端 id + 客户端持久去重保证，不靠 event 名猜新旧。
 */
/** 放弃连接的原因：status=0 网络故障；permanent=true 为不可重试（如 401，需刷新凭证后显式重连）。 */
export interface TaskStreamGiveUpReason {
    readonly status: number;
    readonly permanent: boolean;
}
export interface TaskStreamOptions {
    /** 路由根，如 `/api/task-center`（服务端 serveTaskStream 的 basePath + /stream）。 */
    readonly streamUrl: string;
    /** 状态投影（基线快照 + 实时增量）：交给 coordinator 投影进 store，不弹卡。 */
    readonly onTask: (task: unknown, snapshot: boolean) => void;
    /** 一次性完成通知：只有它触发 toast / notify。 */
    readonly onNotice?: (notice: unknown) => void;
    readonly headers?: () => Record<string, string>;
    readonly fetchImpl?: typeof fetch;
    /**
     * 重连退避档（毫秒），默认 1s/2s/4s。用完即放弃——不再无限重连：
     * 服务端持续故障或鉴权失效时无限退避只会空刷请求、且不给人任何信号。
     */
    readonly retryDelaysMs?: readonly number[];
    /** 收到任意响应字节（含保活注释帧）时回调——供上层判活，不解析内容。 */
    readonly onAlive?: () => void;
    /** 放弃连接时回调（退避次数用尽 / 不可重试错误）。401 用它触发 token 刷新后显式重连。 */
    readonly onGiveUp?: (reason: TaskStreamGiveUpReason) => void;
}
export interface TaskStreamConnection {
    /** 主动断开（页面卸载时调）。 */
    close(): void;
}
/**
 * 解析一段 SSE buffer，返回剩余未完整帧。三类 event 分流：
 * `task-snapshot` → onTask(_, true)；`task` → onTask(_, false)；`task-notice` → onNotice。
 * 坏帧（畸形 JSON）与消费方回调异常都只影响该帧：丢掉继续，绝不拆掉整条流——
 * 否则一条坏基线会让客户端每次重连都在同一处抛错，永远收不到好任务。
 */
export declare function parseTaskFrames(buffer: string, onTask: (task: unknown, snapshot: boolean) => void, onNotice?: (notice: unknown) => void): string;
export declare function connectTaskStream(options: TaskStreamOptions): TaskStreamConnection;
//# sourceMappingURL=stream.d.ts.map