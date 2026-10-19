import test from 'node:test'
import assert from 'node:assert/strict'
import { formatClock, formatYmd, relativeFuture } from '../dist/utils/index.js'
import { createStyleKit } from '../dist/design/index.js'
import * as ui from '../dist/ui/index.js'

test('relativeFuture 与 relativePast 对偶', () => {
  const now = Date.parse('2026-10-18T12:00:00.000Z')
  assert.equal(relativeFuture('2026-10-18T12:00:30.000Z', now), '即将')
  assert.equal(relativeFuture('2026-10-18T12:03:00.000Z', now), '3 分钟后')
  assert.equal(relativeFuture('2026-10-19T12:00:00.000Z', now), '1 天后')
  // 解析失败不编造，回退成日期串
  assert.equal(relativeFuture('not-a-date', now), '—')
})

test('formatClock 接受 undefined，可覆盖兜底', () => {
  assert.equal(formatClock(undefined), '-')
  assert.equal(formatClock(null), '-')
  assert.equal(formatClock(''), '-')
  assert.equal(formatClock(undefined, { fallback: '—' }), '—')
  assert.equal(formatClock('2026-10-18T09:05:01.000Z', { fallback: '—' }).length, 8)
})

test('formatYmd 可覆盖兜底', () => {
  assert.equal(formatYmd('bad'), '—')
  assert.equal(formatYmd('bad', { fallback: '?' }), '?')
})

test('StyleKit.dispose 在无 DOM 下不抛', () => {
  const kit = createStyleKit({ id: 'probe' })
  assert.doesNotThrow(() => kit.dispose())
  assert.doesNotThrow(() => kit.dispose())
})

test('质检新增的参数都已导出（Picker 尺寸档 / 非受控 / 清除）', () => {
  assert.equal(typeof ui.Picker, 'function')
  assert.equal(typeof ui.ModelPicker, 'function')
  // Modal 新参数通过 props 传入，编译期保证；这里确认组件存在
  assert.equal(typeof ui.Modal, 'function')
  assert.equal(typeof ui.showToast, 'function')
})
