import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  TASK_NOTIFICATIONS_PROTOCOL,
  createTaskNotificationEventBus,
  createTaskNotificationPool,
  setDefaultTaskProject,
  taskKey,
} from '../dist/adv/tasks/pool.js'

const PROJECT = 'server-task-project'

beforeEach(() => {
  setDefaultTaskProject(PROJECT)
})

function makePool(extra = {}) {
  return createTaskNotificationPool({
    channelName: `bg-test/${String(process.pid)}/${String(Math.random())}`,
    events: createTaskNotificationEventBus(),
    lifecycle: false,
    locks: null,
    ...extra,
  })
}

function waitFor(predicate, label, timeoutMs = 2000) {
  const until = Date.now() + timeoutMs
  return (async () => {
    while (!predicate()) {
      if (Date.now() > until) throw new Error(`timeout: ${label}`)
      await new Promise((resolve) => setTimeout(resolve, 5))
    }
  })()
}

test('serverBacked 必须有 key，且 lease/maxDuration 参数校验在本页抛', () => {
  const pool = makePool()
  assert.throws(() => pool.ensure({ title: 'x', serverBacked: true }), /requires a key/)
  assert.throws(
    () => pool.ensure({ title: 'x', key: 'k', serverBacked: true, leaseMs: 0 }),
    /leaseMs must be a finite number > 0/,
  )
  assert.throws(
    () => pool.ensure({ title: 'x', key: 'k', serverBacked: true, maxDurationMs: -1 }),
    /maxDurationMs must be a finite number >= 0/,
  )
  assert.throws(() => pool.setStatusSource('', () => []), /non-empty string/)
  assert.throws(() => pool.setStatusSource('p', null), /must be a function/)
  pool.dispose()
})

test('登记即入池：serverBacked 记录带 key/租约/总限，created 幂等复用', () => {
  const pool = makePool()
  pool.setStatusSource(PROJECT, () => [])
  const claim = pool.ensure({
    title: '导出',
    key: ['export', 7],
    serverBacked: true,
    leaseMs: 60_000,
    maxDurationMs: 600_000,
  })
  assert.equal(claim.created, true)
  const row = pool.getSnapshot().tasks[0]
  assert.equal(row.serverBacked, true)
  assert.equal(row.key, taskKey(['export', 7]))
  assert.equal(row.leaseMs, 60_000)
  assert.equal(row.maxDurationMs, 600_000)
  assert.equal(row.status, 'running')

  const again = pool.ensure({ title: '导出-重挂载', key: ['export', 7], serverBacked: true })
  assert.equal(again.created, false)
  assert.equal(again.handle.id, claim.handle.id)
  assert.equal(pool.getSnapshot().tasks.length, 1)
  pool.dispose()
})

test('批量状态源：一次调用覆盖该项目全部 key，running 续租、done 结算', async () => {
  const pool = makePool()
  const calls = []
  pool.setStatusSource(PROJECT, (keys) => {
    calls.push([...keys])
    return keys.map((key) => ({ key, state: 'running' }))
  })
  const a = pool.ensure({ title: 'A', key: 'a', serverBacked: true, leaseMs: 200 })
  const b = pool.ensure({ title: 'B', key: 'b', serverBacked: true, leaseMs: 200 })
  // 轮询周期 = min(60s, 200/2) = 100ms；一个窗口内应问到同一批两个 key。
  await waitFor(() => calls.some((batch) => batch.includes('a') && batch.includes('b')), 'batch probe')
  const batch = calls.find((batch) => batch.includes('a') && batch.includes('b'))
  assert.equal(batch.length, 2)
  assert.equal(calls.every((c) => c.length <= 2), true)

  pool.setStatusSource(PROJECT, (keys) => keys.map((key) => (key === 'a' ? { key, state: 'done' } : { key, state: 'running' })))
  const settled = []
  a.handle.settled.then((s) => settled.push(s))
  await waitFor(() => settled.length === 1, 'a settled done')
  assert.equal(settled[0].outcome, 'done')
  assert.equal(pool.getSnapshot().tasks.some((t) => t.id === a.handle.id), false)
  assert.equal(pool.getSnapshot().tasks.some((t) => t.id === b.handle.id), true)
  pool.dispose()
})

test('状态源抛错不误杀：本轮不续租也不判死，租约到点才失败', async () => {
  const pool = makePool()
  pool.setStatusSource(PROJECT, () => { throw new Error('network down') })
  const claim = pool.ensure({ title: 'X', key: 'x', serverBacked: true, leaseMs: 120 })
  await new Promise((resolve) => setTimeout(resolve, 60))
  assert.equal(pool.getSnapshot().tasks.some((t) => t.id === claim.handle.id), true)
  const outcome = await claim.handle.settled
  assert.equal(outcome.outcome, 'failed')
  assert.equal(outcome.reason, 'lease expired')
  pool.dispose()
})

test('双时钟：续租不断也挡不住 maxDurationMs 到点结算', async () => {
  const pool = makePool()
  pool.setStatusSource(PROJECT, (keys) => keys.map((key) => ({ key, state: 'running' })))
  const claim = pool.ensure({
    title: 'Y',
    key: 'y',
    serverBacked: true,
    leaseMs: 40, // 轮询 20ms，持续续租
    maxDurationMs: 100,
  })
  // 一直 running 续租：若只看租约会永远活着；总上限到点必须结算。
  const outcome = await claim.handle.settled
  assert.equal(outcome.outcome, 'failed')
  assert.equal(outcome.reason, 'max duration exceeded')
  pool.dispose()
})

test('touch 续租：可选加速把租约从现在起算', async () => {
  const pool = makePool()
  pool.setStatusSource(PROJECT, () => { throw new Error('offline') })
  const claim = pool.ensure({ title: 'Z', key: 'z', serverBacked: true, leaseMs: 160 })
  let touched = false
  const timer = setInterval(() => {
    if (!touched) { claim.handle.touch(); touched = true }
  }, 60)
  const outcome = await claim.handle.settled
  clearInterval(timer)
  // 60ms 时续了一次，租约从那时再算 160ms，总寿长约 220ms > 未续的 160ms。
  assert.ok(Date.now() >= 150, 'should have lived past the original lease')
  assert.equal(outcome.outcome, 'failed')
  pool.dispose()
})

test('failed 状态源回报带原因；远端投影本页不结算', async () => {
  const pool = makePool()
  pool.setStatusSource(PROJECT, (keys) => keys.map((key) => ({ key, state: 'failed', reason: 'server said no' })))
  const local = pool.ensure({ title: 'F', key: 'f', serverBacked: true, leaseMs: 200 })
  const outcome = await local.handle.settled
  assert.equal(outcome.outcome, 'failed')
  assert.equal(outcome.reason, 'server said no')
  assert.equal(TASK_NOTIFICATIONS_PROTOCOL >= 2, true)
  pool.dispose()
})

test('dispose 停掉探测定时器：卸载后状态源不再被调用', async () => {
  const pool = makePool()
  let calls = 0
  pool.setStatusSource(PROJECT, (keys) => { calls += 1; return keys.map((key) => ({ key, state: 'running' })) })
  pool.ensure({ title: 'D', key: 'd', serverBacked: true, leaseMs: 400 })
  await waitFor(() => calls >= 1, 'first probe')
  pool.dispose()
  const atDispose = calls
  await new Promise((resolve) => setTimeout(resolve, 250))
  assert.equal(calls, atDispose, 'no probe after dispose')
})

test('在途探测在 dispose 后回来：不结算、不再排定时器', async () => {
  const pool = makePool()
  let release
  const gate = new Promise((resolve) => { release = resolve })
  let calls = 0
  pool.setStatusSource(PROJECT, (keys) => {
    calls += 1
    return gate.then(() => keys.map((key) => ({ key, state: 'done' })))
  })
  const claim = pool.ensure({ title: 'in-flight', key: 'f', serverBacked: true, leaseMs: 400 })
  await waitFor(() => calls >= 1, 'probe started')
  pool.dispose()
  release()
  await new Promise((resolve) => setTimeout(resolve, 250))
  assert.equal(claim.handle.isSettled, false, 'in-flight done must not settle after dispose')
  assert.equal(calls, 1, 'no re-armed probe after dispose')
})
