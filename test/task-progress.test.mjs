import test from 'node:test'
import assert from 'node:assert/strict'
import { createTaskStore } from '../dist/adv/tasks/store.js'
import { isTaskProgress } from '../dist/adv/tasks/model.js'
import { isTaskRecord, projectTasks, taskCenterStore } from '../dist/adv/tasks/api.js'
import { createCoordinator } from '../dist/adv/tasks/coordinator.js'
import { createExecutorRegistry } from '../dist/runtime/index.js'
import { parseTaskFrames } from '../dist/adv/tasks/stream.js'

const title = (description) => ({ category: '任务', description })
const rec = (over = {}) => ({
  id: 'a', project: 'p', group: 'g', title: title('t'), state: 'running', startedAt: 1, ...over,
})
const prog = (message, updatedAt, extra = {}) => ({ message, updatedAt, ...extra })

test('progress：isTaskProgress 只收合法形状，坏值一律拒', () => {
  assert.equal(isTaskProgress(prog('ok', 1)), true)
  assert.equal(isTaskProgress({ ...prog('ok', 1), current: 1, total: 2, percent: 50 }), true)
  assert.equal(isTaskProgress(null), false)
  assert.equal(isTaskProgress({ message: 'x' }), false, '缺 updatedAt')
  assert.equal(isTaskProgress({ updatedAt: 1 }), false, '缺 message')
  assert.equal(isTaskProgress({ message: 1, updatedAt: 1 }), false, 'message 非字符串')
  assert.equal(isTaskProgress({ message: 'x', updatedAt: Number.NaN }), false, 'updatedAt 非有限数')
  assert.equal(isTaskProgress({ message: 'x', updatedAt: 1, percent: '50' }), false, '数值字段非数')
})

test('progress：upsert 缺字段保留旧值（终态帧不带 progress 也保留）', () => {
  const s = createTaskStore()
  s.upsert(rec({ progress: prog('处理到第 3 条', 100) }))
  const done = s.upsert(rec({ state: 'done', settledAt: 200 })).task
  assert.deepEqual(done.progress, prog('处理到第 3 条', 100), '终态整条替换仍保住最后文字')
})

test('progress：merge 增量缺字段保留旧值', () => {
  const s = createTaskStore()
  s.upsert(rec({ progress: prog('旧', 10) }))
  s.merge([rec({ state: 'running' })])
  assert.deepEqual(s.get('a').progress, prog('旧', 10))
})

test('progress：mergeBaseline 缺字段保留旧值', () => {
  const s = createTaskStore()
  s.upsert(rec({ progress: prog('基线前', 10) }))
  s.mergeBaseline([rec({ state: 'running' })])
  assert.deepEqual(s.get('a').progress, prog('基线前', 10))
})

test('progress：乱序旧帧被丢弃，新文字不被盖回', () => {
  const s = createTaskStore()
  s.upsert(rec({ progress: prog('新', 100) }))
  s.merge([rec({ progress: prog('旧', 50) })])
  assert.equal(s.get('a').progress.message, '新')
  // 同 updatedAt 后到覆盖（确定性裁决）
  s.merge([rec({ progress: prog('同刻后到', 100) })])
  assert.equal(s.get('a').progress.message, '同刻后到')
})

test('progress：跨运行不继承旧文字，跨运行的旧 updatedAt 也不挡新值', () => {
  const s = createTaskStore()
  s.upsert(rec({ key: 'k', state: 'done', settledAt: 50, progress: prog('上一次', 100) }))
  // 带 key 的新运行才允许覆盖终态（无 key 时终态是最终事实，running 一律被守卫挡住）。
  s.merge([rec({ key: 'k', startedAt: 200, state: 'running' })])
  assert.equal(s.get('a').progress, undefined, '新运行不带旧文字，即便旧 updatedAt 更大')
  s.merge([rec({ key: 'k', startedAt: 200, progress: prog('这一次', 1) })])
  assert.equal(s.get('a').progress.message, '这一次', '跨运行按新帧，不比 updatedAt')
})

test('progress：坏形状帧只剥离该字段，其余状态照常投影', () => {
  const s = createTaskStore()
  s.upsert(rec({ progress: prog('保留', 10) }))
  s.merge([rec({ state: 'running', progress: { message: 123, updatedAt: 999 } })])
  assert.deepEqual(s.get('a').progress, prog('保留', 10), '坏值不进 store，旧值保留')
})

test('progress：相同内容不触发 publish（revision 不变）', () => {
  const s = createTaskStore()
  s.upsert(rec({ progress: prog('x', 1) }))
  const before = s.getSnapshot().revision
  s.upsert(rec({ progress: prog('x', 1) }))
  assert.equal(s.getSnapshot().revision, before, '内容相同的帧不发多余通知')
  s.upsert(rec({ progress: prog('x', 2) }))
  assert.equal(s.getSnapshot().revision, before + 1, 'updatedAt 变了才算变更')
  // stableJson 的动机：键序不同但内容相同的对象不得误判成变更
  s.upsert(rec({ progress: { updatedAt: 2, message: 'x' } }))
  assert.equal(s.getSnapshot().revision, before + 1, 'progress 键序不同不算变更')
})

test('跨运行：新 running 清掉旧终态的 settledAt，避免停留时钟被旧行污染', () => {
  const s = createTaskStore()
  s.upsert(rec({ key: 'k', state: 'done', settledAt: 50 }))
  s.merge([rec({ key: 'k', startedAt: 200, state: 'running' })])
  assert.equal(s.get('a').settledAt, undefined, '新运行不带旧结算时刻')
})

test('getByKey：按 (project,key) 取归一后的存活行', () => {
  const s = createTaskStore()
  s.upsert(rec({ id: 'local', key: 'k', progress: prog('x', 1) }))
  s.merge([rec({ id: 'srv', key: 'k', progress: prog('y', 2) })])
  assert.equal(s.getByKey('p', 'k').id, 'local', '取到归一后的存活 id')
  assert.equal(s.getByKey('p', 'k').progress.message, 'y')
  assert.equal(s.getByKey('p', 'missing'), undefined)
  assert.equal(s.getByKey('other', 'k'), undefined)
})

test('边界：projectTasks / ingest 对坏 progress 与缺 settledAt 的处理各自正确', () => {
  const badProgress = rec({ id: 'bad-progress', progress: { message: null, updatedAt: 1 } })
  const badTerminal = rec({ id: 'bad-terminal', state: 'done' })
  projectTasks([badProgress, badTerminal])
  assert.ok(taskCenterStore.get('bad-progress'), '坏 progress 不毁整帧，任务照常进列表')
  assert.equal(taskCenterStore.get('bad-progress').progress, undefined)
  assert.equal(taskCenterStore.get('bad-terminal'), undefined, '终态缺 settledAt 仍整帧拒收')
  taskCenterStore.clearAll()
})

test('SSE 帧解析：坏 progress 与坏 rowButtons 的原始帧能正常解析成对象', () => {
  const frame = (extra) => `event: task\ndata: ${JSON.stringify(rec(extra))}\n\n`
  let parsed
  parseTaskFrames(
    frame({ id: 'sse-bad', progress: { message: 1, updatedAt: 2 }, rowButtons: 'not-an-array' }),
    (task, snapshot) => { parsed = { task, snapshot } },
  )
  assert.equal(parsed.snapshot, false)
  assert.equal(parsed.task.id, 'sse-bad')
  // sanitizeTask 对这两个字段的剥离由下面的 projectTasks 用例验证（同一函数、四条入口共用）
})

test('边界：坏 rowButtons 被剥离，合法按钮保留', () => {
  const bad = rec({ id: 'bad-btn', rowButtons: 'bad' })
  const good = rec({ id: 'good-btn', rowButtons: [{ id: 'b', text: '查看', when: 'done' }] })
  projectTasks([bad, good])
  assert.ok(taskCenterStore.get('bad-btn'))
  assert.equal(taskCenterStore.get('bad-btn').rowButtons, undefined, '坏按钮数组被剥离，任务不毁')
  assert.equal(taskCenterStore.get('good-btn').rowButtons.length, 1, '合法按钮原样保留')
  taskCenterStore.clearAll()
})

test('isTaskRecord：progress 可选，不因缺字段或坏形状拒收整帧（形状由 isTaskProgress 判）', () => {
  assert.equal(isTaskRecord(rec({ progress: prog('ok', 1) })), true)
  assert.equal(isTaskRecord(rec()), true, '不带 progress 合法')
  assert.equal(isTaskRecord(rec({ progress: { message: 1 } })), true, 'progress 坏由 sanitize 剥离，不在整帧闸拒收')
})

test('coordinator：本地多次 report 的 updatedAt 严格单调递增', async () => {
  const registry = createExecutorRegistry()
  let report
  registry.register('job', (_args, ctx) => {
    report = ctx.report
    return new Promise(() => {})
  })
  const store = createTaskStore()
  const c = createCoordinator({ store, registry })
  const task = c.start({ project: 'p', title: title('t'), kind: 'job' })
  await new Promise((r) => setTimeout(r, 0))
  report({ message: '第一段' })
  const t1 = store.get(task.id).progress.updatedAt
  report({ message: '第二段' })
  const t2 = store.get(task.id).progress.updatedAt
  report({ message: '第三段' })
  const t3 = store.get(task.id).progress.updatedAt
  assert.ok(t2 > t1, `第二次上报时间戳须更大：${t1} → ${t2}`)
  assert.ok(t3 > t2, `第三次上报时间戳须更大：${t2} → ${t3}`)
  assert.equal(store.get(task.id).progress.message, '第三段')
})
