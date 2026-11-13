import test from 'node:test'
import assert from 'node:assert/strict'
import { register } from 'node:module'

// Icon 会从 official.js 取官方图标 ⇒ 宿主平台包要用本地替身，否则 node 里链接不上。
register(new URL('./primitives-hooks.mjs', import.meta.url))
const { ICON_FONTS, ICON_SIZES, Icon, parseFontCss } = await import('../dist/ui/display/Icon.js')

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

/** 关掉告警输出，只看返回值。 */
function quiet(fn) {
  const warn = console.warn
  console.warn = () => {}
  try {
    return fn()
  } finally {
    console.warn = warn
  }
}

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

test('字体图标：组名不可省，拼「基础类 + 前缀 + 名字」', () => {
  const el = Icon({ name: 'base:gou' })
  assert.equal(el.props.className, 'dshpc-icons-base dshpc-i-gou')
  assert.equal(el.props.style.fontSize, ICON_SIZES.md)
})

test('尺寸：预设名与自定义 px 都认', () => {
  assert.equal(Icon({ name: 'base:gou', size: 'lg' }).props.style.fontSize, ICON_SIZES.lg)
  assert.equal(Icon({ name: 'base:gou', size: 31 }).props.style.fontSize, 31)
})

test('没有组名的名字不当字体图标（只有官方那条路）', () => {
  // 'gou' 既没有冒号、也不是官方图标名 ⇒ 不渲染，也不回落 base
  assert.equal(quiet(() => Icon({ name: 'gou' })), null)
})

test('未知库不渲染（不回落 base）', () => {
  assert.equal(quiet(() => Icon({ name: 'social:gou' })), null)
})

test('官方图标：无冒号按名取组件，尺寸走 size', () => {
  const el = Icon({ name: 'IconCheckOutlineRegular' })
  assert.equal(typeof el.type, 'function')
  assert.equal(el.props.size, ICON_SIZES.md)
})

test('官方命名空间里非图标的东西不许从字符串拉进来', () => {
  assert.equal(quiet(() => Icon({ name: 'Button' })), null)
})
