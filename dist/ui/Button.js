/**
 * 按钮 / 图标钮 —— **全站唯一实现**（L2 组件皮肤，P2）
 *
 * 两轴模型（同 Segmented）：
 *  - `variant`：`primary`（实心强调）/ `outline`（描边中性）/ `ghost`（无底无边）/ `danger`（实心红，破坏性确认）
 *  - `size`：`sm`(24) / `md`(28) / `lg`(32) —— 高度一律吃 `--dshpc-control-h-*`，**有边 / 无边同高**（边框在内部补回）
 *
 * `IconButton` 是纯图标钮：`plain`（默认无底无边，hover 起灰底）/ `outline`（描边）/ `danger`（红）。
 * 链接型文字钮 = `Button variant="ghost"` + 修饰类 `dshpc-btn--link`（红字危险描边 = `outline` + `dshpc-btn--danger-ink`）。
 *
 * ⚠️ 不许在任何使用点就地写按钮样式；要多一档外观 ⇒ 走
 * docs/design/ui-style-guide.md §五 的流程（改基础层，一处改全站生效）。
 */
import { ensureControls } from './css.js';
import { createElement as h } from 'react';
/** 组装按钮 class（结构一套 + 轴类）。 */
function buttonClass(variant, size, extra) {
    return `dshpc-btn dshpc-btn--${variant} dshpc-btn--${size}${extra !== undefined && extra !== '' ? ` ${extra}` : ''}`;
}
/**
 * 渲染一个文字 / 图标 + 文字按钮。
 *
 * @param props 见 {@link ButtonProps}。
 * @returns 按钮元素。
 */
export function Button(props) {
    ensureControls();
    const { variant = 'outline', size = 'lg', icon, className, style, children, ...rest } = props;
    const attrs = {
        ...rest,
        type: rest.type ?? 'button',
        className: buttonClass(variant, size, className),
        style,
    };
    return h('button', attrs, icon !== undefined && icon !== null ? h('span', { className: 'dshpc-btn__icon' }, icon) : null, children);
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