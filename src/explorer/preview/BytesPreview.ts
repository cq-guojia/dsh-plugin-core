// 二进制预览体：图片（<img>）/ PDF（iframe 原生渲染）。
// readBytes 读全量（受部署 maxFileBytes 封顶，超出抛 too-large ⇒ 错误态）。
import { createElement as h, useEffect, useState } from 'react'
import { t, type Translate } from '../../utils/i18n.js'
import { bytesOf, errView, isAborted, type WorkspaceFilesFace } from '../types.js'
import { ensureComponentStyles } from '../../ui/css.js'
import { EXPLORER_CSS } from '../explorer-css.js'

export interface BytesPreviewProps {
  workspaceFiles: WorkspaceFilesFace
  sessionId: string
  path: string
  kind: 'image' | 'pdf'
  mime: string
  translate?: Translate
}

export function BytesPreview(props: BytesPreviewProps): ReturnType<typeof h> {
  ensureComponentStyles('explorer', EXPLORER_CSS)
  const tt = props.translate ?? t
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState<ReturnType<typeof errView> | null>(null)

  useEffect(() => {
    // 切文件 / 卸载即取消：signal 是真取消（官方 remote 声明了 cancellation 形参），
    // 不必等它读完再丢弃；被取消的结果一律静默（不 setState、不出错误态）。
    const controller = new AbortController()
    let objectUrl: string | null = null
    setUrl(null)
    setFailed(null)
    props.workspaceFiles
      .readBytes(props.sessionId, props.path, {}, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return
        const data = bytesOf(res)
        if (data === null) {
          console.warn('[dsh-plugin-core:explorer] readBytes 返回体无法解析为字节', props.path, res)
          setFailed({ key: 'previewBadPayload' })
          return
        }
        if ('failed' in data) {
          setFailed(errView(data.failed))
          return
        }
        // 复制一份：TS 5.9 下 Uint8Array<ArrayBufferLike> 不是合法的 BlobPart
        const blob = new Blob([new Uint8Array(data)], { type: props.mime })
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
  }, [props.workspaceFiles, props.sessionId, props.path, props.mime])

  if (failed !== null) return h('div', { className: 'dshpc-fb__note' }, tt(failed.key, failed.params))
  if (url === null) return h('div', { className: 'dshpc-fb__note' }, tt('explorerLoading'))
  if (props.kind === 'image') {
    return h('img', { className: 'dshpc-fb__image', src: url, alt: props.path })
  }
  return h(
    'div',
    { className: 'dshpc-fb__fill' },
    h('iframe', { className: 'dshpc-fb__frame', src: url, title: props.path }),
  )
}
