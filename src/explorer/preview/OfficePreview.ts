// Office 预览体：宿主 remote.officeToPdf 转 PDF ⇒ iframe 渲染。
// officeToPdf 未注入（宿主没装 dsh-office-to-pdf）⇒ 「预览不可用」空态，不发起请求、不崩。
import { createElement as h, useEffect, useState } from 'react'
import { t, type Translate } from '../../utils/i18n.js'
import { bytesOf, errView, isAborted, type OfficeToPdfFace } from '../types.js'
import { ensureComponentStyles } from '../../ui/css.js'
import { EXPLORER_CSS } from '../explorer-css.js'

export interface OfficePreviewProps {
  officeToPdf: OfficeToPdfFace | null
  sessionId: string
  path: string
  translate?: Translate
}

export function OfficePreview(props: OfficePreviewProps): ReturnType<typeof h> {
  ensureComponentStyles('explorer', EXPLORER_CSS)
  const tt = props.translate ?? t
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState<ReturnType<typeof errView> | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let objectUrl: string | null = null
    setUrl(null)
    setFailed(null)
    const face = props.officeToPdf
    if (face === null) return
    // 转换慢也不能让它挡路：切文件即 abort（官方实现按「最后一个读者取消」释放共享转换）。
    face
      .render(props.sessionId, props.path, 'foreground', controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return
        const data = bytesOf(res)
        if (data === null || 'failed' in data) {
          setFailed(errView(data === null ? undefined : data.failed))
          return
        }
        const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' })
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch((error: unknown) => {
        if (isAborted(controller.signal, error)) return
        setFailed(errView(error))
      })
    return () => {
      controller.abort()
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
