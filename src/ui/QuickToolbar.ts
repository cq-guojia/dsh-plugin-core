/**
 * 快捷工具栏（UI 基础层）：**右侧悬浮的一列圆钮**，内置「回到顶部」，并可挂自定义按钮。
 *
 * 用法：
 *   <QuickToolbar
 *     anchorId="dshpc-main"
 *     onAction={(id) => …}
 *     items={[{ id: 'search', icon: <SearchIcon />, label: '搜索' }]}
 *   />
 *
 * 行为（2026-10-31 用户拍板）：
 * - **纵向恒定**贴屏幕底边，距离 `offset`（默认 16px）；按钮从下往上排。
 * - **横向默认**贴屏幕右缘、留 `offset`；给了 `anchorId` / `anchor()` 就贴到那个控件的
 *   **右缘外侧**，同样留 `offset`。右侧放不下（再留一个 `offset` 后越界）就退回贴屏幕右缘。
 *   控件找不到按「跟随窗口」处理，不报错。
 * - 内置「回到顶部」默认 `when: 'scroll'`、阈值 320：滚过才出现；可传 `backToTop: false` 关掉，
 *   或用 `{ order, label, threshold }` 调整。
 * - 自定义项：`icon` / `label` / `onClick`；`visible` / `when` / `order` / `threshold` / `color` /
 *   `fgColor` 都可配。点击后先调 `onClick`，再统一回调 `onAction(id, item)`。
 * - 滚动容器默认取工具栏最近的「可纵向滚动」祖先，也可以显式给 `scrollContainer`。
 * - 显隐切换带 0.2s 动画：挂载淡入，消失先淡出、播完才卸载（`reduced-motion` 下关闭）。
 *
 * 样式只注入自己那一份（`controls/quick-toolbar.css`），横向位置 / 尺寸 / 间距由本组件在
 * style 上实时写入，不写死 CSS。
 */
import { createElement as h, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Chevron } from './chevron.js'
import { ensureComponentStyles } from './css.js'
import { QUICK_TOOLBAR_CSS } from './controls-css.js'
import {
  DEFAULT_SCROLL_THRESHOLD,
  isToolbarEntryVisible,
  resolveToolbarLeft,
  sortToolbarEntries,
  type QuickToolbarBackToTop,
  type QuickToolbarItem,
  type ToolbarEntry,
} from './quick-toolbar-logic.js'
import { t } from '../utils/i18n.js'

/** 默认贴边距离（px）。 */
const DEFAULT_OFFSET = 16
/** 默认按钮直径（px）。 */
const DEFAULT_SIZE = 44
/** 默认按钮间距（px）。 */
const DEFAULT_GAP = 12
/** 退场动画的卸载延迟（ms，与 CSS 的 0.2s 对齐并留余量）。 */
const LEAVE_MS = 220

export interface QuickToolbarProps {
  /** 自定义按钮；按数组顺序排在「回到顶部」下面。 */
  items?: QuickToolbarItem[]
  /** 内置回顶部：`false` 关掉；对象可调 `order` / `label` / `threshold`。 */
  backToTop?: boolean | QuickToolbarBackToTop
  /** 自定义项点击后的统一回调（在单项 `onClick` 之后触发）。 */
  onAction?: (id: string, item: QuickToolbarItem) => void
  /** 与屏幕 / 锚点右缘、屏幕底边的距离（px，默认 16）。 */
  offset?: number
  /** 相邻按钮的纵向间距（px，默认 12）。 */
  gap?: number
  /** 按钮直径（px，默认 44）。 */
  size?: number
  /** 跟随这个 id 的控件：横向贴它的右缘外侧；不传 = 跟随窗口右缘。 */
  anchorId?: string
  /** 动态锚点函数（优先于 `anchorId`）：返回 null 时按跟随窗口处理。 */
  anchor?: () => HTMLElement | null
  /** 滚动容器；不传则取工具栏最近的可纵向滚动祖先，再退回窗口。 */
  scrollContainer?: HTMLElement | (() => HTMLElement | null)
  /** 无障碍名，默认内置字典「快捷工具栏」。 */
  ariaLabel?: string
  /** 追加 class（只允许补布局）。 */
  className?: string
}

/** 视图条目：排序条目 + 对应 item（内置回顶部没有 item）。 */
interface EntryView extends ToolbarEntry {
  item?: QuickToolbarItem
}

/** 向上找最近的「可纵向滚动」祖先。 */
function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el: HTMLElement | null = node?.parentElement ?? null
  while (el !== null) {
    const oy = getComputedStyle(el).overflowY
    if (oy === 'auto' || oy === 'scroll') return el
    el = el.parentElement
  }
  return null
}

/** 显式 scrollContainer 优先，其次最近的可滚动祖先，最后退回窗口。 */
function resolveScrollTarget(
  explicit: QuickToolbarProps['scrollContainer'],
  node: HTMLElement | null,
): HTMLElement | Window {
  let target: HTMLElement | null = null
  if (typeof explicit === 'function') target = explicit()
  else if (explicit !== undefined) target = explicit
  if (target === null) target = findScrollParent(node)
  return target ?? window
}

/** 读当前滚动距离。 */
function scrollTopOf(target: HTMLElement | Window): number {
  if (typeof HTMLElement !== 'undefined' && target instanceof HTMLElement) return target.scrollTop
  if (typeof window === 'undefined') return 0
  return window.scrollY || document.documentElement.scrollTop || 0
}

/** 平滑回到顶部（reduced-motion 下瞬时）。 */
function scrollToTop(target: HTMLElement | Window): void {
  const reduce = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth'
  if (typeof HTMLElement !== 'undefined' && target instanceof HTMLElement) target.scrollTo({ top: 0, behavior })
  else if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior })
}

/** 右侧浮动的快捷工具栏：内置回顶部 + 自定义按钮。 */
export function QuickToolbar(props: QuickToolbarProps): ReturnType<typeof h> {
  ensureComponentStyles('quick-toolbar', QUICK_TOOLBAR_CSS)
  const ref = useRef<HTMLDivElement>(null)
  const [left, setLeft] = useState<number | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  // 正在退场的按钮：先留在 DOM 里播 fade-out，计时到了才卸载。
  const [leaving, setLeaving] = useState<string[]>([])
  const shownRef = useRef<string[]>([])
  const leaveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const offset = props.offset ?? DEFAULT_OFFSET
  const size = props.size ?? DEFAULT_SIZE
  const gap = props.gap ?? DEFAULT_GAP

  // 横向定位：锚点右缘外侧；放不下 / 没锚点 ⇒ 贴视口右缘。
  useEffect(() => {
    const node = ref.current
    if (node === null) return
    const resolveAnchor = (): HTMLElement | null => {
      if (props.anchor !== undefined) return props.anchor()
      const id = props.anchorId
      return id === undefined ? null : document.getElementById(id)
    }
    let observed: HTMLElement | null = null
    let lastRight: number | null = null
    let lastViewport = -1
    const ro = new ResizeObserver(update)
    function update(): void {
      const anchorEl = resolveAnchor()
      if (anchorEl !== observed) {
        if (observed !== null) ro.unobserve(observed)
        if (anchorEl !== null) ro.observe(anchorEl)
        observed = anchorEl
      }
      const viewportWidth = document.documentElement.clientWidth
      const rect = anchorEl === null ? null : anchorEl.getBoundingClientRect()
      // 锚点被隐藏 / 收起（宽高均为 0）时不跟随，按「找不到控件」退回贴视口右缘。
      const anchorRight = rect === null || (rect.width === 0 && rect.height === 0) ? null : rect.right
      // 值没变就不写 state。位置另做轮询兜底：侧栏开合可能只改 clientWidth（滚动条增减）
      // 或推动锚点位置（尺寸不变），这两种都不会触发 resize / ResizeObserver。
      if (viewportWidth === lastViewport && anchorRight === lastRight) return
      lastViewport = viewportWidth
      lastRight = anchorRight
      setLeft(resolveToolbarLeft({ viewportWidth, offset, size }, anchorRight))
    }
    update()
    const poll = setInterval(update, 100)
    window.addEventListener('resize', update)
    return () => {
      clearInterval(poll)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [props.anchor, props.anchorId, offset, size])

  // 滚动距离：驱动 `when: 'scroll'` 的显隐。
  useEffect(() => {
    const node = ref.current
    if (node === null) return
    const target = resolveScrollTarget(props.scrollContainer, node)
    const onScroll = (): void => setScrollTop(scrollTopOf(target))
    onScroll()
    target.addEventListener('scroll', onScroll, { passive: true })
    return () => target.removeEventListener('scroll', onScroll)
  }, [props.scrollContainer])

  // 内置回顶部与自定义项摊平成同一张排序表。
  const backTop: QuickToolbarBackToTop | null = props.backToTop === false
    ? null
    : (typeof props.backToTop === 'object' ? props.backToTop : {})
  const entries: EntryView[] = []
  if (backTop !== null) {
    entries.push({ id: '__backtop', kind: 'backtop', order: backTop.order ?? 0, index: 0 })
  }
  for (const [index, item] of (props.items ?? []).entries()) {
    entries.push({ id: item.id, kind: 'custom', order: item.order ?? index + 1, index, item })
  }

  const threshold = backTop?.threshold ?? DEFAULT_SCROLL_THRESHOLD
  const sorted = sortToolbarEntries(entries)
  const visible = sorted.filter((entry) => {
    if (entry.kind === 'backtop') return isToolbarEntryVisible({ when: 'scroll', threshold }, scrollTop)
    return isToolbarEntryVisible(entry.item ?? {}, scrollTop)
  })
  const visibleKey = JSON.stringify(visible.map((entry) => entry.id))

  // 显隐切换：新出现的项挂载即淡入；消失的项先转为退场态、延迟卸载。
  useEffect(() => {
    const next = JSON.parse(visibleKey) as string[]
    const revived = next.filter((id) => leaveTimers.current.has(id))
    for (const id of revived) {
      const timer = leaveTimers.current.get(id)
      if (timer !== undefined) clearTimeout(timer)
      leaveTimers.current.delete(id)
    }
    if (revived.length > 0) setLeaving((prev) => prev.filter((id) => !revived.includes(id)))
    const gone = shownRef.current.filter((id) => !next.includes(id))
    if (gone.length > 0) {
      setLeaving((prev) => [...prev, ...gone.filter((id) => !prev.includes(id))])
      for (const id of gone) {
        const timer = leaveTimers.current.get(id)
        if (timer !== undefined) clearTimeout(timer)
        leaveTimers.current.set(id, setTimeout(() => {
          leaveTimers.current.delete(id)
          setLeaving((prev) => prev.filter((value) => value !== id))
        }, LEAVE_MS))
      }
    }
    shownRef.current = next
  }, [visibleKey])

  useEffect(() => () => {
    for (const timer of leaveTimers.current.values()) clearTimeout(timer)
    leaveTimers.current.clear()
  }, [])

  const style: CSSProperties = {
    bottom: `${offset}px`,
    gap: `${gap}px`,
    ...(left === null ? { right: `${offset}px` } : { left: `${left}px` }),
  }

  const shownSet = new Set(visible.map((entry) => entry.id))
  const leavingSet = new Set(leaving)
  const rendered = sorted.filter((entry) => shownSet.has(entry.id) || leavingSet.has(entry.id))

  const renderItem = (entry: EntryView, isLeaving: boolean): ReactNode => {
    const leaveClass = isLeaving ? ' is-leaving' : ''
    if (entry.kind === 'backtop') {
      const label = backTop?.label ?? t('backToTop')
      return h(
        'button',
        {
          key: entry.id,
          type: 'button',
          className: `dshpc-quick-toolbar__item dshpc-quick-toolbar__backtop${leaveClass}`,
          style: { width: size, height: size },
          'aria-label': label,
          title: label,
          onClick: () => scrollToTop(resolveScrollTarget(props.scrollContainer, ref.current)),
        },
        h(Chevron, { dir: 'up', size: 18 }),
      )
    }
    const item = entry.item
    if (item === undefined) return null
    // 自定义配色只写 CSS 变量，不直接写 background / color —— 否则会压过 hover / active 的混色规则。
    const buttonStyle: CSSProperties & { [key: `--${string}`]: string } = { width: size, height: size }
    if (item.color !== undefined) buttonStyle['--dshpc-quick-toolbar-bg'] = item.color
    if (item.fgColor !== undefined) buttonStyle['--dshpc-quick-toolbar-fg'] = item.fgColor
    const onClick = (): void => {
      item.onClick?.()
      props.onAction?.(item.id, item)
    }
    return h(
      'button',
      {
        key: entry.id,
        type: 'button',
        className: `dshpc-quick-toolbar__item${leaveClass}`,
        style: buttonStyle,
        'aria-label': item.label,
        title: item.label,
        onClick,
      },
      item.icon,
    )
  }

  return h(
    'div',
    {
      ref,
      className: `dshpc-quick-toolbar${props.className === undefined ? '' : ` ${props.className}`}`,
      style,
      role: 'toolbar',
      'aria-label': props.ariaLabel ?? t('quickToolbarAria'),
    },
    ...rendered.map((entry) => renderItem(entry, leavingSet.has(entry.id))),
  )
}
