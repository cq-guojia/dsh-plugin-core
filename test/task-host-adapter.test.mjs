import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultTaskHost } from '../dist/adv/tasks/api.js'
import { subscribeToasts } from '../dist/ui/feedback/toast-queue.js'

function record(over = {}) {
  return { id: 'a', project: 'p', group: 'g', title: 't', state: 'done', startedAt: 1, ...over }
}

test('默认宿主：toast.scope=origin 只在发起面板弹卡', () => {
  const got = []
  const off = subscribeToasts((p) => got.push(p))
  try {
    const host = defaultTaskHost(() => 'panel-b')
    host.deliverToast({ title: '完成', scope: 'origin', task: record({ panelId: 'panel-a' }) })
    assert.equal(got.length, 0, '非发起面板不弹')
    host.deliverToast({ title: '完成', scope: 'origin', task: record({ panelId: 'panel-b' }) })
    assert.equal(got.length, 1, '发起面板弹')
    host.deliverToast({ title: '完成', scope: 'all', task: record({ panelId: 'panel-a' }) })
    assert.equal(got.length, 2, 'scope=all 每个面板都弹')
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

test('默认宿主：notify.broadcast 走通知总线发出纯数据，scope=origin 不广播', async () => {
  const { subscribeTaskNotifications } = await import('../dist/adv/tasks/index.js')
  // 用私有名字造两个逻辑端，模拟两个页面。
  const project = `scope-test-${Date.now()}`
  const received = []
  const off = subscribeTaskNotifications({ project, scope: 'plugin', handler: (m) => received.push(m) })
  try {
    // notifyMessage 走默认通道；用同名的私有 scope 收不到默认通道消息。这里改为直接验证出口过滤：
    // 用 runtime 的 createNotifyScope 建一个与默认同名不同 origin 的端不发，改用默认通道发。
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

    // 默认宿主的 deliverNotify 带 broadcast 时也走通知总线
    const before = received.length
    defaultTaskHost().deliverNotify({
      project, group: 'g', message: 'from-task', level: 'success', scope: 'all', broadcast: 'plugin',
      task: record({ project }),
    })
    await new Promise((r) => setTimeout(r, 0))
    assert.equal(received.length, before + 1, 'broadcast 发出去了')
    assert.equal(received.at(-1).message, 'from-task')

    // scope=origin 不广播
    defaultTaskHost().deliverNotify({
      project, group: 'g', message: 'origin-only', level: 'success', scope: 'origin', broadcast: 'plugin',
      task: record({ project, panelId: undefined }),
    })
    await new Promise((r) => setTimeout(r, 0))
    // notify 的 origin 判定基于 panelId；这里 panelId 缺省视为本页（发起页），所以会发。
    // 用非发起面板验证 origin 不广播：
    const before3 = received.length
    defaultTaskHost(() => 'panel-b').deliverNotify({
      project, group: 'g', message: 'origin-other', level: 'success', scope: 'origin', broadcast: 'plugin',
      task: record({ project, panelId: 'panel-a' }),
    })
    await new Promise((r) => setTimeout(r, 0))
    assert.equal(received.length, before3, '非发起面板的 origin notify 不广播')
    setDefaultTaskProject(undefined)
  } finally {
    off()
  }
})
