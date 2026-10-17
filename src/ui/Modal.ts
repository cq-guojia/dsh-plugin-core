import { createElement as h, type ReactNode } from 'react'
import { ensureControls } from './css.js'
import { t, type Translate } from '../utils/i18n.js'

export interface ModalProps {
  title?: ReactNode
  /** 关闭回调；不传就不显示关闭钮（必须自己给关闭路径）。 */
  onClose?: () => void
  footer?: ReactNode
  children?: ReactNode
  translate?: Translate
}

/**
 * 模态弹窗（自绘 overlay，**不用 react-dom 的 portal**，避免多一个必需依赖）。
 *
 * 定位：它是**呈现方式**，不是内容 —— 会话预览这类功能模块要用弹窗时用它来承载（需求文档 §4）。
 */
export function Modal(props: ModalProps): ReturnType<typeof h> {
  ensureControls()
  const tt = props.translate ?? t
  return h(
    'div',
    {
      className: 'dsh-tdt-modal-mask',
      onClick: () => props.onClose?.(),
    },
    h(
      'div',
      {
        className: 'dsh-tdt-modal',
        onClick: (e: { stopPropagation: () => void }) => e.stopPropagation(),
      },
      h(
        'div',
        { className: 'dsh-tdt-modal__head' },
        h('div', { className: 'dsh-tdt-modal__title' }, props.title ?? ''),
        props.onClose === undefined
          ? null
          : h(
              'button',
              {
                type: 'button',
                className: 'dsh-tdt-picker__trigger',
                'aria-label': tt('modalClose'),
                onClick: () => props.onClose?.(),
              },
              '✕',
            ),
      ),
      h('div', { className: 'dsh-tdt-modal__body' }, props.children ?? null),
      props.footer === undefined ? null : h('div', { className: 'dsh-tdt-modal__foot' }, props.footer),
    ),
  )
}
