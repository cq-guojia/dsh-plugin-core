import { createElement as h, type ReactNode } from 'react'
import { ensureControls } from './css.js'

export interface ChipProps {
  children?: ReactNode
  onClick?: () => void
  className?: string
}

/** 小标签（token 用现成的 `--tdt-chip-bg`；传 `onClick` 才是可点的）。 */
export function Chip(props: ChipProps): ReturnType<typeof h> {
  ensureControls()
  const clickable = props.onClick !== undefined
  return h(
    clickable ? 'button' : 'span',
    {
      type: clickable ? 'button' : undefined,
      className: `dsh-tdt-chip${clickable ? ' dsh-tdt-chip--clickable' : ''}${props.className === undefined ? '' : ` ${props.className}`}`,
      onClick: props.onClick,
    },
    props.children ?? null,
  )
}
