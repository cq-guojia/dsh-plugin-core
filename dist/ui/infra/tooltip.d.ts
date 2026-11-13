/**
 * 官方 Tooltip 的注入位 —— 本文件不 import 官方包（全仓只有 `ui/official.ts` 能静态 import），
 * 但「问号提示」的气泡必须和官方悬停提示**用同一个**。
 *
 * 解法 = 依赖注入：插件启动时调一次 {@link setTooltipRenderer}，把官方 Tooltip 交给 core；
 * FieldHint 有 renderer 就交给它渲染官方气泡本体。宿主内 renderer 恒被注入（demo 与各插件
 * 启动时各做一次）；没注入的环境（node 自检、非宿主预览）**只画 `?` 图标、不画气泡** ——
 * 官方组件缺失不做自绘兜底。
 */
import type { ReactElement } from 'react';
/** 传给注入 renderer 的参数：与官方 Tooltip 的 props 同名同义，注入方可以直接展开透传。 */
export interface TooltipRenderProps {
    /** 气泡文本。文本里的 `\n` 是真实换行（官方气泡 white-space: pre-line）。 */
    label: string;
    /** 气泡方位（官方只有上 / 下 / 右，没有左）。默认 top。 */
    side?: 'top' | 'bottom' | 'right';
    /** 上 / 下气泡的水平对齐；官方仅 center | end。 */
    align?: 'center' | 'end';
    /** 气泡宽度上限（px），长文本靠它折行。 */
    maxWidth?: number;
    /** 锚点元素：必须是能挂 ref 的真实 DOM 元素（官方往子元素挂 ref，函数组件挂不上）。 */
    children: ReactElement;
}
/** 注入方签名：`h(OfficialTooltip, props)` 的薄包装。 */
export type TooltipRenderer = (props: TooltipRenderProps) => ReactElement;
/** 注入官方 Tooltip（插件启动时调一次；传 undefined 撤销，FieldHint 回到只画图标）。 */
export declare function setTooltipRenderer(fn: TooltipRenderer | undefined): void;
/** 当前注入的 renderer；未注入返回 undefined（FieldHint 据此只画图标）。 */
export declare function getTooltipRenderer(): TooltipRenderer | undefined;
//# sourceMappingURL=tooltip.d.ts.map