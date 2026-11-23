import test from 'node:test'
import assert from 'node:assert/strict'
import {
  acquireForegroundOverlay,
  getForegroundOverlayCount,
  getForegroundOverlayServerCount,
  releaseForegroundOverlay,
  shouldDismissOnForegroundOverlay,
  subscribeForegroundOverlay,
} from '../dist/ui/infra/overlay.js'

const KEY = Symbol.for('dshpc.foregroundOverlay.v1')
const reset = () => { delete globalThis[KEY] }

test('前台浮层 store：计数增减、通知与 SSR 快照', () => {
  reset()
  try {
    let notified = 0
    const off = subscribeForegroundOverlay(() => { notified += 1 })
    assert.equal(getForegroundOverlayCount(), 0)
    assert.equal(getForegroundOverlayServerCount(), 0, '服务端快照恒为 0')

    acquireForegroundOverlay()
    acquireForegroundOverlay()
    assert.equal(getForegroundOverlayCount(), 2, '嵌套浮层累加')
    assert.equal(notified, 2)

    releaseForegroundOverlay()
    assert.equal(getForegroundOverlayCount(), 1)
    releaseForegroundOverlay()
    assert.equal(getForegroundOverlayCount(), 0)
    releaseForegroundOverlay()
    assert.equal(getForegroundOverlayCount(), 0, '计数不低于 0')
    assert.equal(notified, 4, '计数为 0 时重复 release 不再发通知')

    off()
    acquireForegroundOverlay()
    assert.equal(notified, 4, '退订后不再收到通知')
  } finally {
    reset()
  }
})

test('收起边沿只在 0 → 正数触发，嵌套与回落都不重复', () => {
  assert.equal(shouldDismissOnForegroundOverlay(0, 1), true)
  assert.equal(shouldDismissOnForegroundOverlay(1, 2), false)
  assert.equal(shouldDismissOnForegroundOverlay(1, 0), false)
  assert.equal(shouldDismissOnForegroundOverlay(0, 0), false)
})

test('跨副本槽位形状不兼容时直接抛错，不静默降级', () => {
  reset()
  try {
    globalThis[KEY] = { count: 'bad', listeners: new Set() }
    assert.throws(() => getForegroundOverlayCount(), /incompatible foreground overlay store/)
  } finally {
    reset()
  }
})
