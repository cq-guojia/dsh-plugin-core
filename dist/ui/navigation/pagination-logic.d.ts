/**
 * 分页纯逻辑：总页数、页码夹取、省略号窗口、当前页可见区间。
 *
 * 零 React 运行时依赖（只 `import type`，编译后不留痕迹），可被 node 单测直接引。
 *
 * 口径照通行的分页约定（Ant Design / MUI / Element Plus 一致）：
 * 调用方只给「当前页 / 每页条数 / 总条数」，总页数与省略窗口一律由这里算，
 * **消费方永远不自己算页数、也不自己拼页码**。
 */
import type { ReactNode } from 'react';
/** 页码条对齐：默认 right（放内容右下角）。 */
export type PaginationAlign = 'left' | 'center' | 'right';
/** 页码条里的一项：页码，或省略号占位。 */
export type PageItem = number | 'gap';
/** 总页数：`ceil(total / pageSize)`，至少 1 页（空数据也显示单页）。 */
export declare function pageCountOf(total: number, pageSize: number): number;
/** 把页码夹回 `[1, pageCount]`（越界 / NaN 一律落到第 1 页）。 */
export declare function clampPage(page: number, pageCount: number): number;
/**
 * 当前页在数据里的区间（1 起的闭区间行号）。
 * 空数据返回 `[0, 0]`（调用方据此显示「共 0 条」而不是「第 0-0 条」）。
 */
export declare function pageRange(page: number, pageSize: number, total: number): [number, number];
/**
 * 页码条上的项序列（含省略号占位）。
 *
 * 窗口算法照 MUI 的实现：首尾各固定 `boundaryCount` 页，当前页两侧各留 `siblingCount` 页，
 * 中间不足的部分收成 `'gap'`。默认 1 / 1 —— 最多 7 个位置（与 Element Plus `pager-count: 7` 等价）。
 *
 * 关键细节（各家一致，别改成「有缝就画省略号」）：间隔**正好 1 页**时直接显示那个页号，
 * 不画省略号，否则会出现 `1 2 … 4` 这种丑态。
 */
export declare function pageItems(page: number, pageCount: number, siblingCount?: number, boundaryCount?: number): PageItem[];
/** `showTotal` 的两种写法：`true` 走内置字典，函数则拿到 (总条数, 起始行, 结束行)。 */
export type PageTotalRenderer = (total: number, from: number, to: number) => ReactNode;
//# sourceMappingURL=pagination-logic.d.ts.map