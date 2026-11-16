/**
 * 服务端权威任务的客户端调和器。
 *
 * 真值在消费方服务端：时钟、判死、枚举、命令执行都不在页面里。本模块只做三件事：
 * 1. 开页时把服务端在跑任务水合成投影；
 * 2. 按单调 version 合并增量（含终态墓碑），过滤迟到与乱序；
 * 3. 按钮按 actionId + 服务端下发的 token 发命令，不依赖任何页面闭包。
 *
 * 零 React / 零 DOM；transport 由调用方注入，Node 自检可直接用内存 fake。
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

/** 增量事件，follow 流的一帧。 */
export type ServerTaskEvent =
  | { readonly kind: 'upsert'; readonly rows: readonly ServerTaskRecord[] }
  | { readonly kind: 'cursor'; readonly cursor: string; readonly serverNow: number }

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
}

export interface AckRequest {
  readonly project: string
  readonly key: string
  readonly version: number
  /** 通知类别：settled / failed 等。 */
  readonly kind: string
  /** 客户端持久游标，重开后保持不变。 */
  readonly cursor: string
}

/**
 * 消费方注入的后端能力。`list` / `follow` / `invoke` / `ack` 是必需的：
 * 缺任一项就没有完整恢复能力，注册时直接报错，不静默降级。
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
  invoke(request: InvokeRequest): Promise<InvokeResult>
  ack(request: AckRequest): Promise<void>
}

export interface AuthoritativeEngineOptions {
  readonly onChange: (records: readonly ServerTaskRecord[]) => void
  readonly onTerminal?: (record: ServerTaskRecord) => void
  readonly clientId: string
  /** 重新基线的最小间隔，默认 5 秒；visibilitychange 去重。 */
  readonly rebaseMinMs?: number
}

type ProjectState = {
  cursor?: string
  snapshotVersion: number
  epoch: number
  seen: Map<string, ServerTaskRecord>
  /** 每个 key 已知的最高版本；只挡更旧的，不挡同版本其他状态。 */
  watermark: Map<string, number>
  /** 终态版本下界：>= 该版本的任何行都不得再改这条记录。 */
  terminal: Map<string, { version: number; acked: boolean }>
}

let idempotencySeq = 0

function newIdempotencyKey(clientId: string): string {
  idempotencySeq += 1
  const random = Math.random().toString(36).slice(2)
  return `${clientId}:${Date.now().toString(36)}:${idempotencySeq.toString(36)}:${random}`
}

/**
 * version 单调合并，返回**真正变更的行**（不是全量 seen），避免重复触发终态 ack。
 * 终态是一道单向门：一旦见过版本 v 的终态，v 及以下的任何行都不得再改这条记录，
 * 否则同版本 tombstone 后到的 running 会把已结算任务复活。
 */
function mergeInto(state: ProjectState, rows: readonly ServerTaskRecord[]): readonly ServerTaskRecord[] {
  const accepted: ServerTaskRecord[] = []
  for (const row of rows) {
    if (!Number.isFinite(row.version)) continue
    const seenVersion = state.watermark.get(row.key) ?? -1
    if (row.version < seenVersion) continue
    const terminal = state.terminal.get(row.key)
    if (terminal !== undefined && row.version <= terminal.version) continue
    const current = state.seen.get(row.key)
    if (current !== undefined && current.version > row.version) continue
    if (current !== undefined && current.version === row.version && current.state === row.state) continue
    state.seen.set(row.key, row)
    state.watermark.set(row.key, row.version)
    if (row.tombstone === true || row.state !== 'running') {
      state.terminal.set(row.key, { version: row.version, acked: false })
    }
    accepted.push(row)
  }
  return accepted
}

export function createAuthoritativeEngine(options: AuthoritativeEngineOptions) {
  const { onChange, onTerminal, clientId } = options
  const rebaseMinMs = options.rebaseMinMs ?? 5_000
  const backends = new Map<string, TaskBackend>()
  const projects = new Map<string, ProjectState>()
  /** 每个后端实例一条连接：不同 project 可能走不同后端，不能让首个后端代收全部。 */
  const followers = new Map<TaskBackend, () => void>()
  let started = false
  let disposed = false
  let lastRebase = 0
  let reconnectFailures = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  /** 同一 (key,actionId,version) 在结果缓存窗口内复用幂等键，响应丢失时重试返回同一结果。 */
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
    const state = projectState(project)
    const accepted = mergeInto(state, rows)
    if (accepted.length === 0) return
    for (const row of accepted) {
      if (row.tombstone !== true && row.state === 'running') continue
      const terminal = state.terminal.get(row.key)
      if (terminal === undefined || terminal.version !== row.version || terminal.acked) continue
      terminal.acked = true
      onTerminal?.(row)
    }
    emitChange()
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
      let first = true
      // keyset 分页：按服务端给的 nextCursor 续拉，直到没有下一页。
      while (!disposed && generation === state.epoch) {
        const page = await backend.list(project, cursor)
        if (disposed || generation !== state.epoch) return
        if (page.rows.length > 0) applyRows(project, page.rows)
        if (page.snapshotVersion < state.snapshotVersion) break
        state.snapshotVersion = page.snapshotVersion
        if (page.nextCursor === undefined || page.nextCursor === cursor) break
        cursor = page.nextCursor
        if (first) first = false
      }
      if (disposed || generation !== state.epoch) return
      state.cursor = cursor
      reconnectFailures = 0
      startFollow()
    } catch {
      // 查询失败不判死、不降级：服务端 watchdog 是权威，下一帧/下次可见再试。
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
          advanceCursor(project, event)
        },
        () => {
          // 只作废这条连接覆盖的项目；指数退避 + jitter 防重连风暴。
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
  }

  return {
    attach(project: string, backend: TaskBackend): void {
      if (disposed) throw new Error('authoritative engine is disposed')
      if (typeof backend.list !== 'function' || typeof backend.follow !== 'function'
        || typeof backend.invoke !== 'function' || typeof backend.ack !== 'function') {
        throw new Error(`task backend for ${project} must provide list/follow/invoke/ack`)
      }
      backends.set(project, backend)
      projectState(project)
      if (started) {
        // 后端集合变了：旧 follow 的 projects 列表不含新项目，必须断开重建。
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
        const result = await backend.invoke({
          project,
          key,
          actionId,
          token: action.token,
          version: record.version,
          idempotencyKey: entry.idempotencyKey,
        })
        // 只缓存成功：失败（含服务端明确拒绝）不封死 60 秒，token 仍有效时可重试。
        if (result.ok) {
          entry.result = result
          entry.at = Date.now()
        }
        return result
      } catch (error) {
        return { ok: false, reason: error instanceof Error ? error.message : String(error) }
      }
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
    /** 停止连接但保留后端与已水合状态；pool.dispose → connect 后可重新 follow。 */
    stop(): void {
      // 先让在途 baseline / poll 的代次失效，再断连接；否则旧结果回来会重启 follow。
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
