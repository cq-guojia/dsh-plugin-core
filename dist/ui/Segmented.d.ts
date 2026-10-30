/**
 * 分段控件（滑动块）—— **全站唯一实现**（L2 组件皮肤，P1）
 *
 * 它是「同一份结构 + 两个受控轴」的样板：
 *  - `size`：`sm`(24) / `md`(28) / `lg`(32) —— **离散三档**，调用点**不许**自己写高度
 *    （真不够用才允许在调用点本地覆盖 `--dshpc-control-h-*`，属例外而非常态）；
 *  - `bordered`（默认 false）：最外再包一圈 1px 描边；总高与无框版逐像素一致
 *    （border 由 padding 抵消），两种模式整行混排不跳高。
 *
 * 外观只有一套（灰底轨道 + 白色选中片，阴影来自宿主 elevation token）。
 * 唯一的配色入口是 `tone`（2026-10-29）：传内置色名则由核心定底 / 字（两主题各自成立），
 * 传 `{ bg, fg }` 则两个主题都用调用方这一对颜色。
 * 2026-10-26 删掉 `variant` 轴（原 default / inset 两档在 CSS 里只差 1px 内距，
 * 且 default 比 `size` 承诺矮 2px，下游照 demo 对图时反复查不出原因 —— 见 docs/design/style.md）。
 *
 * 用法：
 *   // 单选
 *   h(Segmented<'a' | 'b'>, { value: v, size: 'md', items: [{ value: 'a', label: '甲' }], onChange: setV })
 *   // 多选（如星期）
 *   h(Segmented<'1' | '2'>, { multiple: true, value: vs, items: [...], onChange: setVs })
 *
 * ⚠️ 不许在任何使用点就地写分段样式；要多一档高度 / 多一个外观 ⇒ 走
 * docs/design/ui-style-guide.md §五 的流程（改基础层，一处改全站生效）。
 */
import type { ChipTone } from './Chip.js';
import { createElement as h, type CSSProperties } from 'react';
/** 一段（一个可选值）。 */
export interface SegmentedItem<T extends string = string> {
    /** 该段代表的值（唯一）。 */
    value: T;
    /** 段内文字。 */
    label: string;
    /** 段内角标（如「异常 3」）；数字 ≤0 视为没东西可数、不显示，字符串原样显示（如 `'99+'`）。danger 红圆标。 */
    badge?: number | string;
    /** 段内中性计数（如筛选条「全部 11」）；口径同 badge，字符串照样显示（如 `'1K'`）。弱化灰字，不做角标。 */
    count?: number | string;
    /** 置灰不可点。 */
    disabled?: boolean;
    /** 段级悬停提示（核心 Tooltip 本体，官方气泡）：鼠标移入该项浮出书面化说明；需宿主注入 renderer。 */
    tooltip?: string;
}
/**
 * 选中片配色（默认 = 主题亮片，字跟主题走）：
 *  - 内置色名（与 Chip 同一套）：底色 / 字色由核心定，深浅两个主题各自成立；
 *  - `{ bg, fg }`：一组背景 + 一组文字，**两个主题都一样**（调用方自己负责对比度）。
 */
export type SegmentedTone = Exclude<ChipTone, 'neutral'> | {
    bg: string;
    fg: string;
};
interface SegmentedBaseProps<T extends string = string> {
    /** 段定义。 */
    items: readonly SegmentedItem<T>[];
    /** 高度档（默认 lg = 32 标准行）。 */
    size?: 'sm' | 'md' | 'lg';
    /** 撑满父宽、各段等分。 */
    block?: boolean;
    /** 最外层 1px 描边框（默认 false）。总高与无框版逐像素一致。 */
    bordered?: boolean;
    /** 选中片配色（默认主题亮片）。见 {@link SegmentedTone}。 */
    tone?: SegmentedTone;
    /** 无障碍组名（读屏用）。 */
    label?: string;
    /** 根节点 id（锚点 / 自动化测试用）。 */
    id?: string;
    /** 追加到根节点的 class（只允许补布局，不许覆盖皮肤）。 */
    className?: string;
    /** 整组禁用（表单只读态用）。 */
    disabled?: boolean;
    /** 外层追加样式（只允许补布局，不许覆盖皮肤）。 */
    style?: CSSProperties;
}
export interface SegmentedSingleProps<T extends string = string> extends SegmentedBaseProps<T> {
    multiple?: false;
    /** 当前选中值。 */
    value: T;
    onChange: (value: T) => void;
}
export interface SegmentedMultiProps<T extends string = string> extends SegmentedBaseProps<T> {
    /** 多选模式（如星期）。 */
    multiple: true;
    /** 当前选中值集合。 */
    value: T[];
    onChange: (value: T[]) => void;
}
export type SegmentedProps<T extends string = string> = SegmentedSingleProps<T> | SegmentedMultiProps<T>;
/**
 * 渲染一个分段控件（单选 / 多选同体）。
 *
 * @param props 见 {@link SegmentedProps}。
 * @returns 分段控件元素。
 */
export declare function Segmented<T extends string>(props: SegmentedProps<T>): ReturnType<typeof h>;
export {};
//# sourceMappingURL=Segmented.d.ts.map