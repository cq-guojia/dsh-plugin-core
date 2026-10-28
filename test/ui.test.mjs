import test from 'node:test'
import assert from 'node:assert/strict'
import { ensureControls, getStyleKit, setStyleKit } from '../dist/ui/css.js'
import { createStyleKit } from '../dist/design/index.js'
import { SEGMENTED_CSS } from '../dist/ui/controls/segmented-css.generated.js'
import { Input, Segmented } from '../dist/ui/index.js'
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

test('滑动块样式带过渡，reduced-motion 下关掉', () => {
  assert.match(SEGMENTED_CSS, /\.dshpc-seg__thumb\{[^}]*transition:/)
  assert.match(SEGMENTED_CSS, /prefers-reduced-motion[\s\S]*?\.dshpc-seg__thumb\{transition:none/)
})

test('Input 只在给了 icon 时才多包一层图标壳', () => {
  const props = { value: '', onChange() {} }
  const plain = renderToStaticMarkup(createElement(Input, props))
  assert.ok(!plain.includes('dshpc-iwrap'), '没图标不该包壳')
  const withIcon = renderToStaticMarkup(createElement(Input, { ...props, size: 'sm', icon: 'S' }))
  assert.match(withIcon, /class="dshpc-iwrap dshpc-iwrap--sm"/)
  assert.match(withIcon, /dshpc-iwrap__icon/)
})
