import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

// 规范自检：界面上出现的文案必须走内置字典（`t()`），源码里不许直接写中文。
// 起因：2026-11-03 用户——「根目录」只有 demo 跟随宿主语言，核心写死中文；随后逐个控件又翻出
// 清空 / 减少 / 增加 / 撤销 / 操作 / [图片] 一堆写死的。
//
// 放行三类（其余一律报错）：
//   1. `utils/i18n.ts` —— 字典本体；
//   2. `ui/datetime-logic.ts` —— 中英日期格式表（`2026年11月` / `一…日` 这类格式串，按 locale 分支取）；
//   3. 诊断信息（`console.*` / `throw` / `log(`，含跨行书写）—— 只进控制台，不上界面。
const SRC = path.resolve(import.meta.dirname, '..', 'src')
const SKIP_FILES = new Set(['i18n.ts', 'datetime-logic.ts'])
const DIAGNOSTIC = /\bconsole\.|\bthrow\b|\blog\(|\bwarn\(/
const LOOKBACK = 6

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.generated.ts') && !entry.name.endsWith('.d.ts')) out.push(full)
  }
  return out
}

/** 去掉注释，避免把中文注释当文案。 */
function stripComments(lines) {
  const out = []
  let inBlock = false
  for (const line of lines) {
    let s = line
    if (inBlock) {
      const close = s.indexOf('*/')
      if (close < 0) { out.push(''); continue }
      s = s.slice(close + 2)
      inBlock = false
    }
    for (;;) {
      const open = s.indexOf('/*')
      if (open < 0) break
      const close = s.indexOf('*/', open + 2)
      if (close < 0) { s = s.slice(0, open); inBlock = true; break }
      s = s.slice(0, open) + s.slice(close + 2)
    }
    // 行注释（跳过 `http://` 这类）
    s = s.replace(/(?<!:)\/\/.*$/, '')
    out.push(s)
  }
  return out
}

const LITERAL = /'([^'\\\n]*(?:\\.[^'\\\n]*)*)'|"([^"\\\n]*(?:\\.[^"\\\n]*)*)"|`([^`\\]*(?:\\.[^`\\]*)*)`/g
const HAN = /[\u4e00-\u9fa5]/

test('源码里没有写死的界面中文（文案必须走字典 t()）', () => {
  const offenders = []
  for (const file of walk(SRC)) {
    if (SKIP_FILES.has(path.basename(file))) continue
    const lines = stripComments(fs.readFileSync(file, 'utf8').split('\n'))
    lines.forEach((line, index) => {
      for (const match of line.matchAll(LITERAL)) {
        if (!HAN.test(match[0])) continue
        const context = lines.slice(Math.max(0, index - LOOKBACK), index + 1).join('\n')
        if (DIAGNOSTIC.test(context)) continue
        offenders.push(`${path.relative(SRC, file)}:${String(index + 1)} ${match[0]}`)
      }
    })
  }
  assert.deepEqual(offenders, [], '这些中文写死在源码里了：改成 i18n 字典 key + t()（诊断信息可放 console/throw）')
})
