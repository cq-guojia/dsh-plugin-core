// CSS 纪律自检（2026-11-03，面板皮肤统一时立的规矩）：
//
//  1. 色值只许出现在 `src/design/tokens.css` —— 别处写 `#fff` / `rgba(...)` 会在换主题时脱节，
//     而且没人审得出来（本周就发现 16 处，其中 picker 弹窗还给每个 token 配了兜底色）。
//     确有必要的例外（如遮罩模板色）在同一行/紧邻的注释里写 `token-ok` 并说明理由。
//  2. 浮层三档变量 `--dshpc-panel-*` 只许在 `src/ui/panel.css` 定义 —— 档位一旦散落，
//     就又回到「四处面板四套皮肤」。
import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'

const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g

/** `src` 下全部 CSS（相对 `test/` 的路径）。 */
async function collect(rel = '../src', out = []) {
  for (const entry of await readdir(new URL(`${rel}/`, import.meta.url), { withFileTypes: true })) {
    const next = `${rel}/${entry.name}`
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules') await collect(next, out)
    } else if (entry.name.endsWith('.css')) {
      out.push(next)
    }
  }
  return out
}

function lineAt(text, index) {
  return text.slice(0, index).split('\n').length
}

test('色值只出现在 tokens.css（token-ok 标记的例外除外）', async () => {
  const hits = []
  for (const rel of await collect()) {
    if (rel.endsWith('/design/tokens.css')) continue
    const text = await readFile(new URL(rel, import.meta.url), 'utf8')
    // 注释里可以写例子（如「原来是 #f4f4f5」），按同长度空格盖掉，行号/偏移都不变。
    const code = text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
    for (const match of code.matchAll(RAW_COLOR)) {
      const before = text.slice(Math.max(0, match.index - 240), match.index)
      if (before.includes('token-ok')) continue
      hits.push(`${rel.slice(3)}:${lineAt(text, match.index)} → ${match[0]}`)
    }
  }
  assert.deepEqual(hits, [], `tokens.css 之外出现裸色值（改用 var(--dshpc-*)）：\n${hits.join('\n')}`)
})

test('浮层三档变量只在 panel.css 定义', async () => {
  const hits = []
  for (const rel of await collect()) {
    if (rel.endsWith('/ui/panel.css')) continue
    const text = await readFile(new URL(rel, import.meta.url), 'utf8')
    for (const match of text.matchAll(/--dshpc-panel-[a-z-]+\s*:/g)) {
      hits.push(`${rel.slice(3)}:${lineAt(text, match.index)} → ${match[0].trim()}`)
    }
  }
  assert.deepEqual(hits, [], `浮层档位在 panel.css 之外被重定义（别再造第二套皮肤）：\n${hits.join('\n')}`)
})
