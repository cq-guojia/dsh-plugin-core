/**
 * 图标替换清单：把本仓还在用「官方 primitives 组件 / 自绘 SVG / 字符」当图标的地方列成一张表。
 *
 * 每行 = 一个图标（不是一处引用）：同一颗图标被几个文件用就并列在「用在哪」里，
 * 这样「要补哪些字形」一眼数得出来。
 *
 * 第三列是**候选**替换（新图标库 `库名:图标名`），在不在库里由在线 CSS 实时判定
 * （`loadIconFont`）：库里没有就显示「缺」——所以这一列不会因为平台改动而说谎。
 *
 * 口径（2026-11-14 用户）：`src/adv/session/**` 整块照官方镜像，不换；Loader / LoaderBar
 * 是动画指示器（CSS 动画 + clipPath），与字体图标无关 —— 两者都不在本表里。
 */
import { createElement as h, useEffect, useState } from 'react'
import { Table, type TableColumn, type TableRow } from '../../../../dist/ui/index.js'
import { Icon, loadIconFont, type IconFontId } from '../../../../dist/ui/display/Icon.js'
import { Official } from '../../../../dist/ui/official.js'
import { t } from '../i18n.js'

/** 「现在的图标」怎么画：官方组件 / 一条自绘路径 / 一个字符。 */
type Used =
  | { kind: 'official'; name: string }
  | { kind: 'path'; d: string; strokeWidth: number }
  | { kind: 'char'; char: string }

interface Row {
  used: Used
  /** 来源：官方 primitives / 自绘 SVG / 字符。 */
  source: 'official' | 'drawn' | 'char'
  /** 用在哪：组件文件（或 `文件:行`），多个用换行分隔。 */
  where: string
  /** 候选替换（`库名:图标名`）；库里根本没有对应字形就是 null。 */
  replace: string | null
}

const OFFICIAL = Official as Record<string, unknown>

const ROWS: Row[] = [
  // ── 官方 primitives 图标：这几颗都在 `src/adv/explorer` 与代码查看器里 ──────────
  {
    used: { kind: 'official', name: 'IconCheckOutlineRegular' },
    source: 'official',
    where: 'adv/explorer/preview-title-bar.ts:67\nui/display/CodeViewer.ts:72',
    replace: 'common.base:gou',
  },
  {
    used: { kind: 'official', name: 'IconCopyOutlineRegular' },
    source: 'official',
    where: 'adv/explorer/preview-title-bar.ts:67\nui/display/CodeViewer.ts:72',
    replace: 'common.base:fuzhi',
  },
  {
    used: { kind: 'official', name: 'IconRefreshOutlineRegular' },
    source: 'official',
    where: 'adv/explorer/preview-title-bar.ts:74',
    replace: 'common.base:shuaxin',
  },
  {
    used: { kind: 'official', name: 'IconChevronDownOutlineRegular' },
    source: 'official',
    where: 'adv/explorer/crumb-nav.ts:102',
    replace: 'common.base:move-down',
  },
  {
    used: { kind: 'official', name: 'IconChevronRightOutlineRegular' },
    source: 'official',
    where: 'adv/explorer/crumb-nav.ts:88,134\nadv/explorer/crumbs-menu.ts:106\nadv/explorer/FileBrowser.ts:606',
    replace: 'common.base:move-right',
  },
  {
    used: { kind: 'official', name: 'IconFolderCloseRegular' },
    source: 'official',
    where: 'adv/explorer/crumbs-menu.ts:59,84\nadv/explorer/landing.ts:45',
    replace: null,
  },
  {
    used: { kind: 'official', name: 'IconFolderOpenOutlineRegular' },
    source: 'official',
    where: 'adv/explorer/crumbs-menu.ts:84',
    replace: null,
  },

  // ── 自绘 SVG ──────────────────────────────────────────────────────────────
  {
    used: { kind: 'path', d: 'M4 6l4 4 4-4', strokeWidth: 1.5 },
    source: 'drawn',
    where: 'ui/infra/chevron.ts（四向同一路径）\nCard · Pagination · Picker · DateTimePicker · QuickToolbar',
    replace: 'common.base:move-down',
  },
  {
    used: { kind: 'path', d: 'M2 4.5A1.5 1.5 0 0 1 3.5 3h2.6l1.2 1.5h5.2A1.5 1.5 0 0 1 14 6v5.5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z', strokeWidth: 1.3 },
    source: 'drawn',
    where: 'ui/inputs/picker-icons.ts:17（folderIcon）\nui/inputs/WorkspacePicker.ts:70',
    replace: 'common.base:gongzuoqu',
  },
  {
    used: { kind: 'path', d: 'M8 1.8l1.6 4.1 4.1 1.6-4.1 1.6L8 13.2 6.4 9.1 2.3 7.5l4.1-1.6z', strokeWidth: 1.2 },
    source: 'drawn',
    where: 'ui/inputs/picker-icons.ts:28（sparkleIcon）\nui/inputs/ModelPicker.ts:103',
    replace: 'common.base:AIdamoxing',
  },

  // ── 字符当图标 ────────────────────────────────────────────────────────────
  {
    used: { kind: 'char', char: '✓' },
    source: 'char',
    where: 'ui/feedback/AlertModal.ts:13\nui/feedback/Toast.ts:227\nui/inputs/Picker.ts:366',
    replace: 'common.base:gou',
  },
  {
    used: { kind: 'char', char: '✕' },
    source: 'char',
    where: 'ui/feedback/AlertModal.ts:15\nui/feedback/Toast.ts:231\nui/layout/PanelDock.ts:429,461\nui/infra/panel.ts:71\nui/feedback/SideSheet.ts:149',
    replace: 'common.base:guanbi',
  },
  {
    used: { kind: 'char', char: '×' },
    source: 'char',
    where: 'ui/inputs/Field.ts:110（清空）',
    replace: 'common.base:guanbi',
  },
  {
    used: { kind: 'char', char: '+' },
    source: 'char',
    where: 'ui/inputs/Field.ts:235（增加）',
    replace: 'common.base:jia',
  },
  {
    used: { kind: 'char', char: '−' },
    source: 'char',
    where: 'ui/inputs/Field.ts:219（减少）',
    replace: 'common.base:jian',
  },
  {
    used: { kind: 'char', char: '!' },
    source: 'char',
    where: 'ui/feedback/Toast.ts:233（警告语气）',
    replace: 'common.base:warn',
  },
  {
    used: { kind: 'char', char: 'i' },
    source: 'char',
    where: 'ui/feedback/Toast.ts:236（信息语气）',
    replace: 'common.base:info',
  },
  {
    used: { kind: 'char', char: '↶' },
    source: 'char',
    where: 'ui/inputs/InputGroup.ts:146（撤销）',
    replace: 'common.base:chexiao',
  },
  {
    used: { kind: 'char', char: '‹' },
    source: 'char',
    where: 'ui/layout/PanelDock.ts:487（收起耳朵）',
    replace: 'common.base:move-right',
  },

  // ── 复检补漏（2026-11-14 第二轮扫全非 ASCII 字面量）：这三个第一轮漏了 ──────────
  {
    used: { kind: 'char', char: 'ⓘ' },
    source: 'char',
    where: 'ui/feedback/AlertModal.ts:12（info 档）',
    replace: 'common.base:info',
  },
  {
    used: { kind: 'char', char: '⚠' },
    source: 'char',
    where: 'ui/feedback/AlertModal.ts:14（warning 档）',
    replace: 'common.base:warn',
  },
  {
    used: { kind: 'char', char: '›' },
    source: 'char',
    where: 'ui/layout/PanelDock.ts:537（收起钮，与 19 行耳朵反向）',
    replace: 'common.base:move-right',
  },
  {
    used: { kind: 'char', char: '?' },
    source: 'char',
    where: 'ui/display/FieldHint.ts:43（问号提示；圆圈是 hint.css 的 border-radius 画的，不是字形）',
    replace: 'common.base:qm',
  },
  {
    used: { kind: 'official', name: 'IconSearchOutlineRegular' },
    source: 'official',
    where: 'demo 展示页：sections/controls.tsx、sections/toolbar.tsx:94（共 15 处）\n会话镜像 4 处不动（mirror/ChatGroupSeat.ts:37、GenericCommandCard.ts:134）',
    replace: 'common.base:chazhao',
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

const WHERE: Record<string, string> = {
  fontFamily: 'var(--dshpc-font-mono)', fontSize: '11px', lineHeight: '17px',
  color: 'var(--dshpc-fg-3)', whiteSpace: 'pre-line',
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
      where: h('span', { style: WHERE }, row.where),
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
