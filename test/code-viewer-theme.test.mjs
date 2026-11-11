// 主题自检：核心只提供表面层，语法高亮与明暗主题一律交给官方实现。
// 断言的是 EditorState 里实际生效的 StyleModule 顺序与 highlighter 输出，不是产物字符串。
import test from 'node:test'
import assert from 'node:assert/strict'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { HighlightStyle, highlightingFor } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { getDefaultExtensions } from '@uiw/react-codemirror'
import { codeMirrorTheme } from '../dist/ui/display/code-viewer-theme.js'
import { languageForPath } from '../dist/ui/display/code-viewer-lang.js'

const BASIC_SETUP = {
  lineNumbers: true,
  foldGutter: false,
  highlightActiveLine: true,
  highlightActiveLineGutter: true,
  autocompletion: true,
  bracketMatching: true,
  closeBrackets: true,
  indentOnInput: true,
  searchKeymap: true,
}

/** 复现 CodeMirrorSurface 的拼装：官方默认扩展在前，核心表面层在后。 */
function setup(dark) {
  const official = getDefaultExtensions({ theme: dark ? 'dark' : 'light', basicSetup: BASIC_SETUP })
  const surface = codeMirrorTheme(dark)
  const state = EditorState.create({
    doc: '- **关键词**：内容\n# 标题\n<!-- 注释 -->',
    extensions: [...official, ...surface, EditorView.lineWrapping, languageForPath('rules.md')],
  })
  return { official, surface, state }
}

/** 遍历扩展对象图，收集 StyleModule 的 CSS 文本（seen 防 CodeMirror 内部循环引用）。 */
function cssOf(ext, seen = new Set()) {
  if (!ext || typeof ext !== 'object' || seen.has(ext)) return ''
  seen.add(ext)
  let own = typeof ext.getRules === 'function' ? `${ext.getRules()}\n` : ''
  for (const v of Object.values(ext)) own += cssOf(v, seen)
  return own
}

function highlightStyleOf(ext, seen = new Set()) {
  if (!ext || typeof ext !== 'object' || seen.has(ext)) return null
  seen.add(ext)
  if (ext instanceof HighlightStyle) return ext
  for (const v of Object.values(ext)) {
    const found = highlightStyleOf(v, seen)
    if (found !== null) return found
  }
  return null
}

/** HighlightStyle 生成的单类规则：class 名 → 声明体。 */
function declarationsByClass(css) {
  const out = new Map()
  for (const line of css.split('\n')) {
    const m = line.match(/^\.([^\s{,]+)\s*\{([^}]*)\}/)
    if (m !== null) out.set(m[1], m[2])
  }
  return out
}

const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)
}

test('核心不再注册自己的 highlighter（明暗两套都不顶掉官方兜底）', () => {
  for (const dark of [false, true]) {
    assert.equal(highlightStyleOf(codeMirrorTheme(dark)), null, '核心表面层不应再含 HighlightStyle')
  }
})

test('明暗两套的官方主题与 highlighter 都生效', () => {
  for (const dark of [false, true]) {
    const { state } = setup(dark)
    assert.equal(state.facet(EditorView.darkTheme), dark, '官方主题的 dark facet 应与明暗判据一致')
    const cases = {
      heading: tags.heading,
      标记: tags.processingInstruction,
      强调: tags.strong,
      注释: tags.comment,
    }
    for (const [name, tag] of Object.entries(cases)) {
      assert.ok(highlightingFor(state, [tag]), `${dark ? '暗' : '亮'}色下 ${name} 应拿到官方高亮 class`)
    }
  }
})

test('官方高亮规则真的带颜色，暗色挂的是官方 oneDark', () => {
  const { state } = setup(true)
  const css = state.facet(EditorView.styleModule).map((m) => m.getRules()).join('\n')
  const decls = declarationsByClass(css)
  const cls = highlightingFor(state, [tags.processingInstruction])
  assert.match(decls.get(cls) ?? '', /color:\s*#/, 'markdown 标记应拿到带颜色的官方规则')
  assert.match(css, /#282c34/, '暗色应挂官方 oneDark 主题')
})

test('核心表面层排在官方主题之后，透明底能盖过官方面板背景', () => {
  const { state } = setup(true)
  const rules = state.facet(EditorView.styleModule).map((m) => m.getRules())
  const official = rules.findIndex((r) => r.includes('#282c34'))
  const core = rules.findIndex((r) => r.includes('--dshpc-fg') && r.includes('background-color: transparent'))
  assert.ok(official >= 0 && core > official, `核心表面层必须在官方之后，实际 official=${official} core=${core}`)
})

for (const dark of [false, true]) {
  const label = dark ? '暗色' : '亮色'

  test(`${label}表面层给自绘光标设了颜色，且深色兜底不是黑条`, () => {
    const css = cssOf(codeMirrorTheme(dark))
    const cursor = css.split('\n').filter((line) => /\.cm-cursor/.test(line) && /border-left-color/.test(line))
    assert.equal(cursor.length, 1, `光标规则应恰好一条，实际：\n${cursor.join('\n')}`)
    const fallback = cursor[0].match(/var\(--dshpc-fg,\s*(#[0-9a-fA-F]{6})\)/)
    assert.ok(fallback, `光标色必须优先吃 token 并带兜底：${cursor[0]}`)
    // 官方 baseTheme 是单类 .cm-cursor；主题规则带后代选择器才能盖过它。
    assert.match(cursor[0], /^\.[\wͼ]+\s+\.cm-cursor,/, '光标规则必须挂在主题作用域下')
    if (dark) assert.ok(luminance(fallback[1]) > 120, `深色兜底应是浅色，实际 ${fallback[1]}`)
    else assert.ok(luminance(fallback[1]) < 100, `亮色兜底应是深色，实际 ${fallback[1]}`)
  })
}

test('明暗两套表面层的光标兜底色确实不同', () => {
  const fallbackOf = (dark) => {
    const line = cssOf(codeMirrorTheme(dark)).split('\n').find((l) => /\.cm-cursor/.test(l))
    return line.match(/var\(--dshpc-fg,\s*(#[0-9a-fA-F]{6})\)/)[1]
  }
  assert.notEqual(fallbackOf(true), fallbackOf(false))
})
