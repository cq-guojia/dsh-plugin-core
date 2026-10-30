import { createElement as h } from 'react';
import { ensureComponentStyles } from './css.js';
import { TABLE_PLAIN_CSS } from './controls-css.js';
import { Pagination } from './Pagination.js';
import { clampPage, pageCountOf } from './pagination-logic.js';
import { tableShell } from './table-shared.js';
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
export function Table(props) {
    ensureComponentStyles('table-plain', TABLE_PLAIN_CSS);
    const pager = props.pagination;
    // 通栏分组与分页互斥：一个表里多个板块时，页码该属于哪个板块说不清，直接不分页。
    const grouped = (props.groups?.length ?? 0) > 0;
    if (pager === undefined || grouped)
        return tableShell('dshpc-table--plain', props);
    const pageSize = Math.max(1, Math.floor(pager.pageSize ?? 10));
    const allRows = props.rows ?? [];
    // total 不给 = 本地分页（全量 rows 自己切）；给了 = 服务端分页（rows 已是当前页，不再切）。
    const local = pager.total === undefined;
    const total = local ? allRows.length : Math.max(0, Math.floor(pager.total ?? 0));
    const page = clampPage(pager.page, pageCountOf(total, pageSize));
    const rows = local ? allRows.slice((page - 1) * pageSize, page * pageSize) : allRows;
    return h('div', { className: 'dshpc-table-frame' }, tableShell('dshpc-table--plain', { ...props, rows }), h(Pagination, { ...pager, page, total, align: pager.align ?? 'right' }));
}
//# sourceMappingURL=Table.js.map