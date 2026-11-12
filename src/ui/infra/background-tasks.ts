/**
 * Background task pool: queryable state + subscriptions + one-shot event delivery.
 *
 * Two separate channels, by design (they must not be merged into one bus):
 *   - the pool is a snapshot you can read at any time (useSyncExternalStore);
 *   - the event bus delivers one-shot notices, optionally consumed by plugins.
 * "Collapse to background" is an event, not a third Promise outcome: the task
 * Promise settles only when the owner calls done()/fail() or passes a Promise
 * to track(). This keeps every `await` a normal two-outcome await.
 *
 * Cross-page: each page owns its own shard (keyed by origin) and broadcasts the
 * full shard on every change, with a per-origin monotonic seq. A new page sends
 * `hello`; every online page replies with its full shard. That reply IS the
 * baseline -- no polling, no leader election, no replay of history needed.
 * Late / duplicated / out-of-order messages are dropped by seq comparison.
 *
 * Cross-bundle: core is inlined into every plugin bundle, so a module-level
 * store would be one pool per plugin. The global Symbol.for host collapses all
 * copies on the same page into one pool and one event bus.
 *
 * Zero React / zero DOM at import time. BroadcastChannel and lifecycle hooks are
 * opened lazily on the first connect(); Node and SSR can import this module.
 */
import { createStore } from 'zustand/vanilla'

/** Protocol version lives in the keys: a different wire shape gets its own host. */
export const BACKGROUND_TASKS_PROTOCOL = 1
export const BACKGROUND_TASKS_KEY = Symbol.for('dsh-plugin-core/background-tasks/v1')
export const BACKGROUND_TASKS_EVENTS_KEY = Symbol.for('dsh-plugin-core/background-tasks/events/v1')
export const BACKGROUND_TASKS_CHANNEL = 'dsh-plugin-core/background-tasks/v1'

export type BackgroundTaskStatus = 'running' | 'done' | 'failed'

/** Plain, structured-cloneable data. No functions, no ReactNode, no components. */
export interface BackgroundTaskRecord {
  readonly id: string
  /** Caller-supplied group id; core cannot discover a project name. */
  readonly group: string
  /** Optional display name override for the group. */
  readonly groupLabel?: string
  readonly title: string
  readonly detail?: string
  readonly status: BackgroundTaskStatus
  readonly startedAt: number
  readonly updatedAt: number
  /** Page that owns the task. Only the owning page can restore its dialog. */
  readonly origin: string
  readonly backgrounded: boolean
  readonly reason?: string
}

export interface BackgroundTaskInput {
  group: string
  title: string
  groupLabel?: string
  detail?: string
}

export interface BackgroundTaskPatch {
  title?: string
  detail?: string
  group?: string
  groupLabel?: string
}

export interface BackgroundTaskSettlement {
  readonly outcome: 'done' | 'failed'
  readonly reason?: string
  readonly task: BackgroundTaskRecord
}

export interface BackgroundTaskHandle {
  readonly id: string
  readonly isSettled: boolean
  /** Settles only when the task really ends; collapsing never settles it. */
  readonly settled: Promise<BackgroundTaskSettlement>
  update(patch: BackgroundTaskPatch): void
  background(): void
  done(detail?: string): void
  fail(reason?: string): void
  /** Promise-settle fallback: success and rejection both close the task. */
  track<T>(promise: Promise<T>): Promise<T>
}

export interface BackgroundTaskSnapshot {
  readonly tasks: readonly BackgroundTaskRecord[]
  /** Real monotonic counter of state changes on this page. */
  readonly revision: number
}

export type BackgroundTaskEvent =
  | { readonly type: 'registered'; readonly task: BackgroundTaskRecord; readonly remote: boolean }
  | { readonly type: 'updated'; readonly task: BackgroundTaskRecord; readonly remote: boolean }
  | { readonly type: 'backgrounded'; readonly task: BackgroundTaskRecord; readonly remote: boolean }
  | {
      readonly type: 'settled'
      readonly outcome: 'done' | 'failed'
      readonly task: BackgroundTaskRecord
      readonly remote: boolean
    }
  /** Never crosses pages: restoring a dialog is local by contract. */
  | { readonly type: 'restored'; readonly taskId: string; readonly remote: false }
  | { readonly type: 'peer-left'; readonly origin: string; readonly remote: true }

export type BackgroundTaskEventListener = (event: BackgroundTaskEvent) => void

export interface BackgroundTaskEventBus {
  subscribe(listener: BackgroundTaskEventListener): () => void
  emit(event: BackgroundTaskEvent): void
}

export interface BackgroundTaskPoolOptions {
  /** Defaults to a fresh per-page id. Inject only for deterministic tests. */
  origin?: string
  /** Defaults to BACKGROUND_TASKS_CHANNEL. Use a private name in tests. */
  channelName?: string
  /** true = never open a BroadcastChannel (single page / offline use). */
  offline?: boolean
  /** Defaults to the global singleton bus. */
  events?: BackgroundTaskEventBus
  /** Defaults to browser detection; false keeps the pool free of lifecycle hooks. */
  lifecycle?: boolean
}

export interface BackgroundTaskPool {
  readonly protocol: number
  readonly origin: string
  getSnapshot(): BackgroundTaskSnapshot
  getServerSnapshot(): BackgroundTaskSnapshot
  subscribe(listener: () => void): () => void
  /** Open the cross-page channel and request the baseline. Idempotent. */
  connect(): void
  /** Re-request the baseline after a suspended tab wakes up. */
  refresh(): void
  select(groups?: readonly string[]): readonly BackgroundTaskRecord[]
  register(input: BackgroundTaskInput): BackgroundTaskHandle
  canRestore(task: BackgroundTaskRecord): boolean
  /** Emits a local `restored` event. Returns false for cross-page tasks. */
  requestRestore(taskId: string): boolean
  dispose(): void
}

const EMPTY_TASKS: readonly BackgroundTaskRecord[] = Object.freeze([])
const EMPTY_SNAPSHOT: BackgroundTaskSnapshot = Object.freeze({ tasks: EMPTY_TASKS, revision: 0 })

/** Per-snapshot derived cache: same snapshot + same filter returns the SAME array. */
const SELECT_CACHE = new WeakMap<BackgroundTaskSnapshot, Map<string, readonly BackgroundTaskRecord[]>>()

/**
 * undefined / empty = show every group; one or more = show only those groups.
 * The returned reference is stable for the lifetime of the snapshot.
 */
export function selectBackgroundTasks(
  snapshot: BackgroundTaskSnapshot,
  groups?: readonly string[],
): readonly BackgroundTaskRecord[] {
  const key = groups === undefined || groups.length === 0 ? '*' : [...groups].sort().join('\u0000')
  let perSnapshot = SELECT_CACHE.get(snapshot)
  if (perSnapshot === undefined) {
    perSnapshot = new Map()
    SELECT_CACHE.set(snapshot, perSnapshot)
  }
  const cached = perSnapshot.get(key)
  if (cached !== undefined) return cached
  const result =
    key === '*'
      ? snapshot.tasks
      : Object.freeze(snapshot.tasks.filter((task) => (groups as readonly string[]).includes(task.group)))
  perSnapshot.set(key, result)
  return result
}

export function createBackgroundTaskEventBus(): BackgroundTaskEventBus {
  const listeners = new Set<BackgroundTaskEventListener>()
  return {
    subscribe(listener): () => void {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    emit(event): void {
      // One broken consumer must not stop core's own listener or the others.
      for (const listener of [...listeners]) {
        try {
          listener(event)
        } catch (error) {
          console.error('background task event listener failed', error)
        }
      }
    },
  }
}

function claim<T>(key: symbol, create: () => T, isValid: (value: unknown) => boolean): T {
  const g = globalThis as unknown as Record<symbol, unknown>
  const existing = g[key]
  if (existing !== undefined) {
    if (!isValid(existing)) {
      throw new Error('Incompatible dsh-plugin-core background task host; reload the page.')
    }
    return existing as T
  }
  const created = create()
  g[key] = created
  return created
}

export function claimBackgroundTasks(create: () => BackgroundTaskPool): BackgroundTaskPool {
  return claim(BACKGROUND_TASKS_KEY, create, isPool)
}

export function claimBackgroundTaskEvents(create: () => BackgroundTaskEventBus): BackgroundTaskEventBus {
  return claim(BACKGROUND_TASKS_EVENTS_KEY, create, isEventBus)
}

function isPool(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { protocol?: unknown }).protocol === BACKGROUND_TASKS_PROTOCOL &&
    typeof (value as { getSnapshot?: unknown }).getSnapshot === 'function'
  )
}

function isEventBus(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { emit?: unknown }).emit === 'function' &&
    typeof (value as { subscribe?: unknown }).subscribe === 'function'
  )
}

// ── Wire protocol (all plain data) ─────────────────────────────────────────

interface WireNotice {
  type: 'registered' | 'updated' | 'backgrounded' | 'settled'
  task: BackgroundTaskRecord
  outcome?: 'done' | 'failed'
}

type WireMessage =
  | { kind: 'hello'; origin: string }
  | { kind: 'shard'; origin: string; seq: number; tasks: readonly BackgroundTaskRecord[]; notice?: WireNotice }
  | { kind: 'bye'; origin: string; seq: number }

interface Shard {
  origin: string
  seq: number
  tasks: readonly BackgroundTaskRecord[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTaskRecord(value: unknown): value is BackgroundTaskRecord {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.group === 'string' &&
    typeof value.title === 'string' &&
    (value.status === 'running' || value.status === 'done' || value.status === 'failed') &&
    typeof value.startedAt === 'number' &&
    typeof value.updatedAt === 'number' &&
    typeof value.origin === 'string' &&
    typeof value.backgrounded === 'boolean'
  )
}

function isNotice(value: unknown): value is WireNotice {
  if (!isRecord(value) || !isTaskRecord(value.task)) return false
  if (value.type === 'settled') return value.outcome === 'done' || value.outcome === 'failed'
  return value.type === 'registered' || value.type === 'updated' || value.type === 'backgrounded'
}

/** Reject malformed / foreign messages instead of letting them poison the pool. */
function parseMessage(value: unknown): WireMessage | null {
  if (!isRecord(value) || typeof value.origin !== 'string') return null
  if (value.kind === 'hello') return { kind: 'hello', origin: value.origin }
  if (value.kind === 'bye') {
    return typeof value.seq === 'number' ? { kind: 'bye', origin: value.origin, seq: value.seq } : null
  }
  if (value.kind === 'shard') {
    if (typeof value.seq !== 'number' || !Array.isArray(value.tasks)) return null
    if (!value.tasks.every(isTaskRecord)) return null
    const tasks = value.tasks as readonly BackgroundTaskRecord[]
    if (value.notice === undefined) return { kind: 'shard', origin: value.origin, seq: value.seq, tasks }
    if (!isNotice(value.notice)) return null
    return { kind: 'shard', origin: value.origin, seq: value.seq, tasks, notice: value.notice }
  }
  return null
}

function noticeToEvent(notice: WireNotice, remote: boolean): BackgroundTaskEvent {
  if (notice.type === 'settled') {
    return {
      type: 'settled',
      outcome: notice.outcome === 'failed' ? 'failed' : 'done',
      task: notice.task,
      remote,
    }
  }
  return { type: notice.type, task: notice.task, remote }
}

function makeOrigin(): string {
  const c = globalThis.crypto
  if (typeof c?.randomUUID === 'function') return c.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function openChannel(name: string): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null
  try {
    const channel = new BroadcastChannel(name)
    // Node keeps the loop alive for an open channel; browsers have no unref.
    const withUnref = channel as BroadcastChannel & { unref?: () => void }
    withUnref.unref?.()
    return channel
  } catch {
    return null
  }
}

/** Deterministic order across pages: startedAt first, id as the tie-break. */
function compareTasks(a: BackgroundTaskRecord, b: BackgroundTaskRecord): number {
  return a.startedAt - b.startedAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}

export function createBackgroundTaskPool(options: BackgroundTaskPoolOptions = {}): BackgroundTaskPool {
  const origin = options.origin ?? makeOrigin()
  const channelName = options.channelName ?? BACKGROUND_TASKS_CHANNEL
  const offline = options.offline === true
  const wantLifecycle = options.lifecycle ?? (typeof window !== 'undefined' && typeof document !== 'undefined')
  const bus = (): BackgroundTaskEventBus => options.events ?? backgroundTaskEvents

  const store = createStore<BackgroundTaskSnapshot>(() => EMPTY_SNAPSHOT)
  const shards = new Map<string, Shard>()
  const knownSeq = new Map<string, number>()
  let seq = 0
  let revision = 0
  let idSeq = 0
  let channel: BroadcastChannel | null = null
  let everConnected = false
  let everPublished = false

  function collect(): readonly BackgroundTaskRecord[] {
    const all: BackgroundTaskRecord[] = []
    for (const shard of shards.values()) all.push(...shard.tasks)
    return Object.freeze(all.sort(compareTasks))
  }

  function post(message: WireMessage): void {
    if (channel === null) return
    channel.postMessage(message)
  }

  function localShard(): readonly BackgroundTaskRecord[] {
    return shards.get(origin)?.tasks ?? EMPTY_TASKS
  }

  function emit(notice: WireNotice, remote: boolean): void {
    bus().emit(noticeToEvent(notice, remote))
  }

  function broadcastShard(notice?: WireNotice): void {
    const tasks = localShard()
    const message: WireMessage = { kind: 'shard', origin, seq, tasks, ...(notice === undefined ? {} : { notice }) }
    post(message)
  }

  /** One write path: new local shard -> new snapshot -> local event -> cross-page message. */
  function publish(nextTasks: readonly BackgroundTaskRecord[], notice: WireNotice): void {
    seq += 1
    revision += 1
    shards.set(origin, { origin, seq, tasks: Object.freeze([...nextTasks]) })
    knownSeq.set(origin, seq)
    everPublished = true
    store.setState({ tasks: collect(), revision }, true)
    emit(notice, false)
    broadcastShard(notice)
  }

  function find(id: string): BackgroundTaskRecord | undefined {
    return localShard().find((task) => task.id === id)
  }

  function replace(tasks: readonly BackgroundTaskRecord[], record: BackgroundTaskRecord): readonly BackgroundTaskRecord[] {
    return tasks.map((task) => (task.id === record.id ? record : task))
  }

  function onMessage(raw: unknown): void {
    const message = parseMessage(raw)
    if (message === null || message.origin === origin) return
    if (message.kind === 'hello') {
      broadcastShard()
      return
    }
    if (message.kind === 'bye') {
      // A stale bye must not delete a shard that has since been re-advertised.
      if (message.seq < (knownSeq.get(message.origin) ?? 0)) return
      knownSeq.set(message.origin, message.seq)
      if (shards.delete(message.origin)) {
        revision += 1
        store.setState({ tasks: collect(), revision }, true)
        bus().emit({ type: 'peer-left', origin: message.origin, remote: true })
      }
      return
    }
    const seen = knownSeq.get(message.origin) ?? 0
    if (message.seq <= seen) return
    knownSeq.set(message.origin, message.seq)
    shards.set(message.origin, { origin: message.origin, seq: message.seq, tasks: Object.freeze([...message.tasks]) })
    revision += 1
    store.setState({ tasks: collect(), revision }, true)
    if (message.notice !== undefined) emit(message.notice, true)
  }

  function onPageHide(): void {
    post({ kind: 'bye', origin, seq })
  }

  function onPageShow(): void {
    connect()
    // bfcache / 休眠恢复：pagehide 已让对端删掉本页分片。seq 必须前进后重发，
    // 否则对端会拿「已知 seq」把这份全量分片当旧消息丢掉，本页任务永久消失。
    seq += 1
    knownSeq.set(origin, seq)
    broadcastShard()
    refresh()
  }

  function onVisibility(): void {
    if (document.visibilityState === 'visible') {
      connect()
      refresh()
    }
  }

  function attachLifecycle(): void {
    if (!wantLifecycle) return
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('pageshow', onPageShow)
    document.addEventListener('visibilitychange', onVisibility)
  }

  function detachLifecycle(): void {
    if (!wantLifecycle) return
    window.removeEventListener('pagehide', onPageHide)
    window.removeEventListener('pageshow', onPageShow)
    document.removeEventListener('visibilitychange', onVisibility)
  }

  function connect(): void {
    if (offline || channel !== null) return
    channel = openChannel(channelName)
    if (channel === null) return
    channel.onmessage = (event: MessageEvent<unknown>) => { onMessage(event.data) }
    attachLifecycle()
    const reopened = everConnected
    everConnected = true
    post({ kind: 'hello', origin })
    // 重连（含 dispose 后再用）：对端可能已按 bye 删过本页分片，必须带新 seq 补发全量，
    // 否则本页任务在对端永久消失。首次连接没有分片，不必发。
    if (reopened && everPublished) {
      seq += 1
      knownSeq.set(origin, seq)
      broadcastShard()
    }
  }

  function refresh(): void {
    post({ kind: 'hello', origin })
  }

  function register(input: BackgroundTaskInput): BackgroundTaskHandle {
    connect()
    const now = Date.now()
    const id = `${origin}:${String(++idSeq)}`
    const record: BackgroundTaskRecord = {
      id,
      group: input.group,
      groupLabel: input.groupLabel,
      title: input.title,
      detail: input.detail,
      status: 'running',
      startedAt: now,
      updatedAt: now,
      origin,
      backgrounded: false,
    }
    let isSettled = false
    let resolveSettled: (value: BackgroundTaskSettlement) => void = () => {}
    const settled = new Promise<BackgroundTaskSettlement>((resolve) => { resolveSettled = resolve })

    publish([...localShard(), record], { type: 'registered', task: record })

    function finish(outcome: 'done' | 'failed', reason?: string): void {
      if (isSettled) return
      const current = find(id)
      if (current === undefined) return
      isSettled = true
      const final: BackgroundTaskRecord = {
        ...current,
        status: outcome === 'done' ? 'done' : 'failed',
        reason,
        updatedAt: Date.now(),
      }
      publish(
        localShard().filter((task) => task.id !== id),
        { type: 'settled', task: final, outcome },
      )
      resolveSettled({ outcome, reason, task: final })
    }

    const handle: BackgroundTaskHandle = {
      id,
      get isSettled(): boolean { return isSettled },
      settled,
      update(patch): void {
        if (isSettled) return
        const current = find(id)
        if (current === undefined) return
        const next: BackgroundTaskRecord = {
          ...current,
          ...(patch.title === undefined ? {} : { title: patch.title }),
          ...(patch.detail === undefined ? {} : { detail: patch.detail }),
          ...(patch.group === undefined ? {} : { group: patch.group }),
          ...(patch.groupLabel === undefined ? {} : { groupLabel: patch.groupLabel }),
          updatedAt: Date.now(),
        }
        publish(replace(localShard(), next), { type: 'updated', task: next })
      },
      background(): void {
        if (isSettled) return
        const current = find(id)
        if (current === undefined || current.backgrounded) return
        const next: BackgroundTaskRecord = { ...current, backgrounded: true, updatedAt: Date.now() }
        publish(replace(localShard(), next), { type: 'backgrounded', task: next })
      },
      done(detail?: string): void {
        if (detail !== undefined) handle.update({ detail })
        finish('done')
      },
      fail(reason?: string): void {
        finish('failed', reason)
      },
      track<T>(promise: Promise<T>): Promise<T> {
        promise.then(
          () => { finish('done') },
          (error: unknown) => { finish('failed', error instanceof Error ? error.message : String(error)) },
        )
        return promise
      },
    }
    return handle
  }

  const pool: BackgroundTaskPool = {
    protocol: BACKGROUND_TASKS_PROTOCOL,
    origin,
    getSnapshot: () => store.getState(),
    getServerSnapshot: () => EMPTY_SNAPSHOT,
    subscribe: (listener) => {
      connect()
      return store.subscribe(listener)
    },
    connect,
    refresh,
    select: (groups) => selectBackgroundTasks(store.getState(), groups),
    register,
    canRestore: (task) => task.origin === origin,
    requestRestore(taskId): boolean {
      const record = find(taskId)
      if (record === undefined || record.origin !== origin) return false
      bus().emit({ type: 'restored', taskId, remote: false })
      return true
    },
    /** 关通道、摘监听并广播 bye；状态保留，之后 register / subscribe 会自动重连。 */
    dispose(): void {
      onPageHide()
      detachLifecycle()
      if (channel !== null) {
        channel.onmessage = null
        channel.close()
        channel = null
      }
    },
  }
  return pool
}

/**
 * One pool and one event bus per page, shared by every inlined core copy.
 *
 * Both are lazy facades: importing `ui` must not touch globalThis, must not
 * create a store, and must not throw when an older core left an incompatible
 * host behind (that used to break the whole `ui` entry on import). The host is
 * claimed on first actual use instead.
 */
let sharedPool: BackgroundTaskPool | undefined
let sharedBus: BackgroundTaskEventBus | undefined

function globalPool(): BackgroundTaskPool {
  if (sharedPool === undefined) sharedPool = claimBackgroundTasks(() => createBackgroundTaskPool())
  return sharedPool
}

function globalBus(): BackgroundTaskEventBus {
  if (sharedBus === undefined) sharedBus = claimBackgroundTaskEvents(createBackgroundTaskEventBus)
  return sharedBus
}

export const backgroundTasks: BackgroundTaskPool = {
  protocol: BACKGROUND_TASKS_PROTOCOL,
  get origin(): string { return globalPool().origin },
  getSnapshot: () => globalPool().getSnapshot(),
  getServerSnapshot: () => globalPool().getServerSnapshot(),
  subscribe: (listener) => globalPool().subscribe(listener),
  connect: () => { globalPool().connect() },
  refresh: () => { globalPool().refresh() },
  select: (groups) => globalPool().select(groups),
  register: (input) => globalPool().register(input),
  canRestore: (task) => globalPool().canRestore(task),
  requestRestore: (taskId) => globalPool().requestRestore(taskId),
  dispose: () => { globalPool().dispose() },
}

export const backgroundTaskEvents: BackgroundTaskEventBus = {
  subscribe: (listener) => globalBus().subscribe(listener),
  emit: (event) => { globalBus().emit(event) },
}

export function subscribeBackgroundTaskEvents(listener: BackgroundTaskEventListener): () => void {
  return backgroundTaskEvents.subscribe(listener)
}

export function emitBackgroundTaskEvent(event: BackgroundTaskEvent): void {
  backgroundTaskEvents.emit(event)
}
