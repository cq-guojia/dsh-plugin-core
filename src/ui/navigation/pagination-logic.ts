/**
 * 分页纯逻辑：总页数、页码夹取、省略号窗口、当前页可见区间。
 *
 * 零 React 运行时依赖（只 `import type`，编译后不留痕迹），可被 node 单测直接引。
 *
 * 口径照通行的分页约定（Ant Design / MUI / Element Plus 一致）：
 * 调用方只给「当前页 / 每页条数 / 总条数」，总页数与省略窗口一律由这里算，
 * **消费方永远不自己算页数、也不自己拼页码**。
 */

import type { ReactNode } from 'react'

/** 页码条对齐：默认 right（放内容右下角）。 */
export type PaginationAlign = 'left' | 'center' | 'right'

/** 页码条里的一项：页码，或省略号占位。 */
export type PageItem = number | 'gap'

/** 总页数：`ceil(total / pageSize)`，至少 1 页（空数据也显示单页）。 */
export function pageCountOf(total: number, pageSize: number): number {
  const size = Math.max(1, Math.floor(pageSize))
  const rows = Math.max(0, Math.floor(total))
  return Math.max(1, Math.ceil(rows / size))
}

/** 把页码夹回 `[1, pageCount]`（越界 / NaN 一律落到第 1 页）。 */
export function clampPage(page: number, pageCount: number): number {
  const count = Math.max(1, Math.floor(pageCount))
  if (!Number.isFinite(page)) return 1
  return Math.min(Math.max(1, Math.floor(page)), count)
}

/**
 * 当前页在数据里的区间（1 起的闭区间行号）。
 * 空数据返回 `[0, 0]`（调用方据此显示「共 0 条」而不是「第 0-0 条」）。
 */
export function pageRange(page: number, pageSize: number, total: number): [number, number] {
  const rows = Math.max(0, Math.floor(total))
  if (rows === 0) return [0, 0]
  const size = Math.max(1, Math.floor(pageSize))
  const current = clampPage(page, pageCountOf(rows, size))
  const from = (current - 1) * size + 1
  return [from, Math.min(rows, from + size - 1)]
}

function range(start: number, end: number): number[] {
  const out: number[] = []
  for (let n = start; n <= end; n += 1) out.push(n)
  return out
}

/**
 * 页码条上的项序列（含省略号占位）。
 *
 * 窗口算法照 MUI 的实现：首尾各固定 `boundaryCount` 页，当前页两侧各留 `siblingCount` 页，
 * 中间不足的部分收成 `'gap'`。默认 1 / 1 —— 最多 7 个位置（与 Element Plus `pager-count: 7` 等价）。
 *
 * 关键细节（各家一致，别改成「有缝就画省略号」）：间隔**正好 1 页**时直接显示那个页号，
 * 不画省略号，否则会出现 `1 2 … 4` 这种丑态。
 */
export function pageItems(
  page: number,
  pageCount: number,
  siblingCount = 1,
  boundaryCount = 1,
): PageItem[] {
  const count = Math.max(1, Math.floor(pageCount))
  const current = clampPage(page, count)
  const boundary = Math.max(0, Math.floor(boundaryCount))
  const siblings = Math.max(0, Math.floor(siblingCount))

  const startPages = range(1, Math.min(boundary, count))
  const endPages = range(Math.max(count - boundary + 1, boundary + 1), count)

  const siblingsStart = Math.max(
    Math.min(current - siblings, count - boundary - siblings * 2 - 1),
    boundary + 2,
  )
  const siblingsEnd = Math.min(
    Math.max(current + siblings, boundary + siblings * 2 + 2),
    endPages.length > 0 ? endPages[0]! - 2 : count - 1,
  )

  const items: PageItem[] = [...startPages]
  if (siblingsStart > boundary + 2) items.push('gap')
  else if (boundary + 1 < count - boundary) items.push(boundary + 1)

  items.push(...range(siblingsStart, siblingsEnd))

  if (siblingsEnd < count - boundary - 1) items.push('gap')
  else if (count - boundary > boundary) items.push(count - boundary)

  items.push(...endPages)
  return items
}

/** `showTotal` 的两种写法：`true` 走内置字典，函数则拿到 (总条数, 起始行, 结束行)。 */
export type PageTotalRenderer = (total: number, from: number, to: number) => ReactNode
