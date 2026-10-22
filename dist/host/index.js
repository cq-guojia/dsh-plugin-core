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
/**
 * 现查一遍「供应商 → 模型」目录（单个 provider 列不出来就跳过它，不影响其它家）。
 * 导出是为了单测与「不用 HTTP 也要这份数据」的宿主场景。
 */
export async function buildModelRoutes(llm) {
    const routes = [];
    for (const provider of llm.listProviders()) {
        try {
            const models = await llm.listModels(provider.id);
            if (models.length === 0)
                continue;
            routes.push({
                provider: provider.id,
                displayName: provider.name,
                models: models.map((model) => (model.name === undefined ? { id: model.id } : { id: model.id, name: model.name })),
            });
        }
        catch {
            // 该 provider 列不出模型（没配 key / 端点不可达）：跳过，不整表失败
        }
    }
    routes.sort((left, right) => left.displayName.localeCompare(right.displayName));
    return routes;
}
/**
 * 注册模型目录路由（插件宿主 `apply` 里调一次）。
 *
 * @param ctx 插件宿主 ctx（`llm` / `webServer` 两条注入线，缺任一条就不注册）。
 * @param options.path 路由路径，客户端要用**同一个常量**去 fetch（如 `/api/x/models`）。
 */
export function serveModelCatalog(ctx, options) {
    ctx.inject(['llm', 'webServer'], (services) => {
        const llm = services.llm;
        const webServer = services.webServer;
        if (llm === undefined || webServer === undefined)
            return;
        webServer.register({
            kind: 'exact',
            path: options.path,
            handler: async (_req, res) => {
                const routes = await buildModelRoutes(llm);
                res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ routes }));
            },
        });
    });
}
//# sourceMappingURL=index.js.map