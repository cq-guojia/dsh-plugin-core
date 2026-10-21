/**
 * CodeViewer —— 只读源码查看器（替代官方 Shiki CodeBlock），DSH 共享底座版。
 *
 * 为什么换成 CodeMirror 6：官方 CodeBlock 把整篇 tokenize 成 <pre> + 每 token 一个
 * <span> 的巨型 DOM，拖动改宽会触发整棵子树重排，大文件首屏与拖拽都卡。CodeMirror
 * 是行级视图 + Lezer 增量高亮，宽度变化只重排可视区，天然不为整篇买单。
 *
 * 移植自兄弟项目 dsh-task-dispatch-table（src/client/ui/CodeViewer.tsx），按本仓约定重写：
 * 类名 dshpc-cv*、颜色吃 --dshpc-* token、官方图标 / writeClipboard 经 ui/official.ts 单一入口。
 *
 * 只读但可选中：仅用 <CodeMirror readOnly>（= EditorState.readOnly，挡住一切输入），
 * 不设置 editable=false —— 后者会把内容设为不可编辑并连带禁用鼠标选区，导致无法框选复制。
 *
 * 明暗判据（唯一）：body[data-ds-dark-theme]（见 design/style-kit.ts DARK_THEME_SELECTOR），
 * 禁用 prefers-color-scheme。
 */
import { createElement as h, useEffect, useMemo, useState, type CSSProperties, type ReactElement } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { IconCheckOutlineRegular, IconCopyOutlineRegular, writeClipboard } from './official.js'
import type { Translate } from '../utils/i18n.js'
import { languageForPath } from './code-viewer-lang.js'
import { codeMirrorTheme } from './code-viewer-theme.js'

/** 唯一明暗判据属性名（宿主启动脚本 toggleAttribute 写入 body）。 */
const DARK_ATTR = 'data-ds-dark-theme'

function hostDark(): boolean {
  if (typeof document === 'undefined') return false
  const body: HTMLElement | null = document.body
  return body === null ? false : body.hasAttribute(DARK_ATTR)
}

export interface CodeViewerProps {
  /** 源码文本。 */
  text: string
  /** 文件路径（用于按扩展名选语言）。 */
  path: string
  /** 翻译函数（核心内置字典自带 codeCopy / codeCopied）。 */
  t: Translate
  /** 可选：透传调用方样式类名（保留既有皮肤与高度上下文）。 */
  className?: string
  /** 可选：透传根 div 行内样式。 */
  style?: CSSProperties
  /** 可选：编辑器高度，默认 "100%"（填满父容器）；无确定高度上下文（如工具卡代码）传 "auto" 随内容撑高。 */
  height?: string
}

export function CodeViewer(props: CodeViewerProps): ReactElement {
  const { text, path, t, className, style, height = '100%' } = props
  const [copied, setCopied] = useState(false)
  const [dark, setDark] = useState<boolean>(hostDark)

  // 用户切主题 = 宿主 toggleAttribute 写 body[data-ds-dark-theme] ⇒ 用 MutationObserver 跟。
  // 挂载时先 sync 一次：插件挂载可能早于宿主写好该属性。
  useEffect(() => {
    if (typeof document === 'undefined' || typeof MutationObserver !== 'function') return
    const body: HTMLElement | null = document.body
    if (body === null) return
    const sync = (): void => { setDark(body.hasAttribute(DARK_ATTR)) }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(body, { attributeFilter: [DARK_ATTR] })
    return () => { observer.disconnect() }
  }, [])

  const language = useMemo(() => languageForPath(path), [path])

  const extensions = useMemo<Extension[]>(() => [
    ...codeMirrorTheme(dark),
    EditorView.lineWrapping, // 默认全换行，避免横向滚动条
    ...(language !== null ? [language] : []),
  ], [dark, language])

  const copy = (): void => {
    void writeClipboard(text).then((ok: boolean) => {
      if (ok) {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      }
    })
  }

  return h(
    'div',
    { className: `dshpc-cv${className ? ` ${className}` : ''}`, style },
    h(
      'button',
      {
        type: 'button',
        className: 'dshpc-cv__copy',
        onClick: copy,
        title: copied ? t('codeCopied') : t('codeCopy'),
        'aria-label': copied ? t('codeCopied') : t('codeCopy'),
      },
      copied ? h(IconCheckOutlineRegular) : h(IconCopyOutlineRegular),
    ),
    h(CodeMirror, {
      value: text,
      className: 'dshpc-cv__editor',
      theme: 'none',
      extensions,
      readOnly: true,
      height,
      style: { flex: '1 1 auto', minHeight: 0, overflow: 'hidden' },
      basicSetup: {
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
        autocompletion: false,
        bracketMatching: true,
        closeBrackets: false,
        indentOnInput: false,
        searchKeymap: false,
      },
    }),
  )
}
