import { createElement as h } from 'react';
import { t } from '../utils/i18n.js';
import { ensureComponentStyles } from './css.js';
import { TABLE_BASE_CSS } from './controls-css.js';
import { headerRows, isTableCellSpec, leafColumns, } from './table-logic.js';
function widthOf(width) {
    if (width === undefined)
        return undefined;
    return typeof width === 'number' ? `${width}px` : width;
}
/** 列级水平内距（覆盖 density 档）；不传交给 CSS。 */
function padStyle(column) {
    return column.padding === undefined ? undefined : { paddingInline: `${column.padding}px` };
}
function alignClass(prefix, align) {
    return align === undefined || align === 'left' ? '' : ` ${prefix}--${align}`;
}
/**
 * 某列在叶子序列里的位置决定画不画左竖线：
 * 首列恒不画（那是外框的位置），其余列按 `column.divider`（默认画）。
 */
function dividerAttr(column, leafIndex) {
    if (leafIndex === 0)
        return undefined;
    return column.divider === false ? undefined : 'left';
}
/**
 * 表格共享渲染壳（**内部件，不进公开导出**）。
 *
 * 职责：基础层样式登记 + 语义化 `<table>` 结构 + 表头分组计算 + 行交互 + 列/单元格配置落地。
 * 外观（表头底色 / 分隔线 / 悬浮 / 选中）由调用方的皮肤 CSS 负责：每个公开组件
 * （`Table`、将来的 `TableGrid` / `TableZebra`）只 import 自己那份皮肤，并把自己的
 * modifier class 传进来。这样消费方引哪个就只打包哪个 —— 绝不用 `variant` 汇总多份皮肤。
 */
export function tableShell(skinClass, props) {
    ensureComponentStyles('table-core', TABLE_BASE_CSS);
    const tt = props.translate ?? t;
    const headRows = headerRows(props.columns);
    const leaves = leafColumns(props.columns);
    const leafIndexByKey = new Map();
    leaves.forEach((column, index) => {
        leafIndexByKey.set(column.key, index);
    });
    const selected = new Set(props.selectedKeys ?? []);
    const onRowClick = props.onRowClick;
    const density = props.density ?? 'default';
    const borders = props.borders ?? 'all';
    const tableClass = [
        'dshpc-table',
        skinClass,
        `dshpc-table--density-${density}`,
        `dshpc-table--borders-${borders}`,
        props.striped === true ? 'dshpc-table--striped' : '',
        props.className ?? '',
    ]
        .filter((s) => s !== '')
        .join(' ');
    return h('table', { className: tableClass, style: props.style, 'aria-label': props.ariaLabel }, leaves.length === 0
        ? null
        : h('colgroup', null, ...leaves.map((column) => h('col', {
            key: column.key,
            style: widthOf(column.width) === undefined ? undefined : { width: widthOf(column.width) },
        }))), h('thead', { className: 'dshpc-table__head' }, ...headRows.map((cells, level) => h('tr', { key: `head-${level}`, className: 'dshpc-table__head-row' }, ...cells.map((cell) => {
        const group = cell.colSpan > 1;
        const firstLeafIndex = leafIndexByKey.get(cell.leafKeys[0] ?? '');
        const className = `dshpc-table__head-cell${group ? ' dshpc-table__head-cell--group' : ''}${alignClass('dshpc-table__head-cell', cell.column.align)}`;
        const tone = cell.column.headerTone;
        return h('th', {
            key: cell.column.key,
            scope: group ? 'colgroup' : 'col',
            colSpan: cell.colSpan > 1 ? cell.colSpan : undefined,
            rowSpan: cell.rowSpan > 1 ? cell.rowSpan : undefined,
            className,
            style: padStyle(cell.column),
            'data-divider': firstLeafIndex === undefined ? undefined : dividerAttr(cell.column, firstLeafIndex),
            'data-header-tone': tone === undefined || tone === 'default' ? undefined : tone,
        }, cell.column.title);
    })))), h('tbody', { className: 'dshpc-table__body' }, props.rows.length === 0
        ? h('tr', { className: 'dshpc-table__row' }, h('td', { className: 'dshpc-table__empty', colSpan: leaves.length > 0 ? leaves.length : undefined }, props.emptyText ?? tt('tableEmpty')))
        : props.rows.map((row, index) => h('tr', {
            key: row.key,
            className: 'dshpc-table__row',
            'data-selected': selected.has(row.key) ? 'true' : undefined,
            'data-interactive': onRowClick === undefined ? undefined : 'true',
            tabIndex: onRowClick === undefined ? undefined : 0,
            onClick: onRowClick === undefined ? undefined : () => onRowClick(row, index),
            onKeyDown: onRowClick === undefined
                ? undefined
                : (event) => {
                    if (event.key !== 'Enter' && event.key !== ' ')
                        return;
                    event.preventDefault();
                    onRowClick(row, index);
                },
        }, ...leaves.map((column, leafIndex) => {
            const cell = row.cells[column.key];
            // 缺 key = 该格不渲染（上一行的 rowSpan 已经占了这个位置）；要空格请显式传 null。
            if (cell === undefined)
                return null;
            let spec;
            let content;
            if (isTableCellSpec(cell)) {
                spec = cell;
                content = cell.content;
            }
            else {
                content = cell;
            }
            const align = spec?.align ?? column.align;
            return h('td', {
                key: column.key,
                className: `dshpc-table__cell${alignClass('dshpc-table__cell', align)}`,
                style: padStyle(column),
                colSpan: spec?.colSpan !== undefined && spec.colSpan > 1 ? spec.colSpan : undefined,
                rowSpan: spec?.rowSpan !== undefined && spec.rowSpan > 1 ? spec.rowSpan : undefined,
                'data-divider': dividerAttr(column, leafIndex),
            }, content ?? null);
        })))));
}
//# sourceMappingURL=table-shared.js.map