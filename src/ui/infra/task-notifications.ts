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
export const TASK_NOTIFICATIONS_PROTOCOL = 2
export const TASK_NOTIFICATIONS_KEY = Symbol.for('dsh-plugin-core/task-notifications/v2')
export const TASK_NOTIFICATIONS_EVENTS_KEY = Symbol.for('dsh-plugin-core/task-notifications/events/v2')
export const TASK_NOTIFICATIONS_CHANNEL = 'dsh-plugin-core/task-notifications/v2'
/** Default project lives on a global symbol: every inlined copy must see one value. */
export const TASK_NOTIFICATIONS_PROJECT_KEY = Symbol.for('dsh-plugin-core/task-notifications/project/v2')

export type TaskNotificationStatus = 'running' | 'done' | 'failed'

/**
 * Detail payload: any JSON value. Objects and arrays cross pages through the
 * structured clone algorithm, so callers never stringify — the pool clones a
 * private copy on the way in. Functions, DOM nodes and class instances are
 * rejected with an explicit error.
 */
export type TaskNotificationDetail =
  | string
  | number
  | boolean
  | null
  | readonly TaskNotificationDetail[]
  | { readonly [key: string]: TaskNotificationDetail }

/** Plain, structured-cloneable data. No functions, no ReactNode, no components. */
export interface TaskNotificationRecord {
  readonly id: string
  /** First level: the project that owns this task. */
  readonly project: string
  /** Second level: a group inside that project. Never empty; defaults to 'default'. */
  readonly group: string
  /** Optional display name override for the project. */
  readonly projectLabel?: string
  /** Optional display name override for the group. */
  readonly groupLabel?: string
  readonly title: string
  readonly detail?: TaskNotificationDetail
  readonly status: TaskNotificationStatus
  readonly startedAt: number
  readonly updatedAt: number
  /** Page that owns the task. Only the owning page can restore its dialog. */
  readonly origin: string
  readonly backgrounded: boolean
  readonly reason?: string
}

export interface TaskNotificationInput {
  /** Defaults to the global default project; throws when neither is set. */
  project?: string
  /** Second level; defaults to 'default'. */
  group?: string
  readonly title: string
  projectLabel?: string
  groupLabel?: string
  detail?: TaskNotificationDetail
}

export interface TaskNotificationPatch {
  title?: string
  detail?: TaskNotificationDetail
  /** Second level only: a task never changes project. */
  group?: string
  groupLabel?: string
}

/** `'*'` means every project, every group. An array means those groups of one project. */
export type TaskNotificationGroupFilter = readonly string[] | '*'

export interface TaskNotificationSelectOptions {
  /** Defaults to the global default project; `null` means "do not filter by project". */
  project?: string | null
}

export interface TaskNotificationSettlement {
  readonly outcome: 'done' | 'failed'
  readonly reason?: string
  readonly task: TaskNotificationRecord
}

export interface TaskNotificationHandle {
  readonly id: string
  readonly isSettled: boolean
  /** Settles only when the task really ends; collapsing never settles it. */
  readonly settled: Promise<TaskNotificationSettlement>
  update(patch: TaskNotificationPatch): void
  background(): void
  done(detail?: TaskNotificationDetail): void
  fail(reason?: string): void
  /** Promise-settle fallback: success and rejection both close the task. */
  track<T>(promise: Promise<T>): Promise<T>
}

export interface TaskNotificationSnapshot {
  readonly tasks: readonly TaskNotificationRecord[]
  /** Real monotonic counter of state changes on this page. */
  readonly revision: number
}

export type TaskNotificationEvent =
  | { readonly type: 'registered'; readonly task: TaskNotificationRecord; readonly remote: boolean }
  | { readonly type: 'updated'; readonly task: TaskNotificationRecord; readonly remote: boolean }
  | { readonly type: 'backgrounded'; readonly task: TaskNotificationRecord; readonly remote: boolean }
  | {
      readonly type: 'settled'
      readonly outcome: 'done' | 'failed'
      readonly task: TaskNotificationRecord
      readonly remote: boolean
    }
  /** Never crosses pages: restoring a dialog is local by contract. */
  | { readonly type: 'restored'; readonly taskId: string; readonly remote: false }
  | { readonly type: 'peer-left'; readonly origin: string; readonly remote: true }

export type TaskNotificationEventListener = (event: TaskNotificationEvent) => void

export interface TaskNotificationEventBus {
  subscribe(listener: TaskNotificationEventListener): () => void
  emit(event: TaskNotificationEvent): void
}

/**
 * Liveness provider: one lock per page, held for the life of the page.
 *
 * The browser releases a page's locks when the document unloads or its agent
 * terminates (Web Locks spec §2.6), so "is that name still held?" answers
 * "is that page still there?" without timers, heartbeats or replies.
 */
export interface TaskNotificationLockManager {
  /** Hold a lock until the page goes away. Idempotent per name. */
  hold(name: string): void
  /** true = no context holds that name right now, i.e. that page is gone. */
  free(name: string): Promise<boolean>
}

export interface TaskNotificationPoolOptions {
  /** Defaults to a fresh per-page id. Inject only for deterministic tests. */
  origin?: string
  /** Defaults to TASK_NOTIFICATIONS_CHANNEL. Use a private name in tests. */
  channelName?: string
  /** true = never open a BroadcastChannel (single page / offline use). */
  offline?: boolean
  /** Defaults to the global singleton bus. */
  events?: TaskNotificationEventBus
  /** Defaults to browser detection; false keeps the pool free of lifecycle hooks. */
  lifecycle?: boolean
  /** Defaults to `navigator.locks`; null disables dead-page cleanup. */
  locks?: TaskNotificationLockManager | null
}

export interface TaskNotificationPool {
  readonly protocol: number
  readonly origin: string
  getSnapshot(): TaskNotificationSnapshot
  getServerSnapshot(): TaskNotificationSnapshot
  subscribe(listener: () => void): () => void
  /** Open the cross-page channel and request the baseline. Idempotent. */
  connect(): void
  /** Re-request the baseline after a suspended tab wakes up. */
  refresh(): void
  select(
    groups?: TaskNotificationGroupFilter,
    options?: TaskNotificationSelectOptions,
  ): readonly TaskNotificationRecord[]
  register(input: TaskNotificationInput): TaskNotificationHandle
  /** Settle every task this page still owns; handles are not needed. */
  settleLocal(reason?: string): number
  canRestore(task: TaskNotificationRecord): boolean
  /** Emits a local `restored` event. Returns false for cross-page tasks. */
  requestRestore(taskId: string): boolean
  dispose(): void
}

const EMPTY_TASKS: readonly TaskNotificationRecord[] = Object.freeze([])
const EMPTY_SNAPSHOT: TaskNotificationSnapshot = Object.freeze({ tasks: EMPTY_TASKS, revision: 0 })

/**
 * The default project is process-wide on purpose: core is inlined into every
 * plugin bundle, so a module-level variable would give each copy its own value.
 * `setDefaultTaskProject()` at app start therefore reaches every copy on the page.
 */
interface DefaultProjectSlot {
  value?: string
}

function projectSlot(): DefaultProjectSlot | undefined {
  const g = globalThis as unknown as Record<symbol, DefaultProjectSlot | undefined>
  return g[TASK_NOTIFICATIONS_PROJECT_KEY]
}

function writeProjectSlot(): DefaultProjectSlot {
  const g = globalThis as unknown as Record<symbol, DefaultProjectSlot | undefined>
  let slot = g[TASK_NOTIFICATIONS_PROJECT_KEY]
  if (slot === undefined) {
    slot = {}
    g[TASK_NOTIFICATIONS_PROJECT_KEY] = slot
  }
  return slot
}

/** Set once at app start. `undefined` clears it (tests rely on this). */
export function setDefaultTaskProject(project: string | undefined): void {
  if (project !== undefined && project.trim() === '') {
    throw new Error('task notification default project must be a non-empty string')
  }
  const slot = writeProjectSlot()
  if (project === undefined) delete slot.value
  else slot.value = project
}

export function getDefaultTaskProject(): string | undefined {
  return projectSlot()?.value
}

function requireProject(project?: string | null): string | null {
  if (project === null) return null
  if (project !== undefined) return project
  const fallback = getDefaultTaskProject()
  if (fallback === undefined) {
    throw new Error(
      'task notification project is required: call setDefaultTaskProject() once at app start, or pass `project` explicitly',
    )
  }
  return fallback
}

/** Per-snapshot derived cache: same snapshot + same filter returns the SAME array. */
const SELECT_CACHE = new WeakMap<TaskNotificationSnapshot, Map<string, readonly TaskNotificationRecord[]>>()

/**
 * Three tiers, in that order:
 *   - no filter / empty array: every group of the current project;
 *   - one or more names: only those groups of the current project;
 *   - `'*'`: every project and every group (pass `{ project }` to scope it).
 *
 * The returned reference is stable for the lifetime of the snapshot.
 */
export function selectTaskNotifications(
  snapshot: TaskNotificationSnapshot,
  groups?: TaskNotificationGroupFilter,
  options: TaskNotificationSelectOptions = {},
): readonly TaskNotificationRecord[] {
  const allProjects = groups === '*' && options.project === undefined
  const project = allProjects ? null : requireProject(options.project)
  const groupKey =
    groups === undefined || groups === '*'
      ? ''
      : groups.length === 0
        ? ''
        : [...groups].sort().join('\u0000')
  const cacheKey = `${project ?? '\u0001*'}\u0002${groups === '*' ? '*' : groupKey}`

  let perSnapshot = SELECT_CACHE.get(snapshot)
  if (perSnapshot === undefined) {
    perSnapshot = new Map()
    SELECT_CACHE.set(snapshot, perSnapshot)
  }
  const cached = perSnapshot.get(cacheKey)
  if (cached !== undefined) return cached

  const wanted = groupKey === '' ? null : new Set(groupKey.split('\u0000'))
  const result = Object.freeze(
    snapshot.tasks.filter((task) => {
      if (project !== null && task.project !== project) return false
      if (wanted === null) return true
      return wanted.has(task.group)
    }),
  )
  perSnapshot.set(cacheKey, result)
  return result
}

export function createTaskNotificationEventBus(): TaskNotificationEventBus {
  const listeners = new Set<TaskNotificationEventListener>()
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

export function claimTaskNotifications(create: () => TaskNotificationPool): TaskNotificationPool {
  return claim(TASK_NOTIFICATIONS_KEY, create, isPool)
}

export function claimTaskNotificationEvents(create: () => TaskNotificationEventBus): TaskNotificationEventBus {
  return claim(TASK_NOTIFICATIONS_EVENTS_KEY, create, isEventBus)
}

function isPool(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { protocol?: unknown }).protocol === TASK_NOTIFICATIONS_PROTOCOL &&
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
  task: TaskNotificationRecord
  outcome?: 'done' | 'failed'
}

type WireMessage =
  | { kind: 'hello'; origin: string }
  | { kind: 'shard'; origin: string; seq: number; tasks: readonly TaskNotificationRecord[]; notice?: WireNotice }
  | { kind: 'bye'; origin: string; seq: number }

interface Shard {
  origin: string
  seq: number
  tasks: readonly TaskNotificationRecord[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** JSON value check with a depth guard so a cyclic payload cannot hang the parser. */
function isDetail(value: unknown, depth = 0): value is TaskNotificationDetail {
  if (depth > 20) return false
  if (value === null) return true
  const kind = typeof value
  if (kind === 'string' || kind === 'boolean') return true
  if (kind === 'number') return Number.isFinite(value as number)
  if (Array.isArray(value)) return value.every((item) => isDetail(item, depth + 1))
  if (isRecord(value)) return Object.values(value).every((item) => isDetail(item, depth + 1))
  return false
}

/**
 * Private copy on the way in: mutating the object afterwards must not leak into
 * the pool, and anything the wire cannot carry must fail here — not later, and
 * not differently depending on whether a channel happens to be open.
 */
function cloneDetail(value: TaskNotificationDetail | undefined): TaskNotificationDetail | undefined {
  if (value === undefined) return undefined
  if (!isDetail(value)) {
    throw new Error('task notification detail must be a JSON value (string, number, boolean, null, array or plain object)')
  }
  return typeof structuredClone === 'function'
    ? (structuredClone(value) as TaskNotificationDetail)
    : (JSON.parse(JSON.stringify(value)) as TaskNotificationDetail)
}

function isTaskRecord(value: unknown): value is TaskNotificationRecord {
  if (!isRecord(value)) return false
  if (value.detail !== undefined && !isDetail(value.detail)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.project === 'string' &&
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
    const tasks = value.tasks as readonly TaskNotificationRecord[]
    if (value.notice === undefined) return { kind: 'shard', origin: value.origin, seq: value.seq, tasks }
    if (!isNotice(value.notice)) return null
    return { kind: 'shard', origin: value.origin, seq: value.seq, tasks, notice: value.notice }
  }
  return null
}

function noticeToEvent(notice: WireNotice, remote: boolean): TaskNotificationEvent {
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
function compareTasks(a: TaskNotificationRecord, b: TaskNotificationRecord): number {
  return a.startedAt - b.startedAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}

/** One lock per page, named by origin. Bumping the protocol gives a clean namespace. */
export const TASK_NOTIFICATIONS_LOCK_PREFIX = 'dsh-plugin-core/task-notifications/v2/'

function lockNameFor(pageOrigin: string): string {
  return `${TASK_NOTIFICATIONS_LOCK_PREFIX}${pageOrigin}`
}

/**
 * `navigator.locks` bridge. Resolved lazily so importing this module never
 * touches the DOM (Node / SSR can import it). Returns null where unavailable:
 * the pool then behaves exactly as before and simply keeps no liveness data.
 */
function browserLocks(): TaskNotificationLockManager | null {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks
  if (locks === undefined || locks === null || typeof locks.request !== 'function') return null
  return {
    hold(name: string): void {
      // Never resolves: the lock lives as long as this page does.
      void locks.request(name, () => new Promise<void>(() => {}))
    },
    free(name: string): Promise<boolean> {
      // ifAvailable: no queueing. Getting the lock here means nobody held it,
      // and returning from the callback releases it again immediately.
      return locks
        .request(name, { ifAvailable: true }, (lock) => lock === null)
        .then((occupied) => occupied === false)
        .catch(() => false)
    },
  }
}

export function createTaskNotificationPool(options: TaskNotificationPoolOptions = {}): TaskNotificationPool {
  const origin = options.origin ?? makeOrigin()
  const channelName = options.channelName ?? TASK_NOTIFICATIONS_CHANNEL
  const offline = options.offline === true
  const wantLifecycle = options.lifecycle ?? (typeof window !== 'undefined' && typeof document !== 'undefined')
  const bus = (): TaskNotificationEventBus => options.events ?? taskNotificationEvents
  const locks = options.locks === undefined ? browserLocks() : options.locks
  /** Page -> settle function, so a task can be ended without the caller's handle. */
  const finishers = new Map<string, (outcome: 'done' | 'failed', reason?: string) => void>()
  /** Remotes currently being probed, so overlapping triggers do not stack up. */
  const probing = new Set<string>()
  let locksHeld = false

  const store = createStore<TaskNotificationSnapshot>(() => EMPTY_SNAPSHOT)
  const shards = new Map<string, Shard>()
  const knownSeq = new Map<string, number>()
  let seq = 0
  let revision = 0
  let idSeq = 0
  let channel: BroadcastChannel | null = null
  let everConnected = false
  let everPublished = false

  function collect(): readonly TaskNotificationRecord[] {
    const all: TaskNotificationRecord[] = []
    for (const shard of shards.values()) all.push(...shard.tasks)
    return Object.freeze(all.sort(compareTasks))
  }

  function post(message: WireMessage): void {
    if (channel === null) return
    channel.postMessage(message)
  }

  function localShard(): readonly TaskNotificationRecord[] {
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
  function publish(nextTasks: readonly TaskNotificationRecord[], notice: WireNotice): void {
    seq += 1
    revision += 1
    shards.set(origin, { origin, seq, tasks: Object.freeze([...nextTasks]) })
    knownSeq.set(origin, seq)
    everPublished = true
    store.setState({ tasks: collect(), revision }, true)
    emit(notice, false)
    broadcastShard(notice)
  }

  function find(id: string): TaskNotificationRecord | undefined {
    return localShard().find((task) => task.id === id)
  }

  function replace(tasks: readonly TaskNotificationRecord[], record: TaskNotificationRecord): readonly TaskNotificationRecord[] {
    return tasks.map((task) => (task.id === record.id ? record : task))
  }

  /** Claim the page-level liveness lock. Called on connect, idempotent. */
  function holdLiveness(): void {
    if (locksHeld || locks === null) return
    locksHeld = true
    locks.hold(lockNameFor(origin))
  }

  /** A page vanished without `bye`: drop its shard and say so. */
  function dropRemoteShard(pageOrigin: string): void {
    if (!shards.delete(pageOrigin)) return
    revision += 1
    store.setState({ tasks: collect(), revision }, true)
    bus().emit({ type: 'peer-left', origin: pageOrigin, remote: true })
  }

  /**
   * Remove shards whose page no longer holds its liveness lock.
   *
   * Two probes 250ms apart: a page that just started may not have taken its
   * lock yet, and a stale shard must not be dropped on that single sample.
   * Runs only on real events (message received, tab became visible) — there is
   * no timer, so an idle or backgrounded tab costs nothing.
   */
  function probeDeadPeers(): void {
    if (locks === null) return
    for (const pageOrigin of [...shards.keys()]) {
      if (pageOrigin === origin || probing.has(pageOrigin)) continue
      probing.add(pageOrigin)
      void (async () => {
        try {
          if (!(await locks.free(lockNameFor(pageOrigin)))) return
          await new Promise((resolve) => setTimeout(resolve, 250))
          if (!(await locks.free(lockNameFor(pageOrigin)))) return
          dropRemoteShard(pageOrigin)
        } finally {
          probing.delete(pageOrigin)
        }
      })()
    }
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
      dropRemoteShard(message.origin)
      return
    }
    const seen = knownSeq.get(message.origin) ?? 0
    if (message.seq <= seen) return
    knownSeq.set(message.origin, message.seq)
    shards.set(message.origin, { origin: message.origin, seq: message.seq, tasks: Object.freeze([...message.tasks]) })
    revision += 1
    store.setState({ tasks: collect(), revision }, true)
    if (message.notice !== undefined) emit(message.notice, true)
    // A shard without a live page behind it is a zombie; check on every arrival.
    probeDeadPeers()
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
      probeDeadPeers()
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
    // Take the liveness lock before advertising anything: a page that has
    // published a shard must already be distinguishable from a dead one.
    holdLiveness()
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

  function register(input: TaskNotificationInput): TaskNotificationHandle {
    // Resolve before touching the pool: a missing project must not leave a row behind.
    const project = requireProject(input.project)
    if (project === null) throw new Error('task notification project cannot be null when registering')
    const group = input.group === undefined ? 'default' : input.group
    if (group.trim() === '') throw new Error('task notification group must be a non-empty string')
    const detail = cloneDetail(input.detail)
    connect()
    const now = Date.now()
    const id = `${origin}:${String(++idSeq)}`
    const record: TaskNotificationRecord = {
      id,
      project,
      group,
      ...(input.projectLabel === undefined ? {} : { projectLabel: input.projectLabel }),
      ...(input.groupLabel === undefined ? {} : { groupLabel: input.groupLabel }),
      title: input.title,
      ...(detail === undefined ? {} : { detail }),
      status: 'running',
      startedAt: now,
      updatedAt: now,
      origin,
      backgrounded: false,
    }
    let isSettled = false
    let resolveSettled: (value: TaskNotificationSettlement) => void = () => {}
    const settled = new Promise<TaskNotificationSettlement>((resolve) => { resolveSettled = resolve })

    publish([...localShard(), record], { type: 'registered', task: record })

    function finish(outcome: 'done' | 'failed', reason?: string): void {
      if (isSettled) return
      const current = find(id)
      if (current === undefined) return
      isSettled = true
      finishers.delete(id)
      const final: TaskNotificationRecord = {
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

    finishers.set(id, finish)

    const handle: TaskNotificationHandle = {
      id,
      get isSettled(): boolean { return isSettled },
      settled,
      update(patch): void {
        if (isSettled) return
        const detail = cloneDetail(patch.detail)
        if (patch.group !== undefined && patch.group.trim() === '') {
          throw new Error('task notification group must be a non-empty string')
        }
        const current = find(id)
        if (current === undefined) return
        const next: TaskNotificationRecord = {
          ...current,
          ...(patch.title === undefined ? {} : { title: patch.title }),
          ...(detail === undefined ? {} : { detail }),
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
        const next: TaskNotificationRecord = { ...current, backgrounded: true, updatedAt: Date.now() }
        publish(replace(localShard(), next), { type: 'backgrounded', task: next })
      },
      done(detail?: TaskNotificationDetail): void {
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

  /**
   * End every task this page still owns, whether or not the caller kept its
   * handle (component remount, HMR, page switch). Cross-page rows are untouched:
   * only their owning page may settle them.
   */
  function settleLocal(reason?: string): number {
    let settledCount = 0
    for (const task of [...localShard()]) {
      const finish = finishers.get(task.id)
      if (finish === undefined) continue
      finish('done', reason)
      settledCount += 1
    }
    return settledCount
  }

  const pool: TaskNotificationPool = {
    protocol: TASK_NOTIFICATIONS_PROTOCOL,
    origin,
    getSnapshot: () => store.getState(),
    getServerSnapshot: () => EMPTY_SNAPSHOT,
    subscribe: (listener) => {
      connect()
      return store.subscribe(listener)
    },
    connect,
    refresh,
    select: (groups, options) => selectTaskNotifications(store.getState(), groups, options),
    register,
    settleLocal,
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
let sharedPool: TaskNotificationPool | undefined
let sharedBus: TaskNotificationEventBus | undefined

function globalPool(): TaskNotificationPool {
  if (sharedPool === undefined) sharedPool = claimTaskNotifications(() => createTaskNotificationPool())
  return sharedPool
}

function globalBus(): TaskNotificationEventBus {
  if (sharedBus === undefined) sharedBus = claimTaskNotificationEvents(createTaskNotificationEventBus)
  return sharedBus
}

export const taskNotifications: TaskNotificationPool = {
  protocol: TASK_NOTIFICATIONS_PROTOCOL,
  get origin(): string { return globalPool().origin },
  getSnapshot: () => globalPool().getSnapshot(),
  getServerSnapshot: () => globalPool().getServerSnapshot(),
  subscribe: (listener) => globalPool().subscribe(listener),
  connect: () => { globalPool().connect() },
  refresh: () => { globalPool().refresh() },
  select: (groups, options) => globalPool().select(groups, options),
  register: (input) => globalPool().register(input),
  settleLocal: (reason) => globalPool().settleLocal(reason),
  canRestore: (task) => globalPool().canRestore(task),
  requestRestore: (taskId) => globalPool().requestRestore(taskId),
  dispose: () => { globalPool().dispose() },
}

export interface NotifyTaskOptions {
  /** 一级分组：缺省用全局默认项目；两者都没有则抛错。 */
  project?: string
  /** 二级分组：缺省 'default'。 */
  group?: string
  /** 入池即带的详情；任意 JSON 值，库内部克隆一份私有副本。 */
  detail?: TaskNotificationDetail
  projectLabel?: string
  groupLabel?: string
}

/**
 * 日常入口：只要一个标题，项目和二级分组都能省。
 *
 * 分工与 oraPromise / toast.promise / withProgress 一致：
 * 自己管结束用 `notifyTask(title, options?)`；包住一段异步用 `notifyTask.run(title, work, options?)`。
 * 前者返回句柄，后者返回 work 的原结果 —— 同一入口不靠参数把返回类型换掉。
 */
export interface NotifyTask {
  (title: string, options?: NotifyTaskOptions): TaskNotificationHandle
  /** 包住一段异步：成功走 done、失败走 fail，结果与异常原样透传。 */
  run<T>(title: string, work: Promise<T> | (() => Promise<T>), options?: NotifyTaskOptions): Promise<T>
}

function notifyTaskBase(title: string, options: NotifyTaskOptions = {}): TaskNotificationHandle {
  return taskNotifications.register({
    title,
    ...(options.project === undefined ? {} : { project: options.project }),
    ...(options.group === undefined ? {} : { group: options.group }),
    ...(options.detail === undefined ? {} : { detail: options.detail }),
    ...(options.projectLabel === undefined ? {} : { projectLabel: options.projectLabel }),
    ...(options.groupLabel === undefined ? {} : { groupLabel: options.groupLabel }),
  })
}

function runTask<T>(
  title: string,
  work: Promise<T> | (() => Promise<T>),
  options: NotifyTaskOptions = {},
): Promise<T> {
  const handle = notifyTaskBase(title, options)
  let pending: Promise<T>
  try {
    pending = typeof work === 'function' ? work() : work
  } catch (error) {
    // 同步抛错也要收尾，否则池里留下一条永远 running 的条目。
    handle.fail(error instanceof Error ? error.message : String(error))
    return Promise.reject(error)
  }
  return handle.track(pending)
}

export const notifyTask: NotifyTask = Object.assign(notifyTaskBase, { run: runTask })

export const taskNotificationEvents: TaskNotificationEventBus = {
  subscribe: (listener) => globalBus().subscribe(listener),
  emit: (event) => { globalBus().emit(event) },
}

export function subscribeTaskNotificationEvents(listener: TaskNotificationEventListener): () => void {
  return taskNotificationEvents.subscribe(listener)
}

export function emitTaskNotificationEvent(event: TaskNotificationEvent): void {
  taskNotificationEvents.emit(event)
}
