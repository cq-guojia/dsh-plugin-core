import test from 'node:test'
import assert from 'node:assert/strict'
import { createBoundedCache } from '../dist/adv/tasks/bounded-cache.js'

test('容量上限：超过 limit 淘汰最久未用项，size 有界', () => {
  const cache = createBoundedCache(3)
  cache.set('a', 1)
  cache.set('b', 2)
  cache.set('c', 3)
  assert.equal(cache.size, 3)
  cache.set('d', 4)
  assert.equal(cache.size, 3)
  assert.equal(cache.has('a'), false)
  assert.equal(cache.get('b'), 2)
  assert.equal(cache.get('c'), 3)
  assert.equal(cache.get('d'), 4)
})

test('LRU：get / has 刷新最近使用，淘汰不碰活跃项', () => {
  const cache = createBoundedCache(2)
  cache.set('a', 1)
  cache.set('b', 2)
  assert.equal(cache.get('a'), 1)
  cache.set('c', 3)
  assert.equal(cache.has('b'), false)
  assert.equal(cache.get('a'), 1)
  assert.equal(cache.get('c'), 3)
})

test('LRU：has 命中同样刷新最近使用', () => {
  const cache = createBoundedCache(2)
  cache.set('a', 1)
  cache.set('b', 2)
  assert.equal(cache.has('a'), true)
  cache.set('c', 3)
  assert.equal(cache.has('b'), false)
  assert.equal(cache.has('a'), true)
})

test('TTL：写入后超过 ttl 才删，到点边界保留', () => {
  let clock = 0
  const cache = createBoundedCache(10, 100, () => clock)
  cache.set('a', 1)
  clock = 100
  assert.equal(cache.get('a'), 1)
  clock = 101
  assert.equal(cache.get('a'), undefined)
  assert.equal(cache.size, 0)
  assert.equal(cache.has('a'), false)
})

test('TTL 从写入算：访问不续命（expireAfterWrite）', () => {
  let clock = 0
  const cache = createBoundedCache(10, 100, () => clock)
  cache.set('a', 1)
  clock = 60
  assert.equal(cache.get('a'), 1)
  clock = 90
  assert.equal(cache.get('a'), 1)
  clock = 101
  assert.equal(cache.get('a'), undefined)
})

test('同 key 覆盖更新值与写入时间，不增加 size', () => {
  let clock = 0
  const cache = createBoundedCache(10, 100, () => clock)
  cache.set('a', 1)
  clock = 80
  cache.set('a', 2)
  assert.equal(cache.size, 1)
  assert.equal(cache.get('a'), 2)
  clock = 150
  assert.equal(cache.get('a'), 2)
  clock = 181
  assert.equal(cache.get('a'), undefined)
})

test('delete / clear；非法 limit 直接抛', () => {
  const cache = createBoundedCache(2)
  cache.set('a', 1)
  cache.delete('a')
  assert.equal(cache.size, 0)
  cache.set('b', 2)
  cache.set('c', 3)
  cache.clear()
  assert.equal(cache.size, 0)
  assert.throws(() => createBoundedCache(0), /positive integer/)
  assert.throws(() => createBoundedCache(1.5), /positive integer/)
  assert.throws(() => createBoundedCache(2, 0), /ttl must be positive/)
  assert.throws(() => createBoundedCache(2, Number.NaN), /ttl must be positive/)
})
