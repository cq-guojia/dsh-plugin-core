import type { ReactNode } from 'react';
export interface PickerOption {
    value: string;
    label: string;
    /** 选项文字前的图标（任意 ReactNode；不传就没有这一段）。 */
    icon?: ReactNode;
    disabled?: boolean;
}
/** 一组选项（模型选择里 group 就是 provider）。 */
export interface PickerGroup {
    value: string;
    label: string;
    options: PickerOption[];
}
/** 两种输入归一成 groups：给了 `options` 就当成一个无标题的组。 */
export declare function toGroups(groups: PickerGroup[] | undefined, options: PickerOption[] | undefined): PickerGroup[];
export declare function flattenOptions(groups: PickerGroup[]): PickerOption[];
/** 按关键词过滤（大小写不敏感，匹配 label；整组无命中则整组去掉）。 */
export declare function filterGroups(groups: PickerGroup[], query: string): PickerGroup[];
/** 多选切换；`max` 达到上限时不再添加（返回原数组，不静默截断）。 */
export declare function toggleValue(current: readonly string[], value: string, max?: number): string[];
export declare function labelsOf(groups: PickerGroup[], values: readonly string[]): string[];
/** 值落在哪个组里（按模型值反推供应商等场景）。 */
export declare function groupOf(groups: PickerGroup[], value: string): PickerGroup | undefined;
//# sourceMappingURL=picker-logic.d.ts.map