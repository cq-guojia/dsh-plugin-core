import test from 'node:test'
import assert from 'node:assert/strict'
import { createCoordinator } from '../dist/adv/tasks/coordinator.js'
import { createTaskStore } from '../dist/adv/tasks/store.js'
import { createExecutorRegistry } from '../dist/runtime/index.js'
import { parseTaskFrames } from '../dist/adv/tasks/stream.js'
import { isTaskRecord, projectTasks, taskCenterStore } from '../dist/adv/tasks/api.js'
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

test('契约：终态帧必带有限数 settledAt，running 帧不得带', () => {
  const base = { id: 'a', project: 'p', group: 'g', title: 't', state: 'done', startedAt: 1 }
  assert.equal(isTaskRecord({ ...base, settledAt: 2 }), true, '终态带合法结算时刻通过')
  assert.equal(isTaskRecord(base), false, '终态缺 settledAt 必须拒收（否则 UI 永不退场 + 假计时）')
  assert.equal(isTaskRecord({ ...base, settledAt: Number.NaN }), false, '非有限数拒收')
  assert.equal(isTaskRecord({ ...{ ...base, state: 'running' }, settledAt: 2 }), false, 'running 不得带结算时刻')
  assert.equal(isTaskRecord({ ...base, state: 'running' }), true, 'running 无结算时刻通过')
})

test('加固：终态投影后迟到的 running 不复活（guard 依赖状态而非时间戳）', () => {
  const s = createTaskStore()
  s.upsert({ id: 'a', project: 'p', group: 'g', title: 't', state: 'running', startedAt: 1 })
  const changed = s.merge([{ id: 'a', project: 'p', group: 'g', title: 't', state: 'done', startedAt: 1, settledAt: 9 }])
  assert.equal(changed.length, 1)
  assert.equal(s.get('a').state, 'done')
  const revived = s.merge([{ id: 'a', project: 'p', group: 'g', title: 't', state: 'running', startedAt: 100 }])
  assert.equal(revived.length, 0, '终态后的 running 帧被静默丢弃')
  assert.equal(s.get('a').state, 'done', '状态保持终态')
  assert.equal(s.get('a').settledAt, 9, '结算时刻未被 running 帧擦除')
})

test('契约：projectTasks 手动投影入口也拒收缺 settledAt 的终态帧（与 SSE 同一道闸）', () => {
  const bad = { id: 'pt-bad', project: 'p', group: 'g', title: 't', state: 'done', startedAt: 1 }
  const good = { id: 'pt-good', project: 'p', group: 'g', title: 't', state: 'done', startedAt: 1, settledAt: 9 }
  projectTasks([bad, good])
  assert.equal(taskCenterStore.get('pt-bad'), undefined, '缺时刻的终态帧被拒收，不进 store')
  assert.equal(taskCenterStore.get('pt-good')?.state, 'done', '合法终态帧照常投影')
  taskCenterStore.clearAll()
})

test('加固：终态缺 settledAt 的历史脏数据也不会被迟到 running 复活（判据是状态不是时钟）', () => {
  const s = createTaskStore()
  // 直接 upsert 一条终态但无 settledAt 的脏数据（绕过 isTaskRecord，模拟旧版本留下的数据）。
  // 旧 guard 以「有无 settledAt」为判据会放行迟到 running；新 guard 以状态为判据必须挡住。
  s.upsert({ id: 'dirty', project: 'p', group: 'g', title: 't', state: 'done', startedAt: 1 })
  assert.equal(s.get('dirty').state, 'done')
  assert.equal(s.get('dirty').settledAt, undefined)
  const revived = s.merge([{ id: 'dirty', project: 'p', group: 'g', title: 't', state: 'running', startedAt: 100 }])
  assert.equal(revived.length, 0, '即便旧记录无结算时刻，终态也不被 running 复活')
  assert.equal(s.get('dirty').state, 'done', '状态保持终态')
})

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

test('加固：服务端投影缺 origin / panelId 时保留本地发起身份', () => {
  const s = createTaskStore()
  const local = {
    id: 'a', project: 'p', group: 'g', title: 't', state: 'running', startedAt: 1,
    origin: 'tab-a', panelId: 'panel-a',
  }
  s.upsert(local)
  // 消费方服务端未在 submit 回传这两个身份字段（防御性模拟）⇒ 不能把本地身份冲掉。
  s.merge([{ id: 'a', project: 'p', group: 'g', title: 't', state: 'done', startedAt: 1, settledAt: 9 }])
  assert.equal(s.get('a').origin, 'tab-a', 'origin 不丢，scope=origin 判定不退化')
  assert.equal(s.get('a').panelId, 'panel-a', 'panelId 不丢，点按钮仍切回发起面板')
})

test('加固：同 key 不同服务端 id 的终态通知，panelId/origin 不被全量 upsert 抹掉', () => {
  const { c, store, toasts } = setup()
  // 乐观行（submit 阶段记下 panelId / origin，id=local）。
  store.upsert({ id: 'local', key: 'k', project: 'p', group: 'g', title: 't',
    state: 'running', startedAt: 1, panelId: 'panel-a', origin: 'tab-a' })
  // 服务端终态通知换了新的服务端 id，且没回填 panelId / origin。
  const terminal = { id: 'srv-99', key: 'k', project: 'p', group: 'g', title: 't',
    state: 'done', startedAt: 1, settledAt: 10, toast: { success: { title: '完成' } } }
  c.deliverNotice({ id: 'n1', task: terminal })
  const row = store.get('local')
  assert.ok(row, '存活行仍是本地 id（按 key 归一）')
  assert.equal(row.panelId, 'panel-a', '同 key 不同 id 的通知不抹掉 panelId')
  assert.equal(row.origin, 'tab-a', 'origin 同样保留')
  assert.equal(toasts.length, 1)
  assert.equal(toasts[0].task.panelId, 'panel-a', 'toast 载荷里也带 panelId（点按钮能跳回面板）')
})

test('加固：终态先投影再通知（merge 无变化），身份字段仍不被抹掉', () => {
  const { c, store, toasts } = setup()
  store.upsert({ id: 'local', key: 'k', project: 'p', group: 'g', title: 't',
    state: 'running', startedAt: 1, panelId: 'panel-a', origin: 'tab-a' })
  const terminal = { id: 'srv-99', key: 'k', project: 'p', group: 'g', title: 't',
    state: 'done', startedAt: 1, settledAt: 10, toast: { success: { title: '完成' } } }
  // 正常 SSE 顺序：state 帧先把终态投影进来（按 key 归一、保住本地身份，merge 有变化）。
  c.project([terminal])
  // notice 帧随后到达，settledAt=20 与已投影的 10 不同：
  // 同 key 再 merge 一次身份字段无变化，但 settledAt 有变化 ⇒ merge 返回变更行；
  // 即便如此，对外载荷必须取 upsert 归一后的行（身份字段来自本地发起记录，settledAt 先到优先）。
  c.deliverNotice({ id: 'n1', task: { ...terminal, settledAt: 20 } })
  assert.equal(store.get('local').panelId, 'panel-a', '先投影后通知也不丢 panelId')
  assert.equal(store.get('local').origin, 'tab-a', 'origin 同样不丢')
  assert.equal(store.get('local').settledAt, 10, 'settledAt 先到优先，不被通知的 20 改写')
  assert.equal(toasts.length, 1)
  assert.equal(toasts[0].task.panelId, 'panel-a', 'toast 载荷带保住的 panelId')
  assert.equal(toasts[0].task.settledAt, 10, 'toast 载荷的 settledAt 也取先到的 10')
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

test('加固：按钮 handler 抛异常不冒泡，press 仍返回 true（联络点不替被调方修 bug）', () => {
  const { c, store, registry } = setup()
  registry.register('noop', () => ({ outcome: 'done' }))
  const task = c.start({ project: 'p', title: 't', kind: 'noop' })
  let threw = false
  c.registerHandlers({
    boom: () => { throw new Error('consumer bug') },
  })
  try {
    const ok = c.press('boom', task.id)
    assert.equal(ok, true, '找到并调用了 handler ⇒ true，错误只记日志')
    assert.equal(store.get(task.id).state, 'running', '核心未被 handler 异常打断')
  } catch {
    threw = true
  }
  assert.equal(threw, false, '异常不得冒泡到点击链')
})

test('加固：isTaskRecord 拒收 settledAt 非数字的帧，running 帧无 settledAt 仍通过', () => {
  const base = { id: 'x', project: 'p', group: 'g', title: 't', state: 'done', startedAt: 1 }
  assert.equal(isTaskRecord({ ...base, settledAt: 'oops' }), false, '字符串 settledAt 被拒（避免 NaN）')
  assert.equal(isTaskRecord({ ...base, settledAt: Number.NaN }), false, 'NaN 被拒')
  assert.equal(isTaskRecord({ ...base, settledAt: 123 }), true, '数字 settledAt 通过')
  assert.equal(isTaskRecord({ ...base, state: 'running', settledAt: undefined }), true, 'running 帧无 settledAt 通过')
  assert.equal(isTaskRecord({ ...base, state: 'running' }), true, 'running 帧根本没这个字段也通过')
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
  let ended = false
  let status = 200
  const res = {
    writeHead: (s) => { status = s }, end: () => { ended = true }, write: () => true, on: () => {},
  }
  serveTaskStream(ctx, {
    basePath: '/x',
    authorize: () => { throw new Error('sync fail') },
    source: { snapshot: () => [], subscribe: () => () => {} },
  })
  await handler({}, res)
  await new Promise((r) => setTimeout(r, 0))
  assert.equal(ended, true)
  assert.equal(status, 401, '鉴权失败明确回 401')
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
