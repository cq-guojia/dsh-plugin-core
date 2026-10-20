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
/** 宿主 `webServer` 服务的最小面（WebRoute 形状）。 */
export interface HostWebServerLike {
    register: (route: {
        kind: 'exact' | 'prefix';
        path: string;
        handler: (req: {
            url?: string;
        }, res: {
            writeHead: (status: number, headers: Record<string, string>) => void;
            end: (body: string) => void;
        }) => void | Promise<void>;
    }) => unknown;
}
/** 插件宿主 ctx 的最小面。 */
export interface HostContextLike {
    inject: (deps: string[], cb: (services: Record<string, unknown>) => void) => void;
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
/**
 * 注册模型目录路由（插件宿主 `apply` 里调一次）。
 *
 * @param ctx 插件宿主 ctx（`llm` / `webServer` 两条注入线，缺任一条就不注册）。
 * @param options.path 路由路径，客户端要用**同一个常量**去 fetch（如 `/api/x/models`）。
 */
export declare function serveModelCatalog(ctx: HostContextLike, options: {
    path: string;
}): void;
//# sourceMappingURL=index.d.ts.map