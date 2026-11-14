/**
 * 侧边抽屉（SideSheet）—— 从屏幕左/右缘滑入的**覆盖式**浮层。
 *
 * 与 PanelDock 的关系（用户 2026-11-02 定）：**皮肤一模一样**（同一份 side-panel.css：
 * 头部、拖拽条、关闭钮、背景阴影、入场动画），宽度也能拖；差别只有两点：
 *   · PanelDock 是布局成员（sticky 占宽、挤窄主区，调用方必须给挂载点）；
 *   · SideSheet 是浮层（absolute 贴边、盖住页面，自铺遮罩，不需要挂载点）；
 *   · SideSheet **没有收起**（没有耳朵、没有收起钮）—— 关就是关。
 *
 * 开关行为与 Modal 一致：渲染即显示（`{open && <SideSheet … />}`）、点遮罩 / Esc / ✕ 都能关，
 * 三者都可关掉；遮罩与 Esc 判定走 overlay.ts 的公共件。
 */
import { createElement as h, useEffect, useRef, useState, type ReactNode } from 'react'
import { t, type Translate } from '../../utils/i18n.js'
import { ensureComponentStyles } from '../infra/css.js'
import { FontIcon } from '../display/font-icon.js'
import { SIDE_PANEL_CSS } from '../infra/side-panel-css.js'
import { SIDE_SHEET_CSS } from './side-sheet-css.js'
import { OverlayLockCatcher, OverlayLockedProvider, OverlayMask, useEscapeClose, useLockGuards } from '../infra/overlay.js'
import { startResizeLayoutWidth } from '../layout/resizer.js'
import { FlipText } from '../display/FlipText.js'

/** 从哪一侧滑入。默认 `left`。 */
export type SideSheetSide = 'left' | 'right'

export interface SideSheetProps {
  /** 贴哪条边、从哪边滑入（默认 `left`）。 */
  side?: SideSheetSide
  /** 内置头的标题。 */
  title?: ReactNode
  /** 标题前的图标位。 */
  icon?: ReactNode
  /** 标题**右侧**的任意内容（按钮、标签、下拉……）。 */
  extra?: ReactNode
  /**
   * 整块替换头部：
   *   · 不传 ⇒ 内置头（`icon` + `title` + `extra`）
   *   · `null` ⇒ 不要头部（关闭钮自动浮到右上角）
   *   · 其他 ReactNode ⇒ 你的头部，库不加内边距/边框/背景
   */
  header?: ReactNode | null
  /** 是否显示关闭钮（默认 true）。 */
  closable?: boolean
  /** 自定义关闭图标（默认 ✕）。 */
  closeIcon?: ReactNode
  /** 关闭回调；不传则不出关闭钮（必须自己给关闭路径）。 */
  onClose?: () => void
  /**
   * 受控开关（默认 true）。传 `false` 时先播收起动画再卸载 —— 想让关闭有动效就常驻渲染它、只切这个布尔；
   * 继续用 `{open && <SideSheet/>}` 的老写法也能跑，只是没有收起动画（一卸载就没 DOM 了）。
   */
  open?: boolean
  /** 点遮罩是否关闭（默认 true）。 */
  closeOnMask?: boolean
  /** 按 Esc 是否关闭（默认 true）。 */
  escClose?: boolean
  /**
   * 有异步在跑（如 footer 里的 `Button` 正在 loading）：为真时遮罩 / Esc / ✕ **三条关闭路径全失效**，
   * 内容照常渲染。与 `closeOnMask` / `escClose` / `closable` 是"与"关系 —— 它是否决项，不替代它们。
   */
  busy?: boolean
  /** 锁死全部交互（含义见 `Modal.locked`）：抽屉整块点不动、Tab 进不去、三条关闭路径同时失效。 */
  locked?: boolean
  /** **初始**宽度（px，默认 460，与 PanelDock 同档）；拖过之后以拖出来的为准。 */
  width?: number
  /** 可拖宽的下限（默认 320）。 */
  minWidth?: number
  /** 可拖宽的上限；不传 = 只受遮罩盒宽度约束。 */
  maxWidth?: number
  /** 能否拖宽（默认 true）。 */
  resizable?: boolean
  footer?: ReactNode
  /** 底栏左侧的一行过程提示（换字即翻牌，超长省略 + hover 跑马灯）。不传 = 不占位。 */
  notice?: string
  children?: ReactNode
  translate?: Translate
}

export function SideSheet(props: SideSheetProps): ReactNode {
  ensureComponentStyles('side-panel', SIDE_PANEL_CSS)
  ensureComponentStyles('side-sheet', SIDE_SHEET_CSS)
  const tt = props.translate ?? t
  const side = props.side ?? 'left'
  // busy / locked 都是否决项：三条关闭路径一起封死（✕ 见下面 showClose）。
  const busy = props.busy === true
  const locked = props.locked === true
  const denyClose = busy || locked
  const closeOnMask = !denyClose && props.closeOnMask !== false
  useEscapeClose(!denyClose && props.escClose !== false, denyClose ? undefined : props.onClose)
  useLockGuards(locked)
  // 空串等同于没给：抽屉常驻渲染时，传 "" 就能把上一轮的提示清干净、不留占位。
  const notice = props.notice === '' ? undefined : props.notice

  const [width, setWidth] = useState(props.width ?? 460)
  const panelRef = useRef<HTMLElement | null>(null)

  // 收起动效（用户 2026-11-02）：open=false 时先播完 dshpc-side-out 再真正卸载；
  // 中途又被打开就撤销，不留残影。
  const leaving = props.open === false
  // 挂载时就是关着的 ⇒ 直接不渲染（否则开页面会闪一下抽屉）。
  const [unmounted, setUnmounted] = useState(leaving)
  useEffect(() => {
    if (!leaving) setUnmounted(false)
  }, [leaving])
  if (unmounted) return null

  const showClose = props.closable !== false && props.onClose !== undefined && !denyClose
  const hasHeader = props.header !== null

  const beginResize = (event: { clientX: number; preventDefault?: () => void }): void => {
    const element = panelRef.current
    if (element === null || typeof window === 'undefined') return
    const startX = event.clientX
    const startWidth = element.getBoundingClientRect().width
    const min = props.minWidth ?? 320
    const businessMax = props.maxWidth ?? Number.POSITIVE_INFINITY
    element.classList.add('dshpc-side-surface--resizing')
    startResizeLayoutWidth({
      startEvent: event,
      rafThrottle: true,
      compute: (clientX) => {
        // 上限 = 遮罩盒宽度（已按右侧分栏让位），再夹业务上限。
        const box = element.parentElement?.getBoundingClientRect().width ?? window.innerWidth
        const max = Math.max(min, Math.min(box, businessMax))
        // 左侧抽屉往右拖变宽，右侧抽屉反过来。
        const raw = side === 'left' ? startWidth + (clientX - startX) : startWidth + (startX - clientX)
        return Math.round(Math.min(Math.max(raw, min), max))
      },
      onMove: (next) => {
        element.style.width = `${next}px`
      },
      onCommit: (next) => {
        element.classList.remove('dshpc-side-surface--resizing')
        setWidth(next)
      },
    })
  }

  const closeButton = (floating: boolean): ReactNode =>
    !showClose
      ? null
      : h(
          'button',
          {
            type: 'button',
            className: `dshpc-dock__close ${floating ? 'dshpc-dock__close--floating' : 'dshpc-dock__close--abs'}`,
            'aria-label': tt('dockClose'),
            onClick: () => props.onClose?.(),
          },
          props.closeIcon ?? h(FontIcon, { name: 'common.base:guanbi' }),
        )

  const renderHeader = (): ReactNode => {
    if (props.header === null) return null
    if (props.header !== undefined) {
      return h('div', { className: 'dshpc-dock__head dshpc-dock__head--custom' }, props.header)
    }
    return h(
      'div',
      { className: 'dshpc-dock__head' },
      props.icon === undefined ? null : h('div', { className: 'dshpc-dock__lead' }, props.icon),
      h('div', { className: 'dshpc-dock__title' }, props.title as ReactNode),
      props.extra === undefined ? null : h('div', { className: 'dshpc-dock__extra' }, props.extra),
    )
  }

  return h(
    OverlayMask,
    {
      kind: 'side',
      closeOnMask,
      onClose: denyClose ? undefined : props.onClose,
      attrs: locked ? { 'data-dshpc-locked': '' } : undefined,
    },
    h(
      OverlayLockedProvider,
      { value: locked },
      h(
        'section',
        {
          ref: (element: HTMLElement | null): void => {
            panelRef.current = element
          },
          className: `dshpc-side-surface dshpc-sheet dshpc-sheet--${side}${leaving ? ' dshpc-sheet--leaving' : ''}${locked ? ' dshpc-locked' : ''}`,
          style: { width: `${width}px` },
          // 收起动画结束才卸载；入场动画结束（leaving=false）在这里不算数。
          onAnimationEnd: (): void => {
            if (leaving) setUnmounted(true)
          },
          'aria-label': typeof props.title === 'string' ? props.title : undefined,
          // 面板上的点击不能再冒到遮罩（否则点正文就把自己关了）。
          onClick: (e: { stopPropagation: () => void }) => e.stopPropagation(),
        },
        props.resizable === false
          ? null
          : h('div', {
              className: 'dshpc-dock__resizer',
              role: 'separator',
              'aria-orientation': 'vertical',
              'aria-label': tt('dockResize'),
              onPointerDown: (event: { clientX: number; preventDefault?: () => void }) => {
                beginResize(event)
              },
            }),
        renderHeader(),
        closeButton(!hasHeader),
        h('div', { className: 'dshpc-dock__body dshpc-sheet__body dshpc-scroll-thin' }, props.children ?? null),
        props.footer === undefined && notice === undefined
          ? null
          : h(
              'div',
              { className: 'dshpc-sheet__foot' },
              notice === undefined ? null : h(FlipText, { text: notice, className: 'dshpc-sheet__notice', sweep: true }),
              props.footer,
            ),
        // 与 Modal 同一套：透明点击层兜住自绘元素，变灰归各控件自己的 :disabled。
        locked ? h(OverlayLockCatcher) : null,
      ),
    ),
  )
}
