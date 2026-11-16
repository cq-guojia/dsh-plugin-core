/**
 * 跨页通知：发一条 / 收一条，外加它需要的几样底座。
 *
 * 这个文件**不认识任务**。任务中心借它的通道发自己的分片，借它的事件总线发自己的事件；
 * 反过来它不知道有「任务」这回事，也不替任何消费方决定收到之后该干什么
 * （弹 toast 是 `ui/feedback/notify-bridge.ts` 的选择，不是这里的默认行为）。
 *
 * 底座都是「进程内唯一」的，因为 core 会被内联进每个插件 bundle：
 *   - 总线：`Symbol.for` 单例，避免两个副本各建一条导致事件分流；
 *   - 默认分组：同上，`setDefaultTaskProject()` 一次设置，每个副本都看得见；
 *   - 默认 scope：同上，一条通道、一份订阅者名单。
 *
 * 通道**不**收口成单例：`BroadcastChannel` 收不到自己 post 的消息，收口会让同一个上下文里
 * 的第二个逻辑端（测试里的第二页、或将来的第二个消费者）永远收不到。所以「一个 scope 一条实例」，
 * 测试可以 `createNotifyScope()` 造两个互通的端。
 *
 * 零 React / 零 DOM at import time：`BroadcastChannel` 在第一次收发时才开，
 * Node 与 SSR 可以直接 import 这个模块。
 */

/** 协议版本写进 key 里：线格式变了就换一个 host，旧副本不会被误认。 */
export const NOTIFY_PROTOCOL = 2
/** 通道名。跨 bundle 副本靠它汇到一条线上，改名等于换协议。 */
export const NOTIFY_CHANNEL = 'dsh-plugin-core/task-notifications/v2'
/** 默认分组挂在全局 symbol 上：每个内联副本必须看到同一个值。 */
export const NOTIFY_PROJECT_KEY = Symbol.for('dsh-plugin-core/task-notifications/project/v2')
/** 事件总线的全局槽位。 */
export const NOTIFY_EVENTS_KEY = Symbol.for('dsh-plugin-core/task-notifications/events/v2')

// ── 值 ────────────────────────────────────────────────────────────────────

/**
 * 详情载荷：任意 JSON 值。对象与数组按结构化克隆算法过线，调用方不用自己
 * stringify —— 这里会在入口处克隆一份私有副本。函数、DOM 节点、类实例直接报错。
 */
export type NotifyDetail =
  | string
  | number
  | boolean
  | null
  | readonly NotifyDetail[]
  | { readonly [key: string]: NotifyDetail }

export type NotifyLevel = 'info' | 'success' | 'warning' | 'error'

/**
 * 一条通知：只出事件、**不进任何列表**，所以不会有一闪的行、没有 id 可查、也不可结束。
 * 要常驻的状态请用任务。
 */
export interface NotifyMessage {
  readonly id: string
  readonly project: string
  readonly group: string
  readonly title: string
  readonly icon?: string
  readonly iconSvg?: string
  readonly detail?: NotifyDetail
  readonly level: NotifyLevel
  readonly at: number
}

/** 除标题外的可选项。标题单独作第一个参数 —— 它永远必填，不该混在可选项里。 */
export interface NotifyMessageOptions {
  /** 缺省用全局默认分组；两者都没有直接报错。 */
  project?: string
  /** 二级分组，缺省 `'default'`。 */
  group?: string
  icon?: string
  iconSvg?: string
  detail?: NotifyDetail
  level?: NotifyLevel
}

// ── 默认分组 ──────────────────────────────────────────────────────────────

interface DefaultProjectSlot {
  value?: string
}

function projectSlot(): DefaultProjectSlot | undefined {
  const g = globalThis as unknown as Record<symbol, DefaultProjectSlot | undefined>
  return g[NOTIFY_PROJECT_KEY]
}

function writeProjectSlot(): DefaultProjectSlot {
  const g = globalThis as unknown as Record<symbol, DefaultProjectSlot | undefined>
  let slot = g[NOTIFY_PROJECT_KEY]
  if (slot === undefined) {
    slot = {}
    g[NOTIFY_PROJECT_KEY] = slot
  }
  return slot
}

/** 应用启动时调一次。传 `undefined` 清空（测试依赖这个）。 */
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

/** 缺省取全局默认分组；`null` 表示「不按分组过滤」，只有查询侧会传。 */
export function resolveProject(project?: string | null): string | null {
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

export function normalizeGroup(group?: string): string {
  if (group === undefined) return 'default'
  if (group.trim() === '') throw new Error('task notification group must be a non-empty string')
  return group
}

// ── 载荷校验 ──────────────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** JSON 值检查，带深度上限，避免环状载荷拖死解析。 */
export function isDetail(value: unknown, depth = 0): value is NotifyDetail {
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
 * 入口处克隆一份私有副本：之后改原对象不许渗进来；
 * 线上带不了的东西必须在这里报错，而不是等开了通道之后才以另一种方式失败。
 */
export function cloneDetail(value: NotifyDetail | undefined): NotifyDetail | undefined {
  if (value === undefined) return undefined
  if (!isDetail(value)) {
    throw new Error(
      'task notification detail must be a JSON value (string, number, boolean, null, array or plain object)',
    )
  }
  return typeof structuredClone === 'function'
    ? (structuredClone(value) as NotifyDetail)
    : (JSON.parse(JSON.stringify(value)) as NotifyDetail)
}

// ── 通道 ──────────────────────────────────────────────────────────────────

/**
 * 开一条 `BroadcastChannel`，不可用时返回 `null`（Node / 旧浏览器 / 被策略禁用）。
 *
 * **不缓存、不收口**：同名实例在同一个上下文里互收，但**收不到自己 post 的消息**。
 * 所以「一个逻辑端一条实例」才是对的 —— 收口成单例会让同上下文里的第二个逻辑端
 * （测试里的第二页、或将来的第二个消费者）永远收不到。要收口的是**总线**，不是通道。
 */
export function openBroadcastChannel(name: string): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null
  try {
    const channel = new BroadcastChannel(name)
    // Node 会为开着的通道保住事件循环；浏览器没有 unref。
    const withUnref = channel as BroadcastChannel & { unref?: () => void }
    withUnref.unref?.()
    return channel
  } catch {
    return null
  }
}

// ── 事件总线 ──────────────────────────────────────────────────────────────

export interface EventBus<E> {
  subscribe(listener: (event: E) => void): () => void
  emit(event: E): void
}

/** 建一个多播总线。**一个坏掉的监听者不许拖垮其它监听者**，所以逐个 try。 */
export function createEventBus<E>(): EventBus<E> {
  const listeners = new Set<(event: E) => void>()
  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    emit(event) {
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

/**
 * 跨 bundle 收口：同一个 `key` 全局只有一个总线。
 * 已有值形状不对时直接报错 —— 悄悄换一个会让事件分流且不报错。
 */
export function claimEventBus<E>(
  key: symbol,
  isValid: (value: unknown) => boolean,
  create: () => EventBus<E>,
): EventBus<E> {
  const g = globalThis as unknown as Record<symbol, unknown>
  const existing = g[key]
  if (existing !== undefined) {
    if (!isValid(existing)) {
      throw new Error('Incompatible dsh-plugin-core event bus; reload the page.')
    }
    return existing as EventBus<E>
  }
  const created = create()
  g[key] = created
  return created
}

export function isEventBusLike(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { emit?: unknown }).emit === 'function' &&
    typeof (value as { subscribe?: unknown }).subscribe === 'function'
  )
}

// ── 发 / 收 ───────────────────────────────────────────────────────────────

/** 线上格式：只带纯数据，`kind` 让同一条通道能承载多种用途。 */
export interface NotifyWire {
  readonly kind: 'notify'
  readonly origin: string
  readonly message: NotifyMessage
}

export function isNotifyWire(value: unknown): value is NotifyWire {
  if (!isRecord(value)) return false
  if (value.kind !== 'notify') return false
  if (typeof value.origin !== 'string') return false
  const message = value.message
  if (!isRecord(message)) return false
  if (message.detail !== undefined && !isDetail(message.detail)) return false
  return (
    typeof message.id === 'string' &&
    typeof message.project === 'string' &&
    typeof message.group === 'string' &&
    typeof message.title === 'string' &&
    typeof message.at === 'number' &&
    (message.level === 'info' ||
      message.level === 'success' ||
      message.level === 'warning' ||
      message.level === 'error')
  )
}

/** 第二个参数是「是否来自别的页面」，消费方据此决定要不要本地再弹一次。 */
export type NotifyListener = (message: NotifyMessage, remote: boolean) => void

export interface NotifyScopeOptions {
  /** 缺省 `NOTIFY_CHANNEL`。测试用私有名字模拟两个页面。 */
  channelName?: string
  /** 缺省随机生成；注入只用于确定性测试。 */
  origin?: string
}

/** 一个逻辑端：一条通道 + 一份订阅者名单 + 自己的消息序号。 */
export interface NotifyScope {
  readonly origin: string
  /** 发一条：先给本页订阅者，再发给同源的其它页。 */
  notifyMessage(title: string, options?: NotifyMessageOptions): NotifyMessage
  /** 订阅。返回取消函数。 */
  subscribe(listener: NotifyListener): () => void
  /** 关掉通道并清空订阅者（测试隔离 / 页面卸载用）。 */
  dispose(): void
}

function makeOrigin(): string {
  const c = globalThis.crypto
  if (typeof c?.randomUUID === 'function') return c.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

/**
 * 建一个逻辑端。同一个 `channelName` 的两个 scope 会互收（各自一条实例），
 * 这就是「跨页」在本模块里的形态 —— 真实浏览器里两个页面天然是两个 scope。
 */
export function createNotifyScope(options: NotifyScopeOptions = {}): NotifyScope {
  const channelName = options.channelName ?? NOTIFY_CHANNEL
  const origin = options.origin ?? makeOrigin()
  const listeners = new Set<NotifyListener>()
  let channel: BroadcastChannel | null = null
  let seq = 0

  function ensureChannel(): BroadcastChannel | null {
    if (channel !== null) return channel
    const opened = openBroadcastChannel(channelName)
    if (opened === null) return null
    opened.onmessage = (event: MessageEvent<unknown>) => {
      const data: unknown = event.data
      if (!isNotifyWire(data)) return
      if (data.origin === origin) return
      for (const listener of [...listeners]) {
        try {
          listener(data.message, true)
        } catch (error) {
          console.error('dsh-plugin-core: 通知监听者失败', error)
        }
      }
    }
    channel = opened
    return channel
  }

  return {
    origin,
    notifyMessage(title, options = {}): NotifyMessage {
      const project = resolveProject(options.project)
      if (project === null) throw new Error('task notification project cannot be null when broadcasting')
      const group = normalizeGroup(options.group)
      const detail = cloneDetail(options.detail)
      seq += 1
      const message: NotifyMessage = {
        id: `${origin}:msg:${String(seq)}`,
        project,
        group,
        title,
        ...(options.icon === undefined ? {} : { icon: options.icon }),
        ...(options.iconSvg === undefined ? {} : { iconSvg: options.iconSvg }),
        ...(detail === undefined ? {} : { detail }),
        level: options.level ?? 'info',
        at: Date.now(),
      }
      for (const listener of [...listeners]) {
        try {
          listener(message, false)
        } catch (error) {
          console.error('dsh-plugin-core: 通知监听者失败', error)
        }
      }
      ensureChannel()?.postMessage({ kind: 'notify', origin, message } satisfies NotifyWire)
      return message
    },
    subscribe(listener): () => void {
      listeners.add(listener)
      ensureChannel()
      return () => {
        listeners.delete(listener)
      }
    },
    dispose(): void {
      listeners.clear()
      if (channel !== null) {
        channel.onmessage = null
        channel.close()
        channel = null
      }
    },
  }
}

const DEFAULT_SCOPE_KEY = Symbol.for('dsh-plugin-core/notify/scope/v2')

/**
 * 默认逻辑端：跨 bundle 单例，一条通道一份订阅者名单。
 * 建过一次就挂在 globalThis 上，别的副本拿到同一个。
 */
export function defaultNotifyScope(): NotifyScope {
  const g = globalThis as unknown as Record<symbol, NotifyScope | undefined>
  let scope = g[DEFAULT_SCOPE_KEY]
  if (scope === undefined) {
    scope = createNotifyScope()
    g[DEFAULT_SCOPE_KEY] = scope
  }
  return scope
}

/**
 * 发一条通知：本地先通知本页订阅者，再发给同源的其它页。
 *
 * 没有默认行为 —— 想弹 toast 的那个消费方自己去订阅。
 */
export function notifyMessage(title: string, options?: NotifyMessageOptions): NotifyMessage {
  return defaultNotifyScope().notifyMessage(title, options)
}

/** 订阅默认逻辑端的通知。返回取消函数。 */
export function subscribeNotifications(listener: NotifyListener): () => void {
  return defaultNotifyScope().subscribe(listener)
}
