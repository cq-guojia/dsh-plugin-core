import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ListRow } from '../dist/ui/index.js'
import { LIST_ROW_CSS } from '../dist/ui/display/list-row-css.js'
import { TOKENS_CSS_TEMPLATE } from '../dist/design/tokens-css.js'

const render = (props = {}, children = '条目') =>
  renderToStaticMarkup(createElement(ListRow, props, children))

test('ListRow 默认：常态带底、不带边、不可点、不 hover', () => {
  const html = render()
  assert.match(html, /class="[^"]*dshpc-surface[^"]*dshpc-surface--tone-sunken[^"]*dshpc-surface--border-none[^"]*dshpc-listrow/)
  assert.ok(!html.includes('dshpc-listrow--interactive'))
  assert.ok(!html.includes('dshpc-listrow--hoverable'))
  assert.ok(!html.includes('role="button"'))
  assert.ok(!html.includes('tabindex'))
})

test('ListRow 可点：role / tabIndex / 键盘 / hover 默认开，右侧操作不连带', () => {
  const html = render({ onClick: () => {} })
  assert.match(html, /role="button"/)
  assert.match(html, /tabindex="0"/)
  assert.match(html, /dshpc-listrow--interactive/)
  assert.match(html, /dshpc-listrow--hoverable/)
  const src = readFileSync(new URL('../dist/ui/display/ListRow.js', import.meta.url), 'utf8')
  assert.match(src, /stopPropagation/, '右侧操作槽必须挡住冒泡')
  assert.match(src, /target !== .*currentTarget/, '键盘只认行自己为事件源')
  assert.match(src, /key !==/, '要判 Enter / Space')
})

test('ListRow hoverable 可关、也可在纯展示行强制开', () => {
  assert.ok(!render({ onClick: () => {}, hoverable: false }).includes('dshpc-listrow--hoverable'))
  assert.match(render({ hoverable: true }), /dshpc-listrow--hoverable/)
})

test('ListRow bordered / selected', () => {
  assert.ok(!render({ bordered: true }).includes('dshpc-surface--border-none'))
  const html = render({ onClick: () => {}, selected: true })
  assert.match(html, /dshpc-listrow--selected/)
  assert.match(html, /aria-pressed="true"/)
})

test('ListRow 两槽：主内容在 __main，操作在 __actions，整行不是 button', () => {
  const html = renderToStaticMarkup(
    createElement(ListRow, { actions: createElement('button', { type: 'button' }, '移除') }, '文件名.ts'),
  )
  assert.match(html, /dshpc-listrow__main[^>]*>文件名\.ts</)
  assert.match(html, /dshpc-listrow__actions[^>]*><button[^>]*>移除<\/button></)
  assert.ok(!html.startsWith('<button'), '嵌 button 是非法 HTML')
})

test('ListRow CSS：四边等距 / hover 灰态可见 / 选中浅蓝灰无描边', () => {
  assert.match(LIST_ROW_CSS, /--surface-pad:var\(--dshpc-space-2\)/, '四边等距，不写上下 0 / 左右 12')
  assert.match(LIST_ROW_CSS, /min-height:var\(--dshpc-control-h-md\)/)
  assert.match(LIST_ROW_CSS, /font-size:var\(--dshpc-font-md\)/, '默认字号由核心给，消费者不必自己设')
  assert.match(LIST_ROW_CSS, /line-height:var\(--dshpc-line-md\)/, '行高同源，不继承宿主')
  assert.match(LIST_ROW_CSS, /--surface-bg:var\(--dshpc-listrow-hover-bg\)/, 'hover 吃专用温和 token')
  assert.match(LIST_ROW_CSS, /--surface-bg:var\(--dshpc-listrow-selected-bg\)/, '选中吃 slate 专用浅色 token')
  assert.match(LIST_ROW_CSS, /:not\(\.dshpc-listrow--selected\)/, '选中态必须压在 hover 之上')
  assert.match(LIST_ROW_CSS, /prefers-reduced-motion/)
  const css = LIST_ROW_CSS.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.ok(!css.includes('--dshpc-plate-hover'), '亮色 hover 不能用 plate-hover（白底看不出变化）')
  assert.ok(!css.includes('--dshpc-selected-bg'), '不许用通用选中面（暗色会发黑）')
  assert.ok(!css.includes('--surface-bg:linear-gradient'), '选中不画渐变 / 左侧竖条')
  assert.ok(!css.includes('--surface-border:'), '选中不描边')
  assert.ok(!css.includes('--dshpc-business'), '选中不带语义蓝')
  assert.ok(!css.includes('background:'), '底归 Surface，不许重写 background 属性')
  assert.ok(!css.includes('border-radius:'), '圆角归 Surface')
})

test('ListRow hover token：明暗各一档，且不再吃夸张的 active 灰', () => {
  const darkAt = TOKENS_CSS_TEMPLATE.indexOf('body[data-ds-dark-theme]{')
  const light = TOKENS_CSS_TEMPLATE.slice(0, darkAt)
  const dark = TOKENS_CSS_TEMPLATE.slice(darkAt)
  assert.match(light, /--dshpc-listrow-hover-bg:rgba\(15,15,15,\.09\)/)
  assert.match(dark, /--dshpc-listrow-hover-bg:rgba\(255,255,255,\.10\)/)
  assert.ok(!LIST_ROW_CSS.includes('var(--dshpc-active)'), '不许再用 active 那档（亮 18% / 暗 24%）')
})

test('ListRow 选中 token：slate 极浅蓝灰，明暗各一档且暗色更浓', () => {
  const darkAt = TOKENS_CSS_TEMPLATE.indexOf('body[data-ds-dark-theme]{')
  assert.ok(darkAt > 0, '暗色段必须存在')
  const light = TOKENS_CSS_TEMPLATE.slice(0, darkAt)
  const dark = TOKENS_CSS_TEMPLATE.slice(darkAt)
  assert.match(light, /--dshpc-listrow-selected-bg:color-mix\(in srgb,var\(--dshpc-slate\) 14%,transparent\)/)
  assert.match(dark, /--dshpc-listrow-selected-bg:color-mix\(in srgb,var\(--dshpc-slate\) 26%,transparent\)/)
})
