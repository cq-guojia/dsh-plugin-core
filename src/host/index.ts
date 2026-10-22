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
  listProviders: () => readonly { id: string; name: string }[]
  /** 某 provider 可发现的模型，按适配器偏好序（异步）。 */
  listModels: (provider: string) => Promise<readonly { id: string; name?: string }[]>
}

/** 宿主 `webServer` 服务的最小面（WebRoute 形状）。 */
export interface HostWebServerLike {
  register: (route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: { url?: string }, res: { writeHead: (status: number, headers: Record<string, string>) => void; end: (body: string) => void }) => void | Promise<void>
  }) => unknown
}

/**
 * 宿主 `workspaceRegistry` 服务的最小面（只要归档 id）。
 * 事实（dsh-capabilities.md，0.2.0-rc.2 线）：`archiveSession(id)` 只把 id 追加进
 * 实体的 `archivedSessionIds`（显示面隐藏名单，不动 `sessionIds` 槽位）；client 侧
 * **读不到**这个集合（官方 UiWorkspace 公开面只有导航 / 归档 / 解归档写操作，
 * 归档 id 集合在官方 UI 内部注入 shares 里）⇒ 要「已归档」标识就得走宿主侧路由。
 */
export interface HostWorkspaceRegistryLike {
  list: () => readonly { id: string; archivedSessionIds?: readonly string[] }[]
}

/** 插件宿主 ctx 的最小面。 */
export interface HostContextLike {
  inject: (deps: string[], cb: (services: Record<string, unknown>) => void) => void
}

/** 一条路由：一个供应商 + 它的模型。 */
export interface ModelRouteData {
  provider: string
  displayName: string
  models: { id: string; name?: string }[]
}

/**
 * 现查一遍「供应商 → 模型」目录（单个 provider 列不出来就跳过它，不影响其它家）。
 * 导出是为了单测与「不用 HTTP 也要这份数据」的宿主场景。
 */
export async function buildModelRoutes(llm: HostLlmLike): Promise<ModelRouteData[]> {
  const routes: ModelRouteData[] = []
  for (const provider of llm.listProviders()) {
    try {
      const models = await llm.listModels(provider.id)
      if (models.length === 0) continue
      routes.push({
        provider: provider.id,
        displayName: provider.name,
        models: models.map((model) => (model.name === undefined ? { id: model.id } : { id: model.id, name: model.name })),
      })
    } catch {
      // 该 provider 列不出模型（没配 key / 端点不可达）：跳过，不整表失败
    }
  }
  routes.sort((left, right) => left.displayName.localeCompare(right.displayName))
  return routes
}

/**
 * 注册模型目录路由（插件宿主 `apply` 里调一次）。
 *
 * @param ctx 插件宿主 ctx（`llm` / `webServer` 两条注入线，缺任一条就不注册）。
 * @param options.path 路由路径，客户端要用**同一个常量**去 fetch（如 `/api/x/models`）。
 */
export function serveModelCatalog(ctx: HostContextLike, options: { path: string }): void {
  ctx.inject(['llm', 'webServer'], (services) => {
    const llm = services.llm as HostLlmLike | undefined
    const webServer = services.webServer as HostWebServerLike | undefined
    if (llm === undefined || webServer === undefined) return
    webServer.register({
      kind: 'exact',
      path: options.path,
      handler: async (_req, res) => {
        const routes = await buildModelRoutes(llm)
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ routes }))
      },
    })
  })
}

/** 全部工作区的归档会话 id 合并去重（宿主没给 archivedSessionIds 时为空数组）。 */
export function collectArchivedSessionIds(registry: HostWorkspaceRegistryLike): string[] {
  const out = new Set<string>()
  for (const entity of registry.list()) {
    for (const id of entity.archivedSessionIds ?? []) out.add(id)
  }
  return [...out]
}

/**
 * 注册「已归档会话 id 集合」路由（插件宿主 `apply` 里调一次）。
 *
 * 为什么走宿主：client 侧读不到归档集合（见 HostWorkspaceRegistryLike 注释）⇒ 与模型
 * 目录同模式，宿主取数挂只读路由，client fetch。会话预览据此分化「继续对话」行为：
 * 已归档 = 开分支确认框；未归档 = 直跳官方会话页。
 *
 * @param ctx 插件宿主 ctx（`workspaceRegistry` / `webServer` 两条注入线，缺任一就不注册）。
 * @param options.path 路由路径，客户端要用**同一个常量**去 fetch（如 `/api/x/archived-sessions`）。
 */
export function serveArchivedSessions(ctx: HostContextLike, options: { path: string }): void {
  ctx.inject(['workspaceRegistry', 'webServer'], (services) => {
    const registry = services.workspaceRegistry as HostWorkspaceRegistryLike | undefined
    const webServer = services.webServer as HostWebServerLike | undefined
    if (registry === undefined || typeof registry.list !== 'function' || webServer === undefined) return
    webServer.register({
      kind: 'exact',
      path: options.path,
      handler: (_req, res) => {
        const archived = collectArchivedSessionIds(registry)
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ archived }))
      },
    })
  })
}
