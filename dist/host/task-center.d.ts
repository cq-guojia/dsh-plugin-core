/**
 * 服务端权威任务中心的宿主路由装配。
 *
 * 宿主不做 server-wide 鉴权（docs/dependencies/dsh-host.md §11.1.1），所以这里
 * **强制**提供 authorize；缺省即抛，不允许裸奔路由。持久化、判死、TTL、scope
 * 归属都由消费方的 TaskCenterStore 负责，本文件只做 HTTP 形状转换。
 */
import type { HostContextLike, HostHttpRequest } from './index.js';
import type { AckRequest, InvokeRequest, ServerCreateInput, ServerNoticePage, ServerTaskEvent, ServerTaskPage, ServerTaskRecord } from '../adv/tasks/authoritative.js';
export interface TaskCenterStore {
    create(input: ServerCreateInput, viewer?: string): Promise<{
        created: boolean;
        record: ServerTaskRecord;
    }>;
    list(project: string, cursor?: string, viewer?: string): Promise<ServerTaskPage>;
    /** 通道 B：未确认的终态通知，notificationId 与 cursor 由服务端生成且稳定。 */
    listNotices(projects: readonly string[], sinceCursor: string | undefined, viewer?: string): Promise<ServerNoticePage>;
    ackNotices(projects: readonly string[], cursor: string, viewer?: string): Promise<void>;
    invoke(request: InvokeRequest, viewer?: string): Promise<{
        ok: boolean;
        result?: unknown;
        reason?: string;
    }>;
    ack(request: AckRequest, viewer?: string): Promise<void>;
    /** 订阅增量；viewer 由服务端鉴权得出，回调里必须按它过滤归属。 */
    subscribe(listener: (project: string, event: ServerTaskEvent) => void, viewer?: string): () => void;
}
export interface TaskCenterRouteOptions {
    readonly basePath: string;
    /**
     * 强制鉴权：返回 viewer 标识；返回 null / 抛错即拒绝。
     * 不传直接抛——这是本模块的硬门槛，不是可选项。
     */
    readonly authorize: (req: HostHttpRequest) => string | null | Promise<string | null>;
    readonly store: TaskCenterStore;
}
export declare function serveTaskCenter(ctx: HostContextLike, options: TaskCenterRouteOptions): () => void;
//# sourceMappingURL=task-center.d.ts.map