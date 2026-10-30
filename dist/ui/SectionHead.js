/**
 * 模块标题行（UI 基础层）：**标签（可选，画出来的短竖线）/ icon（可选）+ 标题 + 右侧控件**。
 *
 * 2026-10-08 设置页重构时定型：每块 = 标题行 + 一块内容，标题行左侧 icon、右侧留给该块的控件
 * （日志块的自动刷新 / 刷新钮，表查询块的表切换）。此前三个块各写一个 `h3`，形态不统一。
 * 2026-10-30 增加 `accent`：标题前画一条固定样式的短竖线（4px 圆头），颜色可换、可关；
 * 通栏表格标题也复用这一份标题样式（不再在 Table 里另画）。
 *
 * 排版规则：字号 / 行高 / 字色走 `--dshpc-*` token；`right` 用 `flex:1` + `justifyContent:flex-end`
 * 靠右（比 `marginLeft:auto` 稳：内容再宽也始终贴右，不会塌成靠左）；标题 `flex:none` 不被压缩。
 */
import { createElement as h } from 'react';
import { ensureComponentStyles } from './css.js';
import { SECTION_HEAD_CSS } from './controls-css.js';
/** 内置色名与 token 一一同名；其余值一律按 CSS 色值原样落地。 */
const ACCENT_TONES = [
    'business', 'success', 'warning', 'danger',
    'purple', 'pink', 'cyan', 'teal', 'orange', 'indigo', 'rose', 'slate',
];
function barStyleOf(accent) {
    if (accent === 'default')
        return undefined;
    return { background: ACCENT_TONES.includes(accent) ? `var(--dshpc-${accent})` : accent };
}
export function SectionHead(props) {
    ensureComponentStyles('section-head', SECTION_HEAD_CSS);
    const accent = props.accent;
    const className = [
        'dshpc-section-head',
        props.flush === true ? 'dshpc-section-head--flush' : '',
        props.className ?? '',
    ]
        .filter((s) => s !== '')
        .join(' ');
    return h('div', { className, style: props.style }, accent === false || accent === undefined
        ? null
        : h('span', {
            className: 'dshpc-section-head__bar',
            'aria-hidden': 'true',
            style: accent === 'default' ? undefined : barStyleOf(accent),
        }), props.icon === undefined ? null : h('span', { className: 'dshpc-section-head__icon' }, props.icon), h('span', { className: 'dshpc-section-head__title' }, props.title), props.right === undefined
        ? null
        : h('div', { className: 'dshpc-section-head__right' }, props.right));
}
//# sourceMappingURL=SectionHead.js.map