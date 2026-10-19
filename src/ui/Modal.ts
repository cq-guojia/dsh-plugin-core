import { createElement as h, useEffect, type ReactNode } from 'react'
import { ensureControls } from './css.js'
import { t, type Translate } from '../utils/i18n.js'

export interface ModalProps {
  title?: ReactNode
  /** 关闭回调；不传就不显示关闭钮（必须自己给关闭路径）。 */
  onClose?: () => void
  /** 点遮罩是否关闭（默认 true；误触代价大的场景设 false）。 */
  closeOnMask?: boolean
  /** 按 Esc 是否关闭（默认 true）。 */
  escClose?: boolean
  /** 面板最大宽度，默认 `min(960px, 92vw)`。 */
  maxWidth?: string
  /** 不传 `title` 且传这个为 true ⇒ 不渲染头部（沉浸式场景）。 */
  hideHeader?: boolean
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
  const closeOnMask = props.closeOnMask !== false
  const escClose = props.escClose !== false

  useEffect(() => {
    if (!escClose || props.onClose === undefined) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') props.onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [escClose, props.onClose])

  return h(
    'div',
    {
      className: 'dshpc-modal-mask',
      onClick: () => {
        if (closeOnMask) props.onClose?.()
      },
    },
    h(
      'div',
      {
        className: 'dshpc-modal',
        style: props.maxWidth === undefined ? undefined : { maxWidth: props.maxWidth },
        onClick: (e: { stopPropagation: () => void }) => e.stopPropagation(),
      },
      props.hideHeader === true || (props.title === undefined && props.onClose === undefined)
        ? null
        : h(
            'div',
            { className: 'dshpc-modal__head' },
            h('div', { className: 'dshpc-modal__title' }, props.title ?? ''),
            props.onClose === undefined
              ? null
              : h(
                  'button',
                  {
                    type: 'button',
                    className: 'dshpc-modal__close',
                    'aria-label': tt('modalClose'),
                    onClick: () => props.onClose?.(),
                  },
                  '✕',
                ),
          ),
      h('div', { className: 'dshpc-modal__body' }, props.children ?? null),
      props.footer === undefined ? null : h('div', { className: 'dshpc-modal__foot' }, props.footer),
    ),
  )
}
