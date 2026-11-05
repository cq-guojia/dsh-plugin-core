/**
 * 浮层公共件 —— Modal 与 SideSheet 共用，**别各写一份**。
 *
 * 抽出来的判据：这两件在两种浮层里完全同构（遮罩让位分栏、头部四槽、Esc 判定），
 * 差异只在「面板怎么排」（居中 vs 贴边），那部分留在各自的控件里。
 */
import { createContext, createElement as h, useContext, useEffect, type ReactNode } from 'react'
import { ensureComponentStyles } from './css.js'
import { OVERLAY_CSS } from './overlay-css.js'
import { PANEL_CSS } from './panel-css.js'
import { PanelClose } from './panel.js'

/**
 * 锁定广播：Modal / SideSheet `locked` 时把 true 传下去。
 * 为什么要有它：面板挂 `inert` 管不到 **portal 到 body** 的那几个浮层（Picker / 日期选择的菜单
 * 不在面板 DOM 里），锁定时它们还浮在屏幕上能点；那几个组件自己订阅这里、锁上就收起。
 */
const LockedContext = createContext(false)

/** 外层浮层是否锁死（不在浮层里 = false）。 */
export function useOverlayLocked(): boolean {
  return useContext(LockedContext)
}

export const OverlayLockedProvider = LockedContext.Provider

/**
 * 锁定期间的两道保险（消费方自绘的控件不是我们的，管不到它们的 `disabled`）：
 *  ① Tab 整个吃掉 —— 否则能 Tab 进他们的 input 打字；
 *  ② 把面板里没被禁用的活动元素 `blur` 掉 —— 否则锁定前已经停在里面的光标还能继续打字。
 * 只认 `.dshpc-locked` 子树里的元素，不碰面板外面的焦点。
 */
export function useLockGuards(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return
    const active = document.activeElement
    if (active instanceof Element && active.closest('.dshpc-locked') !== null) (active as HTMLElement).blur()
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Tab') event.preventDefault()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [enabled])
}

/**
 * 锁定时的**透明点击层**：盖住整块面板、不遮任何像素，只吃掉指针事件
 * （消费方自绘的元素也跟着点不动）。变灰由各控件自己的 `:disabled` 负责，这里不管外观。
 * 不做焦点接管：核心控件此刻已是真 disabled，Tab 自己就跳过它们。
 */
export function OverlayLockCatcher(): ReactNode {
  return h('div', {
    className: 'dshpc-lock-catcher',
    // 点它不能再冒到遮罩：否则等于点了外部，会顺带把弹窗关掉。
    onClick: (event: { stopPropagation: () => void }) => event.stopPropagation(),
  })
}

/**
 * Esc 关闭。不传 `onClose` 或 `enabled=false` 时完全不挂监听
 * （无回调还挂监听，等于让 Esc 被白白吃掉）。
 */
export function useEscapeClose(enabled: boolean, onClose: (() => void) | undefined): void {
  useEffect(() => {
    if (!enabled || onClose === undefined) return
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [enabled, onClose])
}

/**
 * 浮层档：center = 居中弹窗；side = 贴边抽屉；plain = 不居中的锚定面板（选文件弹窗用，
 * 面板自己 `position:fixed` 贴锚点，遮罩只负责压暗与「点外部关闭」）。
 * 三档的遮罩视觉同一套，只差布局与 z（见 overlay.css）。
 */
export type OverlayKind = 'center' | 'side' | 'plain'

export interface OverlayMaskProps {
  kind: OverlayKind
  /** 点遮罩是否关闭。 */
  closeOnMask: boolean
  onClose?: () => void
  /** 原样铺到遮罩节点上的属性（`data-*` 这类既有钩子）。 */
  attrs?: Record<string, string | undefined>
  children?: ReactNode
}

/** 遮罩 + 承载盒。右边界让位分栏的规则只有这一份。 */
export function OverlayMask(props: OverlayMaskProps): ReactNode {
  ensureComponentStyles('overlay', OVERLAY_CSS)
  return h(
    'div',
    {
      ...props.attrs,
      className: `dshpc-overlay dshpc-overlay--${props.kind}`,
      onClick: () => {
        if (props.closeOnMask) props.onClose?.()
      },
    },
    props.children ?? null,
  )
}

export interface OverlayHeadProps {
  icon?: ReactNode
  title?: ReactNode
  /** 标题**下方**的副标题行（等宽小字）。 */
  subtitle?: ReactNode
  /** 标题**同一行**右侧的小块（徽标 / 计数）。 */
  extra?: ReactNode
  /** 头部右侧动作区（关闭钮之外）。 */
  actions?: ReactNode
  /** 关闭钮的无障碍名（走调用方的内置字典）。 */
  closeLabel: string
  /** 不传则不出关闭钮（调用方没给关闭路径时不该出现小叉）。 */
  onClose?: () => void
}

/** 头部四槽：icon + 标题组 + 右侧动作 + 关闭钮。 */
export function OverlayHead(props: OverlayHeadProps): ReactNode {
  ensureComponentStyles('overlay', OVERLAY_CSS)
  // 关闭钮的皮肤在 panel.css（浮层唯一那枚）；旧类名 `dshpc-overlay-head__close` 仍挂着做别名。
  ensureComponentStyles('panel', PANEL_CSS)
  return h(
    'div',
    { className: 'dshpc-overlay-head' },
    h(
      'div',
      { className: 'dshpc-overlay-head__heading' },
      props.icon === undefined ? null : h('span', { className: 'dshpc-overlay-head__lead' }, props.icon),
      h(
        'div',
        { className: 'dshpc-overlay-head__titlegroup' },
        h(
          'div',
          { className: 'dshpc-overlay-head__titlerow' },
          h('div', { className: 'dshpc-overlay-head__title' }, props.title ?? ''),
          props.extra === undefined ? null : h('div', { className: 'dshpc-overlay-head__extra' }, props.extra),
        ),
        props.subtitle === undefined ? null : h('div', { className: 'dshpc-overlay-head__sid' }, props.subtitle),
      ),
    ),
    h('div', { className: 'dshpc-overlay-head__spacer' }),
    props.actions === undefined ? null : h('div', { className: 'dshpc-overlay-head__actions' }, props.actions),
    props.onClose === undefined
      ? null
      // 关闭钮只此一枚（`PanelClose`）；旧类名挂着做别名，消费方写在上面的覆盖仍生效。
      : h(PanelClose, { label: props.closeLabel, onClick: props.onClose, className: 'dshpc-overlay-head__close' }),
  )
}
