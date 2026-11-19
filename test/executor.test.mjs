import test from 'node:test'
import assert from 'node:assert/strict'
import { createExecutorRegistry, executors } from '../dist/runtime/index.js'

test('执行器注册表：kind 任意串、按名取、可列举', () => {
  const registry = createExecutorRegistry()
  const handler = async () => ({ outcome: 'done' })
  registry.register('executor:close-task', handler)
  registry.register('shell', handler)
  assert.equal(registry.get('executor:close-task'), handler)
  assert.equal(registry.get('shell'), handler)
  assert.deepEqual(registry.list(), ['executor:close-task', 'shell'])
  assert.equal(registry.get('never-registered'), undefined)
})

test('执行器注册表：同名重复注册抛错，注销后同名可再注册', () => {
  const registry = createExecutorRegistry()
  const first = () => ({ outcome: 'done' })
  const second = () => ({ outcome: 'failed' })
  const dispose = registry.register('agent', first)
  assert.throws(() => registry.register('agent', second), /already registered/)
  assert.equal(registry.unregister('agent'), true)
  assert.equal(registry.unregister('agent'), false)
  registry.register('agent', second)
  // 旧 dispose 不能误删后来注册的同名。
  dispose()
  assert.equal(registry.get('agent'), second)
})

test('执行器注册表：拒绝空 kind / 非函数', () => {
  const registry = createExecutorRegistry()
  assert.throws(() => registry.register('  ', () => ({ outcome: 'done' })), /non-empty/)
  assert.throws(() => registry.register('x', 'not a function'), /must be a function/)
})

test('执行器注册表：clear 清空，私有注册表之间隔离', () => {
  const a = createExecutorRegistry()
  const b = createExecutorRegistry()
  const handler = () => ({ outcome: 'done' })
  a.register('only-a', handler)
  assert.equal(b.get('only-a'), undefined)
  a.clear()
  assert.equal(a.list().length, 0)
})

test('全局注册表：同一次 import 拿到同一份（Symbol.for 收口）', () => {
  assert.equal(typeof executors.register, 'function')
  assert.equal(typeof executors.get, 'function')
  // 不污染全局：只用私有注册表做行为测试，这里只断言形态。
  assert.ok(Array.isArray(executors.list()))
})
