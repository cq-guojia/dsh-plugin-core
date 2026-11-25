import test from 'node:test'
import assert from 'node:assert/strict'
import { createCoordinator } from '../dist/adv/tasks/coordinator.js'
import { createTaskStore } from '../dist/adv/tasks/store.js'
import { createExecutorRegistry } from '../dist/runtime/index.js'
import { formatDisplayTitle } from '../dist/adv/tasks/index.js'

const title = (description) => ({ category: '任务', description })
const toast = (description, category = '完成') => ({ category, description })

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
    project: 'p', title: title('t'), kind: 'job',
    toast: { success: { title: toast('已好'), button: { id: 'v', text: '查看' } } },
    notify: { success: { message: 'done msg', broadcast: 'plugin' } },
  })
  assert.equal(task.state, 'running')
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(settled.length, 1)
  assert.equal(settled[0].outcome, 'done')
  assert.equal(toasts.length, 1)
  assert.equal(toasts[0].title, formatDisplayTitle(toast('已好')))
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
  const task = c.start({ project: 'p', title: title('t'), kind: 'job' })
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
  const task = c.start({ project: 'p', title: title('t'), kind: 'never' })
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
    project: 'p', title: title('t'), kind: 'job',
    toast: { failure: { title: toast('失败啦', '失败') } },
    notify: { failure: { message: 'fail msg' } },
  })
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(toasts[0].title, formatDisplayTitle(toast('失败啦', '失败')))
  assert.equal(notices[0].level, 'error')
})

test('coordinator：点按钮先切回发起面板再执行 handler', () => {
  const { c, store, panels } = setup()
  const task = store.upsert({
    id: 'x', project: 'p', group: 'g', title: title('t'), state: 'running', startedAt: 1,
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
  const task = store.upsert({ id: 'x', project: 'p', group: 'g', title: title('t'), state: 'running', startedAt: 1 }).task
  assert.equal(c.press('missing', task.id), false)
})

test('coordinator：startTask 自动记 panelId', () => {
  const { c } = setup()
  const task = c.start({ project: 'p', title: title('t'), kind: 'x' })
  assert.equal(task.panelId, 'panel-a')
})

test('coordinator：状态投影（基线/增量）不弹卡，只有 notice 弹一次', () => {
  const { c, store, toasts, notices } = setup()
  const terminal = {
    id: 'old-1', project: 'p', group: 'g', title: title('历史任务'),
    state: 'done', startedAt: 1000, settledAt: 2000,
    toast: { success: { title: toast('成功') } },
    notify: { success: { message: '成功' } },
  }
  // 状态回放（快照 / 增量）：进 store，但绝不弹
  c.project([terminal])
  c.project([terminal])
  assert.deepEqual(store.get('old-1')?.title, title('历史任务'))
  assert.equal(toasts.length, 0, '历史终态状态回放不弹 toast')
  assert.equal(notices.length, 0, '历史终态状态回放不弹 notify')
  // 只有一次性通知才弹，且单页内重复推同一条只弹一次
  c.deliverNotice({ id: 'n1', task: terminal })
  c.deliverNotice({ id: 'n1', task: terminal })
  assert.equal(toasts.length, 1, 'notice 弹一次')
  assert.equal(notices.length, 1)
})

test('coordinator：陈旧 notice 不覆盖新 running、不误弹结算（复查 F5）', () => {
  const { c, store, toasts, notices } = setup()
  const settled = []
  c.onSettled((s) => settled.push(s))
  // 同键先重跑：新 running（startedAt=300）已投影为当前存活行。
  const rerun = {
    id: 'srv', project: 'p', group: 'g', title: title('重跑'), key: 'k',
    state: 'running', startedAt: 300, settledAt: undefined,
  }
  c.project([rerun])
  assert.equal(store.get('srv').state, 'running')
  // 旧运行的迟到 notice（startedAt=100）到达：必须整条丢弃。
  const staleNotice = {
    id: 'n-stale', task: {
      id: 'srv', project: 'p', group: 'g', title: title('旧运行'), key: 'k',
      state: 'done', startedAt: 100, settledAt: 200,
      toast: { success: { title: toast('旧结算') } },
      notify: { success: { message: '旧通知' } },
    },
  }
  c.deliverNotice(staleNotice)
  assert.equal(store.get('srv').state, 'running', '旧 notice 不把新 running 盖回终态')
  assert.equal(store.get('srv').startedAt, 300, '运行身份未被旧 notice 改写')
  assert.equal(toasts.length, 0, '旧结算不误弹 toast')
  assert.equal(notices.length, 0, '旧结算不误弹 notify')
  assert.equal(settled.length, 0, '旧结算不触发 onSettled')

  // 当前运行的真 notice 正常到达：能覆盖并弹一次。
  c.deliverNotice({
    id: 'n-fresh', task: {
      ...rerun, state: 'done', settledAt: 400,
      toast: { success: { title: toast('新结算') } },
    },
  })
  assert.equal(store.get('srv').state, 'done', '新 notice 正常结算')
  assert.equal(toasts.length, 1, '新结算弹一次')
})

test('coordinator：乐观行归一后（id 永久带 submit: 前缀）重跑的陈旧 notice 仍被挡（复查 P0）', () => {
  const { c, store, toasts, notices } = setup()
  const settled = []
  c.onSettled((s) => settled.push(s))
  // 模拟 startTask 落的乐观行：id=submit:<key>，本地时钟很大。
  const optimisticId = 'submit:p\u0000k-opt'
  store.upsert({
    id: optimisticId, project: 'p', group: 'g', title: title('乐观'), key: 'k-opt',
    state: 'running', startedAt: 99999, settledAt: undefined,
  })
  // 真源 run1 running 归一到乐观 id（标记随之被清，id 前缀保留）。
  c.project([{
    id: 'srv-1', project: 'p', group: 'g', title: title('真源1'), key: 'k-opt',
    state: 'running', startedAt: 100, settledAt: undefined,
  }])
  assert.equal(store.get(optimisticId).startedAt, 100, '真源归一覆盖乐观本地时钟')
  c.deliverNotice({
    id: 'n-run1', task: {
      id: 'srv-1', project: 'p', group: 'g', title: title('真源1'), key: 'k-opt',
      state: 'done', startedAt: 100, settledAt: 150,
      toast: { success: { title: toast('run1') } },
    },
  })
  assert.equal(toasts.length, 1, 'run1 正常结算')

  // run2 重跑：新 running 归一到同一 submit: id，声明被复位。
  c.project([{
    id: 'srv-2', project: 'p', group: 'g', title: title('真源2'), key: 'k-opt',
    state: 'running', startedAt: 300, settledAt: undefined,
  }])
  assert.equal(store.get(optimisticId).state, 'running')
  assert.equal(store.get(optimisticId).startedAt, 300)
  // run1 的迟到 notice（新 id、startedAt=100）必须被挡——前缀短路修复前这里会误弹并翻状态。
  c.deliverNotice({
    id: 'n-run1-late', task: {
      id: 'srv-1', project: 'p', group: 'g', title: title('真源1'), key: 'k-opt',
      state: 'done', startedAt: 100, settledAt: 150,
      toast: { success: { title: toast('run1 迟到') } },
      notify: { success: { message: 'run1 迟到' } },
    },
  })
  assert.equal(store.get(optimisticId).state, 'running', '陈旧 notice 不翻转新 running（submit: id 不再短路守卫）')
  assert.equal(store.get(optimisticId).startedAt, 300, '运行身份不被改写')
  assert.equal(toasts.length, 1, '陈旧 notice 不误弹 toast')
  assert.equal(notices.length, 0, '陈旧 notice 不误弹 notify')
  assert.equal(settled.length, 1, '陈旧 notice 不触发 onSettled')
})

// 发起页未激活 → 暂存意图 + 切回，handler 重注册后补发（跨面板按钮的核心路径）。
test('coordinator：面板未激活时点按钮先暂存并切回，重注册后补发', async () => {
  const store = createTaskStore()
  const panels = []
  let active = 'panel-b'
  const host = {
    activePanelId: () => active,
    selectPanel: (id) => { panels.push(id); active = id },
  }
  const c = createCoordinator({ store, host })
  const task = store.upsert({
    id: 'defer-1', project: 'p', group: 'g', title: title('t'), state: 'done',
    startedAt: 1, settledAt: 2, panelId: 'panel-a',
  }).task
  let called = null
  assert.equal(c.press('open', task.id), true, '受理，不让 toast 误报失败')
  assert.equal(called, null, '此刻旧 handler 未执行')
  assert.deepEqual(panels, ['panel-a'], '已切回发起面板')
  c.registerHandlers({ open: (t) => { called = t.id } })
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(called, 'defer-1', '重注册后补发到新 handler')
})

// 宿主在会话页时 activePanelId 为 null（接线转成 undefined）：也算离开发起页。
test('coordinator：会话页点按钮（activePanelId 为 undefined）也暂存补发，不误报失效', async () => {
  const store = createTaskStore()
  const panels = []
  let active // undefined = 宿主会话页
  const c = createCoordinator({
    store,
    host: { activePanelId: () => active, selectPanel: (id) => { panels.push(id); active = id } },
  })
  const task = store.upsert({
    id: 'defer-conversation', project: 'p', group: 'g', title: title('t'), state: 'done',
    startedAt: 11, settledAt: 12, panelId: 'panel-a',
  }).task
  assert.equal(c.press('open', task.id), true, '会话页点击要受理，不能报"操作失效"')
  assert.deepEqual(panels, ['panel-a'], '切回发起面板')
  let called = null
  c.registerHandlers({ open: (t) => { called = t.id } })
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(called, 'defer-conversation', '发起页重注册后补发')
})

test('coordinator：双击同一按钮只补发一次', async () => {
  const store = createTaskStore()
  let active = 'panel-b'
  const c = createCoordinator({
    store,
    host: { activePanelId: () => active, selectPanel: () => {} },
  })
  const task = store.upsert({
    id: 'defer-2', project: 'p', group: 'g', title: title('t'), state: 'done',
    startedAt: 3, settledAt: 4, panelId: 'panel-a',
  }).task
  assert.equal(c.press('open', task.id), true)
  assert.equal(c.press('open', task.id), true)
  active = 'panel-a' // 发起页重挂完成
  let count = 0
  c.registerHandlers({ open: () => { count += 1 } })
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(count, 1, '同 key 覆盖写，只执行一次')
})

test('coordinator：面板已激活但无 handler 仍返回 false', async () => {
  const store = createTaskStore()
  const c = createCoordinator({
    store,
    host: { activePanelId: () => 'panel-a', selectPanel: () => {} },
  })
  const task = store.upsert({
    id: 'defer-3', project: 'p', group: 'g', title: title('t'), state: 'done',
    startedAt: 5, settledAt: 6, panelId: 'panel-a',
  }).task
  assert.equal(c.press('missing', task.id), false, '无可等待的重注册，诚实报错')
  await new Promise((r) => setTimeout(r, 0))
})

test('coordinator：错页注册不执行，意图保留到回到发起页再补发', async () => {
  const store = createTaskStore()
  let active = 'panel-b'
  const c = createCoordinator({
    store,
    host: { activePanelId: () => active, selectPanel: (id) => { active = id } },
  })
  const task = store.upsert({
    id: 'defer-4', project: 'p', group: 'g', title: title('t'), state: 'done',
    startedAt: 7, settledAt: 8, panelId: 'panel-a',
  }).task
  assert.equal(c.press('open', task.id), true)
  active = 'panel-c'
  let called = false
  c.registerHandlers({ open: () => { called = true } })
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(called, false, '错页不执行')
  active = 'panel-a'
  c.registerHandlers({ open: () => { called = true } })
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(called, true, '回到发起页仍补发，意图未被误删')
})

test('coordinator：handler 抛异常不冒泡，也不卡死后续补发', async () => {
  const store = createTaskStore()
  let active = 'panel-b'
  const c = createCoordinator({
    store,
    host: { activePanelId: () => active, selectPanel: (id) => { active = id } },
  })
  const task = store.upsert({
    id: 'defer-5', project: 'p', group: 'g', title: title('t'), state: 'done',
    startedAt: 9, settledAt: 10, panelId: 'panel-a',
  }).task
  assert.equal(c.press('open', task.id), true)
  let threw = false
  try {
    c.registerHandlers({ open: () => { throw new Error('boom') } })
    await new Promise((r) => setTimeout(r, 0))
  } catch {
    threw = true
  }
  assert.equal(threw, false, '异常被 safeCall 吞掉')
})
