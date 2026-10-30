/**
 * 停靠面板（PanelDock）—— 可停靠的右侧分栏容器。
 *
 * 形态：**布局成员，不是浮层**。占宽度、把主区挤窄，因此必须由调用方放进自己的
 * flex 根容器里；不能像 Modal 那样自挂 `document.body`（自挂只能遮盖、挤不窄）。
 *
 * 分工照成熟组件库的通行做法（Ant Design `Tabs` / `Drawer` 同一套）：
 *   · **结构写在调用点** —— `<PanelDock dock={dock}><DockPanel id="files">…</DockPanel></PanelDock>`；
 *   · **显隐归状态** —— `dock.open('files')` / `dock.close('files')`，只传 id，不传内容；
 *   · **头部可控** —— `title` / `icon` / `extra` 三件套；要更自由就 `header` 整块替换，`header={null}` 表示不要头部；
 *   · **关闭钮可退让** —— `closable={false}` 不出；`closeButton="floating"` 浮在右上角，不占头部布局。
 */
import { Children, createElement as h, isValidElement, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { t, type Translate } from '../utils/i18n.js'
import { startResizeLayoutWidth } from './resizer.js'
import {
  DEFAULT_PANEL_ID,
  clampWidth,
  closePanel,
  collapsePanel,
  emptyDock,
  expandPanel,
  isCollapsed as isCollapsedState,
  isOpen,
  openPanel,
  othersWidth,
  setPanelWidth,
  type DockState,
  type OpenResult,
} from './panel-dock-logic.js'
import { ensureComponentStyles } from './css.js'
import { PANEL_DOCK_CSS } from './panel-dock-css.js'
import { FEEDBACK_CSS } from './feedback-css.js'

// ── 分栏占宽契约（用户 2026-10-22 拍板）──
// 遮罩必须知道「页面右侧被分栏占掉多少」，否则它会把 dock 一起压暗、还吃掉点击
// （`.dshpc-modal-mask` 的 right inset 读的就是这个变量）。挂在根元素上，是因为遮罩不保证
// 是本 dock 那个 flex 行的后代；同页多个 dock 按实例求和，全部关掉即移除变量。
const INSET_VAR = '--dshpc-page-inset-right'
/** 分栏开着时给主区滚动条留的缝（px）：滚动条与分隔线只留 1px（用户 2026-10-28：
 *  「有一像素就可以了」）。缝隙也是 dock 的足迹 —— 遮罩让位量要一并计入，否则遮罩会盖住它。
 *  调用方可用 `--dshpc-dock-gap` 盖缝宽，但 TS 这份要跟着改。 */
const DOCK_GAP = 1
const dockInsets = new Map<string, { width: number; el: Element | null }>()
let dockSeq = 0

function publishInset(key: string, width: number, el: Element | null): void {
  // 先摘掉「元素已离开文档」的条目：有人绕过 close 直接 remove 挂载体时，React 的卸载
  // 清理不会跑，这份残留宽度会把遮罩永久卡在让位状态（2026-10-22 真机踩过）。
  for (const [stale, entry] of dockInsets) {
    if (entry.el !== null && !entry.el.isConnected) dockInsets.delete(stale)
  }
  if (width > 0) dockInsets.set(key, { width, el })
  else dockInsets.delete(key)
  if (typeof document === 'undefined') return
  let total = 0
  for (const entry of dockInsets.values()) total += entry.width
  const style = document.documentElement.style
  if (total > 0) style.setProperty(INSET_VAR, `${Math.round(total)}px`)
  else style.removeProperty(INSET_VAR)
}

/** 关闭钮位置：`auto` = 有头部就放头部行末、没头部就浮着。 */
export type DockCloseButton = 'auto' | 'header' | 'floating' | 'none'

/** 关闭来源：区分「用户点 ✕」与「代码关的」，拦截/清理时用得着。 */
export type DockCloseReason = 'button' | 'api'

export interface DockPanelProps {
  /** 组名（寻址键）；同名唯一。 */
  id: string
  /** 标题；`header` 传了非 undefined 的值时它只用于无障碍名。 */
  title?: ReactNode
  /** 标题前的图标位（可多个）。 */
  icon?: ReactNode
  /** 标题**右侧**的任意内容（可以是按钮、标签、下拉、甚至是弹层触发器）。 */
  extra?: ReactNode
  /**
   * 整块替换头部：
   *   · 不传 / `undefined` ⇒ 内置头（`icon` + `title` + `extra`）
   *   · `null` ⇒ 不要头部（此时关闭钮默认浮在右上角）
   *   · 其他 ReactNode ⇒ 你的头部，库不加内边距/边框/背景
   */
  header?: ReactNode | null
  /** 是否显示关闭钮（默认 true）。 */
  closable?: boolean
  /** 关闭钮位置（默认 `auto`）。 */
  closeButton?: DockCloseButton
  /** 自定义关闭图标（默认 ✕）。 */
  closeIcon?: ReactNode
  /** 首次打开时的宽度（px，默认 460）。 */
  width?: number
  /** 可拖动的宽度下限（默认 320）。 */
  minWidth?: number
  /** 可拖动的宽度上限；不传 = 只受视口与主区保底约束。 */
  maxWidth?: number
  /** 无头部时的无障碍名（缺省退回 `title`，再退回 `id`）。 */
  ariaLabel?: string
  children?: ReactNode
}

/**
 * 声明一个面板。**它自己不渲染任何东西**——由父级 `<PanelDock>` 读它的 props 后统一画。
 * 因此必须作为 `<PanelDock>` 的**直接子元素**（可以条件渲染成 `null`）。
 */
export function DockPanel(_props: DockPanelProps): null {
  return null
}

export interface PanelDockOptions {
  /** 同时存在的栏数上限（默认 3）。 */
  maxPanels?: number
  /** 新栏默认宽度（默认 460）。 */
  defaultWidth?: number
  /** 新栏默认宽度下限（默认 320）。 */
  minWidth?: number
  /** 宽度记忆前缀；传 `false` 关闭记忆（默认 `dshpc-dock`）。 */
  storageKey?: string | false
  /** 新开一栏后触发（重复打开已存在的不触发）。 */
  onOpen?: (event: { id: string; created: boolean }) => void
  /** 关闭**之前**触发；返回 `false` 可取消（未保存内容拦截就靠它）。 */
  onBeforeClose?: (event: { id: string; reason: DockCloseReason }) => boolean | undefined
  /** 已经关掉之后触发。 */
  onClose?: (event: { id: string; reason: DockCloseReason }) => void
  /** 拖宽松手后触发。 */
  onResize?: (event: { id: string; width: number }) => void
  /** 到上限被拒时触发（库不弹提示、不抛异常）。 */
  onLimitReached?: (event: { id: string }) => void
}

export interface PanelDockController {
  open(id?: string): OpenResult
  close(id?: string, reason?: DockCloseReason): void
  toggle(id?: string): OpenResult
  isOpen(id?: string): boolean
  /** 收起：面板退出布局、变成右侧固定耳朵（宽度保留，展开还原）。 */
  collapse(id?: string): void
  /** 展开：把耳朵收回、面板回到布局。已满栏时拒绝（触发 onLimitReached）。 */
  expand(id?: string): void
  isCollapsed(id?: string): boolean
  ids(): string[]
  setWidth(id: string, width: number): void
  subscribe(listener: () => void): () => void
  getSnapshot(): DockState
  /** 归一化后的默认值（组件兜底用）。 */
  defaults: { maxPanels: number; defaultWidth: number; minWidth: number }
}

function readStoredWidth(key: string): number | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

function writeStoredWidth(key: string, width: number): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(key, String(width))
  } catch {
    /* 隐私模式 / 配额满：记忆失败不影响功能 */
  }
}

/**
 * 造一个面板控制器。状态在它身上，组件用 `useSyncExternalStore` 订阅。
 *
 * 为什么状态不放在组件里：开门/关门常常发生在按钮 onClick、事件回调里（命令式），
 * 而**内容与头部仍在调用点声明**——这正是 Tabs 那种「状态 + children」的分工。
 */
export function createPanelDock(options: PanelDockOptions = {}): PanelDockController {
  const maxPanels = options.maxPanels ?? 3
  const defaultWidth = options.defaultWidth ?? 460
  const minWidth = options.minWidth ?? 320
  const storageKey = options.storageKey ?? 'dshpc-dock'
  const widthKey = (id: string): string => (storageKey === false ? '' : `${storageKey}:width:${id}`)

  let state: DockState = emptyDock()
  const listeners = new Set<() => void>()

  const emit = (next: DockState): void => {
    if (next === state) return
    state = next
    for (const listener of listeners) listener()
  }

  const controller: PanelDockController = {
    defaults: { maxPanels, defaultWidth, minWidth },
    open(id = DEFAULT_PANEL_ID) {
      const { state: next, result } = openPanel(state, id, maxPanels)
      if (result.ok && result.created) {
        const stored = storageKey === false ? null : readStoredWidth(widthKey(id))
        emit(stored === null ? next : setPanelWidth(next, id, stored))
        options.onOpen?.({ id, created: true })
      } else if (result.ok) {
        emit(next)
      } else {
        options.onLimitReached?.({ id })
      }
      return result
    },
    close(id = DEFAULT_PANEL_ID, reason: DockCloseReason = 'api') {
      // 对已收起的耳朵也放行：关闭 = 连耳朵一起抹掉。
      if (!isOpen(state, id) && !isCollapsedState(state, id)) return
      if (options.onBeforeClose?.({ id, reason }) === false) return
      emit(closePanel(state, id))
      options.onClose?.({ id, reason })
    },
    toggle(id = DEFAULT_PANEL_ID) {
      if (controller.isOpen(id)) {
        controller.close(id, 'api')
        return { ok: true, id, created: false }
      }
      return controller.open(id)
    },
    collapse(id = DEFAULT_PANEL_ID) {
      if (!isOpen(state, id)) return
      emit(collapsePanel(state, id))
    },
    expand(id = DEFAULT_PANEL_ID) {
      if (!isCollapsedState(state, id)) return
      // 展开也是「多开一栏」，同样受数量闸约束；不静默超额。
      if (state.ids.length >= maxPanels) {
        options.onLimitReached?.({ id })
        return
      }
      emit(expandPanel(state, id))
    },
    isOpen(id = DEFAULT_PANEL_ID) {
      return isOpen(state, id)
    },
    isCollapsed(id = DEFAULT_PANEL_ID) {
      return isCollapsedState(state, id)
    },
    ids() {
      return state.ids
    },
    setWidth(id, width) {
      const next = setPanelWidth(state, id, width)
      if (next === state) return
      emit(next)
      if (storageKey !== false) writeStoredWidth(widthKey(id), width)
      options.onResize?.({ id, width })
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot() {
      return state
    },
  }

  return controller
}

export interface PanelDockProps {
  /** `createPanelDock()` 的返回值。 */
  dock: PanelDockController
  /** 由 `<DockPanel>` 直接子元素组成。 */
  children?: ReactNode
  /** 追加 class（只补布局，不覆盖皮肤）。 */
  className?: string
  /** 拖宽时给主区留的最小宽度（px，默认 480）。 */
  mainMinWidth?: number
  translate?: Translate
}

/** 收集直接子元素里的 `<DockPanel>`；顺序即渲染顺序（与打开顺序无关，稳定）。 */
function panesOf(children: ReactNode): DockPanelProps[] {
  const out: DockPanelProps[] = []
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === DockPanel) out.push(child.props as DockPanelProps)
  })
  return out
}

/** 停靠栏本体：只渲染「开着的」面板，结构取自对应的 `<DockPanel>`。 */
export function PanelDock(props: PanelDockProps): ReturnType<typeof h> {
  ensureComponentStyles('panel-dock', PANEL_DOCK_CSS)
  ensureComponentStyles('feedback', FEEDBACK_CSS)
  const tt = props.translate ?? t
  const state = useSyncExternalStore(props.dock.subscribe, props.dock.getSnapshot, props.dock.getSnapshot)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const panelRefs = useRef(new Map<string, HTMLElement>())
  const panes = panesOf(props.children)
  const { defaultWidth, minWidth: fallbackMin } = props.dock.defaults

  // 记忆里那份宽度也过一遍夹：上次在宽屏拖到 900，换窄窗口重开会把主区挤没。
  const widthOf = (pane: DockPanelProps): number =>
    clampWidth(state.widths[pane.id] ?? pane.width ?? defaultWidth, pane.minWidth ?? fallbackMin, pane.maxWidth)

  // 耳朵**只显示一个箭头**（用户 2026-10-28 三轮：图标也不放，那会把面板的玩意带出来）。
  // 名字只进无障碍名：优先面板标题（字符串），否则无障碍名，再退回组名。
  const earLabelOf = (id: string): string => {
    const pane = panes.find((item) => item.id === id)
    if (pane === undefined) return id
    if (typeof pane.title === 'string') return pane.title
    if (typeof pane.ariaLabel === 'string') return pane.ariaLabel
    return id
  }

  // 收起的出场动效：先把栏宽收到 0（CSS transition），落定后再真正退出布局 ——
  // 用户 2026-10-28：「突然就出来了，特别奇怪」。展开方向的入场走 CSS 挂载动画，不需要 JS。
  const [closing, setClosing] = useState<string[]>([])
  const collapseWithAnim = (id: string): void => {
    setClosing((prev) => (prev.includes(id) ? prev : [...prev, id]))
    window.setTimeout(() => {
      setClosing((prev) => prev.filter((item) => item !== id))
      props.dock.collapse(id)
    }, 220)
  }

  // 本 dock 在「页面右侧占宽」里的那一份：实例唯一键，拖拽期也用它实时更新。
  const insetKey = useRef('')
  if (insetKey.current === '') insetKey.current = `dock-${++dockSeq}`
  const restWidth = (paneId: string): number =>
    othersWidth(state, paneId, (id) => {
      const other = panes.find((item) => item.id === id)
      return other === undefined ? defaultWidth : widthOf(other)
    })
  const totalWidth = panes
    .filter((pane) => state.ids.includes(pane.id))
    .reduce((sum, pane) => sum + widthOf(pane), 0)

  // 开合 / 拖宽松手后同步一次（拖拽中的实时值由 onMove 写）；卸载归零，别把变量留给下一个人。
  // 让位量 = 已开栏宽 + 开着时的留缝（缝隙也算 dock 足迹，遮罩边界才贴得到分隔线上）。
  useEffect(() => {
    publishInset(insetKey.current, state.ids.length > 0 ? totalWidth + DOCK_GAP : 0, rootRef.current)
  })
  useEffect(() => () => {
    publishInset(insetKey.current, 0, null)
  }, [])

  // 打开但没声明的 id 得说出来，否则用户只会看到一个永远空白的面板。
  for (const id of state.ids) {
    if (!panes.some((pane) => pane.id === id)) {
      console.warn(`[dsh-plugin-core] PanelDock: 面板 "${id}" 已打开但没有对应的 <DockPanel id="${id}"> 声明`)
    }
  }

  const beginResize = (pane: DockPanelProps, event: { clientX: number; preventDefault?: () => void }): void => {
    const element = panelRefs.current.get(pane.id)
    if (element === undefined || typeof window === 'undefined') return
    const startX = event.clientX
    const startWidth = widthOf(pane)
    const min = pane.minWidth ?? fallbackMin
    const mainMin = props.mainMinWidth ?? 480
    // 拖拽期点亮**这一栏**：染的是面板自己的 border-left，不是另画一条线（用户 2026-10-28 四轮）。
    element.classList.add('dshpc-dock__panel--resizing')
    startResizeLayoutWidth({
      startEvent: event,
      root: rootRef.current,
      rootClass: 'dshpc-dock--resizing',
      rafThrottle: true,
      compute: (clientX) => {
        const viewportMax = window.innerWidth - restWidth(pane.id) - mainMin
        const businessMax = pane.maxWidth ?? Number.POSITIVE_INFINITY
        const max = Math.min(viewportMax, businessMax)
        return clampWidth(startWidth + (startX - clientX), min, Math.max(min, max))
      },
      onMove: (width) => {
        element.style.width = `${width}px`
        // 遮罩的右边界跟着走，否则拖出去的那条缝会被遮罩压住（用户 2026-10-22）；含留缝。
        publishInset(insetKey.current, restWidth(pane.id) + width + DOCK_GAP, rootRef.current)
      },
      onCommit: (width) => {
        element.classList.remove('dshpc-dock__panel--resizing')
        props.dock.setWidth(pane.id, width)
      },
    })
  }

  // 关钮一律**绝对定位**在面板右上（top 10 / right 8，与内置头完全一致）：
  // ① 不占头部布局宽度 —— 自定义头因此拿到整行（下划线能顶到最右）；
  // ② 锚在面板上、不在 body 滚动内容里 —— 正文怎么滚它都不动；
  // ③ 内置头的标题区用 padding-right 预留出它的位置，谁也不压谁。
  const headerCloseOf = (pane: DockPanelProps): ReactNode => {
    const closable = pane.closable !== false
    const mode: DockCloseButton = pane.closeButton ?? 'auto'
    const hasHeader = pane.header !== null
    if (!closable || !(mode === 'header' || (mode === 'auto' && hasHeader))) return null
    return h(
      'button',
      {
        type: 'button',
        className: 'dshpc-dock__close dshpc-dock__close--abs',
        'aria-label': tt('dockClose'),
        onClick: () => props.dock.close(pane.id, 'button'),
      },
      pane.closeIcon ?? '✕',
    )
  }

  const renderHeader = (pane: DockPanelProps): ReactNode => {
    if (pane.header === null) return null
    if (pane.header !== undefined) {
      // 自定义头部：整行都归调用方 —— 库不加内边距/边框/背景。
      return h('div', { className: 'dshpc-dock__head dshpc-dock__head--custom' }, pane.header)
    }
    return h(
      'div',
      { className: 'dshpc-dock__head' },
      pane.icon === undefined ? null : h('div', { className: 'dshpc-dock__lead' }, pane.icon),
      h('div', { className: 'dshpc-dock__title' }, pane.title as ReactNode),
      pane.extra === undefined ? null : h('div', { className: 'dshpc-dock__extra' }, pane.extra),
    )
  }

  const floatingCloseOf = (pane: DockPanelProps): ReactNode => {
    if (pane.closable === false) return null
    const mode: DockCloseButton = pane.closeButton ?? 'auto'
    const hasHeader = pane.header !== null
    if (mode !== 'floating' && !(mode === 'auto' && !hasHeader)) return null
    return h(
      'button',
      {
        type: 'button',
        className: 'dshpc-dock__close dshpc-dock__close--floating',
        'aria-label': tt('dockClose'),
        onClick: () => props.dock.close(pane.id, 'button'),
      },
      pane.closeIcon ?? '✕',
    )
  }

  // 开着时根元素带 --open：CSS 据此给主区滚动条让出一条缝（全关即无缝，不留白边）。
  const rootClass = `dshpc-dock${state.ids.length > 0 ? ' dshpc-dock--open' : ''}${
    props.className === undefined ? '' : ` ${props.className}`
  }`

  return h(
    'div',
    {
      ref: rootRef,
      className: rootClass,
    },
    panes
      .filter((pane) => state.ids.includes(pane.id))
      .map((pane) =>
        h(
          'section',
          {
            key: pane.id,
            ref: (element: HTMLElement | null): void => {
              if (element === null) panelRefs.current.delete(pane.id)
              else panelRefs.current.set(pane.id, element)
            },
            className:
              closing.includes(pane.id) ? 'dshpc-dock__panel dshpc-dock__panel--closing' : 'dshpc-dock__panel',
            style: { width: `${widthOf(pane)}px` },
            'data-panel': pane.id,
            'aria-label': pane.ariaLabel ?? (typeof pane.title === 'string' ? pane.title : pane.id),
          },
          h('div', {
            className: 'dshpc-dock__resizer',
            role: 'separator',
            'aria-orientation': 'vertical',
            'aria-label': tt('dockResize'),
            onPointerDown: (event: { clientX: number; preventDefault?: () => void }) => {
              beginResize(pane, event)
            },
          }),
          // 收起钮是 resizer 的**兄弟**，不是子元素 —— 用户 2026-10-28：鼠标停在按钮上时，
          // 拖宽线不能亮、也不能出蓝色发光（那是在拖宽，不是点按钮）。挂在面板左缘外。
          h(
            'button',
            {
              type: 'button',
              className: 'dshpc-dock__collapse',
              'aria-label': tt('dockCollapse'),
              onClick: () => collapseWithAnim(pane.id),
            },
            '›',
          ),
          renderHeader(pane),
          headerCloseOf(pane),
          floatingCloseOf(pane),
          h('div', { className: 'dshpc-dock__body' }, pane.children ?? null),
        ),
      ),
    // 收起后的耳朵：**独立的 fixed 浮层**，与分栏不是一体（用户 2026-10-28 口径）。
    // 多个耳朵按收起顺序纵向堆叠，点一只展开回来。
    state.collapsed.length === 0
      ? null
      : h(
          'div',
          { className: 'dshpc-dock__ears' },
          state.collapsed.map((id) => {
            const label = earLabelOf(id)
            return h(
              'button',
              {
                key: id,
                type: 'button',
                className: 'dshpc-dock__ear',
                // 不放 title：原生 tooltip 会把面板标题弹出来，用户明确「不要显示任何标题」。
                'aria-label': `${label} · ${tt('dockExpand')}`,
                onClick: () => props.dock.expand(id),
              },
              // 只有一个箭头，与收起钮同尺寸反向：收起钮 ›（往右收），耳朵 ‹（往左拉回来）。
              h('span', { className: 'dshpc-dock__ear-arrow', 'aria-hidden': true }, '‹'),
            )
          }),
        ),
  )
}
