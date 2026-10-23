// 文档真源 → 双投影。
//   真源 = docs/**/*.doc.ts（typed 数据模块，手写）
//   投影1 = docs/**/*.md（给 Agent / 人读，随包发布，勿手改头）
//   投影2 = packages/demo/src/doc-data.generated.ts（demo import，按 section.id 扁平聚合，零解析）
// 本脚本只读取真源、写出投影，绝不修改 .doc.ts。
//
// 链路：esbuild 把 .doc.ts 打成 ESM → 临时文件 → import 取 default → 渲染两份投影。
// MAP 显式登记要处理的文档（照 scripts/gen-css.mjs 的 MAP 惯例）；不在 MAP 里的 .doc.ts 不碰。
// --check：比对已落盘的 doc-data.generated.ts 是否最新，不一致退出 1（挂 pretest 当闸）。
import { build } from 'esbuild'
import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const MAP = [
  { doc: 'docs/design/features/explorer.doc.ts', md: 'docs/design/features/explorer.md', name: 'explorer' },
  { doc: 'docs/design/features/design.doc.ts', md: 'docs/design/features/design.md', name: 'design' },
  { doc: 'docs/design/features/session.doc.ts', md: 'docs/design/features/session.md', name: 'session' },
  { doc: 'docs/design/features/utils.doc.ts', md: 'docs/design/features/utils.md', name: 'utils' },
  { doc: 'docs/examples/integration.doc.ts', md: 'docs/examples/integration.md', name: 'integration' },
  { doc: 'docs/design/features/ui.doc.ts', md: 'docs/design/features/ui.md', name: 'ui' },
]

const CHECK = process.argv.includes('--check')

async function loadDoc(relPath) {
  const abs = join(root, relPath)
  const out = join(tmpdir(), `dsh-doc-${process.pid}-${Math.random().toString(36).slice(2)}.mjs`)
  await build({ entryPoints: [abs], bundle: true, format: 'esm', platform: 'node', write: true, outfile: out, logLevel: 'silent' })
  try {
    const mod = await import(`${pathToFileURL(out).href}?t=${Date.now()}`)
    return mod.default
  } finally {
    rmSync(out, { force: true })
  }
}

/** 表格单元格转义：类型里的联合类型 `A | B` 不转义会把 Markdown 表格撑破（MD056）。 */
const cell = (text) => String(text).replaceAll('|', '\\|')

function renderMd(doc) {
  const lines = []
  lines.push('<!-- 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改；改对应的 .doc.ts 后重跑 node scripts/gen-docs.mjs -->')
  lines.push('')
  lines.push(`# ${doc.title.zh}`)
  lines.push('')
  lines.push(`> EN: ${doc.title.en}`)
  lines.push('')
  if (doc.exports?.length) {
    lines.push(`导出：${doc.exports.join('、')}`)
    lines.push('')
  }
  for (const sec of doc.sections) {
    lines.push(`## ${sec.heading.zh}`)
    lines.push('')
    lines.push(`> EN: ${sec.heading.en}`)
    lines.push('')
    for (const p of sec.prose ?? []) {
      lines.push(p.zh)
      lines.push('')
      lines.push(`> EN: ${p.en}`)
      lines.push('')
    }
    for (const tbl of sec.api ?? []) {
      const hasReq = tbl.rows.some((r) => r.required != null)
      const head = ['参数', '类型', ...(hasReq ? ['必填'] : []), '默认', '说明(zh)', '说明(en)']
      lines.push(`| ${head.join(' | ')} |`)
      lines.push(`|${head.map(() => '---').join('|')}|`)
      for (const r of tbl.rows) {
        const cells = [
          `\`${cell(r.name)}\``,
          `\`${cell(r.type)}\``,
          ...(hasReq ? [cell(r.required ?? '—')] : []),
          cell(r.def),
          cell(r.desc.zh),
          cell(r.desc.en),
        ]
        lines.push(`| ${cells.join(' | ')} |`)
      }
      lines.push('')
    }
    for (const c of sec.code ?? []) {
      lines.push(`\`\`\`${c.lang} id="${c.id}"`)
      lines.push(c.src)
      lines.push('```')
      lines.push('')
    }
  }
  return lines.join('\n')
}

// 按 section.id 扁平聚合；重 id 报错（闸）。
function aggregate(docs) {
  const flat = {}
  for (const doc of docs) {
    for (const sec of doc.sections) {
      if (Object.hasOwn(flat, sec.id)) {
        throw new Error(`section.id 重复：${sec.id}（${doc.title.zh} 与已有冲突）`)
      }
      flat[sec.id] = sec
    }
  }
  return flat
}

function renderDemoData(flat) {
  return `// 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改。来源：docs/**/*.doc.ts（按 section.id 扁平聚合）
export const docData = ${JSON.stringify(flat, null, 2)}
`
}

function readCommittedDocData() {
  const p = join(root, 'packages/demo/src/doc-data.generated.ts')
  if (!existsSync(p)) return null
  const txt = readFileSync(p, 'utf8')
  const m = txt.match(/export const docData = (\{[\s\S]*\})\s*$/)
  if (!m) throw new Error('无法解析现有 doc-data.generated.ts')
  return JSON.parse(m[1])
}

async function main() {
  const docs = []
  for (const m of MAP) {
    const doc = await loadDoc(m.doc)
    const mdPath = join(root, m.md)
    mkdirSync(dirname(mdPath), { recursive: true })
    writeFileSync(mdPath, renderMd(doc))
    docs.push(doc)
    console.log(`gen docs: ${m.doc} -> ${m.md}`)
  }
  const flat = aggregate(docs)

  if (CHECK) {
    const committed = readCommittedDocData()
    if (!committed) {
      console.error('FAIL: doc-data.generated.ts 不存在，请先运行 pnpm gen:docs')
      process.exit(1)
    }
    const a = JSON.stringify(flat)
    const b = JSON.stringify(committed)
    if (a !== b) {
      const ak = new Set(Object.keys(flat))
      const bk = new Set(Object.keys(committed))
      const onlyFresh = [...ak].filter((k) => !bk.has(k))
      const onlyCommitted = [...bk].filter((k) => !ak.has(k))
      console.error('FAIL: doc-data.generated.ts 与真源不一致，请运行 pnpm gen:docs 重新生成')
      if (onlyFresh.length) console.error('  真源有、生成物缺：', onlyFresh.join(', '))
      if (onlyCommitted.length) console.error('  生成物有、真源缺：', onlyCommitted.join(', '))
      process.exit(1)
    }
    console.log('gen docs --check: OK（doc-data.generated.ts 与真源一致）')
    return
  }

  const demoPath = join(root, 'packages/demo/src/doc-data.generated.ts')
  mkdirSync(dirname(demoPath), { recursive: true })
  writeFileSync(demoPath, renderDemoData(flat))
  console.log('gen docs: -> packages/demo/src/doc-data.generated.ts')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
