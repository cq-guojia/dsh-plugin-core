import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir, access } from 'node:fs/promises'
import { UI_ENTRIES } from '../scripts/ui-entries.mjs'

const ROOT = new URL('../', import.meta.url)
const pkg = JSON.parse(await readFile(new URL('package.json', ROOT), 'utf8'))

test('单块入口全部登记在 exports，且类型与产物都在磁盘上', async () => {
  for (const [sub, file] of UI_ENTRIES) {
    const entry = pkg.exports[sub]
    assert.ok(entry, `缺 exports 条目：${sub}`)
    assert.equal(entry.default, `./dist/${file}.js`, `${sub} 的产物路径不对`)
    assert.equal(entry.types, `./dist/${file}.d.ts`, `${sub} 的类型路径不对`)
    await access(new URL(`dist/${file}.js`, ROOT))
    await access(new URL(`dist/${file}.d.ts`, ROOT))
  }
})

test('exports 必须显式枚举，不允许通配', () => {
  assert.deepEqual(
    Object.keys(pkg.exports).filter((key) => key.includes('*')),
    [],
    '通配子路径会把 dist 内部文件全变成入口，且绕过导出面快照',
  )
})

test('新增控件文件必须登记单块入口', async () => {
  const listed = new Set(UI_ENTRIES.map(([, file]) => `src/${file}.ts`))
  const classes = ['actions', 'inputs', 'display', 'feedback', 'layout', 'navigation', 'infra']
  const found = []
  for (const cls of classes) {
    for (const name of await readdir(new URL(`src/ui/${cls}/`, ROOT))) {
      if (/^[A-Z]/.test(name) && name.endsWith('.ts') && !name.endsWith('.generated.ts')) {
        found.push(`src/ui/${cls}/${name}`)
      }
    }
  }
  // CodeViewer 与 CodeEditor 共用 ./ui/code-viewer 一条子路径（见 structure.md §六）。
  const coveredElsewhere = new Set(['src/ui/display/CodeViewer.ts'])
  assert.deepEqual(
    found.filter((file) => !listed.has(file) && !coveredElsewhere.has(file)),
    [],
    '有控件文件没登记单块入口',
  )
})

test('sideEffects 是精确数组，覆盖顶层注册文件', () => {
  assert.ok(Array.isArray(pkg.sideEffects), 'sideEffects 必须是精确数组，不能全量 false')
  assert.ok(pkg.sideEffects.includes('./dist/ui/official.js'), 'official.js 顶层注册宿主桥，不能被摇掉')
})
