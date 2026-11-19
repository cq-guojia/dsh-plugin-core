import test from 'node:test'
import assert from 'node:assert/strict'
import { createCoordinator } from '../dist/adv/tasks/coordinator.js'
import { createTaskStore } from '../dist/adv/tasks/store.js'
import { createExecutorRegistry } from '../dist/runtime/index.js'
import { parseTaskFrames } from '../dist/adv/tasks/stream.js'
import { serveTaskStream } from '../dist/host/index.js'
import { rowSettlePhase } from '../dist/adv/tasks/TaskBar.js'

function setup() {
  const store = createTaskStore()
  const registry = createExecutorRegistry()
  const toasts = []
  const notices = []
  const host = {
    deliverToast: (p) => toasts.push(p),
    deliverNotify: (p) => notices.push(p),
  }
  return { c: createCoordinator({ store, registry, host }), store, registry, toasts, notices }
}

test('加固：同 (project,key) 连续三次 upsert 仍只有一条', () => {
  const s = createTaskStore()
  const a = s.upsert({ id: 'a', key: 'k', project: 'p', group: 'g', title: '1', state: 'running', startedAt: 1 })
  s.upsert({ id: 'b', key: 'k', project: 'p', group: 'g', title: '2', state: 'running', startedAt: 2 })
  const c = s.upsert({ id: 'c', key: 'k', project: 'p', group: 'g', title: '3', state: 'running', startedAt: 3 })
  assert.equal(a.created, true)
  assert.equal(c.created, false)
  assert.equal(s.getSnapshot().tasks.length, 1)
  assert.equal(s.getSnapshot().tasks[0].id, 'a')
  assert.equal(s.getSnapshot().tasks[0].title, '3')
})

test('加固：终态去重按 (project,key) 结算，重放不重复，重新发起后重置', () => {
  const s = createTaskStore()
  const done = (id, at) => ({ id, key: 'k', project: 'p', group: 'g', title: 't', state: 'done', startedAt: 1, settledAt: at })
  const running = { id: 'a', key: 'k', project: 'p', group: 'g', title: 't', state: 'running', startedAt: 1 }
  assert.equal(s.claimSettled(done('a', 10)), true)
  assert.equal(s.claimSettled(done('b', 10)), false, '同业务键同结算（含重连重放）不重复')
  assert.equal(s.claimSettled(done('c', 11)), false, '没重新发起就不放行新结算')
  s.upsert(running)
  assert.equal(s.claimSettled(done('a', 12)), true, '重新发起（running upsert）后新结算可再分发')
})

test('加固：本地执行与 SSE 投影同一任务只分发一次', async () => {
  const { c, store, registry, toasts, notices } = setup()
  const settled = []
  c.onSettled((s) => settled.push(s))
  let resolve
  registry.register('job', () => new Promise((r) => { resolve = r }))
  const task = c.start({
    project: 'p', title: 't', kind: 'job',
    toast: { success: { title: '完成' } },
    notify: { success: { message: 'done' } },
  })
  // 等执行器 handler 被调用，resolve 就绪。
  await new Promise((r) => setTimeout(r, 0))
  // SSE 先推终态通知，随后本地执行器也结算：两条路径都到，只分发一次。
  c.deliverNotice({ id: 'n1', task: { ...task, state: 'done', settledAt: 100 } })
  resolve({ outcome: 'done' })
  await new Promise((r) => setTimeout(r, 10))
  assert.equal(store.get(task.id).state, 'done')
  assert.equal(toasts.length, 1)
  assert.equal(notices.length, 1)
  assert.equal(settled.length, 1)
  assert.equal(store.get(task.id).settledAt, 100, 'settledAt 不被第二次改写')
})

test('加固：同 key 不同 id 的终态折叠到存活 id，投影不弹、通知按 id 弹一次', () => {
  const { c, store, toasts, notices } = setup()
  const running = { id: 'a', key: 'k', project: 'p', group: 'g', title: 't', state: 'running', startedAt: 1 }
  store.upsert(running)
  const terminal = { ...running, id: 'b', state: 'done', settledAt: 10,
    toast: { success: { title: '完成' } }, notify: { success: { message: 'done' } } }
  c.project([terminal])
  assert.equal(store.get('a').state, 'done', '状态投影折叠到存活 id')
  assert.equal(store.get('a').id, 'a')
  assert.equal(toasts.length, 0, '状态投影不弹卡')
  c.deliverNotice({ id: 'n1', task: terminal })
  assert.equal(toasts.length, 1)
  assert.equal(notices.length, 1)
})

test('加固：终态后迟到的 running 投影不复活、不二次分发', () => {
  const { c, store, toasts } = setup()
  const base = { id: 'a', key: 'k', project: 'p', group: 'g', title: 't', startedAt: 1 }
  const terminal = { ...base, state: 'done', settledAt: 10, toast: { success: { title: '完成' } } }
  c.project([terminal])
  c.deliverNotice({ id: 'n1', task: terminal })
  c.project([{ ...base, state: 'running' }]) // 迟到的状态回放
  c.deliverNotice({ id: 'n1', task: terminal }) // 同一通知 id 再推（模拟 outbox 重放）
  assert.equal(store.get('a').state, 'done')
  assert.equal(store.get('a').settledAt, 10)
  assert.equal(toasts.length, 1, '迟到状态与重复通知都不二次弹')
})

test('加固：parseTaskFrames 遇畸形 JSON 丢该帧、保留好帧，不拆流', () => {
  const got = []
  const rest = parseTaskFrames(
    'event: task\ndata: {bad json}\n\nevent: task\ndata: {"id":"good"}\n\n',
    (x) => got.push(x),
  )
  assert.deepEqual(got, [{ id: 'good' }])
  assert.equal(rest, '')
})

test('加固：onTask 回调抛错不影响后续帧解析', () => {
  const got = []
  parseTaskFrames(
    'event: task\ndata: {"id":"1"}\n\nevent: task\ndata: {"id":"2"}\n\n',
    (x) => { got.push(x.id); if (x.id === '1') throw new Error('consumer bug') },
  )
  assert.deepEqual(got, ['1', '2'])
})

test('加固：执行器旧 dispose 不误删同名重注册（unregister 后）', () => {
  const registry = createExecutorRegistry()
  const h1 = () => ({ outcome: 'done' })
  const h2 = () => ({ outcome: 'done' })
  const dispose1 = registry.register('k', h1)
  registry.unregister('k')
  registry.register('k', h2)
  dispose1()
  assert.equal(registry.get('k'), h2)
})

test('加固：serveTaskStream authorize 同步抛也返回 401，不挂连接', async () => {
  let handler
  const ctx = { inject: (_d, cb) => cb({ webServer: { register: (r) => { handler = r.handler } } }) }
  const res = {
    writeHead: () => {}, end: () => { ended = true }, write: () => true, on: () => {},
  }
  let ended = false
  serveTaskStream(ctx, {
    basePath: '/x',
    authorize: () => { throw new Error('sync fail') },
    source: { snapshot: () => [], subscribe: () => () => {} },
  })
  await handler({}, res)
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(ended, true)
})

test('加固：serveTaskStream 基线期间增量不丢（先订阅后基线回放）', async () => {
  let handler
  const ctx = { inject: (_d, cb) => cb({ webServer: { register: (r) => { handler = r.handler } } }) }
  let listener
  const source = {
    snapshot: () => new Promise((r) => setTimeout(() => r([{ id: 'base', project: 'p', group: 'g', title: 't', state: 'running', startedAt: 1 }]), 5)),
    subscribe: (cb) => { listener = cb; return () => {} },
  }
  const written = []
  const res = {
    writeHead: () => {}, end: () => {},
    write: (c) => { written.push(c); return true }, on: () => {},
  }
  serveTaskStream(ctx, { basePath: '/x', authorize: () => 'v', source, keepAliveMs: 100000 })
  await handler({}, res)
  // 基线 await 期间推一条增量
  setTimeout(() => listener({ id: 'delta', project: 'p', group: 'g', title: 't', state: 'done', startedAt: 2 }), 1)
  await new Promise((r) => setTimeout(r, 15))
  assert.ok(written.some((w) => String(w).includes('"id":"base"')))
  assert.ok(written.some((w) => String(w).includes('"id":"delta"')), '基线窗口内的增量被回放')
})

test('终态行阶段纯由 settledAt + now 派生，重挂后不「恢复」', () => {
  const settledAt = 1_000
  const retain = 60_000
  // 停留 → 退场 → 消失，边界与 EXIT_ANIM_MS=200 对齐
  assert.equal(rowSettlePhase(settledAt, settledAt + 1_000, retain), 'rest')
  assert.equal(rowSettlePhase(settledAt, settledAt + retain - 200, retain), 'leaving')
  assert.equal(rowSettlePhase(settledAt, settledAt + retain, retain), 'gone')
  // 组件重挂：now 前进到很久之后 ⇒ 直接 gone，不会重新显示
  assert.equal(rowSettlePhase(settledAt, settledAt + retain + 5_000, retain), 'gone')
  // retain=0：停留期为负 ⇒ 终态即时消失（不再有 leaving 窗口）
  assert.equal(rowSettlePhase(settledAt, settledAt, 0), 'gone')
})

test('不同 settledAt 的任务在同一 now 处于不同阶段（不会同时消失）', () => {
  const now = 100_000
  const retain = 60_000
  // 三条在不同时间结算：一条还在跑、一条刚进退场、一条已消失
  const early = rowSettlePhase(now - 60_000, now, retain)      // 恰好到 retain ⇒ gone
  const middle = rowSettlePhase(now - 59_900, now, retain)     // retain-100 ⇒ leaving
  const late = rowSettlePhase(now - 10_000, now, retain)       // 还早 ⇒ rest
  assert.equal(early, 'gone')
  assert.equal(middle, 'leaving')
  assert.equal(late, 'rest')
  assert.notEqual(early, late, '不同结算时刻不得同一阶段')
})
