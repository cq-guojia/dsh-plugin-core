/**
 * 按钮 / 图标钮 —— **全站唯一实现**（L2 组件皮肤，P2）
 *
 * 三轴模型：
 *  - `variant`：外观档（形态 + 语义色），共 10 档
 *      primary（黑实心）/ secondary（灰实心）/ outline（描边）/ ghost（无底无边）
 *      danger（红实心）/ success（绿实心）/ warning（黄实心）/ info（蓝实心）
 *      danger-outline（红字描边）/ link（行内链接）
 *  - `size`：`sm`(24) / `md`(28) / `lg`(32) —— 高度一律吃 `--dshpc-control-h-*`，
 *    **有边 / 无边同高**（边框在内部补回）
 *  - `block`：撑满父宽
 *
 * 内容轴：`icon`（前置）/ `iconRight`（后置）/ `loading`（前置小圈并自动禁用）。
 * 颜色轴：任一档都可以再用 `color` 传任意 CSS 色值 —— 只覆盖 `--btn-*` 几个变量，
 * 不新增皮肤（皮肤仍只在 `controls-css.ts` 里）。
 *
 * `IconButton` 是纯图标钮：`plain`（默认无底无边，hover 起灰底）/ `outline`（描边）/ `danger`（红）。
 * 兼容别名：`danger-ink` 仍是 `danger-outline` 的旧类名，可直接挂 className。
 *
 * ⚠️ 不许在任何使用点就地写按钮样式；要多一档外观 ⇒ 改基础层（一处改全站生效）。
 */
import { ensureControls } from './css.js';
import { createElement as h } from 'react';
/** 实心档（color 参数按「底色」处理；其余档按「字色 + 描边色」处理）。 */
const SOLID_VARIANTS = ['primary', 'secondary', 'danger', 'success', 'warning', 'info'];
/** 把自定义颜色翻译成 5 个局部变量（只覆盖 token，不新增皮肤）。 */
function colorVars(variant, color) {
    if (color === undefined || color === '')
        return undefined;
    if (SOLID_VARIANTS.includes(variant)) {
        return {
            '--btn-bg': color,
            // 亮色主题下 --dshpc-fg 是黑 ⇒ 压深；暗色下是白 ⇒ 提亮。两边都能明确看出变化。
            '--btn-bg-hover': `color-mix(in srgb, ${color} 82%, var(--dshpc-fg))`,
            '--btn-bg-active': `color-mix(in srgb, ${color} 70%, var(--dshpc-fg))`,
        };
    }
    return {
        '--btn-fg': color,
        '--btn-fg-hover': color,
        '--btn-border': color,
        '--btn-bg-hover': `color-mix(in srgb, ${color} 12%, transparent)`,
        '--btn-bg-active': `color-mix(in srgb, ${color} 18%, transparent)`,
    };
}
/** 组装按钮 class（结构一套 + 轴类）。 */
function buttonClass(variant, size, block, extra) {
    return `dshpc-btn dshpc-btn--${variant} dshpc-btn--${size}`
        + `${block ? ' dshpc-btn--block' : ''}`
        + `${extra !== undefined && extra !== '' ? ` ${extra}` : ''}`;
}
/**
 * 渲染一个「图标 + 文案」按钮。
 *
 * @param props 见 {@link ButtonProps}。
 * @returns 按钮元素。
 */
export function Button(props) {
    ensureControls();
    const { variant = 'outline', size = 'lg', icon, iconRight, color, loading = false, block = false, className, style, children, ...rest } = props;
    const attrs = {
        ...rest,
        type: rest.type ?? 'button',
        disabled: rest.disabled === true || loading,
        className: buttonClass(variant, size, block, className),
        style: { ...colorVars(variant, color), ...style },
    };
    return h('button', attrs, loading
        ? h('span', { className: 'dshpc-btn__spinner', 'aria-hidden': true })
        : icon !== undefined && icon !== null
            ? h('span', { className: 'dshpc-btn__icon' }, icon)
            : null, children, iconRight !== undefined && iconRight !== null
        ? h('span', { className: 'dshpc-btn__icon-end' }, iconRight)
        : null);
}
/**
 * 渲染一个纯图标按钮。
 *
 * @param props 见 {@link IconButtonProps}。
 * @returns 图标按钮元素。
 */
export function IconButton(props) {
    ensureControls();
    const { variant = 'plain', size = 'lg', icon, label, className, style, ...rest } = props;
    const attrs = {
        ...rest,
        type: rest.type ?? 'button',
        title: rest.title ?? label,
        'aria-label': rest['aria-label'] ?? label,
        className: `dshpc-iconbtn dshpc-iconbtn--${variant} dshpc-iconbtn--${size}${className !== undefined && className !== '' ? ` ${className}` : ''}`,
        style,
    };
    return h('button', attrs, icon);
}
//# sourceMappingURL=Button.js.map