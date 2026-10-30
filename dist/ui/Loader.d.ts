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
/** 尺寸档：只影响 width / height，几何等比缩放。 */
export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
/** 形态档。 */
export type LoaderVariant = 'ring' | 'blocks';
export interface LoaderProps {
    /** 形态，默认 `ring`。 */
    variant?: LoaderVariant;
    /** 尺寸档，默认 `md`。 */
    size?: LoaderSize;
    /**
     * 无障碍文案。不传 = 纯装饰（`aria-hidden`）；传了 = 输出 `role="status"` 并由它播报。
     * 按钮里、加载卡里这类**旁边已有文字**的场景不要传。
     */
    label?: string;
    /** 追加 class（只允许补布局，不许覆盖外观）。 */
    className?: string;
}
/**
 * 渲染一个加载动画图标。
 *
 * @param props 见 {@link LoaderProps}。
 * @returns `<svg>` 元素（inline，不占额外行高）。
 */
export declare function Loader(props: LoaderProps): ReturnType<typeof h>;
//# sourceMappingURL=Loader.d.ts.map