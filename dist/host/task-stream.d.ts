/**
 * 后台任务的 SSE 推送端点（新体系）。
 *
 * 服务端是状态真源：任务执行、进度推进、终态判定都在服务端。三条流物理隔离（用户 2026-11-19
 * 定，参照 ledger 的通道 A/B 不变量）：
 *   - 快照 `event: task-snapshot`：全量历史，只恢复列表 / 行按钮，**永不弹卡**。
 *   - 状态 `event: task`：连接期间的进度 / 终态投影，只更新列表，**永不弹卡**。
 *   - 通知 `event: task-notice`：终态跃迁那一刻的一次性事件（带 id），**只有它弹卡**。
 * 这样状态可任意重放（刷新 / 重连 / 基线）都不会重弹；通知是一次性事件，客户端按 id 持久去重。
 *
 * 宿主 webServer 不提供 server-wide 鉴权（dsh-host.md §11.1.1），所以 authorize 强制必填。
 */
import type { HostContextLike, HostHttpRequest } from './index.js';
import type { TaskNotice, TaskRecord } from '../adv/tasks/model.js';
/**
 * 服务端任务源：状态流（基线 + 订阅）与通知流（一次性事件）分开提供。
 * viewer 由鉴权得出，归属过滤在服务端做。
 */
export interface TaskStreamSource {
    /** 一次性基线：当前所有可见任务（含历史终态）；只用于恢复列表，不弹卡。 */
    snapshot(viewer: string): Promise<readonly TaskRecord[]> | readonly TaskRecord[];
    /** 订阅状态变更（整条 TaskRecord 的 upsert：进度 / 终态）；只更新列表，不弹卡。 */
    subscribe(listener: (task: TaskRecord) => void, viewer: string): () => void;
    /**
     * 订阅一次性完成通知。source 应在订阅时回放 outbox 里未过期的通知（断线期间结算的），
     * 之后每次终态跃迁再推一条；客户端按 notice.id 持久去重，重推也不会重复弹。
     * 不提供 = 该服务端选择不弹卡（纯状态投影）。
     */
    subscribeNotices?(listener: (notice: TaskNotice) => void, viewer: string): () => void;
}
export interface TaskStreamOptions {
    readonly basePath: string;
    readonly authorize: (req: HostHttpRequest) => string | null | Promise<string | null>;
    readonly source: TaskStreamSource;
    /** SSE 保活注释帧间隔（毫秒），默认 25000；只保活连接，不是业务心跳。 */
    readonly keepAliveMs?: number;
}
export declare function serveTaskStream(ctx: HostContextLike, options: TaskStreamOptions): () => void;
//# sourceMappingURL=task-stream.d.ts.map