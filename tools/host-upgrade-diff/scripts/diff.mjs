/**
 * 宿主升级差异核对：只读比对「一版官方 npm 产物」与「本仓会话预览已用面」。
 * 用法：
 *   node tools/host-upgrade-diff/scripts/diff.mjs --self-check
 *   node tools/host-upgrade-diff/scripts/diff.mjs <解包根目录>
 * 取包 / 解包 / 读官方实现本体 / 判读 / 改代码都不归本脚本。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import vm from 'node:vm'

const HERE = dirname(fileURLToPath(import.meta.url))
const TOOL = resolve(HERE, '..')
const ROOT = resolve(HERE, '../../..')
const TEMPLATE = join(TOOL, 'output-template.md')
const LOG_DIR = join(TOOL, 'log')
const VARS = ['TIMESTAMP', 'INPUT', 'GATE', 'MISSING', 'EXTRA', 'RULES', 'MANUAL', 'SUMMARY']

const read = (p) => readFileSync(p, 'utf8')
const rel = (p) => p.replace(`${ROOT}/`, '')
const atLine = (text, index) => text.slice(0, index).split('\n').length
const uniq = (xs) => [...new Set(xs)].sort()
const CSS_DECL = /^\s*const (css(?:\$\d+)?) = (.+);\s*$/
const TAG_DECL = /^\s*const (tagId(?:\$\d+)?) = ("(?:[^"\\]|\\.)*");\s*$/
const PLAIN_CSS = /^\s*const css(?:\$\d+)? = ("(?:[^"\\]|\\.)*");\s*$/gm
const GLOBAL_CSS = /(?:var|const|let)\s+\w+_css_default\s*=\s*("(?:[^"\\]|\\.)*");/g
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')

function walk(dir, exts, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    if (['node_modules', 'dist', 'log', '.git'].includes(name)) continue
    if (name.endsWith('.generated.ts')) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, exts, out)
    else if (exts.some((e) => name.endsWith(e))) out.push(p)
  }
  return out
}

/** 官方 css$N 是整条拼接表达式（含 + require.asset(...) +），必须整条求值，不能只取第一段引号。 */
function evalCssExpr(expr) {
  const sandbox = { require: { asset: (p) => `asset:${p}` } }
  return vm.runInNewContext(`(${expr})`, sandbox, { timeout: 1000 })
}

/** 类名 = <hash>_<语义名>；哈希自身可能带下划线，按最后一个 _ 切。与 official-classes.ts:48-80 同规则。 */
// shortcut: 语义名含下划线时 lastIndexOf 会切错，官方语义名是 camelCase 故当前安全；官方改名后需重校。
function parseSemantics(css) {
  const tokens = []
  const re = /\.([A-Za-z0-9_-]+)/g
  let m = re.exec(css)
  while (m !== null) {
    tokens.push(m[1])
    m = re.exec(css)
  }
  const counts = new Map()
  for (const token of tokens) {
    const at = token.lastIndexOf('_')
    if (at <= 0 || at === token.length - 1) continue
    const prefix = token.slice(0, at)
    counts.set(prefix, (counts.get(prefix) ?? 0) + 1)
  }
  let prefix = ''
  let best = 0
  counts.forEach((count, key) => { if (count > best) { best = count; prefix = key } })
  const out = new Set()
  if (prefix === '') return out
  for (const token of tokens) {
    if (!token.startsWith(`${prefix}_`)) continue
    const semantic = token.slice(prefix.length + 1)
    if (semantic !== '' && !semantic.includes('_')) out.add(semantic)
  }
  return out
}

const dataTokens = (text) => new Set([...text.matchAll(/\bdata-[a-z][a-z0-9-]*/g)].map((m) => m[0]))
const dswVars = (text) =>
  new Set([...text.matchAll(/--dsw-[a-z0-9]+(?:-[a-z0-9]+)*(?![a-z0-9_-])/g)].map((m) => m[0]))

/** css 与 tagId 同后缀配对：css$17 对 tagId$17，css 对 tagId（官方每包还有一段无编号声明）。 */
// tags 用数组而非 Map：同文件两条无编号 tagId 会被 Map 覆盖，计数巧合会让 gate 放行。
function parseClient(text) {
  const css = []
  const tags = []
  text.split('\n').forEach((line, i) => {
    let m = CSS_DECL.exec(line)
    if (m !== null) {
      css.push({ key: m[1], expr: m[2], line: i + 1 })
      return
    }
    m = TAG_DECL.exec(line)
    if (m !== null) tags.push({ key: m[1], value: JSON.parse(m[2]), line: i + 1 })
  })
  return { css, tags }
}

function pairCss(parsed) {
  return parsed.css.map((css) => {
    const key = `tagId${css.key.slice('css'.length)}`
    const hits = parsed.tags.filter((t) => t.key === key)
    return { css, tag: hits.length === 1 ? hits[0] : undefined, duplicate: hits.length > 1 }
  })
}

/** 类名面只认 lib/client.js；其余子文件的纯字符串 CSS 只进集合面（它们含引用外部变量的 CSS，不可求值）。 */
function clientFiles(base) {
  const lib = join(base, 'lib')
  if (!existsSync(lib)) return []
  return readdirSync(lib)
    .filter((n) => /^client.*\.js$/.test(n))
    .sort()
    .map((n) => {
      const text = read(join(lib, n))
      return { file: n, text, parsed: n === 'client.js' ? parseClient(text) : null }
    })
}

/** 抽本仓对官方类名的字面量调用，以及 cls/C/D/gcc 这类「固定 Module + 形参」包装。 */
function extractPairs(text, label) {
  const pairs = []
  for (const m of text.matchAll(/officialClass\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g)) {
    pairs.push({ module: m[1], semantic: m[2], at: `${label}:${atLine(text, m.index)}` })
  }
  const wrappers = [...text.matchAll(
    /(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*\(\s*([A-Za-z_$][\w$]*)\s*(?::[^)]*)?\)\s*(?::[^=\n]+)?=>\s*officialClass\(\s*['"]([^'"]+)['"]\s*,\s*([A-Za-z_$][\w$]*)\s*\)/g,
  )]
  for (const w of wrappers) {
    if (w[2] !== w[4]) continue
    const name = w[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const callRe = new RegExp(`(?<![\\w$.])${name}\\(\\s*['"]([^'"]+)['"]\\s*\\)`, 'g')
    for (const m of text.matchAll(callRe)) {
      pairs.push({ module: w[3], semantic: m[1], at: `${label}:${atLine(text, m.index)}` })
    }
  }
  return uniq(pairs.map((p) => `${p.module}\u0000${p.semantic}\u0000${p.at}`))
    .map((s) => {
      const [module, semantic, at] = s.split('\u0000')
      return { module, semantic, at }
    })
}

function repoUsage() {
  const files = walk(join(ROOT, 'src/adv/session'), ['.ts', '.css'])
  const pairs = []
  const dataAttrs = new Set()
  const dsw = new Set()
  for (const f of files) {
    const text = read(f)
    pairs.push(...extractPairs(text, rel(f)))
    const code = stripComments(text)
    for (const x of dataTokens(code)) dataAttrs.add(x)
    for (const x of dswVars(code)) dsw.add(x)
  }
  for (const f of walk(join(ROOT, 'src/design'), ['.css'])) {
    const code = stripComments(read(f))
    for (const x of dswVars(code)) dsw.add(x)
  }
  return { pairs, dataAttrs, dsw }
}

function officialClassFacts() {
  const text = read(join(ROOT, 'src/adv/session/official-classes.ts'))
  const block = /const CSS_PKG_PREFIXES = \[([\s\S]*?)\]/.exec(text)?.[1] ?? ''
  const at = text.indexOf('const CSS_PKG_PREFIXES')
  return {
    prefixes: [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]),
    aligned: /ALIGNED_HOST_VERSION\s*=\s*'([^']+)'/.exec(text)?.[1] ?? '(未登记)',
    prefixLine: at < 0 ? 0 : atLine(text, at),
  }
}

function collectPackages(input) {
  if (!existsSync(input)) throw new Error(`解包根目录不存在：${input}`)
  const out = []
  for (const name of readdirSync(input)) {
    const d = join(input, name)
    if (!statSync(d).isDirectory()) continue
    const base = existsSync(join(d, 'package', 'package.json')) ? join(d, 'package') : d
    const metaPath = join(base, 'package.json')
    if (!existsSync(metaPath)) continue
    const meta = JSON.parse(read(metaPath))
    out.push({
      name: meta.name ?? name,
      version: meta.version ?? '?',
      main: meta.main ?? '',
      base,
      hasClient: existsSync(join(base, 'lib', 'client.js')),
      hasTypes: existsSync(join(base, 'lib', 'types')),
    })
  }
  return out
}

/** gate 只回答「脚本赖以解析的形态变没变」；内容差异一律进清单，不在这里拦。 */
function runGate(pkgs, facts) {
  const checks = []
  const expected = facts.prefixes.map((p) => p.replace(/\/$/, ''))
  const byName = new Map(pkgs.map((p) => [p.name, p]))
  const missing = expected.filter((e) => !byName.has(e))
  const duplicates = pkgs.length - byName.size
  const extra = uniq(pkgs.filter((p) => !expected.includes(p.name)).map((p) => p.name))
  const versions = uniq(pkgs.map((p) => p.version))
  checks.push({
    name: '① 单版包清单 / 版本一致性',
    ok: missing.length === 0 && duplicates === 0 && versions.length <= 1,
    observed: `期望 ${expected.length} 个注入包；实到 ${byName.size}（重复 ${duplicates}）；缺 ${missing.join(', ') || '无'}；额外 ${extra.join(', ') || '无'}；全部 ${pkgs.length} 包版本 ${versions.join(', ')}`,
    at: `src/adv/session/official-classes.ts:${facts.prefixLine}`,
  })

  const expectedPkgs = expected.map((e) => byName.get(e)).filter((p) => p !== undefined)
  const entryBad = expectedPkgs.filter((p) => p.main === '' || !existsSync(join(p.base, p.main)))
  const clientBad = expectedPkgs.filter((p) => !p.hasClient)
  const typesCount = pkgs.filter((p) => p.hasTypes).length
  checks.push({
    name: '② main / lib/client.js（lib/types 仅记录）',
    ok: entryBad.length === 0 && clientBad.length === 0,
    observed: `注入包 main 不可用 ${entryBad.map((p) => p.name).join(', ') || '无'}；缺 client.js ${clientBad.map((p) => p.name).join(', ') || '无'}；lib/types ${typesCount}/${pkgs.length} 包存在（脚本不读它，不拦）`,
    at: 'package.json:main',
  })

  const perPkg = pkgs.filter((p) => p.hasClient).map((p) => {
    const files = clientFiles(p.base)
    const main = files.find((f) => f.file === 'client.js')
    return { name: p.name, files, text: main?.text ?? '' }
  })

  const shapeBad = []
  let tagTotal = 0
  for (const name of expected) {
    const c = perPkg.find((x) => x.name === name)
    if (c === undefined) {
      shapeBad.push(`${name}: 无 client.js`)
      continue
    }
    const hasSelector = /style\[data-plugin-css=/.test(c.text)
    const hasDataset = /dataset\.pluginCss\s*=/.test(c.text)
    const values = c.files.filter((f) => f.parsed !== null)
      .flatMap((f) => f.parsed.tags.map((t) => t.value))
    tagTotal += values.length
    const badFormat = values.filter((v) => !v.startsWith(`${name}/`)
      || !v.endsWith('.module.css')
      || v.slice(name.length + 1).includes('/'))
    if (!hasSelector || !hasDataset || values.length === 0 || badFormat.length > 0) {
      shapeBad.push(`${name}: selector=${hasSelector} dataset=${hasDataset} tagId=${values.length} 格式异常=${badFormat.length}`)
    }
  }
  checks.push({
    name: '③ 逐包 data-plugin-css + tagId 前缀',
    ok: shapeBad.length === 0,
    observed: `逐包检查 ${expected.length} 个注入包；tagId 声明 ${tagTotal} 条；异常 ${shapeBad.length === 0 ? '无' : shapeBad.join(' | ')}`,
    at: 'lib/client.js',
  })

  const parseBad = []
  let decls = 0
  let tagDecls = 0
  let paired = 0
  let semanticsTotal = 0
  const moduleOwners = new Map()
  for (const c of perPkg) {
    let pkgDecls = 0
    let pkgSemantics = 0
    for (const f of c.files) {
      if (f.parsed === null) continue
      // 独立基准：声明形态一变（let/模板字符串/合并声明）就拦，误拦优于静默给错清单。
      const rawCss = (f.text.match(/(?:const|let|var)[ \t]+css(?:\$\d+)?[ \t]*=/g) ?? []).length
      const rawTags = (f.text.match(/(?:const|let|var)[ \t]+tagId(?:\$\d+)?[ \t]*=/g) ?? []).length
      if (rawCss !== f.parsed.css.length || rawTags !== f.parsed.tags.length) {
        parseBad.push(`${c.name}/${f.file}: 声明形态变化（原文 css=${rawCss}/tagId=${rawTags}，解析 css=${f.parsed.css.length}/tagId=${f.parsed.tags.length}）`)
      }
      const pairs = pairCss(f.parsed)
      decls += f.parsed.css.length
      pkgDecls += f.parsed.css.length
      tagDecls += f.parsed.tags.length
      if (f.parsed.css.length !== f.parsed.tags.length) {
        parseBad.push(`${c.name}/${f.file}: css=${f.parsed.css.length} tagId=${f.parsed.tags.length}`)
      }
      for (const p of pairs) {
        if (p.duplicate) parseBad.push(`${c.name}/${f.file}:${p.css.line} tagId 重复`)
        if (p.tag === undefined) {
          parseBad.push(`${c.name}/${f.file}:${p.css.line} 未配对`)
          continue
        }
        try {
          const value = evalCssExpr(p.css.expr)
          if (typeof value !== 'string') throw new Error('求值结果非字符串')
          const semantics = parseSemantics(value)
          if (semantics.size === 0) throw new Error('抽不出语义名（类名切分形态变了）')
          semanticsTotal += semantics.size
          pkgSemantics += semantics.size
          paired++
          const module = basename(p.tag.value).replace(/\.module\.css$/, '')
          const owner = moduleOwners.get(module)
          if (owner !== undefined && owner !== c.name) parseBad.push(`模块名跨包重复：${module}（${owner} / ${c.name}）`)
          moduleOwners.set(module, c.name)
        } catch (err) {
          parseBad.push(`${c.name}/${f.file}:${p.css.line} ${err.message}`)
        }
      }
    }
    if (expected.includes(c.name) && (pkgDecls === 0 || pkgSemantics === 0)) {
      parseBad.push(`${c.name}: 注入包无可用 css 声明`)
    }
  }
  const assetCount = (perPkg.map((c) => c.files.map((f) => f.text).join('\n')).join('\n')
    .match(/\+\s*require\.asset\(/g) ?? []).length
  checks.push({
    name: '④ 逐包拼接求值 + 配对完整性 + 类名切分',
    ok: decls > 0 && paired === decls && paired === tagDecls && parseBad.length === 0,
    observed: `css 声明 ${decls}；tagId 声明 ${tagDecls}；成功配对 ${paired}；抽出语义名 ${semanticsTotal}；+ require.asset ${assetCount}（仅记录）；异常 ${parseBad.slice(0, 3).join(' | ') || '无'}`,
    at: 'lib/client.js',
  })
  return { checks, perPkg, extra, versions }
}

/** 类面按 CSS_PKG_PREFIXES 过滤（与 official-classes.ts 运行时同源）；集合面只收真正的 CSS 文本。 */
function officialSurface(perPkg, prefixes) {
  const allowed = new Set(prefixes.map((p) => p.replace(/\/$/, '')))
  const modules = new Map()
  let cssOnly = ''
  for (const c of perPkg) {
    const main = c.files.find((f) => f.parsed !== null)
    if (main !== undefined) {
      for (const p of pairCss(main.parsed)) {
        if (p.tag === undefined) continue
        const css = evalCssExpr(p.css.expr)
        cssOnly += `${css}\n`
        if (!allowed.has(c.name)) continue
        const module = basename(p.tag.value).replace(/\.module\.css$/, '')
        const entry = modules.get(module) ?? new Set()
        for (const semantic of parseSemantics(css)) entry.add(semantic)
        modules.set(module, entry)
      }
    }
    for (const f of c.files) {
      for (const m of f.text.matchAll(PLAIN_CSS)) cssOnly += `${JSON.parse(m[1])}\n`
      for (const m of f.text.matchAll(GLOBAL_CSS)) cssOnly += `${JSON.parse(m[1])}\n`
    }
  }
  return { modules, cssOnly }
}

function render(vars) {
  assert.deepEqual(Object.keys(vars).sort(), [...VARS].sort(), 'render 变量与模板占位符不一致')
  let out = read(TEMPLATE).replace(/^\uFEFF?\s*<!--[\s\S]*?-->\s*/, '')
  for (const [key, value] of Object.entries(vars)) out = out.replaceAll(`{{${key}}}`, value)
  assert.doesNotMatch(out, /\{\{[^}]+\}\}/, '模板有未替换的占位符')
  return out
}

function selfCheck() {
  const value = evalCssExpr('".Hash_root{color:red}" + require.asset("x.png") + ".Hash_frame{color:blue}"')
  assert.ok(value.includes('.Hash_root'), '整条拼接首段丢失')
  assert.ok(value.includes('asset:x.png'), 'require.asset 段丢失')
  assert.ok(value.includes('.Hash_frame'), '整条拼接尾段丢失')
  assert.deepEqual([...parseSemantics('._5OnbHa_root{}._5OnbHa_frame{}')].sort(), ['frame', 'root'])
  assert.deepEqual([...parseSemantics('.Ab1_root{}.Ab1_frame{}')].sort(), ['frame', 'root'])
  assert.deepEqual([...dataTokens('[data-foo="1"] .X_root{}[data-bar]')].sort(), ['data-bar', 'data-foo'])
  assert.deepEqual([...dswVars('color:var(--dsw-alias-bg-base)')], ['--dsw-alias-bg-base'])
  assert.deepEqual([...dswVars('--dsw-static-* = 1')], [], '截断的幽灵 token')
  const plain = 'const css = ".iWrAna_card{color:red}";\nconst tagId = "@deepseek-ai/dsh-client-ui-skill/SkillRow.module.css";'
  const parsed = parseClient(plain)
  assert.equal(parsed.css.length, 1, '无编号 css 声明必须解析到')
  assert.equal(parsed.tags.length, 1, '无编号 tagId 声明必须解析到')
  assert.equal(pairCss(parsed)[0].tag.value.endsWith('SkillRow.module.css'), true)
  assert.deepEqual(
    [...officialSurface([{ name: '@deepseek-ai/dsh-client-ui-skill', files: [{ file: 'client.js', text: plain, parsed }] }], ['@deepseek-ai/dsh-client-ui-skill/']).modules.keys()],
    ['SkillRow'],
  )
  assert.equal(
    officialSurface([{ name: '@deepseek-ai/other', files: [{ file: 'client.js', text: plain, parsed }] }], ['@deepseek-ai/dsh-client-ui-skill/']).modules.size,
    0,
    '非注入包不得进类面',
  )
  assert.equal(pairCss(parseClient(`${plain}\n${plain.split('\n')[1]}`))[0].duplicate, true, '重复 tagId 必须报出')
  const sample = "const cls = (semantic: string): string => officialClass('SkillRow', semantic) ?? ''\ncls('root')\ncls('frame')"
  assert.equal(extractPairs(sample, 'SkillRow.ts').length, 2)
  const dup = "const cls = (s: string) => officialClass('M', s)\nconst cls = (s: string) => officialClass('M', s)\ncls('a')"
  assert.equal(extractPairs(dup, 'x.ts').length, 1, '同文件双包装定义不应重复计数')
  assert.equal(extractPairs("const cls = (a: string) => officialClass('M', b)", 'x.ts').length, 0, '形参不符不应误抽')
  assert.deepEqual([...dataTokens(stripComments('/* data-plugin */ const x = 1 // data-ghost\n[data-real]'))].sort(), ['data-real'])
  assert.doesNotMatch(render(Object.fromEntries(VARS.map((k) => [k, '']))), /\{\{[^}]+\}\}/)
  console.log('self-check OK')
}

function timestamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

function table(rows) {
  return `| ${rows[0].join(' | ')} |\n|${rows[0].map(() => '---').join('|')}|\n${rows.slice(1).map((r) => `| ${r.join(' | ')} |`).join('\n')}`
}

const MANUAL = [
  '- [ ] `src/types/primitives.d.ts:7` ambient 导出 ↔ 官方 `lib/types/**/*.d.ts`（官方包不在本仓依赖里，本地声明只复述消费面）',
  '- [ ] `test/primitives-stub.mjs:12` `NAMES` 与 `:50` 解构导出两表是否仍覆盖官方导出（漏改会在链接期报错）',
  '- [ ] `src/adv/session/mirror/GenericCommandCard.ts:44` `TOOL_VARIANTS`、`:74` `TOOL_TITLE_KEYS` ↔ 官方 tool `client.js` 的 tool name 全集',
  '- [ ] `src/adv/session/mirror/process-groups.ts:89` `toolActivity()` ↔ 官方过程组 `stepGrouping: collapsed` 策略',
  '- [ ] 官方组件 / 原语替换：类名还在但组件换了（`UserMessageBubble` / `UserTextRun` / `Tag` / `DisclosureRow`），这类两版 diff 一条都发现不了',
  '- [ ] keyed toolview 槽位（`ui-skill` / `ui-renderer`）与宿主 RPC / policy 面：`src/adv/session/` 下 `faces.ts` / `open-session-view.ts`',
  '- [ ] 官方类名面按 `CSS_PKG_PREFIXES` 的 5 个注入包过滤，与 `official-classes.ts` 运行时同源；`primitives` 等包即便有 CSS 也不进类面，官方改版需重校前缀表',
  '- [ ] `client*.js` 子文件的 CSS 只进集合面、不进类面；如需其类名面要另写解析器',
  '- [ ] 第 4 节只列本仓已用模块；其余官方模块与 3 个子文件模块（ExcelBody / PdfBody / frontmatter-fields）整块略过，属方案取舍',
].join('\n')

function main() {
  const argv = process.argv.slice(2)
  if (argv.includes('--self-check')) {
    selfCheck()
    return
  }
  const input = argv.find((a) => !a.startsWith('--'))
  if (input === undefined) {
    console.error('用法：node tools/host-upgrade-diff/scripts/diff.mjs <解包根目录> [--self-check]')
    process.exitCode = 2
    return
  }
  const inputAbs = resolve(input)
  const facts = officialClassFacts()
  let pkgs
  let gate
  try {
    pkgs = collectPackages(inputAbs)
    gate = runGate(pkgs, facts)
  } catch (err) {
    console.error(`# gate 失败：产物不可读\n\n${err.message}\n\n不产出清单。`)
    process.exitCode = 1
    return
  }
  const gateRows = gate.checks.map((c) =>
    `- [${c.ok ? 'x' : ' '}] **${c.name}** — ${c.observed}（\`${c.at}\`）`)
  if (!gate.checks.every((c) => c.ok)) {
    console.error(`# gate 失败：不产出清单\n\n${gateRows.join('\n')}\n\n解析形态已变，改解析器后重跑。`)
    process.exitCode = 1
    return
  }

  const surface = officialSurface(gate.perPkg, facts.prefixes)
  const usage = repoUsage()
  const officialData = dataTokens(surface.cssOnly)
  const officialDsw = dswVars(surface.cssOnly)

  const missing = usage.pairs.filter((p) => !(surface.modules.get(p.module)?.has(p.semantic) ?? false))
  const usedModules = uniq(usage.pairs.map((p) => p.module))
  const usedByModule = new Map()
  for (const p of usage.pairs) {
    const set = usedByModule.get(p.module) ?? new Set()
    set.add(p.semantic)
    usedByModule.set(p.module, set)
  }
  const extraRows = []
  let extraTotal = 0
  for (const module of usedModules) {
    const fresh = uniq([...(surface.modules.get(module) ?? [])]
      .filter((s) => !(usedByModule.get(module)?.has(s) ?? false)))
    extraTotal += fresh.length
    if (fresh.length > 0) extraRows.push(`- **${module}**（${fresh.length}）：${fresh.join(', ')}`)
  }

  const dataGone = uniq([...usage.dataAttrs].filter((x) => !officialData.has(x)))
  const dswGone = uniq([...usage.dsw].filter((x) => !officialDsw.has(x)))
  const dataNew = uniq([...officialData].filter((x) => !usage.dataAttrs.has(x)))
  const dswNew = uniq([...officialDsw].filter((x) => !usage.dsw.has(x)))

  const stamp = timestamp()
  const md = render({
    TIMESTAMP: stamp,
    INPUT: [
      `- 官方产物（单版解包根目录）：\`${inputAbs}\``,
      `- 本仓当前对齐版本（单一真源 \`src/adv/session/official-classes.ts\`）：\`${facts.aligned}\``,
      `- 实取产物版本：\`${gate.versions.join(', ')}\`（gate ① 已校验全部 ${pkgs.length} 包一致）`,
      `- 本仓根：\`${ROOT}\``,
      `- 官方包 ${pkgs.length} 个：${pkgs.map((p) => `${p.name}@${p.version}`).join('、')}`,
      `- 只取一版；不下旧版、不建基线 / 快照。额外包（不在 \`CSS_PKG_PREFIXES\` 里、不进类面，但版本一致性对全部包生效）：${gate.extra.join(', ') || '无'}`,
    ].join('\n'),
    GATE: gateRows.join('\n'),
    MISSING: missing.length === 0
      ? '无。'
      : table([['模块', '语义名', '本仓坐标'], ...uniq(missing.map((p) => `${p.module}\u0000${p.semantic}\u0000${p.at}`))
        .map((s) => s.split('\u0000'))]),
    EXTRA: extraRows.length === 0 ? '无。' : `${extraRows.join('\n')}\n\n> 只列本仓已用的 ${usedModules.length} 个模块，共 ${extraTotal} 个语义名；单版比对只能说「官方有、我们没接」。其余官方模块按方案整块略过，见第 6 节。`,
    RULES: [
      `- 官方侧 = 求值后的模块 CSS + 各包全局样式表 + 子文件纯字符串 CSS，得 \`data-*\` ${officialData.size} 个 / \`--dsw-*\` ${officialDsw.size} 个；本仓侧 = \`src/adv/session/\` + \`src/design/tokens.css\`（已剥注释），得 ${usage.dataAttrs.size} / ${usage.dsw.size} 个`,
      `- 本仓有而官方未出现：\`data-*\` ${dataGone.length} 个（${dataGone.length === 0 ? '无' : dataGone.join(', ')}）；\`--dsw-*\` ${dswGone.length} 个（${dswGone.length === 0 ? '无' : dswGone.join(', ')}）`,
      `- 官方有而本仓未引用：\`data-*\` ${dataNew.length} 个 / \`--dsw-*\` ${dswNew.length} 个（只报数，避免淹没）`,
      '- 两侧均为 token 集合差，混着自绘属性与运行时属性；**属内容差异、不拦脚本**，只作线索，不可直接当「官方删了 / 新增了」。',
    ].join('\n'),
    MANUAL,
    SUMMARY: `gate ${gate.checks.length}/${gate.checks.length} 通过；本仓失效项 ${missing.length} 条；官方有本仓未接 ${extraTotal} 条（已按本仓已用模块过滤）；官方包 ${pkgs.length} 个。只定位差异，不改代码。`,
  })
  mkdirSync(LOG_DIR, { recursive: true })
  const outPath = join(LOG_DIR, `${stamp}.md`)
  writeFileSync(outPath, md)
  console.log(md)
  console.log(`\n已落盘：${rel(outPath)}`)
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try {
    main()
  } catch (err) {
    console.error(`# 执行失败：不产出清单\n\n${err.stack ?? err.message}`)
    process.exitCode = 1
  }
}
