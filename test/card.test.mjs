import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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
    '展开区紧跟头部区，两块之间的间隔归头部区、跟着一起变色',
  )
  assert.match(
    css,
    /\.dshpc-card__panel\{[^}]*padding:0 0 var\(--card-pad-b\)/,
    '展开区顶部内距归零：自绘线贴住头部区下沿，中间不夹不变色的带子',
  )
  assert.ok(
    !css.includes('padding:8px 0 var(--card-pad-b)'),
    '不许再给展开区垫 8px 顶部内距',
  )
  assert.match(
    css,
    /--card-pad-all:var\(--card-pad-t\) var\(--card-pad-r\) var\(--card-pad-b\) var\(--card-pad-l\)/,
    '组合值只由四根轴派生，JS 不直接覆盖 ⇒ 头部区与展开区同源',
  )
  assert.ok(
    !/\.dshpc-card__panel\{[^}]*border/.test(css),
    '核心不许画展开区分隔线：有时要有时不要，线归消费端自绘',
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

test('展开态挂 --expanded 类，消费端 style.padding 摊成四根轴（头部区与展开区同源）', () => {
  const expanded = renderToStaticMarkup(
    createElement(Card, { expanded: true, panel: '展开内容' }, '头部'),
  )
  assert.match(expanded, /dshpc-card--expanded/)

  // 2 值简写：上下 8px、左右 12px；四根轴一起覆盖，__panel 的左右 margin 才不会一边跟一边不跟。
  const padded = renderToStaticMarkup(
    createElement(Card, { style: { padding: '8px 12px' } }, '内容'),
  )
  assert.match(padded, /--card-pad-t:8px/, '上轴')
  assert.match(padded, /--card-pad-r:12px/, '右轴')
  assert.match(padded, /--card-pad-b:8px/, '下轴')
  assert.match(padded, /--card-pad-l:12px/, '左轴')
  assert.ok(!padded.includes('--card-pad-all:'), '组合值只由 CSS 派生，不由 JS 直接写')
  assert.ok(!/style="[^"]*padding:/.test(padded), '根节点不许再出现内联 padding')

  // 1 值数字 0：消费端 bar.inset:0 的用法，四轴必须全 0（左边不再被方位类单独归零）。
  const zero = renderToStaticMarkup(createElement(Card, { style: { padding: 0 } }, '内容'))
  for (const axis of ['t', 'r', 'b', 'l']) {
    assert.match(zero, new RegExp(`--card-pad-${axis}:0px`), `padding:0 覆盖 ${axis} 轴`)
  }

  // 4 值按 CSS 规则逐边展开；含 calc() 的空格不当分隔符。
  const four = renderToStaticMarkup(
    createElement(Card, { style: { padding: '1px 2px 3px 4px' } }, '内容'),
  )
  assert.match(four, /--card-pad-t:1px/)
  assert.match(four, /--card-pad-r:2px/)
  assert.match(four, /--card-pad-b:3px/)
  assert.match(four, /--card-pad-l:4px/)
  const calc = renderToStaticMarkup(
    createElement(Card, { style: { padding: 'calc(10px - 2px) 4px' } }, '内容'),
  )
  assert.match(calc, /--card-pad-t:calc\(10px - 2px\)/)
  assert.match(calc, /--card-pad-l:4px/)
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

// 2026-11-09：hoverable / hoverScope 只补了视觉与手势，点击契约要同源补到「变色那一层」。
// __panel 是 __body 的兄弟节点，所以 head 只绑 __body、card 才上提根节点。
test('不传 onClick 时 DOM 与纯展示卡完全一致（零回归）', () => {
  for (const Comp of [Card, StripCard]) {
    const html = renderToStaticMarkup(
      createElement(Comp, { expanded: true, panel: '展开内容', action: '跳过', onToggle: () => {} }, '头部'),
    )
    assert.ok(!html.includes('role="button"'))
    assert.ok(!html.includes('tabindex'))
    assert.ok(!html.includes('dshpc-card__hit'))
    assert.ok(!html.includes('dshpc-card--hoverable'))
    assert.match(html, /class="dshpc-card__body"/, '__body 类名不许多出修饰')
    assert.match(html, /class="dshpc-card__side"/, '右侧槽不许多出属性')
  }
})

test('onClick 默认 head：点击层就是 __body（内距圈同层），panel 完全不挂事件', () => {
  for (const Comp of [Card, StripCard]) {
    const html = renderToStaticMarkup(
      createElement(Comp, { onClick: () => {}, expanded: true, panel: '展开内容' }, '头部'),
    )
    const hit = html.match(/<[^>]*role="button"[^>]*>/)
    assert.ok(hit, '必须有 role=button 的点击层')
    assert.match(hit[0], /class="dshpc-card__body dshpc-card__hit"/)
    assert.match(hit[0], /tabindex="0"/)
    const root = html.match(/^<div[^>]*>/)[0]
    assert.ok(!root.includes('role="button"'), 'head 不许绑根节点')
    assert.match(html, /dshpc-card--hoverable/, 'hover 默认跟随可点性')
    assert.match(html, /dshpc-card--hover-head/)
    const panel = html.match(/<div class="dshpc-card__panel"[^>]*>/)
    assert.ok(panel)
    assert.ok(!panel[0].includes('role=') && !panel[0].includes('tabindex'), 'panel 不挂任何交互属性')
    assert.match(html, /<\/div><div class="dshpc-card__panel"/, 'panel 在 __body 之外，冒泡到不了点击层')
  }
})

test("hoverScope:'card'：点击层上提根节点，整卡含 panel 都在命中范围", () => {
  const html = renderToStaticMarkup(
    createElement(Card, { onClick: () => {}, hoverScope: 'card', expanded: true, panel: '展开内容' }, '头部'),
  )
  const root = html.match(/^<div[^>]*>/)[0]
  assert.match(root, /role="button"/)
  assert.match(root, /tabindex="0"/)
  assert.match(root, /dshpc-card__hit/)
  const body = html.match(/<div class="dshpc-card__body"[^>]*>/)
  assert.ok(body, '__body 不许重复挂点击层，否则一次点击会触发两遍')
  assert.ok(!body[0].includes('role='))
  assert.match(html, /dshpc-card--hover-card/)
})

test('hoverable 可显式关；关掉时不挂作用域类，点击层仍按 hoverScope 选', () => {
  const html = renderToStaticMarkup(createElement(Card, { onClick: () => {}, hoverable: false }, '内容'))
  assert.ok(!html.includes('dshpc-card--hoverable'))
  assert.ok(!html.includes('dshpc-card--hover-'))
  assert.match(html, /role="button"/)
})

test('点击层复用 ListRow 键盘契约；action / 折叠箭头同槽挡冒泡', () => {
  const src = readFileSync(new URL('../dist/ui/display/Card.js', import.meta.url), 'utf8')
  assert.match(src, /target !== event.currentTarget/, '键盘只认点击层自己为事件源')
  assert.match(src, /key !==/, '要判 Enter / Space')
  assert.match(src, /preventDefault/, 'Space 别滚页面')
  assert.match(src, /stopPropagation/, '右侧槽挡住 action 与折叠箭头的冒泡')
  const html = renderToStaticMarkup(
    createElement(Card, { onClick: () => {}, action: '跳过', onToggle: () => {} }, '内容'),
  )
  assert.match(html, /class="dshpc-card__side"/)
  assert.equal((html.match(/role="button"/g) ?? []).length, 1, '整卡只有一个点击层')
})

test('Card CSS：点击层有键盘焦点环，且内缩避免被根节点 overflow 裁掉', () => {
  assert.match(
    CARD_CSS,
    /\.dshpc-card__hit:focus-visible\{outline:2px solid var\(--dshpc-focus\);outline-offset:-2px\}/,
  )
})

// 静态标记只能证明「属性挂上了」，证明不了「点哪里会触发」。直接调函数组件拿 element tree，
// 逐层看 onClick / onKeyDown 落在哪一层（React 函数组件就是函数，无需 DOM）。
test('点击契约行为自检：head 只 __body 触发、card 上提根节点，键盘与右侧槽同契约', () => {
  const calls = []
  const fireKey = (el, key, self = true) => {
    let prevented = 0
    el.props.onKeyDown({
      key, target: self ? el : {}, currentTarget: el,
      preventDefault: () => { prevented++ },
    })
    return prevented
  }

  const head = Card(
    { onClick: () => calls.push('head'), expanded: true, panel: '展开内容', action: '跳过', onToggle: () => {} },
    '头部',
  )
  const [body, panel] = head.props.children
  assert.equal(head.props.onClick, undefined, 'head 时根节点不挂回调 ⇒ 点 panel 冒泡不到任何点击层')
  assert.equal(typeof body.props.onClick, 'function', '内距圈所在的 __body 才是点击层')
  assert.equal(panel.props.onClick, undefined, 'panel 自己不挂回调')
  body.props.onClick()
  assert.equal(fireKey(body, 'Enter'), 1)
  assert.equal(fireKey(body, ' '), 1)
  assert.equal(fireKey(body, 'a'), 0, '别的键不触发')
  assert.equal(fireKey(body, 'Enter', false), 0, '子元素的按键不连带触发')
  const side = body.props.children[1].props.children[1]
  let stopped = false
  side.props.onClick({ stopPropagation: () => { stopped = true } })
  assert.ok(stopped, 'action / 折叠箭头同槽挡冒泡')
  assert.deepEqual(calls, ['head', 'head', 'head'])

  const card = Card({ onClick: () => calls.push('card'), hoverScope: 'card', expanded: true, panel: '展开内容' }, '头部')
  assert.equal(typeof card.props.onClick, 'function', 'card 时根节点挂回调，panel 冒泡得到')
  assert.equal(card.props.children[0].props.onClick, undefined, '__body 不重复挂，否则一次点击触发两遍')
  card.props.onClick()
  assert.deepEqual(calls, ['head', 'head', 'head', 'card'])

  const visualOnly = Card({ hoverable: true, hoverScope: 'card', expanded: true, panel: '展开内容' }, '头部')
  assert.equal(visualOnly.props.onClick, undefined, '纯视觉 hover 不产生点击层')
  assert.equal(visualOnly.props.children[0].props.onClick, undefined)
})
