import { createElement as h, type ReactNode } from 'react'
import { Modal, type ModalSize } from './Modal.js'
import { Button } from './Button.js'
import { t, type Translate } from '../utils/i18n.js'

/** Alert 信号档（图标 + 配色由头部 severity 图标承载）。 */
export type AlertSeverity = 'info' | 'success' | 'warning' | 'error'

const SEVERITY_GLYPH: Record<AlertSeverity, string> = {
  info: 'ⓘ',
  success: '✓',
  warning: '⚠',
  error: '✕',
}

export interface AlertModalProps {
  /** 主标题（不传则整条头部消失，直接出说明文字）。 */
  title?: ReactNode
  /** 说明文字 / 任意内容。 */
  message?: ReactNode
  /** 信号档（默认 info）。 */
  severity?: AlertSeverity
  /** 确认按钮文案（默认 i18n「知道了」）。 */
  confirmText?: string
  /** 点遮罩是否关闭（默认 true）。 */
  closeOnMask?: boolean
  /** 尺寸档（默认 sm 确认框宽度）。 */
  size?: ModalSize
  /** 点击确认 / 遮罩 / Esc 的统一出口（单按钮弹窗，关闭即确认）。 */
  onConfirm?: () => void
  translate?: Translate
}

/**
 * 警告框（语义层，基于 Modal）：单按钮 + 无 ✕ + severity 图标；无标题时整条头部消失。
 * 样式封闭：按钮只暴露语义档（primary），不透传任意 className/style。
 */
export function AlertModal(props: AlertModalProps): ReturnType<typeof h> {
  const tt = props.translate ?? t
  const severity = props.severity ?? 'info'
  return h(
    Modal,
    {
      icon: h('span', { className: `dshpc-alert-sev dshpc-alert-sev--${severity}` }, SEVERITY_GLYPH[severity]),
      title: props.title,
      size: props.size ?? 'sm',
      hideHeader: props.title === undefined,
      closable: false,
      closeOnMask: props.closeOnMask,
      onClose: props.onConfirm,
      footer: h(Button, { variant: 'primary', onClick: () => props.onConfirm?.() }, props.confirmText ?? tt('dialogOk')),
    },
    props.message ?? null,
  )
}
