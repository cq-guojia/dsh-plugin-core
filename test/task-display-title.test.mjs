import test from 'node:test'
import assert from 'node:assert/strict'
import { formatDisplayTitle, isDisplayTitle } from '../dist/adv/tasks/index.js'
import { isTaskRecord } from '../dist/adv/tasks/api.js'

const title = { category: '任务结案', description: '后台任务 SSE 401 零延迟无限重连' }
const record = (over = {}) => ({
  id: 'a', project: 'p', group: 'g', title,
  state: 'done', startedAt: 1, settledAt: 2, ...over,
})

test('结构化标题按「分类丨说明」拼接，分隔符用 U+4E28', () => {
  assert.equal(formatDisplayTitle(title), `任务结案\u4E28后台任务 SSE 401 零延迟无限重连`)
})

test('isDisplayTitle 只认两段非空字符串，不判字数', () => {
  assert.equal(isDisplayTitle(title), true)
  assert.equal(isDisplayTitle({ category: '任务', description: 'x'.repeat(500) }), true, '超长不拒，交给跑马灯')
  assert.equal(isDisplayTitle({ category: '  ', description: 'x' }), false)
  assert.equal(isDisplayTitle({ category: 'x', description: '' }), false)
  assert.equal(isDisplayTitle('旧字符串'), false)
  assert.equal(isDisplayTitle(null), false)
})

test('isTaskRecord 收对象标题，拒顶层与 toast 子字段的旧字符串标题', () => {
  assert.equal(isTaskRecord(record()), true)
  assert.equal(isTaskRecord(record({ title: '旧字符串' })), false, '顶层 string 帧一律拒收，不留兜底')
  assert.equal(
    isTaskRecord(record({ toast: { success: { title: { category: '完成', description: 'ok' } } } })),
    true,
    'toast 结构化标题通过',
  )
  assert.equal(
    isTaskRecord(record({ toast: { success: { title: '完成' } } })),
    false,
    '顶层合法但 toast.title 为 string 的帧也要拒，否则会在格式化处抛错后被 safeCall 吞掉',
  )
})
