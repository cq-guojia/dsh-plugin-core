/**
 * 按钮 / 图标钮 —— **全站唯一实现**（L2 组件皮肤，P2）
 *
 * 三轴模型：
 *  - `variant`：外观档（形态 + 语义色），共 18 档
 *      primary（黑实心）/ secondary（灰实心）/ outline（描边）/ ghost（无底无边）
 *      danger（红实心）/ success（绿实心）/ warning（黄实心）/ info（蓝实心）
 *      danger-outline（红字描边）/ link（行内链接）
 *      purple / pink / cyan / teal / orange / indigo / rose / slate（扩展八色实心，2026-10-29）
 *  - `size`：`sm`(24) / `md`(28) / `lg`(32) —— 高度一律吃 `--dshpc-control-h-*`，
 *    **有边 / 无边同高**（边框在内部补回）
 *  - `block`：撑满父宽
 *  - `dense`：图标放大一档、内距收紧（高度不变），Button / IconButton 同名同义
 *
 * 内容轴：`icon`（前置）/ `iconRight`（后置）/ `loading`（前置小圈并自动禁用）。
 * 颜色轴：任一档都可以再用 `color` 传任意 CSS 色值 —— 只覆盖 `--btn-*` 几个变量，
 * 不新增皮肤（皮肤只在自己的 `button.css` 真源里，构建期编译成字符串常量）。
 *
 * `IconButton` 是纯图标钮：`plain`（默认无底无边，hover 起灰底）/ `outline`（描边）/ `danger`（红）。
 * 兼容别名：`danger-ink` 仍是 `danger-outline` 的旧类名，可直接挂 className。
 *
 * ⚠️ 不许在任何使用点就地写按钮样式；要多一档外观 ⇒ 改基础层（一处改全站生效）。
 */
import { MarqueeText } from '../display/MarqueeText.js'
import { Loader } from '../feedback/Loader.js'
import {
  createElement as h, useEffect, useLayoutEffect, useRef, useState,
  type CSSProperties, type MouseEvent, type ReactNode,
} from 'react'
import { ensureComponentStyles } from '../infra/css.js'
import { useOverlayLocked } from '../infra/overlay.js'
import { BUTTON_CSS } from './button-css.generated.js'
import { isThenable } from '../infra/thenable.js'

/** 按钮外观档。 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger-outline'
  | 'link'
  | 'purple' | 'pink' | 'cyan' | 'teal' | 'orange' | 'indigo' | 'rose' | 'slate'

/** 按钮高度档（sm 24 / md 28 / lg 32）。 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * 有 DOM 时用 layout effect（绘制前锁宽，用户看不到中间态），SSR 退化成 useEffect（服务端本就不跑）。
 * 直接用 `useLayoutEffect` 会在服务端渲染时告警。
 */
const useIsoLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

/** 实心档（color 参数按「底色」处理；其余档按「字色 + 描边色」处理）。 */
const SOLID_VARIANTS: readonly ButtonVariant[] = [
  'primary', 'secondary', 'danger', 'success', 'warning', 'info',
  'purple', 'pink', 'cyan', 'teal', 'orange', 'indigo', 'rose', 'slate',
]

export interface ButtonProps {
  /** 外观档（默认 outline）。 */
  variant?: ButtonVariant
  /** 高度档（默认 lg）。 */
  size?: ButtonSize
  /** 前置图标（可选；字符串 / 官方图标组件都可以）。 */
  icon?: ReactNode
  /** 后置图标（可选；如「展开 / 外链」箭头）。 */
  iconRight?: ReactNode
  /**
   * 自定义主色（任意 CSS 色值，如 `#7c3aed` / `var(--dshpc-business)`）。
   * 实心档作底色、描边与文字档作主色；hover / active 由基础层按该色混出。
   */
  color?: string
  /** 加载中：文案前显示同色小圈，并自动禁用点击。与「点击自动 loading」是或关系，任一为真就转圈。 */
  loading?: boolean
  /**
   * loading 时是否保留文案（默认 true）。
   * 传 `false`：loading 期间**清掉文案**、把按钮锁在「有文案时」的宽度上，只剩一枚居中的圈，
   * settle 后文案与自适应宽度一起回来 —— 用于文案长、不想让按钮被圈撑宽的场景。
   *
   * 两条前提：① 文案被清掉后读屏只剩「按钮」，`children` 不是字符串时请自己传 `aria-label`；
   * ② 首帧就是 loading（没有「有文案的宽度」可量）时不锁宽，请改用 `width` 定宽。
   */
  loadingText?: boolean
  /**
   * 点击回调。**返回 Promise 即自动进入 loading**（转圈 + 禁用 + 防连点），settle 后自己恢复；
   * reject 会恢复并把错误打到控制台。同步返回值 = 老行为，不转圈。
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => unknown
  /**
   * 把「这个按钮正在跑」报出去（如锁死所在弹窗的遮罩 / Esc / ✕）。
   * 不改变按钮自己的行为；与 `loading` 无关。
   */
  onBusyChange?: (busy: boolean) => void
  /** 撑满父宽。 */
  block?: boolean
  /** 紧凑图标档：高度不变，图标放大、内距收紧（给描边细的文档 / 语言图标用）。 */
  dense?: boolean
  /**
   * 固定宽（px 或任意 CSS 宽度值）。与 `minWidth` / `maxWidth` 互斥：一旦设定，后两者自动失效。
   */
  width?: number | string
  /** 最小宽：`width` 未设时生效，内容不足此宽时以它为准。 */
  minWidth?: number | string
  /**
   * 最大宽：`width` 未设时生效，文字超出时折叠成省略号，hover 以跑马灯展开全名。
   */
  maxWidth?: number | string
  /** 追加 class（只允许补布局、或挂本文件声明的修饰类，不许覆盖皮肤）。 */
  className?: string
  /** 追加样式（只允许补布局，不许覆盖皮肤）。 */
  style?: CSSProperties
  /** 文案 / 内容。 */
  children?: ReactNode
  /** 其余原生 button 属性（type / disabled / title / aria-* / onClick …）原样透传。 */
  [key: string]: unknown
}

export interface IconButtonProps {
  /** 外观档（默认 plain：无底色、无边框）。 */
  variant?: 'plain' | 'outline' | 'danger'
  /** 高度档（默认 lg）。 */
  size?: ButtonSize
  /** 紧凑图标档：宽高不变，图标放大、四周留白变小（与 Button.dense 同名同义）。 */
  dense?: boolean
  /** 图标（必填）。 */
  icon: ReactNode
  /** 无障碍名（必填）。 */
  label: string
  /** 图标色（任意 CSS 色值）；hover 按它混出浅底。 */
  color?: string
  /** 底色（任意 CSS 色值）；不传 = 无底色。hover 按它压深。 */
  background?: string
  /** 加载中：图标位换成小圈并禁用（纯图标钮没有文字，圈就是它的全部内容）。与「点击自动 loading」取或。 */
  loading?: boolean
  /** 点击回调；**返回 Promise 自动 loading**，settle 后恢复。 */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => unknown
  /** 把「这个按钮正在跑」报出去（如锁死所在弹窗）。 */
  onBusyChange?: (busy: boolean) => void
  /** 追加 class。 */
  className?: string
  /** 追加样式。 */
  style?: CSSProperties
  /** 其余原生 button 属性原样透传。 */
  [key: string]: unknown
}

/** 把自定义颜色翻译成 5 个局部变量（只覆盖 token，不新增皮肤）。 */
function colorVars(variant: ButtonVariant, color: string | undefined): CSSProperties | undefined {
  if (color === undefined || color === '') return undefined
  if (SOLID_VARIANTS.includes(variant)) {
    return {
      '--btn-bg': color,
      // 亮色主题下 --dshpc-fg 是黑 ⇒ 压深；暗色下是白 ⇒ 提亮。两边都能明确看出变化。
      '--btn-bg-hover': `color-mix(in srgb, ${color} 82%, var(--dshpc-fg))`,
      '--btn-bg-active': `color-mix(in srgb, ${color} 70%, var(--dshpc-fg))`,
    } as CSSProperties
  }
  return {
    '--btn-fg': color,
    '--btn-fg-hover': color,
    '--btn-border': color,
    '--btn-bg-hover': `color-mix(in srgb, ${color} 12%, transparent)`,
    '--btn-bg-active': `color-mix(in srgb, ${color} 18%, transparent)`,
  } as CSSProperties
}

/** 组装按钮 class（结构一套 + 轴类）。 */
function buttonClass(variant: ButtonVariant, size: ButtonSize, block: boolean, hasIcon: boolean, dense: boolean, extra?: string): string {
  return `dshpc-btn dshpc-btn--${variant} dshpc-btn--${size}`
    + `${dense ? ' dshpc-btn--dense' : ''}`
    + `${block ? ' dshpc-btn--block' : ''}`
    // 前置图标标记：block 时靠它把文字拉回视觉中心（见 button.css 的 --icon-start 规则）
    + `${hasIcon ? ' dshpc-btn--icon-start' : ''}`
    + `${extra !== undefined && extra !== '' ? ` ${extra}` : ''}`
}

/**
 * 异步点击：`onClick` 返回 thenable 就自己转圈（并禁用），settle 后恢复。
 * 不用 `onBusyChange` 也能单独工作 —— 它只是把状态报给外面（弹窗锁关闭用）。
 * `onBusyStart` 在 setBusy 之前跑：那时按钮还是「有文案」的样子，要量宽度只能抓这一刻。
 */
function useAsyncClick(
  onClick: ButtonProps['onClick'],
  onBusyChange: ButtonProps['onBusyChange'],
  onBusyStart?: (el: HTMLButtonElement) => void,
): { busy: boolean; click: (event: MouseEvent<HTMLButtonElement>) => void } {
  const [busy, setBusy] = useState(false)
  const click = (event: MouseEvent<HTMLButtonElement>): void => {
    if (onClick === undefined) return
    const out = onClick(event)
    if (!isThenable(out)) return
    onBusyStart?.(event.currentTarget)
    setBusy(true)
    onBusyChange?.(true)
    const done = (): void => {
      setBusy(false)
      onBusyChange?.(false)
    }
    void out.then(done, (err: unknown) => {
      // 状态先恢复，再让失败可见（不吞：消费方该看到自己抛了什么）
      done()
      console.error('[dsh-plugin-core] Button 异步点击失败，已恢复可点：', err)
    })
  }
  return { busy, click }
}

/**
 * 渲染一个「图标 + 文案」按钮。
 *
 * @param props 见 {@link ButtonProps}。
 * @returns 按钮元素。
 */
export function Button(props: ButtonProps): ReturnType<typeof h> {
  ensureComponentStyles('button', BUTTON_CSS)
  const {
    variant = 'outline', size = 'lg', icon, iconRight, color, loading: loadingProp = false,
    loadingText = true,
    block = false, dense = false, width, minWidth, maxWidth, className, style, children,
    onClick, onBusyChange, ...rest
  } = props
  const btnRef = useRef<HTMLButtonElement | null>(null)
  // 「有文案时的宽度」：只在非 loading 的布局里记，loading 时用它锁宽。
  const idleWidth = useRef<number | null>(null)
  const [lockWidth, setLockWidth] = useState<number | null>(null)
  // 调用方自己定了宽（width 参数或 style.width）⇒ 不测量、不锁，照他的来。
  const hasOwnWidth = width !== undefined || (style !== undefined && style.width !== undefined)
  const lockable = !loadingText && !hasOwnWidth && !block
  const asyncClick = useAsyncClick(onClick, onBusyChange, (el) => {
    if (!lockable) return
    // 点击这一刻 DOM 还是「有文案」的样子，量到的是要锁的那个宽度。
    const w = el.getBoundingClientRect().width
    if (w > 0) {
      idleWidth.current = w
      setLockWidth(w)
    }
  })
  // 两个来源取或：外部传的 loading（别处刷新也能点亮它）+ 自己异步在跑
  const loading = loadingProp || asyncClick.busy
  // 外层浮层锁死：按自己的禁用态渲染，只做「或」—— 不写回调用方的 disabled，解锁即还原。
  const locked = useOverlayLocked()
  // 外部驱动的 loading 没有点击可抓：进 loading 那一次用上次记下的宽度补锁（绘制前重渲染，不见中间态）。
  useIsoLayoutEffect(() => {
    const el = btnRef.current
    if (el === null) return
    if (!loading) {
      const w = el.getBoundingClientRect().width
      if (w > 0) idleWidth.current = w
      if (lockWidth !== null) setLockWidth(null)
      return
    }
    if (!lockable) {
      if (lockWidth !== null) setLockWidth(null)
      return
    }
    if (lockWidth === null && idleWidth.current !== null) setLockWidth(idleWidth.current)
  }, [loading, lockable, lockWidth])
  // 三轴互斥：固定宽优先，min / max 失效；否则 min / max 各自生效。
  const widthStyle: CSSProperties = {}
  if (width !== undefined) {
    widthStyle.width = width
  } else if (loading && lockWidth !== null) {
    // 锁宽只在 loading 期间生效：结束时这一帧就回到自适应，不留额外一拍。
    widthStyle.width = lockWidth
  } else {
    if (minWidth !== undefined) widthStyle.minWidth = minWidth
    if (maxWidth !== undefined) widthStyle.maxWidth = maxWidth
  }
  // loading 且不保留文案 ⇒ 文字整块不渲染，按钮只剩一枚居中的圈。
  const hideText = loading && !loadingText
  // 最大宽 + 纯文字标签 ⇒ 折叠省略号、hover 跑马灯（复用全站唯一 MarqueeText）。
  const marqueeLabel = !hideText && maxWidth !== undefined && width === undefined && typeof children === 'string'
  // 文案没了，读屏名称得留住：字符串 children 自动补；复合 children 由调用方传 aria-label。
  const autoLabel = hideText && typeof children === 'string' ? children : undefined
  const attrs = {
    ...rest,
    // 核心全站不渲染原生 title：显式压掉，调用方即使经 rest 传也不会冒出 tooltip。
    title: undefined,
    ref: btnRef,
    type: (rest.type as string | undefined) ?? 'button',
    disabled: rest.disabled === true || loading || locked,
    // 与 IconButton 同一口径：文字还在，但让读屏知道它正在忙、不是单纯不可点
    'aria-busy': loading || undefined,
    ...(autoLabel !== undefined && rest['aria-label'] === undefined ? { 'aria-label': autoLabel } : {}),
    onClick: asyncClick.click,
    className: buttonClass(variant, size, block, icon !== undefined && icon !== null && !loading, dense, className),
    style: { ...colorVars(variant, color), ...widthStyle, ...style },
  }
  return h('button', attrs as never,
    loading
      // 转圈统一走 Loader：包在图标容器里 ⇒ 尺寸/对齐与常规前置图标完全一致，
      // 「有 icon 的按钮」切 loading 时宽度一点不动（容器内 svg 被 1em 规则接管）。
      ? h('span', { className: 'dshpc-btn__icon' }, h(Loader, { size: 'xs' }))
      : icon !== undefined && icon !== null
        ? h('span', { className: 'dshpc-btn__icon' }, icon)
        : null,
    hideText
      ? null
      : marqueeLabel
        ? h(MarqueeText, { text: children, className: 'dshpc-btn__label' })
        : children,
    // 转圈期间所有图标位都让位：前置位被 Loader 顶替，后置位（展开 / 外链）留在禁用态里只会挤版面
    iconRight !== undefined && iconRight !== null && !loading
      ? h('span', { className: 'dshpc-btn__icon-end' }, iconRight)
      : null)
}

/**
 * 渲染一个纯图标按钮。
 *
 * @param props 见 {@link IconButtonProps}。
 * @returns 图标按钮元素。
 */
export function IconButton(props: IconButtonProps): ReturnType<typeof h> {
  ensureComponentStyles('button', BUTTON_CSS)
  const {
    variant = 'plain', size = 'lg', icon, label, color, background, loading: loadingProp = false,
    dense = false, className, style, onClick, onBusyChange, ...rest
  } = props
  const asyncClick = useAsyncClick(onClick, onBusyChange)
  const loading = loadingProp || asyncClick.busy
  const locked = useOverlayLocked()
  // 只覆盖 4 个局部变量：图标色 / 底色及其 hover 派生（不新增皮肤，皮肤仍在 button.css）。
  const accent: Record<string, string> = {}
  if (color !== undefined && color !== '') {
    accent['--icb-fg'] = color
    accent['--icb-fg-hover'] = color
    accent['--icb-bg-hover'] = `color-mix(in srgb, ${color} 14%, transparent)`
  }
  if (background !== undefined && background !== '') {
    accent['--icb-bg'] = background
    accent['--icb-bg-hover'] = `color-mix(in srgb, ${background} 85%, var(--dshpc-fg))`
  }
  const attrs = {
    ...rest,
    type: (rest.type as string | undefined) ?? 'button',
    // 核心全站不渲染原生 title：显式压掉，调用方即使经 rest 传也不会冒出 tooltip。
    title: undefined,
    'aria-label': rest['aria-label'] ?? label,
    // 无障碍名不变（仍是 label），只声明「正在忙」，读屏不会把圈读成内容
    'aria-busy': loading || undefined,
    disabled: rest.disabled === true || loading || locked,
    onClick: asyncClick.click,
    className: `dshpc-iconbtn dshpc-iconbtn--${variant} dshpc-iconbtn--${size}${dense ? ' dshpc-iconbtn--dense' : ''}${className !== undefined && className !== '' ? ` ${className}` : ''}`,
    style: { ...accent, ...style } as CSSProperties,
  }
  return h('button', attrs as never, loading ? h(Loader, { size: 'xs' }) : icon)
}
