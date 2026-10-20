import { createElement as h } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Toaster, toast } from 'sonner'

export type ToastVariant = 'info' | 'success' | 'error'

export interface ToastOptions {
  variant?: ToastVariant
  /** 停留时长（毫秒），默认 2600。 */
  durationMs?: number
  /** 整条自定义颜色（背景色）。传了就走 unstyled 自定义卡，覆盖默认语义色。 */
  color?: string
  /** toast 消失（自动或手动关闭）后触发。 */
  onDismiss?: () => void
}

const DEFAULT_MS = 2600
const ROOT_ID = 'dshpc-toast-root'

let root: Root | null = null
let themeObserver: MutationObserver | null = null

// 宿主暗色判据是 body[data-ds-dark-theme]（不是 prefers-color-scheme），
// Sonner 的 theme 必须显式传，故从这里读并监听变化。
function currentTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light'
}

function renderToaster(): void {
  if (root === null) return
  root.render(
    h(Toaster, {
      theme: currentTheme(),
      position: 'bottom-center',
      // 不开 richColors / closeButton：官方默认才是「中性卡 + 语义色只在图标」；
      // closeButton 在宿主里吃不到 Sonner 的 CSS 变量，会渲染成白底方块叉（真机踩过）。
    }),
  )
}

// 全局唯一 Toaster：命令式 toast() 需要一个挂着的 Toaster 才能渲染；
// 首次 showToast 时懒挂载一个 React root，避免无 document 环境（SSR / 单测）崩。
function ensureToaster(): void {
  if (root !== null) return
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return
  const container = document.createElement('div')
  container.id = ROOT_ID
  document.body.appendChild(container)
  root = createRoot(container)
  renderToaster()
  themeObserver = new MutationObserver(() => renderToaster())
  themeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-ds-dark-theme'],
  })
}

/**
 * 弹一条轻提示（**命令式**，不要求调用方挂组件）。
 *
 * 底层用 Sonner（第三方，已作为 core 内部依赖封装，不对外 re-export）。
 * 满足：文字 / 时长 / 整条自定义色 / 消失回调；暗色跟随宿主 `body[data-ds-dark-theme]`。
 *
 * 无 `document` 时静默跳过（Node 单测 / SSR 不炸）。
 */
export function showToast(message: string, opts?: ToastOptions): void {
  if (typeof document === 'undefined') return
  ensureToaster()

  const duration = opts?.durationMs ?? DEFAULT_MS
  const onDismiss = opts?.onDismiss

  if (opts?.color !== undefined) {
    toast(message, {
      duration,
      unstyled: true,
      onDismiss,
      className: 'dshpc-toast-custom',
      style: {
        background: opts.color,
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.18)',
        fontSize: '14px',
        lineHeight: '20px',
      },
    })
    return
  }

  const variant = opts?.variant ?? 'info'
  if (variant === 'success') {
    toast.success(message, { duration, onDismiss })
  } else if (variant === 'error') {
    toast.error(message, { duration, onDismiss })
  } else {
    toast(message, { duration, onDismiss })
  }
}
