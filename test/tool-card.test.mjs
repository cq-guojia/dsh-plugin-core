// 工具卡专属卡模型的纯函数自检：grep/glob → SearchBlock、web_* → WebBlock。
// mirror 组件经 official.js 静态 import 官方包 ⇒ Node 里要先挂替身解析钩子再动态导入。
import test from 'node:test'
import assert from 'node:assert/strict'
import { register } from 'node:module'

register(new URL('./primitives-hooks.mjs', import.meta.url))
const { searchCardModel, webCardModel, toolTitleKey, readCallLine } = await import('../dist/session/mirror/GenericCommandCard.js')

const { askCardModel } = await import('../dist/session/mirror/AskCard.js')
const tt = (key, params) => (params === undefined ? key : `${key}:${JSON.stringify(params)}`)
const { detailsCardModel, detailsSummary } = await import('../dist/session/mirror/ToolDetails.js')

test('detailsCardModel：定时任务列表 / 目标详情；形状不全或未结算落回 ioCard', () => {
  const args = JSON.stringify({})
  const schedule = {
    id: 's1', prompt: '提醒我', title: '晨会', scheduledAt: '2026-11-05T08:00:00.000Z',
    deliveryMode: 'host', state: 'scheduled', kind: 'daily', time: '08:00:00.000', timeZone: 'Asia/Shanghai',
  }
  const list = detailsCardModel('schedule_list', args, JSON.stringify([schedule, schedule]), true, false, tt)
  assert.equal(list.summary, 'detailScheduleCount:{"count":2}')
  assert.equal(detailsSummary(list), list.summary)
  assert.equal(list.items[0].title, '晨会')
  assert.equal(list.items[0].fields[1].label, 'detailScheduleFrequency')

  const goal = {
    goal: { id: 'g1', objective: '完成对齐', revision: 1, roundsStarted: 2, maxGoalRounds: 5, phase: 'blocked', blockedReason: { code: 'x', message: '缺数据' } },
    activation: 'armed',
  }
  const goalCard = detailsCardModel('get_goal', args, JSON.stringify(goal), true, false, tt)
  assert.equal(goalCard.items[0].title, '完成对齐')
  assert.equal(goalCard.items[0].fields[2].value, '缺数据')
  assert.equal(detailsCardModel('get_goal', args, JSON.stringify({ goal: null }), true, false, tt).empty, 'detailGoalEmpty')
  assert.equal(detailsCardModel('get_goal', args, JSON.stringify(goal), false, false, tt), null)
  assert.equal(detailsCardModel('get_goal', args, JSON.stringify(goal), true, true, tt), null)
  assert.equal(detailsCardModel('cordis_inspect_list', args, JSON.stringify(goal), true, false, tt), null)
})

test('controlDetails / inspectionDetails：JSON 巡检、文本回执、lsp hover', () => {
  const inspected = detailsCardModel('cordis_inspect_list', '{}', JSON.stringify({ providers: [{ id: 'p1', status: 'ready' }] }), true, false, tt)
  assert.equal(inspected.items.length, 1)
  assert.equal(inspected.items[0].badge.tone, 'neutral')
  assert.equal(inspected.caption, 'detailRecordedResult')

  const signal = detailsCardModel('terminal_signal', JSON.stringify({ sessionId: 't1' }), 'delivered SIGINT to foreground process group 42', true, false, tt)
  assert.equal(signal.items[0].fields.length, 2)
  assert.equal(signal.items[0].fields[0].value, 'SIGINT')
  assert.equal(detailsCardModel('job_list', '{}', '(no background jobs)', true, false, tt).items.length, 0)

  const hover = detailsCardModel('lsp', JSON.stringify({ file_path: 'a.ts', line: 3, character: 1, operation: 'hover' }), 'hover text', true, false, tt)
  assert.equal(hover.items[0].markdown, 'hover text')
  assert.deepEqual(hover.items[0].location, { path: 'a.ts', line: 3 })
  assert.equal(detailsCardModel('cordis_inspect_list', '{}', 'not json', true, false, tt), null)
})

test('askCardModel：取消/中断改摘要与态，有答案则配对成问答卡', () => {
  const args = JSON.stringify({ questions: [{ id: 'q1', question: '先做哪个？' }] })
  const cancelled = askCardModel('ask_user_question', args, '', 'ASK_CANCELLED', true, tt)
  assert.equal(cancelled.summary, 'askCancelled')
  assert.equal(cancelled.state, 'ok')
  assert.equal(cancelled.card.kind, 'unanswered')
  assert.deepEqual(cancelled.card.questions, [{ id: 'q1', question: '先做哪个？' }])
  assert.equal(askCardModel('ask_user_question', args, '', 'ASK_ABORTED', true, tt).state, 'stopped')
  assert.equal(askCardModel('ask_user_question', args, '', undefined, false, tt).summary, 'askWaiting')

  const output = JSON.stringify({ answers: [{ id: 'q1', selected: ['A'], custom: 'B' }] })
  const answered = askCardModel('ask_user_question', args, output, undefined, true, tt)
  assert.equal(answered.summary, 'askAnswered:{"answered":1,"total":1}')
  assert.deepEqual(answered.card.questions, [{ id: 'q1', question: '先做哪个？', answers: ['A', 'B'] }])
  assert.equal(answered.card.skippedLabel, 'askSkipped')

  assert.equal(askCardModel('read', args, output, undefined, true, tt), null)
  assert.equal(askCardModel('ask_user_question', args, '{"answers":"oops"}', undefined, true, tt), null)
})

test('readCallLine：read 的 offset 即落点行，参数非法不给行', () => {
  assert.equal(readCallLine('read', JSON.stringify({ file_path: 'a.ts', offset: 12 })), 12)
  assert.equal(readCallLine('read', JSON.stringify({ file_path: 'a.ts' })), undefined)
  assert.equal(readCallLine('read', JSON.stringify({ file_path: 'a.ts', offset: 0 })), undefined)
  assert.equal(readCallLine('write', JSON.stringify({ file_path: 'a.ts', offset: 3 })), undefined)
})

test('toolTitleKey：专属标题优先，未知工具落 generic', () => {
  assert.equal(toolTitleKey('grep'), 'toolTitleGrep')
  assert.equal(toolTitleKey('terminal_close'), 'toolTitleCloseTerminal')
  assert.equal(toolTitleKey('no_such_tool'), 'toolTitleGeneric')
})

test('searchCardModel：grep 分组匹配 + 截断时把完整结果摊成 recovery', () => {
  const meta = { shape: 'matches', files: [{ path: 'a.ts', matches: [{ lineNumber: 7, line: 'x' }] }], total: 9, truncated: true }
  const face = searchCardModel('grep', JSON.stringify({ pattern: 'x', path: 'src' }), '完整结果', meta, false, true)
  assert.equal(face.card.kind, 'matches')
  assert.deepEqual(face.card.files, [{ path: 'a.ts', matches: [{ lineNumber: 7, line: 'x' }] }])
  assert.equal(face.card.total, 9)
  assert.equal(face.recovery, '完整结果')
})

test('searchCardModel：glob 扁平路径；无 meta / 出错 / 空 pattern 落回 ioCard', () => {
  const meta = { shape: 'paths', paths: ['a.ts'], total: 1, truncated: false }
  assert.equal(searchCardModel('glob', JSON.stringify({ pattern: '*.ts' }), '', meta, false, true).card.kind, 'paths')
  assert.equal(searchCardModel('grep', JSON.stringify({ pattern: 'x' }), '', undefined, false, true), null)
  assert.equal(searchCardModel('grep', JSON.stringify({ pattern: 'x' }), '', meta, true, true), null)
  assert.equal(searchCardModel('grep', JSON.stringify({ pattern: '' }), '', meta, false, true), null)
})

test('webCardModel：web_search 答案+来源 / web_fetch 状态码，缺字段落回 ioCard', () => {
  const search = webCardModel('web_search', JSON.stringify({ queries: ['q'] }), { answer: 'A', sources: [{ url: 'https://a' }], truncated: false }, false, true)
  assert.deepEqual(search, { kind: 'search', answer: 'A', sources: [{ url: 'https://a' }], truncated: false })
  const fetch = webCardModel('web_fetch', JSON.stringify({ url: 'https://a' }), { url: 'https://a', statusCode: 200, truncated: true }, false, true)
  assert.deepEqual(fetch, { kind: 'fetch', url: 'https://a', statusCode: 200, truncated: true })
  assert.equal(webCardModel('web_fetch', JSON.stringify({ url: 'https://a' }), { url: 'https://a' }, false, true), null)
})
