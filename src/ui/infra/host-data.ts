/**
 * 领域选择器的宿主数据面 —— ModelPicker / WorkspacePicker 的「现成数据」。
 *
 * 用户 2026-10-20 拍板：这两个领域选择器**自己取数、自己显示**，消费方不再传数组
 * （反转 requirements §6 对领域选择器的旧口径；通用 `Picker` 仍是 props 进数据的纯零件）。
 *
 * 两条数据通路（均为真机验证过的口子）：
 * - 工作区：宿主 client 服务 `workspaces` 的快照（getSnapshot + subscribe，follow 流实时更新）。
 * - 模型目录：**插件宿主侧** `llm.listModels()` 现查 → `serveModelCatalog()` 挂成只读路由 →
 *   客户端 fetch（`@deepseek-ai/*` 的 `remote.llm` 只有 listProviders，**拿不到每个供应商的
 *   模型列表**，2026-10-20 真机定位后弃用该路径）。
 *
 * 接线：宿主 `apply` 调 `serveModelCatalog(ctx, { path })`，客户端 `apply` 调
 * `connectHost(ctx, { modelsPath: path })`——同一个 path 常量，消费方不碰数据本身。
 *
 * 2026-10-28 扩一条：`connectHost` 同时接 `remote.workspaceFiles` ⇒ `openFilePreview` /
 * `pickWorkspaceFile` 不必再由调用方传服务（explorer 的读文件通道同属「绑定宿主能力」）。
 *
 * 2026-11-04 归档态：同一份 `workspaces` 快照里的 `archivedSessionIds` 也由核心镜像，
 * 会话预览不再收调用方注入的静态 boolean（官方推送链见 dsh-host.md §11.2）。
 */
import type { WorkspaceFilesFace } from '../../adv/explorer/types.js'

// ── 模型目录 ────────────────────────────────────────────────────────────

/** 一条路由：一个供应商 + 它的模型（与宿主侧 `ModelRouteData` 同形）。 */
export interface ModelRoute {
  provider: string
  displayName: string
  models: readonly { id: string; name?: string }[]
}

export type ModelCatalogState =
  | { status: 'loading' }
  | { status: 'unavailable'; reason: string }
  | { status: 'ready'; routes: readonly ModelRoute[] }

/** 模型目录的 observable store（useSyncExternalStore 直接消费）。 */
class ModelCatalogStore {
  private snapshot: ModelCatalogState = { status: 'loading' }
  private readonly listeners = new Set<() => void>()

  readonly getSnapshot = (): ModelCatalogState => this.snapshot

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private update(next: ModelCatalogState): void {
    this.snapshot = next
    for (const listener of this.listeners) listener()
  }

  setRoutes(routes: readonly ModelRoute[]): void {
    this.update({ status: 'ready', routes })
  }

  setUnavailable(reason: string): void {
    this.update({ status: 'unavailable', reason })
  }
}

/** 模型目录单例（ModelPicker 消费；connectHost 负责喂）。 */
export const modelCatalog = new ModelCatalogStore()

// ── 工作区列表 ──────────────────────────────────────────────────────────

/** 官方 `workspaces` client 服务 `list` 的一行（`WorkspaceView` 的消费子集，见 docs/design/external/dsh-host.md §11）。 */
export interface HostWorkspaceItem {
  workspaceId: string
  title: string
  /**
   * 工作区绝对路径（官方 `WorkspaceView.path`，realpath 归一形态）——**路径 → 工作区匹配用**
   * （`workspaceAnchorForPath` 最长前缀）。宿主没给时 undefined ⇒ 该工作区不参与路径匹配
   * （仍可靠 title 进 `anchorSessionForTitle`）。
   */
  path?: string
  /** 本工作区名下的会话 id（追加序）；文件浏览的 sessionId 只能从这来。 */
  sessionIds?: readonly string[]
  /** 更新时间戳；「最近打开的工作区」排序用。 */
  updatedAt?: number
}

/**
 * 官方 `workspaces` client 服务的 `list`（WorkspaceSource 结构化子集）。
 * ⚠️ `sessionIds` / `updatedAt` 由官方 `WorkspaceView` 提供（dsh-host.md §11 已核实）；
 *    本宿主没给时保持 undefined，取锚点方自行判空，不得编造。
 */
export interface HostWorkspaceSource {
  getSnapshot: () => {
    items: readonly HostWorkspaceItem[]
    /** registry-global 归档集合；官方只在集合变化时换成新数组（dsh-host.md §11.2）。 */
    archivedSessionIds?: readonly string[]
  }
  subscribe: (listener: () => void) => () => void
}

/** 稳定的空归档集合：官方快照缺席时用它，保证 getArchiveSnapshot 引用稳定。 */
const NO_ARCHIVED_SESSIONS: readonly string[] = []

/**
 * 工作区列表的 observable store：直接镜像官方 WorkspaceSource 的 `items` 与
 * `archivedSessionIds`（宿主权威快照，follow 流实时推 —— 源变我们就变，不自持第二份状态机）。
 * `getSnapshot` 保持原有的 items 形态（explorer 各调用方按数组消费），归档集合另给两种读法。
 */
class WorkspaceListStore {
  private items: readonly HostWorkspaceItem[] = []
  private archivedSessionIds: readonly string[] = NO_ARCHIVED_SESSIONS
  private readonly listeners = new Set<() => void>()
  private unsubscribe: (() => void) | undefined

  /** 换源（仅 connectHost 调；重复调用换到新源）。 */
  setSource(source: HostWorkspaceSource): void {
    this.unsubscribe?.()
    const pull = (): void => {
      const snap = source.getSnapshot()
      this.items = snap.items
      this.archivedSessionIds = snap.archivedSessionIds ?? NO_ARCHIVED_SESSIONS
      for (const listener of this.listeners) listener()
    }
    pull()
    this.unsubscribe = source.subscribe(pull)
  }

  readonly getSnapshot = (): readonly HostWorkspaceItem[] => this.items

  /** 归档集合的稳定引用（直接喂 useSyncExternalStore，不需要额外 selector 缓存）。 */
  readonly getArchiveSnapshot = (): readonly string[] => this.archivedSessionIds

  readonly isSessionArchived = (sessionId: string): boolean => this.archivedSessionIds.includes(sessionId)

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}

/** 工作区列表单例（WorkspacePicker / 会话预览消费；connectHost 负责喂）。 */
export const workspaceList = new WorkspaceListStore()

// ── 工作区文件服务 ──────────────────────────────────────────────────────

/**
 * 宿主 `remote.workspaceFiles`（explorer 的读文件通道）单例，由 `connectHost` 喂。
 *
 * 为什么核心要自己存一份：消费方写 `openFilePreview({ mount, path })` 就够了 —— 服务对象
 * 只能从插件的 ctx 里 inject 出来（库拿不到 ctx），所以它必须由**一次接线**交进来，
 * 而不是每次调用各传一遍（用户 2026-10-28 拍板：绑定能力归核心，调用方只管要什么）。
 */
let workspaceFiles: WorkspaceFilesFace | undefined

/** 当前接到的文件服务；宿主没这能力 / 没调 connectHost ⇒ undefined。 */
export function getWorkspaceFiles(): WorkspaceFilesFace | undefined {
  return workspaceFiles
}

// ── 接线 ────────────────────────────────────────────────────────────────

/** 插件 client 的最小 ctx 形状（cordis client context 的结构化子集）。 */
export interface HostClientContext {
  inject: (deps: string[], cb: (sub: unknown) => void) => void
}

export interface ConnectHostOptions {
  /** 模型目录路由（宿主侧 `serveModelCatalog` 注册的同一个 path）；不传 = 不取模型目录。 */
  modelsPath?: string
}

/** 最近一次接线的模型目录路径（`refreshModelCatalog()` 不带参时用它）。 */
let boundModelsPath: string | undefined
/** 进行中的目录请求：并发刷新合并成一次，避免连点发一串相同请求。 */
let catalogInFlight: Promise<void> | undefined
/** 最近一次发起请求的时间（`revalidateModelCatalog()` 的节流判据）。 */
let lastAttemptAt = 0
/** 当前退回重试的档位索引（取到目录即归零）。 */
let retryIndex = 0
let retryTimer: ReturnType<typeof setTimeout> | undefined

/**
 * 首拉失败后的退避档（毫秒）。
 *
 * 宿主 `llm` 晚于插件 client 挂载时，`serveModelCatalog` 会回 503 —— 这是启动顺序竞态，
 * 不是真故障，给三次机会等它起来。三次都失败就停在降级态，交给
 * `refreshModelCatalog()` / 重新打开选择器重试，**绝不无限重试**。
 */
const RETRY_DELAYS_MS: readonly number[] = [1000, 2000, 4000]

/** 事件驱动补拉的最小间隔：切回页面 / 重新打开选择器时，超过这个时长才真的发请求。 */
const REVALIDATE_AFTER_MS = 30_000

/** 只有「过一会儿可能就好」的失败才值得重试：5xx / 429 / 网络层；403、404 重试也没用。 */
function isRetryable(error: unknown): boolean {
  const matched = /HTTP (\d{3})/.exec(String(error))
  if (matched === null) return true
  const status = Number(matched[1])
  return status >= 500 || status === 429
}

function scheduleRetry(path: string, delay: number): void {
  if (retryTimer !== undefined) clearTimeout(retryTimer)
  const timer = setTimeout(() => {
    retryTimer = undefined
    void loadModelCatalog(path)
  }, delay)
  // Node 自检里别让重试定时器吊住进程；浏览器 setTimeout 返回 number，没有 unref。
  ;(timer as unknown as { unref?: () => void }).unref?.()
  retryTimer = timer
}

function loadModelCatalog(path: string, retryOnFailure = true): Promise<void> {
  if (catalogInFlight !== undefined) return catalogInFlight
  lastAttemptAt = Date.now()
  const job = fetch(path, { cache: 'no-store' })
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
    .then((data: unknown) => {
      const routes = (data as { routes?: unknown } | null)?.routes
      if (!Array.isArray(routes)) throw new Error('模型目录响应缺少 routes')
      retryIndex = 0
      modelCatalog.setRoutes(routes as ModelRoute[])
    })
    .catch((error: unknown) => {
      modelCatalog.setUnavailable(String(error))
      if (!retryOnFailure || !isRetryable(error)) return
      const delay = RETRY_DELAYS_MS[retryIndex]
      if (delay === undefined) return
      retryIndex += 1
      scheduleRetry(path, delay)
    })
    .finally(() => {
      catalogInFlight = undefined
    })
  catalogInFlight = job
  return job
}

/**
 * 重拉模型目录（供应商 / 模型有增减、或上一次取失败要重试时调）。
 *
 * 宿主路由每次请求现查，这里显式 `cache: 'no-store'`，避免浏览器把上次的目录缓存回来。
 * 不传 path 就用 `connectHost(ctx, { modelsPath })` 记下的那个；还没接线则 reject。
 * 手动刷新不叠加退避重试（避免与首拉那条重试链互相打架），失败就如实停在降级态。
 * 返回 Promise：await 之后 `modelCatalog.getSnapshot()` 即本次结果。
 */
export async function refreshModelCatalog(path?: string): Promise<ModelCatalogState> {
  const target = path ?? boundModelsPath
  if (target === undefined) {
    throw new Error('模型目录未接线：先调 connectHost(ctx, { modelsPath })')
  }
  await loadModelCatalog(target, false)
  return modelCatalog.getSnapshot()
}

/**
 * 事件驱动的补拉（切回页面 / 重新打开选择器时调）。
 *
 * 不轮询：距上次尝试不足 30s 就什么都不做，因此快速开关下拉不会连发请求。
 * 成功态也补 —— 供应商 / 模型增减不会主动推送，这是「不轮询」前提下唯一的感知入口。
 * 正在请求中直接跳过（`catalogInFlight` 已经是合并后的那一个）。
 */
export function revalidateModelCatalog(): void {
  if (boundModelsPath === undefined || catalogInFlight !== undefined) return
  if (Date.now() - lastAttemptAt < REVALIDATE_AFTER_MS) return
  void loadModelCatalog(boundModelsPath, false)
}

/** 标签页重新可见时补拉一次（只绑一次；Node 自检没有 document，直接跳过）。 */
let visibilityBound = false
function bindVisibilityRevalidate(): void {
  if (visibilityBound) return
  if (typeof document === 'undefined') return
  visibilityBound = true
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') revalidateModelCatalog()
  })
}

function isWorkspaceSource(value: unknown): value is HostWorkspaceSource {
  if (value === null || typeof value !== 'object') return false
  const rec = value as Record<string, unknown>
  return typeof rec.getSnapshot === 'function' && typeof rec.subscribe === 'function'
}

/**
 * 把宿主数据面接进核心（插件 client `apply` 里调**一次**）。
 *
 * 工作区走本地 client 服务注入；模型目录走宿主路由 fetch。哪条失败只影响那一块，
 * 选择器照常渲染空态 / 降级提示 —— 绝不让数据面拖住插件启动。
 */
export function connectHost(ctx: HostClientContext, options: ConnectHostOptions = {}): void {
  ctx.inject(['workspaces'], (sub) => {
    const source = (sub as { workspaces?: { list?: unknown } } | null)?.workspaces?.list
    if (isWorkspaceSource(source)) workspaceList.setSource(source)
  })
  // 读文件通道：`explorer` 的预览靠它读字节，绑定归这里，调用方不必再传服务。
  // dotted 注入值优先，退回 `remote` 上的同名属性；探针 `list` 不在 ⇒ 判为没就位。
  ctx.inject(['remote', 'remote.workspaceFiles'], (sub) => {
    const rec = sub as { remote?: { workspaceFiles?: unknown }; 'remote.workspaceFiles'?: unknown } | null
    const candidate = rec?.['remote.workspaceFiles'] ?? rec?.remote?.workspaceFiles
    if (typeof (candidate as WorkspaceFilesFace | undefined)?.list === 'function') {
      workspaceFiles = candidate as WorkspaceFilesFace
    }
  })
  const modelsPath = options.modelsPath
  if (modelsPath === undefined) return
  boundModelsPath = modelsPath
  bindVisibilityRevalidate()
  void loadModelCatalog(modelsPath)
}
