import test from 'node:test'
import assert from 'node:assert/strict'
import {
  decideOpenState,
  shouldCloseOnOutsidePointer,
  shouldSuspendFloatingLayer,
} from '../dist/adv/tasks/TaskBar.js'

test('非受控展开态：只改内部 state，不走回调分支', () => {
  assert.deepEqual(decideOpenState(false, true, false), { kind: 'setInternal', value: true })
  assert.deepEqual(decideOpenState(true, false, false), { kind: 'setInternal', value: false })
  assert.deepEqual(decideOpenState(false, false, false), { kind: 'noop' })
})

test('受控展开态：每次当前值不同都发回调，不再吞父组件未回写的关闭', () => {
  assert.deepEqual(decideOpenState(true, false, true), { kind: 'emit', value: false })
  assert.deepEqual(decideOpenState(true, false, true), { kind: 'emit', value: false }, '父组件不回写时再次关闭仍发')
  assert.deepEqual(decideOpenState(false, true, true), { kind: 'emit', value: true }, '触发器点开发 true')
  assert.deepEqual(decideOpenState(false, false, true), { kind: 'noop' }, '当前值已一致才 noop')
})

test('挂起只在 closeOnAction=false 且前台主浮层开着时发生', () => {
  assert.equal(shouldSuspendFloatingLayer(false, true), true)
  assert.equal(shouldSuspendFloatingLayer(false, false), false)
  assert.equal(shouldSuspendFloatingLayer(true, true), false, '默认点项即收，不需要挂起')
  assert.equal(shouldSuspendFloatingLayer(true, false), false)
})

test('挂起期间任何事件都不响应；恢复后只在点自己外面时关闭', () => {
  assert.equal(shouldCloseOnOutsidePointer(true, false), false, '弹窗开着时点弹窗不算外部关闭')
  assert.equal(shouldCloseOnOutsidePointer(true, true), false, '弹窗开着时点自己也不改状态')
  assert.equal(shouldCloseOnOutsidePointer(false, false), true, '恢复后点面板外正常收起')
  assert.equal(shouldCloseOnOutsidePointer(false, true), false, '点自己由 toggle / 行按钮负责')
})
