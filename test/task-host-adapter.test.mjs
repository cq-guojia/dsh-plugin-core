import test from 'node:test'
import assert from 'node:assert/strict'
import { connectTaskCenter, defaultTaskHost } from '../dist/adv/tasks/api.js'
import { subscribeToasts } from '../dist/ui/feedback/toast-queue.js'

function record(over = {}) {
  return { id: 'a', project: 'p', group: 'g', title: 't', state: 'done', startedAt: 1, ...over }
}

test('默认宿主：toast.scope=origin 只在发起标签页弹卡（页面级 origin，非面板）', () => {
  const got = []
  const off = subscribeToasts((p) => got.push(p))
  try {
    const host = defaultTaskHost(() => 'tab-b')
    // 发起页是 tab-a，本页 tab-b ⇒ 不弹；换面板也不影响页面级归属。
    host.deliverToast({ title: '完成', scope: 'origin', task: record({ origin: 'tab-a', panelId: 'panel-x' }) })
    assert.equal(got.length, 0, '非发起标签页不弹（即使面板 id 不同）')
    host.deliverToast({ title: '完成', scope: 'origin', task: record({ origin: 'tab-b', panelId: 'panel-a' }) })
    assert.equal(got.length, 1, '发起标签页弹（面板 id 不同也弹）')
    host.deliverToast({ title: '完成', scope: 'all', task: record({ origin: 'tab-a' }) })
    assert.equal(got.length, 2, 'scope=all 每个标签页都弹')
    // 身份缺失（服务端没透传 origin / 宿主没注入）fail-open：按弹处理，绝不漏卡。
    const noHost = defaultTaskHost()
    noHost.deliverToast({ title: '完成', scope: 'origin', task: record({ origin: 'tab-a' }) })
    assert.equal(got.length, 3, '宿主无 origin 身份时按弹兜底')
    noHost.deliverToast({ title: '完成', scope: 'origin', task: record({ origin: undefined }) })
    assert.equal(got.length, 4, '记录无 origin 身份时按弹兜底')
  } finally {
    off()
  }
})

test('默认宿主：toast 按钮只在注册了 handler 的页显示（无死按钮）', async () => {
  const { mountTaskUI, taskCenterStore, defaultTaskHost: hostFn } = await import('../dist/adv/tasks/index.js')
  taskCenterStore.clear()
  const got = []
  const off = subscribeToasts((p) => got.push(p))
  try {
    const offUi = mountTaskUI({ project: 'p', handlers: { view: () => {} } })
    const host = hostFn(() => 'panel-b')
    host.deliverToast({
      title: '完成', scope: 'all', buttonId: 'view', buttonText: '查看',
      task: record({ panelId: 'panel-b' }),
    })
    assert.equal(got[0].actions.length, 1, '注册了 handler，按钮出现')

    offUi()
    got.length = 0
    host.deliverToast({
      title: '完成', scope: 'all', buttonId: 'missing', buttonText: '查看',
      task: record({ panelId: 'panel-b' }),
    })
    assert.equal(got[0].actions, undefined, '没注册 handler，按钮不出现（无死按钮）')
    taskCenterStore.clear()
  } finally {
    off()
  }
})

test('mountTaskUI：onSettled 按 project/groups 过滤（与列表 select 同口径）', async () => {
  const { mountTaskUI, taskCenterStore } = await import('../dist/adv/tasks/index.js')
  taskCenterStore.clear()
  const got = []
  const off = mountTaskUI({
    project: 'p', groups: ['g1'], handlers: {},
    onSettled: (task) => got.push(task.id),
  })
  try {
    const mk = (id, project, group) => ({ id, project, group, title: 't', state: 'done', startedAt: 1 })
    taskCenterStore.emitSettled({ outcome: 'done', task: mk('match', 'p', 'g1') })
    taskCenterStore.emitSettled({ outcome: 'done', task: mk('other-project', 'q', 'g1') })
    taskCenterStore.emitSettled({ outcome: 'done', task: mk('other-group', 'p', 'g2') })
    taskCenterStore.emitSettled({ outcome: 'done', task: mk('no-project', undefined, 'g1') })
    assert.deepEqual(got, ['match'], '只收本项目本分组的终态')
  } finally {
    off()
    taskCenterStore.clear()
  }
})

test('mountTaskUI：onSettled 不传 project/groups 时收全部项目', async () => {
  const { mountTaskUI, taskCenterStore } = await import('../dist/adv/tasks/index.js')
  taskCenterStore.clear()
  const got = []
  const off = mountTaskUI({ handlers: {}, onSettled: (task) => got.push(task.id) })
  try {
    taskCenterStore.emitSettled({ outcome: 'done', task: { id: 'a', project: 'p', group: 'g', title: 't', state: 'done', startedAt: 1 } })
    taskCenterStore.emitSettled({ outcome: 'done', task: { id: 'b', project: 'q', group: 'g', title: 't', state: 'done', startedAt: 1 } })
    assert.deepEqual(got, ['a', 'b'], '不过滤时收全部')
  } finally {
    off()
    taskCenterStore.clear()
  }
})

test('默认宿主：notify 一律只发通知不弹卡（broadcast 省略也走总线），scope=origin 仍过滤', async () => {
  const { subscribeTaskNotifications } = await import('../dist/adv/tasks/index.js')
  // 用私有名字造两个逻辑端，模拟两个页面。
  const project = `scope-test-${Date.now()}`
  const received = []
  const off = subscribeTaskNotifications({ project, scope: 'plugin', handler: (m) => received.push(m) })
  try {
    // 订阅默认通知通道，验证 notify 经总线发出 + 订阅侧按 project 过滤。
    const { notifyMessage, setDefaultTaskProject } = await import('../dist/runtime/notify.js')
    setDefaultTaskProject(project)
    notifyMessage('hello', { project })
    await new Promise((r) => setTimeout(r, 0))
    assert.equal(received.length, 1)
    assert.equal(received[0].message, 'hello')
    assert.equal(received[0].project, project)

    // scope=plugin 只收同项目
    const other = []
    const off2 = subscribeTaskNotifications({ project: 'other-project', scope: 'plugin', handler: (m) => other.push(m) })
    notifyMessage('world', { project })
    await new Promise((r) => setTimeout(r, 0))
    assert.equal(other.length, 0, 'plugin 范围不收别的项目')
    off2()

    // notify 一律只发通知：不写 broadcast 也走总线（核心不弹卡、弹不弹由订阅方定）。
    const before = received.length
    defaultTaskHost().deliverNotify({
      project, group: 'g', message: 'from-task', level: 'success', scope: 'all',
      task: record({ project }),
    })
    await new Promise((r) => setTimeout(r, 0))
    assert.equal(received.length, before + 1, '没写 broadcast 的通知也发出去了')
    assert.equal(received.at(-1).message, 'from-task')

    // scope=origin 只在本标签页广播；非发起页（origin 不匹配）不广播。
    defaultTaskHost(() => 'tab-b').deliverNotify({
      project, group: 'g', message: 'origin-other', level: 'success', scope: 'origin',
      task: record({ project, origin: 'tab-a', panelId: 'panel-any' }),
    })
    await new Promise((r) => setTimeout(r, 0))
    assert.equal(received.length, before + 1, '非发起标签页的 origin notify 不广播')
    setDefaultTaskProject(undefined)
  } finally {
    off()
  }
})


test('connectTaskCenter：重复接线后卸载旧的，不关掉新接线的 SSE', async () => {
  const savedFetch = globalThis.fetch
  const aborted = []
  // 每次 fetch 返回一个永不结束的流；abort 时读端 done，让连接安静退出。
  globalThis.fetch = (url, init) => {
    const sig = init.signal
    sig.addEventListener('abort', () => aborted.push(String(url)), { once: true })
    return Promise.resolve({
      ok: true,
      body: {
        getReader: () => ({
          read: () => new Promise((resolve) => {
            if (sig.aborted) return resolve({ done: true })
            sig.addEventListener('abort', () => resolve({ done: true }), { once: true })
          }),
        }),
      },
    })
  }
  try {
    const offA = connectTaskCenter({ streamUrl: '/a' })
    const offB = connectTaskCenter({ streamUrl: '/b' })
    // B 接线时新接线关旧流：A 的流被 abort 一次。
    assert.ok(aborted.includes('/a'), '新接线关掉上一条流')
    assert.ok(!aborted.includes('/b'), '此时 B 的流还在')
    offA()
    await new Promise((r) => setTimeout(r, 20))
    assert.ok(!aborted.includes('/b'), '卸载 A 不关掉 B 的流')
    offB()
    await new Promise((r) => setTimeout(r, 20))
    assert.ok(aborted.includes('/b'), '卸载 B 关掉自己的流')
  } finally {
    globalThis.fetch = savedFetch
  }
})


test('subscribeTaskNotifications：plugin 不传 project 回落到默认项目，不再一条都收不到', async () => {
  const { subscribeTaskNotifications } = await import('../dist/adv/tasks/index.js')
  const { notifyMessage, setDefaultTaskProject } = await import('../dist/runtime/notify.js')
  const project = `p1-1-fallback-${Date.now()}`
  setDefaultTaskProject(project)
  const got = []
  const off = subscribeTaskNotifications({ scope: 'plugin', handler: (m) => got.push(m) })
  try {
    notifyMessage('fallback', { project })
    await new Promise((r) => setTimeout(r, 0))
    assert.equal(got.length, 1, 'plugin 不传 project 时收默认项目的消息')
    notifyMessage('other', { project: 'another-project' })
    await new Promise((r) => setTimeout(r, 0))
    assert.equal(got.length, 1, '仍只收默认项目，不串别的项目')
  } finally {
    off()
    setDefaultTaskProject(undefined)
  }
})
