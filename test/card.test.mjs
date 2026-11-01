import test from 'node:test'
import assert from 'node:assert/strict'
import { CARD_ACCENTS, Card, StripCard, Surface, surfaceClass } from '../dist/ui/index.js'
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
