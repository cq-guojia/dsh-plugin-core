/**
 * 服务端权威任务的客户端调和器。
 *
 * 两条通道各司其职，绝不混用：
 *   A. 在跑投影——list/follow 只水合 running；tombstone 只更新本地终态门，不 emit、不 ack。
 *   B. 终态通知——listNotices/ackNotices 拉未确认通知，emit 后按连续成功前缀 ack。
 * 这样基线回放（含 tombstone）永远不会造成「任务结束」的重复通知。
 *
 * 真值、判死、时钟、命令执行全在消费方服务端；本模块只做投影、调和、通知投递。
 * 零 React / 零 DOM；transport 注入，Node 自检可用内存 fake。
 */
import { createBoundedCache } from './bounded-cache.js'
import type { TaskNotificationDetail } from './pool.js'

/** 服务端权威任务的状态。 */
export type ServerTaskState = 'running' | 'done' | 'failed'

/** 按钮的可跨端描述。handler 不存在客户端，执行权在服务端。 */
export interface ServerTaskAction {
  readonly id: string
  readonly label?: string
  readonly icon?: string
  readonly color?: string
  readonly enabled: boolean
  /** 服务端下发的一次性令牌，绑定 (project,key,actionId,version)。 */
  readonly token: string
  readonly expiresAt: number
  /** 令牌所属版本；与记录版本不一致即禁用，防旧按钮在新状态上执行。 */
  readonly version?: number
}

/** 一条服务端权威任务记录。所有时间戳均由服务端生成。 */
export interface ServerTaskRecord {
  readonly project: string
  readonly key: string
  readonly version: number
  readonly state: ServerTaskState
  readonly startedAt: number
  readonly deadlineAt: number
  readonly leaseExpiresAt: number
  readonly updatedAt: number
  readonly title: string
  readonly group: string
  readonly groupLabel?: string
  readonly projectLabel?: string
  readonly icon?: string
  readonly iconSvg?: string
  readonly hidden?: boolean
  readonly detail?: TaskNotificationDetail
  readonly actions: readonly ServerTaskAction[]
  readonly result?: TaskNotificationDetail
  readonly reason?: string
  /** 终态墓碑：保留到服务端 TTL 结束，阻止旧版本把它复活。 */
  readonly tombstone?: boolean
}

/** 创建：服务端原子登记，unique(project,key) 决定 created。 */
export interface ServerCreateInput {
  readonly project: string
  readonly key: string
  readonly group: string
  readonly title: string
  readonly detail?: TaskNotificationDetail
  readonly timeoutMs?: number
  readonly leaseMs?: number
  readonly maxDurationMs?: number
}

export interface ServerCreateResult {
  readonly created: boolean
  readonly record: ServerTaskRecord
}

/** 基线分页。游标由服务端生成，keyset 语义，不做 offset 深翻页。 */
export interface ServerTaskPage {
  readonly rows: readonly ServerTaskRecord[]
  readonly nextCursor?: string
  readonly snapshotVersion: number
}

/** 增量事件，follow 流的一帧。notice-available 只提示「有未处理通知」，不携带通知本体。 */
export type ServerTaskEvent =
  | { readonly kind: 'upsert'; readonly rows: readonly ServerTaskRecord[] }
  | { readonly kind: 'cursor'; readonly cursor: string; readonly serverNow: number }
  | { readonly kind: 'notice-available' }

/** 一条服务端终态通知。notificationId 由服务端生成且稳定，供去重与 ack。 */
export interface ServerNotice {
  readonly notificationId: string
  readonly project: string
  readonly record: ServerTaskRecord
  /** 由服务端下发，核心不自拼；服务端按它判未确认项。 */
  readonly cursor: string
}

export interface ServerNoticePage {
  readonly notices: readonly ServerNotice[]
  readonly nextCursor?: string
}

export interface InvokeRequest {
  readonly project: string
  readonly key: string
  readonly actionId: string
  readonly token: string
  /** 客户端生成的唯一键；服务端按它缓存结果，ACK 丢失时重放返回同一结果。 */
  readonly idempotencyKey: string
  readonly version: number
}

export interface InvokeResult {
  readonly ok: boolean
  readonly result?: TaskNotificationDetail
  readonly reason?: string
  /** 本次命令的幂等键，供 action 事件回传、迟到结果复查。 */
  readonly idempotencyKey?: string
}

export interface AckRequest {
  readonly project: string
  /** 通知确认推进到的游标（服务端下发的 cursor，核心不自拼）。 */
  readonly cursor: string
}

/**
 * 消费方注入的后端能力。list/follow/listNotices/ackNotices/invoke/ack 全部必需：
 * 缺任一项就没有完整恢复与通知能力，注册时直接报错，不静默降级。
 */
export interface TaskBackend {
  create?(input: ServerCreateInput): Promise<ServerCreateResult>
  list(project: string, cursor?: string): Promise<ServerTaskPage>
  follow(
    projects: readonly string[],
    cursorByProject: Readonly<Record<string, string>>,
    onEvent: (project: string, event: ServerTaskEvent) => void,
    onError: (project: string, error: unknown) => void,
  ): () => void
  poll?(keys: readonly string[]): Promise<readonly ServerTaskRecord[]>
  /**
   * 拉取未确认的终态通知（通道 B）。
   * cursor 是「该后端整条通知流」的 keyset 游标（对该后端所有 project 共享、全局单调递增），
   * projects 只用于结果过滤、不切分游标空间；ackNotices 的 cursor 与之同一空间。
   * 因此同一后端服务多 project 时共用一个游标即可，不同后端各有独立游标。
   */
  listNotices(projects: readonly string[], sinceCursor?: string): Promise<ServerNoticePage>
  /** 按连续成功前缀推进确认游标，服务端幂等。 */
  ackNotices(projects: readonly string[], cursor: string): Promise<void>
  invoke(request: InvokeRequest): Promise<InvokeResult>
  ack(request: AckRequest): Promise<void>
}

export interface AuthoritativeEngineOptions {
  readonly onChange: (records: readonly ServerTaskRecord[]) => void
  /** 通道 B：一条未确认通知投递到前端。 emit 成功后才推进 ack 游标。 */
  readonly onNotice: (notice: ServerNotice) => void
  readonly clientId: string
  /** 重新基线的最小间隔，默认 5 秒；visibilitychange 去重。 */
  readonly rebaseMinMs?: number
  /** 命令超时，默认 5000ms。 */
  readonly actionTimeoutMs?: number
  /** 命令幂等缓存的容量上限，默认 512；超过淘汰最久未用项。 */
  readonly invokeCacheLimit?: number
  /** 命令幂等缓存的保留窗口（毫秒），默认 60000；过期即删，下次点击换新键。 */
  readonly invokeCacheTtlMs?: number
}

type ProjectState = {
  cursor?: string
  snapshotVersion: number
  epoch: number
  seen: Map<string, ServerTaskRecord>
  watermark: Map<string, number>
  terminal: Map<string, number>
}

let idempotencySeq = 0

function newIdempotencyKey(clientId: string): string {
  idempotencySeq += 1
  const random = Math.random().toString(36).slice(2)
  return `${clientId}:${Date.now().toString(36)}:${idempotencySeq.toString(36)}:${random}`
}

/**
 * version 单调合并，返回真正变更的行。终态是一道单向门：
 * 一旦见过版本 v 的终态，v 及以下的任何行都不得再改这条记录。
 * 注意：这里只更新投影与终态门，**不 emit 通知**——通知只由通道 B 投递。
 */
function mergeInto(state: ProjectState, rows: readonly ServerTaskRecord[]): readonly ServerTaskRecord[] {
  const accepted: ServerTaskRecord[] = []
  for (const row of rows) {
    if (!Number.isFinite(row.version)) continue
    const seenVersion = state.watermark.get(row.key) ?? -1
    if (row.version < seenVersion) continue
    const terminal = state.terminal.get(row.key)
    if (terminal !== undefined && row.version <= terminal) continue
    const current = state.seen.get(row.key)
    if (current !== undefined && current.version > row.version) continue
    if (current !== undefined && current.version === row.version && current.state === row.state) continue
    state.seen.set(row.key, row)
    state.watermark.set(row.key, row.version)
    if (row.tombstone === true || row.state !== 'running') state.terminal.set(row.key, row.version)
    accepted.push(row)
  }
  return accepted
}

export function createAuthoritativeEngine(options: AuthoritativeEngineOptions) {
  const { onChange, onNotice, clientId } = options
  const rebaseMinMs = options.rebaseMinMs ?? 5_000
  const actionTimeoutMs = options.actionTimeoutMs ?? 5_000
  const backends = new Map<string, TaskBackend>()
  const projects = new Map<string, ProjectState>()
  /** 每个后端实例一条连接：不同 project 可能走不同后端。 */
  const followers = new Map<TaskBackend, () => void>()
  let started = false
  let disposed = false
  let lastRebase = 0
  let reconnectFailures = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  /** 通道 B 的确认游标：每个后端一条独立通知流，各自按 clientId 隔离；服务端下发、连续成功前缀推进。 */
  const noticeCursors = new Map<TaskBackend, Map<string, string | undefined>>()
  let noticePumping = false
  let noticePending = false
  /** stop / dispose 时自增，作废在途 pump；它不得再投递通知或推进游标。 */
  let pumpGeneration = 0
  function clientCursor(backend: TaskBackend): string | undefined {
    return noticeCursors.get(backend)?.get(clientId)
  }
  function setClientCursor(backend: TaskBackend, cursor: string): void {
    let byClient = noticeCursors.get(backend)
    if (byClient === undefined) {
      byClient = new Map<string, string | undefined>()
      noticeCursors.set(backend, byClient)
    }
    byClient.set(clientId, cursor)
  }

  /** 后端 → 它负责的 project。通知与 follow 都按这条归属分组，绝不跨后端代查。 */
  function byBackend(): Map<TaskBackend, string[]> {
    const grouped = new Map<TaskBackend, string[]>()
    for (const [project, backend] of backends) {
      const bucket = grouped.get(backend)
      if (bucket === undefined) grouped.set(backend, [project])
      else bucket.push(project)
    }
    return grouped
  }

  /**
   * 命令幂等缓存：容量 LRU + 写入 TTL 双定界。保留窗口从写入（或写入结果）算起，
   * 过期由缓存删除、下次点击换新键 —— 不是「超时只覆盖、旧条目永远留着」。
   */
  const invokes = createBoundedCache<{ idempotencyKey: string; result?: InvokeResult }>(
    options.invokeCacheLimit ?? 512,
    options.invokeCacheTtlMs ?? 60_000,
  )
  function invokeCacheKey(project: string, key: string, actionId: string, version: number): string {
    return `${project}:${key}:${actionId}:${version}`
  }

  function projectState(project: string): ProjectState {
    let state = projects.get(project)
    if (state === undefined) {
      state = { snapshotVersion: -1, epoch: 0, seen: new Map(), watermark: new Map(), terminal: new Map() }
      projects.set(project, state)
    }
    return state
  }

  function emitChange(): void {
    const all: ServerTaskRecord[] = []
    for (const state of projects.values()) {
      for (const row of state.seen.values()) {
        if (row.tombstone === true || row.state !== 'running') continue
        all.push(row)
      }
    }
    onChange(Object.freeze(all))
  }

  function applyRows(project: string, rows: readonly ServerTaskRecord[]): void {
    if (mergeInto(projectState(project), rows).length === 0) return
    emitChange()
  }

  /**
   * 单个后端的通道 B：只拉它自己负责的 project，用它自己的游标推进与 ack。
   * 不同后端可能是不同服务 / 不同鉴权域，拿一个后端代查全部会静默丢通知。
   * generation 用于作废 stop() 前发出的在途 pump：stop 后它不得再 onNotice / ack。
   */
  async function pumpBackendNotices(
    backend: TaskBackend,
    projects: readonly string[],
    generation: number,
  ): Promise<void> {
    let cursor = clientCursor(backend)
    const seenCursors = new Set<string>()
    // keyset 分页拉全未确认通知。seenCursors 是死循环兜底：服务端必须按 cursor 过滤，
    // 但若实现有误重复返回同一页，这里必须停，不能把测试/页面挂死。
    for (;;) {
      if (disposed || generation !== pumpGeneration) return
      if (cursor !== undefined) {
        if (seenCursors.has(cursor)) return
        seenCursors.add(cursor)
      }
      const page = await backend.listNotices(projects, cursor)
      if (disposed || generation !== pumpGeneration || page.notices.length === 0) return
      let delivered = 0
      for (const notice of page.notices) {
        onNotice(notice)
        cursor = notice.cursor
        delivered += 1
      }
      if (delivered > 0 && cursor !== undefined) {
        await backend.ackNotices(projects, cursor)
        if (disposed || generation !== pumpGeneration) return
        setClientCursor(backend, cursor)
      }
      if (page.nextCursor === undefined || page.nextCursor === cursor) return
      cursor = page.nextCursor
    }
  }

  /**
   * 通道 B 总入口：按后端归属逐个 pump，各后端通知流与游标彼此隔离。
   * emit 同步（运行时吞监听者异常），因此 onNotice 返回即视为投递成功，
   * 推进连续成功前缀的游标后 ack；ack 失败时内存游标不前进，下次重新拉。
   * pumping 期间的新提示记 pending，结束后补拉一轮；串行化防止并发重复投递。
   * 每个后端单独 try/catch：一个后端故障不得挡住其他后端的通知。
   */
  async function pumpNotices(): Promise<void> {
    if (disposed || !started || backends.size === 0) return
    if (noticePumping) { noticePending = true; return }
    noticePumping = true
    const generation = pumpGeneration
    try {
      do {
        noticePending = false
        for (const [backend, projects] of byBackend()) {
          if (disposed || generation !== pumpGeneration) return
          try {
            await pumpBackendNotices(backend, projects, generation)
          } catch {
            // 单后端拉取失败不影响其余后端；下次提示 / 可见时重试。
          }
        }
      } while (noticePending && !disposed && generation === pumpGeneration)
    } catch {
      // 通知拉取失败不影响投影；下次 follow 提示 / 可见时重试。
    } finally {
      noticePumping = false
      // 在途 pump 被 stop() 作废、或重挂期间有新提示进来时，pending 仍为 true 但没人再拉：
      // 这里补拉一轮，避免那次提示被吞到下次偶发事件才处理。新一轮用当前 pumpGeneration。
      if (noticePending && started && !disposed) void pumpNotices()
    }
  }

  function advanceCursor(project: string, event: ServerTaskEvent): void {
    const state = projectState(project)
    if (event.kind === 'cursor') state.cursor = event.cursor
  }

  async function rebase(project: string): Promise<void> {
    const backend = backends.get(project)
    if (backend === undefined || disposed) return
    const state = projectState(project)
    const generation = state.epoch
    try {
      let cursor: string | undefined = state.cursor
      while (!disposed && generation === state.epoch) {
        const page = await backend.list(project, cursor)
        if (disposed || generation !== state.epoch) return
        if (page.rows.length > 0) applyRows(project, page.rows)
        if (page.snapshotVersion < state.snapshotVersion) break
        state.snapshotVersion = page.snapshotVersion
        if (page.nextCursor === undefined || page.nextCursor === cursor) break
        cursor = page.nextCursor
      }
      if (disposed || generation !== state.epoch) return
      state.cursor = cursor
      reconnectFailures = 0
      startFollow()
    } catch {
      // 查询失败不判死、不降级：服务端 watchdog 是权威。
    }
  }

  function startFollow(): void {
    if (disposed || backends.size === 0) return
    for (const [backend, owned] of byBackend()) {
      if (followers.has(backend)) continue
      const cursors: Record<string, string> = {}
      for (const project of owned) {
        const state = projects.get(project)
        if (state?.cursor !== undefined) cursors[project] = state.cursor
      }
      followers.set(backend, backend.follow(
        owned,
        cursors,
        (project, event) => {
          if (disposed || !owned.includes(project)) return
          if (event.kind === 'upsert') applyRows(project, event.rows)
          else if (event.kind === 'notice-available') void pumpNotices()
          advanceCursor(project, event)
        },
        () => {
          for (const project of owned) {
            const state = projects.get(project)
            if (state !== undefined) state.epoch += 1
          }
          followers.get(backend)?.()
          followers.delete(backend)
          if (disposed || reconnectTimer !== null) return
          reconnectFailures += 1
          const delay = Math.min(15_000, 250 * 2 ** Math.min(reconnectFailures, 6)) + Math.random() * 250
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null
            void rebaseAll()
          }, delay)
        },
      ))
    }
  }

  async function rebaseAll(): Promise<void> {
    if (disposed) return
    await Promise.all([...backends.keys()].map((project) => rebase(project)))
    void pumpNotices()
  }

  return {
    attach(project: string, backend: TaskBackend): void {
      if (disposed) throw new Error('authoritative engine is disposed')
      if (typeof backend.list !== 'function' || typeof backend.follow !== 'function'
        || typeof backend.listNotices !== 'function' || typeof backend.ackNotices !== 'function'
        || typeof backend.invoke !== 'function' || typeof backend.ack !== 'function') {
        throw new Error(`task backend for ${project} must provide list/follow/listNotices/ackNotices/invoke/ack`)
      }
      backends.set(project, backend)
      projectState(project)
      // 重挂到新后端实例时，旧实例不再服务任何 project，其游标条目应回收；
      // 仍被其他 project 共用的后端保留游标，避免重复投递。
      const active = new Set(backends.values())
      for (const stale of noticeCursors.keys()) {
        if (!active.has(stale)) noticeCursors.delete(stale)
      }
      if (started) {
        const wasStarted = started
        this.stop()
        started = wasStarted
        void rebaseAll()
      }
    },
    start(): void {
      if (started || disposed) return
      started = true
      void rebaseAll()
    },
    visible(): void {
      const now = Date.now()
      if (now - lastRebase < rebaseMinMs) return
      lastRebase = now
      void rebaseAll()
    },
    refresh(project?: string): void {
      if (project === undefined) void rebaseAll()
      else void rebase(project)
    },
    find(project: string, key: string): ServerTaskRecord | undefined {
      return projectState(project).seen.get(key)
    },
    all(): readonly ServerTaskRecord[] {
      const all: ServerTaskRecord[] = []
      for (const state of projects.values()) {
        for (const row of state.seen.values()) {
          if (row.tombstone === true || row.state !== 'running') continue
          all.push(row)
        }
      }
      return Object.freeze(all)
    },
    async runAction(project: string, key: string, actionId: string): Promise<InvokeResult> {
      try {
        const backend = backends.get(project)
        const record = projectState(project).seen.get(key)
        const action = record?.actions.find((item) => item.id === actionId)
        if (backend === undefined || record === undefined || action === undefined) {
          return { ok: false, reason: 'action unavailable' }
        }
        if (!action.enabled || action.expiresAt <= Date.now()
          || (action.version !== undefined && action.version !== record.version)) {
          return { ok: false, reason: 'action expired' }
        }
        const cacheKey = invokeCacheKey(project, key, actionId, record.version)
        // 过期条目已由缓存 get 删除，拿到 undefined 即换新键。
        let entry = invokes.get(cacheKey)
        if (entry === undefined) {
          entry = { idempotencyKey: newIdempotencyKey(clientId) }
          invokes.set(cacheKey, entry)
        }
        if (entry.result !== undefined) return entry.result
        let timer: ReturnType<typeof setTimeout> | null = null
        try {
          const timed = new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error('action timeout')), actionTimeoutMs)
          })
          const raw = await Promise.race([backend.invoke({
            project, key, actionId,
            token: action.token,
            version: record.version,
            idempotencyKey: entry.idempotencyKey,
          }), timed])
          const result: InvokeResult = { ...raw, idempotencyKey: entry.idempotencyKey }
          if (result.ok) {
            // 写回带结果的条目，保留窗口从成功时刻重新起算（与旧实现 entry.at = now 一致）。
            // 只在没有换新键时写回：命令耗时超过 TTL 时缓存里可能已是被下一次点击换掉的条目，
            // 迟到的旧结果不得用旧键盖回去、也不得挤掉新条目。
            const current = invokes.get(cacheKey)
            if (current === undefined || current.idempotencyKey === entry.idempotencyKey) {
              invokes.set(cacheKey, { ...entry, result })
            }
          }
          return result
        } finally {
          if (timer !== null) clearTimeout(timer)
        }
      } catch (error) {
        return { ok: false, reason: error instanceof Error ? error.message : String(error) }
      }
    },
    /** 暴露幂等键供上层在 action 事件里回传，迟到结果由它抑制二次 emit；只保留窗口内有效，过期或淘汰后返回 undefined。 */
    idempotencyKeyFor(project: string, key: string, actionId: string, version: number): string | undefined {
      return invokes.get(invokeCacheKey(project, key, actionId, version))?.idempotencyKey
    },
    async acknowledge(request: AckRequest): Promise<void> {
      const backend = backends.get(request.project)
      if (backend === undefined) return
      await backend.ack(request)
    },
    async create(input: ServerCreateInput): Promise<ServerCreateResult | undefined> {
      const backend = backends.get(input.project)
      if (backend?.create === undefined) return undefined
      const result = await backend.create(input)
      if (result.record !== undefined) applyRows(input.project, [result.record])
      return result
    },
    has(project: string): boolean {
      return backends.has(project)
    },
    stop(): void {
      // 作废在途 pump：它此后不得 onNotice / ack。游标保留——重连后从已确认点续拉，
      // 不因一次断连就重头投递全部通知（at-least-once 下会重复 emit）。
      pumpGeneration += 1
      for (const state of projects.values()) state.epoch += 1
      for (const off of followers.values()) off()
      followers.clear()
      started = false
      if (reconnectTimer !== null) clearTimeout(reconnectTimer)
      reconnectTimer = null
    },
    dispose(): void {
      disposed = true
      this.stop()
      projects.clear()
      invokes.clear()
      noticeCursors.clear()
    },
  }
}

export type AuthoritativeEngine = ReturnType<typeof createAuthoritativeEngine>
