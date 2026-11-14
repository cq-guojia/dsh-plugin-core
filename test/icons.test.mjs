import test from 'node:test'
import assert from 'node:assert/strict'
import { register } from 'node:module'

// Icon 会从 official.js 取官方图标 ⇒ 宿主平台包要用本地替身，否则 node 里链接不上。
register(new URL('./primitives-hooks.mjs', import.meta.url))
const { ICON_BASE_CLASS, ICON_FONTS, ICON_SIZES, Icon, parseFontCss } = await import('../dist/ui/display/Icon.js')
const { darkGlyphName } = await import('../dist/ui/display/icon-runtime.js')

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

test('字体图标：组名不可省，拼「自有基础类 + 平台基础类 + 前缀 + 名字」', () => {
  const el = Icon({ name: 'common.base:gou' })
  assert.equal(el.props.className, `${ICON_BASE_CLASS} koc-i-common-base koc-i-common-base-gou`)
})

test('每套单色库都带自有基础类（尺寸契约不依赖平台类名）', () => {
  for (const [id, face] of Object.entries(ICON_FONTS)) {
    if (face.color === true) continue
    const el = Icon({ name: `${id}:gou` })
    assert.ok(el !== null, `${id} 应能渲染`)
    assert.ok(el.props.className.startsWith(`${ICON_BASE_CLASS} `), `${id} 缺自有基础类`)
    assert.ok(el.props.className.includes(face.baseClass), `${id} 丢了平台基础类`)
  }
})

test('不传 size 就不写 fontSize：尺寸交给 icon.css 的 CSS 契约', () => {
  const el = Icon({ name: 'common.base:gou' })
  assert.ok(!('fontSize' in el.props.style), '字体图标不许写死 16px，尺寸交给 icon.css')
  assert.equal(el.props.style.lineHeight, 1)
})

test('尺寸：预设名与自定义 px 都认', () => {
  assert.equal(Icon({ name: 'common.base:gou', size: 'lg' }).props.style.fontSize, ICON_SIZES.lg)
  assert.equal(Icon({ name: 'common.base:gou', size: 31 }).props.style.fontSize, 31)
})

test('多色库标了 color、单色库没标', () => {
  assert.equal(ICON_FONTS['common.base.color'].color, true)
  assert.equal(ICON_FONTS['common.logo.color'].color, true)
  assert.equal(ICON_FONTS['common.base'].color, undefined)
  assert.equal(ICON_FONTS['common.logo'].color, undefined)
  assert.equal(ICON_FONTS['dsh-plugin-core.base'].color, undefined)
})

test('多色库：深色下拿不到名字清单时仍用原字形', () => {
  const el = Icon({ name: 'common.base.color:jia' })
  assert.equal(typeof el.type, 'function', '多色库走 ColorGlyph 组件')
  assert.equal(el.props.glyph, 'jia')
  assert.equal(el.props.font.color, true)
  assert.equal(el.props.size, undefined, '多色库不传 size 时同样继承文字字号')
})

test('深色换字形：有 -dark 就用它，没有就原名字', () => {
  const names = new Set(['jia', 'jia-dark', 'jian'])
  assert.equal(darkGlyphName('jia', names), 'jia-dark')
  assert.equal(darkGlyphName('jian', names), 'jian')
  assert.equal(darkGlyphName('jia', null), 'jia')
})

test('没有组名的名字不当字体图标（只有官方那条路）', () => {
  // 'gou' 既没有冒号、也不是官方图标名 ⇒ 不渲染，也不回落任何库
  assert.equal(quiet(() => Icon({ name: 'gou' })), null)
})

test('未知库不渲染（不回落 common.base）', () => {
  assert.equal(quiet(() => Icon({ name: 'social:gou' })), null)
})

test('官方图标：无冒号按名取组件，不传 size 就不给官方组件传尺寸', () => {
  const el = Icon({ name: 'IconCheckOutlineRegular' })
  assert.equal(typeof el.type, 'function')
  assert.equal(el.props.size, undefined, '让控件的 svg{width:1em} 接管')
})

test('官方图标显式传 size 才给绝对 px', () => {
  assert.equal(Icon({ name: 'IconCheckOutlineRegular', size: 'lg' }).props.size, ICON_SIZES.lg)
})

test('官方命名空间里非图标的东西不许从字符串拉进来', () => {
  assert.equal(quiet(() => Icon({ name: 'Button' })), null)
})
