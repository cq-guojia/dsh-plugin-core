/**
 * Loader —— 统一的加载动画图标（UI 基础层 · 反馈族）。
 *
 * 一句话边界：**只画图标本身**。没有背景、没有内距、没有圆角、没有定位。
 * 要圆角底就外面套 `Chip` / `Card`，要浮在屏幕上就自己包一层 fixed 容器 ——
 * 背景与位置属于调用方，不属于这个控件。
 *
 * 两轴正交（不是两个组件，也不是 N×M 份样式）：
 * - `variant`：`ring` 开口弧旋转（默认）/ `blocks` 三块脉动
 * - `size`：`xs` 12 / `sm` 16 / `md` 24（默认）/ `lg` 32 / `xl` 48
 *
 * 几何统一画在 `viewBox="0 0 24 24"` 里，尺寸档只改 `width` / `height` ⇒ 等比缩放，
 * 描边与方块的视觉重量在各档一致（12px 下描边 1.5px，48px 下 6px）。
 *
 * 颜色：全程 `currentColor`，自动跟随所在按钮 / 标签的文字色，不给 color 轴
 * （要换色在调用点给 `style={{ color }}` 即可，不必新增参数）。
 *
 * 无障碍：默认 `aria-hidden`（图标本身是装饰，语义由所在按钮的文字 / 卡片的
 * `role="status"` 承担）；要让它自己承担语义时传 `label`，此时输出 `role="status"`。
 *
 * 扩展新形态：在 `LoaderVariant` 加一个值 + 本文件加一支几何 + `loader.css` 加一段规则，
 * 不新增导出（形态由数据决定时直接传字符串即可，见 docs/help/ui.md）。
 */
import { createElement as h } from 'react';
import { ensureComponentStyles } from './css.js';
import { LOADER_CSS } from './controls-css.js';
/** 形态一：约 265° 的开口弧（周长 59.7，画 44 的空缺留 15.7）。 */
function ringNode() {
    return h('circle', {
        cx: 12,
        cy: 12,
        r: 9.5,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 3,
        strokeLinecap: 'round',
        strokeDasharray: '44 15.7',
    });
}
/**
 * 形态二：三个圆角短条，横向三等分。
 * 每个 7.2×6.0 —— 正方形在 24px 档看着像「方点」，用户 2026-10-30 指出太丑。
 * 间隔 0.6，左右各留 0.6；三块总宽 22.8，垂直居中于 24 高。
 */
function blockNodes() {
    const cells = [0, 1, 2];
    return cells.map((i) => h('rect', {
        key: i,
        className: 'dshpc-loader__node',
        x: 0.6 + i * 7.8,
        y: 9,
        width: 7.2,
        height: 6,
        rx: 1.5,
        fill: 'currentColor',
    }));
}
/**
 * 渲染一个加载动画图标。
 *
 * @param props 见 {@link LoaderProps}。
 * @returns `<svg>` 元素（inline，不占额外行高）。
 */
export function Loader(props) {
    ensureComponentStyles('loader', LOADER_CSS);
    const { variant = 'ring', size = 'md', label, className } = props;
    const classes = ['dshpc-loader', `dshpc-loader--${variant}`, `dshpc-loader--${size}`];
    if (className !== undefined && className !== '')
        classes.push(className);
    return h('svg', {
        className: classes.join(' '),
        viewBox: '0 0 24 24',
        role: label === undefined ? undefined : 'status',
        'aria-label': label,
        'aria-hidden': label === undefined ? true : undefined,
        focusable: 'false',
    }, variant === 'ring' ? ringNode() : blockNodes());
}
//# sourceMappingURL=Loader.js.map