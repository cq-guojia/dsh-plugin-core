import { createElement as h, type ReactNode } from 'react'
import { ensureControls } from './css.js'

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
  onClick?: () => void
  className?: string
}

/** 小标签（neutral 用现成的 `--dshpc-chip-bg`；传 `onClick` 才是可点的）。 */
export function Chip(props: ChipProps): ReturnType<typeof h> {
  ensureControls()
  const clickable = props.onClick !== undefined
  const tone = props.tone ?? 'neutral'
  const size = props.size ?? 'sm'
  return h(
    clickable ? 'button' : 'span',
    {
      type: clickable ? 'button' : undefined,
      className: `dshpc-chip`
        + `${tone !== 'neutral' ? ` dshpc-chip--${tone}` : ''}`
        + `${size !== 'sm' ? ` dshpc-chip--${size}` : ''}`
        + `${clickable ? ' dshpc-chip--clickable' : ''}`
        + `${props.className === undefined ? '' : ` ${props.className}`}`,
      onClick: props.onClick,
    },
    props.children ?? null,
  )
}
