import { createElement as h, useState, type ReactNode } from 'react'
import { Modal, type ModalSize } from './Modal.js'
import { Button } from './Button.js'
import { t, type Translate } from '../utils/i18n.js'
import { ensureComponentStyles } from './css.js'
import { FEEDBACK_CSS } from './feedback-css.js'

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
  /** 确认钮定宽（px 或任意 CSS 宽度值）；loading 转圈会把按钮撑宽，定宽后不跳。 */
  confirmWidth?: number | string
  /**
   * loading 时是否保留按钮文案（默认 true）。传 `false`：loading 期间清文字、
   * 锁在「有文案」的宽度上、只留一枚居中的圈（见 `Button.loadingText`）。
   */
  loadingText?: boolean
  /** 点遮罩是否关闭（默认 true）。 */
  closeOnMask?: boolean
  /** 外部驱动确认钮 loading（如别处正在刷新）。与按钮自己的异步状态取或。 */
  confirmLoading?: boolean
  /** 底栏左侧的一行过程提示（换字即翻牌，超长省略 + hover 跑马灯）。不传 = 不占位。 */
  notice?: string
  /** 尺寸档（默认 sm 确认框宽度）。 */
  size?: ModalSize
  /** 点击确认 / 遮罩 / Esc 的统一出口（单按钮弹窗，关闭即确认）；**返回 Promise 自动转圈 + 整框锁死**。 */
  onConfirm?: () => unknown
  translate?: Translate
}

/**
 * 警告框（语义层，基于 Modal）：单按钮 + 无 ✕ + severity 图标；无标题时整条头部消失。
 * 样式封闭：按钮只暴露语义档（primary），不透传任意 className/style。
 */
export function AlertModal(props: AlertModalProps): ReturnType<typeof h> {
  ensureComponentStyles('feedback', FEEDBACK_CSS)
  const tt = props.translate ?? t
  const severity = props.severity ?? 'info'
  const [running, setRunning] = useState(false)
  // 在跑（自己点的或外部传的）⇒ 遮罩 / Esc 一律不关。
  const busy = running || props.confirmLoading === true
  return h(
    Modal,
    {
      icon: h('span', { className: `dshpc-alert-sev dshpc-alert-sev--${severity}` }, SEVERITY_GLYPH[severity]),
      title: props.title,
      size: props.size ?? 'sm',
      hideHeader: props.title === undefined,
      closable: false,
      closeOnMask: props.closeOnMask,
      busy,
      onClose: props.onConfirm,
      notice: props.notice,
      footer: h(Button, {
        variant: 'primary',
        width: props.confirmWidth,
        loadingText: props.loadingText,
        loading: props.confirmLoading === true,
        onBusyChange: setRunning,
        onClick: () => props.onConfirm?.(),
      }, props.confirmText ?? tt('dialogOk')),
    },
    props.message ?? null,
  )
}
