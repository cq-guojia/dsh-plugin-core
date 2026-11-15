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
/** 静默任务的默认回收窗口；与 TanStack Query 的 gcTime 默认值一致。 */
export const TASK_NOTIFICATIONS_HIDDEN_TTL_MS = 5 * 60_000
/** 跨页点按钮等 ack 的上限；超时按失败算，界面据此提示「已无法还原」。 */
const INVOKE_TIMEOUT_MS = 2_000

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

/**
 * 一条任务上的按钮：`label` 是显示文案，`run` 是点击时执行的方法。
 *
 * `run` 是函数，只能在创建它的页面里执行，所以它**不进池、不过线**：池只存 label，
 * 方法按 `任务id#下标` 放在本页内存的注册表里。别的页面点按钮时，消息发回创建页由它执行
 * —— 与 VS Code 命令表、Chrome 通知按钮同一形态：边界上只走 id 与纯数据。
 */
export interface TaskNotificationAction {
  readonly label: string
  /** 点击时执行；匿名函数即可。抛错由池捕获并算作本次调用失败。 */
  readonly run: () => void
}

/** 记录里能跨页的那部分：只有文案。下标即动作 id。 */
export interface TaskNotificationActionInfo {
  readonly label: string
}

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
  /** 图标标识（图标名 / 图标字体类名）。核心不解释它，由消费端渲染。 */
  readonly icon?: string
  /** 原始 SVG 源，消费端自行渲染；核心只存不解释，注入风险由调用方承担。 */
  readonly iconSvg?: string
  readonly detail?: TaskNotificationDetail
  /** 按钮文案；下标即动作 id。方法本身留在创建页内存里，记录里不带函数。 */
  readonly actions?: readonly TaskNotificationActionInfo[]
  readonly status: TaskNotificationStatus
  readonly startedAt: number
  readonly updatedAt: number
  /** Page that owns the task. Only the owning page can restore its dialog. */
  readonly origin: string
  readonly backgrounded: boolean
  /** 不进默认列表；池、事件、跨页、收尾一切照旧。可在运行时切换。 */
  readonly hidden?: boolean
  /** 回收窗口（毫秒）。以最后一次活动（updatedAt）起算，到点由池结算为 failed。 */
  readonly timeoutMs?: number
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
  icon?: string
  iconSvg?: string
  detail?: TaskNotificationDetail
  /** 按钮：文案 + 点击执行的方法。方法不会被序列化，只在创建它的页面里执行。 */
  actions?: readonly TaskNotificationAction[]
  /** 不进默认列表；默认关闭。开了之后默认带 5 分钟超时兜底。 */
  hidden?: boolean
  /** 毫秒；0 = 不回收。缺省：hidden 用 5 分钟，可见任务不回收。 */
  timeoutMs?: number
}

export interface TaskNotificationPatch {
  title?: string
  detail?: TaskNotificationDetail
  /** Second level only: a task never changes project. */
  group?: string
  groupLabel?: string
  icon?: string
  iconSvg?: string
  hidden?: boolean
}

export type TaskNotificationLevel = 'info' | 'success' | 'warning' | 'error'

/**
 * 纯广播：只出 `message` 事件，**不进池、不进列表**，所以不会有任何一闪。
 * 常驻监控请用 notifyTask；这里的东西发完即止，没有 id 可查、也不可结束。
 */
export interface TaskNotificationMessage {
  readonly id: string
  readonly project: string
  readonly group: string
  readonly title: string
  readonly icon?: string
  readonly iconSvg?: string
  readonly detail?: TaskNotificationDetail
  readonly level: TaskNotificationLevel
  readonly at: number
}

export interface TaskNotificationMessageInput {
  /** Defaults to the global default project; throws when neither is set. */
  project?: string
  /** Second level; defaults to 'default'. */
  group?: string
  readonly title: string
  icon?: string
  iconSvg?: string
  detail?: TaskNotificationDetail
  level?: TaskNotificationLevel
}

/** `'*'` means every project, every group. An array means those groups of one project. */
export type TaskNotificationGroupFilter = readonly string[] | '*'

export interface TaskNotificationSelectOptions {
  /** Defaults to the global default project; `null` means "do not filter by project". */
  project?: string | null
  /** Default false: `hidden` tasks stay out of every list unless asked for. */
  includeHidden?: boolean
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
  /** 纯广播：来了就是一条消息，池里没有它，列表不会因为它闪一下。 */
  | { readonly type: 'message'; readonly message: TaskNotificationMessage; readonly remote: boolean }
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
  /**
   * Hold a lock until the page goes away. Idempotent per name.
   * 浏览器拒绝申请时（不透明 origin、存储分区、策略禁用）可以返回被拒的 promise；
   * 池会捕获它并在下一次 connect / refresh 重试，不会漏成 unhandled rejection。
   */
  hold(name: string): void | Promise<void>
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
  /** 纯广播：只出 `message` 事件，不写池、不动快照。 */
  broadcast(input: TaskNotificationMessageInput): TaskNotificationMessage
  /** Settle every task this page still owns; handles are not needed. */
  settleLocal(reason?: string): number
  /**
   * 执行一条任务的按钮（`actions[index]`）。本页条目立即执行；跨页条目发回创建页执行并等它回 ack
   * （2s 没有回应算失败）。失败一律 false，不抛异常给调用方。
   */
  runAction(taskId: string, index: number): Promise<boolean>
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

/** 校验按钮并只抽出能跨页的部分（文案）；方法本体由调用方保管。 */
function normalizeActions(actions?: readonly TaskNotificationAction[]): readonly TaskNotificationActionInfo[] {
  if (actions === undefined) return []
  return actions.map((action) => {
    if (typeof action.label !== 'string' || action.label.trim() === '') {
      throw new Error('task notification action label must be a non-empty string')
    }
    if (typeof action.run !== 'function') {
      throw new Error('task notification action run must be a function')
    }
    return { label: action.label }
  })
}

function normalizeGroup(group?: string): string {
  if (group === undefined) return 'default'
  if (group.trim() === '') throw new Error('task notification group must be a non-empty string')
  return group
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
  const cacheKey = `${project ?? '\u0001*'}\u0002${groups === '*' ? '*' : groupKey}\u0002${options.includeHidden === true ? 'hidden' : ''}`

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
      if (options.includeHidden !== true && task.hidden === true) return false
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
  /** 一次性广播：不携带任何状态，收到即 emit，不参与 baseline 与分片序号。 */
  | { kind: 'message'; origin: string; seq: number; message: TaskNotificationMessage }
  | { kind: 'bye'; origin: string; seq: number }
  /** 请创建页执行某条任务的某个按钮：只带 id 与下标，函数在本页不会被序列化。 */
  | { kind: 'invoke'; origin: string; reqId: string; target: string; taskId: string; index: number }
  /** 创建页对 invoke 的回应：跑没跑成。没这条回应，发起页只能等到超时。 */
  | { kind: 'invoked'; origin: string; reqId: string; ok: boolean }

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

/** 记录里只允许出现文案；多出任何键（例如误带的 run）都算畸形消息，整条丢掉。 */
function isActionInfos(value: unknown): value is readonly TaskNotificationActionInfo[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        Object.keys(item).length === 1 &&
        typeof item.label === 'string' &&
        item.label.trim() !== '',
    )
  )
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string'
}

function isTaskRecord(value: unknown): value is TaskNotificationRecord {
  if (!isRecord(value)) return false
  if (value.detail !== undefined && !isDetail(value.detail)) return false
  if (value.actions !== undefined && !isActionInfos(value.actions)) return false
  // 可选字段也要看类型：畸形分片不能借着「没校验」把负数窗口、NaN 时间塞进池。
  if (!isOptionalString(value.projectLabel)) return false
  if (!isOptionalString(value.groupLabel)) return false
  if (!isOptionalString(value.icon)) return false
  if (!isOptionalString(value.iconSvg)) return false
  if (!isOptionalString(value.reason)) return false
  if (value.hidden !== undefined && typeof value.hidden !== 'boolean') return false
  if (
    value.timeoutMs !== undefined &&
    (typeof value.timeoutMs !== 'number' || !Number.isFinite(value.timeoutMs) || value.timeoutMs < 0)
  ) {
    return false
  }
  return (
    typeof value.id === 'string' &&
    typeof value.project === 'string' &&
    typeof value.group === 'string' &&
    typeof value.title === 'string' &&
    (value.status === 'running' || value.status === 'done' || value.status === 'failed') &&
    Number.isFinite(value.startedAt) &&
    Number.isFinite(value.updatedAt) &&
    typeof value.origin === 'string' &&
    typeof value.backgrounded === 'boolean'
  )
}

function isNotice(value: unknown): value is WireNotice {
  if (!isRecord(value) || !isTaskRecord(value.task)) return false
  if (value.type === 'settled') return value.outcome === 'done' || value.outcome === 'failed'
  return value.type === 'registered' || value.type === 'updated' || value.type === 'backgrounded'
}

function isWireMessageValue(value: unknown): value is TaskNotificationMessage {
  if (!isRecord(value)) return false
  if (value.detail !== undefined && !isDetail(value.detail)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.project === 'string' &&
    typeof value.group === 'string' &&
    typeof value.title === 'string' &&
    typeof value.at === 'number' &&
    (value.level === 'info' || value.level === 'success' || value.level === 'warning' || value.level === 'error')
  )
}

/** Reject malformed / foreign messages instead of letting them poison the pool. */
function parseMessage(value: unknown): WireMessage | null {
  if (!isRecord(value) || typeof value.origin !== 'string') return null
  if (value.kind === 'hello') return { kind: 'hello', origin: value.origin }
  if (value.kind === 'bye') {
    return typeof value.seq === 'number' ? { kind: 'bye', origin: value.origin, seq: value.seq } : null
  }
  if (value.kind === 'message') {
    if (typeof value.seq !== 'number' || !isWireMessageValue(value.message)) return null
    return { kind: 'message', origin: value.origin, seq: value.seq, message: value.message }
  }
  if (value.kind === 'invoke') {
    if (
      typeof value.reqId !== 'string' ||
      typeof value.target !== 'string' ||
      typeof value.taskId !== 'string' ||
      typeof value.index !== 'number' ||
      !Number.isSafeInteger(value.index) ||
      value.index < 0
    ) {
      return null
    }
    return {
      kind: 'invoke',
      origin: value.origin,
      reqId: value.reqId,
      target: value.target,
      taskId: value.taskId,
      index: value.index,
    }
  }
  if (value.kind === 'invoked') {
    if (typeof value.reqId !== 'string' || typeof value.ok !== 'boolean') return null
    return { kind: 'invoked', origin: value.origin, reqId: value.reqId, ok: value.ok }
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
    hold(name: string): Promise<void> {
      // Never resolves while the page lives; rejects if the browser refuses the request.
      return locks.request(name, () => new Promise<void>(() => {})).then(() => undefined)
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
  /**
   * 按钮方法表：`任务id#下标` -> 调用方给的匿名函数。函数不过线、不进池，
   * 所以这张表只存在于创建它的页面；条目结束就删，免得闭包攥住组件树。
   */
  const runners = new Map<string, () => void>()
  /** 等 ack 的跨页调用：reqId -> 发起目标 + 兑现函数。超时由定时器兜底。 */
  const pendingInvokes = new Map<string, { target: string; resolve: (ok: boolean) => void }>()
  /** Remotes currently being probed, so overlapping triggers do not stack up. */
  const probing = new Set<string>()
  let locksHeld = false

  const store = createStore<TaskNotificationSnapshot>(() => EMPTY_SNAPSHOT)
  const shards = new Map<string, Shard>()
  const knownSeq = new Map<string, number>()
  let seq = 0
  let revision = 0
  let idSeq = 0
  /** 广播消息自己的序号，不参与分片 seq，避免打乱 baseline 的比较。 */
  let messageSeq = 0
  /** 跨页调用自己的序号，只用于配对 ack。 */
  let invokeSeq = 0
  let channel: BroadcastChannel | null = null
  let everConnected = false
  let everPublished = false

  function collect(): readonly TaskNotificationRecord[] {
    const all: TaskNotificationRecord[] = []
    const now = Date.now()
    for (const shard of shards.values()) {
      for (const task of shard.tasks) {
        // 超过回收窗口的一律不进快照：本页的先结算（见 expireLocal），远端的直接丢。
        if (task.timeoutMs !== undefined && now - task.updatedAt > task.timeoutMs) continue
        all.push(task)
      }
    }
    return Object.freeze(all.sort(compareTasks))
  }

  let expiring = false

  /**
   * 把本页到点的任务结算为 failed。惰性执行：只在下次写之前跑，不装定时器。
   * 只放弃池里的记录，不取消调用方还在跑的 work —— 那个我们没能力动。
   */
  function expireLocal(): void {
    if (expiring) return
    const now = Date.now()
    for (const task of [...localShard()]) {
      if (task.timeoutMs === undefined || now - task.updatedAt <= task.timeoutMs) continue
      const finish = finishers.get(task.id)
      if (finish === undefined) continue
      expiring = true
      try {
        finish('failed', 'timed out')
      } finally {
        expiring = false
      }
    }
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

  /**
   * One write path: new local shard -> new snapshot -> local event -> cross-page message.
   *
   * 收 updater 而不是算好的数组：`expireLocal()` 会就地结算过期行并再写一次，
   * 若用进来之前算的旧数组写回，刚清掉的行会被原样复活成没有 finisher 的僵尸。
   * updater 原样返回 `current` 表示「目标已经被就地结算」，此时不推快照、不发事件。
   */
  function publish(
    compute: (current: readonly TaskNotificationRecord[]) => readonly TaskNotificationRecord[],
    notice: WireNotice,
  ): void {
    expireLocal()
    const current = localShard()
    const nextTasks = compute(current)
    if (nextTasks === current) return
    seq += 1
    revision += 1
    shards.set(origin, { origin, seq, tasks: Object.freeze([...nextTasks]) })
    knownSeq.set(origin, seq)
    everPublished = true
    store.setState({ tasks: collect(), revision }, true)
    emit(notice, false)
    broadcastShard(notice)
  }

  /**
   * 纯广播：**不写池、不动快照**，所以订阅列表不会因为它多一行再少一行。
   * 本地先发一次，再发给同源其他页（一次性，不参与 baseline）。
   */
  function broadcast(input: TaskNotificationMessageInput): TaskNotificationMessage {
    const project = requireProject(input.project)
    if (project === null) throw new Error('task notification project cannot be null when broadcasting')
    const group = normalizeGroup(input.group)
    const detail = cloneDetail(input.detail)
    messageSeq += 1
    const messageSeqForThis = messageSeq
    const message: TaskNotificationMessage = {
      id: `${origin}:msg:${String(messageSeqForThis)}`,
      project,
      group,
      title: input.title,
      ...(input.icon === undefined ? {} : { icon: input.icon }),
      ...(input.iconSvg === undefined ? {} : { iconSvg: input.iconSvg }),
      ...(detail === undefined ? {} : { detail }),
      level: input.level ?? 'info',
      at: Date.now(),
    }
    bus().emit({ type: 'message', message, remote: false })
    connect()
    post({ kind: 'message', origin, seq: messageSeqForThis, message })
    return message
  }

  function find(id: string): TaskNotificationRecord | undefined {
    return localShard().find((task) => task.id === id)
  }

  /** 跨分片查一条任务：只认「记录自己声明的 origin 与所在分片一致」的那份，防伪造分片。 */
  function locate(id: string): TaskNotificationRecord | undefined {
    for (const shard of shards.values()) {
      const hit = shard.tasks.find((task) => task.id === id && task.origin === shard.origin)
      if (hit !== undefined) return hit
    }
    return undefined
  }

  function runnerKey(taskId: string, index: number): string {
    return `${taskId}#${String(index)}`
  }

  /** 本页执行一个按钮；查不到方法、或方法抛错，都算失败。 */
  function runLocal(taskId: string, index: number): boolean {
    const run = runners.get(runnerKey(taskId, index))
    if (run === undefined) return false
    try {
      const result: unknown = (run as () => unknown)()
      // 调用方写成 async 时不让 rejection 变成 unhandled；按钮语义是「已触发」，不等它。
      if (typeof (result as { then?: unknown } | null)?.then === 'function') {
        void (result as Promise<unknown>).catch((error: unknown) => {
          console.error('background task action failed', error)
        })
      }
      return true
    } catch (error) {
      console.error('background task action failed', error)
      return false
    }
  }

  /** 跨页：请创建页执行，等它回 ack；没有 ack 就超时算失败。 */
  function requestInvoke(target: string, taskId: string, index: number): Promise<boolean> {
    if (channel === null) return Promise.resolve(false)
    const reqId = `${origin}:inv:${String(++invokeSeq)}`
    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        pendingInvokes.delete(reqId)
        resolve(false)
      }, INVOKE_TIMEOUT_MS)
      pendingInvokes.set(reqId, {
        target,
        resolve: (ok) => {
          clearTimeout(timer)
          resolve(ok)
        },
      })
      post({ kind: 'invoke', origin, reqId, target, taskId, index })
    })
  }

  async function runAction(taskId: string, index: number): Promise<boolean> {
    const record = locate(taskId)
    if (record === undefined) return false
    // 已过回收窗口、但还没被惰性清扫的行：界面已经看不到它，就不能再点。
    if (record.timeoutMs !== undefined && Date.now() - record.updatedAt > record.timeoutMs) return false
    // 下标越界 = 这一条根本没有这个按钮；跨页时同理，先按记录判，不白跑一趟。
    if (record.actions?.[index] === undefined) return false
    if (record.origin === origin) return runLocal(taskId, index)
    return requestInvoke(record.origin, taskId, index)
  }

  function replace(tasks: readonly TaskNotificationRecord[], record: TaskNotificationRecord): readonly TaskNotificationRecord[] {
    return tasks.map((task) => (task.id === record.id ? record : task))
  }

  /** Claim the page-level liveness lock. Called on connect / refresh, idempotent. */
  function holdLiveness(): void {
    // offline 池从不广播分片，没人会探测它，申请锁只是给别人的 mock 添噪音。
    if (offline || locksHeld || locks === null) return
    locksHeld = true
    // 被拒绝时既不能漏成 unhandled，也不能假装拿到了锁：复位标记，下一次 connect / refresh 重试。
    void Promise.resolve(locks.hold(lockNameFor(origin))).catch((error: unknown) => {
      locksHeld = false
      console.warn('[dsh-plugin-core] 存活锁申请失败，其它页面可能把本页判为已离开', error)
    })
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
    if (message.kind === 'message') {
      // 纯广播不带状态、不进池：直接交给监听者，列表不会因为它变化。
      bus().emit({ type: 'message', message: message.message, remote: true })
      return
    }
    if (message.kind === 'invoke') {
      // 频道是全页共享的：只执行点名本页的那条，别人的一律不理。
      if (message.target !== origin) return
      post({ kind: 'invoked', origin, reqId: message.reqId, ok: runLocal(message.taskId, message.index) })
      return
    }
    if (message.kind === 'invoked') {
      // 只认被点名那页回的 ack：否则同源任何页面都能抢答。
      const entry = pendingInvokes.get(message.reqId)
      if (entry === undefined || entry.target !== message.origin) return
      pendingInvokes.delete(message.reqId)
      entry.resolve(message.ok)
      return
    }
    const seen = knownSeq.get(message.origin) ?? 0
    // 分片已被删掉（bye / 判活清理）时接受「同 seq 重发」：对端恢复后可能用同一个 seq 发全量，
    // 一律丢弃会让这一页在对端永久消失、按钮永远点不了。比已知更旧的仍然丢，别把退役分片复活。
    if (message.seq < seen) return
    if (message.seq === seen && shards.has(message.origin)) return
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

  function onPageShow(event: PageTransitionEvent): void {
    // bfcache 恢复：文档没有卸载，UA 却已按规范释放了本页的锁。不重新申请，
    // 对端两次探测都会拿到锁，把本页刚重发的分片再删掉，两个标签来回抖。
    if (event.persisted) {
      locksHeld = false
      holdLiveness()
    }
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
    // 顺便重试存活锁：上次被浏览器拒绝时，这里补一次。
    holdLiveness()
    post({ kind: 'hello', origin })
  }

  function register(input: TaskNotificationInput): TaskNotificationHandle {
    // Resolve before touching the pool: a missing project must not leave a row behind.
    const project = requireProject(input.project)
    if (project === null) throw new Error('task notification project cannot be null when registering')
    const group = normalizeGroup(input.group)
    const detail = cloneDetail(input.detail)
    const actions = normalizeActions(input.actions)
    const runs = input.actions?.map((action) => action.run) ?? []
    const hidden = input.hidden === true
    const timeoutMs = input.timeoutMs ?? (hidden ? TASK_NOTIFICATIONS_HIDDEN_TTL_MS : 0)
    if (!Number.isFinite(timeoutMs) || timeoutMs < 0) {
      throw new Error('task notification timeoutMs must be a finite number >= 0')
    }
    // 写入侧自己也验：一条非法记录会让整页分片在对端被整片丢弃，不能只靠收线侧兜。
    if (typeof input.title !== 'string') throw new Error('task notification title must be a string')
    for (const key of ['projectLabel', 'groupLabel', 'icon', 'iconSvg'] as const) {
      const field = input[key]
      if (field !== undefined && typeof field !== 'string') {
        throw new Error(`task notification ${key} must be a string`)
      }
    }
    connect()
    const now = Date.now()
    const id = `${origin}:${String(++idSeq)}`
    const record: TaskNotificationRecord = {
      id,
      project,
      group,
      ...(input.projectLabel === undefined ? {} : { projectLabel: input.projectLabel }),
      ...(input.groupLabel === undefined ? {} : { groupLabel: input.groupLabel }),
      ...(input.icon === undefined ? {} : { icon: input.icon }),
      ...(input.iconSvg === undefined ? {} : { iconSvg: input.iconSvg }),
      title: input.title,
      ...(detail === undefined ? {} : { detail }),
      ...(actions.length === 0 ? {} : { actions }),
      status: 'running',
      startedAt: now,
      updatedAt: now,
      origin,
      backgrounded: false,
      ...(hidden ? { hidden: true } : {}),
      ...(timeoutMs > 0 ? { timeoutMs } : {}),
    }
    let isSettled = false
    let resolveSettled: (value: TaskNotificationSettlement) => void = () => {}
    const settled = new Promise<TaskNotificationSettlement>((resolve) => { resolveSettled = resolve })

    // 先放方法与 finisher 再 publish：条目一可见就必须可点、可收尾，中间不留空窗；
    // 订阅者若在 publish 里抛错，句柄虽拿不到，settleLocal 仍能收掉这一条。
    runs.forEach((run, index) => { runners.set(runnerKey(id, index), run) })
    finishers.set(id, finish)
    publish((current) => [...current, record], { type: 'registered', task: record })

    function finish(outcome: 'done' | 'failed', reason?: string): void {
      if (isSettled) return
      const current = find(id)
      if (current === undefined) return
      isSettled = true
      finishers.delete(id)
      runs.forEach((_, index) => { runners.delete(runnerKey(id, index)) })
      // reason 一律转成字符串：JS 调用方传数字 / Error 时，字段类型坏了会让整页分片在对端被丢。
      const reasonText = reason === undefined ? undefined : String(reason)
      const final: TaskNotificationRecord = {
        ...current,
        status: outcome === 'done' ? 'done' : 'failed',
        ...(reasonText === undefined ? {} : { reason: reasonText }),
        updatedAt: Date.now(),
      }
      publish(
        (current) => current.filter((task) => task.id !== id),
        { type: 'settled', task: final, outcome },
      )
      resolveSettled({ outcome, reason, task: final })
    }

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
          ...(patch.icon === undefined ? {} : { icon: patch.icon }),
          ...(patch.iconSvg === undefined ? {} : { iconSvg: patch.iconSvg }),
          // false 也要显式写：否则 `...current` 里的旧 true 会盖住它，收起再也取消不掉。
          ...(patch.hidden === undefined ? {} : { hidden: patch.hidden }),
          // updatedAt 前移即「续期」：回收窗口从最后一次活动起算。
          updatedAt: Date.now(),
        }
        // 行可能在进入 publish 时被就地结算；那时原样返回，别补发一条 status 还是 running 的更新。
        publish((current) => (current.some((task) => task.id === id) ? replace(current, next) : current), {
          type: 'updated',
          task: next,
        })
      },
      background(): void {
        if (isSettled) return
        const current = find(id)
        if (current === undefined || current.backgrounded) return
        const next: TaskNotificationRecord = { ...current, backgrounded: true, updatedAt: Date.now() }
        publish((current) => (current.some((task) => task.id === id) ? replace(current, next) : current), {
          type: 'backgrounded',
          task: next,
        })
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
    broadcast,
    settleLocal,
    runAction,
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
      // 页面这一侧要走了：按钮方法连同闭包一起放掉；条目结束不了就留在池里，
      // 点它只会拿到 false，不会调到已经没了的组件。
      runners.clear()
      // 等 ack 的那些直接判失败：对端可能已经执行了，但本页不再等。
      for (const entry of pendingInvokes.values()) entry.resolve(false)
      pendingInvokes.clear()
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
  broadcast: (input) => globalPool().broadcast(input),
  settleLocal: (reason) => globalPool().settleLocal(reason),
  runAction: (taskId, index) => globalPool().runAction(taskId, index),
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
  /** 后台条目上的按钮：文案 + 点击执行的方法（匿名函数即可，不会被序列化）。 */
  actions?: readonly TaskNotificationAction[]
  projectLabel?: string
  groupLabel?: string
  /** 图标标识（图标名 / 字体类名），核心不解释，消费端渲染。 */
  icon?: string
  /** 原始 SVG 源，消费端自行渲染。 */
  iconSvg?: string
  /** 不进默认列表（仍进池、仍可 await）；不设 timeoutMs 时默认 5 分钟兜底。 */
  hidden?: boolean
  /** 毫秒；0 = 不回收。缺省：hidden 用 5 分钟，可见任务不回收。 */
  timeoutMs?: number
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
    ...(options.actions === undefined ? {} : { actions: options.actions }),
    ...(options.projectLabel === undefined ? {} : { projectLabel: options.projectLabel }),
    ...(options.groupLabel === undefined ? {} : { groupLabel: options.groupLabel }),
    ...(options.icon === undefined ? {} : { icon: options.icon }),
    ...(options.iconSvg === undefined ? {} : { iconSvg: options.iconSvg }),
    ...(options.hidden === undefined ? {} : { hidden: options.hidden }),
    ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
  })
}

export interface NotifyMessageOptions {
  /** 一级分组：缺省用全局默认项目。 */
  project?: string
  /** 二级分组：缺省 'default'。 */
  group?: string
  detail?: TaskNotificationDetail
  icon?: string
  iconSvg?: string
  /** 语义级别，缺省 info；核心只用它传数据，怎么显示由消费端决定。 */
  level?: TaskNotificationLevel
}

/**
 * 纯广播：只发一个 `message` 事件，**不进池、不进列表**，所以不会有「出现一帧又消失」的闪动。
 *
 * 常驻、要进监控列表、要能被结束的，用 `notifyTask`。
 */
export function notifyMessage(title: string, options: NotifyMessageOptions = {}): TaskNotificationMessage {
  return taskNotifications.broadcast({
    title,
    ...(options.project === undefined ? {} : { project: options.project }),
    ...(options.group === undefined ? {} : { group: options.group }),
    ...(options.detail === undefined ? {} : { detail: options.detail }),
    ...(options.icon === undefined ? {} : { icon: options.icon }),
    ...(options.iconSvg === undefined ? {} : { iconSvg: options.iconSvg }),
    ...(options.level === undefined ? {} : { level: options.level }),
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
