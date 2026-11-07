import { createElement as h } from 'react';
import { Chevron } from '../infra/chevron.js';
import { t } from '../../utils/i18n.js';
import { ensureComponentStyles } from '../infra/css.js';
import { CARD_CSS } from './card-css.js';
import { SURFACE_CSS } from './surface-css.js';
import { surfaceClass } from './Surface.js';
/** 色条档位（映射到 design 的 token，不新增 token；也接受任意 CSS 颜色值）。 */
export const CARD_ACCENTS = [
    'business', 'success', 'warning', 'danger', 'neutral',
    'purple', 'pink', 'cyan', 'teal', 'orange', 'indigo', 'rose', 'slate',
];
/** 数字按 px 写进 CSS 变量，字符串原样透传。 */
function lengthOf(value) {
    return typeof value === 'number' ? `${value}px` : value;
}
/**
 * 内部共享壳：两个公开组件（`Card` / `StripCard`）只是 `kind` 不同——
 * 一个组件一种外观，import 即表明用的是哪种。
 *
 * 外框（底 / 边框 / 圆角）来自 `Surface`（圆角统一 12）；本壳只管色条几何与头部布局。
 * 两种外观的头部都是**整体垂直居中**（`align-items:center`）：调用方在 `action` 里
 * 裸放一个元素（按钮 / 文字 / 图标）即垂直居中，不用自己套容器；框内一行两行、
 * 右侧放什么、悬停浮出的按钮，都由调用方在框内自定——外壳只提供框与居中。
 */
function CardShell(kind, props) {
    // Surface 是外框契约（圆角统一 12）：先注入它，再注入本皮肤。两份都按需注入、幂等。
    ensureComponentStyles('surface', SURFACE_CSS);
    ensureComponentStyles('card', CARD_CSS);
    const tt = props.translate ?? t;
    const accent = props.accent ?? 'business';
    const isPreset = CARD_ACCENTS.includes(accent);
    const bar = props.bar ?? {};
    // StripCard 固定贴左；Card 默认左侧，可换任意一边。
    const side = kind === 'strip' ? 'left' : bar.side ?? 'left';
    const classes = [
        // strip = 方角 + 透明占位边框；两种外观都**不吃 Surface 的内距**（内距由色条贴边算）。
        surfaceClass(kind === 'strip' ? { radius: 'none', border: 'none', padding: null } : { padding: null }),
        'dshpc-card',
        kind === 'strip' ? 'dshpc-card--strip' : 'dshpc-card--bordered',
        `dshpc-card--bar-${side}`,
        isPreset ? `dshpc-card--${accent}` : '',
        props.hoverable === true ? 'dshpc-card--hoverable' : '',
        props.filled === false ? 'dshpc-card--no-fill' : '',
        props.className ?? '',
    ]
        .filter((s) => s !== '')
        .join(' ');
    // 自定义色与色条几何都走 CSS 变量（档位则用 class 里的 token）
    const vars = {};
    if (!isPreset)
        vars['--card-accent'] = accent;
    if (bar.size !== undefined)
        vars['--card-bar-size'] = lengthOf(bar.size);
    if (bar.inset !== undefined)
        vars['--card-bar-inset'] = lengthOf(bar.inset);
    if (bar.gap !== undefined)
        vars['--card-bar-gap'] = lengthOf(bar.gap);
    if (bar.length !== undefined)
        vars['--card-bar-length'] = lengthOf(bar.length);
    const style = { ...props.style, ...vars };
    return h('div', { className: classes, style }, h('div', { className: 'dshpc-card__body' }, 
    // 色条是 body 的第一个子元素：DOM 顺序恒定，左/上 = 天然在前，右/下靠 order 排到头部之后。
    h('span', { className: 'dshpc-card__bar', 'aria-hidden': true }), h('div', { className: 'dshpc-card__head' }, h('div', { className: 'dshpc-card__main' }, props.children ?? null), props.action === undefined && props.onToggle === undefined
        ? null
        : h('div', { className: 'dshpc-card__side' }, props.action ?? null, props.onToggle === undefined
            ? null
            : h('button', {
                type: 'button',
                className: 'dshpc-card__toggle',
                'aria-label': tt('cardToggle'),
                'aria-expanded': props.expanded === true,
                onClick: props.onToggle,
            }, 
            // 箭头走全站唯一的 Chevron（不再写 ▾ 字形）；旋转由外层 .is-open 承担，动画不变。
            h('span', { className: props.expanded === true ? 'dshpc-card__caret is-open' : 'dshpc-card__caret' }, h(Chevron, { size: 12 })))))), props.panel === undefined || props.expanded !== true
        ? null
        : h('div', { className: 'dshpc-card__panel' }, props.panel));
}
/**
 * 卡片（框式）：复用 `Surface` 外框（surface 底 + 1px 边框 + 圆角 12），
 * 色条默认贴左缘、6px 粗、圆角短条（高度随内容）；`bar.side` 可换成右/上/下。
 * 头部整体垂直居中；悬停浮出的按钮、一行两行由调用方在框内自定。
 *
 * ```tsx
 * h(Card, {
 *   accent: 'warning',
 *   bar: { side: 'right', inset: 10, gap: 8 },
 *   action: h(Button, { size: 'sm', variant: 'ghost' }, '跳过'),
 * }, h('div', null, '标题 + 内容'))
 * ```
 */
export function Card(props) {
    return CardShell('bordered', props);
}
/**
 * 条带卡片（浅底式）：同色系浅底 + 1px 不可见占位边框 + 方角 + 左缘 4px 通高方角色条（贴左缘）。
 * 与 `Card` 同一份 props，头部同样整体垂直居中。
 *
 * ```tsx
 * h(StripCard, {
 *   accent: 'success',
 *   expanded: open, onToggle: () => setOpen(!open),
 *   panel: h('div', null, '展开详情'),
 * }, h('div', null, '标题 + 元信息'))
 * ```
 */
export function StripCard(props) {
    return CardShell('strip', props);
}
//# sourceMappingURL=Card.js.map