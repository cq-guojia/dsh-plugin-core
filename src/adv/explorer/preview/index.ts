// 单文件预览分派：按扩展名选预览体（image/pdf/md/html/office/text），认不出 ⇒ 明确兜底。
// md/html 的「渲染 ⇄ 源码」由面板工具条切 sourceView 传进来。
import { createElement as h } from 'react'
import { ensureControls } from '../../../ui/infra/css.js'
import { t, type Translate } from '../../../utils/i18n.js'
import { previewInfoOf, type OfficeToPdfFace } from '../types.js'
import type { FsFace } from '../fs-face.js'
import { BytesPreview } from './BytesPreview.js'
import { HtmlPreview } from './HtmlPreview.js'
import { OfficePreview } from './OfficePreview.js'
import { TextPreview } from './TextPreview.js'

export { BytesPreview, type BytesPreviewProps } from './BytesPreview.js'
export { HtmlPreview, buildStaticHtml, type HtmlPreviewProps } from './HtmlPreview.js'
export { OfficePreview, type OfficePreviewProps } from './OfficePreview.js'
export { TextPreview, type TextPreviewProps } from './TextPreview.js'

export interface FilePreviewProps {
  /** 只读文件面（绝对路径）。 */
  files: FsFace
  /** Office 预览要的会话；可省 ⇒ 预览体按宿主工作区快照自己挑一条。 */
  sessionId?: string
  path: string
  /** 官方 remote.officeToPdf；未就位传 null ⇒ Office 文件出「不可用」空态。 */
  officeToPdf?: OfficeToPdfFace | null
  /** true = 源码态（md/html 生效）。 */
  sourceView?: boolean
  /** 打开即定位到这一行（1 起；只对文本/源码态生效）。 */
  line?: number
  translate?: Translate
}

export function FilePreview(props: FilePreviewProps): ReturnType<typeof h> | null {
  ensureControls()
  const tt = props.translate ?? t
  const info = previewInfoOf(props.path)
  const sourceView = props.sourceView === true
  switch (info.kind) {
    case 'image':
    case 'pdf':
      return h(BytesPreview, {
        files: props.files,
        path: props.path,
        kind: info.kind,
        mime: info.mime ?? 'application/octet-stream',
        translate: tt,
      })
    case 'office':
      return h(OfficePreview, {
        officeToPdf: props.officeToPdf ?? null,
        sessionId: props.sessionId,
        path: props.path,
        translate: tt,
      })
    case 'html':
      return h(HtmlPreview, {
        files: props.files,
        path: props.path,
        sourceView,
        translate: tt,
      })
    case 'md':
    case 'text':
      return h(TextPreview, {
        files: props.files,
        path: props.path,
        markdown: info.kind === 'md',
        sourceView,
        focusLine: props.line,
        translate: tt,
      })
  }
  // switch 已穷尽 PreviewKind；保留 return 满足 TS 控制流分析
  return null
}
