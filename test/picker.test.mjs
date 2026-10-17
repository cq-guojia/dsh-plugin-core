import test from 'node:test'
import assert from 'node:assert/strict'
import {
  filterGroups,
  flattenOptions,
  groupOf,
  labelsOf,
  toggleValue,
} from '../dist/ui/index.js'
import { setLocale, t } from '../dist/utils/index.js'

const GROUPS = [
  { value: 'openai', label: 'OpenAI', options: [{ value: 'openai/gpt-4', label: 'GPT-4' }, { value: 'openai/gpt-3', label: 'GPT-3' }] },
  { value: 'anthropic', label: 'Anthropic', options: [{ value: 'anthropic/claude', label: 'Claude' }] },
]

test('flattenOptions / labelsOf', () => {
  assert.equal(flattenOptions(GROUPS).length, 3)
  assert.deepEqual(labelsOf(GROUPS, ['openai/gpt-4', 'anthropic/claude']), ['GPT-4', 'Claude'])
  assert.deepEqual(labelsOf(GROUPS, ['nope']), [])
})

test('filterGroups 整组无命中则去掉整组', () => {
  assert.equal(filterGroups(GROUPS, 'gpt').length, 1)
  assert.equal(filterGroups(GROUPS, 'claude')[0].value, 'anthropic')
  assert.equal(filterGroups(GROUPS, 'zzz').length, 0)
  assert.equal(filterGroups(GROUPS, '  ').length, 2) // 空白视为不过滤
})

test('toggleValue 达上限不添加、也不静默截断', () => {
  assert.deepEqual(toggleValue(['a'], 'b'), ['a', 'b'])
  assert.deepEqual(toggleValue(['a', 'b'], 'a'), ['b'])
  assert.deepEqual(toggleValue(['a', 'b'], 'c', 2), ['a', 'b']) // 到上限
  assert.deepEqual(toggleValue(['a'], 'b', 2), ['a', 'b'])
})

test('groupOf 反推 provider（cascade 形态用）', () => {
  assert.equal(groupOf(GROUPS, 'anthropic/claude').value, 'anthropic')
  assert.equal(groupOf(GROUPS, ''), undefined)
  assert.equal(groupOf(GROUPS, 'nope'), undefined)
})

test('选择器固定提示语自带中英，且可传自定义 t 覆盖', () => {
  setLocale('zh')
  assert.equal(t('pickerEmpty'), '暂无可选')
  assert.equal(t('pickerSelected', { n: 3 }), '已选 3 项')
  assert.equal(t('modelProvider'), '供应商')
  setLocale('en')
  assert.equal(t('pickerEmpty'), 'No options')
  assert.equal(t('modelModel'), 'Model')
  setLocale('zh')
  assert.equal(t('pickerEmpty', undefined, ), '暂无可选')
})
