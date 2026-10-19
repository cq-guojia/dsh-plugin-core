import { createElement as h, type CSSProperties } from 'react';
/** 一段（一个可选值）。 */
export interface SegmentedItem<T extends string = string> {
    /** 该段代表的值（唯一）。 */
    value: T;
    /** 段内文字。 */
    label: string;
    /** 段内角标数字（如「异常 3」）；`undefined` 或 ≤0 不显示。danger 红圆标。 */
    badge?: number;
    /** 段内中性计数（如筛选条「全部 11」）；`undefined` 或 ≤0 不显示。弱化灰字，不做角标。 */
    count?: number;
    /** 置灰不可点。 */
    disabled?: boolean;
}
interface SegmentedBaseProps<T extends string = string> {
    /** 段定义。 */
    items: readonly SegmentedItem<T>[];
    /** 高度档（默认 lg = 32 标准行）。 */
    size?: 'sm' | 'md' | 'lg';
    /** 外观档（默认 default）。 */
    variant?: 'default' | 'inset';
    /** 撑满父宽、各段等分。 */
    block?: boolean;
    /** 最外层 1px 描边框（默认 false）。选中段变为描边块；总高与无框版逐像素一致。 */
    bordered?: boolean;
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