import { createElement as h, useEffect, useState, type ReactNode } from 'react'
import { ensureControls } from '../ui/css.js'
import { Modal } from '../ui/Modal.js'
import { EmptyState } from '../ui/EmptyState.js'
import { t, type Translate } from '../utils/i18n.js'
import { formatBytes } from '../utils/number.js'
import { ROLE_LABEL_KEY, type SessionMessage, type SessionSource } from './types.js'

/**
 * 承载方式 —— 弹窗只是**当前**的呈现方式，将来也可能是侧栏或整页（需求文档 §2.5）。
 */
export type SessionPreviewVariant = 'modal' | 'sidebar' | 'page'

export interface SessionPreviewProps {
  sessionId: string
  /** 取数能力，由插件从宿主取出后注入。 */
  source: SessionSource
  variant?: SessionPreviewVariant
  title?: ReactNode
  onClose?: () => void
  /** 定制扩展点：自定义单条消息渲染（富内容 / 工具卡走这里）。 */
  renderMessage?: (message: SessionMessage) => ReactNode
  /** 点附件「打开」时的回调（通常是把路径交给 explorer）。 */
  onOpenFile?: (path: string) => void
  translate?: Translate
}

export function SessionPreview(props: SessionPreviewProps): ReturnType<typeof h> {
  ensureControls()
  const tt = props.translate ?? t
  const variant = props.variant ?? 'modal'
  const [messages, setMessages] = useState<SessionMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setFailed(false)
    props.source
      .listMessages(props.sessionId)
      .then((list) => {
        if (alive) {
          setMessages(list)
          setLoading(false)
        }
      })
      .catch(() => {
        if (alive) {
          setMessages([])
          setFailed(true)
          setLoading(false)
        }
      })
    return () => {
      alive = false
    }
  }, [props.sessionId, props.source, nonce])

  const body: ReactNode = loading
    ? h('div', { className: 'dshpc-ses__note' }, tt('sessionLoading'))
    : failed
      ? h(EmptyState, {
          text: tt('sessionFailed'),
          translate: tt,
          action: h(
            'button',
            { type: 'button', className: 'dshpc-error__retry', onClick: () => setNonce(nonce + 1) },
            tt('errorRetry'),
          ),
        })
      : messages.length === 0
        ? h(EmptyState, { text: tt('sessionEmpty'), translate: tt })
        : h(
            'div',
            { className: 'dshpc-ses__list' },
            messages.map((m) =>
              props.renderMessage !== undefined
                ? h('div', { key: m.id }, props.renderMessage(m))
                : h(
                    'div',
                    { key: m.id, className: `dshpc-ses__msg dshpc-ses__msg--${m.role}` },
                    h('div', { className: 'dshpc-ses__head' }, tt(ROLE_LABEL_KEY[m.role])),
                    h('pre', { className: 'dshpc-ses__text' }, m.text),
                    (m.attachments ?? []).length === 0
                      ? null
                      : h(
                          'div',
                          { className: 'dshpc-ses__atts' },
                          (m.attachments ?? []).map((a) =>
                            h(
                              'button',
                              {
                                key: a.path,
                                type: 'button',
                                className: 'dshpc-ses__att',
                                onClick: () => props.onOpenFile?.(a.path),
                              },
                              a.name,
                              a.bytes === undefined ? null : ` ${formatBytes(a.bytes)}`,
                            ),
                          ),
                        ),
                  ),
            ),
          )

  if (variant === 'modal') {
    return h(Modal, {
      title: props.title ?? props.sessionId,
      onClose: props.onClose,
      children: h('div', { className: 'dshpc-ses', style: { minWidth: 'min(720px, 88vw)' } }, body),
    })
  }

  return h(
    'div',
    { className: `dshpc-ses dshpc-ses--${variant}` },
    props.onClose === undefined
      ? null
      : h(
          'div',
          { className: 'dshpc-ses__head' },
          h(
            'button',
            { type: 'button', className: 'dshpc-exp__crumb', onClick: props.onClose },
            '✕',
          ),
        ),
    body,
  )
}

export { ROLE_LABEL_KEY } from './types.js'
export type { SessionAttachment, SessionMessage, SessionRole, SessionSource } from './types.js'
