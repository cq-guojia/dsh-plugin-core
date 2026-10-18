import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

// 规范自检：内置字典里的每个 key 都必须在源码里被真正用到。
// 起因：质检时发现 `pickerMaxReached` 定义了却从没被引用（死 key = 功能缺失的信号）。
const SRC = path.resolve(import.meta.dirname, '..', 'src')

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.name.endsWith('.ts')) out.push(full)
  }
  return out
}

test('内置字典没有死 key', () => {
  const files = walk(SRC)
  const code = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n')
  // 只取 zh 字典块（避免误匹配别处 4 空格缩进的 type: '...' 之类）
  const start = code.indexOf('  zh: {')
  const end = code.indexOf('  en: {', start)
  assert.ok(start >= 0 && end > start, '定位不到 zh 字典块，正则/结构可能变了')
  const zhBlock = code.slice(start, end)
  const keys = [...zhBlock.matchAll(/^\s{4}([a-zA-Z][a-zA-Z0-9]*):\s*'/gm)].map((m) => m[1])
  assert.ok(keys.length > 30, `应抓到 30+ 个 key，实际 ${keys.length}（正则可能失效）`)
  const dead = keys.filter((k) => !code.includes(`'${k}'`))
  assert.deepEqual(dead, [], `这些 key 定义了但没被引用（要么删掉，要么是功能漏做）`)
})
