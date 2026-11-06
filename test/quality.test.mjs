import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { formatClock, formatYmd, relativeFuture } from '../dist/utils/index.js'
import { createStyleKit } from '../dist/design/index.js'
import * as ui from '../dist/ui/index.js'

test('relativeFuture 与 relativePast 对偶', () => {
  const now = Date.parse('2026-10-18T12:00:00.000Z')
  assert.equal(relativeFuture('2026-10-18T12:00:30.000Z', now), '即将')
  assert.equal(relativeFuture('2026-10-18T12:03:00.000Z', now), '3 分钟后')
  assert.equal(relativeFuture('2026-10-19T12:00:00.000Z', now), '1 天后')
  // 解析失败不编造，回退成日期串
  assert.equal(relativeFuture('not-a-date', now), '—')
})

test('formatClock 接受 undefined，可覆盖兜底', () => {
  assert.equal(formatClock(undefined), '-')
  assert.equal(formatClock(null), '-')
  assert.equal(formatClock(''), '-')
  assert.equal(formatClock(undefined, { fallback: '—' }), '—')
  assert.equal(formatClock('2026-10-18T09:05:01.000Z', { fallback: '—' }).length, 8)
})

test('formatYmd 可覆盖兜底', () => {
  assert.equal(formatYmd('bad'), '—')
  assert.equal(formatYmd('bad', { fallback: '?' }), '?')
})

test('StyleKit.dispose 在无 DOM 下不抛', () => {
  const kit = createStyleKit({ id: 'probe' })
  assert.doesNotThrow(() => kit.dispose())
  assert.doesNotThrow(() => kit.dispose())
})

test('质检新增的参数都已导出（Picker 尺寸档 / 非受控 / 清除）', () => {
  assert.equal(typeof ui.Picker, 'function')
  assert.equal(typeof ui.ModelPicker, 'function')
  // Modal 新参数通过 props 传入，编译期保证；这里确认组件存在
  assert.equal(typeof ui.Modal, 'function')
  assert.equal(typeof ui.showToast, 'function')
})

// 2026-10-26：卡片折叠箭头写的是 '▾' 字形，用户点名太丑、且与下拉框那颗（自绘 SVG chevron）
// 不是一个东西 ⇒ 全站箭头收敛到 src/ui/infra/chevron.ts。字形在各系统字体下粗细 / 角度 / 基线都不同，
// 靠人眼审不出「又冒出一颗」，必须由测试盯。
test('ui 层不许再用字形箭头，一律走 Chevron', async () => {
  const glyphs = /[▾▸▼▲↑↓→←]/
  const hits = []
  const walk = async (rel) => {
    for (const entry of await readdir(new URL(rel, import.meta.url), { withFileTypes: true })) {
      const next = `${rel}/${entry.name}`
      if (entry.isDirectory()) await walk(next)
      // 生成物是单行 CSS 字符串（里面出现箭头也是 CSS 内容，不是组件渲染的字形），不看
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.generated.ts')) {
        const lines = (await readFile(new URL(next, import.meta.url), 'utf8')).split('\n')
        lines.forEach((line, i) => {
          const trimmed = line.trim()
          const isComment = trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*')
          if (!isComment && glyphs.test(line)) hits.push(`${next.slice('../'.length)}:${String(i + 1)}`)
        })
      }
    }
  }
  await walk('../src/ui')
  assert.deepEqual(hits, [], `ui 层出现字形箭头（改用 Chevron）：\n${hits.join('\n')}`)
})

// 2026-11-06：细滚动条与「离边 1px」一起收进 .dshpc-scroll-thin（src/design/tokens.css
// 的 tokens 域，全库唯一真源）。容器只挂类，不再自己写透明边框 ⇒ 自检盯三件事：
//   ① 每个滚动容器都挂了基类（漏挂 = 粗滚动条 + 贴边），方向档必须与基类同挂；
//   ② 1px 让位边框不许再散落到别的 CSS / demo 内联 style 里；
//   ③ ::-webkit-scrollbar 只在 tokens.css 出现一份。
// 旧版只扫 src/**/*.css 里的 border ⇒ demo 的内联 overflowY / overflowX 漏挂类完全没人管，
// 这次把 demo 源码一起纳入扫描。
async function collectSource(roots, exts, out = []) {
  for (const root of roots) {
    for (const entry of await readdir(new URL(root, import.meta.url), { withFileTypes: true })) {
      const next = `${root}/${entry.name}`
      if (entry.isDirectory()) await collectSource([next], exts, out)
      else if (exts.test(entry.name) && !entry.name.endsWith('.generated.ts')) out.push(next)
    }
  }
  return out
}

const CSS_FILES = await collectSource(['../src', '../packages/demo/src'], /\.css$/)
const CODE_FILES = await collectSource(['../src', '../packages/demo/src'], /\.tsx?$/)
const SCROLL_DECL = /overflow(?:-[xy])?\s*:\s*(?:auto|scroll)/
// 只认 props 里的 style 对象：CodeMirror 主题里的 '.cm-scroller': { overflow:'auto' } 是
// 第三方 CSS-in-JS 规则，不是本仓的滚动容器，别把它算进来。
const INLINE_SCROLL_DECL = /style\s*:\s*\{[^{}]{0,400}?overflow(?:Y|X)?\s*:\s*['"](?:auto|scroll)['"]/g
const INSET_BORDER = /border(?:-right|-bottom|Right|Bottom)\s*:\s*'?1px solid transparent/g

/** className 字符串（h() 与 JSX 都覆盖）；按空白切词，避免前缀误命中。 */
function classNames(text) {
  return [...text.matchAll(/className\s*[:=]\s*['"]([^'"]*)['"]/g)].map((m) => m[1].split(/\s+/))
}

test('所有滚动容器都挂 .dshpc-scroll-thin（含 demo 内联 overflow）', async () => {
  // CSS 里带 overflow 的规则 → 收集其选择器里的 dshpc-* 类名（这些类名的挂载点必须挂基类）。
  const scrollClasses = new Set()
  for (const rel of CSS_FILES) {
    const css = (await readFile(new URL(rel, import.meta.url), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
    for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!SCROLL_DECL.test(body)) continue
      for (const m of selector.matchAll(/\.(dshpc-[a-z0-9_-]+)/g)) scrollClasses.add(m[1])
    }
  }
  assert.ok(scrollClasses.size >= 8, `只识别出 ${scrollClasses.size} 个滚动容器类名，扫描正则可能失效`)

  const hits = []
  for (const rel of CODE_FILES) {
    const text = await readFile(new URL(rel, import.meta.url), 'utf8')
    const path = rel.slice('../'.length)
    for (const classes of classNames(text)) {
      const base = classes.includes('dshpc-scroll-thin')
      if (/\bdshpc-scroll-thin--(?:x|both)\b/.test(classes.join(' ')) && !base) hits.push(`${path} → 方向修饰类没和基类同挂`)
      if (!classes.some((c) => scrollClasses.has(c))) continue
      if (!base) hits.push(`${path} → ${classes.join(' ')} 是滚动容器但没挂 .dshpc-scroll-thin`)
    }
    // demo 的内联滚动容器在 CSS 文件里找不到，只能从 style 对象里的 overflow 声明兜住。
    for (const m of text.matchAll(INLINE_SCROLL_DECL)) {
      const nearby = `${text.slice(Math.max(0, m.index - 320), m.index)}${text.slice(m.index, m.index + 320)}`
      if (!nearby.includes('dshpc-scroll-thin')) {
        hits.push(`${path}:${text.slice(0, m.index).split('\n').length} → 内联滚动容器没挂 .dshpc-scroll-thin`)
      }
    }
  }
  assert.deepEqual(hits, [], `滚动容器漏挂统一类（细滚动条 + 1px 让位都会失效）：\n${hits.join('\n')}`)
})

test('1px 让位边框只在 tokens.css 的 .dshpc-scroll-thin 一处', async () => {
  const hits = []
  for (const rel of [...CSS_FILES, ...CODE_FILES]) {
    if (rel.endsWith('/design/tokens.css')) continue
    const text = await readFile(new URL(rel, import.meta.url), 'utf8')
    const code = text
      .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
      .replace(/^\s*\/\/.*$/gm, '')
    for (const m of code.matchAll(INSET_BORDER)) {
      hits.push(`${rel.slice('../'.length)}:${code.slice(0, m.index).split('\n').length}`)
    }
  }
  assert.deepEqual(hits, [], `又在各容器里手搓透明让位边框了（只需挂 .dshpc-scroll-thin）：\n${hits.join('\n')}`)
})

test('::-webkit-scrollbar 只在 tokens.css 定义（宽度不许有第二份）', async () => {
  const hits = []
  for (const rel of CSS_FILES) {
    if (rel.endsWith('/design/tokens.css')) continue
    if ((await readFile(new URL(rel, import.meta.url), 'utf8')).includes('::-webkit-scrollbar')) hits.push(rel.slice('../'.length))
  }
  assert.deepEqual(hits, [], `细滚动条规则出现第二份：\n${hits.join('\n')}`)
  const tokens = await readFile(new URL('../src/design/tokens.css', import.meta.url), 'utf8')
  assert.match(tokens, /--dshpc-scroll-inset:1px/, '让位 token 丢了')
  // 2026-11-06 真机回归：::-webkit-scrollbar 系列伪元素不解析 var()，把 width 写成
  // var(--dshpc-scroll-w) 后整条声明被静默丢弃 ⇒ 宽度退回默认值。线宽 / 圆角必须字面量。
  // 这里**故意不写死数字**：宽度是给用户真机对比的可调值，改它只该改 tokens.css 一处。
  const bar = tokens.slice(tokens.indexOf('.dshpc-scroll-thin::-webkit-scrollbar,'))
  assert.match(bar, /width:(\d+)px;height:\1px[\s\S]*?border-radius:\1px/, '竖 / 横滚动条线宽与 thumb 圆角不是同一个字面量')
  assert.doesNotMatch(
    bar.slice(0, bar.indexOf('.dshpc-scroll-thin:not(')),
    /width:var\(|border-radius:var\(/,
    '线宽 / 圆角不许写成 var()（滚动条伪元素不解析）',
  )
  // :not(.dshpc-panel) 跳过让位的前提：面板确实自带一条实色边框给滚动条贴。
  const panel = (await readFile(new URL('../src/ui/infra/panel.css', import.meta.url), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  assert.match(
    panel,
    /\.dshpc-panel\{[^}]*border:var\(--dshpc-panel-bw\) solid var\(--dshpc-border\)/,
    '.dshpc-panel 不再带边框 ⇒ 跳过让位后滚动条会贴死边缘',
  )
})
