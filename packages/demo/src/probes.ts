/**
 * 【临时探针 · 定位完必删】
 *
 * 用途：定位「`.dshpc-seg` 基础规则在宿主里查不到 / 不生效，而同文件同标签的 `.dshpc-btn` 正常」。
 * 删法：删掉本文件、删 `client/index.tsx` 里的 import 与 `probes` 状态 / effect / 渲染三处。
 *
 * 探针清单（编号固定，回答诊断时按编号报）：
 *   P1 页面上含 `dshpc-seg` 文本的 <style> 标签有几个（判断是不是有第二份/旧 id 的标签）
 *   P2 我们这把 kit 的标签 id 是否存在、文本长度、文本里 `.dshpc-seg{` 出现几次
 *   P3 document.styleSheets（含 adopted）总数 / 可读数 / 规则总数（可读=0 说明被跨域挡）
 *   P4 CSSOM 里 `.dshpc-seg*` 规则有几条、前几条选择器原文
 *   P5 文本里有、CSSOM 里没有的 `.dshpc-seg*` 选择器（差集）—— 直接指出被丢的是哪几条
 *   P6 真实元素的 className / matches / 所在根节点 / 基线 display
 *   P7 新建一个裸 div.dshpc-seg 的 display（排除「这个元素被宿主动过」）
 *   P8 真实元素临时加 `.dshpc-segprobe` 后的 display（内容相同、只换类名）
 *   P9 临时新标签里只写 `.dshpc-seg{display:inline-flex}` 后真实元素的 display（排除「我们这份文本里前面某条规则整条吞掉后面」）
 */

export interface ProbeLine {
  id: string
  text: string
}

/** demo 侧 setStyleKit 时用的 id（见 client/index.tsx）。 */
const KIT_TAG_ID = 'dsh-plugin-core-plugin'

function countOccur(haystack: string, needle: string): number {
  let n = 0
  let i = haystack.indexOf(needle)
  while (i >= 0) {
    n++
    i = haystack.indexOf(needle, i + needle.length)
  }
  return n
}

/** 从 CSS 文本里抽选择器（剥注释；粗略但够用：本仓 CSS 每条规则都以 `}` 收尾，无嵌套）。 */
function selectorsOf(css: string): string[] {
  const body = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const out: string[] = []
  for (const chunk of body.split('}')) {
    const brace = chunk.lastIndexOf('{')
    if (brace < 0) continue
    const sel = chunk.slice(0, brace).split('{').pop()?.trim() ?? ''
    if (sel === '' || sel.startsWith('@')) continue
    out.push(sel)
  }
  return out
}

interface SheetInfo {
  /** -1 表示读 cssRules 抛错（跨域 / SecurityError）。 */
  count: number
  selectors: string[]
}

function readSheets(): SheetInfo[] {
  const out: SheetInfo[] = []
  const add = (sheet: CSSStyleSheet | null): void => {
    if (sheet === null) return
    try {
      const rules = Array.from(sheet.cssRules)
      const selectors: string[] = []
      for (const r of rules) {
        if (r instanceof CSSStyleRule) selectors.push(r.selectorText)
      }
      out.push({ count: rules.length, selectors })
    } catch {
      out.push({ count: -1, selectors: [] })
    }
  }
  for (const sheet of Array.from(document.styleSheets)) add(sheet)
  const adopted = (document as Document & { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets
  for (const sheet of Array.from(adopted ?? [])) add(sheet)
  return out
}

function describeRoot(el: Element): string {
  const root = el.getRootNode()
  if (root === document) return 'document'
  if (typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot) return 'shadow'
  return root.nodeName
}

/** 采集一次全部探针。返回按编号排好的行，直接可渲染 / 打日志。 */
export function collectSegProbes(): ProbeLine[] {
  if (typeof document === 'undefined') return [{ id: 'P0', text: 'no document' }]
  const lines: ProbeLine[] = []

  const allTags = Array.from(document.querySelectorAll('style'))
  const segTags = allTags.filter((t) => (t.textContent ?? '').includes('dshpc-seg'))
  lines.push({
    id: 'P1',
    text: `style 标签总 ${String(allTags.length)}，含 dshpc-seg ${String(segTags.length)} 个 [${segTags.map((t) => (t.id === '' ? '(无id)' : t.id)).join(', ')}]`,
  })

  const kitTag = document.getElementById(KIT_TAG_ID)
  const kitCss = kitTag?.textContent ?? ''
  lines.push({
    id: 'P2',
    text:
      kitTag === null
        ? `找不到 #${KIT_TAG_ID}`
        : `#${KIT_TAG_ID} len ${String(kitCss.length)}，文本里 '.dshpc-seg{' × ${String(countOccur(kitCss, '.dshpc-seg{'))}`,
  })

  const sheets = readSheets()
  const readable = sheets.filter((s) => s.count >= 0)
  lines.push({
    id: 'P3',
    text: `sheets 总 ${String(sheets.length)}，可读 ${String(readable.length)}，规则合计 ${String(readable.reduce((a, s) => a + s.count, 0))}，读不了 ${String(sheets.length - readable.length)}`,
  })

  const cssomSeg = readable.flatMap((s) => s.selectors.filter((x) => x.startsWith('.dshpc-seg')))
  lines.push({
    id: 'P4',
    text: `CSSOM 里 .dshpc-seg* 共 ${String(cssomSeg.length)} 条：${cssomSeg.slice(0, 6).join(' | ') || '(无)'}`,
  })

  const textSeg = selectorsOf(kitCss).filter((x) => x.startsWith('.dshpc-seg'))
  const present = new Set(cssomSeg)
  const missing = textSeg.filter((x) => !present.has(x))
  lines.push({
    id: 'P5',
    text: `文本里 .dshpc-seg* ${String(textSeg.length)} 条，CSSOM 缺 ${String(missing.length)} 条：${missing.slice(0, 6).join(' | ') || '(无)'}`,
  })

  const el = document.querySelector('.dshpc-seg')
  if (el === null) {
    lines.push({ id: 'P6', text: '页面上没有 .dshpc-seg 元素（换到「滑动块」那节再看）' })
    return lines
  }
  lines.push({
    id: 'P6',
    text: `元素 class="${el.className}"，matches ${String(el.matches('.dshpc-seg'))}，根 ${describeRoot(el)}，display=${getComputedStyle(el).display}`,
  })

  const clone = document.createElement('div')
  clone.className = 'dshpc-seg'
  clone.style.cssText = 'position:fixed;left:-9999px;top:0'
  document.body.appendChild(clone)
  const cloneDisplay = getComputedStyle(clone).display
  clone.remove()
  lines.push({ id: 'P7', text: `裸 div.dshpc-seg 的 display=${cloneDisplay}` })

  el.classList.add('dshpc-segprobe')
  const probeDisplay = getComputedStyle(el).display
  el.classList.remove('dshpc-segprobe')
  lines.push({ id: 'P8', text: `真实元素临时加 .dshpc-segprobe ⇒ display=${probeDisplay}` })

  const fresh = document.createElement('style')
  fresh.setAttribute('data-probe', 'seg-fresh')
  fresh.textContent = '.dshpc-seg{display:inline-flex}'
  document.head.appendChild(fresh)
  const freshDisplay = getComputedStyle(el).display
  let freshRules = -1
  try {
    freshRules = fresh.sheet?.cssRules.length ?? -1
  } catch {
    freshRules = -1
  }
  fresh.remove()
  lines.push({
    id: 'P9',
    text: `临时标签只写 .dshpc-seg{display:inline-flex} ⇒ display=${freshDisplay}（cssRules ${String(freshRules)}），已删`,
  })

  return lines
}
