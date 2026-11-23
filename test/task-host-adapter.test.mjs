import test from 'node:test'
import assert from 'node:assert/strict'
import { connectTaskCenter, defaultTaskHost } from '../dist/adv/tasks/api.js'
import { subscribeToasts } from '../dist/ui/feedback/toast-queue.js'

const title = (description) => ({ category: '任务', description })
const doneTitle = { category: '完成', description: '完成' }

function record(over = {}) {
  // 终态夹具带合法 settledAt：projectTasks 按新契约（终态必带结算时刻）校验，缺了会被拒收。
  return { id: 'a', project: 'p', group: 'g', title: title('t'), state: 'done', startedAt: 1, settledAt: 2, ...over }
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

test('默认宿主：toast 按钮照画不隐藏，没 handler 点了给 i18n 提示（与 TaskBar 同口径）', async () => {
  const { mountTaskUI, projectTasks, taskCenterStore, defaultTaskHost: hostFn } = await import('../dist/adv/tasks/index.js')
  const { setLocale, t } = await import('../dist/utils/i18n.js')
  taskCenterStore.clearAll()
  const got = []
  const off = subscribeToasts((p) => got.push(p))
  try {
    let clicked = 0
    const offUi = mountTaskUI({ project: 'p', handlers: { view: () => { clicked += 1 } } })
    // 真实链路里 startTask / deliverNotice 先把记录投影进 store，按钮才点得到。
    projectTasks([record({ panelId: 'panel-b' })])
    const host = hostFn(() => 'panel-b')
    host.deliverToast({
      title: '完成', scope: 'all', buttonId: 'view', buttonText: '查看',
      task: record({ panelId: 'panel-b' }),
    })
    assert.equal(got[0].actions.length, 1, '注册了 handler，按钮出现')
    got[0].actions[0].onClick()
    assert.equal(clicked, 1, '有 handler 点了执行，不给失败提示')
    assert.equal(got.length, 1, '有 handler 不多弹提示')

    offUi()
    got.length = 0
    host.deliverToast({
      title: '完成', scope: 'all', buttonId: 'missing', buttonText: '查看',
      task: record({ panelId: 'panel-b' }),
    })
    assert.equal(got[0].actions.length, 1, '没注册 handler 按钮也照画，不隐藏')
    got[0].actions[0].onClick()
    assert.equal(got.length, 2, '没 handler 点了弹一次失败提示')
    assert.equal(got[1].message, t('taskbarActionFailed'), '失败提示走 i18n 文案')
    setLocale('en')
    got.length = 0
    host.deliverToast({
      title: 'done', scope: 'all', buttonId: 'missing', buttonText: 'view',
      task: record({ panelId: 'panel-b' }),
    })
    got[0].actions[0].onClick()
    assert.equal(got[1].message, t('taskbarActionFailed'), '切到英文后提示跟随语言')
    assert.notEqual(got[1].message, '这条任务的操作已失效，可能是发起它的页面已刷新或关闭', '英文不是中文文案')
    setLocale(null)
    taskCenterStore.clearAll()
  } finally {
    setLocale(null)
    off()
  }
})

test('默认宿主：所有页都画 Toast 按钮，scope 只管卡片弹不弹', () => {
  const got = []
  const off = subscribeToasts((p) => got.push(p))
  try {
    const host = defaultTaskHost(() => 'tab-origin')
    const common = { title: '完成', scope: 'all', buttonId: 'view', buttonText: '查看' }
    // 发起页：卡片 + 按钮
    host.deliverToast({ ...common, task: record({ origin: 'tab-origin' }) })
    assert.equal(got.length, 1)
    assert.equal(got[0].actions.length, 1, '发起页画按钮')
    // 别的标签页：卡片照弹、按钮也照画（用户拍板：所有页显示按钮，点击跳回发起页）
    host.deliverToast({ ...common, task: record({ origin: 'tab-other' }) })
    assert.equal(got.length, 2, 'scope:all 跨页卡片照弹')
    assert.equal(got[1].actions.length, 1, '非发起页也画按钮')
    // scope:origin 非发起页：连卡都不弹，自然没按钮
    host.deliverToast({ ...common, scope: 'origin', task: record({ origin: 'tab-other' }) })
    assert.equal(got.length, 2, 'scope:origin 非发起页不弹卡')
    // origin 缺失 fail-open：照弹照画
    host.deliverToast({ ...common, task: record() })
    assert.equal(got[2].actions.length, 1, '缺 origin fail-open 照画按钮')
  } finally {
    off()
  }
})

test('defaultTaskHost：注入的 originId 就是 scope:origin 归属判定来源', () => {
  const got = []
  const off = subscribeToasts((p) => got.push(p))
  try {
    const host = defaultTaskHost(() => 'custom-tab')
    host.deliverToast({ title: 'x', scope: 'origin', task: record({ origin: 'custom-tab' }) })
    assert.equal(got.length, 1, '同源时 scope:origin 卡片照弹')
    host.deliverToast({ title: 'y', scope: 'origin', task: record({ origin: 'other-tab' }) })
    assert.equal(got.length, 1, '异页时 scope:origin 不弹')
  } finally {
    off()
  }
})

test('connectTaskCenter：重复接线注入不同 originId，默认 toast 归属跟随最新来源（不残留首次闭包）', async () => {
  const { connectTaskCenter, startTask, taskCenterStore } = await import('../dist/adv/tasks/index.js')
  const { executors } = await import('../dist/runtime/index.js')
  const got = []
  const off = subscribeToasts((p) => got.push(p))
  const unregister = executors.register('origin-follow-test', () => ({ outcome: 'done' }))
  taskCenterStore.clearAll()
  let offA = () => {}, offB = () => {}
  try {
    // 首次接线注入 tab-a 并装上默认 toast 层；其闭包应动态读取 stableHost.originId，
    // 而不是把 tab-a 固定下来。
    offA = connectTaskCenter({ originId: () => 'tab-a' })
    // 二次接线换成 tab-b，默认 toast 层不会重建，但归属判定必须跟随最新 originId。
    offB = connectTaskCenter({ originId: () => 'tab-b' })
    const task = await startTask({
      title: title('origin 跟随'), project: 'p', kind: 'origin-follow-test',
      toast: { success: { title: doneTitle, scope: 'origin' } },
    })
    assert.equal(task.origin, 'tab-b', 'startTask 记的是最新注入的 originId')
    await new Promise((r) => setTimeout(r, 10))
    assert.equal(got.length, 1, '默认 toast 判归属也用最新 originId ⇒ 发起页弹卡')
  } finally {
    off(); unregister(); offA(); offB(); taskCenterStore.clearAll()
  }
})

test('connectTaskCenter：onGiveUp 透传到 SSE 流，401 上报且 permanent', async () => {
  const { connectTaskCenter, taskCenterStore } = await import('../dist/adv/tasks/index.js')
  const originalFetch = globalThis.fetch
  const gave = []
  let off = () => {}
  try {
    globalThis.fetch = async () => ({ ok: false, status: 401, body: null })
    off = connectTaskCenter({
      streamUrl: '/stream',
      onGiveUp: (r) => gave.push(r),
    })
    await new Promise((r) => setTimeout(r, 60))
    assert.equal(gave.length, 1, '默认接线收到 401 放弃信号（旧实现 onGiveUp 未透传，恒为 0）')
    assert.equal(gave[0].status, 401)
    assert.equal(gave[0].permanent, true, '401 标记为不可重试')
  } finally {
    globalThis.fetch = originalFetch
    off()
    taskCenterStore.clearAll()
  }
})

test('connectTaskCenter Node 直连：onGiveUp 内同步重接不被提前冷却吞掉（专家评判 B-1）', async () => {
  const { connectTaskCenter, taskCenterStore } = await import('../dist/adv/tasks/index.js')
  const originalFetch = globalThis.fetch
  let calls = 0
  globalThis.fetch = async (_url, init) => {
    calls += 1
    // 头两次 401 后消费方在回调里同步重接；第三次起凭证刷新成功，挂起真流。
    if (calls <= 2) return { ok: false, status: 401, body: null }
    return {
      ok: true,
      body: { getReader: () => ({
        read: () => new Promise((resolve) => {
          if (init?.signal?.aborted) { resolve({ done: true }); return }
          init?.signal?.addEventListener('abort', () => resolve({ done: true }), { once: true })
        }),
        cancel() {},
      }) },
    }
  }
  const disposers = []
  try {
    const connect = () => disposers.push(connectTaskCenter({
      streamUrl: '/stream-node-401-callback',
      onGiveUp: () => { connect() },  // 回调里刷新凭证并同步重接（走 resume）
    }))
    connect()
    await new Promise((r) => setTimeout(r, 150))
    // 修复前：第一次 401 就把 streak 记成 1，回调重连的第二次 401 在回调前被记成 2，
    // 第二次回调里的 resume 被冷却吞掉 → 只有 2 次请求、Node 永久停机。
    assert.equal(calls, 3, '回调内重接两次都放通：计数在回调之后，第二次不被冷却吞掉')
  } finally {
    while (disposers.length) disposers.pop()()
    globalThis.fetch = originalFetch
    taskCenterStore.clearAll()
  }
})

test('startTask 服务端模式：panelId 与 origin 随 payload 提交、乐观行带上', async () => {
  const { connectTaskCenter, startTask, taskCenterStore } = await import('../dist/adv/tasks/index.js')
  const originalFetch = globalThis.fetch
  let sent
  let off = () => {}
  try {
    globalThis.fetch = async (_url, init) => {
      sent = JSON.parse(init.body)
      return { ok: true, json: async () => ({ id: 'srv-1' }) }
    }
    off = connectTaskCenter({ submitUrl: '/submit', activePanelId: () => 'panel-x', originId: () => 'tab-z' })
    const t = await startTask({ title: title('服务端任务'), project: 'p', kind: 'demo' })
    assert.equal(sent.panelId, 'panel-x', 'panelId 随提交发出供服务端回填')
    assert.equal(sent.origin, 'tab-z', 'origin 随提交发出')
    assert.equal(typeof sent.key, 'string', '核心生成 key 随 payload 提交')
    assert.equal(t.panelId, 'panel-x', '乐观行带上 panelId，SSE 到达前也能切回面板')
    assert.equal(t.origin, 'tab-z', '乐观行带上 origin')
    assert.equal(t.key, sent.key, '乐观行 key 与提交 key 一致')
  } finally {
    globalThis.fetch = originalFetch
    off()
    taskCenterStore.clearAll()
  }
})

test('startTask 服务端模式：SSE 终态先于响应到达时，乐观行不把终态覆回 running', async () => {
  const { connectTaskCenter, startTask, projectTasks, taskCenterStore } = await import('../dist/adv/tasks/index.js')
  const originalFetch = globalThis.fetch
  let off = () => {}
  try {
    off = connectTaskCenter({ submitUrl: '/submit' })
    globalThis.fetch = async (_url, init) => {
      const payload = JSON.parse(init.body)
      // 服务端在 HTTP 响应前就完成：模拟 SSE 终态先于响应到达（按 key 归一）。
      projectTasks([{
        id: 'srv-done', key: payload.key, project: 'p', group: 'g', title: title('服务端任务'),
        state: 'done', startedAt: 1, settledAt: 99,
      }])
      return { ok: true, json: async () => ({ id: 'srv-done' }) }
    }
    const optimistic = await startTask({ title: title('服务端任务'), project: 'p', group: 'g', key: 'k-race', kind: 'demo' })
    const rows = taskCenterStore.select('p')
    assert.equal(rows.length, 1, '乐观行与真源终态归一成一行，不堆两条')
    assert.equal(rows[0].id, optimistic.id, '真源按 key 归一后存活 id 仍是 startTask 返回的乐观 id')
    assert.equal(rows[0].key, 'k-race', 'key 归一后保留')
    assert.equal(rows[0].state, 'done', '终态不被晚到的乐观行覆回 running')
    assert.equal(rows[0].settledAt, 99, '权威结算时刻保留')
  } finally {
    globalThis.fetch = originalFetch
    off()
    taskCenterStore.clearAll()
  }
})

test('startTask 服务端模式：提交失败回滚乐观行，不留幽灵 running', async () => {
  const { connectTaskCenter, startTask, taskCenterStore } = await import('../dist/adv/tasks/index.js')
  const originalFetch = globalThis.fetch
  let off = () => {}
  try {
    off = connectTaskCenter({ submitUrl: '/submit' })
    globalThis.fetch = async () => { throw new Error('network down') }
    await assert.rejects(() => startTask({ title: title('失败任务'), project: 'p', group: 'g', key: 'k-fail', kind: 'demo' }), /network down/)
    assert.equal(taskCenterStore.select('p').length, 0, '提交失败后乐观行被回滚，列表无残留')
  } finally {
    globalThis.fetch = originalFetch
    off()
    taskCenterStore.clearAll()
  }
})

test('startTask 服务端模式：省略 project/group 时提交体带核心补齐的缺省值，归一不留幽灵行', async () => {
  const { connectTaskCenter, startTask, projectTasks, taskCenterStore } = await import('../dist/adv/tasks/index.js')
  const originalFetch = globalThis.fetch
  let sent
  let off = () => {}
  try {
    off = connectTaskCenter({ submitUrl: '/submit' })
    globalThis.fetch = async (_url, init) => {
      sent = JSON.parse(init.body)
      // 服务端按自身缺省回显（同 demo 口径）：提交体没带 project 时会与乐观行失配。
      projectTasks([{
        id: 'srv-done', key: sent.key,
        project: sent.project ?? 'dsh-plugin-core-demo',
        group: sent.group ?? 'demo-jobs',
        title: title('缺省字段任务'), state: 'done', startedAt: 1, settledAt: 99,
      }])
      return { ok: true, json: async () => ({ id: 'srv-done' }) }
    }
    const optimistic = await startTask({ title: title('缺省字段任务'), key: 'k-default', kind: 'demo' })
    assert.equal(sent.project, 'default', '提交体带上核心补齐的 project 缺省值')
    assert.equal(sent.group, 'default', '提交体带上核心补齐的 group 缺省值')
    assert.equal(optimistic.project, sent.project, '乐观行 project 与提交体一致')
    assert.equal(optimistic.group, sent.group, '乐观行 group 与提交体一致')
    const rows = taskCenterStore.select('default')
    assert.equal(rows.length, 1, '同 (project,key) 归一成一行，不留幽灵 running')
    assert.equal(rows[0].state, 'done', '终态归一覆盖乐观行')
    assert.equal(rows[0].id, optimistic.id, '存活 id 仍是乐观 id')
  } finally {
    globalThis.fetch = originalFetch
    off()
    taskCenterStore.clearAll()
  }
})

test('mountTaskUI：onSettled 按 project/groups 过滤（与列表 select 同口径）', async () => {
  const { mountTaskUI, taskCenterStore } = await import('../dist/adv/tasks/index.js')
  taskCenterStore.clearAll()
  const got = []
  const off = mountTaskUI({
    project: 'p', groups: ['g1'], handlers: {},
    onSettled: (task) => got.push(task.id),
  })
  try {
    const mk = (id, project, group) => ({ id, project, group, title: title('t'), state: 'done', startedAt: 1 })
    taskCenterStore.emitSettled({ outcome: 'done', task: mk('match', 'p', 'g1') })
    taskCenterStore.emitSettled({ outcome: 'done', task: mk('other-project', 'q', 'g1') })
    taskCenterStore.emitSettled({ outcome: 'done', task: mk('other-group', 'p', 'g2') })
    taskCenterStore.emitSettled({ outcome: 'done', task: mk('no-project', undefined, 'g1') })
    assert.deepEqual(got, ['match'], '只收本项目本分组的终态')
  } finally {
    off()
    taskCenterStore.clearAll()
  }
})

test('mountTaskUI：onSettled 不传 project/groups 时收全部项目', async () => {
  const { mountTaskUI, taskCenterStore } = await import('../dist/adv/tasks/index.js')
  taskCenterStore.clearAll()
  const got = []
  const off = mountTaskUI({ handlers: {}, onSettled: (task) => got.push(task.id) })
  try {
    taskCenterStore.emitSettled({ outcome: 'done', task: { id: 'a', project: 'p', group: 'g', title: title('t'), state: 'done', startedAt: 1 } })
    taskCenterStore.emitSettled({ outcome: 'done', task: { id: 'b', project: 'q', group: 'g', title: title('t'), state: 'done', startedAt: 1 } })
    assert.deepEqual(got, ['a', 'b'], '不过滤时收全部')
  } finally {
    off()
    taskCenterStore.clearAll()
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
