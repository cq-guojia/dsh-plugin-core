/**
 * 图标替换清单：把本仓还在用「官方 primitives 组件 / 自绘 SVG / 字符」当图标的地方列成一张表。
 *
 * 每行 = 一个图标（不是一处引用）：
 *  - 「现在的图标」三种画法都真渲染（官方组件按名取、自绘走同一条 `<path>`、字符直接出字）；
 *  - 「替换后」是候选 `库名:图标名`，**在不在库里由 `loadIconFont` 读在线 CSS 实时判定**，
 *    没有就显示「缺」——平台补了字形刷新即见，这一列不会说谎；
 *  - 「演示页」是**点得进去的 demo 页面链接**（`#<sectionId>`，由 client 的 hash 同步），
 *    点开就是那颗图标在真实控件里的样子 —— 验收看这个，别看源码。
 *
 * 口径（2026-11-14 用户）：`src/adv/session/**` 整块照官方镜像，不换；Loader / LoaderBar
 * 是动画指示器（CSS 动画 + clipPath），与字体图标无关 —— 两者都不在本表里（个别行会注明例外）。
 */
import { createElement as h, useEffect, useState } from 'react'
import { Table, type TableColumn, type TableRow } from '../../../../dist/ui/index.js'
import { Icon, loadIconFont, type IconFontId } from '../../../../dist/ui/display/Icon.js'
import { Official } from '../../../../dist/ui/official.js'
import type { DemoMessageKey } from '../i18n.js'
import { t } from '../i18n.js'
import type { SectionId } from './index.js'

/** 「现在的图标」怎么画：官方组件 / 一条自绘路径 / 一个字符。 */
type Used =
  | { kind: 'official'; name: string }
  | { kind: 'path'; d: string; strokeWidth: number }
  | { kind: 'char'; char: string }

interface Row {
  used: Used
  /** 来源：官方 primitives / 自绘 SVG / 字符。 */
  source: 'official' | 'drawn' | 'char'
  /** 能看到这颗图标实物的 demo 页（点进去就是演示界面）。 */
  pages: SectionId[]
  /** 补一句说清是哪颗控件上的（可选）。 */
  note?: string
  /** 候选替换（`库名:图标名`）；库里根本没有对应字形就是 null。 */
  replace: string | null
}

const OFFICIAL = Official as Record<string, unknown>

/** demo 页 id → 侧栏标题 key（复用同一份文案，不另写死中文）。 */
const PAGE_TITLE: Partial<Record<SectionId, DemoMessageKey>> = {
  inputs: 'secInputs',
  display: 'secDisplay',
  feedback: 'secFeedback',
  layout: 'secLayout',
  navigation: 'secNavigation',
  explorer: 'secExplorer',
}

const ROWS: Row[] = [
  // ── 官方 primitives 图标：这几颗都在 `src/adv/explorer` 与代码查看器里 ──────────
  {
    used: { kind: 'official', name: 'IconCheckOutlineRegular' },
    source: 'official',
    pages: ['explorer'],
    note: '代码预览标题栏：复制成功态',
    replace: 'common.base:gou',
  },
  {
    used: { kind: 'official', name: 'IconCopyOutlineRegular' },
    source: 'official',
    pages: ['explorer'],
    note: '代码预览标题栏：复制',
    replace: 'common.base:fuzhi',
  },
  {
    used: { kind: 'official', name: 'IconRefreshOutlineRegular' },
    source: 'official',
    pages: ['explorer'],
    note: '代码预览标题栏：重新取内容',
    replace: 'common.base:shuaxin',
  },
  {
    used: { kind: 'official', name: 'IconChevronDownOutlineRegular' },
    source: 'official',
    pages: ['explorer'],
    note: '面包屑「更多层级」菜单按钮',
    replace: 'common.base:move-down',
  },
  {
    used: { kind: 'official', name: 'IconChevronRightOutlineRegular' },
    source: 'official',
    pages: ['explorer'],
    note: '面包屑分隔符 / 文件列表展开',
    replace: 'common.base:move-right',
  },
  {
    used: { kind: 'official', name: 'IconFolderCloseRegular' },
    source: 'official',
    pages: ['explorer'],
    note: '文件夹（用户定：这两颗保留官方）',
    replace: null,
  },
  {
    used: { kind: 'official', name: 'IconFolderOpenOutlineRegular' },
    source: 'official',
    pages: ['explorer'],
    note: '当前目录的文件夹（用户定：这两颗保留官方）',
    replace: null,
  },

  // ── 自绘 SVG ──────────────────────────────────────────────────────────────
  {
    used: { kind: 'path', d: 'M4 6l4 4 4-4', strokeWidth: 1.5 },
    source: 'drawn',
    pages: ['display', 'inputs', 'navigation', 'layout'],
    note: '卡片折叠 / 选择器 / 日期导航 / 分页 / 工具栏，四向共用一条路径；替换时按方向取 move-up/right/down/left',
    replace: 'common.base:move-down',
  },
  {
    used: { kind: 'path', d: 'M2 4.5A1.5 1.5 0 0 1 3.5 3h2.6l1.2 1.5h5.2A1.5 1.5 0 0 1 14 6v5.5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z', strokeWidth: 1.3 },
    source: 'drawn',
    pages: ['inputs'],
    note: 'folderIcon：工作区选择器的默认前置图标',
    replace: 'common.base:gongzuoqu',
  },
  {
    used: { kind: 'path', d: 'M8 1.8l1.6 4.1 4.1 1.6-4.1 1.6L8 13.2 6.4 9.1 2.3 7.5l4.1-1.6z', strokeWidth: 1.2 },
    source: 'drawn',
    pages: ['inputs'],
    note: 'sparkleIcon：模型选择器的默认前置图标',
    replace: 'common.base:AIdamoxing',
  },

  // ── 字符当图标 ────────────────────────────────────────────────────────────
  {
    used: { kind: 'char', char: '✓' },
    source: 'char',
    pages: ['inputs', 'feedback'],
    note: 'Picker 多选勾 / 弹窗成功档 / 卡片提示成功',
    replace: 'common.base:gou',
  },
  {
    used: { kind: 'char', char: '✕' },
    source: 'char',
    pages: ['feedback', 'layout'],
    note: '弹窗、抽屉、提示卡的关闭，以及面板关闭',
    replace: 'common.base:guanbi',
  },
  {
    used: { kind: 'char', char: '×' },
    source: 'char',
    pages: ['inputs'],
    note: '搜索框清空',
    replace: 'common.base:guanbi',
  },
  {
    used: { kind: 'char', char: '+' },
    source: 'char',
    pages: ['inputs'],
    note: '数字框增加',
    replace: 'common.base:jia',
  },
  {
    used: { kind: 'char', char: '−' },
    source: 'char',
    pages: ['inputs'],
    note: '数字框减少',
    replace: 'common.base:jian',
  },
  {
    used: { kind: 'char', char: '!' },
    source: 'char',
    pages: ['feedback'],
    note: '卡片提示的警告语气',
    replace: 'common.base:warn',
  },
  {
    used: { kind: 'char', char: 'i' },
    source: 'char',
    pages: ['feedback'],
    note: '卡片提示的信息语气',
    replace: 'common.base:info',
  },
  {
    used: { kind: 'char', char: '↶' },
    source: 'char',
    pages: ['inputs'],
    note: '输入组的撤销',
    replace: 'common.base:chexiao',
  },
  {
    used: { kind: 'char', char: '‹' },
    source: 'char',
    pages: ['layout'],
    note: '面板收起后的浮动耳朵（往左拉回来）',
    replace: 'common.base:move-left',
  },
  {
    used: { kind: 'char', char: 'ⓘ' },
    source: 'char',
    pages: ['feedback'],
    note: '弹窗 info 档',
    replace: 'common.base:info',
  },
  {
    used: { kind: 'char', char: '⚠' },
    source: 'char',
    pages: ['feedback'],
    note: '弹窗 warning 档',
    replace: 'common.base:warn',
  },
  {
    used: { kind: 'char', char: '›' },
    source: 'char',
    pages: ['layout'],
    note: '面板收起钮（与 19 行耳朵反向）',
    replace: 'common.base:move-right',
  },
  {
    used: { kind: 'char', char: '?' },
    source: 'char',
    pages: ['inputs'],
    note: '字段问号提示；圆圈是 hint.css 的 border-radius 画的，不是字形',
    replace: 'common.base:qm',
  },
  {
    used: { kind: 'official', name: 'IconSearchOutlineRegular' },
    source: 'official',
    pages: ['inputs', 'layout'],
    note: '搜索图标示例（demo 展示页；会话镜像那几处不动）',
    replace: 'common.base:chazhao',
  },
  {
    used: { kind: 'path', d: 'M9.5 5L6 8l3.5 3', strokeWidth: 1.5 },
    source: 'drawn',
    pages: ['inputs'],
    note: '日期选择器年月前后的四颗箭头（上一月/下一月 move-left、move-right；上一年/下一年 zuoxiang-/youxiangshuangjiantou）',
    replace: 'common.base:move-left',
  },
  {
    used: { kind: 'path', d: 'M2 4.5A1.5 1.5 0 0 1 3.5 3h9A1.5 1.5 0 0 1 14 4.5V6H2V4.5z M2 6h12v8.5A1.5 1.5 0 0 1 12.5 16h-9A1.5 1.5 0 0 1 2 14.5V6z', strokeWidth: 1.5 },
    source: 'drawn',
    pages: ['inputs'],
    note: '日期选择器触发器上的日历图标',
    replace: 'common.base:riqi',
  },
]

/** 列定义在组件里建：`t()` 要跟着当前语言走，模块级会在 locale 到达前定型。 */
function columns(): TableColumn[] {
  return [
    { key: 'no', title: '#', width: 44, align: 'center' },
    { key: 'current', title: t('irCurrent'), width: 96, align: 'center' },
    { key: 'source', title: t('irSource'), width: 76 },
    { key: 'replace', title: t('irReplace'), width: 96, align: 'center' },
    { key: 'where', title: t('irWhere') },
  ]
}

const GLYPH_BOX: Record<string, string | number> = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  minWidth: '24px', height: '24px', lineHeight: 1,
}

const WHERE: Record<string, string | number> = {
  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 10px',
  fontSize: '12px', lineHeight: '17px',
}

const LINK: Record<string, string> = {
  color: 'var(--dshpc-business)', textDecoration: 'underline', whiteSpace: 'nowrap',
}

const NOTE: Record<string, string> = {
  width: '100%', fontSize: '11px', lineHeight: '16px',
  color: 'var(--dshpc-fg-4)', whiteSpace: 'normal',
}

/** 行号：用来在对话里指名道姓（「第 7 行换 sort-down」）。 */
const NO: Record<string, string> = {
  fontFamily: 'var(--dshpc-font-mono)', fontSize: '11px', color: 'var(--dshpc-fg-4)',
}

const MISSING: Record<string, string> = {
  fontSize: '11px', color: 'var(--dshpc-danger)', whiteSpace: 'nowrap',
}

/** 现在的图标：官方组件 / 自绘路径 / 字符，三种画法收在一处。 */
function Current(props: { used: Used }): ReturnType<typeof h> {
  const used = props.used
  if (used.kind === 'official') {
    const Comp = OFFICIAL[used.name]
    return h(
      'span',
      { style: GLYPH_BOX, title: used.name },
      typeof Comp === 'function'
        ? h(Comp as (p: { size?: number }) => ReturnType<typeof h>, { size: 20 })
        : used.name,
    )
  }
  if (used.kind === 'char') {
    return h('span', { style: { ...GLYPH_BOX, fontSize: '18px' }, title: used.char }, used.char)
  }
  return h(
    'span',
    { style: GLYPH_BOX },
    h(
      'svg',
      { width: 20, height: 20, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
      h('path', {
        d: used.d,
        stroke: 'currentColor',
        'stroke-width': used.strokeWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    ),
  )
}

/** 每个被引用的库 id → 该库在线 CSS 里的字形名；`undefined` = 还没到货。 */
type Names = Partial<Record<IconFontId, string[]>>

export function IconReplacePage(): ReturnType<typeof h> {
  const [names, setNames] = useState<Names>({})

  // 只拉清单里真正用到的库（现在是 common.base）；拿不到就整列显示「缺」，不猜。
  useEffect(() => {
    let alive = true
    const ids = [...new Set(ROWS.map((row) => row.replace?.split(':')[0]).filter((id): id is string => id !== undefined))]
    for (const id of ids) {
      loadIconFont(id as IconFontId).then(
        (parsed) => { if (alive) setNames((prev) => ({ ...prev, [id]: parsed.names })) },
        () => { if (alive) setNames((prev) => ({ ...prev, [id]: [] })) },
      )
    }
    return () => { alive = false }
  }, [])

  /** 候选字形在不在库里；`undefined` = 还没问出来。 */
  const glyphState = (replace: string | null): 'missing' | 'loading' | 'ready' => {
    if (replace === null) return 'missing'
    const cut = replace.indexOf(':')
    const list = names[replace.slice(0, cut) as IconFontId]
    if (list === undefined) return 'loading'
    return list.includes(replace.slice(cut + 1)) ? 'ready' : 'missing'
  }

  const ready = ROWS.filter((row) => glyphState(row.replace) === 'ready').length

  const rows: TableRow[] = ROWS.map((row, index) => ({
    key: index,
    cells: {
      no: h('span', { style: NO }, String(index + 1)),
      current: h(Current, { used: row.used }),
      source: t(row.source === 'official' ? 'irSrcOfficial' : row.source === 'drawn' ? 'irSrcDrawn' : 'irSrcChar'),
      replace: glyphState(row.replace) === 'ready' && row.replace !== null
        ? h(Icon, { name: row.replace, size: 20 })
        : h('span', { style: MISSING }, glyphState(row.replace) === 'loading' ? t('irLoading') : t('irMissing')),
      where: h(
        'div',
        { style: WHERE },
        ...row.pages.map((page) =>
          h('a', { key: page, href: `#${page}`, style: LINK }, t(PAGE_TITLE[page] ?? 'irWhere')),
        ),
        row.note === undefined ? null : h('div', { style: NOTE }, row.note),
      ),
    },
  }))

  return h(
    'div',
    null,
    h(
      'p',
      { style: { margin: '0 0 12px', fontSize: '13px', lineHeight: '1.8', color: 'var(--dshpc-fg-3)' } },
      t('irNote'),
    ),
    h(
      'p',
      { style: { margin: '0 0 12px', fontSize: '12px', color: 'var(--dshpc-fg-4)' } },
      t('irSummary', { ok: ready, total: ROWS.length }),
    ),
    h(Table, { columns: columns(), rows }),
  )
}
