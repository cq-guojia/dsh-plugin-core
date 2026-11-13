/**
 * 宿主侧数据面：把「供应商 → 模型」目录挂成一条只读 HTTP 路由，供 client 侧自取。
 *
 * 为什么必须走宿主侧（2026-10-20 真机定位）：client 的 `remote.llm` 命名空间只有
 * `listProviders` / `listConfigurableProviders`，**没有每个 provider 的模型列表**；
 * 模型只能宿主侧 `llm.listModels(providerId)` 取（兄弟仓 dsh-task-dispatch-table
 * `src/dispatch.ts:81-88` 同口径）。之前照抄「读设置镜像 profile.models」的路子在
 * demo 里读不出任何供应商，已废弃。
 *
 * ⚠️ 本文件是 Node 侧入口：**不得** import React / DOM。零 `@deepseek-ai/*` 运行时依赖，
 * 宿主面一律结构化声明（同兄弟仓红线）。
 */
/** 宿主 `llm` 服务的最小面（0.1.x 实测形状）。 */
export interface HostLlmLike {
    /** 已注册 provider，按注册序（同步）。 */
    listProviders: () => readonly {
        id: string;
        name: string;
    }[];
    /** 某 provider 可发现的模型，按适配器偏好序（异步）。 */
    listModels: (provider: string) => Promise<readonly {
        id: string;
        name?: string;
    }[]>;
}
/**
 * 宿主 `webServer` 交给 handler 的原始 Node 请求的结构化子集。
 * 官方 `WebRoute.handler` 收的是 `IncomingMessage`（docs/dependencies/dsh-host.md §11.1.1），
 * 宿主不做 server-wide 鉴权、闸门由路由方自持 ⇒ 这里必须留出 headers / socket，
 * 否则消费方连自己的同源守卫都接不上。
 */
export interface HostHttpRequest {
    url?: string;
    method?: string;
    headers?: Record<string, string | string[] | undefined>;
    socket?: {
        remoteAddress?: string;
    };
}
/** 宿主 `webServer` 服务的最小面（WebRoute 形状）。 */
export interface HostWebServerLike {
    register: (route: {
        kind: 'exact' | 'prefix';
        path: string;
        handler: (req: HostHttpRequest, res: {
            writeHead: (status: number, headers: Record<string, string>) => void;
            end: (body: string) => void;
        }) => void | Promise<void>;
    }) => unknown;
}
/** 插件宿主 ctx 的最小面。 */
export interface HostContextLike {
    inject: (deps: string[], cb: (services: Record<string, unknown>) => void) => void;
    /** cordis `ctx.get(name)`：惰性读服务，未挂载返回 undefined 且不抛；不需要 inject 声明。 */
    get?: (name: string, strict?: boolean) => unknown;
}
/** 一条路由：一个供应商 + 它的模型。 */
export interface ModelRouteData {
    provider: string;
    displayName: string;
    models: {
        id: string;
        name?: string;
    }[];
}
/**
 * 现查一遍「供应商 → 模型」目录（单个 provider 列不出来就跳过它，不影响其它家）。
 * 导出是为了单测与「不用 HTTP 也要这份数据」的宿主场景。
 */
export declare function buildModelRoutes(llm: HostLlmLike): Promise<ModelRouteData[]>;
/** `serveModelCatalog` 的可选策略：宿主不做 server-wide 鉴权，闸门由路由方自持。 */
export interface ModelCatalogOptions {
    /** 路由路径，客户端要用**同一个常量**去 fetch（如 `/api/x/models`）。 */
    path: string;
    /** 请求闸门：返回 false ⇒ 403。不传 = 沿用宿主既有边界，由消费方自行负责。 */
    authorize?: (req: HostHttpRequest) => boolean | Promise<boolean>;
    /** 惰性取 `llm` 的覆盖口；不传则退回 cordis `ctx.get('llm')`（核心已收口，ctx 失活按不可用处理）。 */
    getLlm?: () => HostLlmLike | undefined;
}
/**
 * 注册模型目录路由（插件宿主 `apply` 里调一次）。
 *
 * 只声明 `webServer` 一条注入线：`webServer` 是宿主必启服务，而 `llm` 可能晚挂载、或这份
 * 组合里根本没有 —— 把它写进 `ctx.inject` 的依赖会让回调永远不触发、路由直接不注册
 * （cordis `inject` = 声明依赖，齐了才 apply）。`llm` 改为每个请求惰性现取：未挂载返回
 * undefined，ctx 失活抛错由 {@link resolveLlm} 收口，两种都回 503，客户端据此显示降级提示。
 */
export declare function serveModelCatalog(ctx: HostContextLike, options: ModelCatalogOptions): void;
export { serveFsRoute, FS_PAGE_LIMIT, normalizeAbsPath } from './fs-route.js';
export type { FsRouteEntry, FsRouteListing } from './fs-route.js';
//# sourceMappingURL=index.d.ts.map