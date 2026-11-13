/**
 * CSS 真源 → TS 字符串常量。
 *
 * 为什么存在：DSH 内核不加载 css 资源（docs/dependencies/dsh-host.md §1.1），运行时必须是
 * 字符串注入；但**源码**可以是真的 .css 文件。本脚本负责这一跳，两头都占：
 *   · 真源 `src/**\/*.css` —— 编辑器高亮 / 括号匹配 / 格式化 / CSS lint 全部生效；
 *   · 产物 `*.generated.ts` —— `JSON.stringify` 生成的字符串常量，供 tsc 照旧 1:1 编译。
 *
 * 三条硬要求（缺一不可，见 worklog 20261019-2310-dd55）：
 *   1. 每份 CSS 先过 lightningcss 真解析，失败即退出（构建期就红，不是等到测试）；
 *   2. 字符串常量用 JSON.stringify 产出 —— 模板字符串里的 `\`` 这类手写转义事故被物理删除；
 *   3. `--check` 模式用于幂等闸：生成物与磁盘不一致即非零退出（防手改 / 防忘了重新生成）。
 *
 * 用法：
 *   node scripts/gen-css.mjs           # 生成
 *   node scripts/gen-css.mjs --check   # 只校验，不写盘（CI / pretest 用）
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from 'lightningcss'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * 真源 → 生成物 / 常量名。显式清单，不靠文件名推导（改名要在这里改，是有意为之的摩擦点）。
 * 新增一份样式：加一行 MAP + 在对应 *-css.ts 里 re-export。
 */
const MAP = [
  ['src/design/tokens.css', 'src/design/tokens-css.generated.ts', 'TOKENS_CSS_TEMPLATE'],
  ['src/ui/inputs/segmented.css', 'src/ui/inputs/segmented-css.generated.ts', 'SEGMENTED_CSS'],
  ['src/ui/actions/button.css', 'src/ui/actions/button-css.generated.ts', 'BUTTON_CSS'],
  ['src/ui/inputs/field.css', 'src/ui/inputs/field-css.generated.ts', 'FIELD_CSS'],
  ['src/ui/display/marquee.css', 'src/ui/display/marquee-css.generated.ts', 'MARQUEE_CSS'],
  ['src/ui/display/flip.css', 'src/ui/display/flip-css.generated.ts', 'FLIP_CSS'],
  ['src/ui/feedback/loading.css', 'src/ui/feedback/loading-css.generated.ts', 'LOADING_CSS'],
  ['src/ui/feedback/loader.css', 'src/ui/feedback/loader-css.generated.ts', 'LOADER_CSS'],
  ['src/ui/feedback/loader-bar.css', 'src/ui/feedback/loader-bar-css.generated.ts', 'LOADER_BAR_CSS'],
  ['src/ui/layout/quick-toolbar.css', 'src/ui/layout/quick-toolbar-css.generated.ts', 'QUICK_TOOLBAR_CSS'],
  ['src/ui/display/hint.css', 'src/ui/display/hint-css.generated.ts', 'HINT_CSS'],
  ['src/ui/inputs/datetime.css', 'src/ui/inputs/datetime-css.generated.ts', 'DATETIME_CSS'],
  ['src/ui/layout/split-group.css', 'src/ui/layout/split-group-css.generated.ts', 'SPLIT_GROUP_CSS'],
  ['src/ui/inputs/input-group.css', 'src/ui/inputs/input-group-css.generated.ts', 'INPUT_GROUP_CSS'],
  // 表格：基础层 + 第一档皮肤。新外观（grid / zebra）各加一行，消费方引哪个只打包哪个。
  ['src/ui/display/table.css', 'src/ui/display/table-css.generated.ts', 'TABLE_BASE_CSS'],
  ['src/ui/display/table-plain.css', 'src/ui/display/table-plain-css.generated.ts', 'TABLE_PLAIN_CSS'],
  ['src/ui/navigation/pagination.css', 'src/ui/navigation/pagination-css.generated.ts', 'PAGINATION_CSS'],
  ['src/ui/display/section-head.css', 'src/ui/display/section-head-css.generated.ts', 'SECTION_HEAD_CSS'],
  // 浮层面板皮肤（三档）：Modal / 选文件弹窗 / ▾ 选层与 Picker 下拉共用。
  ['src/ui/infra/panel.css', 'src/ui/infra/panel-css.generated.ts', 'PANEL_CSS'],
  ['src/ui/inputs/picker.css', 'src/ui/inputs/picker-css.generated.ts', 'PICKER_CSS'],
  ['src/ui/infra/overlay.css', 'src/ui/infra/overlay-css.generated.ts', 'OVERLAY_CSS'],
  // 侧边面板皮肤：PanelDock 与 SideSheet 共用（定位各自在 panel-dock / side-sheet）。
  ['src/ui/infra/side-panel.css', 'src/ui/infra/side-panel-css.generated.ts', 'SIDE_PANEL_CSS'],
  ['src/ui/feedback/side-sheet.css', 'src/ui/feedback/side-sheet-css.generated.ts', 'SIDE_SHEET_CSS'],
  ['src/ui/feedback/feedback.css', 'src/ui/feedback/feedback-css.generated.ts', 'FEEDBACK_CSS'],
  ['src/ui/display/surface.css', 'src/ui/display/surface-css.generated.ts', 'SURFACE_CSS'],
  ['src/ui/display/card.css', 'src/ui/display/card-css.generated.ts', 'CARD_CSS'],
  ['src/ui/display/chip.css', 'src/ui/display/chip-css.generated.ts', 'CHIP_CSS'],
  ['src/ui/display/list-row.css', 'src/ui/display/list-row-css.generated.ts', 'LIST_ROW_CSS'],
  ['src/ui/layout/panel-dock.css', 'src/ui/layout/panel-dock-css.generated.ts', 'PANEL_DOCK_CSS'],
  ['src/ui/display/code-viewer.css', 'src/ui/display/code-viewer-css.generated.ts', 'CODE_VIEWER_CSS'],
  ['src/adv/explorer/explorer.css', 'src/adv/explorer/explorer-css.generated.ts', 'EXPLORER_CSS'],
  ['src/adv/session/session.css', 'src/adv/session/session-css.generated.ts', 'SESSION_CSS'],
  // demo 预览站的文档骨架（packages/demo）：与库同源同闸，只是不随库发布。
  ['packages/demo/src/demo.css', 'packages/demo/src/demo-css.generated.ts', 'DEMO_CSS'],
]

/** 真源里不该出现的字符：它们在 CSS 里要么非法、要么是 2026-10-19 那次事故的成因。 */
const FORBIDDEN = [
  ['反引号', '`'],
  ['反斜杠', '\\'],
  ['模板插值', '${'],
  ['BOM', '﻿'],
]

const checkOnly = process.argv.includes('--check')

/**
 * 校验一份 CSS 能不能作为真源。抛错 = 不合格。
 * 单独抽出来是为了让 `test/css-contract.test.mjs` 能对临时文件调 `--verify`，
 * 用事故文本（含反引号）反向验证这条闸真的会拦 —— 而不是只在生成 15 份正样时被覆盖到。
 */
function verify(cssPath, cssText) {
  for (const [label, ch] of FORBIDDEN) {
    if (cssText.includes(ch)) throw new Error(`${cssPath} 含${label}（${JSON.stringify(ch)}）`)
  }
  try {
    transform({ filename: cssPath, code: Buffer.from(cssText, 'utf8'), minify: false })
  } catch (err) {
    throw new Error(`${cssPath} 未通过 CSS 解析：${String(err.message).split('\n')[0]}`)
  }
}

// 只校验指定文件，不写盘（测试用）：`node scripts/gen-css.mjs --verify <file>`
const verifyIdx = process.argv.indexOf('--verify')
if (verifyIdx >= 0) {
  const target = process.argv[verifyIdx + 1]
  if (target === undefined) {
    console.error('用法：--verify <file>')
    process.exit(2)
  }
  try {
    const abs = isAbsolute(target) ? target : join(ROOT, target)
    verify(target, readFileSync(abs, 'utf8'))
    console.log(`✓ ${target} 通过`)
  } catch (err) {
    console.error(`✗ ${err.message}`)
    process.exit(1)
  }
  process.exit(0)
}

/** 生成一份：返回文件正文 */
function render(cssPath, cssText, constName) {
  verify(cssPath, cssText)
  return (
    '// ⚠️ 生成物，勿手改。真源 = ' +
    cssPath +
    '\n' +
    '// 由 scripts/gen-css.mjs 生成（`pnpm run gen:css`）：改样式请改那个 .css 文件后重新生成。\n' +
    `export const ${constName} = ${JSON.stringify(cssText)}\n`
  )
}

let bad = 0
for (const [cssPath, outPath, constName] of MAP) {
  const abs = join(ROOT, cssPath)
  let cssText
  try {
    cssText = readFileSync(abs, 'utf8')
  } catch {
    console.error(`✗ 读不到真源 ${cssPath}`)
    bad++
    continue
  }

  let body
  try {
    body = render(cssPath, cssText, constName)
  } catch (err) {
    console.error(`✗ ${err.message}`)
    bad++
    continue
  }

  const out = join(ROOT, outPath)
  let current = null
  try {
    current = readFileSync(out, 'utf8')
  } catch {
    /* 还没有生成物 */
  }

  if (current === null || current !== body) {
    if (checkOnly) {
      console.error(`✗ ${outPath} 与真源不同步（跑 pnpm run gen:css 重新生成）`)
      bad++
    } else {
      writeFileSync(out, body, 'utf8')
      console.log(`✓ ${outPath}（${String(cssText.length)} 字 → ${constName}）`)
    }
  } else {
    console.log(`· ${outPath} 已是最新`)
  }
}

if (bad > 0) {
  console.error(`\n${bad} 份未通过（共 ${String(MAP.length)} 份）`)
  process.exit(1)
}
console.log(checkOnly ? '\n✓ 全部同步' : '\n✓ CSS 生成完成')
