import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import {
  TASK_NOTIFICATIONS_EVENTS_KEY,
  TASK_NOTIFICATIONS_KEY,
  TASK_NOTIFICATIONS_LOCK_PREFIX,
  TASK_NOTIFICATIONS_PROTOCOL,
  taskNotificationEvents,
  taskNotifications,
  claimTaskNotificationEvents,
  claimTaskNotifications,
  createTaskNotificationEventBus,
  createTaskNotificationPool,
  getDefaultTaskProject,
  notifyMessage,
  notifyTask,
  selectTaskNotifications,
  setDefaultTaskProject,
  subscribeTaskNotificationEvents,
} from '../dist/ui/index.js'

/** 每条用例的默认项目：绝大多数用例只关心二级分组，项目用同一个就够。 */
const TEST_PROJECT = 'test-project'

beforeEach(() => {
  setDefaultTaskProject(TEST_PROJECT)
})

/** 等异步 BroadcastChannel 消息落地；只用于测试等待，库本身不轮询。 */
async function waitFor(predicate, label, timeoutMs = 2000) {
  const until = Date.now() + timeoutMs
  while (!predicate()) {
    if (Date.now() > until) throw new Error(`timeout: ${label}`)
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}

let channelSeq = 0
function testChannel() {
  channelSeq += 1
  return `dsh-plugin-core-test/task-notifications/${String(process.pid)}-${String(channelSeq)}`
}

function makePool(channelName, extra = {}) {
  return createTaskNotificationPool({
    channelName,
    events: createTaskNotificationEventBus(),
    lifecycle: false,
    ...extra,
  })
}

/** 一条合法的跨页任务记录（纯数据，不带函数 / 组件）。 */
function wireTask(origin, id, group = 'plugin-a', project = TEST_PROJECT) {
  return {
    id,
    project,
    group,
    title: 'remote task',
    status: 'running',
    startedAt: 1000,
    updatedAt: 1000,
    origin,
    backgrounded: false,
  }
}

test('全局单例：多副本 claim 只建一次，且键是 Symbol.for 全局符号', () => {
  const g = globalThis
  const originalPool = g[TASK_NOTIFICATIONS_KEY]
  const originalBus = g[TASK_NOTIFICATIONS_EVENTS_KEY]
  delete g[TASK_NOTIFICATIONS_KEY]
  delete g[TASK_NOTIFICATIONS_EVENTS_KEY]
  try {
    let created = 0
    const a = claimTaskNotifications(() => {
      created += 1
      return createTaskNotificationPool({ offline: true })
    })
    const b = claimTaskNotifications(() => {
      created += 1
      return createTaskNotificationPool({ offline: true })
    })
    assert.equal(created, 1)
    assert.equal(a, b)
    assert.equal(a.protocol, TASK_NOTIFICATIONS_PROTOCOL)

    let busCreated = 0
    const busA = claimTaskNotificationEvents(() => {
      busCreated += 1
      return createTaskNotificationEventBus()
    })
    const busB = claimTaskNotificationEvents(() => {
      busCreated += 1
      return createTaskNotificationEventBus()
    })
    assert.equal(busCreated, 1)
    assert.equal(busA, busB)
    assert.equal(TASK_NOTIFICATIONS_KEY, Symbol.for('dsh-plugin-core/task-notifications/v2'))
  } finally {
    g[TASK_NOTIFICATIONS_KEY] = originalPool
    g[TASK_NOTIFICATIONS_EVENTS_KEY] = originalBus
  }
})

test('形状不符的全局宿主直接拒绝，不静默复用', () => {
  const g = globalThis
  const original = g[TASK_NOTIFICATIONS_KEY]
  g[TASK_NOTIFICATIONS_KEY] = { protocol: 999, getSnapshot: () => ({}) }
  try {
    assert.throws(() => claimTaskNotifications(() => createTaskNotificationPool({ offline: true })), /Incompatible/)
  } finally {
    g[TASK_NOTIFICATIONS_KEY] = original
  }
})

test('getServerSnapshot 是稳定空快照；import 期不碰 DOM，SSR 不炸', () => {
  const pool = makePool(testChannel(), { offline: true })
  try {
    assert.equal(pool.getServerSnapshot(), pool.getServerSnapshot())
    assert.deepEqual(pool.getServerSnapshot().tasks, [])
    assert.equal(taskNotifications.getServerSnapshot(), taskNotifications.getServerSnapshot())
    assert.equal(typeof taskNotificationEvents.emit, 'function')
  } finally {
    pool.dispose()
  }
})

test('快照引用稳定：无变化不换引用，变化才换；派生缓存按 snapshot 复用', () => {
  const pool = makePool(testChannel(), { offline: true })
  try {
    const before = pool.getSnapshot()
    assert.equal(pool.getSnapshot(), before)
    const all = selectTaskNotifications(before)
    assert.equal(selectTaskNotifications(before), all, '同快照同过滤必须返回同一数组')
    assert.equal(pool.select(), all)

    const a = pool.register({ group: 'plugin-a', title: 'A' })
    const b = pool.register({ group: 'plugin-b', title: 'B' })
    const after = pool.getSnapshot()
    assert.notEqual(after, before)
    assert.equal(after.tasks.length, 2)
    assert.equal(after.revision, 2)

    const onlyA = pool.select(['plugin-a'])
    assert.deepEqual(onlyA.map((t) => t.group), ['plugin-a'])
    assert.equal(pool.select(['plugin-a']), onlyA)
    assert.equal(pool.select([]).length, 2, '不传 / 空数组 = 本项目全部二级')
    assert.equal(pool.select(['plugin-a', 'plugin-b']).length, 2)
    assert.equal(pool.select(['plugin-a', 'plugin-b']).length, 2)
    assert.equal(pool.select(['plugin-c']).length, 0)

    a.done()
    b.fail('boom')
  } finally {
    pool.dispose()
  }
})

test('结束句柄幂等：done / fail 后条目消失，重复调用不再发通知', async () => {
  const bus = createTaskNotificationEventBus()
  const pool = makePool(testChannel(), { offline: true, events: bus })
  const notices = []
  bus.subscribe((event) => { notices.push(event) })
  try {
    const seen = []
    const offLocal = pool.subscribe(() => { seen.push(pool.getSnapshot().tasks.length) })
    const handle = pool.register({ group: 'g', title: 'T' })
    handle.done('finished')
    const settlement = await handle.settled
    assert.equal(settlement.outcome, 'done')
    assert.equal(settlement.task.status, 'done')
    assert.equal(settlement.task.detail, 'finished')
    assert.equal(pool.getSnapshot().tasks.length, 0)
    assert.equal(handle.isSettled, true)
    const count = seen.length
    handle.done()
    handle.fail('late')
    assert.equal(seen.length, count, '重复结束不应再推快照')
    assert.equal(notices.filter((e) => e.type === 'settled').length, 1)

    const handle2 = pool.register({ group: 'g', title: 'T2' })
    handle2.fail('boom')
    const failed = await handle2.settled
    assert.equal(failed.outcome, 'failed')
    assert.equal(failed.reason, 'boom')
    assert.equal(pool.getSnapshot().tasks.length, 0)
    offLocal()
  } finally {
    pool.dispose()
  }
})

test('track(promise)：成功与 reject 都走同一收尾（不留幽灵条目）', async () => {
  const pool = makePool(testChannel(), { offline: true })
  try {
    const ok = pool.register({ group: 'g', title: 'ok' })
    const okResult = await ok.track(Promise.resolve(42))
    assert.equal(okResult, 42)
    assert.equal((await ok.settled).outcome, 'done')

    const bad = pool.register({ group: 'g', title: 'bad' })
    const badPromise = Promise.reject(new Error('network down'))
    assert.equal(bad.track(badPromise), badPromise, '返回原 promise，不改变调用方语义')
    await assert.rejects(badPromise, /network down/)
    const settlement = await bad.settled
    assert.equal(settlement.outcome, 'failed')
    assert.equal(settlement.reason, 'network down')
    assert.equal(pool.getSnapshot().tasks.length, 0)
  } finally {
    pool.dispose()
  }
})

test('事件总线：注册 / 更新 / 收起 / 结束四类通知都带真实条目', () => {
  const bus = createTaskNotificationEventBus()
  const pool = makePool(testChannel(), { offline: true, events: bus })
  try {
    const seen = []
    const off = bus.subscribe((event) => { seen.push(event) })
    const handle = pool.register({ group: 'g', title: 'T' })
    handle.update({ title: 'T2' })
    handle.background()
    handle.done()
    off()
    assert.deepEqual(seen.map((e) => e.type), ['registered', 'updated', 'backgrounded', 'settled'])
    assert.equal(seen[0].remote, false)
    assert.equal(seen[1].task.title, 'T2')
    assert.equal(seen[2].task.backgrounded, true)
    assert.equal(seen[3].outcome, 'done')
    assert.equal(seen[3].task.status, 'done')
    assert.equal(seen[3].task.id, handle.id)
  } finally {
    pool.dispose()
  }
})

test('事件总线：单个消费端抛错不阻断别的消费端', () => {
  const bus = createTaskNotificationEventBus()
  const original = console.error
  console.error = () => {}
  try {
    let reached = 0
    bus.subscribe(() => { throw new Error('broken consumer') })
    bus.subscribe(() => { reached += 1 })
    bus.emit({ type: 'restored', taskId: 'x', remote: false })
    assert.equal(reached, 1)
  } finally {
    console.error = original
  }
})

test('跨页：A 注册后 B 立即看到；条目带真实 origin，跨页点开返回 false', async () => {
  const channelName = testChannel()
  const a = makePool(channelName, { origin: 'page-a' })
  const b = makePool(channelName, { origin: 'page-b' })
  try {
    a.connect()
    b.connect()
    const handle = a.register({ group: 'plugin-a', title: 'long job', detail: 'real data' })
    await waitFor(() => b.getSnapshot().tasks.length === 1, 'B 看到 A 的任务')

    const remote = b.getSnapshot().tasks[0]
    assert.equal(remote.origin, 'page-a')
    assert.equal(remote.title, 'long job')
    assert.equal(remote.detail, 'real data')
    assert.equal(b.canRestore(remote), false)
    assert.equal(b.requestRestore(remote.id), false)
    assert.equal(a.canRestore(remote), true)

    handle.done('all good')
    await waitFor(() => b.getSnapshot().tasks.length === 0, 'B 看到任务结束消失')
    const settlement = await handle.settled
    assert.equal(settlement.outcome, 'done')
    assert.equal(settlement.task.status, 'done')
  } finally {
    a.dispose()
    b.dispose()
  }
})

test('跨页 baseline：后开的 C 发 hello 即拿到全量，不需要历史事件', async () => {
  const channelName = testChannel()
  const a = makePool(channelName, { origin: 'page-a' })
  const b = makePool(channelName, { origin: 'page-b' })
  try {
    a.connect()
    b.connect()
    a.register({ group: 'plugin-a', title: 'job-1' })
    a.register({ group: 'plugin-a', title: 'job-2' })
    b.register({ group: 'plugin-b', title: 'job-3' })
    await waitFor(() => a.getSnapshot().tasks.length === 3, 'A 收齐 B 的分片')

    // C 从未收到过上述任何通知，只靠 hello / 全量分片回复补齐。
    const c = makePool(channelName, { origin: 'page-c' })
    try {
      c.connect()
      await waitFor(() => c.getSnapshot().tasks.length === 3, 'C 读到全量 baseline')
      assert.deepEqual(c.getSnapshot().tasks.map((t) => t.title).sort(), ['job-1', 'job-2', 'job-3'])
      assert.equal(c.select(['plugin-b']).length, 1)
    } finally {
      c.dispose()
    }
  } finally {
    a.dispose()
    b.dispose()
  }
})

test('跨页乱序 / 重复 / 畸形消息：旧 seq 不覆盖新状态，坏数据不进池', async () => {
  const channelName = testChannel()
  const a = makePool(channelName, { origin: 'page-a' })
  const sender = new BroadcastChannel(channelName)
  sender.unref?.()
  try {
    a.connect()
    const fresh = wireTask('page-x', 'x1')
    sender.postMessage({ kind: 'shard', origin: 'page-x', seq: 5, tasks: [fresh] })
    await waitFor(() => a.getSnapshot().tasks.length === 1, '收到 seq=5')

    const stale = wireTask('page-x', 'x1')
    stale.title = 'stale'
    sender.postMessage({ kind: 'shard', origin: 'page-x', seq: 4, tasks: [stale] })
    sender.postMessage({ kind: 'shard', origin: 'page-x', seq: 5, tasks: [stale] })
    sender.postMessage({ kind: 'shard', origin: 'page-x', seq: 6, tasks: [{ id: 'bad' }] })
    sender.postMessage({ kind: 'unknown', origin: 'page-x' })
    await new Promise((resolve) => setTimeout(resolve, 60))
    assert.equal(a.getSnapshot().tasks.length, 1)
    assert.equal(a.getSnapshot().tasks[0].title, 'remote task', '旧 seq / 畸形消息都没污染池')

    sender.postMessage({ kind: 'bye', origin: 'page-x', seq: 3 })
    await new Promise((resolve) => setTimeout(resolve, 40))
    assert.equal(a.getSnapshot().tasks.length, 1, '迟到的旧 bye 不能删掉已更新的分片')

    sender.postMessage({ kind: 'bye', origin: 'page-x', seq: 7 })
    await waitFor(() => a.getSnapshot().tasks.length === 0, 'peer 离开后条目移除')
  } finally {
    sender.close()
    a.dispose()
  }
})

test('休眠恢复：pagehide 删掉的分片在 pageshow 后能重新广播回来', async () => {
  const channelName = testChannel()
  const win = new EventTarget()
  const doc = new EventTarget()
  doc.visibilityState = 'visible'
  const g = globalThis
  const hadWindow = Object.hasOwn(g, 'window')
  const hadDoc = Object.hasOwn(g, 'document')
  const oldWindow = g.window
  const oldDoc = g.document
  g.window = win
  g.document = doc
  const a = makePool(channelName, { origin: 'page-a', lifecycle: true })
  const b = makePool(channelName, { origin: 'page-b', lifecycle: false })
  try {
    a.connect()
    b.connect()
    a.register({ group: 'g', title: 'survives-bfcache' })
    await waitFor(() => b.getSnapshot().tasks.length === 1, 'B 先看到 A 的任务')

    win.dispatchEvent(new Event('pagehide'))
    await waitFor(() => b.getSnapshot().tasks.length === 0, 'pagehide 后 B 移除 A 的分片')

    win.dispatchEvent(new Event('pageshow'))
    await waitFor(() => b.getSnapshot().tasks.length === 1, 'pageshow 后分片必须回来')
    assert.equal(b.getSnapshot().tasks[0].title, 'survives-bfcache')
  } finally {
    a.dispose()
    b.dispose()
    if (hadWindow) g.window = oldWindow
    else delete g.window
    if (hadDoc) g.document = oldDoc
    else delete g.document
  }
})

test('dispose 后可复活：重连自动补发全量分片，不留幽灵也不永久封死', async () => {
  const channelName = testChannel()
  const a = makePool(channelName, { origin: 'page-a' })
  const b = makePool(channelName, { origin: 'page-b' })
  try {
    a.connect()
    b.connect()
    const handle = a.register({ group: 'g', title: 'still-here' })
    await waitFor(() => b.getSnapshot().tasks.length === 1, 'B 先看到 A 的任务')

    a.dispose()
    await waitFor(() => b.getSnapshot().tasks.length === 0, 'dispose 广播 bye，B 移除')

    // 同一个 pool 实例继续用：register 触发重连，必须把仍在跑的任务补回对端。
    a.register({ group: 'g', title: 'after-reconnect' })
    await waitFor(() => b.getSnapshot().tasks.length === 2, '重连后 B 看到全量')
    assert.deepEqual(b.getSnapshot().tasks.map((t) => t.title), ['still-here', 'after-reconnect'])
    handle.done()
    await waitFor(() => b.getSnapshot().tasks.length === 1, '结束仍正常同步')
  } finally {
    a.dispose()
    b.dispose()
  }
})

test('跨页通知 remote 标记：远端 settled 带 outcome，本地不重复发 N 次', async () => {
  const channelName = testChannel()
  const busA = createTaskNotificationEventBus()
  const busB = createTaskNotificationEventBus()
  const a = makePool(channelName, { origin: 'page-a', events: busA })
  const b = makePool(channelName, { origin: 'page-b', events: busB })
  try {
    const fromA = []
    const fromB = []
    busA.subscribe((e) => { fromA.push(e) })
    busB.subscribe((e) => { fromB.push(e) })
    a.connect()
    b.connect()
    const handle = a.register({ group: 'g', title: 'job' })
    await waitFor(() => fromB.length === 1, 'B 收到一次 registered')
    assert.equal(fromA.filter((e) => e.type === 'registered').length, 1, 'A 本地只发一次')
    assert.equal(fromB[0].remote, true)
    handle.fail('crash')
    await waitFor(() => fromB.some((e) => e.type === 'settled'), 'B 收到 settled')
    const settled = fromB.find((e) => e.type === 'settled')
    assert.equal(settled.outcome, 'failed')
    assert.equal(settled.task.status, 'failed')
    assert.equal(settled.remote, true)
  } finally {
    a.dispose()
    b.dispose()
  }
})

test('同页多副本共享一个池：两个副本注册都落在同一份状态里', () => {
  const g = globalThis
  const original = g[TASK_NOTIFICATIONS_KEY]
  delete g[TASK_NOTIFICATIONS_KEY]
  const pool = makePool(testChannel(), { offline: true })
  try {
    const copyA = claimTaskNotifications(() => pool)
    const copyB = claimTaskNotifications(() => makePool(testChannel(), { offline: true }))
    assert.equal(copyA, copyB)
    const h1 = copyA.register({ group: 'g', title: 'from-copy-A' })
    const h2 = copyB.register({ group: 'g', title: 'from-copy-B' })
    assert.equal(copyA.getSnapshot().tasks.length, 2)
    assert.equal(copyB.getSnapshot().tasks.length, 2)
    h1.done()
    h2.done()
  } finally {
    pool.dispose()
    g[TASK_NOTIFICATIONS_KEY] = original
  }
})

test('subscribeTaskNotificationEvents 走全局总线且可退订', () => {
  let hits = 0
  const off = subscribeTaskNotificationEvents(() => { hits += 1 })
  taskNotificationEvents.emit({ type: 'restored', taskId: 'x', remote: false })
  assert.equal(hits, 1)
  off()
  taskNotificationEvents.emit({ type: 'restored', taskId: 'y', remote: false })
  assert.equal(hits, 1)
})

test('DSH CJS 闭包：zustand 被打进产物且状态池真能跑（不是只看字符串）', async () => {
  const entry = fileURLToPath(new URL('../dist/ui/infra/task-notifications.js', import.meta.url))
  const out = await build({
    entryPoints: [entry],
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    target: 'es2020',
    write: false,
    banner: {
      js:
        "window.__ModuleLoader__.load({ id: 'probe', factory: (require) => {\n" +
        'var module = { exports: {} }; var exports = module.exports;\n',
    },
    footer: { js: '\nreturn module.exports; } });\n' },
    logLevel: 'silent',
  })
  const code = out.outputFiles[0].text
  assert.doesNotMatch(code, /require\(["']zustand\/vanilla["']\)/, 'zustand 必须内联，不能留给宿主 require')
  assert.match(code, /__ModuleLoader__\.load/, '产物必须是宿主加载的 CJS 闭包')

  let loaded = null
  const sandbox = {
    console,
    window: {
      __ModuleLoader__: {
        load: (spec) => { loaded = spec.factory(() => ({})) },
      },
    },
  }
  vm.createContext(sandbox)
  assert.doesNotThrow(() => vm.runInContext(code, sandbox), '闭包里 import 期不得碰 DOM / 宿主模块')
  assert.ok(loaded !== null, 'factory 必须返回 exports')

  const { createTaskNotificationPool, createTaskNotificationEventBus, selectTaskNotifications } = loaded.exports ?? loaded
  const bus = createTaskNotificationEventBus()
  const seen = []
  bus.subscribe((event) => { seen.push(event.type) })
  const pool = createTaskNotificationPool({ offline: true, events: bus, lifecycle: false })
  const handle = pool.register({ project: 'probe-project', group: 'probe-group', title: 'probe task' })
  assert.equal(pool.getSnapshot().tasks.length, 1)
  assert.equal(selectTaskNotifications(pool.getSnapshot(), ['probe-group'], { project: 'probe-project' }).length, 1)
  assert.equal(pool.select(['other'], { project: 'probe-project' }).length, 0)
  handle.background()
  handle.done()
  assert.equal(pool.getSnapshot().tasks.length, 0)
  assert.deepEqual(seen, ['registered', 'backgrounded', 'settled'])
  pool.dispose()
})

// ── 日常入口 notifyTask：位置参数登记 + run 自动收尾 ─────────────────────────

/** 全局池里按 handle.id 找条目：不受同进程其它用例影响。 */
function taskById(handle) {
  return taskNotifications.getSnapshot().tasks.find((task) => task.id === handle.id)
}

function taskByTitle(title) {
  return taskNotifications.getSnapshot().tasks.find((task) => task.title === title)
}

test('两级过滤三档：不传 = 本项目全部二级；数组 = 这些二级；* = 全站', () => {
  const pool = createTaskNotificationPool({ offline: true, lifecycle: false, locks: null })
  pool.register({ project: 'p1', group: 'scan', title: 'p1-scan' })
  pool.register({ project: 'p1', group: 'export', title: 'p1-export' })
  pool.register({ project: 'p2', group: 'scan', title: 'p2-scan' })
  const snapshot = pool.getSnapshot()

  const mine = selectTaskNotifications(snapshot, undefined, { project: 'p1' }).map((task) => task.title)
  assert.deepEqual([...mine].sort(), ['p1-export', 'p1-scan'])
  assert.equal(selectTaskNotifications(snapshot, [], { project: 'p1' }).length, 2, '空数组 = 本项目全部二级')
  assert.deepEqual(
    selectTaskNotifications(snapshot, ['scan'], { project: 'p1' }).map((task) => task.title),
    ['p1-scan'],
  )
  assert.equal(selectTaskNotifications(snapshot, ['scan', 'export'], { project: 'p1' }).length, 2)
  assert.equal(selectTaskNotifications(snapshot, '*').length, 3, "'*' = 所有项目所有二级")
  assert.equal(selectTaskNotifications(snapshot, '*', { project: 'p2' }).length, 1, "'*' 加 project 可只留一个项目")
  assert.equal(selectTaskNotifications(snapshot, undefined, { project: null }).length, 3, 'project: null = 不限项目')
  assert.equal(
    selectTaskNotifications(snapshot, '*'),
    selectTaskNotifications(snapshot, '*'),
    '同快照同过滤必须返回同一数组',
  )
})

test('notifyTask：只给标题即可，项目取全局默认、二级缺省 default', () => {
  const handle = notifyTask('notify task probe')
  assert.equal(taskById(handle)?.project, TEST_PROJECT)
  assert.equal(taskById(handle)?.group, 'default')
  assert.equal(taskById(handle)?.title, 'notify task probe')
  assert.equal(taskById(handle)?.status, 'running')
  assert.equal(handle.isSettled, false)
  handle.done()
  assert.equal(handle.isSettled, true)
  assert.equal(taskById(handle), undefined)
})

test('notifyTask：options 里的二级分组、detail 与显示名都落到条目上', () => {
  const handle = notifyTask('notify detail probe', {
    group: 'scan',
    detail: { done: 12, total: 40 },
    groupLabel: 'Scan',
    projectLabel: 'Probe',
  })
  assert.equal(taskById(handle)?.group, 'scan')
  assert.deepEqual(taskById(handle)?.detail, { done: 12, total: 40 })
  assert.equal(taskById(handle)?.groupLabel, 'Scan')
  assert.equal(taskById(handle)?.projectLabel, 'Probe')
  handle.update({ detail: ['a', 'b'] })
  assert.deepEqual(taskById(handle)?.detail, ['a', 'b'])
  handle.done()
})

test('notifyTask：detail 入池前取私有副本，调用方事后改原对象不影响状态', () => {
  const detail = { step: 1 }
  const handle = notifyTask('notify clone probe', { detail })
  detail.step = 99
  assert.equal(taskById(handle)?.detail?.step, 1)
  handle.done()
})

test('notifyTask：detail 带函数 → 当场抛错，且不留下条目', () => {
  assert.throws(() => notifyTask('notify bad detail', { detail: { fn: () => 1 } }), /JSON value/)
  assert.equal(taskByTitle('notify bad detail'), undefined)
})

test('notifyTask：没设默认项目也没传 project → 抛错并指出怎么修', () => {
  setDefaultTaskProject(undefined)
  try {
    assert.throws(() => notifyTask('no project'), /setDefaultTaskProject/)
  } finally {
    setDefaultTaskProject(TEST_PROJECT)
  }
  assert.equal(taskByTitle('no project'), undefined)
})

test('notifyTask：显式 project 覆盖默认，且不改默认值', () => {
  const handle = notifyTask('notify other project', { project: 'other-project' })
  assert.equal(taskById(handle)?.project, 'other-project')
  assert.equal(getDefaultTaskProject(), TEST_PROJECT)
  handle.done()
})

test('notifyTask.run：成功自动 done、原样返回结果、条目移出池', async () => {
  assert.equal(await notifyTask.run('notify run probe', async () => 'value'), 'value')
  assert.equal(taskByTitle('notify run probe'), undefined)
})

test('notifyTask.run：接受现成 Promise，不改其结算语义', async () => {
  assert.equal(await notifyTask.run('notify promise probe', Promise.resolve(42)), 42)
  assert.equal(taskByTitle('notify promise probe'), undefined)
})

test('notifyTask.run：第三个参数把二级分组 / 项目透传到条目', async () => {
  const seen = []
  const off = subscribeTaskNotificationEvents((event) => {
    if (event.type === 'registered' && event.task.title === 'notify run group probe') seen.push(event.task)
  })
  try {
    await notifyTask.run('notify run group probe', async () => 'ok', { group: 'run-group' })
  } finally {
    off()
  }
  assert.equal(seen[0]?.group, 'run-group')
  assert.equal(seen[0]?.project, TEST_PROJECT)
})

test('notifyTask.run：失败自动 fail、异常原样抛出、条目移出池且原因与 settled 都在', async () => {
  const settled = []
  const off = subscribeTaskNotificationEvents((event) => {
    if (event.type === 'settled' && event.task.title === 'notify run fail probe') settled.push(event)
  })
  try {
    await assert.rejects(
      notifyTask.run('notify run fail probe', async () => { throw new Error('boom') }),
      /boom/,
    )
  } finally {
    off()
  }
  assert.equal(taskByTitle('notify run fail probe'), undefined)
  assert.equal(settled.length, 1)
  assert.equal(settled[0].outcome, 'failed')
  assert.equal(settled[0].task.reason, 'boom')
})

test('notifyTask.run：work 同步抛错也收尾，不留永远 running 的条目', async () => {
  await assert.rejects(
    notifyTask.run('notify sync throw probe', () => { throw new Error('sync boom') }),
    /sync boom/,
  )
  assert.equal(taskByTitle('notify sync throw probe'), undefined)
})

// ── 本页一键收尾 + 失联页面清理 ─────────────────────────────────────────────

/** 假锁：alive 决定「那把锁是否还被某个页面持有」。 */
function fakeLocks(alive = new Set()) {
  const held = new Set(alive)
  const calls = { hold: [], free: [] }
  return {
    held,
    calls,
    manager: {
      hold(name) {
        calls.hold.push(name)
        held.add(name)
      },
      async free(name) {
        calls.free.push(name)
        return !held.has(name)
      },
    },
  }
}

function shardMessage(pageOrigin, title) {
  return {
    kind: 'shard',
    origin: pageOrigin,
    seq: 1,
    tasks: [wireTask(pageOrigin, `${pageOrigin}:1`), { ...wireTask(pageOrigin, `${pageOrigin}:2`), title }],
  }
}

test('settleLocal：本页条目全部收尾且不需句柄，返回条数并兑现句柄的 settled', async () => {
  const pool = createTaskNotificationPool({ offline: true, lifecycle: false, locks: null })
  const a = pool.register({ group: 'g', title: 'local-a' })
  const b = pool.register({ group: 'g', title: 'local-b' })
  assert.equal(pool.settleLocal('page switch'), 2)
  assert.equal(pool.getSnapshot().tasks.length, 0)
  assert.equal(a.isSettled, true)
  assert.equal(b.isSettled, true)
  const settlement = await a.settled
  assert.equal(settlement.outcome, 'done')
  assert.equal(settlement.reason, 'page switch')
  assert.equal(pool.settleLocal('again'), 0)
})

test('settleLocal：跨页条目一律不动，只清自己的分片', async () => {
  const channelName = testChannel()
  const owner = makePool(channelName, { origin: 'page-owner', locks: null })
  const watcher = makePool(channelName, { origin: 'page-watcher', locks: null })
  watcher.connect()
  owner.connect()
  await new Promise((resolve) => setTimeout(resolve, 30))
  const handle = owner.register({ group: 'g', title: 'remote-owned' })
  await waitFor(() => watcher.getSnapshot().tasks.some((task) => task.title === 'remote-owned'), 'watcher sees remote')
  assert.equal(watcher.settleLocal('nope'), 0)
  assert.equal(watcher.getSnapshot().tasks.length, 1)
  assert.equal(owner.getSnapshot().tasks.length, 1)
  handle.done()
  owner.dispose()
  watcher.dispose()
})

test('存活锁：connect 只拿一把，名字按 origin 拼', () => {
  const { manager, calls } = fakeLocks()
  const pool = createTaskNotificationPool({
    channelName: testChannel(),
    events: createTaskNotificationEventBus(),
    lifecycle: false,
    origin: 'page-lock',
    locks: manager,
  })
  pool.connect()
  pool.connect()
  pool.register({ group: 'g', title: 'lock probe' })
  assert.deepEqual(calls.hold, [`${TASK_NOTIFICATIONS_LOCK_PREFIX}page-lock`])
  pool.settleLocal()
  pool.dispose()
})

test('失联清理：收到分片但对方不持锁（连续两次探测都空）→ 条目被清并发 peer-left', async () => {
  const channelName = testChannel()
  const { manager } = fakeLocks()
  const bus = createTaskNotificationEventBus()
  const seen = []
  bus.subscribe((event) => { seen.push(event.type) })
  const pool = createTaskNotificationPool({
    channelName,
    events: bus,
    lifecycle: false,
    origin: 'page-live',
    locks: manager,
  })
  pool.connect()
  const sender = new BroadcastChannel(channelName)
  sender.unref?.()
  sender.postMessage(shardMessage('page-dead', 'zombie'))
  await waitFor(() => seen.includes('peer-left'), 'peer-left for dead page')
  assert.equal(pool.getSnapshot().tasks.some((task) => task.title === 'zombie'), false)
  sender.close()
  pool.dispose()
})

test('失联清理：第一次探空、第二次探到持有者（刚启动的页）→ 不删', async () => {
  const channelName = testChannel()
  let probes = 0
  const manager = {
    held: new Set(),
    hold() {},
    async free() {
      probes += 1
      return probes === 1
    },
  }
  const bus = createTaskNotificationEventBus()
  const seen = []
  bus.subscribe((event) => { seen.push(event.type) })
  const pool = createTaskNotificationPool({
    channelName,
    events: bus,
    lifecycle: false,
    origin: 'page-live',
    locks: manager,
  })
  pool.connect()
  const sender = new BroadcastChannel(channelName)
  sender.unref?.()
  sender.postMessage(shardMessage('page-starting', 'just-started'))
  await new Promise((resolve) => setTimeout(resolve, 400))
  assert.equal(pool.getSnapshot().tasks.some((task) => task.title === 'just-started'), true)
  assert.equal(seen.includes('peer-left'), false)
  sender.close()
  pool.dispose()
})

test('没有 locks（老浏览器 / Node 无 Web Locks）：收到分片也不清理，行为与从前一致', async () => {
  const channelName = testChannel()
  const pool = makePool(channelName, { origin: 'page-nolocks', locks: null })
  pool.connect()
  const sender = new BroadcastChannel(channelName)
  sender.unref?.()
  sender.postMessage(shardMessage('page-unknown', 'kept'))
  await new Promise((resolve) => setTimeout(resolve, 400))
  assert.equal(pool.getSnapshot().tasks.some((task) => task.title === 'kept'), true)
  sender.close()
  pool.dispose()
})

// ── 纯广播：只出 message 事件，池和快照一律不动 ───────────────────────────────

test('notifyMessage：只发 message 事件，不进池、不动 revision（列表不会闪）', () => {
  const pool = createTaskNotificationPool({ offline: true, lifecycle: false, locks: null })
  const seen = []
  const off = subscribeTaskNotificationEvents((event) => {
    if (event.type === 'message') seen.push(event)
  })
  const before = pool.getSnapshot()
  try {
    const message = notifyMessage('saved', { group: 'notice', icon: 'check', level: 'success' })
    assert.equal(message.group, 'notice')
    assert.equal(message.project, TEST_PROJECT)
    assert.equal(message.icon, 'check')
    assert.equal(message.level, 'success')
  } finally {
    off()
  }
  const after = pool.getSnapshot()
  assert.equal(pool.getSnapshot().tasks.length, 0, '池里不留条目')
  assert.equal(after.tasks.length, 0)
  assert.equal(before.revision, after.revision, '快照 revision 不变，订阅者不会被惊动')
  assert.equal(seen.length, 1)
  assert.equal(seen[0].remote, false)
  assert.equal(seen[0].message.title, 'saved')
})

test('notifyMessage：跨页到达对端（remote: true），对端池仍为空', async () => {
  const channelName = testChannel()
  const bus = createTaskNotificationEventBus()
  const received = []
  bus.subscribe((event) => {
    if (event.type === 'message') received.push(event)
  })
  const pool = createTaskNotificationPool({
    channelName,
    events: bus,
    lifecycle: false,
    origin: 'page-listener',
    locks: null,
  })
  pool.connect()
  const sender = new BroadcastChannel(channelName)
  sender.unref?.()
  const message = {
    id: 'page-sender:msg:1',
    project: TEST_PROJECT,
    group: 'notice',
    title: 'from another page',
    level: 'info',
    at: Date.now(),
  }
  sender.postMessage({ kind: 'message', origin: 'page-sender', seq: 1, message })
  await waitFor(() => received.some((event) => event.message.title === 'from another page'), 'remote message')
  assert.equal(received[0].remote, true)
  assert.equal(pool.getSnapshot().tasks.length, 0)
  sender.close()
  pool.dispose()
})

test('图标：icon / iconSvg 落到任务与广播消息上；update 也能改', () => {
  const handle = notifyTask('icon probe', { icon: 'bell', iconSvg: '<svg/>' })
  assert.equal(taskById(handle)?.icon, 'bell')
  assert.equal(taskById(handle)?.iconSvg, '<svg/>')
  handle.update({ icon: 'check' })
  assert.equal(taskById(handle)?.icon, 'check')
  handle.done()

  const message = notifyMessage('icon message probe', { icon: 'check', iconSvg: '<svg/>' })
  assert.equal(message.icon, 'check')
  assert.equal(message.iconSvg, '<svg/>')
})

// ── 静默任务：不进默认列表，到点回收 ──────────────────────────────────────────

test('hidden 任务：默认列表看不到，includeHidden 才看得到，池里一直有', () => {
  const pool = createTaskNotificationPool({ offline: true, lifecycle: false, locks: null })
  const handle = pool.register({ group: 'g', title: 'silent work', hidden: true })
  assert.equal(pool.getSnapshot().tasks.length, 1, '快照是全量数据面')
  assert.equal(selectTaskNotifications(pool.getSnapshot()).length, 0, '默认视图看不到')
  assert.equal(selectTaskNotifications(pool.getSnapshot(), '*').length, 0, "'*' 也一样")
  assert.equal(
    selectTaskNotifications(pool.getSnapshot(), undefined, { includeHidden: true }).length,
    1,
    'includeHidden 才看得到',
  )
  handle.update({ detail: '10%' })
  assert.equal(localTask(pool, handle)?.detail, '10%')
  handle.done()
  assert.equal(pool.getSnapshot().tasks.length, 0)
})

test('hidden 跨页：对端也照 hidden 处理', async () => {
  const channelName = testChannel()
  const owner = makePool(channelName, { origin: 'page-owner', locks: null })
  const watcher = makePool(channelName, { origin: 'page-watcher', locks: null })
  watcher.connect()
  owner.connect()
  await new Promise((resolve) => setTimeout(resolve, 30))
  const handle = owner.register({ group: 'g', title: 'remote hidden', hidden: true })
  await waitFor(() => watcher.getSnapshot().tasks.length === 1, 'watcher sees the row')
  assert.equal(selectTaskNotifications(watcher.getSnapshot()).length, 0)
  assert.equal(selectTaskNotifications(watcher.getSnapshot(), undefined, { includeHidden: true }).length, 1)
  handle.done()
  owner.dispose()
  watcher.dispose()
})

test('hidden 默认 5 分钟兜底：条目带 timeoutMs，可见任务默认不带', () => {
  const pool = createTaskNotificationPool({ offline: true, lifecycle: false, locks: null })
  const silent = pool.register({ group: 'g', title: 'silent default', hidden: true })
  const normal = pool.register({ group: 'g', title: 'visible default' })
  assert.equal(localTask(pool, silent)?.timeoutMs, 5 * 60_000)
  assert.equal(localTask(pool, normal)?.timeoutMs, undefined)
  silent.done()
  normal.done()
})

function localTask(pool, handle) {
  return pool.getSnapshot().tasks.find((task) => task.id === handle.id)
}

test('静默任务超时：到点结算为 failed 并移出，handle.settled 兑现', async () => {
  const pool = createTaskNotificationPool({ offline: true, lifecycle: false, locks: null })
  const handle = pool.register({ group: 'g', title: 'ttl probe', hidden: true, timeoutMs: 20 })
  const settlement = handle.settled
  await new Promise((resolve) => setTimeout(resolve, 40))
  pool.register({ group: 'g', title: 'trigger write' })
  const result = await settlement
  assert.equal(result.outcome, 'failed')
  assert.equal(result.reason, 'timed out')
  assert.equal(localTask(pool, handle), undefined)
})

test('回收窗口按最后一次活动起算：持续 update 的任务不会被误收', async () => {
  const pool = createTaskNotificationPool({ offline: true, lifecycle: false, locks: null })
  const handle = pool.register({ group: 'g', title: 'renew probe', hidden: true, timeoutMs: 30 })
  for (let step = 0; step < 3; step += 1) {
    await new Promise((resolve) => setTimeout(resolve, 20))
    handle.update({ detail: `step ${step}` })
  }
  assert.equal(localTask(pool, handle)?.title, 'renew probe', '累计 60ms 已超窗口，但一直在活动')
  await new Promise((resolve) => setTimeout(resolve, 50))
  pool.register({ group: 'g', title: 'trigger again' })
  assert.equal(localTask(pool, handle), undefined, '停止活动后到点被收')
})

test('可见任务默认不回收：没有 timeoutMs 就一直挂着', async () => {
  const pool = createTaskNotificationPool({ offline: true, lifecycle: false, locks: null })
  const handle = pool.register({ group: 'g', title: 'visible stays' })
  await new Promise((resolve) => setTimeout(resolve, 60))
  pool.register({ group: 'g', title: 'trigger visible' })
  assert.equal(localTask(pool, handle)?.title, 'visible stays')
  handle.done()
})
