import { createElement as h } from 'react';
import { t } from '../utils/i18n.js';
import { ensureComponentStyles } from './css.js';
import { PAGINATION_CSS } from './controls-css.js';
import { Picker } from './Picker.js';
import { Button } from './Button.js';
import { Chevron } from './chevron.js';
import { clampPage, pageCountOf, pageItems, pageRange, } from './pagination-logic.js';
/**
 * 分页（`‹ Previous  1 [2] 3 … 36  Next ›`）。
 *
 * 受控组件：页码由调用方持有，这里只发 `onChange(page, pageSize)`。
 * 样式只 import 自己那份 CSS（`PAGINATION_CSS`），引它就只打包这一份。
 */
export function Pagination(props) {
    ensureComponentStyles('pagination', PAGINATION_CSS);
    const tt = props.translate ?? t;
    const pageSize = Math.max(1, Math.floor(props.pageSize ?? 10));
    const total = Math.max(0, Math.floor(props.total));
    const count = pageCountOf(total, pageSize);
    const page = clampPage(props.page, count);
    if (props.hideOnSinglePage === true && count <= 1)
        return null;
    const disabled = props.disabled === true;
    const [from, to] = pageRange(page, pageSize, total);
    const go = (next) => {
        if (disabled)
            return;
        const target = clampPage(next, count);
        if (target !== page)
            props.onChange(target, pageSize);
    };
    const navClass = [
        'dshpc-pagination',
        `dshpc-pagination--${props.align ?? 'right'}`,
        props.simple === true ? 'dshpc-pagination--simple' : '',
        props.className ?? '',
    ]
        .filter((s) => s !== '')
        .join(' ');
    const totalNode = (() => {
        const showTotal = props.showTotal;
        if (showTotal === undefined || showTotal === false)
            return null;
        if (typeof showTotal === 'function')
            return showTotal(total, from, to);
        return total === 0
            ? tt('paginationTotalZero')
            : tt('paginationTotal', { from, to, total });
    })();
    // 页码 / 上下页一律用核心 Button（ghost 档；当前页用 info = business 实心蓝），
    // 箭头用全站唯一的 Chevron —— 不在分页里另写一套按钮外观与字形箭头。
    const pageButton = (n) => h(Button, {
        key: n,
        variant: n === page ? 'info' : 'ghost',
        size: 'md',
        className: 'dshpc-pagination__page',
        'aria-current': n === page ? 'page' : undefined,
        'aria-label': tt('paginationPage', { n }),
        disabled,
        onClick: () => go(n),
    }, n);
    const navButton = (direction) => {
        const isPrev = direction === 'prev';
        const label = isPrev ? tt('paginationPrev') : tt('paginationNext');
        return h(Button, {
            variant: 'ghost',
            size: 'md',
            className: 'dshpc-pagination__nav',
            icon: isPrev ? h(Chevron, { dir: 'left', size: 14 }) : undefined,
            iconRight: isPrev ? undefined : h(Chevron, { dir: 'right', size: 14 }),
            'aria-label': label,
            disabled: disabled || (isPrev ? page <= 1 : page >= count),
            onClick: () => go(isPrev ? page - 1 : page + 1),
        }, h('span', { className: 'dshpc-pagination__text' }, label));
    };
    const middle = props.simple === true
        ? [h('span', { key: 'simple', className: 'dshpc-pagination__simple' }, `${String(page)} / ${String(count)}`)]
        : pageItems(page, count, props.siblingCount, props.boundaryCount).map((item, index) => item === 'gap'
            ? h('span', { key: `gap-${String(index)}`, className: 'dshpc-pagination__ellipsis', 'aria-hidden': 'true' }, '…')
            : pageButton(item));
    // 每页条数下拉不再手搓原生 select（浏览器默认箭头与全站 Chevron 不一致）——直接用核心 Picker。
    const options = props.pageSizeOptions ?? [];
    const sizeNode = options.length === 0
        ? null
        : h(Picker, {
            className: 'dshpc-pagination__size',
            minWidth: 'auto',
            mode: 'single',
            options: options.map((size) => ({
                value: String(size),
                label: tt('paginationPageSizeOption', { n: size }),
            })),
            value: String(pageSize),
            disabled,
            ariaLabel: tt('paginationPageSizeAria'),
            onChange: (value) => {
                const next = Number(value);
                if (!Number.isFinite(next) || next < 1)
                    return;
                props.onChange(1, next);
            },
        });
    return h('nav', {
        className: navClass,
        style: props.style,
        'aria-label': props.ariaLabel ?? tt('paginationAria'),
    }, totalNode === null ? null : h('span', { className: 'dshpc-pagination__total' }, totalNode), h('div', { className: 'dshpc-pagination__pages' }, navButton('prev'), ...middle, navButton('next')), sizeNode);
}
//# sourceMappingURL=Pagination.js.map