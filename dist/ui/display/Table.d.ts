import { createElement as h } from 'react';
import { type TableSharedProps } from './table-shared.js';
/** `Table` 对外 props（外观由组件本身决定，没有 variant 轴）。 */
export type TableProps = TableSharedProps;
/**
 * 表格 · 第一档外观（Plain）：白卡片上的无线框表格。
 *
 * 特征：双行分组表头（columns 嵌套 `children` 自动算 colSpan / rowSpan）、竖向浅分隔线、
 * **无横向行线**、行悬浮淡蓝、选中行淡蓝底 + 左侧蓝竖条。
 *
 * 只 import 自己这份皮肤 CSS（`TABLE_PLAIN_CSS`）：消费方引 `Table` 就只打包这一份。
 * 将来的 `TableGrid` / `TableZebra` 是同族独立组件、各自一份 CSS —— **不做 variant**，
 * 否则两份皮肤会同时进包。
 *
 * ```tsx
 * h(Table, {
 *   columns: [
 *     { key: 'id', title: 'ID', width: 120 },
 *     { key: 'study', title: 'Study', children: [
 *       { key: 'date', title: 'Date', width: 130 },
 *       { key: 'modality', title: 'Modality', width: 110 },
 *     ]},
 *   ],
 *   rows: [{ key: 'S-1', cells: { id: 'S-1', date: '2026-10-24', modality: 'CT' } }],
 *   onRowClick: (row) => select(row.key),
 * })
 * ```
 */
export declare function Table(props: TableProps): ReturnType<typeof h>;
//# sourceMappingURL=Table.d.ts.map