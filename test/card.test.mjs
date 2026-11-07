import test from 'node:test'
import assert from 'node:assert/strict'
import { CARD_ACCENTS, Card, StripCard, Surface, surfaceClass } from '../dist/ui/index.js'
import { CARD_CSS } from '../dist/ui/display/card-css.js'
import { setLocale, t } from '../dist/utils/index.js'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

test('色条档位是 13 个，且都有对应文案/语义', () => {
  assert.deepEqual(
    [...CARD_ACCENTS],
    ['business', 'success', 'warning', 'danger', 'neutral',
      'purple', 'pink', 'cyan', 'teal', 'orange', 'indigo', 'rose', 'slate'],
  )
})

test('卡片折叠按钮的 aria 文案中英齐全', () => {
  setLocale('zh')
  assert.equal(t('cardToggle'), '展开/收起')
  setLocale('en')
  assert.equal(t('cardToggle'), 'Expand/Collapse')
  setLocale('zh')
})

// 2026-11-01：Card 的外框改由 Surface 提供，圆角与 Button 同档（12）。
test('Card 根节点复用 Surface 外框，默认色条贴左', () => {
  const html = renderToStaticMarkup(createElement(Card, null, '内容'))
  assert.match(html, /class="dshpc-surface dshpc-card dshpc-card--bordered dshpc-card--bar-left dshpc-card--business"/)
  assert.match(html, /class="dshpc-card__body"/)
})

test('Card 色条可放左 / 右 / 上 / 下，几何走 CSS 变量', () => {
  for (const side of ['left', 'right', 'top', 'bottom']) {
    const html = renderToStaticMarkup(createElement(Card, { bar: { side } }, '内容'))
    assert.ok(html.includes(`dshpc-card--bar-${side}`), `缺少 bar-${side} 类`)
    assert.ok(html.includes('<span class="dshpc-card__bar" aria-hidden="true"></span>'), '色条必须是 body 的第一个子元素')
  }
  const html = renderToStaticMarkup(
    createElement(Card, { bar: { side: 'top', size: 8, inset: 6, gap: 10, length: 120 } }, '内容'),
  )
  assert.match(html, /--card-bar-size:8px/)
  assert.match(html, /--card-bar-inset:6px/)
  assert.match(html, /--card-bar-gap:10px/)
  assert.match(html, /--card-bar-length:120px/)
})

test('StripCard 固定贴左、方角，且不把 side 传成别的方向', () => {
  const html = renderToStaticMarkup(
    createElement(StripCard, { bar: { side: 'right' } }, '内容'),
  )
  assert.match(html, /class="dshpc-surface dshpc-surface--border-none dshpc-surface--radius-none dshpc-card dshpc-card--strip dshpc-card--bar-left dshpc-card--business"/)
})

test('Surface 四根轴的档位都拼到类名上；不给内距时不算内距', () => {
  assert.equal(surfaceClass(), 'dshpc-surface dshpc-surface--pad-md')
  assert.equal(
    surfaceClass({ tone: 'sunken', border: 'faint', radius: 'sm', padding: 'lg' }),
    'dshpc-surface dshpc-surface--tone-sunken dshpc-surface--border-faint dshpc-surface--radius-sm dshpc-surface--pad-lg',
  )
  assert.equal(surfaceClass({ padding: null }), 'dshpc-surface')
  assert.equal(
    surfaceClass({ tone: 'sunken', border: 'dashed', padding: null }),
    'dshpc-surface dshpc-surface--tone-sunken dshpc-surface--border-dashed',
  )
  const html = renderToStaticMarkup(createElement(Surface, { tone: 'raised' }, '内容'))
  assert.match(html, /class="dshpc-surface dshpc-surface--tone-raised dshpc-surface--pad-md"/)
})

// 2026-11-07：整卡 hover / 底色开关（用户拍板：hover 是整卡变色、颜色统一 --dshpc-card-hover）。
test('默认不挂 hoverable / no-fill 类（零破坏）', () => {
  for (const Comp of [Card, StripCard]) {
    const html = renderToStaticMarkup(createElement(Comp, null, '内容'))
    assert.ok(!html.includes('dshpc-card--hoverable'), 'hover 默认关')
    assert.ok(!html.includes('dshpc-card--no-fill'), '底色默认有')
  }
})

test('hoverable / filled 是独立开关，可单独也可同时', () => {
  const on = renderToStaticMarkup(createElement(Card, { hoverable: true }, '内容'))
  assert.match(on, /dshpc-card--hoverable/)
  assert.ok(!on.includes('dshpc-card--no-fill'))
  const off = renderToStaticMarkup(createElement(StripCard, { filled: false }, '内容'))
  assert.match(off, /dshpc-card--no-fill/)
  assert.ok(!off.includes('dshpc-card--hoverable'))
  const both = renderToStaticMarkup(createElement(Card, { hoverable: true, filled: false }, '内容'))
  assert.match(both, /dshpc-card--hoverable/)
  assert.match(both, /dshpc-card--no-fill/)
})

// 2026-11-07：两块区域各自独立。head（默认）= 头部区容器整块边到边变色、展开区完全不参与；
// card = 整卡含展开区一起变色，由消费端显式选。绝不用「给展开区铺底色去盖根节点」。
test('Card CSS：根节点零内距 + 头部区独立容器承载 hover', () => {
  assert.match(CARD_CSS, /--surface-bg:var\(--card-accent-soft,transparent\)/, 'StripCard 底收敛成变量')
  assert.match(CARD_CSS, /\.dshpc-card\.dshpc-card--no-fill\{--surface-bg:transparent\}/)
  assert.match(CARD_CSS, /\.dshpc-card\.dshpc-card--hoverable\{cursor:pointer\}/, 'hover 开关打开时手势跟着变')
  assert.match(CARD_CSS, /dshpc-card--hover-head \.dshpc-card__panel\{cursor:auto\}/, '展开区手势还原')
  assert.match(
    CARD_CSS,
    /\.dshpc-card\.dshpc-card--hover-head \.dshpc-card__body:hover\{background:var\(--dshpc-card-hover\)\}/,
    'head 作用域：只有头部区容器铺色',
  )
  assert.match(CARD_CSS, /\.dshpc-card\.dshpc-card--hover-card:hover\{--surface-bg:var\(--dshpc-card-hover\)\}/, 'card 作用域：整卡含展开区一起变色')
  const css = CARD_CSS.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.match(css, /\.dshpc-card\{[^}]*padding:0/, '根节点不留内距，头部区才能边到边')
  assert.match(css, /\.dshpc-card__body\{[^}]*padding:var\(--card-pad-all/, '内距下沉到头部区容器')
  assert.match(css, /\.dshpc-card\{[^}]*overflow:hidden/, '根节点裁圆角，头部区不写裸圆角值')
  assert.ok(
    !/dshpc-card--expanded \.dshpc-card__body\{[^}]*padding/.test(css),
    '展开态不许覆盖头部区内距：上下两圈留白必须始终对称',
  )
  assert.match(
    css,
    /\.dshpc-card__panel\{[^}]*margin:0 var\(--card-pad-r\) 0 var\(--card-pad-l\)/,
    '分隔线紧贴头部区，两块之间的间隔归头部区、跟着一起变色',
  )
  assert.match(
    css,
    /\.dshpc-card\.dshpc-card--strip \.dshpc-card__bar\{position:absolute;left:0;top:0;bottom:0/,
    'StripCard 色条通高整卡，展开后仍贯穿展开区',
  )
  assert.ok(!css.includes('--card-base-bg'), '不许再靠「常态底色快照」遮盖展开区')
  assert.ok(!css.includes(':has('), '分区靠 DOM 结构，不靠 :has 猜指针位置')
  assert.ok(!/\.dshpc-card__panel\{[^}]*background:/.test(css), '展开区不许铺任何背景')
  assert.ok(!css.includes('background:var(--card-accent-soft'), '不许再写 background 属性覆盖根节点底色')
  assert.ok(!css.includes('background-image:'), '不许渐变叠加绕契约')
  assert.ok(!css.includes('--dshpc-plate-hover'), 'hover 不混用别的底色 token')
  assert.ok(
    css.indexOf('dshpc-card--hover-card:hover') > css.indexOf('dshpc-card--no-fill'),
    'hover 规则要压过透明档',
  )
})

test('hoverScope 默认 head，显式 card；hoverable 关掉时作用域类不挂', () => {
  const head = renderToStaticMarkup(createElement(Card, { hoverable: true }, '内容'))
  assert.match(head, /dshpc-card--hover-head/)
  assert.ok(!head.includes('dshpc-card--hover-card'))
  const card = renderToStaticMarkup(createElement(StripCard, { hoverable: true, hoverScope: 'card' }, '内容'))
  assert.match(card, /dshpc-card--hover-card/)
  assert.ok(!card.includes('dshpc-card--hover-head'))
  const off = renderToStaticMarkup(createElement(Card, { hoverScope: 'card' }, '内容'))
  assert.ok(!off.includes('dshpc-card--hover-'), '没开 hoverable 时作用域类也不能挂')
})

test('展开态挂 --expanded 类，消费端 style.padding 下沉到头部区', () => {
  const expanded = renderToStaticMarkup(
    createElement(Card, { expanded: true, panel: '展开内容' }, '头部'),
  )
  assert.match(expanded, /dshpc-card--expanded/)
  const padded = renderToStaticMarkup(
    createElement(Card, { style: { padding: '8px 12px' } }, '内容'),
  )
  assert.match(padded, /--card-pad-all:8px 12px/, '内联内距转成头部区变量')
  assert.ok(!/style="[^"]*padding:/.test(padded), '根节点不许再出现内联 padding')
})

test('展开区 panel 是头部区 __body 的兄弟节点（核心的分区信号）', () => {
  const html = renderToStaticMarkup(
    createElement(Card, { expanded: true, panel: '展开内容' }, '头部内容'),
  )
  assert.match(html, /class="dshpc-card__body"/)
  assert.match(html, /class="dshpc-card__panel"/)
  assert.match(html, /<\/div><div class="dshpc-card__panel"/, 'panel 必须在 __body 之外')
  assert.ok(html.indexOf('头部内容') < html.indexOf('展开内容'))
  const collapsed = renderToStaticMarkup(
    createElement(Card, { expanded: false, panel: '展开内容' }, '头部内容'),
  )
  assert.ok(!collapsed.includes('dshpc-card__panel'), '收起时不渲染 panel')
})
