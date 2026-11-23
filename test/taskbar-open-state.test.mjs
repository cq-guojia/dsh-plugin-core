import test from 'node:test'
import assert from 'node:assert/strict'
import { decideOpenState } from '../dist/adv/tasks/TaskBar.js'

test('非受控展开态：只改内部 state，不走回调分支', () => {
  assert.deepEqual(decideOpenState(false, true, false, false), { kind: 'setInternal', value: true })
  assert.deepEqual(decideOpenState(true, false, false, false), { kind: 'setInternal', value: false })
  assert.deepEqual(decideOpenState(false, false, false, false), { kind: 'noop' })
})

test('受控展开态：只发变化值，父组件尚未回写时不重复发', () => {
  assert.deepEqual(decideOpenState(true, false, true, true), { kind: 'emit', value: false })
  assert.deepEqual(decideOpenState(true, false, true, false), { kind: 'noop' }, '连续两次关闭只发一次')
  assert.deepEqual(decideOpenState(false, true, true, false), { kind: 'emit', value: true }, '触发器点开发 true')
  assert.deepEqual(decideOpenState(false, true, true, true), { kind: 'noop' })
})

test('父组件回写后 ref 复位，再打开再关闭仍能发出 false', () => {
  // 第一次关闭发出 false 后父组件回写 open=false 并再次打开 open=true，lastEmitted 随 open 复位为 true。
  assert.deepEqual(decideOpenState(true, false, true, true), { kind: 'emit', value: false })
  assert.deepEqual(decideOpenState(true, false, true, false), { kind: 'noop' }, '回写前第二次关闭被吞')
  assert.deepEqual(decideOpenState(false, true, true, false), { kind: 'emit', value: true })
  assert.deepEqual(decideOpenState(true, false, true, true), { kind: 'emit', value: false }, '复位后关闭重新发出')
})
