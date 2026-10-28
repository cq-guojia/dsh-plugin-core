/**
 * 按钮 / 图标钮 —— **全站唯一实现**（L2 组件皮肤，P2）
 *
 * 三轴模型：
 *  - `variant`：外观档（形态 + 语义色），共 10 档
 *      primary（黑实心）/ secondary（灰实心）/ outline（描边）/ ghost（无底无边）
 *      danger（红实心）/ success（绿实心）/ warning（黄实心）/ info（蓝实心）
 *      danger-outline（红字描边）/ link（行内链接）
 *  - `size`：`sm`(24) / `md`(28) / `lg`(32) —— 高度一律吃 `--dshpc-control-h-*`，
 *    **有边 / 无边同高**（边框在内部补回）
 *  - `block`：撑满父宽
 *
 * 内容轴：`icon`（前置）/ `iconRight`（后置）/ `loading`（前置小圈并自动禁用）。
 * 颜色轴：任一档都可以再用 `color` 传任意 CSS 色值 —— 只覆盖 `--btn-*` 几个变量，
 * 不新增皮肤（皮肤仍只在 `controls-css.ts` 里）。
 *
 * `IconButton` 是纯图标钮：`plain`（默认无底无边，hover 起灰底）/ `outline`（描边）/ `danger`（红）。
 * 兼容别名：`danger-ink` 仍是 `danger-outline` 的旧类名，可直接挂 className。
 *
 * ⚠️ 不许在任何使用点就地写按钮样式；要多一档外观 ⇒ 改基础层（一处改全站生效）。
 */
import { ensureControls } from './css.js'
import { MarqueeText } from './MarqueeText.js'
import { createElement as h, type CSSProperties, type ReactNode } from 'react'

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

/** 按钮高度档（sm 24 / md 28 / lg 32）。 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/** 实心档（color 参数按「底色」处理；其余档按「字色 + 描边色」处理）。 */
const SOLID_VARIANTS: readonly ButtonVariant[] = ['primary', 'secondary', 'danger', 'success', 'warning', 'info']

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
  /** 加载中：文案前显示同色小圈，并自动禁用点击。 */
  loading?: boolean
  /** 撑满父宽。 */
  block?: boolean
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
  /** 外观档（默认 plain）。 */
  variant?: 'plain' | 'outline' | 'danger'
  /** 高度档（默认 lg）。 */
  size?: ButtonSize
  /** 图标（必填）。 */
  icon: ReactNode
  /** 无障碍名（必填；同时作为默认 title）。 */
  label: string
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
function buttonClass(variant: ButtonVariant, size: ButtonSize, block: boolean, hasIcon: boolean, extra?: string): string {
  return `dshpc-btn dshpc-btn--${variant} dshpc-btn--${size}`
    + `${block ? ' dshpc-btn--block' : ''}`
    // 前置图标标记：block 时靠它把文字拉回视觉中心（见 controls-css 的 --icon-start 规则）
    + `${hasIcon ? ' dshpc-btn--icon-start' : ''}`
    + `${extra !== undefined && extra !== '' ? ` ${extra}` : ''}`
}

/**
 * 渲染一个「图标 + 文案」按钮。
 *
 * @param props 见 {@link ButtonProps}。
 * @returns 按钮元素。
 */
export function Button(props: ButtonProps): ReturnType<typeof h> {
  ensureControls()
  const {
    variant = 'outline', size = 'lg', icon, iconRight, color, loading = false,
    block = false, width, minWidth, maxWidth, className, style, children, ...rest
  } = props
  // 三轴互斥：固定宽优先，min / max 失效；否则 min / max 各自生效。
  const widthStyle: CSSProperties = {}
  if (width !== undefined) {
    widthStyle.width = width
  } else {
    if (minWidth !== undefined) widthStyle.minWidth = minWidth
    if (maxWidth !== undefined) widthStyle.maxWidth = maxWidth
  }
  // 最大宽 + 纯文字标签 ⇒ 折叠省略号、hover 跑马灯（复用全站唯一 MarqueeText）。
  const marqueeLabel = maxWidth !== undefined && width === undefined && typeof children === 'string'
  const attrs = {
    ...rest,
    type: (rest.type as string | undefined) ?? 'button',
    disabled: rest.disabled === true || loading,
    className: buttonClass(variant, size, block, icon !== undefined && icon !== null && !loading, className),
    style: { ...colorVars(variant, color), ...widthStyle, ...style },
  }
  return h('button', attrs as never,
    loading
      // 转圈用 SVG 矢量弧，不用 border 画环：1.5px 的次像素边框在 12px 圆上会被抗锯齿拉毛，
      // 看着像圆角方（实测 computed radius 确实是 999px，不是被覆盖 —— 是渲染质量问题）。
      ? h('svg', {
          className: 'dshpc-btn__spinner',
          viewBox: '0 0 12 12',
          width: 12,
          height: 12,
          'aria-hidden': true,
        }, h('circle', {
          cx: 6, cy: 6, r: 4.75, fill: 'none',
          stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round',
          // 周长 ≈ 29.85，画 22 的弧 + 足够长的空缺 ⇒ 一个约 270° 的开口环
          strokeDasharray: '22 30',
        }))
      : icon !== undefined && icon !== null
        ? h('span', { className: 'dshpc-btn__icon' }, icon)
        : null,
    marqueeLabel
      ? h(MarqueeText, { text: children, className: 'dshpc-btn__label' })
      : children,
    iconRight !== undefined && iconRight !== null
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
  ensureControls()
  const { variant = 'plain', size = 'lg', icon, label, className, style, ...rest } = props
  const attrs = {
    ...rest,
    type: (rest.type as string | undefined) ?? 'button',
    title: rest.title ?? label,
    'aria-label': rest['aria-label'] ?? label,
    className: `dshpc-iconbtn dshpc-iconbtn--${variant} dshpc-iconbtn--${size}${className !== undefined && className !== '' ? ` ${className}` : ''}`,
    style,
  }
  return h('button', attrs as never, icon)
}
