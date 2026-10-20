import { createElement as h, Fragment, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ensureControls, getStyleKit } from './css.js'
import { AlertModal, type AlertModalProps } from './AlertModal.js'
import { ConfirmModal, type ConfirmModalProps } from './ConfirmModal.js'

interface HostEntry {
  id: number
  node: ReactNode
}

// ⚠️ core 的 StyleKit / i18n 都是**模块级单例**（见 css.ts 注释），不依赖 React Context，
// 所以命令式弹窗所在的独立 root 天然能读到它们——无需手动注入插件上下文。
// 唯一读不到的是「插件自己定义的 React Context」，那是用户的私有环境，命令式本就不继承。

let hostRoot: Root | null = null
let hostContainer: HTMLDivElement | null = null
let entries: HostEntry[] = []
let idSeq = 0

/** 取（懒建）常驻挂载根；非浏览器环境返回 null。 */
function getHostRoot(): Root | null {
  if (typeof document === 'undefined') return null
  if (hostRoot === null) {
    hostContainer = document.createElement('div')
    hostContainer.setAttribute('data-dshpc-modal-host', '')
    document.body.appendChild(hostContainer)
    hostRoot = createRoot(hostContainer)
  }
  return hostRoot
}

/** 重渲染当前堆叠；空了就卸载回收，不残留空根。 */
function flush(): void {
  const root = getHostRoot()
  if (root === null) return
  ensureControls(getStyleKit())
  if (entries.length === 0) {
    root.unmount()
    hostContainer?.remove()
    hostRoot = null
    hostContainer = null
    return
  }
  root.render(h(Fragment, null, entries.map((e) => e.node)))
}

function dismiss(id: number): void {
  entries = entries.filter((e) => e.id !== id)
  flush()
}

export type ConfirmOptions = Omit<ConfirmModalProps, 'onConfirm' | 'onCancel'>
export type AlertOptions = Omit<AlertModalProps, 'onConfirm'>

/** 命令式确认框：Promise 形式，`true`=确定 / `false`=取消（或点遮罩 / Esc）。 */
export function confirmModal(opts: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const id = ++idSeq
    const close = (result: boolean): void => {
      dismiss(id)
      resolve(result)
    }
    entries.push({
      id,
      node: h(ConfirmModal, { ...opts, onConfirm: () => close(true), onCancel: () => close(false) }),
    })
    flush()
  })
}

/** 命令式警告框：Promise 在关闭时 resolve（单按钮，关闭即确认）。 */
export function alertModal(opts: AlertOptions): Promise<void> {
  return new Promise<void>((resolve) => {
    const id = ++idSeq
    const close = (): void => {
      dismiss(id)
      resolve()
    }
    entries.push({ id, node: h(AlertModal, { ...opts, onConfirm: close }) })
    flush()
  })
}
