/**
 * 【临时探针 · 定位完必删】
 *
 * 这轮要回答的问题：**那条规则到底是被浏览器丢的、还是被宿主在导入期改的？**
 * 已知：我们标签里文本有 6 条 `.dshpc-seg`，CSSOM 只剩 5 条（缺 display 那条）；
 *      但"运行时新开标签写同样内容"是否也缺，一直没测过同文本、同长度。
 *
 * 删法：删本文件 + `client/index.tsx` 里的 import / probes 状态 / effect / 渲染四处。
 *
 *   P27 我们自己标签的 sheet：总规则数、`.dshpc-seg` 基础规则几条、其中带 display 的几条
 *   P28 同一份全文（逐字节相同）另开新标签：同上
 *   P29 只注入控件段（从分段控件注释起）：同上
 *   P30 只注入 tokens 段（控件段之前）：总规则数、`body` 规则几条
 *   P31 同一份全文走 `new CSSStyleSheet().replaceSync()`（不走 <style> 标签）：同上
 *
 * 判读：
 *   P28 带 display 的 = 1 且 P27 = 0  ⇒ 文本没问题，**宿主在导入期改的**（换注入通道可根治）
 *   P28 也 = 0                          ⇒ 文本/解析层问题（得找具体字节，别再换通道）
 *   P31 = 1                              ⇒ `replaceSync` 通道可用（真修方案）
 */

export interface ProbeLine {
  id: string
  text: string
}

const KIT_TAG_ID = 'dsh-plugin-core-plugin'

function normSel(sel: string): string {
  return sel.replace(/'/g, '"').replace(/\s+/g, ' ').trim()
}

/** 从一张 sheet 里数出关心的几条。 */
function statsOfSheet(sheet: CSSStyleSheet | null): string {
  if (sheet === null) return '拿不到 sheet'
  let total = -1
  let base = 0
  let withDisplay = 0
  let bodyRules = 0
  try {
    const list = Array.from(sheet.cssRules)
    total = list.length
    for (const r of list) {
      if (!(r instanceof CSSStyleRule)) continue
      const sel = normSel(r.selectorText)
      if (sel === '.dshpc-seg') {
        base++
        if (r.style.getPropertyValue('display') !== '') withDisplay++
      }
      if (sel === 'body') bodyRules++
    }
  } catch {
    return '读 cssRules 抛错'
  }
  return `规则 ${String(total)}｜.dshpc-seg 基础 ${String(base)} 条（含 display ${String(withDisplay)}）｜body ${String(bodyRules)} 条`
}

/** 新开一个 <style> 写这份文本，读完统计再移除。 */
function statsOfText(css: string): string {
  const tag = document.createElement('style')
  tag.setAttribute('data-probe', 'stats')
  tag.textContent = css
  document.head.appendChild(tag)
  const out = statsOfSheet(tag.sheet)
  tag.remove()
  return out
}

/** 用 constructable stylesheet + replaceSync 解析同一份文本（不挂 DOM）。 */
function statsOfReplaceSync(css: string): string {
  try {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(css)
    return statsOfSheet(sheet)
  } catch (err) {
    return `replaceSync 抛错：${String(err)}`
  }
}

export function collectSegProbes(): ProbeLine[] {
  if (typeof document === 'undefined') return [{ id: 'P0', text: 'no document' }]
  const tag = document.getElementById(KIT_TAG_ID) as HTMLStyleElement | null
  if (tag === null) return [{ id: 'P27', text: `找不到 #${KIT_TAG_ID}` }]
  const css = tag.textContent ?? ''

  const lines: ProbeLine[] = [
    { id: 'P27', text: `我们自己的标签：${statsOfSheet(tag.sheet)}` },
    { id: 'P28', text: `同文本另开新标签（${String(css.length)} 字）：${statsOfText(css)}` },
  ]

  const cut = css.indexOf('/* ── 分段控件')
  if (cut < 0) {
    lines.push({ id: 'P29', text: '文本里找不到「分段控件」注释，无法切段' })
  } else {
    lines.push({ id: 'P29', text: `只注入控件段（第 ${String(cut)} 字起）：${statsOfText(css.slice(cut))}` })
    lines.push({ id: 'P30', text: `只注入 tokens 段（前 ${String(cut)} 字）：${statsOfText(css.slice(0, cut))}` })
  }

  lines.push({ id: 'P31', text: `同文本走 replaceSync（不走标签）：${statsOfReplaceSync(css)}` })
  return lines
}
