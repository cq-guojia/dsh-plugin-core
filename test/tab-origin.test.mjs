/**
 * 标签页级 origin 的回归：刷新后终态 toast 不丢，别的标签页不重复弹。
 * 用 cache-busting import 模拟「一次新的页面加载」（模块级 fallback 重建），
 * sessionStorage 则模拟浏览器按标签页分区、刷新保留的语义。
 */
import test from 'node:test'
import assert from 'node:assert/strict'

const TAB_ORIGIN_KEY = 'dshpc:notify:tab-origin:v1'

function fakeStorage(backing) {
  return {
    getItem: (key) => backing.get(key) ?? null,
    setItem: (key, value) => { backing.set(key, String(value)) },
    removeItem: (key) => { backing.delete(key) },
    clear: () => backing.clear(),
  }
}

async function withStorage(backing, fn) {
  const previous = globalThis.sessionStorage
  globalThis.sessionStorage = fakeStorage(backing)
  try { return await fn() } finally {
    if (previous === undefined) delete globalThis.sessionStorage
    else globalThis.sessionStorage = previous
  }
}

test('getTabOrigin：跨模块加载（模拟刷新）读回同一个值，并落 sessionStorage', async () => {
  const backing = new Map()
  await withStorage(backing, async () => {
    const first = await import('../dist/runtime/notify.js?tab-origin-first')
    const second = await import('../dist/runtime/notify.js?tab-origin-second')
    const value = first.getTabOrigin()
    assert.equal(typeof value, 'string')
    assert.ok(value.length > 0)
    assert.equal(second.getTabOrigin(), value, '新一次加载仍读回同一个标签页身份')
    assert.equal(backing.get(TAB_ORIGIN_KEY), value, '值已持久化到 sessionStorage')
  })
})

test('getTabOrigin：不同 sessionStorage（不同标签页）各拿各的值；scope origin 仍每次随机', async () => {
  const tabA = await withStorage(new Map(), async () => {
    const { getTabOrigin } = await import('../dist/runtime/notify.js?tab-origin-tab-a')
    return getTabOrigin()
  })
  const tabB = await withStorage(new Map(), async () => {
    const { getTabOrigin } = await import('../dist/runtime/notify.js?tab-origin-tab-b')
    return getTabOrigin()
  })
  assert.notEqual(tabA, tabB, '不同标签页身份不同，终态只弹发起页')

  const { createNotifyScope } = await import('../dist/runtime/notify.js?tab-origin-scopes')
  const s1 = createNotifyScope()
  const s2 = createNotifyScope()
  assert.notEqual(s1.origin, s2.origin, '逻辑端实例 id 仍随机，不与 tab 身份合并')
  assert.notEqual(s1.origin, tabA, '两种身份不相等，BroadcastChannel 自过滤契约不变')
})

test('默认接线：startTask 记 tab origin；终态同 tab 弹、异 tab 不弹', async () => {
  const backing = new Map()
  await withStorage(backing, async () => {
    const { connectTaskCenter, startTask, taskCenterStore } = await import('../dist/adv/tasks/index.js?tab-origin-wiring')
    const { getTabOrigin } = await import('../dist/runtime/notify.js?tab-origin-wiring-rt')
    const { defaultTaskHost } = await import('../dist/adv/tasks/api.js?tab-origin-host')
    const { subscribeToasts } = await import('../dist/ui/feedback/toast-queue.js?tab-origin-queue')
    const tabOrigin = getTabOrigin()
    const originalFetch = globalThis.fetch
    const got = []
    let off = () => {}, offToast = () => {}
    try {
      globalThis.fetch = async () => ({ ok: true, json: async () => ({}) })
      off = connectTaskCenter({ submitUrl: '/submit' })
      offToast = subscribeToasts((payload) => got.push(payload.message))
      const task = await startTask({
        title: { category: '任务', description: 'tab-origin' },
        project: 'p', key: 'k-tab-origin',
        toast: { success: { title: { category: '完成', description: 'ok' }, scope: 'origin' } },
      })
      assert.equal(task.origin, tabOrigin, 'startTask 记的是 tab 级 origin，不是每次加载随机的 scope id')

      const host = defaultTaskHost(getTabOrigin)
      host.deliverToast({ title: '完成', scope: 'origin', task: { ...task, origin: tabOrigin } })
      assert.equal(got.length, 1, '刷新后同一个 tab 仍弹终态 toast')
      host.deliverToast({ title: '完成', scope: 'origin', task: { ...task, origin: 'other-tab' } })
      assert.equal(got.length, 1, '别的标签页不弹')
    } finally {
      off(); offToast()
      globalThis.fetch = originalFetch
      taskCenterStore.clearAll()
    }
  })
})
