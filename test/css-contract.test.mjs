// CSS 契约自检：一个类名只能有一套皮肤。
//
// 背景（2026-10-19）：`.dshpc-chip` 曾在 controls-css 里被定义成 28×28 方角图标底板、
// 在 card-css 里被定义成胶囊标签，两份都注入同一页面 ⇒ 后者覆盖前者：Chip 组件被锁成
// 28px 宽（文字挤压）、图标按钮被撑成胶囊。这类「同名不同皮」靠人眼审不出来，必须由测试盯。
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import * as controls from '../dist/ui/controls-css.js'
import { PICKER_CSS } from '../dist/ui/picker-css.js'
import { FEEDBACK_CSS } from '../dist/ui/feedback-css.js'
import { CARD_CSS } from '../dist/ui/card-css.js'
import { CHIP_CSS } from '../dist/ui/chip-css.js'
import { PANEL_DOCK_CSS } from '../dist/ui/panel-dock-css.js'
import { EXPLORER_CSS } from '../dist/explorer/explorer-css.js'
import { SESSION_CSS } from '../dist/session/session-css.js'
import { transform } from 'lightningcss'
import { CONTROLS_CSS } from '../dist/ui/css.js'
import { TOKENS_CSS_TEMPLATE } from '../dist/design/tokens-css.js'

/** css.ts 里参与注入的全部常量（新增 CSS 常量时同步加进来）。 */
const CONSTANTS = {
  ...Object.fromEntries(
    Object.entries(controls).filter(([key, value]) => key.endsWith('_CSS') && typeof value === 'string'),
  ),
  PICKER_CSS,
  FEEDBACK_CSS,
  CARD_CSS,
  CHIP_CSS,
  PANEL_DOCK_CSS,
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

// 2026-10-19 真因（详见 docs/design/external/dsh-host.md §9）：
// tokens 模板字符串结尾多了一个反斜杠，字符串里因此多出字面反引号。CSS 解析器把它当作
// 不合格选择器的开头，一路吞到下一个 `{` ⇒ **紧随其后的那条规则**的选择器被污染成
// 永远匹配不到元素的怪选择器。规则仍在 CSSOM 里，所以不报错、不告警，只是永不生效。
// 当年的 `.dshpc-css-guard` 牺牲规则只是替它挨刀，机制已删除。
//
// 主检查 = 真 CSS 解析器（lightningcss，官方构建期用的是同一个）：
// 它对那个反引号直接抛 `Invalid empty selector` ⇒ 这类事故不可能再静默溜过去。
// 字符黑名单只作快速失败，用来把「是哪个字符出的问题」说清楚。
const INJECTED = `${TOKENS_CSS_TEMPLATE}\n${CONTROLS_CSS}`

test('注入文本必须通过真实 CSS 解析器（lightningcss）', () => {
  assert.doesNotThrow(
    () => transform({ filename: 'dshpc-injected.css', code: Buffer.from(INJECTED), minify: false }),
    '注入的 CSS 解析失败：非法 token 会让解析器把紧随其后的那条规则的选择器整个吞掉',
  )
})

test('解析结果里关键结构规则必须完好', () => {
  const parsed = transform({ filename: 'dshpc-injected.css', code: Buffer.from(INJECTED), minify: false })
  const out = parsed.code.toString()
  assert.ok(out.includes('.dshpc-seg'), '解析后 .dshpc-seg 规则消失')
  assert.ok(
    /\.dshpc-seg\s*\{[^}]*display:\s*inline-flex/.test(out),
    '.dshpc-seg 丢了 display:inline-flex（选择器或声明被吞）',
  )
})

// ── Segmented 的尺寸契约与「假外观轴」──────────────────────────────────────
// 2026-10-26 两件真事故，都由下游对图对出来、都靠人眼看不出原因：
//  ① 文档承诺 size = 24 / 28 / 32，实际渲染 22 / 26 / 30（容器 padding 与 item 的
//     「控制高 − 6px」不匹配）⇒ 与同档 Button/Input 并排矮 2px，圆度比例肉眼可见不同；
//  ② `variant` 的 default / inset 两档 CSS 只差 1px 内距（default 还矮 2px），
//     注释却说「有外描边 / 无外描边」两种观感 ⇒ 下游以为有得选，拧了没反应，转去怀疑 token / 注入 / 打包。
// 两条都必须由测试盯，不能靠人眼。
test('Segmented 三档总高必须等于承诺的 24 / 28 / 32', () => {
  const css = controls.SEGMENTED_CSS
  const pad = Number(/\.dshpc-seg\{[^}]*?padding:(\d+)px/.exec(css)?.[1])
  assert.ok(Number.isFinite(pad), '.dshpc-seg 基础规则里找不到 padding —— 闸失效')

  /** 该档的 item 声明（sm 没有独立规则，沿用基础规则）。 */
  const itemDecls = (tier) => {
    const own = new RegExp(`\\.dshpc-seg--${tier} \\.dshpc-seg__item\\{([^}]*)\\}`).exec(css)
    const base = /^\.dshpc-seg__item\{([^}]*)\}/m.exec(css)
    return own?.[1] ?? base?.[1]
  }

  for (const [tier, expected] of [['sm', 24], ['md', 28], ['lg', 32]]) {
    const decls = itemDecls(tier)
    assert.ok(decls !== undefined, `找不到 .dshpc-seg__item 的 ${tier} 档声明`)
    const sub = Number(/height:calc\(var\(--dshpc-control-h-\w+\) - (\d+)px\)/.exec(decls)?.[1])
    assert.ok(Number.isFinite(sub), `${tier} 档 item 高度不是 calc(控制高 − N px)，闸失效`)
    const h = Number(new RegExp(`--dshpc-control-h-${tier}:(\\d+)px`).exec(TOKENS_CSS_TEMPLATE)?.[1])
    assert.ok(Number.isFinite(h), `token 层没有 --dshpc-control-h-${tier}`)
    assert.equal(h - sub + pad * 2, expected, `Segmented ${tier} 档总高 = ${h - sub + pad * 2}px，承诺 ${expected}px`)
  }
})

test('Segmented 不许加回视觉等价的外观档（variant 已于 2026-10-26 删除）', () => {
  assert.ok(!controls.SEGMENTED_CSS.includes('dshpc-seg--default'), 'dshpc-seg--default 与另一档视觉等价，已删，勿回潮')
  assert.ok(!controls.SEGMENTED_CSS.includes('dshpc-seg--inset'), 'dshpc-seg--inset 已删，勿回潮')
})

test('快速失败：注入文本不得含反引号 / 反斜杠', () => {
  const bad = ['`', '\\'].filter((ch) => INJECTED.includes(ch))
  assert.deepEqual(bad, [], `注入文本出现非法字符：${JSON.stringify(bad)}`)
})

// 反证：把 2026-10-19 的事故原样重演一遍，确认防线真的会红。
// 没有这条，将来谁把上面的解析断言删了/放宽了都没人知道。
test('反证：事故文本（.dshpc-seg 前多一个反引号）必须被拒绝', () => {
  const broken = INJECTED.replace('.dshpc-seg{', '`.dshpc-seg{')
  assert.notEqual(broken, INJECTED, '构造事故文本失败：文本里没有 .dshpc-seg{')
  assert.throws(
    () => transform({ filename: 'dshpc-injected.css', code: Buffer.from(broken), minify: false }),
    '带反引号的 CSS 竟然解析通过 —— 防线失效了',
  )
})

test('tokens 模板必须以 } 收尾，不带任何尾巴字符', () => {
  assert.equal(
    TOKENS_CSS_TEMPLATE.trimEnd().at(-1),
    '}',
    `tokens 模板结尾是 ${JSON.stringify(TOKENS_CSS_TEMPLATE.slice(-24))}，应为规则右花括号`,
  )
})

test('注入文本的括号与注释必须平衡', () => {
  const src = INJECTED.replace(/\/\*[\s\S]*?\*\//g, '')
  let depth = 0
  for (const ch of src) {
    if (ch === '{') depth += 1
    else if (ch === '}') depth -= 1
    assert.ok(depth >= 0, '出现多余的右花括号')
  }
  assert.equal(depth, 0, `花括号不平衡，残留 ${depth} 层`)
})

test('Modal 关闭按钮用专属类名，不借 Picker 触发器皮肤', async () => {
  assert.ok(FEEDBACK_CSS.includes('.dshpc-modal__close'), 'FEEDBACK_CSS 缺 .dshpc-modal__close')
  const modal = await readFile(new URL('../dist/ui/Modal.js', import.meta.url), 'utf8')
  assert.ok(modal.includes('dshpc-modal__close'), 'Modal 关闭按钮未用 dshpc-modal__close')
  assert.ok(!modal.includes('dshpc-picker__trigger'), 'Modal 仍在借 dshpc-picker__trigger')
})

// 遮罩让位分栏（2026-10-22）：契约是「PanelDock 写变量 / 遮罩读变量」，两边改名走散了
// 不会报错，只会静默回到「遮罩盖住 dock」，所以由测试钉住同一个变量名。
test('遮罩让位分栏：写的与读的是同一个 CSS 变量', async () => {
  assert.ok(
    FEEDBACK_CSS.includes('inset:0 var(--dshpc-page-inset-right'),
    '遮罩没用 --dshpc-page-inset-right 让位（右边界会让到全屏）',
  )
  const dock = await readFile(new URL('../dist/ui/PanelDock.js', import.meta.url), 'utf8')
  assert.ok(dock.includes('--dshpc-page-inset-right'), 'PanelDock 没有发布 --dshpc-page-inset-right')
  assert.ok(!FEEDBACK_CSS.includes('dshpc-modal-mask--plain'), 'mask={false} 的旁路样式已删，勿回潮')
})

// ── 真源 → 生成物 这一跳的闸 ──────────────────────────────────────────────
// 样式真源是 src/**/*.css，由 scripts/gen-css.mjs 转成 *.generated.ts。
// 中间多了一跳，就多了「生成物被手改」和「改了 .css 忘了重新生成」两种静默失败，必须钉死。
const GEN = fileURLToPath(new URL('../scripts/gen-css.mjs', import.meta.url))

test('生成物与真源同步（改了 .css 忘了重新生成会红）', () => {
  const r = spawnSync(process.execPath, [GEN, '--check'], { encoding: 'utf8' })
  assert.equal(r.status, 0, `生成物与 .css 不同步：\n${r.stdout ?? ''}${r.stderr ?? ''}`)
})

test('反证：真源里出现反引号必须被生成器拒绝', () => {
  const file = join(tmpdir(), 'dshpc-bad-source.css')
  writeFileSync(file, 'body{--a:1;}\n`.dshpc-seg{display:inline-flex;}\n', 'utf8')
  try {
    const r = spawnSync(process.execPath, [GEN, '--verify', file], { encoding: 'utf8' })
    assert.notEqual(r.status, 0, '含反引号的 CSS 竟然通过了生成器校验 —— 闸失效了')
  } finally {
    rmSync(file, { force: true })
  }
})

// 2026-10-20：删 DATETIME_CSS / 改 SELECT_CSS→UTILITY_CSS 时发现，把一行从 MAP 里摘掉，
// `gen-css.mjs` 不会去删那份旧生成物（tsc 也不清 outDir）⇒ 孤儿 generated.ts 会一直躺在 src/
// 和 dist/ 里，下次谁改动 CSS 又会被它误导。这条钉死「MAP ⇄ 磁盘」必须一一对应。
test('src 下不得残留 MAP 之外的孤儿生成物', async () => {
  const script = await readFile(GEN, 'utf8')
  const mapped = [...script.matchAll(/\['[^']+\.css',\s*'([^']+\.generated\.ts)'/g)]
    .map((m) => m[1])
    .sort()
  assert.ok(mapped.length >= 10, `MAP 行数异常（${mapped.length}）—— 解析正则可能失效了`)

  const found = []
  const walk = async (dir) => {
    for (const entry of await readdir(new URL(dir, import.meta.url), { withFileTypes: true })) {
      const rel = `${dir}/${entry.name}`
      if (entry.isDirectory()) await walk(rel)
      else if (entry.name.endsWith('.generated.ts') && entry.name !== 'doc-data.generated.ts') found.push(rel.slice('../'.length))
    }
  }
  await walk('../src')
  // demo 包的样式也走同一条生成链（packages/demo/src/demo.css），一并纳入
  await walk('../packages/demo/src')

  assert.deepEqual(
    found.sort(),
    mapped,
    '生成物与 scripts/gen-css.mjs 的 MAP 不一致：MAP 里删了行就得把那份 generated.ts 删掉',
  )
})

test('生成器对合法 CSS 放行（闸没误伤）', () => {
  const file = join(tmpdir(), 'dshpc-good-source.css')
  writeFileSync(file, 'body{--a:1;}\n.dshpc-seg{display:inline-flex;}\n', 'utf8')
  try {
    const r = spawnSync(process.execPath, [GEN, '--verify', file], { encoding: 'utf8' })
    assert.equal(r.status, 0, `合法 CSS 被拒：\n${r.stdout ?? ''}${r.stderr ?? ''}`)
  } finally {
    rmSync(file, { force: true })
  }
})
