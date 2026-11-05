// 目录分类自检（2026-11-05）：分类规则写在 docs/design/structure.md，
// 靠目录本身兜住 —— 新控件放错地方 / 又冒出个新类 / 把 ts 与 css 分居，这里直接红。
import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'

const UI = new URL('../src/ui/', import.meta.url)
/** 七个类目录（structure.md §二）。新增一个类要用户拍板，同时改这里。 */
const CLASSES = ['actions', 'inputs', 'display', 'feedback', 'layout', 'navigation', 'infra']
/** ui 根只许有这两个文件：对外入口 + 官方 adapter。 */
const ROOT_FILES = new Set(['index.ts', 'official.ts'])

test('src/ui 根只留 index.ts / official.ts', async () => {
  const entries = await readdir(UI, { withFileTypes: true })
  const stray = entries.filter((e) => e.isFile() && !ROOT_FILES.has(e.name)).map((e) => e.name)
  const unknown = entries.filter((e) => e.isDirectory() && !CLASSES.includes(e.name)).map((e) => e.name)
  assert.deepEqual(stray, [], `src/ui 根出现未分类文件（按 structure.md §二 归到某个类目录）：\n${stray.join('\n')}`)
  assert.deepEqual(unknown, [], `src/ui 出现未登记的类目录（新增类要拍板）：\n${unknown.join('\n')}`)
})

test('每个类目录：css 与 generated 成对，且一个控件的四份东西同目录', async () => {
  const problems = []
  for (const cls of CLASSES) {
    const names = (await readdir(new URL(`${cls}/`, UI))).filter((n) => n.endsWith('.css') || n.endsWith('.ts'))
    for (const name of names) {
      if (name.endsWith('.css')) {
        const generated = `${name.slice(0, -4)}-css.generated.ts`
        if (!names.includes(generated)) problems.push(`${cls}/${name} 缺生成物 ${generated}`)
      } else if (name.endsWith('-css.generated.ts')) {
        const css = `${name.slice(0, -'-css.generated.ts'.length)}.css`
        if (!names.includes(css)) problems.push(`${cls}/${name} 没有真源 ${css}`)
      }
    }
  }
  assert.deepEqual(problems, [], `样式真源与生成物必须同目录成对：\n${problems.join('\n')}`)
})

test('index.ts 的导出都指向类目录（根部不再挂控件）', async () => {
  const text = await readFile(new URL('index.ts', UI), 'utf8')
  const stray = []
  for (const [, spec] of text.matchAll(/from '\.\/([^']+\.js)'/g)) {
    if (spec === 'official.js') continue
    if (!CLASSES.some((cls) => spec.startsWith(`${cls}/`))) stray.push(spec)
  }
  assert.deepEqual(stray, [], `ui/index.ts 从类目录之外导出（先归位再导出）：\n${stray.join('\n')}`)
})
