import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createAuthoritativeEngine,
  createTaskNotificationPool,
  setDefaultTaskProject,
} from '../dist/adv/tasks/index.js'

const PROJECT = 'authoritative-project'

function row(overrides = {}) {
  return {
    project: PROJECT,
    key: 'close-1',
    version: 1,
    state: 'running',
    startedAt: 1000,
    deadlineAt: 9000,
    leaseExpiresAt: 2000,
    updatedAt: 1000,
    title: '结案中',
    group: 'default',
    actions: [],
    ...overrides,
  }
}

function fakeBackend(rows, notices = []) {
  let listener = null
  const calls = { invokes: [], acks: [], noticeAcks: [], lists: 0 }
  const pendingNotices = [...notices]
  return {
    calls,
    emit(project, event) { listener?.(project, event) },
    /** 只入队，不触发 pump；测试自己决定何时发 notice-available。 */
    queueNotice(notice) { pendingNotices.push(notice) },
    notice(notice) { pendingNotices.push(notice); listener?.(PROJECT, { kind: 'notice-available' }) },
    backend: {
      async list() { calls.lists += 1; return { rows: [...rows], snapshotVersion: 1 } },
      follow(_projects, _cursors, onEvent) { listener = onEvent; return () => { listener = null } },
      async listNotices(_projects, since) {
        const sinceIdx = since === undefined ? -1 : pendingNotices.findIndex((n) => n.cursor === since)
        return { notices: pendingNotices.slice(sinceIdx + 1) }
      },
      async ackNotices(_projects, cursor) { calls.noticeAcks.push(cursor) },
      async invoke(request) { calls.invokes.push(request); return { ok: true } },
      async ack(request) { calls.acks.push(request) },
      async create(input) { return { created: true, record: row({ key: input.key }) } },
    },
  }
}

function noticeFor(record, id = 'notice-1') {
  return { notificationId: id, project: PROJECT, record, cursor: `cursor-${id}` }
}

function waitFor(predicate, label) {
  const until = Date.now() + 2000
  return (async () => {
    while (!predicate()) {
      if (Date.now() > until) throw new Error(`timeout: ${label}`)
      await new Promise((resolve) => setTimeout(resolve, 5))
    }
  })()
}

test('后端能力缺失直接抛，不做降级', () => {
  const engine = createAuthoritativeEngine({ clientId: 'a', onChange() {}, onNotice() {} })
  assert.throws(
    () => engine.attach(PROJECT, { list() {}, invoke() {}, ack() {} }),
    /list\/follow\/listNotices\/ackNotices\/invoke\/ack/,
  )
  engine.dispose()
})

test('基线水合出服务端在跑任务，时间来自服务端', async () => {
  setDefaultTaskProject(PROJECT)
  const fake = fakeBackend([row()])
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    events: undefined,
    lifecycle: false,
    locks: null,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  await waitFor(() => pool.getSnapshot().tasks.length > 0, 'hydrate')
  const task = pool.getSnapshot().tasks.find((item) => item.key === 'close-1')
  assert.equal(task?.startedAt, 1000)
  assert.equal(task?.deadlineAt, 9000)
  assert.equal(task?.version, 1)
  assert.equal(task?.origin, '__server__')
  pool.dispose()
  fake.backend.follow([], {}, () => {}, () => {})
})

test('低版本迟到快照不能复活终态；tombstone 回放不 emit settled、不 ack', async () => {
  setDefaultTaskProject(PROJECT)
  const fake = fakeBackend([row()])
  const events = []
  const bus = { subscribe() { return () => {} }, emit(e) { events.push(e) } }
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false,
    locks: null,
    events: bus,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  await waitFor(() => pool.getSnapshot().tasks.length > 0, 'hydrate')

  fake.emit(PROJECT, { kind: 'upsert', rows: [row({ version: 2, state: 'done', tombstone: true })] })
  await waitFor(() => pool.getSnapshot().tasks.length === 0, 'terminal')
  // 通道 A 的 tombstone 只更新投影与终态门，绝不发 settled、绝不 ack。
  assert.equal(events.filter((e) => e.type === 'settled').length, 0)
  assert.equal(fake.calls.noticeAcks.length, 0)

  fake.emit(PROJECT, { kind: 'upsert', rows: [row({ version: 1, state: 'running' })] })
  await new Promise((resolve) => setTimeout(resolve, 10))
  assert.equal(pool.getSnapshot().tasks.length, 0)
  pool.dispose()
})

test('按钮按 actionId + token 走服务端命令，不依赖页面闭包', async () => {
  setDefaultTaskProject(PROJECT)
  const action = { id: 'retry', label: '重试', enabled: true, token: 'tok-1', expiresAt: Date.now() + 60_000 }
  const fake = fakeBackend([row({ actions: [action] })])
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false,
    locks: null,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  await waitFor(() => pool.getSnapshot().tasks.length > 0, 'hydrate')
  const task = pool.getSnapshot().tasks[0]
  assert.equal(task.actions[0].id, 'retry')
  assert.ok(await pool.runAction(task.id, 0))
  assert.equal(fake.calls.invokes.length, 1)
  assert.equal(fake.calls.invokes[0].actionId, 'retry')
  assert.equal(fake.calls.invokes[0].token, 'tok-1')
  pool.dispose()
})

test('权威项目禁止 ensure 与 setStatusSource，必须走 ensureServer', async () => {
  setDefaultTaskProject(PROJECT)
  const fake = fakeBackend([])
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false,
    locks: null,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  assert.throws(() => pool.ensure({ title: 'x', key: 'k', serverBacked: true }), /ensureServer/)
  assert.throws(() => pool.setStatusSource(PROJECT, () => []), /authoritative mode/)
  const claim = await pool.ensureServer({ title: 'x', key: 'k' })
  assert.equal(claim.created, true)
  await waitFor(() => pool.getSnapshot().tasks.length === 1, 'created projection')
  pool.dispose()
})

test('同版本终态后到的 running 不能复活；tombstone 回放不触发通知 ack', async () => {
  setDefaultTaskProject(PROJECT)
  const fake = fakeBackend([row()])
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false,
    locks: null,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  await waitFor(() => pool.getSnapshot().tasks.length > 0, 'hydrate')
  fake.emit(PROJECT, { kind: 'upsert', rows: [row({ version: 2, state: 'failed', tombstone: true, reason: '超时' })] })
  await waitFor(() => pool.getSnapshot().tasks.length === 0, 'terminal')
  fake.emit(PROJECT, { kind: 'upsert', rows: [row({ version: 2, state: 'running' })] })
  fake.emit(PROJECT, { kind: 'upsert', rows: [row({ version: 2, state: 'done', tombstone: true })] })
  await new Promise((resolve) => setTimeout(resolve, 10))
  assert.equal(pool.getSnapshot().tasks.length, 0)
  assert.equal(fake.calls.noticeAcks.length, 0)
  pool.dispose()
})

test('同一动作的重复点击复用幂等键，invoke 抛错不外泄', async () => {
  setDefaultTaskProject(PROJECT)
  const action = { id: 'cancel', label: '取消', enabled: true, token: 't', expiresAt: Date.now() + 60_000, version: 1 }
  const fake = fakeBackend([row({ actions: [action] })])
  fake.backend.invoke = async (request) => {
    fake.calls.invokes.push(request)
    if (fake.calls.invokes.length === 1) throw new Error('network lost')
    return { ok: true }
  }
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false,
    locks: null,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  await waitFor(() => pool.getSnapshot().tasks.length > 0, 'hydrate')
  const task = pool.getSnapshot().tasks[0]
  assert.equal(await pool.runAction(task.id, 0), false)
  assert.equal(await pool.runAction(task.id, 0), true)
  assert.equal(fake.calls.invokes.length, 2)
  assert.equal(fake.calls.invokes[0].idempotencyKey, fake.calls.invokes[1].idempotencyKey)
  // 成功后结果缓存：第三次点击不再发请求，直接回放同一结果。
  assert.equal(await pool.runAction(task.id, 0), true)
  assert.equal(fake.calls.invokes.length, 2)
  pool.dispose()
})

test('终态通知兑现 ensureServer 的句柄；tombstone 回放不会兑现', async () => {
  setDefaultTaskProject(PROJECT)
  const terminal = row({ key: 'fast', version: 5, state: 'done', tombstone: true })
  const fake = fakeBackend([])
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false,
    locks: null,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  await waitFor(() => fake.calls.lists > 0, 'initial rebase')
  // 先发 tombstone 回放：只更新投影，不兑现任何句柄、不 ack。
  fake.emit(PROJECT, { kind: 'upsert', rows: [terminal] })
  await new Promise((resolve) => setTimeout(resolve, 20))
  assert.equal(fake.calls.noticeAcks.length, 0)
  const claim = await pool.ensureServer({ title: 'x', key: 'fast' })
  // 再触发通道 B：通知投递 → settle → ack。
  fake.queueNotice(noticeFor(terminal, 'fast-notice'))
  fake.emit(PROJECT, { kind: 'notice-available' })
  const settlement = await Promise.race([
    claim.handle.settled,
    new Promise((_, reject) => setTimeout(() => reject(new Error('settled timeout')), 2000)),
  ])
  assert.equal(settlement.outcome, 'done')
  assert.equal(claim.handle.isSettled, true)
  await waitFor(() => fake.calls.noticeAcks.length === 1, 'notice ack')
  pool.dispose()
})

test('同 key 终态后重建：新句柄能再次兑现，失败结果不被幂等缓存封死', async () => {
  setDefaultTaskProject(PROJECT)
  const action = { id: 'retry', label: '重试', enabled: true, token: 't', expiresAt: Date.now() + 60_000, version: 1 }
  const fake = fakeBackend([row({ actions: [action] })])
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false,
    locks: null,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  await waitFor(() => fake.calls.lists > 0, 'initial rebase')
  const settleWithin = (promise) => Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('settled timeout')), 2000)),
  ])
  const first = await pool.ensureServer({ title: 'x', key: 'recreate' })
  fake.queueNotice(noticeFor(row({ key: 'recreate', version: 1, state: 'done', tombstone: true }), 'recreate-1'))
  fake.emit(PROJECT, { kind: 'notice-available' })
  assert.equal((await settleWithin(first.handle.settled)).outcome, 'done')
  // 终态后同 key 再建：旧句柄已清，新 Promise 必须能兑现。
  const second = await pool.ensureServer({ title: 'x', key: 'recreate' })
  assert.notEqual(first.handle, second.handle)
  // 第二个通知 id 不同，核心不去重，能再次兑现。
  fake.queueNotice(noticeFor(row({ key: 'recreate', version: 2, state: 'done', tombstone: true }), 'recreate-2'))
  fake.emit(PROJECT, { kind: 'notice-available' })
  assert.equal((await settleWithin(second.handle.settled)).outcome, 'done')

  // 失败不缓存：第一次 ok:false，第二次 ok:true，两次都真实发出。
  const fake2 = fakeBackend([row({ actions: [action] })])
  let calls = 0
  fake2.backend.invoke = async () => {
    calls += 1
    return calls === 1 ? { ok: false, reason: 'busy' } : { ok: true }
  }
  const pool2 = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false,
    locks: null,
  })
  pool2.setTaskBackend(PROJECT, fake2.backend)
  await waitFor(() => pool2.getSnapshot().tasks.length > 0, 'hydrate')
  const task = pool2.getSnapshot().tasks[0]
  assert.equal(await pool2.runAction(task.id, 0), false)
  assert.equal(await pool2.runAction(task.id, 0), true)
  assert.equal(calls, 2)
  pool.dispose()
  pool2.dispose()
})

test('dispose → connect 后权威任务重新水合', async () => {
  setDefaultTaskProject(PROJECT)
  const fake = fakeBackend([row()])
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false,
    locks: null,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  await waitFor(() => pool.getSnapshot().tasks.length > 0, 'first hydrate')
  pool.dispose()
  pool.connect()
  await waitFor(() => pool.getSnapshot().tasks.length > 0, 'rehydrate after connect')
  pool.dispose()
})

test('反馈①：按钮点击对外发 action 事件，携带任务快照与结果', async () => {
  setDefaultTaskProject(PROJECT)
  const action = { id: 'retry', label: '重试', enabled: true, token: 'tok', expiresAt: Date.now() + 60_000 }
  const fake = fakeBackend([row({ actions: [action] })])
  const events = []
  const bus = { subscribe() { return () => {} }, emit(e) { events.push(e) } }
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false, locks: null, events: bus,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  await waitFor(() => pool.getSnapshot().tasks.length > 0, 'hydrate')
  const task = pool.getSnapshot().tasks[0]
  assert.equal(await pool.runAction(task.id, 0), true)
  const actionEvent = events.find((e) => e.type === 'action')
  assert.ok(actionEvent)
  assert.equal(actionEvent.taskId, task.id)
  assert.equal(actionEvent.actionId, 'retry')
  assert.equal(actionEvent.index, 0)
  assert.equal(actionEvent.ok, true)
  assert.equal(actionEvent.remote, false)
  assert.equal(actionEvent.task.id, task.id)
  assert.equal(actionEvent.task.project, PROJECT)
  pool.dispose()

  // 失败路径也发事件，且带 reason（新池，避开上一池的幂等成功缓存）。
  const failFake = fakeBackend([row({ actions: [action] })])
  failFake.backend.invoke = async () => ({ ok: false, reason: 'busy' })
  const failEvents = []
  const failBus = { subscribe() { return () => {} }, emit(e) { failEvents.push(e) } }
  const pool2 = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false, locks: null, events: failBus,
  })
  pool2.setTaskBackend(PROJECT, failFake.backend)
  await waitFor(() => pool2.getSnapshot().tasks.length > 0, 'hydrate2')
  await pool2.runAction(pool2.getSnapshot().tasks[0].id, 0)
  const failures = failEvents.filter((e) => e.type === 'action' && e.ok === false)
  assert.equal(failures.length, 1)
  assert.equal(failures[0].reason, 'busy')
  pool2.dispose()
})

test('反馈②：页面重开后，未确认的终态通知仍能投递 settled 事件', async () => {
  setDefaultTaskProject(PROJECT)
  const terminal = row({ key: 'reopen', version: 3, state: 'failed', tombstone: true, reason: '超时' })
  const events = []
  const bus = { subscribe() { return () => {} }, emit(e) { events.push(e) } }
  const first = fakeBackend([row({ key: 'reopen' })])
  const pool1 = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false, locks: null, events: bus,
  })
  pool1.setTaskBackend(PROJECT, first.backend)
  await waitFor(() => pool1.getSnapshot().tasks.length > 0, 'first hydrate')
  pool1.dispose()

  // 新页面：服务端仍有未确认通知（重开不丢），开页基线拉到 → 投递 settled。
  const second = fakeBackend([terminal], [noticeFor(terminal, 'after-reopen')])
  const pool2 = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false, locks: null, events: bus,
  })
  pool2.setTaskBackend(PROJECT, second.backend)
  await waitFor(() => events.some((e) => e.type === 'settled'), 'settled after reopen')
  const settled = events.find((e) => e.type === 'settled')
  assert.equal(settled.outcome, 'failed')
  assert.equal(settled.task.key, 'reopen')
  assert.equal(second.calls.noticeAcks.length, 1)
  pool2.dispose()
})

test('终态通知早于 ensureServer 注册 waiter 时，后建句柄用缓存立即兑现', async () => {
  setDefaultTaskProject(PROJECT)
  const terminal = row({ key: 'early', version: 2, state: 'done', tombstone: true })
  const fake = fakeBackend([], [noticeFor(terminal, 'early-notice')])
  const events = []
  const bus = { subscribe() { return () => {} }, emit(e) { events.push(e) } }
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false, locks: null, events: bus,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  // 开页自动 pump 已消费通知（此时还没有 waiter），settled 事件已发出。
  await waitFor(() => events.some((e) => e.type === 'settled'), 'early settled event')
  // 业务随后才登记同 key：句柄必须用缓存立即兑现，不能永久 pending。
  const claim = await pool.ensureServer({ title: 'x', key: 'early' })
  const settlement = await Promise.race([
    claim.handle.settled,
    new Promise((_, reject) => setTimeout(() => reject(new Error('handle pending')), 1000)),
  ])
  assert.equal(settlement.outcome, 'done')
  assert.equal(claim.handle.isSettled, true)
  pool.dispose()
})

test('反馈③：权威句柄没有 update/touch/background/done/fail/track', async () => {
  setDefaultTaskProject(PROJECT)
  const fake = fakeBackend([])
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false, locks: null,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  const claim = await pool.ensureServer({ title: 'x', key: 'shape' })
  for (const name of ['update', 'touch', 'background', 'done', 'fail', 'track']) {
    assert.equal(typeof claim.handle[name], 'undefined', `handle.${name} must not exist`)
  }
  assert.equal(typeof claim.handle.id, 'string')
  assert.ok(claim.handle.settled instanceof Promise)
  pool.dispose()
})
