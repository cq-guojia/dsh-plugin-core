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

/**
 * 宿主 `webServer` 交给 handler 的原始 Node 请求的结构化子集。
 * 官方 `WebRoute.handler` 收的是 `IncomingMessage`（docs/design/external/dsh-host.md §11.1.1），
 * 宿主不做 server-wide 鉴权、闸门由路由方自持 ⇒ 这里必须留出 headers / socket，
 * 否则消费方连自己的同源守卫都接不上。
 */
export interface HostHttpRequest {
  url?: string
  method?: string
  headers?: Record<string, string | string[] | undefined>
  socket?: { remoteAddress?: string }
}

/** 宿主 `webServer` 服务的最小面（WebRoute 形状）。 */
export interface HostWebServerLike {
  register: (route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: HostHttpRequest, res: { writeHead: (status: number, headers: Record<string, string>) => void; end: (body: string) => void }) => void | Promise<void>
  }) => unknown
}

/** 插件宿主 ctx 的最小面。 */
export interface HostContextLike {
  inject: (deps: string[], cb: (services: Record<string, unknown>) => void) => void
  /** cordis `ctx.get(name)`：惰性读服务，未挂载返回 undefined 且不抛；不需要 inject 声明。 */
  get?: (name: string, strict?: boolean) => unknown
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

/** `serveModelCatalog` 的可选策略：宿主不做 server-wide 鉴权，闸门由路由方自持。 */
export interface ModelCatalogOptions {
  /** 路由路径，客户端要用**同一个常量**去 fetch（如 `/api/x/models`）。 */
  path: string
  /** 请求闸门：返回 false ⇒ 403。不传 = 沿用宿主既有边界，由消费方自行负责。 */
  authorize?: (req: HostHttpRequest) => boolean | Promise<boolean>
  /** 惰性取 `llm` 的覆盖口：默认走 cordis `ctx.get('llm')`。 */
  getLlm?: () => HostLlmLike | undefined
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' }

/**
 * 注册模型目录路由（插件宿主 `apply` 里调一次）。
 *
 * 只声明 `webServer` 一条注入线：`webServer` 是宿主必启服务，而 `llm` 可能晚挂载、或这份
 * 组合里根本没有 —— 把它写进 `ctx.inject` 的依赖会让回调永远不触发、路由直接不注册
 * （cordis `inject` = 声明依赖，齐了才 apply）。`llm` 改为每个请求用 `ctx.get('llm')`
 * 惰性现取（未挂载返回 undefined、不抛），取不到回 503，客户端据此显示降级提示。
 */
export function serveModelCatalog(ctx: HostContextLike, options: ModelCatalogOptions): void {
  ctx.inject(['webServer'], (services) => {
    const webServer = services.webServer as HostWebServerLike | undefined
    if (webServer === undefined) return
    webServer.register({
      kind: 'exact',
      path: options.path,
      handler: async (req, res) => {
        if (options.authorize !== undefined && !(await options.authorize(req))) {
          res.writeHead(403, JSON_HEADERS)
          res.end(JSON.stringify({ error: 'forbidden' }))
          return
        }
        const llm = options.getLlm?.() ?? (ctx.get?.('llm') as HostLlmLike | undefined)
        if (llm === undefined) {
          res.writeHead(503, JSON_HEADERS)
          res.end(JSON.stringify({ routes: [], error: 'llm-unavailable' }))
          return
        }
        try {
          const routes = await buildModelRoutes(llm)
          res.writeHead(200, JSON_HEADERS)
          res.end(JSON.stringify({ routes }))
        } catch (error) {
          // listProviders 抛错时也要自己收口：宿主对「发头后抛错」会直接 destroy 连接。
          res.writeHead(500, JSON_HEADERS)
          res.end(JSON.stringify({ routes: [], error: String(error) }))
        }
      },
    })
  })
}

export { serveFsRoute, FS_PAGE_LIMIT, normalizeAbsPath } from './fs-route.js'
export type { FsRouteEntry, FsRouteListing } from './fs-route.js'
