import test from 'node:test'
import assert from 'node:assert/strict'
import { ensureControls, getStyleKit, setStyleKit } from '../dist/ui/css.js'
import { createStyleKit } from '../dist/design/index.js'
import { SEGMENTED_CSS } from '../dist/ui/controls/segmented-css.generated.js'
import { FIELD_CSS } from '../dist/ui/controls/field-css.generated.js'
import { Button, Chip, Input, Segmented, SplitGroup } from '../dist/ui/index.js'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

test('setStyleKit 生效，getStyleKit 拿得到', () => {
  const kit = createStyleKit({ id: 'probe-ui' })
  setStyleKit(kit)
  assert.equal(getStyleKit().id, 'probe-ui')
})

test('ensureControls 在无 DOM 环境不抛，并登记 tokens + controls 两个域', () => {
  const kit = createStyleKit({ id: 'probe-ui' })
  assert.doesNotThrow(() => ensureControls(kit))
  assert.ok(kit.tokensCss.includes('--dshpc-fg'))
})

test('setStyleKit 覆盖默认 kit，getStyleKit 反映新值', () => {
  setStyleKit(createStyleKit({ id: 'probe' }))
  assert.equal(getStyleKit().id, 'probe')
})

test('Segmented 单选挂滑动块模式，多选保持逐段着色', () => {
  const items = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
  const single = renderToStaticMarkup(createElement(Segmented, { items, value: 'a', onChange() {} }))
  assert.match(single, /dshpc-seg--slide/)
  const multi = renderToStaticMarkup(
    createElement(Segmented, { multiple: true, items, value: ['a'], onChange() {} }),
  )
  assert.ok(!multi.includes('dshpc-seg--slide'), '多选不该有唯一下滑的选中块')
})

test('SplitGroup 只包壳：根节点带 dshpc-split，两格顺序原样、className 追加', () => {
  const html = renderToStaticMarkup(
    createElement(
      SplitGroup,
      { label: '组合', className: 'probe' },
      createElement('span', null, 'L'),
      createElement('span', null, 'R'),
    ),
  )
  assert.match(html, /class="dshpc-split probe"/)
  assert.match(html, /aria-label="组合"/)
  assert.ok(html.indexOf('L') < html.indexOf('R'), '左格必须在前')
})

test('Segmented 的 count / badge 收字符串（如 "1K"），数字 ≤0 仍不显示', () => {
  const html = renderToStaticMarkup(createElement(Segmented, {
    items: [
      { value: 'a', label: '甲', count: '1K' },
      { value: 'b', label: '乙', count: 0, badge: '99+' },
    ],
    value: 'a',
    onChange() {},
  }))
  assert.match(html, /dshpc-seg__count">1K</, '字符串计数被吞掉了')
  assert.match(html, /dshpc-seg__badge">99\+</, '字符串角标被吞掉了')
  assert.equal((html.match(/dshpc-seg__count/g) ?? []).length, 1, 'count 为 0 的那段不该渲染计数')
})

test('滑动块样式带过渡，reduced-motion 下关掉', () => {
  assert.match(SEGMENTED_CSS, /\.dshpc-seg__thumb\{[^}]*transition:/)
  assert.match(SEGMENTED_CSS, /prefers-reduced-motion[\s\S]*?\.dshpc-seg__thumb\{transition:none/)
})

test('Input 只在给了 icon / type=search 时才多包一层壳', () => {
  const props = { value: '', onChange() {} }
  const plain = renderToStaticMarkup(createElement(Input, props))
  assert.ok(!plain.includes('dshpc-iwrap'), '没图标也不是搜索框，不该包壳')
  const withIcon = renderToStaticMarkup(createElement(Input, { ...props, size: 'sm', icon: 'S' }))
  assert.match(withIcon, /class="dshpc-iwrap dshpc-iwrap--sm"/)
  assert.match(withIcon, /dshpc-iwrap__icon/)
})

test('搜索框清空钮只在聚焦且有内容时出现，原生那枚由 CSS 隐掉', () => {
  const search = renderToStaticMarkup(createElement(Input, { type: 'search', value: 'x', onChange() {} }))
  // 静态渲染没有焦点 ⇒ 有内容也不出（用户 2026-10-28：不能一直在）
  assert.ok(search.includes('dshpc-iwrap'), '搜索框要包壳（清空钮挂在这个壳里）')
  assert.ok(!search.includes('dshpc-iwrap__clear'), '没焦点不该出清空钮')
  assert.match(FIELD_CSS, /\.dshpc-iwrap \.dshpc-input::-webkit-search-cancel-button\{display:none/)
})

test('Button 宽度三轴互斥：固定宽优先，min/max 自动失效', () => {
  const fixed = renderToStaticMarkup(createElement(Button, { width: 120, minWidth: 80, maxWidth: 200 }, '标签'))
  assert.match(fixed, /style="[^"]*width:120px/)
  assert.ok(!/min-width/.test(fixed), '固定宽下不应带 min-width')
  assert.ok(!/max-width/.test(fixed), '固定宽下不应带 max-width')

  const minOnly = renderToStaticMarkup(createElement(Button, { minWidth: '60%' }, '标签'))
  assert.match(minOnly, /style="[^"]*min-width:60%/)
  assert.ok(!/max-width/.test(minOnly), '未设固定宽时 min 独立生效')

  const maxOnly = renderToStaticMarkup(createElement(Button, { maxWidth: 100 }, '很长的标签文字内容'))
  assert.match(maxOnly, /style="[^"]*max-width:100px/)
})

test('Button 最大宽 + 纯文字标签：包 MarqueeText 折叠省略号', () => {
  const html = renderToStaticMarkup(createElement(Button, { maxWidth: 100 }, '很长的标签文字内容'))
  assert.ok(html.includes('dshpc-mq'), '最大宽下标签应包进跑马灯容器')
  assert.ok(html.includes('dshpc-btn__label'), '标签带可收缩的 label 类')
  assert.ok(html.includes('很长的标签文字内容'), '文本原样传入')
})

test('Button 最大宽但非文字标签：不强行包 MarqueeText', () => {
  const html = renderToStaticMarkup(createElement(Button, { maxWidth: 100 }, createElement('b', null, '加粗')))
  assert.ok(!html.includes('dshpc-mq'), '非纯文字标签不应被 MarqueeText 接管')
})

test('Chip 宽度三轴互斥：固定宽优先，min/max 自动失效', () => {
  const fixed = renderToStaticMarkup(createElement(Chip, { width: 90, minWidth: 160, maxWidth: 120 }, '标签'))
  assert.match(fixed, /style="[^"]*width:90px/)
  assert.ok(!/min-width/.test(fixed), '固定宽下不应带 min-width')
  assert.ok(!/max-width/.test(fixed), '固定宽下不应带 max-width')

  const minOnly = renderToStaticMarkup(createElement(Chip, { minWidth: '60%' }, '标签'))
  assert.match(minOnly, /style="[^"]*min-width:60%/)
  assert.ok(!/max-width/.test(minOnly), '未设固定宽时 min 独立生效')

  const maxOnly = renderToStaticMarkup(createElement(Chip, { maxWidth: 100 }, '很长的标签文字内容'))
  assert.match(maxOnly, /style="[^"]*max-width:100px/)
})

test('Chip 最大宽 + 纯文字：包 MarqueeText 折叠省略号；无 onClick 渲染成 span', () => {
  const html = renderToStaticMarkup(createElement(Chip, { maxWidth: 100 }, '很长的标签文字内容'))
  assert.ok(!html.includes('<button'), '无 onClick 应是 span')
  assert.ok(html.includes('dshpc-mq'), '最大宽下标签应包进跑马灯容器')
  assert.ok(html.includes('dshpc-chip__label'), '标签带可收缩的 label 类')
})

test('Chip 最大宽 + onClick：渲染成 button 且仍包 MarqueeText', () => {
  const html = renderToStaticMarkup(createElement(Chip, { maxWidth: 100, onClick: () => {} }, '很长的标签文字内容'))
  assert.ok(html.includes('<button'), '有 onClick 应是 button')
  assert.ok(html.includes('dshpc-mq'), '最大宽下标签仍包进跑马灯容器')
})
