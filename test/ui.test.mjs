import test from 'node:test'
import assert from 'node:assert/strict'
import { ensureControls, getStyleKit, setStyleKit } from '../dist/ui/css.js'
import { createStyleKit } from '../dist/design/index.js'

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
