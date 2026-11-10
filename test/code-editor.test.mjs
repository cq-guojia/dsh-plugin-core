// 渲染级自检：`ui/code-viewer` 子路径同时给只读与可编辑两个控件，
// 断言的是组件真正传给 CodeMirror 的开关与回传结果（不是源码文本匹配）。
import test from 'node:test'
import assert from 'node:assert/strict'
import { register } from 'node:module'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

register(new URL('./code-mirror-hooks.mjs', import.meta.url))
const { CodeViewer, CodeEditor } = await import('../dist/ui/display/code-viewer.js')

const lastProps = () => globalThis.__CM_LAST_PROPS__

test('子路径同时导出只读查看器与可编辑控件', () => {
  assert.equal(typeof CodeViewer, 'function')
  assert.equal(typeof CodeEditor, 'function')
})

test('CodeViewer 仍然只读：readOnly=true、无 onChange、编辑辅助保持关闭', () => {
  const html = renderToStaticMarkup(h(CodeViewer, { text: 'const a = 1', path: 'a.ts', t: (k) => k }))
  const props = lastProps()
  assert.equal(props.readOnly, true)
  assert.equal(props.onChange, undefined)
  assert.equal(props.value, 'const a = 1')
  assert.equal(props.basicSetup.autocompletion, false)
  assert.equal(props.basicSetup.closeBrackets, false)
  assert.match(html, /dshpc-cv__copy/, '只读查看器仍带复制按钮')
})

test('CodeEditor 真的可编辑：readOnly=false 且编辑辅助全部打开', () => {
  renderToStaticMarkup(h(CodeEditor, { value: '# 标题', onChange() {}, path: 'note.md' }))
  const props = lastProps()
  assert.equal(props.readOnly, false)
  assert.equal(props.value, '# 标题')
  assert.equal(props.basicSetup.autocompletion, true)
  assert.equal(props.basicSetup.closeBrackets, true)
  assert.equal(props.basicSetup.indentOnInput, true)
  assert.equal(props.basicSetup.searchKeymap, true)
  assert.equal(props.basicSetup.highlightActiveLine, true)
})

test('CodeEditor 的 onChange 把编辑后的全文交回调用方', () => {
  const seen = []
  renderToStaticMarkup(h(CodeEditor, { value: 'old', onChange: (v) => seen.push(v) }))
  lastProps().onChange('new text')
  assert.deepEqual(seen, ['new text'])
})

test('CodeEditor 不传 path / t 也能用，且不带只读查看器的复制按钮', () => {
  const html = renderToStaticMarkup(h(CodeEditor, { value: 'plain', onChange() {} }))
  assert.match(html, /data-cm-probe="1"/)
  assert.ok(!html.includes('dshpc-cv__copy'), '编辑态不该出现复制按钮')
  assert.ok(Array.isArray(lastProps().extensions), '无 path 也要有主题扩展')
})

test('两个控件共用同一个样式域与编辑器外观', () => {
  renderToStaticMarkup(h(CodeEditor, { value: 'a', onChange() {} }))
  assert.equal(lastProps().className, 'dshpc-cv__editor dshpc-scroll-thin')
  renderToStaticMarkup(h(CodeViewer, { text: 'b', path: 'b.ts', t: (k) => k }))
  assert.equal(lastProps().className, 'dshpc-cv__editor dshpc-scroll-thin')
})
