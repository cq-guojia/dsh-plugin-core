import test from 'node:test'
import assert from 'node:assert/strict'
import { TOAST_HOST_KEY, claimToastHost } from '../dist/ui/feedback/toast-host.js'
import { TOAST_QUEUE_KEY, pushToast, subscribeToasts } from '../dist/ui/feedback/toast-queue.js'

test('claimToastHost 单例：第二次 claim 不触发 create，拿到同一实例', () => {
  let created = 0
  const first = claimToastHost(() => {
    created++
    return { tag: 'first' }
  })
  const second = claimToastHost(() => {
    created++
    return { tag: 'second' }
  })
  assert.equal(created, 1)
  assert.equal(first, second)
  assert.equal(first.tag, 'first')
})

test('delete globalThis[KEY] 后按新 create 重建', () => {
  delete globalThis[TOAST_HOST_KEY]
  const again = claimToastHost(() => ({ tag: 'rebuilt' }))
  assert.equal(again.tag, 'rebuilt')
  delete globalThis[TOAST_HOST_KEY]
})

test('TOAST_HOST_KEY 是 Symbol.for 全局符号（跨副本共享）', () => {
  assert.equal(TOAST_HOST_KEY, Symbol.for('dsh-plugin-core/toast-host'))
})

test('投递队列：界面未挂时先收下，挂上后补发；退订后不再收', () => {
  delete globalThis[TOAST_QUEUE_KEY]
  const payload = (message) => ({ message, variant: 'info', style: 'card', durationMs: 2600 })

  pushToast(payload('a')) // 还没有界面在听
  const seen = []
  const off = subscribeToasts((p) => seen.push(p.message))
  assert.deepEqual(seen, ['a'], '订阅时补发未显示的')

  pushToast(payload('b'))
  assert.deepEqual(seen, ['a', 'b'])

  off()
  pushToast(payload('c'))
  assert.deepEqual(seen, ['a', 'b'], '退订后不再收')
  assert.equal(globalThis[TOAST_QUEUE_KEY].pending.length, 1, '没人听时重新入队')

  delete globalThis[TOAST_QUEUE_KEY]
})

test('队列：过期消息不补发、界面长期缺席有容量上限', () => {
  delete globalThis[TOAST_QUEUE_KEY]
  const payload = (message, durationMs = 2600) => ({ message, variant: 'info', style: 'card', durationMs })

  pushToast(payload('旧', 5))
  globalThis[TOAST_QUEUE_KEY].pending[0].at -= 100
  const seen = []
  const off = subscribeToasts((p) => seen.push(p.message))
  assert.deepEqual(seen, [], '过了自己停留时长的消息不再补发')
  off()

  delete globalThis[TOAST_QUEUE_KEY]
  for (let i = 0; i < 50; i++) pushToast(payload(`m${String(i)}`))
  assert.equal(globalThis[TOAST_QUEUE_KEY].pending.length, 20, '不把广播攒成无限历史')
  delete globalThis[TOAST_QUEUE_KEY]
})

test('队列：一个订阅者抛错不影响另一个', () => {
  delete globalThis[TOAST_QUEUE_KEY]
  const payload = { message: 'x', variant: 'info', style: 'card', durationMs: 2600 }
  const warn = console.warn
  console.warn = () => {}
  try {
    const offBad = subscribeToasts(() => { throw new Error('boom') })
    const seen = []
    const offGood = subscribeToasts((p) => seen.push(p.message))
    assert.doesNotThrow(() => pushToast(payload))
    assert.deepEqual(seen, ['x'])
    assert.equal(globalThis[TOAST_QUEUE_KEY].pending.length, 0, '任一订阅者画过就不回队')
    offBad()
    offGood()
  } finally {
    console.warn = warn
    delete globalThis[TOAST_QUEUE_KEY]
  }
})

test('队列：实时投递全失败时回队，不静默丢消息', () => {
  delete globalThis[TOAST_QUEUE_KEY]
  const warn = console.warn
  console.warn = () => {}
  try {
    const offBad = subscribeToasts(() => { throw new Error('boom') })
    pushToast({ message: '实时失败', variant: 'info', style: 'card', durationMs: 2600 })
    assert.equal(globalThis[TOAST_QUEUE_KEY].pending.length, 1)
    offBad()
    const seen = []
    const offGood = subscribeToasts((p) => seen.push(p.message))
    assert.deepEqual(seen, ['实时失败'])
    offGood()
  } finally {
    console.warn = warn
    delete globalThis[TOAST_QUEUE_KEY]
  }
})

test('队列：重放时异常不影响后续订阅者补发', () => {
  delete globalThis[TOAST_QUEUE_KEY]
  const warn = console.warn
  console.warn = () => {}
  try {
    pushToast({ message: '重放失败', variant: 'info', style: 'card', durationMs: 2600 })
    const offBad = subscribeToasts(() => { throw new Error('boom') })
    assert.equal(globalThis[TOAST_QUEUE_KEY].pending.length, 1, '失败项回队')
    offBad()
    const seen = []
    const offGood = subscribeToasts((p) => seen.push(p.message))
    assert.deepEqual(seen, ['重放失败'])
    offGood()
  } finally {
    console.warn = warn
    delete globalThis[TOAST_QUEUE_KEY]
  }
})
