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
import { createStore } from '../../runtime/store.js'
import {
  claimEventBus,
  cloneDetail,
  createEventBus,
  getDefaultTaskProject,
  isDetail,
  isEventBusLike,
  normalizeGroup,
  openBroadcastChannel,
  resolveProject,
  setDefaultTaskProject,
  notifyMessage as publishNotification,
  type NotifyDetail,
  type NotifyLevel,
  type NotifyMessage,
  type NotifyMessageOptions,
} from '../../runtime/notify.js'

/** Protocol version lives in the keys: a different wire shape gets its own host. */
export const TASK_NOTIFICATIONS_PROTOCOL = 2
export const TASK_NOTIFICATIONS_KEY = Symbol.for('dsh-plugin-core/task-notifications/v2')
export const TASK_NOTIFICATIONS_EVENTS_KEY = Symbol.for('dsh-plugin-core/task-notifications/events/v2')
export const TASK_NOTIFICATIONS_CHANNEL = 'dsh-plugin-core/task-notifications/v2'
/** Default project lives on a global symbol: every inlined copy must see one value. */
export const TASK_NOTIFICATIONS_PROJECT_KEY = Symbol.for('dsh-plugin-core/task-notifications/project/v2')

/** 默认分组的读写实做在 runtime，这里保留既有导出名（对外契约不变）。 */
export { getDefaultTaskProject, setDefaultTaskProject }
/** 跨页点按钮等 ack 的上限；超时按失败算，界面据此提示「已无法还原」。 */
const INVOKE_TIMEOUT_MS = 2_000

export type TaskNotificationStatus = 'running' | 'done' | 'failed'

/**
 * Detail payload: any JSON value. Objects and arrays cross pages through the
 * structured clone algorithm, so callers never stringify — the pool clones a
 * private copy on the way in. Functions, DOM nodes and class instances are
 * rejected with an explicit error.
 */
export type TaskNotificationDetail = NotifyDetail

/**
 * 一条任务上的按钮：`label` 是显示文案，`run` 是点击时执行的方法。
 *
 * `run` 是函数，只能在创建它的页面里执行，所以它**不进池、不过线**：池只存 label，
 * 方法按 `任务id#下标` 放在本页内存的注册表里。别的页面点按钮时，消息发回创建页由它执行
 * —— 与 VS Code 命令表、Chrome 通知按钮同一形态：边界上只走 id 与纯数据。
 */
export interface TaskNotificationAction {
  /** 文案；与 `icon` 至少给一个。只给 `icon` 时展示方画成正方形图标钮。 */
  readonly label?: string
  /** 图标标识（`库名:图标名`）；与 `label` 至少给一个。 */
  readonly icon?: string
  /**
   * 按钮色（任意 CSS 色值，如 `#dc2626` / `var(--dshpc-business)`）。
   * 不传 = 用展示方的默认档；传了就是实心底色。跨页只传这个字符串本身。
   */
  readonly color?: string
  /** 点击时执行；匿名函数即可。抛错由池捕获并算作本次调用失败。 */
  readonly run: () => void
}

/** 记录里能跨页的那部分：文案 + 图标 + 可选按钮色。下标即动作 id。 */
export interface TaskNotificationActionInfo {
  readonly label?: string
  readonly icon?: string
  readonly color?: string
}

/**
 * 业务键：调用方给的身份。核心不解释含义、不做模式校验，只做相等判等 ——
 * 同一个键在池里最多对应一条记录。
 *
 * 传字符串就原样用；传数组（元组）按元素归一化成稳定串，免得手拼分隔符把两件事撞成一个键。
 */
export type TaskKey = string | readonly (string | number)[]

/** Plain, structured-cloneable data. No functions, no ReactNode, no components. */
export interface TaskNotificationRecord {
  readonly id: string
  /** 归一化后的业务键（`taskKey()` 的结果）；同一 (project, key) 同时最多一条。 */
  readonly key?: string
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
  /**
   * 业务键。同页已有同键条目 → 就地更新这条并复用同一个句柄（不新增）；
   * 别的页面已有同键条目 → 抛 `TaskNotificationConflictError`（作业在它那一页，给了也点不动）。
   */
  key?: TaskKey
  projectLabel?: string
  groupLabel?: string
  icon?: string
  iconSvg?: string
  detail?: TaskNotificationDetail
  /** 按钮：文案 + 点击执行的方法。方法不会被序列化，只在创建它的页面里执行。 */
  actions?: readonly TaskNotificationAction[]
  /** 不进默认列表。**只表达这一件事**：回收是另一件事，见 `timeoutMs`。 */
  hidden?: boolean
  /**
   * 回收窗口（毫秒）。**缺省 0 = 不回收**，与 hidden 与否无关 —— 后台作业型任务被打断的代价
   * 远大于留一条记录的代价（2026-11-15：原先 hidden 缺省 5 分钟，作业还在跑就先被判失败）。
   * 会自己跑完的短任务想兜底，显式给一个值。
   */
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

export type TaskNotificationLevel = NotifyLevel

/**
 * 纯广播：只出通知事件，**不进池、不进列表**，所以不会有任何一闪。
 * 常驻监控请用 notifyTask；这里的东西发完即止，没有 id 可查、也不可结束。
 */
export type TaskNotificationMessage = NotifyMessage

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

/**
 * 登记结果。`created === false` 说明本页已经有同键任务并复用了它 ——
 * 调用方不要为同一件事再起第二份活（作业只该有一个执行者，收尾也归它）。
 */
export interface TaskNotificationClaim {
  readonly handle: TaskNotificationHandle
  readonly created: boolean
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
  /** 幂等登记：带 `key` 时就地复用本页同键条目，并告诉你这条是不是刚建的。 */
  ensure(input: TaskNotificationInput): TaskNotificationClaim
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

/** 字符串字段：要么不传，要么是字符串。写入侧与收线侧用同一套，坏值在本页就抛。 */
function assertOptionalText(source: object, keys: readonly string[]): void {
  const fields = source as Record<string, unknown>
  for (const key of keys) {
    if (fields[key] !== undefined && typeof fields[key] !== 'string') {
      throw new Error(`task notification ${key} must be a string`)
    }
  }
}

/** 校验按钮并只抽出能跨页的部分（文案 / 图标 / 颜色）；方法本体由调用方保管。 */
function normalizeActions(actions?: readonly TaskNotificationAction[]): readonly TaskNotificationActionInfo[] {
  if (actions === undefined) return []
  return actions.map((action) => {
    if (action.label !== undefined && typeof action.label !== 'string') {
      throw new Error('task notification action label must be a string')
    }
    if (action.icon !== undefined && typeof action.icon !== 'string') {
      throw new Error('task notification action icon must be a string')
    }
    if (typeof action.run !== 'function') {
      throw new Error('task notification action run must be a function')
    }
    const label = action.label?.trim() ?? ''
    const icon = action.icon?.trim() ?? ''
    // 只有图标也算合法（展示方画成正方形图标钮）；两个都空就没法画，直接拒。
    if (label === '' && icon === '') {
      throw new Error('task notification action needs a non-empty label or icon')
    }
    if (action.color !== undefined && (typeof action.color !== 'string' || action.color.trim() === '')) {
      throw new Error('task notification action color must be a non-empty string when provided')
    }
    return {
      ...(label === '' ? {} : { label: action.label }),
      ...(icon === '' ? {} : { icon: action.icon }),
      ...(action.color === undefined ? {} : { color: action.color }),
    }
  })
}

/** 缺省取全局默认分组：与 runtime 的 `resolveProject` 是同一份实现，这里只是本地别名。 */
const requireProject = resolveProject

/** 元组键在池里存成「前缀 + JSON」，与手写字符串键分属两个空间，互不撞。 */
const TASK_KEY_TUPLE_PREFIX = '#'

/**
 * 归一化业务键：元组按元素序列化（顺序与边界都由 JSON 保证），字符串原样。
 *
 * 只收扁平原值。对象 / 函数 / 时间戳当键会让「同一件事」每次算出不同键，等于没去重，
 * 所以在这里当场拒绝，而不是悄悄放行成「每次都是新的一条」。
 */
export function taskKey(key: TaskKey): string {
  if (typeof key === 'string') {
    if (key.trim() === '') throw new Error('task notification key must be a non-empty string')
    return key
  }
  if (!Array.isArray(key) || key.length === 0) {
    throw new Error('task notification key must be a non-empty array of strings and numbers')
  }
  for (const part of key as readonly (string | number)[]) {
    if (typeof part === 'number') {
      if (!Number.isFinite(part)) throw new Error('task notification key numbers must be finite')
      continue
    }
    if (typeof part !== 'string' || part === '') {
      throw new Error('task notification key parts must be non-empty strings or finite numbers')
    }
  }
  return TASK_KEY_TUPLE_PREFIX + JSON.stringify(key)
}

/**
 * 同一个键已经在**别的页面**登记着：那条作业的方法在它那一页，本页拿着也点不动，
 * 所以不返回假句柄，直接拒绝，让调用方提示「已在别处进行中」。
 *
 * 判冲突请用 `code`（core 被打进每个插件 bundle，跨副本 `instanceof` 不可靠）。
 */
export class TaskNotificationConflictError extends Error {
  readonly code = 'TASK_NOTIFICATION_CONFLICT'
  readonly key: string
  /** 持有该键的页面 origin。 */
  readonly ownerOrigin: string

  constructor(key: string, ownerOrigin: string) {
    super(`task notification key is already running: ${key} (owner ${ownerOrigin})`)
    this.name = 'TaskNotificationConflictError'
    this.key = key
    this.ownerOrigin = ownerOrigin
  }
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
  // 多播实现由 runtime 统一提供（坏掉的监听者不许拖垮其它监听者）。
  return createEventBus<TaskNotificationEvent>()
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
  return claimEventBus(TASK_NOTIFICATIONS_EVENTS_KEY, isEventBusLike, create)
}

function isPool(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { protocol?: unknown }).protocol === TASK_NOTIFICATIONS_PROTOCOL &&
    typeof (value as { getSnapshot?: unknown }).getSnapshot === 'function'
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

/** 详情校验与入口克隆：实做在 runtime（与通知共用同一套判定）。 */

/** 记录里只允许出现文案；多出任何键（例如误带的 run）都算畸形消息，整条丢掉。 */
function isActionInfos(value: unknown): value is readonly TaskNotificationActionInfo[] {
  return (
    Array.isArray(value) &&
    value.every((item) => {
      if (!isRecord(item)) return false
      // 只认 label / icon / color 三个键：别让畸形分片借着体积校验混进池。
      if (!Object.keys(item).every((key) => key === 'label' || key === 'icon' || key === 'color')) return false
      if (!isOptionalString(item.label)) return false
      if (!isOptionalString(item.icon)) return false
      if (item.color !== undefined && (typeof item.color !== 'string' || item.color.trim() === '')) return false
      // 文案与图标至少得有一个，否则这颗按钮画不出来。
      const label = typeof item.label === 'string' ? item.label.trim() : ''
      const icon = typeof item.icon === 'string' ? item.icon.trim() : ''
      return label !== '' || icon !== ''
    })
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
  // 空键等于「没有键」，跨页复制过来只会让判重失灵；整条当畸形消息丢掉。
  if (value.key !== undefined && (typeof value.key !== 'string' || value.key === '')) return false
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

/** Reject malformed / foreign messages instead of letting them poison the pool. */
function parseMessage(value: unknown): WireMessage | null {
  if (!isRecord(value) || typeof value.origin !== 'string') return null
  if (value.kind === 'hello') return { kind: 'hello', origin: value.origin }
  if (value.kind === 'bye') {
    return typeof value.seq === 'number' ? { kind: 'bye', origin: value.origin, seq: value.seq } : null
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

/** 通道由 runtime 统一持有（同页所有副本、所有用途共用一条），这里只按名字取。 */

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
   * 本页句柄表：同键再次登记必须返回**同一个**句柄 ——
   * 否则第二次拿到的 `settled` / `isSettled` 跟真实结算对不上。结束即删。
   */
  const handles = new Map<string, TaskNotificationHandle>()
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
  /** 存活锁的申请代次：只认最新一代的失败，避免旧 rejection 把新标记复位。 */
  let lockAttempt = 0

  const store = createStore<TaskNotificationSnapshot>(() => EMPTY_SNAPSHOT)
  const shards = new Map<string, Shard>()
  const knownSeq = new Map<string, number>()
  let seq = 0
  let revision = 0
  let idSeq = 0
  /** 跨页调用自己的序号，只用于配对 ack。 */
  let invokeSeq = 0
  /**
   * 本逻辑端自己的一条通道实例。与通知同名，所以两边互收；但**不共用实例** ——
   * `BroadcastChannel` 收不到自己 post 的消息，共用会让同一上下文里的第二个页面收不到本页。
   */
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
  /** 一条定时器守着最早到期的本页任务；没有带窗口的条目时为空。 */
  let expiryTimer: ReturnType<typeof setTimeout> | null = null

  function clearExpiryTimer(): void {
    if (expiryTimer === null) return
    clearTimeout(expiryTimer)
    expiryTimer = null
  }

  /**
   * 按「下一次活动 + 窗口」重排定时器。每次写（登记 / 更新 / 结束）都会重算，
   * 所以 `update` 和 `background` 的前移 `updatedAt` 天然续期；远端分片不参与（只有所属页能结算）。
   */
  function scheduleExpiry(): void {
    clearExpiryTimer()
    const now = Date.now()
    let due = Number.POSITIVE_INFINITY
    for (const task of localShard()) {
      if (task.timeoutMs === undefined || !finishers.has(task.id)) continue
      const at = task.updatedAt + task.timeoutMs
      // 已经到点的也算进来（登记到 publish 之间可能就过了窗口）：用 1ms 的兜底延后结算，
      // 直接跳过会让「注册时就很慢」的条目再也等不到定时器，成为清不掉的僵尸。
      if (at < due) due = at
    }
    if (!Number.isFinite(due)) return
    const timer = setTimeout(() => {
      expiryTimer = null
      expireLocal()
      // expireLocal 的结算会走 publish 重排；兜底再排一次，防止「到期但没结算」时定时器丢失。
      scheduleExpiry()
    }, Math.max(1, due - now))
    // 不能 unref：Node 里 unref 的定时器在没有其它活跃 handle 时不会兑现，
    // 那正是「没人再写一条记录」的僵尸场景。结束 / dispose 会清表，不会留下空闲句柄。
    expiryTimer = timer
  }

  /**
   * 把本页到点的任务结算为 failed。定时器到点和每次写入前各跑一次：
   * 前者保证没人再写时僵尸任务也会自己消失，后者兜住定时器被节流的后台标签页。
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
    scheduleExpiry()
  }

  /**
   * 纯广播：**不写池、不动快照**，所以订阅列表不会因为它多一行再少一行。
   *
   * 实做已移到 `runtime/notify`：通知是独立的一条线，池只做转发 ——
   * 消息序号、跨页通道、订阅者都在那边，池不再持有第二套。
   */
  function broadcast(input: TaskNotificationMessageInput): TaskNotificationMessage {
    return publishNotification(input.title, input)
  }

  function find(id: string): TaskNotificationRecord | undefined {
    return localShard().find((task) => task.id === id)
  }

  /**
   * 按键找正在跑的条目：看的是合并后的快照（过期行已在 collect 里滤掉），本页与远端一视同仁。
   * 池里的记录恒为 running —— 结束即移出，所以「存在」就等于「正在处理中」。
   */
  function findByKey(project: string, key: string): TaskNotificationRecord | undefined {
    return store.getState().tasks.find((task) => task.project === project && task.key === key)
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

  /** 复用一条记录时要换掉按钮：先摘掉旧的 actions 字段，空数组等同于「没有按钮」。 */
  function withoutActions(task: TaskNotificationRecord): TaskNotificationRecord {
    const next = { ...task }
    delete (next as { actions?: readonly TaskNotificationActionInfo[] }).actions
    return next
  }

  /** Claim the page-level liveness lock. Called on connect / refresh, idempotent. */
  function holdLiveness(): void {
    // offline 池从不广播分片，没人会探测它，申请锁只是给别人的 mock 添噪音。
    if (offline || locksHeld || locks === null) return
    locksHeld = true
    lockAttempt += 1
    const attempt = lockAttempt
    // 只有「最新一次申请」的失败才复位：bfcache 恢复后旧申请迟到的 rejection 不能把新标记打掉。
    const failed = (error: unknown): void => {
      if (attempt !== lockAttempt) return
      locksHeld = false
      console.warn('[dsh-plugin-core] 存活锁申请失败，其它页面可能把本页判为已离开', error)
    }
    // 被拒绝既不能漏成 unhandled，也不能假装拿到了锁；同步抛错（mock / 垫片）同理。
    try {
      void Promise.resolve(locks.hold(lockNameFor(origin))).catch(failed)
    } catch (error) {
      failed(error)
    }
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
    channel = openBroadcastChannel(channelName)
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
    // dispose 期间摘掉的回收定时器在这里补回来（条目和 updatedAt 都还在）。
    scheduleExpiry()
  }

  function refresh(): void {
    // 顺便重试存活锁：上次被浏览器拒绝时，这里补一次。
    holdLiveness()
    post({ kind: 'hello', origin })
  }

  /**
   * 幂等登记的实做：带 `key` 且本页已有同键条目 → 就地更新那一条并复用它的句柄（`created: false`）。
   * 别的页面占着同一个键 → 抛冲突，因为作业在它那一页，本页拿到也点不动。
   */
  function ensure(input: TaskNotificationInput): TaskNotificationClaim {
    // Resolve before touching the pool: a missing project must not leave a row behind.
    const project = requireProject(input.project)
    if (project === null) throw new Error('task notification project cannot be null when registering')
    const key = input.key === undefined ? undefined : taskKey(input.key)
    const group = normalizeGroup(input.group)
    const detail = cloneDetail(input.detail)
    const actions = normalizeActions(input.actions)
    const runs = input.actions?.map((action) => action.run) ?? []
    const hidden = input.hidden === true
    const timeoutMs = input.timeoutMs ?? 0
    if (!Number.isFinite(timeoutMs) || timeoutMs < 0) {
      throw new Error('task notification timeoutMs must be a finite number >= 0')
    }
    // 写入侧自己也验：一条非法记录会让整页分片在对端被整片丢弃，不能只靠收线侧兜。
    if (typeof input.title !== 'string') throw new Error('task notification title must be a string')
    assertOptionalText(input, ['projectLabel', 'groupLabel', 'icon', 'iconSvg'])
    connect()

    if (key !== undefined) {
      const existing = findByKey(project, key)
      if (existing !== undefined) {
        if (existing.origin !== origin) throw new TaskNotificationConflictError(key, existing.origin)
        const handle = handles.get(existing.id)
        // 句柄在才算真复用；没有句柄只可能是 publish 期间的重入，那种情况按新条目处理。
        if (handle !== undefined) {
          // 按钮换成本次给的那组：重挂载后的新闭包才是此刻活着的那份。
          if (input.actions !== undefined) {
            for (const runnerId of [...runners.keys()]) {
              if (runnerId.startsWith(`${existing.id}#`)) runners.delete(runnerId)
            }
            runs.forEach((run, index) => { runners.set(runnerKey(existing.id, index), run) })
          }
          // 内容以本次调用为准，但只覆盖真正给了的字段：反复 ensure 不会把上一次挂的分组 / 按钮弄没。
          const next: TaskNotificationRecord = {
            ...(input.actions === undefined ? existing : withoutActions(existing)),
            title: input.title,
            ...(detail === undefined ? {} : { detail }),
            ...(input.group === undefined ? {} : { group }),
            ...(input.projectLabel === undefined ? {} : { projectLabel: input.projectLabel }),
            ...(input.groupLabel === undefined ? {} : { groupLabel: input.groupLabel }),
            ...(input.icon === undefined ? {} : { icon: input.icon }),
            ...(input.iconSvg === undefined ? {} : { iconSvg: input.iconSvg }),
            ...(input.hidden === undefined ? {} : { hidden: input.hidden }),
            ...(input.actions === undefined || actions.length === 0 ? {} : { actions }),
            updatedAt: Date.now(),
          }
          publish((current) => (current.some((task) => task.id === existing.id) ? replace(current, next) : current), {
            type: 'updated',
            task: next,
          })
          return { handle, created: false }
        }
      }
    }
    const now = Date.now()
    const id = `${origin}:${String(++idSeq)}`
    const record: TaskNotificationRecord = {
      id,
      ...(key === undefined ? {} : { key }),
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

    // 先放方法、finisher 与句柄再 publish：条目一可见就必须可点、可收尾、能被同键复用，
    // 中间不留空窗。订阅者若在 publish 里抛错，句柄虽拿不到，settleLocal 仍能收掉这一条。
    runs.forEach((run, index) => { runners.set(runnerKey(id, index), run) })
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
        // 与 register 同一套：坏值在本页抛，别让它造出一条过不了收线校验的记录（那会让整页分片在对端被丢）。
        assertOptionalText(patch, ['title', 'groupLabel', 'icon', 'iconSvg'])
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
    handles.set(id, handle)
    publish((current) => [...current, record], { type: 'registered', task: record })

    function finish(outcome: 'done' | 'failed', reason?: string): void {
      if (isSettled) return
      const current = find(id)
      if (current === undefined) return
      isSettled = true
      finishers.delete(id)
      handles.delete(id)
      // 按钮可能被同键复用换过，按 id 前缀清，别只清注册时那一组。
      for (const runnerId of [...runners.keys()]) {
        if (runnerId.startsWith(`${id}#`)) runners.delete(runnerId)
      }
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
      resolveSettled({ outcome, reason: reasonText, task: final })
    }

    return { handle, created: true }
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
    register: (input) => ensure(input).handle,
    ensure,
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
      clearExpiryTimer()
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
  ensure: (input) => globalPool().ensure(input),
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
  /** 业务键：同页重复登记就地复用同一条，跨页则抛冲突（见 `TaskNotificationInput.key`）。 */
  key?: TaskKey
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
  /** 不进默认列表（仍进池、仍可 await）；与回收无关。 */
  hidden?: boolean
  /** 回收窗口（毫秒）；缺省 0 = 不回收，想兜底就显式给。 */
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
  /** 幂等登记：带 key 时本页已有同键条目就地复用，并告诉你这条是不是刚建的。 */
  ensure(title: string, options?: NotifyTaskOptions): TaskNotificationClaim
  /** 包住一段异步：成功走 done、失败走 fail，结果与异常原样透传。 */
  run<T>(title: string, work: Promise<T> | (() => Promise<T>), options?: NotifyTaskOptions): Promise<T>
}

function notifyTaskInput(title: string, options: NotifyTaskOptions): TaskNotificationInput {
  return {
    title,
    ...(options.project === undefined ? {} : { project: options.project }),
    ...(options.group === undefined ? {} : { group: options.group }),
    ...(options.key === undefined ? {} : { key: options.key }),
    ...(options.detail === undefined ? {} : { detail: options.detail }),
    ...(options.actions === undefined ? {} : { actions: options.actions }),
    ...(options.projectLabel === undefined ? {} : { projectLabel: options.projectLabel }),
    ...(options.groupLabel === undefined ? {} : { groupLabel: options.groupLabel }),
    ...(options.icon === undefined ? {} : { icon: options.icon }),
    ...(options.iconSvg === undefined ? {} : { iconSvg: options.iconSvg }),
    ...(options.hidden === undefined ? {} : { hidden: options.hidden }),
    ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
  }
}

function notifyTaskBase(title: string, options: NotifyTaskOptions = {}): TaskNotificationHandle {
  return taskNotifications.register(notifyTaskInput(title, options))
}

function ensureTask(title: string, options: NotifyTaskOptions = {}): TaskNotificationClaim {
  return taskNotifications.ensure(notifyTaskInput(title, options))
}

/** 除标题外的可选项；定义在 runtime，这里只转出去（对外契约不变）。 */
export type { NotifyMessageOptions }

/**
 * 纯广播：只发一个 `message` 事件，**不进池、不进列表**，所以不会有「出现一帧又消失」的闪动。
 *
 * 常驻、要进监控列表、要能被结束的，用 `notifyTask`。
 */
export function notifyMessage(title: string, options: NotifyMessageOptions = {}): TaskNotificationMessage {
  // 直接走 runtime：通知不依赖池实例，池没初始化也能发。
  return publishNotification(title, options)
}

function runTask<T>(
  title: string,
  work: Promise<T> | (() => Promise<T>),
  options: NotifyTaskOptions = {},
): Promise<T> {
  let claim: TaskNotificationClaim
  let key: string | undefined
  try {
    key = options.key === undefined ? undefined : taskKey(options.key)
    claim = taskNotifications.ensure(notifyTaskInput(title, options))
  } catch (error) {
    // 异步入口一律 reject：缺项目、坏 key、跨页冲突都别同步抛出去。
    return Promise.reject(error)
  }
  // 同键已在本页跑着：它没法既不起第二份活、又返回这段 work 的结果，只能拒绝。
  if (key !== undefined && !claim.created) {
    return Promise.reject(new TaskNotificationConflictError(key, taskNotifications.origin))
  }
  const handle = claim.handle
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

export const notifyTask: NotifyTask = Object.assign(notifyTaskBase, { ensure: ensureTask, run: runTask })

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
