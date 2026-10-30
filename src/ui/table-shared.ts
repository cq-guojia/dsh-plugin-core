import { createElement as h, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { t, type Translate } from '../utils/i18n.js'
import { ensureComponentStyles } from './css.js'
import { TABLE_BASE_CSS } from './controls-css.js'
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
  /** 行密度（行高 + 水平内距），默认 default。 */
  density?: TableDensity
  /** 斑马纹（偶数行淡底），默认 false。 */
  striped?: boolean
  /** 外框范围：all 四边（默认）/ x 只左右两条 / y 只上下两条 / none 全不要。 */
  borders?: TableBorders
  /** 选中行（高亮 + 左侧竖条由皮肤决定）。 */
  selectedKeys?: readonly (string | number)[]
  /** 传了才可点：行获得指针 / 键盘（Enter、空格）激活能力。 */
  onRowClick?: (row: TableRow, index: number) => void
  /** 空数据文案；不传走内置字典（中英随 `setLocale`）。 */
  emptyText?: ReactNode
  /** 无障碍名（表格没有可见标题时请务必给）。 */
  ariaLabel?: string
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
 * 首列恒不画（那是外框的位置），其余列按 `column.divider`（默认画）。
 */
function dividerAttr(column: TableColumn, leafIndex: number): 'left' | undefined {
  if (leafIndex === 0) return undefined
  return column.divider === false ? undefined : 'left'
}

/**
 * 表格共享渲染壳（**内部件，不进公开导出**）。
 *
 * 职责：基础层样式登记 + 语义化 `<table>` 结构 + 表头分组计算 + 行交互 + 列/单元格配置落地。
 * 外观（表头底色 / 分隔线 / 悬浮 / 选中）由调用方的皮肤 CSS 负责：每个公开组件
 * （`Table`、将来的 `TableGrid` / `TableZebra`）只 import 自己那份皮肤，并把自己的
 * modifier class 传进来。这样消费方引哪个就只打包哪个 —— 绝不用 `variant` 汇总多份皮肤。
 */
export function tableShell(skinClass: string, props: TableSharedProps): ReturnType<typeof h> {
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
  const borders = props.borders ?? 'all'
  const tableClass = [
    'dshpc-table',
    skinClass,
    `dshpc-table--density-${density}`,
    `dshpc-table--borders-${borders}`,
    props.striped === true ? 'dshpc-table--striped' : '',
    props.className ?? '',
  ]
    .filter((s) => s !== '')
    .join(' ')

  /** 表头一行：分组表头按层级逐行渲染（每组重复渲染它，分组模式也要表头）。 */
  const headRowOf = (cells: readonly TableHeaderCell[], level: string | number): ReturnType<typeof h> =>
    h(
      'tr',
      { key: `head-${level}`, className: 'dshpc-table__head-row' },
      ...cells.map((cell) => {
        const group = cell.colSpan > 1
        const firstLeafIndex = leafIndexByKey.get(cell.leafKeys[0] ?? '')
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
              firstLeafIndex === undefined ? undefined : dividerAttr(cell.column, firstLeafIndex),
            'data-header-tone': tone === undefined || tone === 'default' ? undefined : tone,
          },
          cell.column.title,
        )
      }),
    )

  /** 一组数据行（选中 / 可点 / 单元格配置都在这里落地）。 */
  const dataRowsOf = (rows: readonly TableRow[], offset = 0): ReturnType<typeof h>[] =>
    rows.map((row, index) =>
      h(
        'tr',
        {
          key: row.key,
          className: 'dshpc-table__row',
          'data-selected': selected.has(row.key) ? 'true' : undefined,
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
              'data-divider': dividerAttr(column, leafIndex),
            },
            content ?? null,
          )
        }),
      ),
    )

  const groups = props.groups ?? []
  const body = groups.length > 0
    ? groups.map((group, groupIndex) =>
        h(
          'tbody',
          { key: group.key, className: 'dshpc-table__body dshpc-table__group-body' },
          // 通栏标题行：横跨所有列，充当这一组的「大标题」
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
              group.title,
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
          props.rows !== undefined && props.rows.length > 0
            ? dataRowsOf(props.rows)
            : h(
                'tr',
                { className: 'dshpc-table__row' },
                h(
                  'td',
                  { className: 'dshpc-table__empty', colSpan: leaves.length > 0 ? leaves.length : undefined },
                  props.emptyText ?? tt('tableEmpty'),
                ),
              ),
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
