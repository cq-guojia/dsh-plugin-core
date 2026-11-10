import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { ModelPicker, Picker, WorkspacePicker } from '../dist/ui/index.js'

const GROUPS = [
  { value: 'deepseek', label: 'DeepSeek', options: [{ value: 'deepseek/chat', label: 'deepseek-chat' }] },
  { value: 'qwen', label: '千问', options: [{ value: 'qwen/max', label: 'qwen-max' }] },
]

const render = (props) => renderToStaticMarkup(h(ModelPicker, { groups: GROUPS, ...props }))

test('三种形态：grouped / flat 各一个触发器，cascade 两个', () => {
  // 只数 class 开头的那个，别把 `dshpc-picker__trigger--md` 修饰类也算成一个按钮
  const triggers = (html) => (html.match(/class="dshpc-picker__trigger/g) ?? []).length
  assert.equal(triggers(render({ variant: 'grouped' })), 1)
  assert.equal(triggers(render({ variant: 'flat' })), 1)
  assert.equal(triggers(render({ variant: 'cascade' })), 2)
})

test('flat：触发器显示「厂商-模型」平铺文案，分组形态不带前缀', () => {
  assert.match(render({ variant: 'flat', value: 'deepseek/chat' }), /DeepSeek-deepseek-chat/)
  const grouped = render({ variant: 'grouped', value: 'deepseek/chat' })
  assert.ok(!grouped.includes('DeepSeek-deepseek-chat'))
  assert.match(grouped, /deepseek-chat/)
})

test('通用宽度落到控件根盒；触发器不再内联宽度；cascade 两个框可分别设宽', () => {
  const grouped = render({ variant: 'grouped', minWidth: 200, maxWidth: 320 })
  assert.match(grouped, /<div class="dshpc-picker" style="[^"]*min-width:200px/)
  assert.match(grouped, /max-width:320px/)
  assert.doesNotMatch(grouped, /<button[^>]*style=/, '宽度不该内联到触发器')

  const cascade = render({
    variant: 'cascade',
    providerSizing: { width: 140 },
    modelSizing: { width: 260 },
  })
  assert.match(cascade, /width:140px;min-width:140px;max-width:140px/)
  assert.match(cascade, /width:260px;min-width:260px;max-width:260px/)
})

test('含百分比的 clamp 宽度也落在根盒，控件不随选中文字跳宽', () => {
  const html = render({ variant: 'grouped', width: 'clamp(140px,18%,260px)', value: 'deepseek/chat' })
  assert.match(html, /<div class="dshpc-picker" style="width:clamp\(140px,18%,260px\);min-width:clamp\(140px,18%,260px\);max-width:clamp\(140px,18%,260px\)"/)
  assert.doesNotMatch(html, /<button[^>]*style=/)
})

test('cascade 不分别设宽时，两个框都跟随通用宽度', () => {
  const html = render({ variant: 'cascade', width: 180 })
  assert.equal((html.match(/width:180px;min-width:180px;max-width:180px/g) ?? []).length, 2)
})

test('自定义文案透传到全部下拉（不再只覆盖一半）', () => {
  const translate = (key) => `X:${String(key)}`
  const html = render({ variant: 'cascade', translate })
  assert.match(html, /X:modelProvider/) // 厂商框 placeholder
  assert.equal((html.match(/X:modelModel/g) ?? []).length, 1) // 模型框 placeholder
})

test('WorkspacePicker 同样透传宽度、搜索框宽度与自定义文案', () => {
  const html = renderToStaticMarkup(h(WorkspacePicker, {
    width: 200,
    minWidth: 160,
    searchSizing: { minWidth: 240, maxWidth: 400 },
    translate: (key) => `X:${String(key)}`,
  }))
  assert.match(html, /width:200px;min-width:200px;max-width:200px/)
  assert.match(html, /X:explorerRoot/)
})

test('搜索框宽度：与触发器共用解析函数，且内联样式绑在搜索框上', () => {
  // 菜单只在展开后经 FloatingPortal 挂载，Node 无 DOM：这里守解析口径与绑定本身，
  // 真机展开后的宽度由 demo 的 searchSizing 例子验收。
  const source = readFileSync(new URL('../dist/ui/inputs/Picker.js', import.meta.url), 'utf8')
  assert.match(source, /className: ['"]dshpc-picker__search['"]/)
  assert.match(source, /style: resolveTriggerSizing\(props\.searchSizing/)
  assert.match(source, /resolveMenuSizing\(rects\.reference\.width/)
  const html = renderToStaticMarkup(h(Picker, {
    options: [{ value: 'a', label: 'A' }],
    width: 180,
    searchSizing: { minWidth: 200, maxWidth: 400 },
  }))
  assert.match(html, /width:180px;min-width:180px;max-width:180px/)
})

test('cascade：className 落在根 row，row / 厂商框 / 模型框三条类名轴各自可控', () => {
  const html = render({
    variant: 'cascade',
    className: 'ROOT',
    rowClassName: 'ROW',
    providerClassName: 'PROV',
    modelClassName: 'MODEL',
  })
  assert.match(html, /^<div class="dshpc-picker__row ROOT ROW">/)
  assert.match(html, /class="dshpc-picker PROV"/)
  assert.match(html, /class="dshpc-picker MODEL"/)
})

test('旧值不在目录里：显示真实旧值，cascade 模型框不再被禁用', () => {
  const grouped = render({ value: 'gone/model' })
  assert.match(grouped, /gone\/model/)
  assert.ok(!grouped.includes('>模型</span>'), '不能退回 placeholder 把旧值藏起来')
  const cascade = render({ variant: 'cascade', value: 'gone/model' })
  assert.match(cascade, /gone\/model/)
  assert.ok(!cascade.includes('disabled=""'), '反推出 provider 后模型框应可用')
})
