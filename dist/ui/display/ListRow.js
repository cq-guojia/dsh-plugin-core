import { createElement as h } from 'react';
import { ensureComponentStyles } from '../infra/css.js';
import { SURFACE_CSS } from './surface-css.js';
import { surfaceClass } from './Surface.js';
import { LIST_ROW_CSS } from './list-row-css.js';
/**
 * 一行一条的列表条目：常态带底、整行可点、右侧挂一组小操作。
 *
 * 外框（底 / 边 / 圆角 / 内距）复用 `Surface`，颜色全走 token；本控件只补
 * 「行」独有的：高度档、两槽布局、行级 hover、选中态。
 *
 * 整行刻意**不渲染成 `<button>`**：调用方要在里面放 Button / IconButton，
 * 嵌 button 是非法 HTML。改用 `div[role=button] + tabIndex + Enter/Space`，
 * 与 `src/adv/explorer/landing.ts` 的既有口径一致。
 *
 * ```tsx
 * h(ListRow, {
 *   onClick: () => open(file),
 *   selected: file.path === current,
 *   actions: h(IconButton, { size: 'sm', icon: ..., label: '移除', onClick: () => remove(file) }),
 * }, h('span', null, file.name))
 * ```
 */
export function ListRow(props) {
    // Surface 是外框契约；两份 CSS 都按需注入、幂等（与 Card.ts 同款）。
    ensureComponentStyles('surface', SURFACE_CSS);
    ensureComponentStyles('list-row', LIST_ROW_CSS);
    const { children, actions, onClick, selected = false, bordered = false, hoverable, className, style, } = props;
    const interactive = onClick !== undefined;
    const hover = hoverable ?? interactive;
    const classes = [
        surfaceClass({
            tone: 'sunken',
            padding: null,
            border: bordered ? true : 'none',
        }),
        'dshpc-listrow',
        interactive ? 'dshpc-listrow--interactive' : '',
        hover ? 'dshpc-listrow--hoverable' : '',
        selected ? 'dshpc-listrow--selected' : '',
        className ?? '',
    ].filter((name) => name !== '').join(' ');
    const onKeyDown = interactive
        ? (event) => {
            // 右侧小按钮的 Enter/Space 会冒泡到行；只认行自己为事件源，避免连带触发。
            if (event.target !== event.currentTarget)
                return;
            if (event.key !== 'Enter' && event.key !== ' ')
                return;
            event.preventDefault();
            onClick?.();
        }
        : undefined;
    return h('div', {
        className: classes,
        style,
        role: interactive ? 'button' : undefined,
        tabIndex: interactive ? 0 : undefined,
        'aria-pressed': interactive && selected ? true : undefined,
        onClick: interactive ? onClick : undefined,
        onKeyDown,
    }, h('div', { className: 'dshpc-listrow__main' }, children ?? null), actions === undefined
        ? null
        : h('div', {
            className: 'dshpc-listrow__actions',
            onClick: (event) => { event.stopPropagation(); },
        }, actions));
}
//# sourceMappingURL=ListRow.js.map