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

test('通用宽度落到触发器；cascade 两个框可分别设宽', () => {
  const grouped = render({ variant: 'grouped', minWidth: 200, maxWidth: 320 })
  assert.match(grouped, /min-width:200px/)
  assert.match(grouped, /max-width:320px/)

  const cascade = render({
    variant: 'cascade',
    providerSizing: { width: 140 },
    modelSizing: { width: 260 },
  })
  assert.match(cascade, /width:140px;min-width:140px;max-width:140px/)
  assert.match(cascade, /width:260px;min-width:260px;max-width:260px/)
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
