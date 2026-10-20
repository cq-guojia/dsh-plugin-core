// 二进制预览体：图片（<img>）/ PDF（iframe 原生渲染）。
// readBytes 读全量（受部署 maxFileBytes 封顶，超出抛 too-large ⇒ 错误态）。
import { createElement as h, useEffect, useState } from 'react'
import { ensureControls } from '../../ui/css.js'
import { EmptyState } from '../../ui/EmptyState.js'
import { t, type Translate } from '../../utils/i18n.js'
import { bytesOf, errView, type WorkspaceFilesFace } from '../types.js'

export interface BytesPreviewProps {
  workspaceFiles: WorkspaceFilesFace
  sessionId: string
  path: string
  kind: 'image' | 'pdf'
  mime: string
  translate?: Translate
}

export function BytesPreview(props: BytesPreviewProps): ReturnType<typeof h> {
  ensureControls()
  const tt = props.translate ?? t
  const [url, setUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState<ReturnType<typeof errView> | null>(null)

  useEffect(() => {
    let alive = true
    let objectUrl: string | null = null
    setUrl(null)
    setFailed(null)
    props.workspaceFiles
      .readBytes(props.sessionId, props.path, {})
      .then((res) => {
        const data = bytesOf(res)
        if (!alive) return
        if (data === null || 'failed' in data) {
          setFailed(errView(data === null ? undefined : data.failed))
          return
        }
        // 复制一份：TS 5.9 下 Uint8Array<ArrayBufferLike> 不是合法的 BlobPart
        const blob = new Blob([new Uint8Array(data)], { type: props.mime })
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
  }, [props.workspaceFiles, props.sessionId, props.path, props.mime])

  if (failed !== null) return h(EmptyState, { text: tt(failed.key, failed.params), translate: tt })
  if (url === null) return h('div', { className: 'dshpc-fb__note' }, tt('explorerLoading'))
  if (props.kind === 'image') {
    return h('img', { className: 'dshpc-fb__image', src: url, alt: props.path })
  }
  return h('iframe', { className: 'dshpc-fb__frame', src: url, title: props.path })
}
