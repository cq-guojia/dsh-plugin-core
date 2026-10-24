// Office 预览体：宿主 remote.officeToPdf 转 PDF ⇒ iframe 渲染。
// officeToPdf 未注入（宿主没装 dsh-office-to-pdf）⇒ 「预览不可用」空态，不发起请求、不崩。
import { createElement as h, useEffect, useState } from 'react'
import { ensureControls } from '../../ui/css.js'
import { t, type Translate } from '../../utils/i18n.js'
import { bytesOf, errView, type OfficeToPdfFace } from '../types.js'

export interface OfficePreviewProps {
  officeToPdf: OfficeToPdfFace | null
  sessionId: string
  path: string
  translate?: Translate
}

export function OfficePreview(props: OfficePreviewProps): ReturnType<typeof h> {
  ensureControls()
  const tt = props.translate ?? t
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState<ReturnType<typeof errView> | null>(null)

  useEffect(() => {
    let alive = true
    let objectUrl: string | null = null
    setUrl(null)
    setFailed(null)
    const face = props.officeToPdf
    if (face === null) return
    face
      .render(props.sessionId, props.path, 'foreground')
      .then((res) => {
        const data = bytesOf(res)
        if (!alive) return
        if (data === null || 'failed' in data) {
          setFailed(errView(data === null ? undefined : data.failed))
          return
        }
        const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' })
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch((error: unknown) => {
        if (alive) setFailed(errView(error))
      })
    return () => {
      alive = false
      if (objectUrl !== null) URL.revokeObjectURL(objectUrl)
    }
  }, [props.officeToPdf, props.sessionId, props.path])

  if (props.officeToPdf === null) {
    return h('div', { className: 'dshpc-fb__note' }, tt('previewOfficeUnavailable'))
  }
  if (failed !== null) return h('div', { className: 'dshpc-fb__note' }, tt(failed.key, failed.params))
  if (url === null) return h('div', { className: 'dshpc-fb__note' }, tt('explorerLoading'))
  return h('iframe', { className: 'dshpc-fb__frame', src: url, title: props.path })
}
