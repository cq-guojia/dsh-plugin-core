// 跨副本 toast 宿主（多插件同页只留一个提示区）。
//
// core 被打进每个插件的 bundle，模块级状态各副本一份 ⇒ 旧实现 N 个插件同页会挂出
// N 个同 id 容器 + N 个 Toaster 叠在同一屏位。这里在 globalThis 上用 Symbol.for 的
// 全局符号办一个单例：先到场的副本建宿主（唯一容器 + 唯一 Toaster），之后所有副本
// （含跨版本）都把 payload 交给已注册的宿主渲染。
// 纯逻辑、零 DOM / React 依赖 ⇒ Node 单测可直接断言单例语义。

import type { ToastAction, ToastPosition, ToastVariant } from './Toast.js'

/** 全局注册表键：Symbol.for 跨 bundle 副本天然共享同一个符号。 */
export const TOAST_HOST_KEY = Symbol.for('dsh-plugin-core/toast-host')

/** 全局单例：已注册则直接返回（不触发 create），否则建一个并注册。 */
export function claimToastHost<T>(create: () => T): T {
  const g = globalThis as Record<symbol, T | undefined>
  const existing = g[TOAST_HOST_KEY]
  if (existing !== undefined) return existing
  const created = create()
  g[TOAST_HOST_KEY] = created
  return created
}

export interface ToastPayload {
  message: string
  variant: ToastVariant
  /** native = showToast（sonner 原味）；card = notify（我们的卡）。 */
  style: 'native' | 'card'
  description?: string
  durationMs: number
  /** showToast 的整条自定义色（仅 native 有意义）。 */
  color?: string
  onDismiss?: () => void
  /** notify 的右侧按钮（仅 card，1–2 个）。 */
  actions?: ToastAction[]
}

export interface ToastHost {
  show(payload: ToastPayload): void
  /** 全局统一位置：任一副本调用对所有插件生效。 */
  setPosition(position: ToastPosition): void
}
