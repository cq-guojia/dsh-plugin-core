// 构建后清掉 dist 里没有对应源码的产物。
// tsc 只覆盖同名文件：源码目录改名 / 删文件后，旧产物会一直躺在 dist 里被人继续引用
// （2026-11-05 就发生过：src/explorer → src/adv/explorer 后，dist/explorer 与 dist/adv 并存，
// exports 还指着旧的那份 ⇒ 改了不生效）。只删孤儿，正常构建删 0 个。
import { readdirSync, rmSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const SRC = join(ROOT, 'src')
const DIST = join(ROOT, 'dist')
const EMITTED = /\.(js|d\.ts|map)$/

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) walk(abs, out)
    else out.push(abs)
  }
  return out
}

const expected = new Set()
for (const abs of walk(SRC)) {
  const rel = relative(SRC, abs)
  if (!rel.endsWith('.ts') || rel.endsWith('.d.ts')) continue
  for (const ext of ['.js', '.d.ts', '.js.map', '.d.ts.map']) expected.add(rel.replace(/\.ts$/, ext))
}

const orphans = walk(DIST)
  .map((abs) => relative(DIST, abs))
  .filter((rel) => EMITTED.test(rel) && !expected.has(rel))

for (const rel of orphans) rmSync(join(DIST, rel))
for (const rel of orphans) {
  const dir = join(DIST, rel, '..')
  try {
    if (readdirSync(dir).length === 0) rmSync(dir, { recursive: true })
  } catch {
    // 目录已随上一轮删掉，忽略
  }
}
if (orphans.length > 0) console.log(`prune-dist: 删掉 ${String(orphans.length)} 个孤儿产物`)
