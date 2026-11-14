/**
 * 宿主升级差异核对：只读比对「一版官方 npm 产物」与「本仓会话预览已用面」。
 * 用法：
 *   node tools/host-upgrade-diff/scripts/diff.mjs --self-check
 *   node tools/host-upgrade-diff/scripts/diff.mjs <解包根目录>
 *   node tools/host-upgrade-diff/scripts/diff.mjs --contract <解包根目录>   # 官方 src/ → baseline.json
 *   node tools/host-upgrade-diff/scripts/diff.mjs --contract-check           # pretest 闸，只读基线
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
// 声明起点按整文件扫描：旧产物按行写成双引号串，0.2.2-rc.3 起压缩成单行 + 反引号模板串。
const DECL_RE = /(?:const|let|var)\s+(css|tagId)(\$\d+)?\s*=\s*/g
const PLAIN_DECL_RE = /(?:var|const|let)\s+(?:css(?:\$\d+)?|\w+_css_default)\s*=\s*/g
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
// 抽类名时保留行列：注释里的 officialClass(...) 不能算「已落地」，at: 行号也不能因剥注释而错位。
// 逐字符扫描区分字符串字面量里的 // 与真注释（'https://x' 后面的真实代码不能被抹掉）。
const blankComments = (text) => {
  let out = ''
  let quote = ''
  let block = false
  let line = false
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    const next = text[i + 1] ?? ''
    if (line) {
      if (ch === '\n') { line = false; out += '\n' } else out += ' '
      continue
    }
    if (block) {
      if (ch === '*' && next === '/') { block = false; out += '  '; i += 1 }
      else out += ch === '\n' ? '\n' : ' '
      continue
    }
    if (quote !== '') {
      out += ch
      if (ch === '\\') { out += next; i += 1 }
      else if (ch === quote) quote = ''
      continue
    }
    if (ch === '/' && next === '*') { block = true; out += '  '; i += 1; continue }
    if (ch === '/' && next === '/') { line = true; out += '  '; i += 1; continue }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch
    out += ch
  }
  return out
}

/**
 * 把「字符串字面量内部含 officialClass(」的内容遮蔽成等长空格（保留引号与换行）。
 * 目的：CSS 生成物 / 文档字符串里出现的 `officialClass()` 文本不能算一次真实调用；
 * 而真实调用 `officialClass('M','x')` 的参数不含 `officialClass(`，不会被遮蔽。
 * 模板串只遮蔽**静态段**：`${...}` 里是真实代码（本仓大量 `${officialClass('M','x') ?? ''}`），
 * 整段遮蔽会把真实调用一起吃掉（曾导致 8 条已挂类名被判成未接）。
 */
function maskStringCalls(text) {
  const maskIfGhost = (seg) => (seg.includes('officialClass(') ? seg.replace(/[^\n]/g, ' ') : seg)
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"' || ch === "'") {
      let end = -1
      for (let j = i + 1; j < text.length; j++) {
        if (text[j] === '\\') { j++; continue }
        if (text[j] === ch) { end = j; break }
      }
      if (end < 0) { out += maskIfGhost(text.slice(i + 1)); break }
      out += ch + maskIfGhost(text.slice(i + 1, end)) + ch
      i = end
      continue
    }
    if (ch === '`') {
      out += '`'
      let seg = ''
      let j = i + 1
      while (j < text.length && text[j] !== '`') {
        if (text[j] === '\\') { seg += text[j] + (text[j + 1] ?? ''); j += 2; continue }
        if (text[j] === '$' && text[j + 1] === '{') {
          out += maskIfGhost(seg)
          seg = ''
          let depth = 1
          let expr = '${'
          let k = j + 2
          while (k < text.length && depth > 0) {
            if (text[k] === '{') depth += 1
            else if (text[k] === '}') {
              depth -= 1
              if (depth === 0) { expr += '}'; k += 1; break }
            }
            expr += text[k]
            k += 1
          }
          out += expr
          j = k
          continue
        }
        seg += text[j]
        j += 1
      }
      out += maskIfGhost(seg)
      out += '`'
      i = j
      continue
    }
    out += ch
  }
  return out
}

/** 从引号处读完整字面量；反斜杠转义要跳过，否则 CSS 里的转义引号会提前截断。 */
function readQuoted(text, start) {
  const quote = text[start]
  if (quote !== '"' && quote !== '`') return null
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === '\\') { i++; continue }
    if (text[i] === quote) return { literal: text.slice(start, i + 1), end: i + 1 }
  }
  return null
}

/** 两种字符串统一交给 JS 求值；模板串若带 ${} 插值会当场抛错，不静默漏读。 */
function evalLiteral(literal) {
  return vm.runInNewContext(`(${literal})`, {}, { timeout: 1000 })
}

/**
 * 递归收文件。`skipGenerated` 默认 true（CSS 生成物只含样式文本，扫它没意义）；
 * 但「本仓 officialClass 调用面」必须扫生成物 —— 否则把调用塞进 .generated.ts 就能整块免检。
 */
function walk(dir, exts, out = [], opts = {}) {
  if (!existsSync(dir)) return out
  const skipGenerated = opts.skipGenerated ?? true
  for (const name of readdirSync(dir)) {
    if (['node_modules', 'dist', 'log', '.git'].includes(name)) continue
    if (skipGenerated && name.endsWith('.generated.ts')) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, exts, out, opts)
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
/** css 拼接表达式含多段模板串，段内 CSS 分号不是声明结束；逐段跳过引号再找真分号。 */
function readCssExpr(text, first) {
  let i = first.end
  while (i < text.length) {
    if (text[i] === '"' || text[i] === '`') {
      const q = readQuoted(text, i)
      if (q === null) return null
      i = q.end
      continue
    }
    if (text[i] === ';') return { expr: first.literal + text.slice(first.end, i), end: i + 1 }
    i++
  }
  return null
}

function parseClient(text) {
  const css = []
  const tags = []
  const re = new RegExp(DECL_RE.source, 'g')
  let m = re.exec(text)
  while (m !== null) {
    const q = readQuoted(text, re.lastIndex)
    if (q !== null) {
      const key = `${m[1]}${m[2] ?? ''}`
      const line = atLine(text, m.index)
      if (m[1] === 'css') {
        const expr = readCssExpr(text, q)
        // 未闭合声明留一段语法尾巴，让 gate ④ 报出坐标，而不是静默漏掉拼接段。
        css.push({ key, expr: expr === null ? `${q.literal}+` : expr.expr, line })
        re.lastIndex = Math.max(re.lastIndex, expr?.end ?? q.end)
      } else {
        tags.push({ key, value: evalLiteral(q.literal), line })
        re.lastIndex = Math.max(re.lastIndex, q.end)
      }
    }
    m = re.exec(text)
  }
  return { css, tags }
}

/** 子文件与全局样式表的纯字符串 CSS 只进集合面；拼接声明由 parseClient 求值，不在这里重复收。 */
function plainCssLiterals(text) {
  const out = []
  const re = new RegExp(PLAIN_DECL_RE.source, 'g')
  let m = re.exec(text)
  while (m !== null) {
    const q = readQuoted(text, re.lastIndex)
    if (q !== null) {
      // 带 ${} 的是运行时拼出来的样式，不是静态 CSS 文本，求值会炸也不该进集合面。
      if (text[q.end] === ';' && !q.literal.includes('${')) out.push(evalLiteral(q.literal))
      re.lastIndex = Math.max(re.lastIndex, q.end)
    }
    m = re.exec(text)
  }
  return out
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
  // `.tsx` 与 `.generated.ts` 都要扫：漏扫等于给「换个文件名」留免检口子。
  // adapter 本体（officialClass 定义与 officialClasses helper）不挂类名，两处判据统一跳过。
  const files = walk(join(ROOT, 'src/adv/session'), ['.ts', '.tsx', '.css'], [], { skipGenerated: false })
    .filter((f) => !f.endsWith('official-classes.ts'))
  const pairs = []
  const dataAttrs = new Set()
  const dsw = new Set()
  for (const f of files) {
    const text = read(f)
    pairs.push(...extractPairs(maskStringCalls(blankComments(text)), rel(f)))
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
      for (const css of plainCssLiterals(f.text)) cssOnly += `${css}\n`
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
  assert.equal(evalLiteral('"a\\"b"'), 'a"b', '转义引号必须按 JS 语义求值')
  const tpl = 'const css$3=`.H_root{color:red}`;const tagId$3=`@deepseek-ai/dsh-client-ui-skill/SkillRow.module.css`;'
  const parsedTpl = parseClient(tpl)
  assert.equal(parsedTpl.css.length, 1, '单行反引号 css 声明必须解析到')
  assert.equal(parsedTpl.tags.length, 1, '单行反引号 tagId 声明必须解析到')
  assert.equal(evalCssExpr(parsedTpl.css[0].expr), '.H_root{color:red}')
  assert.equal(parsedTpl.tags[0].value, '@deepseek-ai/dsh-client-ui-skill/SkillRow.module.css')
  const oneLine = 'const css$1=`.A_root{}`;const tagId$1=`p/A.module.css`;const css$2=`.B_root{}`;const tagId$2=`p/B.module.css`;'
  assert.equal(parseClient(oneLine).css.length, 2, '同一行多个声明不得漏')
  assert.deepEqual(pairCss(parseClient(oneLine)).map((p) => p.tag?.value), ['p/A.module.css', 'p/B.module.css'])
  assert.deepEqual(plainCssLiterals('const css = `.X_a{}`;var x_css_default = ".X_b{}";'), ['.X_a{}', '.X_b{}'])
  const interpolated = 'var x_css_default = `font-weight:$' + '{w}`;const css = `.X_c{}`;'
  assert.deepEqual(
    plainCssLiterals(interpolated),
    ['.X_c{}'],
    '运行时插值模板串不是静态 CSS，跳过而不是求值',
  )
  const stitched = 'const css$1=`.A_root{color:red}`+require.asset(`x.png`)+`.A_frame{top:0;left:0}`;const tagId$1=`p/A.module.css`;'
  assert.equal(
    evalCssExpr(parseClient(stitched).css[0].expr),
    '.A_root{color:red}asset:x.png.A_frame{top:0;left:0}',
    '拼接段内的 CSS 分号不得截断声明',
  )
  const fakeBase = { version: 'x', modules: { M: { used: ['a', 'b'], defined: ['a', 'b', 'c'], css: [], tsx: [] } } }
  const rep = contractReport(fakeBase, new Map([['M', new Set(['a', 'c'])]]))
  assert.equal(rep.missingTotal, 1, '官方 TSX 引用了而本仓没挂的要进未接清单')
  assert.equal(rep.extraTotal, 0, '官方 CSS 有定义但 TSX 没引用的不算挂错')
  const missingModule = contractReport(fakeBase, new Map([['N', new Set(['z'])]]))
  assert.equal(missingModule.extraTotal, 1, '官方 src/ 无此模块必须报出来')
  const cssGap = { version: 'x', modules: { M: { used: ['a', 'route'], defined: ['a'], css: [], tsx: [] } } }
  const repGap = contractReport(cssGap, new Map([['M', new Set(['a', 'route'])]]))
  assert.equal(repGap.extraTotal, 0, '官方 TSX 引用、CSS 定义在后代选择器里的类名不算本仓挂错')
  const decBase = { modules: { M: { used: ['a', 'b'], defined: ['a', 'b'], css: [], tsx: [] } } }
  const aligned = { 'M.b': { kind: 'aligned', evidence: 'official x.tsx:1', reason: '按官方原文补' } }
  assert.ok(
    decisionProblems(decBase, new Map([['M', new Set(['a'])]]), aligned).problems.some((p) => p.includes('未挂该类名')),
    'aligned 判定必须要求本仓真的挂上类名',
  )
  const notApplicable = { 'M.b': { kind: 'notApplicable', evidence: 'official x.tsx:2', reason: '只读预览无此态' } }
  assert.ok(
    decisionProblems(decBase, new Map([['M', new Set(['a', 'b'])]]), notApplicable).problems.some((p) => p.includes('假复刻')),
    '官方交互态不成立却挂了类名必须拦下',
  )
  assert.ok(
    decisionProblems(decBase, new Map([['M', new Set(['a'])]]), {}).problems.some((p) => p.includes('判定真源里没有')),
    '新增未接差异缺判定必须拦下',
  )
  assert.deepEqual(
    usedModuleGap({ modules: { M: { used: ['a'] }, N: { used: ['z'] } } }, new Map([['M', new Set()]])),
    { M: ['a'] },
    '本仓完全没接的官方模块不得计入待对齐债务',
  )
  const commented = '// officialClass("M","ghost")\n/* cls("ghost2") */\nofficialClass("M","real")'
  assert.deepEqual(
    extractPairs(blankComments(commented), 'x').map((p) => p.semantic), ['real'],
    '注释里的类名调用不算已挂',
  )
  assert.deepEqual(
    cssClasses('/* .ghost */ .route:hover { background: url(a.icon.svg) } .real .sideLine { content: ".Fake" }'),
    ['route', 'real', 'sideLine'],
    'CSS 类面不得收 url / 引号字符串 / 注释里的点后 token',
  )
  const GATE_VERSION = '0.2.2-rc.3'
  const GATE_PKG = 'dsh-client-ui-chat'
  const gateBase = {
    version: GATE_VERSION,
    source: BASELINE_SOURCE,
    modules: { M: { used: ['a'], defined: ['a'], css: ['src/M.module.css'], tsx: ['src/M.tsx'] } },
    pending: { M: ['a'] },
    usedModules: ['M'],
    unusedModules: {},
    packages: [{ name: GATE_PKG, version: GATE_VERSION }],
    decisionKinds: { 'M.a': 'notApplicable' },
  }
  const gateFacts = { aligned: GATE_VERSION, prefixes: [`${GATE_PKG}/`] }
  const gateDec = { 'M.a': { kind: 'notApplicable', evidence: `${GATE_PKG}@${GATE_VERSION} src/x.tsx:1`, reason: '只读预览无此态' } }
  const gateUsed = new Map([['M', new Set()]])
  assert.deepEqual(contractProblems(gateBase, gateFacts, gateUsed, gateDec), [], '判定齐全时闸必须放行')
  assert.ok(contractProblems({ ...gateBase, version: 'v2' }, gateFacts, gateUsed, gateDec).some((p) => p.includes('不一致')), '版本漂移必须红')
  assert.ok(contractProblems({ ...gateBase, modules: {} }, gateFacts, new Map(), gateDec).some((p) => p.includes('基线不完整')), '基线被清空必须红')
  assert.ok(contractProblems(gateBase, gateFacts, new Map(), gateDec).some((p) => p.includes('静态抽不到')), '模块漏抽导致整块免检必须红')
  assert.ok(
    contractProblems({ ...gateBase, usedModules: ['M'] }, gateFacts, new Map(), gateDec).some((p) => p.includes('静态抽不到')),
    '基线记录在挂的模块被漏抽也要红',
  )
  assert.equal(SEMVER_RE.test('0.2'), false, '0.2 不是完整 semver，必须被拒')
  assert.equal(
    evidenceMatchesVersion(`pkg@${GATE_VERSION} src/x.tsx:1`, '0.2'),
    false,
    '版本前缀截断不得命中证据（旧实现 includes 曾让降版本零改动过闸）',
  )
  assert.equal(evidenceMatchesVersion(`pkg@${GATE_VERSION} src/x.tsx:1`, GATE_VERSION), true)
  assert.ok(
    contractProblems({ ...gateBase, source: 'official src' }, gateFacts, gateUsed, gateDec).some((p) => p.includes('source')),
    '基线 source 被改写成别的字符串必须红',
  )
  assert.ok(
    contractProblems({ ...gateBase, packages: [] }, gateFacts, gateUsed, gateDec).some((p) => p.includes('packages')),
    '老基线缺 packages 包清单必须红',
  )
  assert.ok(
    contractProblems({ ...gateBase, packages: [{ name: 'dsh-client-ui-other', version: GATE_VERSION }] }, gateFacts, gateUsed, gateDec)
      .some((p) => p.includes('缺注入包')),
    '包清单凑够条数但缺注入包必须红（旧实现只数个数，会放行）',
  )
  assert.ok(
    contractProblems(gateBase, { aligned: GATE_VERSION }, gateUsed, gateDec).some((p) => p.includes('CSS_PKG_PREFIXES')),
    '抽不出注入包前缀时闸必须红（不许静默整块免检）',
  )
  assert.ok(
    contractProblems({ ...gateBase, packages: gateBase.packages.map((p) => ({ ...p, version: '0.0.0' })) }, gateFacts, gateUsed, gateDec)
      .some((p) => p.includes('packages 版本')),
    '包版本与基线版本不一致必须红',
  )
  assert.ok(
    contractProblems({ ...gateBase, usedModules: ['M', 'N'] }, gateFacts, gateUsed, gateDec).some((p) => p.includes('模块集合漂移')),
    'usedModules ∪ unusedModules 与 modules 不一致必须红',
  )
  assert.ok(
    contractProblems({ ...gateBase, unusedModules: { M: ['a'] } }, gateFacts, gateUsed, gateDec).some((p) => p.includes('同时包含')),
    '同一模块同时出现在 used / unused 必须红',
  )
  assert.ok(
    contractProblems({ ...gateBase, unusedModules: { M: ['zzz'] } }, gateFacts, gateUsed, gateDec).some((p) => p.includes('unusedModules[M]')),
    'unusedModules 内容与 modules.used 不一致必须红',
  )
  assert.ok(
    contractProblems({ ...gateBase, decisionKinds: { 'M.a': 'aligned' } }, gateFacts, gateUsed, gateDec).some((p) => p.includes('判定 kind')),
    '把 aligned 降级成 notApplicable（或反向）必须红',
  )
  assert.ok(
    contractProblems({ ...gateBase, decisionKinds: {} }, gateFacts, gateUsed, gateDec).some((p) => p.includes('判定条目')),
    '删判定条目必须红',
  )
  assert.ok(
    contractProblems({ ...gateBase, modules: { M: { used: ['a'], defined: [], css: [], tsx: [] } } }, gateFacts, gateUsed, gateDec)
      .some((p) => p.includes('缺官方源文件证据')),
    '空壳模块混进基线必须红',
  )
  assert.deepEqual(
    extractPairs(maskStringCalls(blankComments('const s = "officialClass(\\"M\\",\\"ghost\\")"\nofficialClass("M","real")')), 'x')
      .map((p) => p.semantic),
    ['real'],
    '字符串里的完整 officialClass 调用不得误收（只收真实调用）',
  )
  assert.equal(officialCallProblems('const f = officialClass\n', 'x').length, 1, '别名赋值形态必须被识别')
  assert.equal(officialCallProblems('officialClass?.("M","a")\n', 'x').length, 1, '可选调用形态必须被识别')
  assert.equal(officialCallProblems('export { officialClass }\n', 'x').length, 1, '导出 / 传参形态必须被识别')
  assert.equal(
    officialCallProblems("function cls(s: string) { return officialClass('M', s) }\ncls('a')\n", 'x').length,
    0,
    'function 包装器是本仓已知形态，不得误报',
  )
  assert.ok(
    walk(join(ROOT, 'src/adv/session'), ['.ts'], [], { skipGenerated: false }).some((f) => f.endsWith('.generated.ts')),
    '调用面扫描必须覆盖 .generated.ts（跳过它等于留免检口子）',
  )
  assert.equal(
    walk(join(ROOT, 'src/adv/session'), ['.ts']).some((f) => f.endsWith('.generated.ts')),
    false,
    '样式面默认仍跳过生成物（只含 CSS 文本）',
  )
  assert.ok(
    decisionProblems(gateBase, new Map([['M', new Set(['a'])]]), { 'M.a': { kind: 'noop', evidence: 'x@v1', reason: 'y' } })
      .problems.some((p) => p.includes('假复刻')),
    'noop 判定却挂了类名必须红',
  )
  assert.deepEqual(
    extractPairs(blankComments("const url = 'https://x/y'\nofficialClass(\"M\",\"real\") // officialClass(\"M\",\"ghost\")"), 'x')
      .map((p) => p.semantic),
    ['real'],
    '字符串里的 // 不得抹掉同行真实调用，行尾注释里的调用也不算已挂',
  )
  assert.ok(
    contractProblems({ ...gateBase, pending: {} }, gateFacts, gateUsed, gateDec).some((p) => p.includes('pending 与实时重算不一致')),
    '基线快照漂移必须红',
  )
  assert.deepEqual(unparsedOfficialCalls(), [], '本仓当前不应有无法静态解析的 officialClass 调用')
  assert.throws(() => readDecisions('v9-does-not-exist'), /基线版本/, '判定证据未标注当前版本必须红')
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

const BASELINE = join(TOOL, 'baseline.json')
const DECISIONS = join(TOOL, 'contract-decisions.json')
const DECISION_KINDS = ['aligned', 'notApplicable', 'noop']

/** 官方 src/ 的 1:1 类名契约：*.module.css 定义的选择器 + 对应 TSX 实际引用的 css.* 名字。 */
/** CSS 类面：后代/伪类里的类名要收；url(...)、引号字符串、注释里的点后 token 不能收。 */
function cssClasses(text) {
  const clean = blankComments(text)
    .replace(/url\([^)]*\)/g, '')
    .replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g, '')
  return [...clean.matchAll(/\.([A-Za-z][A-Za-z0-9_-]*)/g)].map((m) => m[1])
}

function officialSrcContract(inputAbs, prefixes) {
  const allowed = new Set(prefixes.map((p) => p.replace(/\/$/, '')))
  const pkgs = collectPackages(inputAbs).filter((p) => allowed.has(p.name))
  const versions = uniq(pkgs.map((p) => p.version))
  if (versions.length !== 1) throw new Error(`注入包版本不一致：${versions.join(', ')}`)
  const modules = new Map()
  const srcRel = (f) => f.replace(`${inputAbs}/`, '')
  for (const pkg of pkgs) {
    const src = join(pkg.base, 'src')
    if (!existsSync(src)) continue
    const recFor = (mod) => {
      const rec = modules.get(mod) ?? { used: new Set(), defined: new Set(), css: [], tsx: [] }
      modules.set(mod, rec)
      return rec
    }
    for (const cssFile of walk(src, ['.css'])) {
      if (!cssFile.endsWith('.module.css')) continue
      const rec = recFor(basename(cssFile).replace(/\.module\.css$/, ''))
      // 后代选择器 / 伪类组合 / 嵌套规则里的类名也算类面（如 stat-dialog.module.css 的 `.details .route`）。
      for (const name of cssClasses(read(cssFile))) rec.defined.add(name)
      rec.css.push(srcRel(cssFile))
    }
    for (const tsx of walk(src, ['.tsx'])) {
      const text = blankComments(read(tsx))
      const imports = [...text.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from\s*['"]([^'"]+\.module\.css)['"]/g)]
      for (const imp of imports) {
        const mod = basename(imp[2]).replace(/\.module\.css$/, '')
        const rec = recFor(mod)
        if (!rec.tsx.includes(srcRel(tsx))) rec.tsx.push(srcRel(tsx))
        const alias = imp[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        for (const m of text.matchAll(new RegExp(`\\b${alias}\\.([A-Za-z][A-Za-z0-9_]*)`, 'g'))) rec.used.add(m[1])
      }
    }
  }
  const out = { version: versions[0], source: '官方 npm 包 src/**/*.tsx + *.module.css', modules: {} }
  for (const [mod, rec] of [...modules].sort(([a], [b]) => a.localeCompare(b))) {
    out.modules[mod] = {
      used: uniq([...rec.used]),
      defined: uniq([...rec.defined]),
      css: uniq(rec.css),
      tsx: uniq(rec.tsx),
    }
  }
  return out
}

/** 本仓 officialClass 调用按模块聚合；复用第 3 节的抽取口径（含包装器间接调用）。 */
function repoModules() {
  const byModule = new Map()
  for (const p of repoUsage().pairs) {
    const set = byModule.get(p.module) ?? new Set()
    set.add(p.semantic)
    byModule.set(p.module, set)
  }
  return byModule
}

/** 官方源码里出现过的语义名：CSS 定义 + TSX 引用并集，避免 CSS 抽取形式差异造成假红。 */
function officialAllowed(official) {
  return new Set([...(official.defined ?? []), ...(official.used ?? [])])
}

const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * 证据坐标必须**精确**标注基线版本。
 * 旧实现用 `includes('@'+version)` 子串匹配：把 ALIGNED_HOST_VERSION 改成 `0.2` 后，
 * `@0.2.2-rc.3` 仍然 `includes('@0.2')` ⇒ 一条判定都不用改就能降版本过闸。
 * 这里改成版本 token 右边界匹配（后面不能再跟版本字符），并要求版本本身是完整 semver。
 */
function evidenceMatchesVersion(evidence, version) {
  return new RegExp(`@${escapeRe(version)}(?![0-9A-Za-z.-])`).test(evidence)
}

/** 逐条处置真源：官方 TSX 引用了某类名 ≠ 本仓必须挂它；官方条件分支不成立时挂上就是假复刻。 */
function readDecisions(version, base) {
  if (!existsSync(DECISIONS)) throw new Error(`缺判定真源：${rel(DECISIONS)}`)
  const data = JSON.parse(read(DECISIONS))
  for (const [key, item] of Object.entries(data)) {
    assert.match(key, /^[A-Za-z][A-Za-z0-9_-]*\.[A-Za-z][A-Za-z0-9_]*$/, `判定键必须是 <模块>.<语义名>：${key}`)
    assert.ok(DECISION_KINDS.includes(item?.kind), `判定 kind 只能是 aligned / notApplicable / noop：${key}`)
    assert.ok(typeof item.evidence === 'string' && item.evidence !== '', `判定必须有官方源码证据：${key}`)
    assert.ok(typeof item.reason === 'string' && item.reason !== '', `判定必须写明理由：${key}`)
    // 证据必须带 `<包名>@<版本> <文件>:<行号>` 的坐标形态，不能是自由文本。
    assert.match(item.evidence, /^[a-z0-9-]+@\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?\s+\S+:\d+/, `判定证据缺「包名@版本 文件:行号」坐标：${key}`)
    // 空清单不在这里判：那是「老基线缺 packages」，由 contractProblems 给出准确报错。
    if (Array.isArray(base?.packages) && base.packages.length > 0) {
      const pkg = item.evidence.slice(0, item.evidence.indexOf('@'))
      // 证据写短名（dsh-client-ui-approval），基线记全名（@deepseek-ai/...）⇒ 两种都比。
      const known = base.packages.some((p) => p.name === pkg || p.name.replace(/^@[^/]+\//, '') === pkg)
      assert.ok(known, `判定证据的包名 ${pkg} 不在基线包清单里：${key}`)
    }
    // 证据坐标写死旧版本时，升版后不能靠改 ALIGNED_HOST_VERSION 让旧判定继续生效。
    assert.ok(version === undefined || evidenceMatchesVersion(item.evidence, version), `判定证据未精确标注基线版本 @${version}：${key}`)
  }
  return data
}

/** 只统计本仓已用模块的未接项；本仓完全没接的官方模块是能力面，不是待对齐债务。 */
function usedModuleGap(base, used) {
  const pending = {}
  for (const [mod, set] of used) {
    const official = base.modules[mod]
    // 官方无此模块时把本仓挂的语义名逐条列出，避免整块免检。
    const miss = official === undefined
      ? uniq([...set])
      : uniq([...official.used].filter((s) => !set.has(s)))
    if (miss.length > 0) pending[mod] = miss
  }
  return pending
}

/** 判定与代码必须互相印证：aligned 必须真挂，不适用/noop 不许挂，每条新差异都要有判定。 */
function decisionProblems(base, used, decisions) {
  const problems = []
  const pending = usedModuleGap(base, used)
  for (const [mod, names] of Object.entries(pending)) {
    for (const name of names) {
      const key = `${mod}.${name}`
      if (decisions[key] === undefined) problems.push(`${key}：官方 TSX 引用而本仓未接，判定真源里没有这一条（补判定或按官方原文对齐）`)
    }
  }
  for (const [key, item] of Object.entries(decisions)) {
    const [mod, name] = key.split('.')
    const official = base.modules[mod]
    if (official === undefined) {
      problems.push(`${key}：官方 src/ 无此 CSS module，判定悬空`)
      continue
    }
    if (!officialAllowed(official).has(name)) problems.push(`${key}：判定指向官方源码里不存在的语义名`)
    const mounted = (used.get(mod) ?? new Set()).has(name)
    if (item.kind === 'aligned' && !mounted) problems.push(`${key}：判定 aligned 但本仓未挂该类名，1:1 复刻未落地`)
    if (item.kind !== 'aligned' && mounted) problems.push(`${key}：判定 ${item.kind}（官方交互态不成立），本仓却挂了类名 ⇒ 假复刻`)
  }
  return { problems, pending }
}

function contractReport(base, used) {
  const rows = []
  let missingTotal = 0
  let extraTotal = 0
  for (const [mod, set] of [...used].sort(([a], [b]) => a.localeCompare(b))) {
    const official = base.modules[mod]
    if (official === undefined) {
      rows.push(`- **${mod}**：官方 src/ 无此 CSS module（本仓挂了 ${set.size} 个语义名）`)
      extraTotal += set.size
      continue
    }
    const missing = uniq([...official.used].filter((s) => !set.has(s)))
    const extra = uniq([...set].filter((s) => !officialAllowed(official).has(s)))
    missingTotal += missing.length
    extraTotal += extra.length
    rows.push(`- **${mod}** ← ${official.tsx[0] ?? official.css[0] ?? '官方源码'}：官方引用 ${official.used.length} / 本仓 ${set.size}` +
      `${missing.length === 0 ? '' : `；未接：${missing.join(', ')}`}` +
      `${extra.length === 0 ? '' : `；本仓挂了官方源码未定义：${extra.join(', ')}`}`)
  }
  return { rows, missingTotal, extraTotal }
}

function contractGenerate(inputAbs) {
  const base = officialSrcContract(inputAbs, officialClassFacts().prefixes)
  const used = repoModules()
  const decisions = readDecisions(base.version)
  base.pending = usedModuleGap(base, used)
  base.usedModules = [...used.keys()].sort()
  base.unusedModules = {}
  for (const [mod, official] of Object.entries(base.modules)) {
    if (!used.has(mod)) base.unusedModules[mod] = official.used
  }
  // 外部锚：解包目录里每个官方包的 name/version 快照（不是脚本里的常量）。
  // --contract-check 只读入库基线，靠这些事实校验证书不被悄悄改小。
  base.packages = collectPackages(inputAbs)
    .map((p) => ({ name: p.name, version: p.version }))
    .sort((a, b) => a.name.localeCompare(b.name))
  // 判定结果快照：kind 与键集合一旦在 decisions 里被降级 / 删减，闸必须红。
  base.decisionKinds = Object.fromEntries(
    Object.entries(decisions).map(([key, item]) => [key, item.kind]).sort(([a], [b]) => a.localeCompare(b)),
  )
  writeFileSync(BASELINE, `${JSON.stringify(base, null, 2)}\n`)
  const report = contractReport(base, used)
  const counts = { aligned: 0, notApplicable: 0, noop: 0 }
  for (const item of Object.values(decisions)) counts[item.kind] += 1
  const gap = decisionProblems(base, used, decisions)
  console.log(`# 官方源码契约基线：${base.version}\n`)
  console.log(`已落盘：${rel(BASELINE)}（官方 CSS module ${Object.keys(base.modules).length} 个）\n`)
  console.log(`## 官方 TSX ↔ 本仓复刻（逐模块）\n\n${report.rows.join('\n')}\n`)
  console.log(`本仓已用模块未接 ${report.missingTotal} 条；本仓挂了官方源码未定义 ${report.extraTotal} 条。`)
  console.log(`判定真源 ${Object.keys(decisions).length} 条：aligned ${counts.aligned} / notApplicable ${counts.notApplicable} / noop ${counts.noop}；` +
    `官方未用模块 ${Object.keys(base.unusedModules).length} 个（能力面，不计债务）。`)
  if (gap.problems.length > 0) console.log(`\n判定与代码尚不一致 ${gap.problems.length} 项（--contract-check 会拦）：\n${gap.problems.map((p) => `- ${p}`).join('\n')}`)
}

/**
 * 所有 officialClass 出现都必须能被静态抽取：动态形态会让该模块的差异整块免检。
 * 判据与 extractPairs 共用（同一套字面量 / 已知包装器形态），并额外抓「不是调用」的引用形态：
 * `const f = officialClass`、`officialClass?.(...)`、`(0,officialClass)(...)`、传参 / 导出别名。
 */
function officialCallProblems(rawText, label) {
  const problems = []
  const text = maskStringCalls(blankComments(rawText))
  // import 语句里的 officialClass 是绑定声明，不是调用点。
  const imports = [...text.matchAll(/(?:^|\n)[ \t]*import\b[\s\S]*?from[ \t]*['"][^'"]+['"]/g)]
    .map((m) => [m.index, m.index + m[0].length])
  const inImport = (i) => imports.some(([s, e]) => i >= s && i < e)
  for (const m of text.matchAll(/(?<![\w$])officialClass\b/g)) {
    if (inImport(m.index)) continue
    const before = text.slice(Math.max(0, m.index - 16), m.index)
    // 定义处：function officialClass(...) —— 不是调用点。
    if (/\bfunction\s+$/.test(before)) continue
    const tail = text.slice(m.index, m.index + 200)
    if (!/^officialClass\s*\(/.test(tail)) {
      problems.push(`${label}:${atLine(text, m.index)}：officialClass 被当作值引用（别名 / 传参 / 可选调用），契约闸无法静态解析`)
      continue
    }
    const literal = /^officialClass\(\s*['"][^'"]+['"]\s*,\s*['"][^'"]+['"]\s*\)/.test(tail)
    const wrapper = /^officialClass\(\s*['"][^'"]+['"]\s*,\s*[A-Za-z_$][\w$]*\s*\)/.test(tail)
    if (!literal && !wrapper) problems.push(`${label}:${atLine(text, m.index)}：officialClass 调用不是字面量 / 已知包装器，契约闸无法静态解析`)
  }
  return problems
}

function unparsedOfficialCalls() {
  const problems = []
  for (const f of walk(join(ROOT, 'src/adv/session'), ['.ts', '.tsx'], [], { skipGenerated: false })) {
    // adapter 本体（officialClass 定义与 officialClasses 内部 helper）不挂任何类名，跳过。
    if (f.endsWith('official-classes.ts')) continue
    problems.push(...officialCallProblems(read(f), rel(f)))
  }
  return problems
}

/** 闸的全部判据抽成纯函数：selfCheck 断言的是「闸本身」，不只是内部解析器。 */
const BASELINE_SOURCE = '官方 npm 包 src/**/*.tsx + *.module.css'

/**
 * 包清单外部锚：缺 packages = 老基线，必须重跑 --contract 生成。
 * 只数个数是弱锚 —— 凑够条数却缺注入包时，类面 / 模块面照样整块免检（取包清单就在这种弱锚下漂成 12 / 13 两套数字）。
 * 判据改成按名断言 CSS_PKG_PREFIXES 的注入包：与运行时同一份真源，不另维护常量。
 * contractCheck 先单独调它一次：缺包时先报清前提，别让「证据包名不在清单里」把真实原因盖住。
 */
function packageListProblems(base, facts) {
  const problems = []
  const packages = base.packages ?? []
  const expectedPkgs = (facts.prefixes ?? []).map((p) => p.replace(/\/$/, ''))
  if (packages.length === 0) {
    problems.push('基线缺 packages 包清单（老基线），用 --contract 重新生成')
    return problems
  }
  if (expectedPkgs.length === 0) {
    problems.push('CSS_PKG_PREFIXES 抽不出注入包（闸无从校验包清单），检查 src/adv/session/official-classes.ts')
    return problems
  }
  const names = new Set(packages.map((p) => p.name))
  const missingInj = expectedPkgs.filter((name) => !names.has(name))
  if (missingInj.length > 0) {
    problems.push(`基线 packages 缺注入包 ${missingInj.join(', ')}（类面 / 模块面会整块免检），用 --contract 重新生成`)
  }
  const pkgVersions = uniq(packages.map((p) => p.version))
  if (pkgVersions.length !== 1 || pkgVersions[0] !== base.version) {
    problems.push(`基线 packages 版本 [${pkgVersions.join(', ')}] 与 base.version ${base.version} 不一致`)
  }
  return problems
}

function contractProblems(base, facts, used, decisions) {
  const problems = []
  if (base.source === undefined || Object.keys(base.modules ?? {}).length === 0) {
    problems.push(`基线不完整：${rel(BASELINE)} 缺 source 或 modules 为空`)
    return problems
  }
  // ① source 必须是固定真源描述，不能随手改成别的字符串。
  if (base.source !== BASELINE_SOURCE) {
    problems.push(`基线 source 不是官方真源描述（期望「${BASELINE_SOURCE}」，实际「${base.source}」）`)
  }
  // ② 版本必须是完整 semver：`0.2` / `0.2.2-rc` 这类前缀截断直接红。
  if (!SEMVER_RE.test(base.version ?? '')) {
    problems.push(`基线版本 ${base.version ?? '(空)'} 不是完整 semver（形如 0.2.2-rc.3）`)
  }
  if (!SEMVER_RE.test(facts.aligned ?? '')) {
    problems.push(`ALIGNED_HOST_VERSION=${facts.aligned} 不是完整 semver`)
  }
  // ③ 包清单外部锚：缺 packages = 老基线，必须重跑 --contract 生成。
  problems.push(...packageListProblems(base, facts))
  // ④ 模块集合三方互证：modules = usedModules ∪ unusedModules，且与实时抽取完全一致。
  const allModules = Object.keys(base.modules).sort()
  const usedList = [...(base.usedModules ?? [])].sort()
  const unusedList = Object.keys(base.unusedModules ?? {}).sort()
  const union = uniq([...usedList, ...unusedList])
  if (JSON.stringify(union) !== JSON.stringify(allModules)) {
    problems.push(`基线模块集合漂移：usedModules ∪ unusedModules 与 modules 不一致（${union.length} vs ${allModules.length}），用 --contract 重新生成`)
  }
  const overlap = usedList.filter((m) => unusedList.includes(m))
  if (overlap.length > 0) problems.push(`usedModules 与 unusedModules 同时包含 ${overlap.join(', ')}`)
  const realtimeUsed = [...used.keys()].sort()
  if (JSON.stringify(usedList) !== JSON.stringify(realtimeUsed)) {
    problems.push(`基线 usedModules 与实时抽取不一致（基线 ${usedList.length} 个 / 实时 ${realtimeUsed.length} 个），用 --contract 重新生成`)
  }
  for (const [mod, list] of Object.entries(base.unusedModules ?? {})) {
    const official = base.modules[mod]
    if (official === undefined) {
      problems.push(`unusedModules 里的 ${mod} 不在 modules 里`)
      continue
    }
    if (JSON.stringify([...list].sort()) !== JSON.stringify([...official.used].sort())) {
      problems.push(`unusedModules[${mod}] 与 modules[${mod}].used 不一致`)
    }
  }
  // ⑤ 判定结果快照：删条目 / 降级 kind 都要重跑 --contract 并说明理由。
  const frozenKinds = base.decisionKinds ?? {}
  const currentKinds = Object.fromEntries(
    Object.entries(decisions).map(([key, item]) => [key, item.kind]).sort(([a], [b]) => a.localeCompare(b)),
  )
  const frozenKeys = Object.keys(frozenKinds).sort()
  const currentKeys = Object.keys(currentKinds).sort()
  if (JSON.stringify(frozenKeys) !== JSON.stringify(currentKeys)) {
    problems.push(`判定条目与基线快照不一致（基线 ${frozenKeys.length} 条 / 当前 ${currentKeys.length} 条），用 --contract 重新生成`)
  } else {
    const drift = frozenKeys.filter((key) => frozenKinds[key] !== currentKinds[key])
    if (drift.length > 0) {
      problems.push(`判定 kind 与基线快照不一致：${drift.map((key) => `${key}(${frozenKinds[key]}→${currentKinds[key]})`).join(', ')}`)
    }
  }
  // ⑥ 每个模块至少要有官方源文件证据，禁止空壳模块混进基线。
  const hollow = allModules.filter((mod) => {
    const rec = base.modules[mod]
    return !Array.isArray(rec?.defined) || rec.defined.length === 0 || (!rec.css?.length && !rec.tsx?.length)
  })
  if (hollow.length > 0) problems.push(`基线模块缺官方源文件证据：${hollow.join(', ')}`)
  // 基线快照必须与实时重算一致：改过 mirror 就要重跑 --contract 刷新，不许悄悄带着旧债务过闸。
  const expectedGap = usedModuleGap(base, used)
  if (JSON.stringify(expectedGap) !== JSON.stringify(base.pending ?? {})) {
    problems.push(`基线 pending 与实时重算不一致（跑 --contract 刷新）：基线 ${Object.keys(base.pending ?? {}).length} 模块 / 实时 ${Object.keys(expectedGap).length} 模块`)
  }
  if (facts.aligned !== base.version) {
    problems.push(`ALIGNED_HOST_VERSION=${facts.aligned} 与基线 ${base.version} 不一致（src/adv/session/official-classes.ts:31）`)
  }
  problems.push(...decisionProblems(base, used, decisions).problems)
  // 判定涉及的模块、以及基线生成时在挂的所有模块，都必须能被静态解析：
  // 否则把调用改成动态拼接就能让整块差异静默免检。
  const expectedModules = new Set([
    ...Object.keys(decisions).map((key) => key.split('.')[0]),
    ...(base.usedModules ?? []),
  ])
  for (const mod of expectedModules) {
    if (!used.has(mod)) problems.push(`${mod}：判定/基线要求该模块在挂，但本仓静态抽不到任何 officialClass 调用（模块漏抽或改成动态拼接）`)
  }
  for (const [mod, set] of used) {
    const official = base.modules[mod]
    if (official === undefined) {
      problems.push(`${mod}：官方 src/ 无此 CSS module，本仓却挂了 ${[...set].join(', ')}`)
      continue
    }
    const bad = uniq([...set].filter((s) => !officialAllowed(official).has(s)))
    if (bad.length > 0) problems.push(`${mod}：本仓挂了官方源码未定义的语义名 ${bad.join(', ')}`)
  }
  return problems
}

/** pretest 闸：版本 / 类面 / 判定与代码互证 / 基线完整性，任一项不一致即红。 */
function contractCheck() {
  if (!existsSync(BASELINE)) {
    console.error(`# 契约闸失败：${rel(BASELINE)} 不存在，先跑 --contract <解包目录> 生成基线。`)
    process.exitCode = 1
    return
  }
  const base = JSON.parse(read(BASELINE))
  const facts = officialClassFacts()
  // 包清单先判：缺清单 / 缺注入包时，readDecisions 的「证据包名不在清单里」只会把真实原因盖住。
  const pkgProblems = packageListProblems(base, facts)
  if (pkgProblems.length > 0) {
    console.error(`# 契约闸失败（${pkgProblems.length} 项）\n\n${pkgProblems.map((p) => `- ${p}`).join('\n')}`)
    process.exitCode = 1
    return
  }
  const used = repoModules()
  let decisions
  try {
    decisions = readDecisions(base.version, base)
  } catch (error) {
    console.error(`# 契约闸失败：${error.message}`)
    process.exitCode = 1
    return
  }
  const problems = [...unparsedOfficialCalls(), ...contractProblems(base, facts, used, decisions)]
  if (problems.length > 0) {
    console.error(`# 契约闸失败（${problems.length} 项）\n\n${problems.map((p) => `- ${p}`).join('\n')}`)
    process.exitCode = 1
    return
  }
  const counts = { aligned: 0, notApplicable: 0, noop: 0 }
  for (const item of Object.values(decisions)) counts[item.kind] += 1
  console.log(`契约闸通过：基线 ${base.version}，本仓 ${used.size} 个模块；判定 aligned ${counts.aligned} / ` +
    `notApplicable ${counts.notApplicable} / noop ${counts.noop}；官方未用模块 ${Object.keys(base.unusedModules ?? {}).length} 个（能力面）。`)
}

const MANUAL = [
  '- [ ] `src/types/primitives.d.ts:7` ambient 导出 ↔ 官方 `lib/types/**/*.d.ts`（官方包不在本仓依赖里，本地声明只复述消费面）',
  '- [ ] `test/primitives-stub.mjs:12` `NAMES` 与 `:50` 解构导出两表是否仍覆盖官方导出（漏改会在链接期报错）',
  '- [ ] `src/adv/session/mirror/GenericCommandCard.ts:44` `TOOL_VARIANTS`、`:74` `TOOL_TITLE_KEYS` ↔ 官方 tool `client.js` 的 tool name 全集',
  '- [ ] `src/adv/session/mirror/process-groups.ts:89` `toolActivity()` ↔ 官方过程组 `stepGrouping: collapsed` 策略',
  '- [ ] 官方组件 / 原语替换：类名还在但组件换了（`UserMessageBubble` / `UserTextRun` / `Tag` / `DisclosureRow`），这类两版 diff 一条都发现不了',
  '- [ ] keyed toolview 槽位（`ui-skill` / `ui-renderer`）与宿主 RPC / policy 面：`src/adv/session/` 下 `faces.ts` / `open-session-view.ts`',
  '- [ ] 官方类名面按 `CSS_PKG_PREFIXES` 的注入包（数量以源码为准）过滤，与 `official-classes.ts` 运行时同源；`primitives` 等包即便有 CSS 也不进类面，官方改版需重校前缀表',
  '- [ ] `client*.js` 子文件的 CSS 只进集合面、不进类面；如需其类名面要另写解析器',
  '- [ ] 第 4 节只列本仓已用模块；其余官方模块与 3 个子文件模块（ExcelBody / PdfBody / frontmatter-fields）整块略过，属方案取舍',
].join('\n')

function main() {
  const argv = process.argv.slice(2)
  if (argv.includes('--contract-check')) {
    contractCheck()
    return
  }
  if (argv.includes('--contract')) {
    const input = argv.find((a) => !a.startsWith('--'))
    if (input === undefined) {
      console.error('用法：node tools/host-upgrade-diff/scripts/diff.mjs --contract <解包根目录>')
      process.exitCode = 2
      return
    }
    contractGenerate(resolve(input))
    return
  }
  if (argv.includes('--self-check')) {
    selfCheck()
    return
  }
  const input = argv.find((a) => !a.startsWith('--'))
  if (input === undefined) {
    console.error('用法：node tools/host-upgrade-diff/scripts/diff.mjs <解包根目录> [--self-check] | --contract <解包根目录> | --contract-check')
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
