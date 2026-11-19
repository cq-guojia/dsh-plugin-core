import test from 'node:test'
import assert from 'node:assert/strict'
import { createCoordinator } from '../dist/adv/tasks/coordinator.js'
import { createTaskStore } from '../dist/adv/tasks/store.js'
import { createExecutorRegistry } from '../dist/runtime/index.js'

function setup() {
  const store = createTaskStore()
  const registry = createExecutorRegistry()
  const toasts = []
  const notices = []
  const panels = []
  let activePanel = 'panel-a'
  const host = {
    activePanelId: () => activePanel,
    selectPanel: (id) => { panels.push(id); activePanel = id },
    deliverToast: (p) => toasts.push(p),
    deliverNotify: (p) => notices.push(p),
  }
  const c = createCoordinator({ store, registry, host })
  return { c, store, registry, toasts, notices, panels }
}

test('coordinator：登记→执行成功→终态 toast/notify/onSettled 各一次', async () => {
  const { c, registry, toasts, notices } = setup()
  const settled = []
  c.onSettled((s) => settled.push(s))
  registry.register('job', () => ({ outcome: 'done' }))
  const task = c.start({
    project: 'p', title: 't', kind: 'job',
    toast: { success: { title: '已好', button: { id: 'v', text: '查看' } } },
    notify: { success: { message: 'done msg', broadcast: 'plugin' } },
  })
  assert.equal(task.state, 'running')
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(settled.length, 1)
  assert.equal(settled[0].outcome, 'done')
  assert.equal(toasts.length, 1)
  assert.equal(toasts[0].title, '已好')
  assert.equal(toasts[0].buttonId, 'v')
  assert.equal(notices.length, 1)
  assert.equal(notices[0].broadcast, 'plugin')
  assert.equal(notices[0].level, 'success')
})

test('coordinator：执行器 report 的进度落到显式字段', async () => {
  const { c, registry, store } = setup()
  registry.register('job', (_args, ctx) => {
    ctx.report({ message: '处理到第 1 步', current: 1, total: 2 })
    return { outcome: 'done' }
  })
  const task = c.start({ project: 'p', title: 't', kind: 'job' })
  await new Promise((r) => setTimeout(r, 0))
  const after = store.get(task.id)
  assert.equal(after.progress.message, '处理到第 1 步')
  assert.equal(after.progress.current, 1)
  assert.equal(typeof after.progress.updatedAt, 'number')
})

test('coordinator：执行器未注册→失败终态，带原因', async () => {
  const { c, store } = setup()
  const settled = []
  c.onSettled((s) => settled.push(s))
  const task = c.start({ project: 'p', title: 't', kind: 'never' })
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(store.get(task.id).state, 'failed')
  assert.match(store.get(task.id).reason, /not registered/)
  assert.equal(settled.length, 1)
  assert.equal(settled[0].outcome, 'failed')
})

test('coordinator：失败执行器走 failure 配置、error 级别', async () => {
  const { c, registry, toasts, notices } = setup()
  registry.register('job', () => ({ outcome: 'failed', reason: 'boom' }))
  c.start({
    project: 'p', title: 't', kind: 'job',
    toast: { failure: { title: '失败啦' } },
    notify: { failure: { message: 'fail msg' } },
  })
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(toasts[0].title, '失败啦')
  assert.equal(notices[0].level, 'error')
})

test('coordinator：点按钮先切回发起面板再执行 handler', () => {
  const { c, store, panels } = setup()
  const task = store.upsert({
    id: 'x', project: 'p', group: 'g', title: 't', state: 'running', startedAt: 1,
    panelId: 'panel-a', rowButtons: [{ id: 'open', text: '查看' }],
  }).task
  let called = null
  c.registerHandlers({ open: (t) => { called = t.id } })
  const ok = c.press('open', task.id)
  assert.equal(ok, true)
  assert.equal(called, 'x')
  assert.deepEqual(panels, ['panel-a'])
})

test('coordinator：没注册 handler 的按钮点了返回 false，不执行', () => {
  const { c, store } = setup()
  const task = store.upsert({ id: 'x', project: 'p', group: 'g', title: 't', state: 'running', startedAt: 1 }).task
  assert.equal(c.press('missing', task.id), false)
})

test('coordinator：startTask 自动记 panelId', () => {
  const { c } = setup()
  const task = c.start({ project: 'p', title: 't', kind: 'x' })
  assert.equal(task.panelId, 'panel-a')
})

test('coordinator：状态投影（基线/增量）不弹卡，只有 notice 弹一次', () => {
  const { c, store, toasts, notices } = setup()
  const terminal = {
    id: 'old-1', project: 'p', group: 'g', title: '历史任务',
    state: 'done', startedAt: 1000, settledAt: 2000,
    toast: { success: { title: '成功' } },
    notify: { success: { message: '成功' } },
  }
  // 状态回放（快照 / 增量）：进 store，但绝不弹
  c.project([terminal])
  c.project([terminal])
  assert.equal(store.get('old-1')?.title, '历史任务')
  assert.equal(toasts.length, 0, '历史终态状态回放不弹 toast')
  assert.equal(notices.length, 0, '历史终态状态回放不弹 notify')
  // 只有一次性通知才弹，且单页内重复推同一条只弹一次
  c.deliverNotice({ id: 'n1', task: terminal })
  c.deliverNotice({ id: 'n1', task: terminal })
  assert.equal(toasts.length, 1, 'notice 弹一次')
  assert.equal(notices.length, 1)
})
