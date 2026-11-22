import test from 'node:test'
import assert from 'node:assert/strict'
import { createTaskStore, isSettled, visibleButtons } from '../dist/adv/tasks/store.js'
import { buttonsForState, notifyForState, toastForState } from '../dist/adv/tasks/model.js'

function rec(over = {}) {
  return { id: 'a', project: 'p', group: 'g', title: 't', state: 'running', startedAt: 1, ...over }
}

test('store：同 (project,key) 幂等 upsert，复用同一 id', () => {
  const s = createTaskStore()
  const first = s.upsert(rec({ key: 'k', title: 'one' }))
  assert.equal(first.created, true)
  const second = s.upsert(rec({ id: 'b', key: 'k', title: 'two' }))
  assert.equal(second.created, false)
  assert.equal(second.task.title, 'two')
  assert.equal(s.getSnapshot().tasks.length, 1)
  assert.equal(s.getSnapshot().tasks[0].id, 'a')
})

test('store：按 project / group 过滤，project=null 收全部', () => {
  const s = createTaskStore()
  s.upsert(rec({ id: '1', project: 'p1', group: 'g1' }))
  s.upsert(rec({ id: '2', project: 'p1', group: 'g2' }))
  s.upsert(rec({ id: '3', project: 'p2', group: 'g1' }))
  assert.equal(s.select('p1').length, 2)
  assert.equal(s.select('p1', ['g1']).length, 1)
  assert.equal(s.select(null).length, 3)
})

test('store：终态不会被迟到的 running 投影复活', () => {
  const s = createTaskStore()
  s.upsert(rec({ key: 'k', state: 'done', settledAt: 10 }))
  s.merge([rec({ key: 'k', state: 'running', startedAt: 1 })])
  assert.equal(s.get('a').state, 'done')
})

test('store：handlers 增量注册 + 注销只删自己那份', () => {
  const s = createTaskStore()
  const h1 = () => {}
  const h2 = () => {}
  const dispose1 = s.registerHandlers({ open: h1 })
  s.registerHandlers({ open: h2 })
  dispose1()
  assert.equal(s.getHandler('open'), h2)
})

test('store：终态订阅只由显式 emit 触发', () => {
  const s = createTaskStore()
  let seen
  s.onSettled((x) => { seen = x })
  s.upsert(rec({ state: 'done' }))
  assert.equal(seen, undefined)
  s.emitSettled({ outcome: 'done', task: rec({ state: 'done' }) })
  assert.equal(seen.outcome, 'done')
})

test('model：按钮按 when 过滤；toast/notify 按态取，整态缺省为无', () => {
  const buttons = [
    { id: 'v', text: '查看', when: 'running' },
    { id: 'l', text: '日志', when: 'done' },
    { id: 'a', text: '总是' },
  ]
  assert.deepEqual(buttonsForState(buttons, 'done').map((b) => b.id), ['l', 'a'])
  assert.deepEqual(buttonsForState(buttons, 'failed').map((b) => b.id), ['a'])
  assert.deepEqual(visibleButtons(rec({ rowButtons: buttons })).map((b) => b.id), ['v', 'a'])
  const cfg = { success: { title: 'ok' }, failure: { title: 'no' } }
  assert.equal(toastForState(cfg, 'done').title, 'ok')
  assert.equal(toastForState(cfg, 'failed').title, 'no')
  assert.equal(toastForState(cfg, 'running'), undefined)
  assert.equal(notifyForState({ success: { message: 'x' } }, 'failed'), undefined)
})

test('model：isSettled 只认 done/failed', () => {
  assert.equal(isSettled('running'), false)
  assert.equal(isSettled('done'), true)
  assert.equal(isSettled('failed'), true)
})


test('store：getBaseline 排除本地乐观行，回滚前后都不外泄幽灵 running（消费方 #6）', () => {
  const s = createTaskStore()
  const confirmed = rec({ id: 'srv-1', key: 'k1', state: 'done', startedAt: 1, settledAt: 2 })
  s.merge([confirmed])
  const optimistic = s.upsert(rec({ id: 'submit:p\u0000k2', key: 'k2' })).task
  const baseline = s.getBaseline()
  assert.ok(baseline.some((t) => t.id === 'srv-1'), '真源行照常进基线')
  assert.ok(!baseline.some((t) => t.id === optimistic.id), '本地乐观行不进跨标签基线')
  assert.equal(s.getSnapshot().tasks.some((t) => t.id === optimistic.id), true, '乐观行本地仍可见')
  s.removeRunning(optimistic.id)
  assert.equal(s.getBaseline().some((t) => t.id === optimistic.id), false, '回滚后基线干净')
})

test('store：handler 按 project 命名空间，同 id 不同项目互不覆盖，裸 id 兜底', () => {
  const s = createTaskStore()
  const hA = () => {}
  const hB = () => {}
  const hGlobal = () => {}
  const offA = s.registerHandlers({ open: hA }, 'proj-a')
  s.registerHandlers({ open: hB }, 'proj-b')
  s.registerHandlers({ open: hGlobal }) // 跨项目兜底
  assert.equal(s.getHandler('open', 'proj-a'), hA)
  assert.equal(s.getHandler('open', 'proj-b'), hB)
  assert.equal(s.getHandler('open', 'proj-c'), hGlobal, '未命中的项目回退裸 id')
  offA()
  assert.equal(s.getHandler('open', 'proj-a'), hGlobal, '注销只删本项目的，落回兜底')
  assert.equal(s.getHandler('open', 'proj-b'), hB, '别的项目不受影响')
})
