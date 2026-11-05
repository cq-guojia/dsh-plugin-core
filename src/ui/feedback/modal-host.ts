import { createElement as h, Fragment, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ensureControls, getStyleKit } from '../infra/css.js'
import { AlertModal, type AlertModalProps } from './AlertModal.js'
import { ConfirmModal, type ConfirmModalProps } from './ConfirmModal.js'
import { isSuccess, isThenable } from '../infra/thenable.js'

interface HostEntry {
  id: number
  /** 锁死状态由条目自己拿着：命令式弹窗没有 props 可改，改它就重渲一次。 */
  locked: boolean
  render: () => ReactNode
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
  root.render(h(Fragment, null, entries.map((e) => h(Fragment, { key: e.id }, e.render()))))
}

function dismiss(id: number): void {
  entries = entries.filter((e) => e.id !== id)
  flush()
}

// ── 宿主皮肤注册：official.js 在加载时调用，把「宿主原生 Modal」渲染器注入进来 ──
// ui 入口（本文件）零官方依赖，故 host 渲染不住这里，只留一个注册槽；
// confirmModal/alertModal 传 skin:"host" 时委托给它，没注册则回落 core 并报一次警。
export interface HostConfirmArgs {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}
export interface HostAlertArgs {
  title?: string
  description?: string
  confirmText?: string
}
export interface HostDialogHandlers {
  confirm: (opts: HostConfirmArgs) => Promise<boolean>
  alert: (opts: HostAlertArgs) => Promise<void>
}
let hostHandlers: HostDialogHandlers | null = null
export function registerHostDialog(handlers: HostDialogHandlers): void {
  hostHandlers = handlers
}

/** 命令式弹窗的遥控器：异步期间自己决定锁不锁整框 —— 与按钮转圈（loading）互不干扰。 */
export interface DialogControl {
  /** 锁死整框（true）/ 解锁（false）：所有控件点不到、Tab 进不去、也关不掉。框已关掉后再调是空操作。 */
  setLocked(locked: boolean): void
}

/** 点按钮的回调：返回 thenable 即视为「消费方要做异步处理」；`ctl` 用来在跑的过程中锁 / 解锁整框。 */
type DialogHandler = (ctl: DialogControl) => unknown

// 命令式不收静态 `locked`：锁与解锁都走 `ctl`，一个开关只留一个入口。
export type ConfirmOptions = Omit<
  ConfirmModalProps,
  'onConfirm' | 'onCancel' | 'confirmLoading' | 'cancelLoading' | 'locked'
> & {
  skin?: 'core' | 'host'
  /** 确认回调；异步期间确认钮转圈、整框不可关，resolve 后按 `true` 关闭，reject 后恢复可点；返回 `false` 不关。 */
  onConfirm?: DialogHandler
  /** 取消 / 遮罩 / Esc 回调；异步语义同 `onConfirm`，resolve 后按 `false` 关闭（返回 `false` 同样不关）。 */
  onCancel?: DialogHandler
}
export type AlertOptions = Omit<AlertModalProps, 'onConfirm' | 'confirmLoading' | 'locked'> & {
  skin?: 'core' | 'host'
  /** 确认回调（遮罩 / Esc 同一个出口）；异步期间转圈并锁死关闭，settle 后才关，返回 `false` 不关。 */
  onConfirm?: DialogHandler
}

/**
 * 命令式确认框：Promise 形式，`true`=确定 / `false`=取消（或点遮罩 / Esc）。`skin:"host"` 走宿主原生 Modal。
 * 回调返回 Promise 时进入 loading（按钮转圈 + 遮罩 / Esc 锁死），settle 后才真正关闭。
 */
export function confirmModal(opts: ConfirmOptions): Promise<boolean> {
  if (opts.skin === 'host') {
    if (hostHandlers !== null) {
      return hostHandlers.confirm({
        title: opts.title == null ? undefined : String(opts.title),
        description: opts.message == null ? undefined : String(opts.message),
        confirmText: opts.confirmText,
        cancelText: opts.cancelText,
        danger: opts.tone === 'danger',
      })
    }
    console.warn('[dsh-plugin-core] confirmModal skin:"host" 需先引入官方适配层 official.js，已回落到 core 皮肤')
  }
  const { skin: _skin, onConfirm, onCancel, ...core } = opts
  void _skin
  return new Promise<boolean>((resolve) => {
    const id = ++idSeq
    let closed = false
    const close = (result: boolean): void => {
      if (closed) return
      closed = true
      dismiss(id)
      resolve(result)
    }
    // 锁只活在这条弹窗里：entry 一走、下一框自然是未锁的初始态。
    const entry: HostEntry = { id, locked: false, render: () => null }
    const ctl: DialogControl = {
      setLocked: (next: boolean): void => {
        if (closed || entry.locked === next) return
        entry.locked = next
        flush()
      },
    }
    // 「跑完关不关」归这里；转圈与锁框归 Button / ConfirmModal。把原 promise 返回给 Button 去转。
    const run = (which: 'confirm' | 'cancel'): unknown => {
      if (closed) return undefined
      const out = (which === 'confirm' ? onConfirm : onCancel)?.(ctl)
      // 只有明确的 false 表示「这次没成」：框留着让人重试（消费方自己去提示）
      const settle = (value: unknown): void => {
        if (isSuccess(value)) close(which === 'confirm')
      }
      if (!isThenable(out)) {
        settle(out)
        return undefined
      }
      // reject 也不关：按钮已自己恢复可点，错误由 Button 打到控制台
      void out.then(settle, () => {})
      return out
    }
    entry.render = () =>
      h(ConfirmModal, { ...core, locked: entry.locked, onConfirm: () => run('confirm'), onCancel: () => run('cancel') })
    entries.push(entry)
    flush()
  })
}

/**
 * 命令式警告框：Promise 在关闭时 resolve（单按钮，关闭即确认）。`skin:"host"` 走宿主原生 Modal。
 * 回调返回 Promise 时进入 loading（按钮转圈 + 遮罩 / Esc 锁死），settle 后才真正关闭。
 * 回调返回 `false`（同步或 resolve 成 `false`）⇒ 本次当作没成，框不关。
 */
export function alertModal(opts: AlertOptions): Promise<void> {
  if (opts.skin === 'host') {
    if (hostHandlers !== null) {
      return hostHandlers.alert({
        title: opts.title == null ? undefined : String(opts.title),
        description: opts.message == null ? undefined : String(opts.message),
        confirmText: opts.confirmText,
      })
    }
    console.warn('[dsh-plugin-core] alertModal skin:"host" 需先引入官方适配层 official.js，已回落到 core 皮肤')
  }
  const { skin: _skin, onConfirm, ...core } = opts
  void _skin
  return new Promise<void>((resolve) => {
    const id = ++idSeq
    let closed = false
    const close = (): void => {
      if (closed) return
      closed = true
      dismiss(id)
      resolve()
    }
    // 同 confirmModal：锁只活在这条弹窗里，entry 一走、下一框自然是未锁的初始态。
    const entry: HostEntry = { id, locked: false, render: () => null }
    const ctl: DialogControl = {
      setLocked: (next: boolean): void => {
        if (closed || entry.locked === next) return
        entry.locked = next
        flush()
      },
    }
    // 同 confirmModal：只决定「跑完关不关」，转圈与锁框交给 Button / AlertModal。
    const run = (): unknown => {
      if (closed) return undefined
      const out = onConfirm?.(ctl)
      const settle = (value: unknown): void => {
        if (isSuccess(value)) close()
      }
      if (!isThenable(out)) {
        settle(out)
        return undefined
      }
      void out.then(settle, () => {})
      return out
    }
    entry.render = () => h(AlertModal, { ...core, locked: entry.locked, onConfirm: () => run() })
    entries.push(entry)
    flush()
  })
}
