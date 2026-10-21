import test from 'node:test'
import assert from 'node:assert/strict'
import { TOAST_HOST_KEY, claimToastHost } from '../dist/ui/toast-host.js'

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
