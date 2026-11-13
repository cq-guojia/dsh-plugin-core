// 依赖方向闸（2026-11-13）：AGENTS.md「禁止」里这两条分层约束，此前只有注释在说，
// 谁写错都不会红。这里把它们钉成可失败的检查：
//
//   1. `@deepseek-ai/*` 只许 `src/ui/official.ts` 静态 import。官方包是宿主内核的平台模块，
//      宿主外（node 自检、根预览站）解析不到 —— 任何别处 import 都会让整个入口崩。
//      official.ts 头注记着旧坑（SelectField 曾因依赖官方 Menu 被删）。
//   2. `src/utils` 是零运行时叶子层：不许依赖 React / 宿主模块 / `ui`，也不许跨层相对引用。
//      DOM 允许「带 typeof 守卫的只读探测」——现状唯一一处是 utils/i18n.ts 读 <html lang> 定语言，
//      它做了 `typeof document === 'undefined'` 回落，故不在此闸范围内。
import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'

const SRC = new URL('../src/', import.meta.url)

/** `src` 下所有 .ts / .tsx（含 .d.ts），返回相对 `src/` 的路径。 */
async function sources(rel = '') {
  const out = []
  for (const entry of await readdir(new URL(rel, SRC), { withFileTypes: true })) {
    const next = `${rel}${entry.name}`
    if (entry.isDirectory()) out.push(...(await sources(`${next}/`)))
    else if (/\.tsx?$/.test(entry.name)) out.push(next)
  }
  return out
}

/**
 * 去掉注释、保留字符串正文。
 * 注释里写 `@deepseek-ai/xxx` 是常态（对照说明），不剥掉会满屏误报。
 */
function stripComments(text) {
  let out = ''
  let quote = null
  for (let i = 0; i < text.length; ) {
    const ch = text[i]
    const next = text[i + 1]
    if (quote !== null) {
      out += ch
      if (ch === '\\') {
        out += next ?? ''
        i += 2
        continue
      }
      if (ch === quote) quote = null
      i += 1
      continue
    }
    if (ch === '/' && next === '/') {
      while (i < text.length && text[i] !== '\n') i += 1
      continue
    }
    if (ch === '/' && next === '*') {
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i += 1
      i += 2
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch
    out += ch
    i += 1
  }
  return out
}

/** 静态 import / export-from / 动态 import('x') 的模块说明符。 */
const SPECIFIER =
  /\bfrom\s*['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)|\bimport\s*['"]([^'"]+)['"]/g

function specifiersOf(code) {
  return [...code.matchAll(SPECIFIER)].map((m) => m[1] ?? m[2] ?? m[3])
}

/** 允许静态 import 平台模块的薄 adapter：official.ts（宿主弹窗）+ official-icons.ts（只导命名空间）。 */
const OFFICIAL_ALLOWED = ['ui/official.ts', 'ui/infra/official-icons.ts']

test('@deepseek-ai/* 只许在两个官方 adapter 里静态 import', async () => {
  const hits = []
  for (const file of await sources()) {
    if (OFFICIAL_ALLOWED.includes(file)) continue
    for (const spec of specifiersOf(stripComments(await readFile(new URL(file, SRC), 'utf8')))) {
      if (spec.startsWith('@deepseek-ai/')) hits.push(`src/${file} → ${spec}`)
    }
  }
  assert.deepEqual(
    hits,
    [],
    `官方平台模块只许在 ${OFFICIAL_ALLOWED.join(' / ')} import（宿主外解析不到，整入口会崩）：\n${hits.join('\n')}`,
  )
})

test('闸没空转：每个 adapter 的官方 import 都抓得到', async () => {
  for (const file of OFFICIAL_ALLOWED) {
    const code = stripComments(await readFile(new URL(file, SRC), 'utf8'))
    const official = specifiersOf(code).filter((spec) => spec.startsWith('@deepseek-ai/'))
    assert.ok(
      official.length > 0,
      `正则失效：连 src/${file} 的官方 import 都抓不到，上面那道闸等于没装`,
    )
  }
})

/** utils 不许碰的东西：React、宿主平台模块、UI 运行时依赖、本包其它子路径。 */
const FORBIDDEN_IN_UTILS = [
  [/^react($|\/)/, 'React'],
  [/^react-dom($|\/)/, 'React DOM'],
  [/^@deepseek-ai\//, '宿主平台模块'],
  [/^zustand($|\/)/, 'zustand（UI 运行时）'],
  [/^sonner($|\/)/, 'sonner（UI 运行时）'],
  [/^dsh-plugin-core($|\/)/, '本包其它子路径（自引用会绕成环）'],
]

test('src/utils 不依赖 React / 宿主模块 / ui', async () => {
  const hits = []
  let seen = 0
  for (const file of await sources('utils/')) {
    const specs = specifiersOf(stripComments(await readFile(new URL(file, SRC), 'utf8')))
    seen += specs.length
    for (const spec of specs) {
      if (spec.startsWith('../')) hits.push(`src/${file} → ${spec}（跨层相对引用）`)
      for (const [re, label] of FORBIDDEN_IN_UTILS) {
        if (re.test(spec)) hits.push(`src/${file} → ${spec}（${label}）`)
      }
    }
  }
  assert.ok(seen > 0, '没抓到任何 import，说明符正则可能失效')
  assert.deepEqual(
    hits,
    [],
    `utils 是零运行时叶子层（只许同层 ./ 与 node 内置）：\n${hits.join('\n')}`,
  )
})
