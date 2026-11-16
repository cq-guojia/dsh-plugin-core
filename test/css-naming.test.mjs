// 样式文件名必须等于同目录组件名转 kebab-case：`DateTimePicker.ts` → `date-time-picker.css`。
//
// 2026-11-16 用户要求全站命名统一。此前 `datetime.css` / `hint.css` / `marquee.css` / `flip.css`
// 四份是缩写，跟组件名对不上；这条闸防止再跑偏。判据只认「同目录存在对应 PascalCase 组件」，
// 跨类共用的底座与多控件共用的皮肤进 WHITELIST（每项都要写清理由）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

/** PascalCase → kebab-case（`DateTimePicker` → `date-time-picker`）。 */
function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

/**
 * 不需要对应组件的样式 —— 每一项都必须有理由，不许为了过闸随手加。
 * 键是相对仓库根的 css 路径。
 */
const WHITELIST = new Map([
  ['src/design/tokens.css', '设计值域（token / 明暗），不对应任何组件'],
  ['src/ui/infra/overlay.css', '跨类共用浮层底座'],
  ['src/ui/infra/panel.css', '跨类共用面板皮肤'],
  ['src/ui/infra/side-panel.css', 'PanelDock 与 SideSheet 共用'],
  ['src/ui/feedback/feedback.css', 'Modal / AlertModal / ConfirmModal 三个共用'],
  ['src/ui/display/table-plain.css', 'Table 的一档皮肤，不是独立组件'],
  ['src/adv/explorer/explorer.css', '文件浏览整个模块的皮肤，不对应单个组件'],
  ['src/adv/session/session.css', '会话预览整个模块的皮肤，不对应单个组件'],
  ['packages/demo/src/demo.css', 'demo 站点自己的样式'],
])

/** 从 gen-css 的 MAP 里取三元组；MAP 是唯一真源，不另抄一份清单。 */
function readMap() {
  const src = readFileSync(join(ROOT, 'scripts/gen-css.mjs'), 'utf8')
  const start = src.indexOf('const MAP = [')
  assert.notEqual(start, -1, 'gen-css.mjs 里找不到 MAP')
  const end = src.indexOf('\n]', start)
  assert.notEqual(end, -1, 'MAP 数组没有闭合')
  const body = src.slice(start, end)
  const rows = []
  const re = /\['([^']+)',\s*'([^']+)',\s*'([^']+)'\]/g
  for (let m = re.exec(body); m !== null; m = re.exec(body)) {
    rows.push({ css: m[1], generated: m[2], constant: m[3] })
  }
  assert.ok(rows.length > 0, 'MAP 解析出 0 行')
  return rows
}

test('样式文件名 = 同目录组件名转 kebab-case', () => {
  const bad = []
  for (const row of readMap()) {
    if (WHITELIST.has(row.css)) continue
    const dir = join(ROOT, dirname(row.css))
    const base = basename(row.css, '.css')
    if (!existsSync(dir)) {
      bad.push(`${row.css}：目录不存在`)
      continue
    }
    const siblings = readdirSync(dir)
      .filter((f) => /^[A-Z][A-Za-z0-9]*\.ts$/.test(f) && !f.endsWith('.generated.ts'))
      .map((f) => kebab(f.slice(0, -3)))
    if (!siblings.includes(base)) {
      bad.push(
        `${row.css}：同目录没有名为 ${base} 的组件；` +
          (siblings.length === 0
            ? '该目录没有任何 PascalCase 组件 —— 是共用底座就进 WHITELIST 并写理由'
            : `应为 ${siblings.join(' / ')} 之一（或进 WHITELIST）`),
      )
    }
  }
  assert.deepEqual(bad, [], `样式命名不合规：\n${bad.join('\n')}`)
})

test('生成物路径与常量名跟着样式文件名', () => {
  const bad = []
  for (const row of readMap()) {
    const dir = dirname(row.css)
    const base = basename(row.css, '.css')
    const wantGenerated = `${dir}/${base}-css.generated.ts`
    if (row.generated !== wantGenerated) {
      bad.push(`${row.css}：生成物应为 ${wantGenerated}，实际 ${row.generated}`)
    }
    const wantConstant = `${base.replace(/-/g, '_').toUpperCase()}_CSS`
    if (row.constant !== wantConstant) {
      bad.push(`${row.css}：常量应为 ${wantConstant}，实际 ${row.constant}`)
    }
  }
  assert.deepEqual(bad, [], `生成物/常量命名不合规：\n${bad.join('\n')}`)
})

test('WHITELIST 里的每一项都还存在于 MAP', () => {
  const cssPaths = new Set(readMap().map((r) => r.css))
  const stale = [...WHITELIST.keys()].filter((p) => !cssPaths.has(p))
  assert.deepEqual(stale, [], `WHITELIST 有过期项（样式已删或改名）：\n${stale.join('\n')}`)
})
