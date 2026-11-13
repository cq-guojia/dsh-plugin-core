/**
 * Toast 的纯数据层：**类型 + 本页投递队列**。
 *
 * 这里不是通知中心。跨页/后台任务的登记、状态、结算、广播都在
 * `src/ui/infra/task-notifications.ts`（通知中心），它不认识本文件里的任何字段。
 * 本文件零 React / 零 DOM / 零 sonner：发送侧只投递，绘制由 `Toast.ts` 订阅后负责。
 *
 * 跨副本共享：core 被内联进每个插件 bundle，模块级状态各副本一份 ⇒ 用 `Symbol.for`
 * 收口（与 toast-host / loading-host 同一手法），A 副本投递、B 副本的界面也能收到。
 */
export type ToastVariant = 'info' | 'success' | 'error' | 'warning'

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface ToastOptions {
  variant?: ToastVariant
  /** 停留时长（毫秒），默认 2600。 */
  durationMs?: number
  /** 整条自定义颜色（背景色）。传了就走 unstyled 自定义卡，覆盖默认语义色。 */
  color?: string
  /** toast 消失（自动或手动关闭）后触发。 */
  onDismiss?: () => void
  /** 出现位置（作用于全局唯一 Toaster），默认 'bottom-center'。 */
  position?: ToastPosition
}

// 与 Button 的 variant 同名同值：纯模块不反向引用 UI 文件，赋值到 Button 时由 tsc 校验一致性。
export type ToastActionVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'

/** 封装好的提示：右侧动作按钮（用我们自己的 Button 样式）。 */
export interface ToastAction {
  text: string
  /** 按钮样式，默认 'info'（实心无边框）。 */
  variant?: ToastActionVariant
  onClick: () => void
}

/** 两种提示共用的显示选项。 */
export interface NotifyBaseOptions {
  variant?: ToastVariant
  /** 次要说明文字（标题下方）。 */
  description?: string
  durationMs?: number
  position?: ToastPosition
}

/** 本页提示（默认）：可以带动作按钮。 */
export interface LocalNotifyOptions extends NotifyBaseOptions {
  broadcast?: false
  /** 右侧 1–2 个动作按钮；传了就走我们封装的卡片样式并渲染按钮。 */
  actions?: ToastAction[]
}

/**
 * 广播提示：同源所有已接入通知中心的页面各弹一条（本页也靠接收端弹）。
 *
 * **不能带动作按钮** —— 函数无法跨页（结构化克隆只传纯数据），所以 `actions` 在
 * 这里被类型禁止：写着 `broadcast: true` 又传 `actions` 会**编译期就报错**；
 * 绕过类型的 JS 调用方在运行期也会被当场拦下（与 `detail` 传函数同一口径）。
 * `durationMs` / `position` 同样不随消息走，接收端统一用 2600ms。
 */
export interface BroadcastNotifyOptions extends NotifyBaseOptions {
  broadcast: true
  actions?: never
}

export type NotifyOptions = LocalNotifyOptions | BroadcastNotifyOptions

/** 一条待绘制的提示：toast 自己的词汇，通知中心不认识也不解释。 */
export interface ToastPayload {
  message: string
  variant: ToastVariant
  /** native = showToast（sonner 原味）；card = notify（我们的卡）。 */
  style: 'native' | 'card'
  description?: string
  durationMs: number
  /** 出现位置；不传则沿用当前全局位置。 */
  position?: ToastPosition
  /** showToast 的整条自定义色（仅 native 有意义）。 */
  color?: string
  onDismiss?: () => void
  /** notify 的右侧按钮（仅 card，1–2 个）。 */
  actions?: ToastAction[]
}

/** 全局注册表键：`Symbol.for` 跨 bundle 副本天然共享同一个符号。 */
export const TOAST_QUEUE_KEY = Symbol.for('dsh-plugin-core/toast-queue')

interface PendingToast {
  payload: ToastPayload
  at: number
}

interface ToastQueue {
  listeners: Set<(payload: ToastPayload) => void>
  /** 界面还没挂上时先收下，挂上后补发（sonner 的 subscribe 重放同法），不静默丢消息。 */
  pending: PendingToast[]
}

/** 界面长期缺席时不让广播把队列撑成无限历史。 */
const MAX_PENDING = 20

function queue(): ToastQueue {
  const g = globalThis as Record<symbol, ToastQueue | undefined>
  let q = g[TOAST_QUEUE_KEY]
  if (q === undefined) {
    q = { listeners: new Set(), pending: [] }
    g[TOAST_QUEUE_KEY] = q
  }
  return q
}

function enqueue(q: ToastQueue, payload: ToastPayload): void {
  q.pending.push({ payload, at: Date.now() })
  if (q.pending.length > MAX_PENDING) q.pending.splice(0, q.pending.length - MAX_PENDING)
}

/** 单个订阅者画失败不能拖垮其它订阅者，也不能把消息无声吞掉。 */
function deliver(listener: (payload: ToastPayload) => void, payload: ToastPayload): boolean {
  try {
    listener(payload)
    return true
  } catch (error) {
    console.warn(`[dsh-plugin-core] toast 渲染失败：${String(error)}`)
    return false
  }
}

/** 投递一条提示。不碰 DOM，也不要求界面已挂载。 */
export function pushToast(payload: ToastPayload): void {
  const q = queue()
  if (q.listeners.size === 0) {
    enqueue(q, payload)
    return
  }
  let shown = false
  for (const listener of q.listeners) {
    if (deliver(listener, payload)) shown = true
  }
  // 一个都没画成才回队；有任一订阅者画过就不再补发，避免重复弹。
  if (!shown) enqueue(q, payload)
}

/** 界面订阅投递；订阅时只补发「还没过自己停留时长」的。返回退订函数。 */
export function subscribeToasts(listener: (payload: ToastPayload) => void): () => void {
  const q = queue()
  q.listeners.add(listener)
  const now = Date.now()
  for (const item of q.pending.splice(0)) {
    if (now - item.at > item.payload.durationMs) continue
    if (!deliver(listener, item.payload)) enqueue(q, item.payload)
  }
  return () => {
    q.listeners.delete(listener)
  }
}
