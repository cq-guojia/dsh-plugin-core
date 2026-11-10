/**
 * CodeMirror 共用底座 —— 只读 CodeViewer 与可编辑 CodeEditor 共用这一份渲染。
 *
 * 放 infra 而不是某个控件目录：它是跨类共用的底座，不是控件（`structure.md` §二）。
 * 不对外导出，只在 `dsh-plugin-core/ui/code-viewer` 子路径内被两个控件引用 ——
 * `@uiw/react-codemirror` 是重依赖，不能从 `src/ui/index.ts` 可达。
 *
 * 明暗判据（唯一）：body[data-ds-dark-theme]，禁用 prefers-color-scheme。
 */
import { createElement as h, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { ensureComponentStyles } from './css.js'
import { CODE_VIEWER_CSS } from '../display/code-viewer-css.js'
import { languageForPath } from '../display/code-viewer-lang.js'
import { codeMirrorTheme } from '../display/code-viewer-theme.js'

const DARK_ATTR = 'data-ds-dark-theme'

function hostDark(): boolean {
  if (typeof document === 'undefined') return false
  const body: HTMLElement | null = document.body
  return body === null ? false : body.hasAttribute(DARK_ATTR)
}

export interface CodeMirrorSurfaceProps {
  /** 受控文本。 */
  value: string
  /** 文件路径（按扩展名选语法高亮）。 */
  path: string
  /** 只读开关：true = EditorState.readOnly，挡住一切输入但仍可框选复制。 */
  readOnly: boolean
  /** 可编辑时回传全文；只读时不传。 */
  onChange?: (value: string) => void
  /** 可选：浮在编辑器右上角的插槽（只读查看器的复制按钮）。 */
  overlay?: ReactNode
  className?: string
  style?: CSSProperties
  height?: string
  lineNumbers?: boolean
  focusLine?: number
}

export function CodeMirrorSurface(props: CodeMirrorSurfaceProps): ReactElement {
  ensureComponentStyles('code-viewer', CODE_VIEWER_CSS)
  const { value, path, readOnly, onChange, overlay, className, style, height = '100%', lineNumbers = true } = props
  const [dark, setDark] = useState<boolean>(hostDark)
  /** 编辑器实例（定位到行要 dispatch scrollIntoView）。 */
  const viewRef = useRef<EditorView | null>(null)

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

  // 定位到行：预览分页是逐步追加的，文本到了才能滚 ⇒ 跟着 value 再试一次。
  useEffect(() => {
    const view = viewRef.current
    if (view === null || props.focusLine === undefined) return
    if (props.focusLine > view.state.doc.lines) return
    view.dispatch({ effects: EditorView.scrollIntoView(view.state.doc.line(props.focusLine).from, { y: 'center' }) })
  }, [value, props.focusLine])

  return h(
    'div',
    { className: `dshpc-cv${className ? ` ${className}` : ''}`, style },
    overlay ?? null,
    h(CodeMirror, {
      value,
      className: 'dshpc-cv__editor dshpc-scroll-thin',
      theme: 'none',
      extensions,
      readOnly,
      onChange: onChange === undefined ? undefined : (next: string): void => { onChange(next) },
      height,
      onCreateEditor: (view: EditorView) => { viewRef.current = view },
      style: { flex: '1 1 auto', minHeight: 0, overflow: 'hidden' },
      // 编辑辅助只在可编辑态打开：只读查看器不该有当前行高亮 / 补全 / 括号配对这些编辑噪音。
      basicSetup: {
        lineNumbers,
        foldGutter: false,
        highlightActiveLine: !readOnly,
        highlightActiveLineGutter: !readOnly,
        autocompletion: !readOnly,
        bracketMatching: true,
        closeBrackets: !readOnly,
        indentOnInput: !readOnly,
        searchKeymap: !readOnly,
      },
    }),
  )
}
