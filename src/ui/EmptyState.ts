import { createElement as h, type ReactNode } from 'react'
import { ensureControls } from './css.js'
import { t, type Translate } from '../utils/i18n.js'

export interface EmptyStateProps {
  /** 说明文案；不传用内置「暂无数据」。 */
  text?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  translate?: Translate
}

/** 空态：列表没数据 / 取数为空时统一用这一个，别各自手写「暂无」。 */
export function EmptyState(props: EmptyStateProps): ReturnType<typeof h> {
  ensureControls()
  const tt = props.translate ?? t
  return h(
    'div',
    { className: 'dshpc-empty' },
    props.icon ?? null,
    h('div', null, props.text ?? tt('emptyText')),
    props.action ?? null,
  )
}
