import { ensureControls } from './css.js'

export type ToastVariant = 'info' | 'success' | 'error'

const HOST_ID = 'dshpc-toast-host'
const DEFAULT_MS = 2600

/**
 * 弹一条轻提示（**命令式**，不要求调用方挂组件）。
 *
 * 为什么不走 React Context：toast 常在数据层 / 回调里触发，拿不到组件树；
 * 直接操作一个固定容器最简单，且无 document 时静默跳过（SSR / 单测不炸）。
 */
export function showToast(message: string, opts?: { variant?: ToastVariant; durationMs?: number }): void {
  if (typeof document === 'undefined') return
  ensureControls()
  const variant = opts?.variant ?? 'info'
  const host = ensureHost()
  const el = document.createElement('div')
  el.className = `dshpc-toast${variant === 'info' ? '' : ` dshpc-toast--${variant}`}`
  el.textContent = message
  host.appendChild(el)
  setTimeout(() => {
    el.remove()
    // 容器空了就撤掉，别在页面上留一个空壳
    if (host.childElementCount === 0) host.remove()
  }, opts?.durationMs ?? DEFAULT_MS)
}

function ensureHost(): HTMLElement {
  const found = document.getElementById(HOST_ID)
  if (found !== null) return found as HTMLElement
  const host = document.createElement('div')
  host.id = HOST_ID
  host.className = 'dshpc-toast-host'
  document.body.appendChild(host)
  return host
}
