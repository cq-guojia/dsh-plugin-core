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

function fakeBackend(rows) {
  let listener = null
  const calls = { invokes: [], acks: [], lists: 0 }
  return {
    calls,
    emit(project, event) { listener?.(project, event) },
    backend: {
      async list() { calls.lists += 1; return { rows: [...rows], snapshotVersion: 1 } },
      follow(_projects, _cursors, onEvent) { listener = onEvent; return () => { listener = null } },
      async invoke(request) { calls.invokes.push(request); return { ok: true } },
      async ack(request) { calls.acks.push(request) },
      async create(input) { return { created: true, record: row({ key: input.key }) } },
    },
  }
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
  const engine = createAuthoritativeEngine({ clientId: 'a', onChange() {} })
  assert.throws(
    () => engine.attach(PROJECT, { list() {}, invoke() {}, ack() {} }),
    /list\/follow\/invoke\/ack/,
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

test('低版本迟到快照不能复活终态；终态触发 ack', async () => {
  setDefaultTaskProject(PROJECT)
  const fake = fakeBackend([row()])
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false,
    locks: null,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  await waitFor(() => pool.getSnapshot().tasks.length > 0, 'hydrate')

  fake.emit(PROJECT, { kind: 'upsert', rows: [row({ version: 2, state: 'done', tombstone: true })] })
  await waitFor(() => pool.getSnapshot().tasks.length === 0, 'terminal')
  assert.equal(fake.calls.acks.length, 1)
  assert.equal(fake.calls.acks[0].kind, 'settled')

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

test('同版本终态后到的 running 不能复活；终态只 ack 一次', async () => {
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
  assert.equal(fake.calls.acks.length, 1)
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

test('create 返回前就终态时，ensureServer 的句柄仍被兑现', async () => {
  setDefaultTaskProject(PROJECT)
  const fake = fakeBackend([])
  let emit = null
  fake.backend.follow = (_p, _c, onEvent) => { emit = onEvent; return () => { emit = null } }
  fake.backend.create = async (input) => {
    emit?.(PROJECT, { kind: 'upsert', rows: [row({ key: input.key, version: 5, state: 'done', tombstone: true })] })
    return { created: true, record: row({ key: input.key, version: 5, state: 'done', tombstone: true }) }
  }
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false,
    locks: null,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  await waitFor(() => emit !== null, 'follow ready')
  const claim = await pool.ensureServer({ title: 'x', key: 'fast' })
  const settlement = await claim.handle.settled
  assert.equal(settlement.outcome, 'done')
  assert.equal(claim.handle.isSettled, true)
  pool.dispose()
})

test('同 key 终态后重建：新句柄能再次兑现，失败结果不被幂等缓存封死', async () => {
  setDefaultTaskProject(PROJECT)
  const action = { id: 'retry', label: '重试', enabled: true, token: 't', expiresAt: Date.now() + 60_000, version: 1 }
  const fake = fakeBackend([row({ actions: [action] })])
  let emit = null
  fake.backend.follow = (_p, _c, onEvent) => { emit = onEvent; return () => { emit = null } }
  let createCount = 0
  fake.backend.create = async (input) => {
    createCount += 1
    emit?.(PROJECT, { kind: 'upsert', rows: [row({ key: input.key, version: createCount, state: 'done', tombstone: true })] })
    return { created: true, record: row({ key: input.key, version: createCount, state: 'done', tombstone: true }) }
  }
  const pool = createTaskNotificationPool({
    channelName: `authoritative-test/${process.pid}/${Math.random()}`,
    lifecycle: false,
    locks: null,
  })
  pool.setTaskBackend(PROJECT, fake.backend)
  await waitFor(() => emit !== null, 'follow ready')
  const first = await pool.ensureServer({ title: 'x', key: 'recreate' })
  assert.equal((await first.handle.settled).outcome, 'done')
  // 终态后同 key 再建：旧句柄已清，新 Promise 必须能兑现。
  const second = await pool.ensureServer({ title: 'x', key: 'recreate' })
  assert.equal((await second.handle.settled).outcome, 'done')
  assert.notEqual(first.handle, second.handle)

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
