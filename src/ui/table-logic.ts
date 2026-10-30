/**
 * 表格纯逻辑：列树 → 表头单元格（colSpan / rowSpan）。
 *
 * 零 React 运行时依赖（只 `import type`，编译后不留痕迹），可被 node 单测直接引。
 * 组件层只负责把这里算好的表头画出来；分组表头到底占几行、跨几列，一律由本文件决定。
 *
 * 列模型：`children` 存在且非空 ⇒ 该列是分组表头（自身 key 不产出单元格，只做表头）；
 * 否则是叶子列，`rows` 里按叶子 key 取单元格内容。
 */

import type { ReactNode } from 'react'

/** 单元格水平对齐（默认 left）。 */
export type TableAlign = 'left' | 'center' | 'right'

/** 行密度：决定行高与水平内距（参考稿是 default 档）。 */
export type TableDensity = 'compact' | 'default' | 'comfortable'

/** 外框范围：all 四边 / x 只有左右两条 / y 只有上下两条 / none 全不要。 */
export type TableBorders = 'all' | 'x' | 'y' | 'none'

/**
 * 表头底色档位。与全库语义色同名（default 是皮肤默认灰底）。
 * 一律映射到既有 token，不许传任意色值 —— 换主题 / 暗色自动成立。
 */
export type TableTone =
  | 'default'
  | 'business'
  | 'success'
  | 'warning'
  | 'danger'
  | 'purple'
  | 'pink'
  | 'cyan'
  | 'teal'
  | 'orange'
  | 'indigo'
  | 'rose'
  | 'slate'

/** 一列（可嵌套 children 形成多行分组表头）。 */
export interface TableColumn {
  /** 叶子列的 key 同时是 `TableRow.cells` 的取值键；分组列只用于 React key / 调试。 */
  key: string
  /** 表头文案（分组列即分组名）。 */
  title: ReactNode
  /** 子列：有子列时本列是分组表头，不产出数据单元格。 */
  children?: readonly TableColumn[]
  /** 列宽：数字按 px；不传由 `table-layout:fixed` 平均分。 */
  width?: number | string
  /** 对齐（表头与数据格同源，默认 left）。 */
  align?: TableAlign
  /** 该列左缘是否画竖分隔线（默认 true）；首列恒不画（那是外框的位置）。 */
  divider?: boolean
  /** 该列水平内距（px），覆盖 density 档；不传走密度档。 */
  padding?: number
  /** 该列表头底色档位（默认 default = 皮肤灰底）。 */
  headerTone?: TableTone
}

/**
 * 单元格对象写法：内容 + 跨列 / 跨行 / 对齐。
 * 不写对象、直接给 ReactNode 即普通单元格（最常用）。
 */
export interface TableCellSpec {
  content: ReactNode
  /** 横向跨几列（原生 colspan）。 */
  colSpan?: number
  /** 纵向跨几行（原生 rowspan）；下一行不要给同一列 key。 */
  rowSpan?: number
  /** 覆盖该列对齐。 */
  align?: TableAlign
}

/** 一个单元格：ReactNode（普通）或对象（跨列 / 跨行 / 对齐）。 */
export type TableCell = ReactNode | TableCellSpec

/** 一行数据：key 兼作选中标识与 React key，cells 按叶子列 key 取内容。 */
export interface TableRow {
  key: string | number
  /**
   * cells 按叶子列 key 取内容。
   * 缺 key（undefined）= 该格不渲染，给上一行的 rowSpan 让位；要空单元格请显式传 null。
   */
  cells: Record<string, TableCell>
}

/** 一个表头单元格：它覆盖的列（可能跨列 / 跨行）。 */
export interface TableHeaderCell {
  column: TableColumn
  colSpan: number
  rowSpan: number
  /** 该表头覆盖的叶子列 key（按从左到右顺序）。 */
  leafKeys: string[]
}

/** 叶子列判断：没有 children 或 children 为空。 */
export function isLeafColumn(column: TableColumn): boolean {
  return column.children === undefined || column.children.length === 0
}

/**
 * 单元格值是不是「对象写法」（跨列 / 跨行 / 对齐）。
 *
 * 判别不引 React：React 元素一定有 `$$typeof`（内部标记），而单元格对象没有 ——
 * 用它把「传进来一个 React 元素」和「传进来一个单元格配置」分开。
 * 放在纯逻辑层，node 单测可直接覆盖。
 */
export function isTableCellSpec(value: unknown): value is TableCellSpec {
  if (typeof value !== 'object' || value === null) return false
  if ('$$typeof' in value) return false
  return 'content' in value
}

/** 按深度优先顺序取全部叶子列（表格的列顺序 = 数据格的列顺序）。 */
export function leafColumns(columns: readonly TableColumn[]): TableColumn[] {
  const out: TableColumn[] = []
  for (const column of columns) {
    const children = column.children
    if (children === undefined || children.length === 0) out.push(column)
    else out.push(...leafColumns(children))
  }
  return out
}

/** 列树深度 = 表头行数（全叶子列时为 1）。 */
export function tableDepth(columns: readonly TableColumn[]): number {
  let depth = 1
  for (const column of columns) {
    const children = column.children
    if (children === undefined || children.length === 0) continue
    depth = Math.max(depth, 1 + tableDepth(children))
  }
  return depth
}

/**
 * 列树 → 逐行表头。
 *
 * - 叶子列：`rowSpan = 深度 - 当前层`，一直竖跨到表头底部；
 * - 分组列：`colSpan = 其下叶子数`，`rowSpan = 1`。
 *
 * 例：`[ID, Patient[Name, Age], Status]` ⇒ 第 0 行 `[ID(1×2), Patient(2×1), Status(1×2)]`，
 * 第 1 行 `[Name(1×1), Age(1×1)]`。
 */
export function headerRows(columns: readonly TableColumn[]): TableHeaderCell[][] {
  const rows: TableHeaderCell[][] = []
  const depth = tableDepth(columns)
  for (let level = 0; level < depth; level += 1) rows.push([])

  const visit = (column: TableColumn, level: number): string[] => {
    const children = column.children
    if (children === undefined || children.length === 0) {
      rows[level]!.push({ column, colSpan: 1, rowSpan: depth - level, leafKeys: [column.key] })
      return [column.key]
    }
    const keys: string[] = []
    for (const child of children) keys.push(...visit(child, level + 1))
    rows[level]!.push({ column, colSpan: keys.length, rowSpan: 1, leafKeys: keys })
    return keys
  }

  for (const column of columns) visit(column, 0)
  return rows
}
