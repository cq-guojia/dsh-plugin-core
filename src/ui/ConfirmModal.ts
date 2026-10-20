import { createElement as h, type ReactNode } from 'react'
import { Modal, type ModalSize } from './Modal.js'
import { Button } from './Button.js'
import { t, type Translate } from '../utils/i18n.js'

/** 确认钮语义档（决定确认钮外观）。 */
export type ConfirmTone = 'primary' | 'danger' | 'warning'

export interface ConfirmModalProps {
  title?: ReactNode
  /** 说明文字 / 任意内容。 */
  message?: ReactNode
  /** 确认钮语义档（默认 primary；danger=红 / warning=黄）。 */
  tone?: ConfirmTone
  /** 确认钮文案（默认 i18n「确定」）。 */
  confirmText?: string
  /** 取消钮文案（默认 i18n「取消」）。 */
  cancelText?: string
  /** 点遮罩是否关闭（默认 true；点了 = 取消）。 */
  closeOnMask?: boolean
  size?: ModalSize
  /** 确认回调。 */
  onConfirm?: () => void
  /** 取消 / 遮罩 / Esc 回调。 */
  onCancel?: () => void
  translate?: Translate
}

/**
 * 确认框（语义层，基于 Modal）：双按钮（取消 outline + 确认语义档）、无 ✕；无标题时整条头部消失。
 * 样式封闭：按钮只暴露语义档（tone → variant），不透传任意 className/style。
 */
export function ConfirmModal(props: ConfirmModalProps): ReturnType<typeof h> {
  const tt = props.translate ?? t
  const tone = props.tone ?? 'primary'
  const confirmVariant = tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'primary'
  return h(
    Modal,
    {
      title: props.title,
      size: props.size ?? 'sm',
      hideHeader: props.title === undefined,
      closable: false,
      closeOnMask: props.closeOnMask,
      onClose: props.onCancel,
      footer: h(
        'div',
        { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } },
        h(Button, { variant: 'outline', onClick: () => props.onCancel?.() }, props.cancelText ?? tt('cancel')),
        h(Button, { variant: confirmVariant, onClick: () => props.onConfirm?.() }, props.confirmText ?? tt('confirm')),
      ),
    },
    props.message ?? null,
  )
}
