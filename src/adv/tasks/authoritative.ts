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
  /** 拉取未确认的终态通知（通道 B）。 */
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
  /** 通道 B 的确认游标：按 clientId 隔离、服务端下发，连续成功前缀推进。 */
  const noticeCursors = new Map<string, string | undefined>()
  let noticePumping = false
  let noticePending = false
  function clientCursor(): string | undefined { return noticeCursors.get(clientId) }

  const invokes = new Map<string, { idempotencyKey: string; result?: InvokeResult; at: number }>()
  const INVOKE_CACHE_MS = 60_000
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
   * 通道 B：拉取并投递未确认通知。emit 同步（运行时吞监听者异常），因此
   * onNotice 返回即视为投递成功，推进连续成功前缀的游标后批量 ack。
   * ack 失败时内存游标不前进，下次重新拉；串行化防止并发重复投递。
   */
  async function pumpNotices(): Promise<void> {
    if (disposed || !started || backends.size === 0) return
    // pumping 期间的新提示记 pending，结束后补拉一轮，不吞事件。
    if (noticePumping) { noticePending = true; return }
    noticePumping = true
    try {
      do {
        noticePending = false
        const projectsNow = [...backends.keys()]
        const backend = backends.get(projectsNow[0] ?? '')
        if (backend === undefined) return
        let cursor = clientCursor()
        const seenCursors = new Set<string>()
        // keyset 分页拉全未确认通知。seenCursors 是死循环兜底：服务端必须按 cursor 过滤，
        // 但若实现有误重复返回同一页，这里必须停，不能把测试/页面挂死。
        for (;;) {
          if (disposed) return
          if (cursor !== undefined) {
            if (seenCursors.has(cursor)) return
            seenCursors.add(cursor)
          }
          const page = await backend.listNotices(projectsNow, cursor)
          if (disposed || page.notices.length === 0) break
          let delivered = 0
          for (const notice of page.notices) {
            onNotice(notice)
            cursor = notice.cursor
            delivered += 1
          }
          if (delivered > 0 && cursor !== undefined) {
            await backend.ackNotices(projectsNow, cursor)
            noticeCursors.set(clientId, cursor)
          }
          if (page.nextCursor === undefined || page.nextCursor === cursor) break
          cursor = page.nextCursor
        }
      } while (noticePending && !disposed)
    } catch {
      // 通知拉取失败不影响投影；下次 follow 提示 / 可见时重试。
    } finally {
      noticePumping = false
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
    const byBackend = new Map<TaskBackend, string[]>()
    for (const [project, backend] of backends) {
      const bucket = byBackend.get(backend)
      if (bucket === undefined) byBackend.set(backend, [project])
      else bucket.push(project)
    }
    for (const [backend, owned] of byBackend) {
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
        let entry = invokes.get(cacheKey)
        if (entry === undefined || Date.now() - entry.at > INVOKE_CACHE_MS) {
          entry = { idempotencyKey: newIdempotencyKey(clientId), at: Date.now() }
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
            entry.result = result
            entry.at = Date.now()
          }
          return result
        } finally {
          if (timer !== null) clearTimeout(timer)
        }
      } catch (error) {
        return { ok: false, reason: error instanceof Error ? error.message : String(error) }
      }
    },
    /** 暴露幂等键供上层在 action 事件里回传，迟到结果由它抑制二次 emit。 */
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
    },
  }
}

export type AuthoritativeEngine = ReturnType<typeof createAuthoritativeEngine>
