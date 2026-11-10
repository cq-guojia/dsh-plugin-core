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
import { transform } from 'lightningcss'

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
  assert.deepEqual(resolveMenuSizing(180, undefined), { minWidth: 'min(180px, 480px)', maxWidth: '480px' })
  assert.deepEqual(resolveMenuSizing(180, 320), { minWidth: 'min(180px, 320px)', maxWidth: '320px' })
})

test('菜单宽度：搜索框设了下限就跟着加宽，不会被 overflow:hidden 裁掉', () => {
  assert.deepEqual(resolveMenuSizing(180, undefined, { width: 300 }), {
    minWidth: 'min(max(180px, calc(300px + 8px)), 480px)',
    maxWidth: '480px',
  })
  assert.equal(resolveMenuSizing(180, undefined, { minWidth: '12rem' }).minWidth, 'min(max(180px, calc(12rem + 8px)), 480px)')
  assert.equal(resolveMenuSizing(180, undefined, { maxWidth: 200 }).minWidth, 'min(180px, 480px)') // 只给上限不需要撑宽菜单
})

test('8px 补偿与 head 内距一致（改 CSS 要同步改 resolveMenuSizing）', () => {
  const css = readFileSync(new URL('../src/ui/inputs/picker.css', import.meta.url), 'utf8')
  assert.match(css, /\.dshpc-picker__head\{[^}]*padding:4px 4px 0\}/)
  assert.match(resolveMenuSizing(180, undefined, { width: 300 }).minWidth, /calc\(300px \+ 8px\)/)
})

test('几何闸：菜单 min-width 恒 ≤ max-width，靠右触发器不会被撑出视口', () => {
  const cases = [
    resolveMenuSizing(180, undefined),
    resolveMenuSizing(180, 120),
    resolveMenuSizing(180, 120, { width: 300 }),
    resolveMenuSizing(180, 200, { minWidth: '12rem' }),
  ]
  for (const { minWidth, maxWidth } of cases) {
    assert.ok(minWidth.startsWith('min('), 'min-width 必须自带上限')
    assert.ok(minWidth.endsWith(`, ${maxWidth})`), 'min-width 的上限必须等于 max-width')
    assert.doesNotThrow(
      () => transform({ filename: 'picker.css', code: Buffer.from(`a{min-width:${minWidth};max-width:${maxWidth}}`) }),
      '生成的宽度表达式必须是浏览器能解析的合法 CSS',
    )
  }
})

test('贴边契约：size 必须排在 shift 之前，且 shift 保留左右留白', () => {
  const source = readFileSync(new URL('../src/ui/inputs/Picker.ts', import.meta.url), 'utf8')
  const sizeAt = source.indexOf('floatingSize({')
  const shiftAt = source.indexOf('shift({')
  assert.ok(sizeAt !== -1 && shiftAt !== -1 && sizeAt < shiftAt,
    'size 后置会让 availableWidth 退化成整个视口宽，菜单靠右必然溢出')
  assert.match(source, /shift\(\{[^}]*right:\s*12/, '左右留白不能丢')
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

test('面板内所有「框 / 行」同一套：圆角都走 radius-md、相邻行隔 1px、提示条也是行', () => {
  const css = readFileSync(new URL('../src/ui/inputs/picker.css', import.meta.url), 'utf8')
  // 同一面板里搜索框与列表行各自挑一档，真机上就是两套控件（2026-11-10 用户截图）。
  // 依据是 Surface 定的圆角契约：容器 / 行一律 --dshpc-radius-md，不许组件自己挑更小的档。
  assert.match(css, /\.dshpc-picker__menu \.dshpc-picker__search\{[^}]*border-radius:var\(--dshpc-radius-md\)/, '搜索框走 md 档')
  assert.match(css, /\.dshpc-picker__menu \.dshpc-picker__option\{[^}]*border-radius:var\(--dshpc-radius-md\)/, '选项与搜索框同档')
  assert.match(css, /\.dshpc-picker__menu \.dshpc-picker__more\{[^}]*border-radius:var\(--dshpc-radius-md\)/, '「显示更多」是一行，同档')
  assert.doesNotMatch(css, /radius-(xs|sm)\)/, '不得在面板内自挑更小的圆角档')
  // 相邻两行底色直接相接会连成一根胶囊，多选连选两项就分不出来；缝宽是用户点名的 1px。
  assert.match(css, /\.dshpc-picker__menu \.dshpc-picker__option \+ \.dshpc-picker__option\{[^}]*margin-top:1px\}/, '相邻行之间隔 1px')
  // 提示条跟行同一套块（md 圆角、不再靠负 margin 通栏），只换配色。
  assert.match(css, /\.dshpc-picker__menu \.dshpc-picker__degraded\{[^}]*border-radius:var\(--dshpc-radius-md\)/, '提示条与行同款圆角')
  assert.doesNotMatch(css, /\.dshpc-picker__degraded\{[^}]*margin:0 -4px/, '提示条不再负 margin 通栏')
  // 页面上可能同时挂着旧版 core 的同名单类规则（0,1,0），后挂载者赢 ⇒ 菜单内规则必须带祖先，不能退回单类。
  assert.doesNotMatch(css, /^\.dshpc-picker__(option|search|degraded|more|empty|group-label|tick|row)[,{: ]/m, '菜单内规则不得退回裸单类（会被旧版 core 覆盖）')
})

test('宽度三轴落在控件根盒：触发器与 hint 态 fieldwrap 都铺满', () => {
  const css = readFileSync(new URL('../src/ui/inputs/picker.css', import.meta.url), 'utf8')
  // 只定内层触发器时，inline-block 根盒按选中文字的 max-content 撑宽（含百分比 clamp 尤其明显），
  // 长模型名会让控件右侧留白、同排控件被挤（2026-11-10 真机）。
  assert.match(css, /\.dshpc-picker > \.dshpc-picker__trigger\{[^}]*width:100%/)
  assert.match(css, /\.dshpc-picker > \.dshpc-fieldwrap\{[^}]*width:100%/)
  const source = readFileSync(new URL('../dist/ui/inputs/Picker.js', import.meta.url), 'utf8')
  assert.match(source, /style: controlStyle/, '根盒吃宽度三轴')
  assert.doesNotMatch(source, /style: triggerStyle/, '触发器不再吃宽度三轴')
})

test('cascade 两框有默认行布局：垂直对齐且留缝，规则进运行时 CSS', () => {
  const css = readFileSync(new URL('../src/ui/inputs/picker.css', import.meta.url), 'utf8')
  // 外层行没布局时两个 inline-block 按基线排：供应商框下沉、两框只剩 HTML 空白（2026-11-10 demo 截图）。
  assert.match(css, /:where\(\.dshpc-picker__cascade\)\{[^}]*display:flex[^}]*align-items:center[^}]*gap:8px\}/)
  const runtime = readFileSync(new URL('../dist/ui/inputs/picker-css.generated.js', import.meta.url), 'utf8')
  assert.match(runtime, /dshpc-picker__cascade/, '规则必须进运行时注入的 CSS 常量')
})
