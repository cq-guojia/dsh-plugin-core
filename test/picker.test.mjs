import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  filterGroups,
  flattenOptions,
  groupOf,
  labelsOf,
  resolveMenuSizing,
  resolveTriggerSizing,
  retainSelectedValue,
  sliceGroups,
  toFlatOptions,
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

test('toFlatOptions：平铺成「厂商-模型」，value 原样、空组名不加前缀', () => {
  assert.deepEqual(toFlatOptions(GROUPS), [
    { value: 'openai/gpt-4', label: 'OpenAI-GPT-4' },
    { value: 'openai/gpt-3', label: 'OpenAI-GPT-3' },
    { value: 'anthropic/claude', label: 'Anthropic-Claude' },
  ])
  assert.deepEqual(toFlatOptions([{ value: '', label: '', options: [{ value: '', label: '默认模型' }] }]), [
    { value: '', label: '默认模型' },
  ])
  assert.deepEqual(toFlatOptions([]), [])
})

test('filterGroups 整组无命中则去掉整组', () => {
  assert.equal(filterGroups(GROUPS, 'gpt').length, 1)
  assert.equal(filterGroups(GROUPS, 'claude')[0].value, 'anthropic')
  assert.equal(filterGroups(GROUPS, 'zzz').length, 0)
  assert.equal(filterGroups(GROUPS, '  ').length, 2) // 空白视为不过滤
})

test('filterGroups 大小写不敏感，keywords 只参与搜索', () => {
  const groups = [
    {
      value: 'g', label: 'Group', options: [
        { value: 'a', label: '任务甲', keywords: 'task-uuid-1234' },
        { value: 'b', label: 'GPT-4' },
      ],
    },
  ]
  assert.equal(filterGroups(groups, 'gpt')[0].options.length, 1)
  assert.equal(filterGroups(groups, 'TASK-UUID')[0].options[0].value, 'a')
  assert.equal(filterGroups(groups, 'uuid-1234')[0].options.length, 1)
  assert.equal(filterGroups(groups, '甲')[0].options[0].value, 'a')
  assert.equal(filterGroups(groups, '任务甲 task')[0].options.length, 1) // label 与 keywords 拼起来匹配
  assert.equal(filterGroups(groups, 'zzz').length, 0)
})

test('平铺目录能按厂商名搜索（大小写不敏感）', () => {
  const flat = toFlatOptions(GROUPS)
  const hit = filterGroups([{ value: '', label: '', options: flat }], 'openai')
  assert.equal(hit[0].options.length, 2)
  assert.equal(hit[0].options[0].value, 'openai/gpt-4')
})

test('sliceGroups 按选项条数跨组切片；0 / 负数 / 越界都不分页', () => {
  assert.deepEqual(sliceGroups(GROUPS, 0), GROUPS)
  assert.deepEqual(sliceGroups(GROUPS, -1), GROUPS)
  assert.equal(flattenOptions(sliceGroups(GROUPS, 1)).length, 1)
  assert.equal(sliceGroups(GROUPS, 1).length, 1)
  assert.equal(flattenOptions(sliceGroups(GROUPS, 2)).length, 2)
  assert.equal(sliceGroups(GROUPS, 3).length, 2)
  assert.equal(flattenOptions(sliceGroups(GROUPS, 99)).length, 3)
  // 搜索结果按同一套分页
  assert.equal(flattenOptions(sliceGroups(filterGroups(GROUPS, 'pt'), 1)).length, 1)
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
  assert.equal(t('pickerEmpty'), '暂无可选')
})

test('resolveTriggerSizing 定宽忽略 min/max，其余各自生效', () => {
  assert.deepEqual(resolveTriggerSizing({ width: 200 }), { width: '200px', minWidth: '200px', maxWidth: '200px' })
  assert.deepEqual(resolveTriggerSizing({ width: '12rem' }), { width: '12rem', minWidth: '12rem', maxWidth: '12rem' })
  assert.deepEqual(resolveTriggerSizing({ minWidth: 100, maxWidth: 300 }), { minWidth: '100px', maxWidth: '300px' })
  assert.deepEqual(resolveTriggerSizing({ maxWidth: '50%' }), { maxWidth: '50%' })
  assert.deepEqual(resolveTriggerSizing({}), {})
  // 定宽优先：即便同时给了 min/max，也以定宽锁定三值
  assert.deepEqual(resolveTriggerSizing({ width: 120, minWidth: 80, maxWidth: 200 }), { width: '120px', minWidth: '120px', maxWidth: '120px' })
})

test('搜索框与触发器共用同一套宽度解析（min/max 各自生效）', () => {
  assert.deepEqual(resolveTriggerSizing({ minWidth: 160, maxWidth: 320 }), { minWidth: '160px', maxWidth: '320px' })
})

test('菜单宽度：无 searchSizing 时至少与触发器同宽，封顶 480 / 可用宽', () => {
  assert.deepEqual(resolveMenuSizing(180, undefined), { minWidth: '180px', maxWidth: '480px' })
  assert.deepEqual(resolveMenuSizing(180, 320), { minWidth: '180px', maxWidth: '320px' })
})

test('菜单宽度：搜索框设了下限就跟着加宽，不会被 overflow:hidden 裁掉', () => {
  assert.deepEqual(resolveMenuSizing(180, undefined, { width: 300 }), {
    minWidth: 'max(180px, calc(300px + 8px))',
    maxWidth: '480px',
  })
  assert.equal(resolveMenuSizing(180, undefined, { minWidth: '12rem' }).minWidth, 'max(180px, calc(12rem + 8px))')
  assert.equal(resolveMenuSizing(180, undefined, { maxWidth: 200 }).minWidth, '180px') // 只给上限不需要撑宽菜单
})

test('8px 补偿与 head 内距一致（改 CSS 要同步改 resolveMenuSizing）', () => {
  const css = readFileSync(new URL('../src/ui/inputs/picker.css', import.meta.url), 'utf8')
  assert.match(css, /\.dshpc-picker__head\{[^}]*padding:4px 4px 0\}/)
  assert.match(resolveMenuSizing(180, undefined, { width: 300 }).minWidth, /calc\(300px \+ 8px\)/)
})

test('retainSelectedValue：旧值按真实值保留，命中候选时原目录不动', () => {
  const hit = retainSelectedValue(GROUPS, 'openai/gpt-4')
  assert.equal(hit.retained, false)
  assert.equal(hit.groups, GROUPS, '命中时不复制目录')
  assert.deepEqual(retainSelectedValue(GROUPS, ''), { groups: GROUPS, retained: false })
  assert.deepEqual(retainSelectedValue(GROUPS, undefined), { groups: GROUPS, retained: false })

  const sameProvider = retainSelectedValue(GROUPS, 'openai/retired')
  assert.equal(sameProvider.retained, true)
  assert.equal(sameProvider.groups.length, 2)
  assert.deepEqual(sameProvider.groups[0].options[0], { value: 'openai/retired', label: 'openai/retired' })
  assert.equal(sameProvider.groups[0].options.length, 3)

  const unknownProvider = retainSelectedValue(GROUPS, 'ghost/m')
  assert.equal(unknownProvider.retained, true)
  assert.equal(unknownProvider.groups.length, 3)
  assert.equal(unknownProvider.groups[2].value, 'ghost')
  assert.equal(groupOf(unknownProvider.groups, 'ghost/m').value, 'ghost', '级联态能反推出 provider')
})
