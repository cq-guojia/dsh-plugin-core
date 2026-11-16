/**
 * 服务端权威任务的 HTTP transport。
 *
 * 核心不直连任何宿主模块：这里只用 fetch / AbortController（Node 18+ 与浏览器都有），
 * 路由由消费方用 `webServer.register` 挂出。长连接按既定前提使用，不做轮询降级。
 */
import type { TaskBackend } from './authoritative.js';
export interface HttpTaskBackendOptions {
    /** 路由根，如 `/api/task-center`。 */
    readonly basePath: string;
    /** 额外请求头；鉴权由消费方在服务端强制，这里只负责带过去。 */
    readonly headers?: () => Record<string, string>;
    readonly fetchImpl?: typeof fetch;
}
export declare function createHttpTaskBackend(options: HttpTaskBackendOptions): TaskBackend;
//# sourceMappingURL=http-backend.d.ts.map