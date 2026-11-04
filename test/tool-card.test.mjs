// 工具卡专属卡模型的纯函数自检：grep/glob → SearchBlock、web_* → WebBlock。
// mirror 组件经 official.js 静态 import 官方包 ⇒ Node 里要先挂替身解析钩子再动态导入。
import test from 'node:test'
import assert from 'node:assert/strict'
import { register } from 'node:module'

register(new URL('./primitives-hooks.mjs', import.meta.url))
const { searchCardModel, webCardModel, toolTitleKey, readCallLine } = await import('../dist/session/mirror/GenericCommandCard.js')

test('readCallLine：read 的 offset 即落点行，参数非法不给行', () => {
  assert.equal(readCallLine('read', JSON.stringify({ file_path: 'a.ts', offset: 12 })), 12)
  assert.equal(readCallLine('read', JSON.stringify({ file_path: 'a.ts' })), undefined)
  assert.equal(readCallLine('read', JSON.stringify({ file_path: 'a.ts', offset: 0 })), undefined)
  assert.equal(readCallLine('write', JSON.stringify({ file_path: 'a.ts', offset: 3 })), undefined)
})

test('toolTitleKey：专属标题优先，未知工具落 generic', () => {
  assert.equal(toolTitleKey('grep'), 'toolTitleGrep')
  assert.equal(toolTitleKey('terminal_close'), 'toolTitleCloseTerminal')
  assert.equal(toolTitleKey('no_such_tool'), 'toolTitleGeneric')
})

test('searchCardModel：grep 分组匹配 + 截断时把完整结果摊成 recovery', () => {
  const meta = { shape: 'matches', files: [{ path: 'a.ts', matches: [{ lineNumber: 7, line: 'x' }] }], total: 9, truncated: true }
  const face = searchCardModel('grep', JSON.stringify({ pattern: 'x', path: 'src' }), '完整结果', meta, false, true)
  assert.equal(face.card.kind, 'matches')
  assert.deepEqual(face.card.files, [{ path: 'a.ts', matches: [{ lineNumber: 7, line: 'x' }] }])
  assert.equal(face.card.total, 9)
  assert.equal(face.recovery, '完整结果')
})

test('searchCardModel：glob 扁平路径；无 meta / 出错 / 空 pattern 落回 ioCard', () => {
  const meta = { shape: 'paths', paths: ['a.ts'], total: 1, truncated: false }
  assert.equal(searchCardModel('glob', JSON.stringify({ pattern: '*.ts' }), '', meta, false, true).card.kind, 'paths')
  assert.equal(searchCardModel('grep', JSON.stringify({ pattern: 'x' }), '', undefined, false, true), null)
  assert.equal(searchCardModel('grep', JSON.stringify({ pattern: 'x' }), '', meta, true, true), null)
  assert.equal(searchCardModel('grep', JSON.stringify({ pattern: '' }), '', meta, false, true), null)
})

test('webCardModel：web_search 答案+来源 / web_fetch 状态码，缺字段落回 ioCard', () => {
  const search = webCardModel('web_search', JSON.stringify({ queries: ['q'] }), { answer: 'A', sources: [{ url: 'https://a' }], truncated: false }, false, true)
  assert.deepEqual(search, { kind: 'search', answer: 'A', sources: [{ url: 'https://a' }], truncated: false })
  const fetch = webCardModel('web_fetch', JSON.stringify({ url: 'https://a' }), { url: 'https://a', statusCode: 200, truncated: true }, false, true)
  assert.deepEqual(fetch, { kind: 'fetch', url: 'https://a', statusCode: 200, truncated: true })
  assert.equal(webCardModel('web_fetch', JSON.stringify({ url: 'https://a' }), { url: 'https://a' }, false, true), null)
})
