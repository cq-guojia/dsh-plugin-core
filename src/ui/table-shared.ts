import { createElement as h, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { t, type Translate } from '../utils/i18n.js'
import { ensureComponentStyles } from './css.js'
import { TABLE_BASE_CSS } from './controls-css.js'
import type { TablePaginationConfig } from './Pagination.js'
import { Loader } from './Loader.js'
import { SectionHead, type SectionHeadAccent } from './SectionHead.js'
import {
  headerRows,
  isTableCellSpec,
  leafColumns,
  type TableAlign,
  type TableBorders,
  type TableCellSpec,
  type TableColumn,
  type TableDensity,
  type TableGroup,
  type TableHeaderCell,
  type TableRow,
} from './table-logic.js'

/**
 * 表格外观的公共 props。**对外组件各自继承它，不要直接把本接口给消费方**：
 * 消费方看到的是 `TableProps` 这类具名类型，外观由「引哪个组件」决定。
 */
export interface TableSharedProps {
  /** 列定义；`children` 非空即分组表头（组件自动算 colSpan / rowSpan）。 */
  columns: readonly TableColumn[]
  /**
   * 行数据；`key` 兼作选中标识，`cells` 按叶子列 key 取内容。
   * 值可以是任意 ReactNode，也可以是 `{ content, colSpan, rowSpan, align }` 对象；
   * 某列 key 缺省（undefined）= 该格不渲染，给上一行的 rowSpan 让位。
   */
  rows?: readonly TableRow[]
  /**
   * 分组数据：每组带一行通栏标题 + 自己的表头 + 自己的数据行，多组连续排布。
   * 与 `rows` 二选一；传了 `groups` 就忽略 `rows`（用于「一个表里多个工作区 / 板块」）。
   */
  groups?: readonly TableGroup[]
  /**
   * 通栏标题前的固定标签（画出来的短竖线）颜色（只对 `groups` 模式生效）：内置语义色名
   * （business / success / warning / danger / purple / pink / cyan / teal / orange / indigo /
   * rose / slate）或任意 CSS 色值；`'default'` / 不传 = 主题默认（浅色深灰、深色浅灰）；
   * `false` = 不画这条竖线。绘制与样式归 `SectionHead`，Table 只把标题装进通栏。
   */
  groupAccent?: SectionHeadAccent | false
  /** 行密度（行高 + 水平内距），默认 default。 */
  density?: TableDensity
  /** 斑马纹（偶数行淡底），默认 false。 */
  striped?: boolean
  /** 外框范围：y 只上下两条（默认，无左右边）/ all 四边 / x 只左右两条 / none 全不要。 */
  borders?: TableBorders
  /** 选中行（高亮 + 左侧竖条由皮肤决定）。 */
  selectedKeys?: readonly (string | number)[]
  /** 传了才可点：行获得指针 / 键盘（Enter、空格）激活能力。 */
  onRowClick?: (row: TableRow, index: number) => void
  /** 空数据文案；不传走内置字典（中英随 `setLocale`）。 */
  emptyText?: ReactNode
  /** 无障碍名（表格没有可见标题时请务必给）。 */
  ariaLabel?: string
  /**
   * 内建分页（**只在 `Table` 上生效**，`tableShell` 自己不读它）：给出即按当前页切片 `rows`
   * 并在表格下方渲染分页条；`total` 缺省 = `rows.length`（本地分页），给了就按服务端分页处理
   * （不切片）。`groups` 模式不分页 —— 传了 `groups` 就忽略本项。
   */
  pagination?: TablePaginationConfig
  /**
   * 整表加载中（首屏还没有任何数据时用）：表格主体换成一块较高的占位区（居中三块加载动画，最大号，无文案）。
   * 已有数据时不遮挡数据 —— 追加下一页请用 `loadingMore`。
   */
  loading?: boolean
  /** 整表加载占位区的高度（px），默认 160。 */
  loadingHeight?: number
  /**
   * 底部「加载更多」中（已有数据、正在取下一页）：在数据行下方插一行中号三块加载动画（无文案）。
   * 只在给了 `onLoadMore` 时生效。
   */
  loadingMore?: boolean
  /**
   * 是否还有下一页，默认 true。`false` 时底部显示「没有更多数据」；
   * 文案可用 `noMoreText` 换，给 `false` 整行不渲染。只在给了 `onLoadMore` 时生效。
   */
  hasMore?: boolean
  /** 到底文案；不传走内置字典（中英随 `setLocale`）。 */
  noMoreText?: ReactNode
  /**
   * 滚动到底自动加载下一页：**这个 props 本身就是开关** —— 传了就装底部哨兵并监听，
   * 不传完全不监听、也不触发。正在加载（`loading` / `loadingMore`）或已到底（`hasMore: false`）
   * 时不会重复触发。与 `pagination` / `groups` 同时给时忽略（一个表里两套翻页说不清）。
   */
  onLoadMore?: () => void
  /** 追加 class（只允许补布局，不许覆盖皮肤）。 */
  className?: string
  style?: CSSProperties
  /** 覆盖内置文案翻译（如插件自带 i18n）。 */
  translate?: Translate
}

function widthOf(width: TableColumn['width']): string | undefined {
  if (width === undefined) return undefined
  return typeof width === 'number' ? `${width}px` : width
}

/** 列级水平内距（覆盖 density 档）；不传交给 CSS。 */
function padStyle(column: TableColumn): CSSProperties | undefined {
  return column.padding === undefined ? undefined : { paddingInline: `${column.padding}px` }
}

function alignClass(prefix: 'dshpc-table__head-cell' | 'dshpc-table__cell', align?: TableAlign): string {
  return align === undefined || align === 'left' ? '' : ` ${prefix}--${align}`
}

/**
 * 某列在叶子序列里的位置决定画不画左竖线：
 * 首列恒不画（那是外框的位置）；其余列只在「想要线」时画。
 * 分组列自己不写 `divider` 时，跟随它第一个叶子列 —— 组头的左缘和第一个子列的左缘
 * 是同一条线，否则「组头无线、下面子列有线」会断成两截（2026-10-30 用户真机指出）。
 */
function dividerAttr(leafIndex: number, wanted: boolean | undefined): 'left' | undefined {
  if (leafIndex === 0) return undefined
  return wanted === true ? 'left' : undefined
}

/** `tableShell` 的渲染选项（内部参数，不进公开 props）。 */
interface TableShellOptions {
  /**
   * 底部哨兵元素的 ref：给了才渲染哨兵行（供调用方挂 IntersectionObserver）。
   * 不给 = 不做滚动监听（`onLoadMore` 仍可透传，但不会自动触发）。
   */
  sentinelRef?: (node: HTMLTableRowElement | null) => void
}

/**
 * 表格共享渲染壳（**内部件，不进公开导出**）。
 *
 * 职责：基础层样式登记 + 语义化 `<table>` 结构 + 表头分组计算 + 行交互 + 列/单元格配置落地。
 * 外观（表头底色 / 分隔线 / 悬浮 / 选中）由调用方的皮肤 CSS 负责：每个公开组件
 * （`Table`、将来的 `TableGrid` / `TableZebra`）只 import 自己那份皮肤，并把自己的
 * modifier class 传进来。这样消费方引哪个就只打包哪个 —— 绝不用 `variant` 汇总多份皮肤。
 */
export function tableShell(
  skinClass: string,
  props: TableSharedProps,
  options: TableShellOptions = {},
): ReturnType<typeof h> {
  ensureComponentStyles('table-core', TABLE_BASE_CSS)
  const tt = props.translate ?? t
  const headRows = headerRows(props.columns)
  const leaves = leafColumns(props.columns)
  const leafIndexByKey = new Map<string, number>()
  leaves.forEach((column, index) => {
    leafIndexByKey.set(column.key, index)
  })
  const selected = new Set<string | number>(props.selectedKeys ?? [])
  const onRowClick = props.onRowClick
  const density = props.density ?? 'default'
  const borders = props.borders ?? 'y'

  /** 表头一行：分组表头按层级逐行渲染（每组重复渲染它，分组模式也要表头）。 */
  const headRowOf = (cells: readonly TableHeaderCell[], level: string | number): ReturnType<typeof h> =>
    h(
      'tr',
      { key: `head-${level}`, className: 'dshpc-table__head-row' },
      ...cells.map((cell) => {
        const group = cell.colSpan > 1
        const firstLeafIndex = leafIndexByKey.get(cell.leafKeys[0] ?? '')
        // 分组列没写 divider ⇒ 跟第一个叶子列走（两行列的左缘是同一条线）。
        const firstLeaf = firstLeafIndex === undefined ? undefined : leaves[firstLeafIndex]
        const className = `dshpc-table__head-cell${group ? ' dshpc-table__head-cell--group' : ''}${alignClass('dshpc-table__head-cell', cell.column.align)}`
        const tone = cell.column.headerTone
        return h(
          'th',
          {
            key: cell.column.key,
            scope: group ? 'colgroup' : 'col',
            colSpan: cell.colSpan > 1 ? cell.colSpan : undefined,
            rowSpan: cell.rowSpan > 1 ? cell.rowSpan : undefined,
            className,
            style: padStyle(cell.column),
            'data-divider':
              firstLeafIndex === undefined
                ? undefined
                : dividerAttr(firstLeafIndex, cell.column.divider ?? firstLeaf?.divider),
            'data-header-tone': tone === undefined || tone === 'default' ? undefined : tone,
          },
          cell.column.title,
        )
      }),
    )

  /**
   * 跨行单元格（rowSpan）把上下几行连成一个视觉块：块里任意一行被选中，整块都算选中。
   * 先按 rowSpan 求每行所属块的范围 [start, end]，再判断块内有没有选中行 ——
   * 不依赖点击的是块里的哪一行，也不要求调用方自己展开。
   */
  const selectedBlocksOf = (rows: readonly TableRow[]): boolean[] => {
    const blocks = rows.map((_, index) => ({ start: index, end: index }))
    rows.forEach((row, index) => {
      for (const cell of Object.values(row.cells)) {
        if (!isTableCellSpec(cell) || cell.rowSpan === undefined || cell.rowSpan <= 1) continue
        const end = Math.min(index + cell.rowSpan - 1, rows.length - 1)
        for (let line = index; line <= end; line += 1) {
          const block = blocks[line]
          if (block === undefined) continue
          block.start = Math.min(block.start, index)
          block.end = Math.max(block.end, end)
        }
      }
    })
    return blocks.map((block) => {
      for (let line = block.start; line <= block.end; line += 1) {
        const row = rows[line]
        if (row !== undefined && selected.has(row.key)) return true
      }
      return false
    })
  }

  /** 一组数据行（选中 / 可点 / 单元格配置都在这里落地）。 */
  const dataRowsOf = (rows: readonly TableRow[], offset = 0): ReturnType<typeof h>[] => {
    const selectedBlocks = selectedBlocksOf(rows)
    return rows.map((row, index) =>
      h(
        'tr',
        {
          key: row.key,
          className: 'dshpc-table__row',
          'data-selected': selectedBlocks[index] === true ? 'true' : undefined,
          'data-interactive': onRowClick === undefined ? undefined : 'true',
          tabIndex: onRowClick === undefined ? undefined : 0,
          onClick: onRowClick === undefined ? undefined : () => onRowClick(row, offset + index),
          onKeyDown:
            onRowClick === undefined
              ? undefined
              : (event: KeyboardEvent<HTMLTableRowElement>) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  onRowClick(row, offset + index)
                },
        },
        ...leaves.map((column, leafIndex) => {
          const cell = row.cells[column.key]
          // 缺 key = 该格不渲染（上一行的 rowSpan 已经占了这个位置）；要空格请显式传 null。
          if (cell === undefined) return null
          let spec: TableCellSpec | undefined
          let content: ReactNode
          if (isTableCellSpec(cell)) {
            spec = cell
            content = cell.content
          } else {
            content = cell
          }
          const align = spec?.align ?? column.align
          return h(
            'td',
            {
              key: column.key,
              className: `dshpc-table__cell${alignClass('dshpc-table__cell', align)}`,
              style: padStyle(column),
              colSpan: spec?.colSpan !== undefined && spec.colSpan > 1 ? spec.colSpan : undefined,
              rowSpan: spec?.rowSpan !== undefined && spec.rowSpan > 1 ? spec.rowSpan : undefined,
              'data-divider': dividerAttr(leafIndex, column.divider),
            },
            content ?? null,
          )
        }),
      ),
    )
  }

  const colSpan = leaves.length > 0 ? leaves.length : undefined
  const emptyRow = h(
    'tr',
    { key: 'empty', className: 'dshpc-table__row' },
    h('td', { className: 'dshpc-table__empty', colSpan }, props.emptyText ?? tt('tableEmpty')),
  )
  // 整表加载：只在一条数据都没有时占位，不遮挡已有行（追加下一页请用 loadingMore）。
  const loadingRow = h(
    'tr',
    { key: 'loading', className: 'dshpc-table__state-row' },
    h(
      'td',
      { className: 'dshpc-table__state-cell', colSpan },
      h(
        'div',
        {
          className: 'dshpc-table__state dshpc-table__state--full',
          style: props.loadingHeight === undefined ? undefined : { height: `${props.loadingHeight}px` },
        },
        h(Loader, { variant: 'blocks', size: 'xl', label: tt('tableLoading') }),
      ),
    ),
  )

  // 底部加载态：只在给了 onLoadMore（开关）时渲染，且 loadingMore 优先于「没有更多」。
  const infinite = props.onLoadMore !== undefined
  const loadingMore = infinite && props.loadingMore === true
  const showNoMore = infinite && !loadingMore && props.hasMore === false && props.noMoreText !== false
  const footerRows: ReturnType<typeof h>[] = []
  if (loadingMore) {
    footerRows.push(
      h(
        'tr',
        { key: 'more', className: 'dshpc-table__state-row dshpc-table__state-row--footer' },
        h(
          'td',
          { className: 'dshpc-table__state-cell', colSpan },
          h(
            'div',
            { className: 'dshpc-table__state' },
            h(Loader, { variant: 'blocks', size: 'md', label: tt('tableLoadingMore') }),
          ),
        ),
      ),
    )
  } else if (showNoMore) {
    footerRows.push(
      h(
        'tr',
        { key: 'end', className: 'dshpc-table__state-row dshpc-table__state-row--footer' },
        h(
          'td',
          { className: 'dshpc-table__state-cell', colSpan },
          h(
            'div',
            { className: 'dshpc-table__state' },
            h(
              'span',
              { className: 'dshpc-table__state-text' },
              props.noMoreText === undefined ? tt('tableNoMore') : props.noMoreText,
            ),
          ),
        ),
      ),
    )
  }
  // 底部哨兵：IntersectionObserver 的落点；hasMore === false 时没有下一页，不必再监听。
  const sentinelRow =
    infinite && props.hasMore !== false && options.sentinelRef !== undefined
      ? h(
          'tr',
          {
            key: 'sentinel',
            ref: options.sentinelRef,
            className: 'dshpc-table__sentinel',
            'aria-hidden': 'true',
          },
          h('td', { colSpan }),
        )
      : null

  // 没有左右外框（y / none）且底部有状态行时，表底那条横线也去掉 ——
  // 状态行只保留上方一条实线，否则图标下面会多出一条孤线（2026-10-31 用户定）。
  const flatFoot = footerRows.length > 0 && (borders === 'y' || borders === 'none')
  const tableClass = [
    'dshpc-table',
    skinClass,
    `dshpc-table--density-${density}`,
    `dshpc-table--borders-${borders}`,
    props.striped === true ? 'dshpc-table--striped' : '',
    flatFoot ? 'dshpc-table--foot-no-bottom' : '',
    props.className ?? '',
  ]
    .filter((s) => s !== '')
    .join(' ')

  const groups = props.groups ?? []
  const body = groups.length > 0
    ? groups.map((group, groupIndex) =>
        h(
          'tbody',
          { key: group.key, className: 'dshpc-table__body dshpc-table__group-body' },
          // 通栏标题行：横跨所有列，充当这一组的「大标题」。
          h(
            'tr',
            { className: 'dshpc-table__group-row' },
            h(
              'th',
              {
                className: 'dshpc-table__group-cell',
                scope: 'colgroup',
                colSpan: leaves.length > 0 ? leaves.length : undefined,
              },
              // 标题的固定标签（短竖线）与排版归 SectionHead —— Table 只负责把标题装进通栏。
              h(SectionHead, {
                title: group.title,
                accent: props.groupAccent ?? 'default',
                flush: true,
              }),
            ),
          ),
          // 每组自带表头：分组模式不放在 <thead>（一个 table 只能有一个 thead）
          ...headRows.map((cells, level) => headRowOf(cells, `g${groupIndex}-${level}`)),
          ...dataRowsOf(group.rows, 0),
        ),
      )
    : [
        h(
          'tbody',
          { key: 'body', className: 'dshpc-table__body' },
          props.loading === true && (props.rows?.length ?? 0) === 0
            ? loadingRow
            : props.rows !== undefined && props.rows.length > 0
              ? dataRowsOf(props.rows)
              : emptyRow,
          ...footerRows,
          sentinelRow,
        ),
      ]

  return h(
    'table',
    { className: tableClass, style: props.style, 'aria-label': props.ariaLabel },
    leaves.length === 0
      ? null
      : h(
          'colgroup',
          null,
          ...leaves.map((column) =>
            h('col', {
              key: column.key,
              style: widthOf(column.width) === undefined ? undefined : { width: widthOf(column.width) },
            }),
          ),
        ),
    // 有分组时，每组的表头在各自的 tbody 里；单一表时表头在 thead。
    groups.length > 0
      ? null
      : h(
          'thead',
          { className: 'dshpc-table__head' },
          ...headRows.map((cells, level) => headRowOf(cells, level)),
        ),
    ...body,
  )
}
