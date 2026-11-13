import test from 'node:test'
import assert from 'node:assert/strict'
import { ICON_FONTS, Icon, parseFontCss } from '../dist/ui/display/Icon.js'

// iconfont 在线 CSS 的最小对照样本（结构与平台产物一致）。
const CSS = `@font-face {
  font-family: "dshpc-icons-base";
  src: url('https://at.alicdn.com/t/c/font_1_x.woff2') format('woff2');
}

.dshpc-icons-base {
  font-family: "dshpc-icons-base" !important;
  font-size: 16px;
  font-style: normal;
}

.dshpc-i-gou:before { content: "\\e626"; }
.dshpc-i-sort-up:before { content: "\\e627"; }
.dshpc-i-xihuan-a:before { content: "\\e628"; }
`

test('在线 CSS 解析出家族 / 基础类 / 前缀 / 图标名', () => {
  const parsed = parseFontCss(CSS)
  assert.equal(parsed.family, 'dshpc-icons-base')
  assert.equal(parsed.baseClass, 'dshpc-icons-base')
  assert.equal(parsed.prefix, 'dshpc-i-')
  assert.deepEqual(parsed.names, ['gou', 'sort-up', 'xihuan-a'])
})

test('结构不认识时抛错，不静默返回空清单', () => {
  assert.throws(() => parseFontCss('.foo { color: red }'), /结构不认识/)
})

test('注册表每套库的字段齐全、地址是绝对 https', () => {
  for (const [id, face] of Object.entries(ICON_FONTS)) {
    assert.match(face.url, /^https:\/\//, `${id} 的 url 必须是绝对 https`)
    assert.ok(face.family !== '', `${id} 缺 family`)
    assert.ok(face.baseClass !== '', `${id} 缺 baseClass`)
    assert.match(face.prefix, /-$/, `${id} 的 prefix 应以 - 结尾`)
  }
})

test('Icon 拼出「基础类 + 前缀 + 名字」，尺寸默认 1em', () => {
  const el = Icon({ name: 'gou' })
  assert.equal(el.props.className, 'dshpc-icons-base dshpc-i-gou')
  assert.equal(el.props.style.fontSize, '1em')

  const sized = Icon({ name: 'shanchu', size: 18, title: '删除' })
  assert.equal(sized.props.className, 'dshpc-icons-base dshpc-i-shanchu')
  assert.equal(sized.props.style.fontSize, 18)
  assert.equal(sized.props['aria-label'], '删除')
})
