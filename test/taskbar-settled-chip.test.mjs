import test from 'node:test'
import assert from 'node:assert/strict'
import { settledChipOf, disclosureVisibleOf } from '../dist/adv/tasks/TaskBar.js'
import { setLocale, t } from '../dist/utils/i18n.js'

test('终态标签按 state 区分成功 / 失败，认不出来才用中性完成', () => {
  assert.deepEqual(settledChipOf('done'), { tone: 'success', key: 'taskbarSucceeded' })
  assert.deepEqual(settledChipOf('failed'), { tone: 'danger', key: 'taskbarFailed' })
  assert.deepEqual(settledChipOf(undefined), { tone: 'neutral', key: 'taskbarDone' }, '缺字段不假成功')
  assert.deepEqual(settledChipOf('running'), { tone: 'neutral', key: 'taskbarDone' }, '未知状态不假成功')
})

test('披露文字只在运行中显示：终态连文字带扫光一起退场', () => {
  assert.equal(disclosureVisibleOf(false), true, 'running 显示披露文字与扫光')
  assert.equal(disclosureVisibleOf(true), false, '终态不渲染文字——标签已表达结束')
})

test('终态标签中英文案齐备', () => {
  setLocale('zh')
  assert.equal(t('taskbarSucceeded'), '成功')
  assert.equal(t('taskbarFailed'), '失败')
  assert.equal(t('taskbarDone'), '已完成')
  setLocale('en')
  assert.equal(t('taskbarSucceeded'), 'Succeeded')
  assert.equal(t('taskbarFailed'), 'Failed')
  assert.equal(t('taskbarDone'), 'Done')
  setLocale(null)
})
