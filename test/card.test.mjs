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

test('Card CSS：底色走 --surface-bg 变量，整卡 hover 统一 --dshpc-card-hover', () => {
  assert.match(CARD_CSS, /--surface-bg:var\(--card-accent-soft,transparent\)/, 'StripCard 底收敛成变量')
  assert.match(CARD_CSS, /\.dshpc-card\.dshpc-card--no-fill\{--surface-bg:transparent\}/)
  assert.match(CARD_CSS, /\.dshpc-card\.dshpc-card--hoverable\{cursor:pointer\}/, 'hover 开关打开时手势跟着变')
  assert.match(CARD_CSS, /\.dshpc-card\.dshpc-card--hoverable:hover\{--surface-bg:var\(--dshpc-card-hover\)\}/)
  const css = CARD_CSS.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.ok(!css.includes('background:var(--card-accent-soft'), '不许再写 background 属性')
  assert.ok(!css.includes('background-image:'), '不许渐变叠加绕契约')
  assert.ok(!css.includes('--dshpc-plate-hover'), 'hover 不混用别的底色 token')
  assert.ok(
    css.indexOf('dshpc-card--hoverable:hover') > css.indexOf('dshpc-card--no-fill'),
    'hover 规则要压过透明档',
  )
})
