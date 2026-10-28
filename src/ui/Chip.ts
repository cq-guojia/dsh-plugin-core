import { createElement as h, type CSSProperties, type ReactNode } from 'react'
import { ensureControls } from './css.js'
import { MarqueeText } from './MarqueeText.js'

/** 标签语义色档（非 neutral 为实心信号面，字色配对见 chip.css）。 */
export type ChipTone = 'neutral' | 'business' | 'success' | 'warning' | 'danger'

/** 标签尺寸档（sm 即旧版默认，逐像素不变；xs 为 2026-10-20 新增的超小档）。 */
export type ChipSize = 'sm' | 'md' | 'xs'

export interface ChipProps {
  children?: ReactNode
  /** 语义色（默认 neutral 灰面）。 */
  tone?: ChipTone
  /** 尺寸（默认 sm）。 */
  size?: ChipSize
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
  onClick?: () => void
  /** 追加 class（只允许补布局，不许覆盖皮肤）。 */
  className?: string
}

/** 小标签（neutral 用现成的 `--dshpc-chip-bg`；传 `onClick` 才是可点的）。 */
export function Chip(props: ChipProps): ReturnType<typeof h> {
  ensureControls()
  const {
    children, tone = 'neutral', size = 'sm', width, minWidth, maxWidth, onClick, className,
  } = props
  const clickable = onClick !== undefined
  // 三轴互斥：固定宽优先，min / max 失效；否则 min / max 各自生效。
  const widthStyle: CSSProperties = {}
  if (width !== undefined) {
    widthStyle.width = width
  } else {
    if (minWidth !== undefined) widthStyle.minWidth = minWidth
    if (maxWidth !== undefined) widthStyle.maxWidth = maxWidth
  }
  // 最大宽 + 纯文字内容 ⇒ 折叠省略号、hover 跑马灯（复用全站唯一 MarqueeText）。
  const marqueeLabel = maxWidth !== undefined && width === undefined && typeof children === 'string'
  return h(
    clickable ? 'button' : 'span',
    {
      type: clickable ? 'button' : undefined,
      className: `dshpc-chip`
        + `${tone !== 'neutral' ? ` dshpc-chip--${tone}` : ''}`
        + `${size !== 'sm' ? ` dshpc-chip--${size}` : ''}`
        + `${clickable ? ' dshpc-chip--clickable' : ''}`
        + `${className === undefined ? '' : ` ${className}`}`,
      style: widthStyle,
      onClick,
    },
    marqueeLabel
      ? h(MarqueeText, { text: children, className: 'dshpc-chip__label' })
      : children ?? null,
  )
}
