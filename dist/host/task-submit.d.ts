/**
 * 后台任务的提交端点：client 把「发起请求」POST 到这里，服务端建任务并异步执行。
 *
 * 与 serveTaskStream 成对：submit 负责「前端 → 服务端」的写入，stream 负责
 * 「服务端 → 前端」的状态投影。两条合起来，刷新页面后任务仍在服务端继续跑，
 * 客户端重连 SSE 从基线恢复显示（worklog 2026-11-18 第 140 行口径）。
 *
 * 宿主 webServer 不做 server-wide 鉴权，authorize 强制必填。
 */
import type { HostContextLike } from './index.js';
export interface TaskSubmitOptions {
    readonly path: string;
    readonly authorize: (req: {
        headers?: Record<string, string | string[] | undefined>;
    }) => boolean | Promise<boolean>;
    /** 收到提交请求：payload 是 client startTask 的纯数据；返回任务 id（幂等由服务端负责）。 */
    readonly onSubmit: (payload: Readonly<Record<string, unknown>>) => string | Promise<string>;
}
export declare function serveTaskSubmit(ctx: HostContextLike, options: TaskSubmitOptions): () => void;
//# sourceMappingURL=task-submit.d.ts.map