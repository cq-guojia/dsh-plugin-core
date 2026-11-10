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
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
/**
 * 注册模型目录路由（插件宿主 `apply` 里调一次）。
 *
 * 只声明 `webServer` 一条注入线：`webServer` 是宿主必启服务，而 `llm` 可能晚挂载、或这份
 * 组合里根本没有 —— 把它写进 `ctx.inject` 的依赖会让回调永远不触发、路由直接不注册
 * （cordis `inject` = 声明依赖，齐了才 apply）。`llm` 改为每个请求用 `ctx.get('llm')`
 * 惰性现取（未挂载返回 undefined、不抛），取不到回 503，客户端据此显示降级提示。
 */
export function serveModelCatalog(ctx, options) {
    ctx.inject(['webServer'], (services) => {
        const webServer = services.webServer;
        if (webServer === undefined)
            return;
        webServer.register({
            kind: 'exact',
            path: options.path,
            handler: async (req, res) => {
                if (options.authorize !== undefined && !(await options.authorize(req))) {
                    res.writeHead(403, JSON_HEADERS);
                    res.end(JSON.stringify({ error: 'forbidden' }));
                    return;
                }
                const llm = options.getLlm?.() ?? ctx.get?.('llm');
                if (llm === undefined) {
                    res.writeHead(503, JSON_HEADERS);
                    res.end(JSON.stringify({ routes: [], error: 'llm-unavailable' }));
                    return;
                }
                try {
                    const routes = await buildModelRoutes(llm);
                    res.writeHead(200, JSON_HEADERS);
                    res.end(JSON.stringify({ routes }));
                }
                catch (error) {
                    // listProviders 抛错时也要自己收口：宿主对「发头后抛错」会直接 destroy 连接。
                    res.writeHead(500, JSON_HEADERS);
                    res.end(JSON.stringify({ routes: [], error: String(error) }));
                }
            },
        });
    });
}
export { serveFsRoute, FS_PAGE_LIMIT, normalizeAbsPath } from './fs-route.js';
//# sourceMappingURL=index.js.map