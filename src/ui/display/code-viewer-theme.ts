/**
 * CodeMirror 6 的「表面层」——DSH 共享底座只负责编辑器怎么贴合宿主面板，
 * 语法高亮与明暗主题一律交给 @uiw/react-codemirror 的官方实现。
 *
 * 分工（规范做法）：
 *  - src/ui/infra/code-mirror-surface.ts 按 body[data-ds-dark-theme] 给 <CodeMirror>
 *    传 theme='dark' | 'light'；
 *  - 暗色由官方挂 oneDark（oneDarkTheme + syntaxHighlighting(oneDarkHighlightStyle)），
 *    亮色由 basicSetup 挂官方 defaultHighlightStyle 兜底。官方 highlighter 覆盖含
 *    tags.processingInstruction 在内的语言全集；
 *  - 本文件只覆盖表面：透明底、字体、行号槽、选区、自绘光标，颜色吃 --dshpc-* token。
 *    用户扩展在 useCodeMirror.ts:98 被 concat 在官方扩展之后，故这里的同特异性规则
 *    能盖过官方主题的面板背景。
 *
 * 曾经手抄过明暗两张 tag 配色表并注册成正式 highlighter，那会整份顶掉官方兜底
 * （@codemirror/language 的 getHighlighters：有正式的就不看 fallback），漏一条 tag
 * 就少一种颜色，是「发现一个补一个」的根因，已删除。
 *
 * 明暗判据（唯一）：body[data-ds-dark-theme]，禁用 prefers-color-scheme。
 */
import { type Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

// 光标兜底色：只在 --dshpc-fg 未注入时生效，不是语法配色表。
const CURSOR_FALLBACK_DARK = '#abb2bf'
const CURSOR_FALLBACK_LIGHT = '#383a42'

// 表面层：透明底、13px、等宽字体、行号槽取 --dshpc-fg-3；盖过官方主题的面板背景。
export const cmSurfaceTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '13px',
    backgroundColor: 'transparent',
    color: 'var(--dshpc-fg, #1f2328)',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'var(--dshpc-font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)',
  },
  // basicSetup 默认开 drawSelection()，它会把 .cm-content 的 caret-color 置为 transparent：
  // CodeMirror 6 用自绘 .cm-cursor，不认原生 caret。真正决定光标色的是下面 cmSurfaceTint
  // 里的 borderLeftColor；这一条只在没开 drawSelection 时兜底。
  '.cm-content': {
    caretColor: 'var(--dshpc-fg, #1f2328)',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--dshpc-fg-3, rgba(128,128,128,0.8))',
    border: 'none',
  },
  '.cm-activeLine': {
    backgroundColor: 'transparent',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
  },
})

/**
 * 选区色：暗 #3E4451（官方 one-dark 原值，比深底更深的实色 ⇒ 浅字压上去仍清晰）、
 * 浅 #c8d3f0（one-light 同族浅底 ⇒ 深字压上去仍清晰）。一律**不透明**：半透明会让
 * 选区色随宿主面板深浅漂移，对比度不可控。
 */
const SELECTION_DARK = '#3E4451'
const SELECTION_LIGHT = '#c8d3f0'

function cmSurfaceTint(dark: boolean): ReturnType<typeof EditorView.theme> {
  return EditorView.theme({
    // 与官方 oneDarkTheme 的选区选择器一致（dist/index.js:41），本层后注入 ⇒ 覆盖。
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: dark ? SELECTION_DARK : SELECTION_LIGHT,
    },
    // 官方 oneDarkTheme 也给 .cm-cursor 上色，但亮色没有等价规则；本层统一吃 token，
    // 且后注入覆盖官方，明暗两套表现一致。
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: `var(--dshpc-fg, ${dark ? CURSOR_FALLBACK_DARK : CURSOR_FALLBACK_LIGHT})`,
    },
  })
}

/** 只返回表面层；语法高亮由官方主题负责，核心不再注册 highlighter。 */
export function codeMirrorTheme(dark: boolean): Extension[] {
  return [cmSurfaceTheme, cmSurfaceTint(dark)]
}
