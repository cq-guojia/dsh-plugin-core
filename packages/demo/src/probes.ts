/**
 * 【临时探针 · 定位完必删】
 *
 * 用途：定位「`.dshpc-seg` 基础规则在 CSSOM 里明明存在、却不落到元素上」。
 * 删法：删掉本文件、删 `client/index.tsx` 里的 import 与 `probes` 状态 / effect / 渲染三处。
 *
 * ⚠️ 读数前提：**demo 里的兄弟皮肤对照（legacy-tdt）已拆**。它与我们同特异性又后注入，
 *    任何读数都会被它盖住（第一轮 P1-P9 就吃了这个亏）。
 *
 * 探针清单（编号固定，回答诊断时按编号报）：
 *   P1  含 `dshpc-seg` 文本的 <style> 标签个数与 id
 *   P2  我们这把 kit 的标签是否存在 / 文本长度 / 文本里 `.dshpc-seg{` 次数
 *   P3  styleSheets（含 adopted）总数 / 可读 / 规则合计
 *   P4  CSSOM 里 `.dshpc-seg*` 规则条数 + 前几条选择器
 *   P5  文本有、CSSOM 缺的选择器差集（**已做引号归一化**，避免 `'true'` vs `"true"` 假警报）
 *   P6  真实元素 className / matches / 根节点 / computed display
 *   P7  裸 div.dshpc-seg 挂 body 下：display / gap / padding（**不设 position**，避免 fixed 触发 display 块化）
 *   P8  真实元素临时加 `.dshpc-segprobe`：display 会不会变成 inline-flex
 *   P9  临时新标签只写 `.dshpc-seg{display:inline-flex}`：真实元素 display 变不变
 *   P10 我们那 6 条 `.dshpc-seg` 规则的 cssText + 所属 sheet 的 owner / disabled / media
 *   P11 裸 div.dshpc-seg 挂到真实元素父节点下：同上三项（区分「作用域」问题）
 *   P12 `matches` + 全文档 `.dshpc-seg` 元素个数
 *   P13 裸 div 只挂 `.dshpc-segprobe`：display（同内容换名在裸 div 上活不活）
 *   P14 裸 div 的 inline `style.display` vs computed（有无内联覆盖）
 *   P15 裸 div 挂 `.dshpc-btn`：display（同文件控件族的对照组）
 *   P16 新标签只写 `.dshpc-sga{display:inline-flex}`：CSSOM 命中几条 + 裸 div display
 *   P17 新标签（注释在最前）+ 同一条规则：注释会不会连累后面那条
 *   P18 新标签写 6 条拆分规则（display 在最前）：拆分形态本身会不会丢
 *   P19 我们那张表前 5 条 CSSStyleRule 的选择器（看规则从哪开始）
 *   P20 第一条 `.dshpc-seg` 在表里的序号 + 它前一条是谁
 *   P21 所有 `.dshpc-seg` 规则在表里的序号
 *   P22 运行时 `sheet.insertRule('.dshpc-seg{display:inline-flex}', 0)`：活不活（区分导入期过滤 / 运行期过滤）
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

/** 选择器归一化：Chrome 把属性选择器里的单引号序列化成双引号，精确比对前先抹平。 */
function normSel(sel: string): string {
  return sel.replace(/'/g, '"').replace(/\s+/g, ' ')
}

/** 从 CSS 文本里抽选择器（剥注释；本仓 CSS 每条规则都以 `}` 收尾，规则之间不嵌套）。 */
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

interface RuleInfo {
  sel: string
  css: string
}

interface SheetInfo {
  owner: string
  disabled: boolean
  media: string
  /** -1 = 读 cssRules 抛错（跨域 / SecurityError）。 */
  count: number
  rules: RuleInfo[]
}

function readSheets(): SheetInfo[] {
  const out: SheetInfo[] = []
  const add = (sheet: CSSStyleSheet, label: string): void => {
    const node = sheet.ownerNode as Element | null
    const owner = `${label}${node === null ? '' : `(${node.id === '' ? node.nodeName.toLowerCase() : `#${node.id}`})`}`
    try {
      const list = Array.from(sheet.cssRules)
      const rules: RuleInfo[] = []
      for (const r of list) {
        if (r instanceof CSSStyleRule) rules.push({ sel: r.selectorText, css: r.style.cssText })
      }
      out.push({ owner, disabled: sheet.disabled, media: sheet.media.mediaText, count: list.length, rules })
    } catch {
      out.push({ owner, disabled: sheet.disabled, media: sheet.media.mediaText, count: -1, rules: [] })
    }
  }
  Array.from(document.styleSheets).forEach((s, i) => { add(s, `S${String(i)}`) })
  const adopted = (document as Document & { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets
  Array.from(adopted ?? []).forEach((s, i) => { add(s, `A${String(i)}`) })
  return out
}

function describeRoot(el: Element): string {
  const root = el.getRootNode()
  if (root === document) return 'document'
  if (typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot) return 'shadow'
  return root.nodeName
}

/** 往指定父节点放一个只带 className 的裸 div，读完三项再移除。 */
function bareDiv(className: string, parent: Element | null): string {
  const host = parent ?? document.body
  const div = document.createElement('div')
  div.className = className
  host.appendChild(div)
  const cs = getComputedStyle(div)
  const out = `display=${cs.display} gap=${cs.gap} padding=${cs.padding} inline="${div.style.display}"`
  div.remove()
  return out
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
    text: `sheets 总 ${String(sheets.length)}（含 adopted），可读 ${String(readable.length)}，规则合计 ${String(readable.reduce((a, s) => a + s.count, 0))}`,
  })

  const cssomSeg = readable.flatMap((s) => s.rules.filter((r) => r.sel.startsWith('.dshpc-seg')))
  lines.push({
    id: 'P4',
    text: `CSSOM 里 .dshpc-seg* 共 ${String(cssomSeg.length)} 条：${cssomSeg.slice(0, 6).map((r) => r.sel).join(' | ') || '(无)'}`,
  })

  const textSeg = selectorsOf(kitCss).filter((x) => x.startsWith('.dshpc-seg'))
  const present = new Set(cssomSeg.map((r) => normSel(r.sel)))
  const missing = textSeg.filter((x) => !present.has(normSel(x)))
  lines.push({
    id: 'P5',
    text: `文本 .dshpc-seg* ${String(textSeg.length)} 条，CSSOM 缺 ${String(missing.length)} 条：${missing.slice(0, 6).join(' | ') || '(无)'}`,
  })

  const el = document.querySelector('.dshpc-seg')
  if (el === null) {
    lines.push({ id: 'P6', text: '页面上没有 .dshpc-seg 元素（换到「滑动块」那节再看）' })
    return lines
  }
  lines.push({
    id: 'P6',
    text: `元素 class="${el.className}"，根 ${describeRoot(el)}，display=${getComputedStyle(el).display}`,
  })
  lines.push({ id: 'P7', text: `裸 div.dshpc-seg 挂 body 下：${bareDiv('dshpc-seg', document.body)}` })

  const elInlineDisplay = el instanceof HTMLElement ? el.style.display : ''
  el.classList.add('dshpc-segprobe')
  const probeDisplay = getComputedStyle(el).display
  el.classList.remove('dshpc-segprobe')
  lines.push({ id: 'P8', text: `真实元素 tag=${el.tagName} inline="${elInlineDisplay}"，加 .dshpc-segprobe ⇒ display=${probeDisplay}` })

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
  lines.push({ id: 'P9', text: `临时标签只写 .dshpc-seg{display:inline-flex} ⇒ display=${freshDisplay}（cssRules ${String(freshRules)}），已删` })

  // P10：把我们那几条规则连同宿主所属 sheet 一起打出来（owner / disabled / media 是关键）。
  const baseRules = cssomSeg.filter((r) => normSel(r.sel) === '.dshpc-seg')
  const owner = readable.find((s) => s.rules.some((r) => normSel(r.sel) === '.dshpc-seg'))
  lines.push({
    id: 'P10',
    text: `${String(baseRules.length)} 条 .dshpc-seg 规则声明：${baseRules.map((r, i) => `${String(i + 1)}.${r.css}`).join(' ')} ｜ sheet ${owner === undefined ? '(未找到)' : `${owner.owner} disabled=${String(owner.disabled)} media="${owner.media}"`}`,
  })

  lines.push({ id: 'P11', text: `裸 div.dshpc-seg 挂真实元素同父下：${bareDiv('dshpc-seg', el.parentElement)}` })
  lines.push({
    id: 'P12',
    text: `真实元素 matches=${String(el.matches('.dshpc-seg'))}，全文档 .dshpc-seg 元素 ${String(document.querySelectorAll('.dshpc-seg').length)} 个`,
  })
  lines.push({ id: 'P13', text: `裸 div.dshpc-segprobe 挂 body 下：${bareDiv('dshpc-segprobe', document.body)}` })

  const inlineProbe = document.createElement('div')
  inlineProbe.className = 'dshpc-seg'
  document.body.appendChild(inlineProbe)
  lines.push({
    id: 'P14',
    text: `裸 div 的 inline display="${inlineProbe.style.display}"，computed=${getComputedStyle(inlineProbe).display}`,
  })
  inlineProbe.remove()
  lines.push({ id: 'P15', text: `裸 div.dshpc-btn 挂 body 下：${bareDiv('dshpc-btn', document.body)}` })

  /** 在新标签里复现某种写法：返回 CSSOM 里命中条数 + 裸 div 的 display。 */
  const tryTag = (label: string, css: string, probeClass: string): string => {
    const tag = document.createElement('style')
    tag.setAttribute('data-probe', label)
    tag.textContent = css
    document.head.appendChild(tag)
    let hit = -1
    try {
      const list = Array.from(tag.sheet?.cssRules ?? [])
      hit = list.filter((r) => r instanceof CSSStyleRule && normSel(r.selectorText) === normSel(`.${probeClass}`)).length
    } catch {
      hit = -1
    }
    const div = document.createElement('div')
    div.className = probeClass
    document.body.appendChild(div)
    const display = getComputedStyle(div).display
    div.remove()
    tag.remove()
    return `CSSOM 命中 ${String(hit)} 条，裸 div display=${display}`
  }

  lines.push({ id: 'P16', text: `新标签只写 .dshpc-sga{display:inline-flex}（无注释）：${tryTag('sga', '.dshpc-sga{display:inline-flex}', 'dshpc-sga')}` })
  lines.push({ id: 'P17', text: `新标签 /*c*/ + .dshpc-sgb{display:inline-flex}：${tryTag('sgb', '/* c */ .dshpc-sgb{display:inline-flex}', 'dshpc-sgb')}` })
  lines.push({
    id: 'P18',
    text: `新标签 6 条拆分规则（display 在最前）：${tryTag('sgc', '.dshpc-sgc{display:inline-flex;} .dshpc-sgc{align-items:center;} .dshpc-sgc{gap:2px;} .dshpc-sgc{padding:2px;} .dshpc-sgc{border-radius:4px;} .dshpc-sgc{background:red;}', 'dshpc-sgc')}`,
  })

  // P19 / P20：我们那张表里，规则从第几条开始、`.dshpc-seg` 落在第几条 —— 判断丢规则是不是「位置型」。
  const ourSheet = sheets.find((s) => s.owner.includes(`#${KIT_TAG_ID}`))
  const segIndex = ourSheet?.rules.findIndex((r) => normSel(r.sel) === '.dshpc-seg') ?? -1
  lines.push({
    id: 'P19',
    text:
      ourSheet === undefined
        ? '找不到我们的 sheet'
        : `我们 sheet 的 CSSStyleRule ${String(ourSheet.rules.length)} 条，前 5 条：${ourSheet.rules.slice(0, 5).map((r, i) => `${String(i)}:${r.sel}`).join(' | ')}`,
  })
  lines.push({ id: 'P20', text: `第一条 .dshpc-seg 规则在 CSSStyleRule 序号 ${String(segIndex)}；其前一条：${segIndex > 0 && ourSheet !== undefined ? ourSheet.rules[segIndex - 1].sel : '(无)'}` })
  lines.push({ id: 'P21', text: `我们的 sheet 里所有 .dshpc-seg 规则序号：${(ourSheet?.rules ?? []).map((r, i) => (normSel(r.sel) === '.dshpc-seg' ? String(i) : '')).filter((x) => x !== '').join(',')}` })

  // P22：往我们那张表里**运行时插入**同一条规则，看它活不活。
  //      活 ⇒ 丢规则发生在「文本导入」那一步（写法/位置问题）；死 ⇒ 运行时也在过滤（更狠）。
  let insertResult = 'failed'
  try {
    const kitSheet = (document.getElementById(KIT_TAG_ID) as HTMLStyleElement | null)?.sheet ?? null
    if (kitSheet === null) {
      insertResult = '拿不到 sheet'
    } else {
      const idx = kitSheet.insertRule('.dshpc-seg{display:inline-flex}', 0)
      insertResult = `insertRule@${String(idx)} 成功 ⇒ 真实元素 display=${getComputedStyle(el).display}`
      kitSheet.deleteRule(idx)
    }
  } catch (err) {
    insertResult = `抛错 ${String(err)}`
  }
  lines.push({ id: 'P22', text: `运行时往我们 sheet 插 .dshpc-seg{display:inline-flex}：${insertResult}（已 deleteRule 撤销）` })

  // P23–P26：验证「tokens 块之后的第一条规则被吃」这个判断。
  const segAt = kitCss.indexOf('.dshpc-seg{')
  lines.push({
    id: 'P23',
    text:
      segAt < 0
        ? '文本里找不到 .dshpc-seg{'
        : `文本 .dshpc-seg{ 前 100 字："${kitCss.slice(Math.max(0, segAt - 100), segAt)}" ｜ 后 60 字："${kitCss.slice(segAt, segAt + 60)}"`,
  })
  lines.push({
    id: 'P24',
    text:
      ourSheet === undefined
        ? '找不到我们的 sheet'
        : `表里前 3 条规则 cssText：${ourSheet.rules.slice(0, 3).map((r, i) => `${String(i)}:${r.sel}{${r.css.slice(0, 90)}}`).join(' | ')}`,
  })
  lines.push({ id: 'P25', text: `文本开头 120 字："${kitCss.slice(0, 120)}"` })
  const guardIndex = ourSheet?.rules.findIndex((r) => normSel(r.sel) === '.dshpc-css-guard') ?? -1
  lines.push({
    id: 'P26',
    text: `.dshpc-css-guard 守卫规则在表里：${guardIndex < 0 ? '不存在（被吃了）' : `序号 ${String(guardIndex)}`}`,
  })

  return lines
}
