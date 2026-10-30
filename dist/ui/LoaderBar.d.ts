/**
 * LoaderBar —— 胶囊不定进度 loading（Loader 家族成员）。
 *
 * 图形来源：设计出的「轨道 + 蓝色段 + 斜纹」胶囊条。动画是**不定进度**语义：
 * 蓝色那半截**固定不动**，只有它上面的一道道细斜纹单向流动（0.55 秒走一个条纹周期），
 * 看着像条纹在转，不表示任何百分比。要「确定进度」别改这个控件 —— 它是固定加载态，
 * 不是进度条 API。
 *
 * 尺寸轴按**高度**给（宽固定 4:1）：图形本身是横条，套方形的尺寸轴没意义。
 *
 * 实现要点：外层 `<g clip-path>` 静止、只让内层的蓝色段动。若把 `clip-path` 与
 * `transform` 放在同一层，裁剪框会跟着平移，等于没裁，蓝段会跑出胶囊外。
 * clipPath 的 id 由 `useId` 生成（同一页面可能有多个实例，写死 id 会互相抢）。
 *
 * 边界同 `Loader`：不带背景、不带内距、不带定位。
 *
 * ⚠️ 图形数据在 `loader-bar-art.ts`（源 SVG 一次性转录），别手改坐标。
 */
import { createElement as h } from 'react';
import type { LoaderSize } from './Loader.js';
export interface LoaderBarProps {
    /** 尺寸档（按高度），默认 `md`（96×24）。 */
    size?: LoaderSize;
    /** 是否播放动画，默认 `true`；`false` 时蓝段停在左侧原位。 */
    animated?: boolean;
    /** 无障碍文案。不传 = 纯装饰（`aria-hidden`）；传了 = `role="status"` 由它播报。 */
    label?: string;
    /** 追加 class（只允许补布局，不许覆盖外观）。 */
    className?: string;
}
/**
 * 渲染胶囊不定进度 loading。
 *
 * @param props 见 {@link LoaderBarProps}。
 * @returns `<svg>` 元素。
 */
export declare function LoaderBar(props: LoaderBarProps): ReturnType<typeof h>;
//# sourceMappingURL=LoaderBar.d.ts.map