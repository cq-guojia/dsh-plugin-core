// CSS 契约自检：一个类名只能有一套皮肤。
//
// 背景（2026-10-19）：`.dshpc-chip` 曾在 controls-css 里被定义成 28×28 方角图标底板、
// 在 card-css 里被定义成胶囊标签，两份都注入同一页面 ⇒ 后者覆盖前者：Chip 组件被锁成
// 28px 宽（文字挤压）、图标按钮被撑成胶囊。这类「同名不同皮」靠人眼审不出来，必须由测试盯。
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import * as controls from '../dist/ui/controls-css.js'
import { PICKER_CSS } from '../dist/ui/picker-css.js'
import { FEEDBACK_CSS } from '../dist/ui/feedback-css.js'
import { CARD_CSS } from '../dist/ui/card-css.js'
import { CHIP_CSS } from '../dist/ui/chip-css.js'
import { EXPLORER_CSS } from '../dist/explorer/explorer-css.js'
import { SESSION_CSS } from '../dist/session/session-css.js'
import { CONTROLS_CSS_WITH_GUARD } from '../dist/ui/css.js'
import { CSS_GUARD } from '../dist/ui/controls-css.js'

/** css.ts 里参与注入的全部常量（新增 CSS 常量时同步加进来）。 */
const CONSTANTS = {
  ...Object.fromEntries(
    Object.entries(controls).filter(([key, value]) => key.endsWith('_CSS') && typeof value === 'string'),
  ),
  PICKER_CSS,
  FEEDBACK_CSS,
  CARD_CSS,
  CHIP_CSS,
  EXPLORER_CSS,
  SESSION_CSS,
}

/** 抽出顶层选择器（`@media` 等嵌套块内部的规则不算，避免误报）。 */
function topSelectors(css) {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const out = []
  let depth = 0
  let buf = ''
  for (const ch of src) {
    if (ch === '{') {
      if (depth === 0) out.push(buf.trim().replace(/\s+/g, ' '))
      buf = ''
      depth += 1
    } else if (ch === '}') {
      depth -= 1
      buf = ''
    } else if (depth === 0) {
      buf += ch
    }
  }
  return out.filter((selector) => selector !== '' && !selector.startsWith('@'))
}

test('CSS 常量之间不得有同名顶层选择器（同名不同皮会互相覆盖）', () => {
  const owners = new Map()
  const clashes = []
  for (const [name, css] of Object.entries(CONSTANTS)) {
    for (const selector of topSelectors(css)) {
      const owner = owners.get(selector)
      if (owner !== undefined && owner !== name) clashes.push(`${selector}  ← ${owner} / ${name}`)
      else owners.set(selector, name)
    }
  }
  assert.deepEqual(clashes, [], `同名选择器跨 CSS 常量重复定义：\n${clashes.join('\n')}`)
})

test('chip 只有标签一套皮肤，图标按钮走 iconbtn', () => {
  const holders = Object.entries(CONSTANTS)
    .filter(([, css]) => css.includes('.dshpc-chip'))
    .map(([name]) => name)
  assert.deepEqual(holders, ['CHIP_CSS'], 'dshpc-chip 只允许出现在 chip-css.ts')
  assert.ok(!CHIP_CSS.includes('dshpc-chip--label'), 'dshpc-chip--label 是被删掉的图标语义，勿回潮')
})

// 宿主会吃掉「token 块之后的第一条 CSS 规则」（整条不进 CSSOM）。
// 见 docs/design/external/dsh-host.md §5 与 controls-css.ts 的 CSS_GUARD 注释。
// 这条自检盯的是：注入文本必须以无害守卫开头，且守卫本身只有 display:none 一条声明。
// 谁把守卫挪走/删掉，真规则会静默失效——这种坑 2026-10-19 查了整整一天。
test('控件样式第一条必须是牺牲规则 .dshpc-css-guard', () => {
  assert.ok(
    CONTROLS_CSS_WITH_GUARD.startsWith(CSS_GUARD),
    `注入文本没有以守卫开头：${CONTROLS_CSS_WITH_GUARD.slice(0, 80)}`,
  )
  assert.deepEqual(topSelectors(CSS_GUARD), ['.dshpc-css-guard'], '守卫只能有这一条规则')
  assert.equal(CSS_GUARD, '.dshpc-css-guard{display:none}', '守卫只允许 display:none，不许掺别的声明')
})

test('Modal 关闭按钮用专属类名，不借 Picker 触发器皮肤', async () => {
  assert.ok(FEEDBACK_CSS.includes('.dshpc-modal__close'), 'FEEDBACK_CSS 缺 .dshpc-modal__close')
  const modal = await readFile(new URL('../dist/ui/Modal.js', import.meta.url), 'utf8')
  assert.ok(modal.includes('dshpc-modal__close'), 'Modal 关闭按钮未用 dshpc-modal__close')
  assert.ok(!modal.includes('dshpc-picker__trigger'), 'Modal 仍在借 dshpc-picker__trigger')
})
