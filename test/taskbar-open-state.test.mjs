import test from 'node:test'
import assert from 'node:assert/strict'
import { decideOpenState, shouldCloseOnOutsideClick } from '../dist/adv/tasks/TaskBar.js'

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

test('只有点面板外、且 pointerdown 与 click 都不在模态中才收起', () => {
  assert.equal(shouldCloseOnOutsideClick(false, false, false), true, '普通外部点击正常收')
  assert.equal(shouldCloseOnOutsideClick(false, false, true), false, '点外部开弹窗：click 时弹窗已挂载')
  assert.equal(shouldCloseOnOutsideClick(false, true, false), false, '点关闭弹窗：click 时弹窗已卸载但 pointerdown 时还开着')
  assert.equal(shouldCloseOnOutsideClick(false, true, true), false, '模态内操作不关面板')
  assert.equal(shouldCloseOnOutsideClick(true, false, false), false, '点自己由行按钮 / 触发器负责')
  assert.equal(shouldCloseOnOutsideClick(true, true, false), false, '模态开着点自己也不改状态')
})
