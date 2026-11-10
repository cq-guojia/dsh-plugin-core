import type { CSSProperties, ReactNode } from 'react';
export interface PickerOption {
    value: string;
    label: string;
    /** 选项文字前的图标（任意 ReactNode；不传就没有这一段）。 */
    icon?: ReactNode;
    /** 只参与搜索、不渲染的额外关键词（调用方自行拼接；如任务 UUID）。 */
    keywords?: string;
    disabled?: boolean;
}
/** 一组选项（模型选择里 group 就是 provider）。 */
export interface PickerGroup {
    value: string;
    label: string;
    options: PickerOption[];
}
/** 宽度三轴（触发器和搜索框共用）：定宽优先，给了 width 就忽略 min/max。 */
export interface PickerSizing {
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
}
/** 两种输入归一成 groups：给了 `options` 就当成一个无标题的组。 */
export declare function toGroups(groups: PickerGroup[] | undefined, options: PickerOption[] | undefined): PickerGroup[];
export declare function flattenOptions(groups: PickerGroup[]): PickerOption[];
/** 分组目录平铺成「厂商-模型」选项：value 原样不动，只给 label 加组名前缀。 */
export declare function toFlatOptions(groups: PickerGroup[]): PickerOption[];
/** 按关键词过滤（大小写不敏感，匹配 label 与 keywords 拼起来的串；整组无命中则整组去掉）。 */
export declare function filterGroups(groups: PickerGroup[], query: string): PickerGroup[];
/** 按选项条数跨组切片（首屏 limit 条）；count <= 0 视为不分页，整组没被截到就复用原对象。 */
export declare function sliceGroups(groups: PickerGroup[], count: number): PickerGroup[];
/** 多选切换；`max` 达到上限时不再添加（返回原数组，不静默截断）。 */
export declare function toggleValue(current: readonly string[], value: string, max?: number): string[];
export declare function labelsOf(groups: PickerGroup[], values: readonly string[]): string[];
/** 值落在哪个组里（按模型值反推供应商等场景）。 */
export declare function groupOf(groups: PickerGroup[], value: string): PickerGroup | undefined;
/**
 * 把「不在候选里的受控值」作为一条真实保留项插回目录（领域选择器用）。
 *
 * 目录刷新 / 供应商被摘掉后，调用方持有的旧值仍然真实存在；通用 `labelsOf` 找不到它就
 * 会让触发器退回 placeholder，级联态还会因反推不出 provider 把模型框禁用 —— 表现为
 * 静默丢掉用户的选择。这里按 `provider/id` 的前缀把旧值归到对应组（没有该组就补一组），
 * label 一律用旧值原文，绝不编造模型名。返回值 `retained` 供 degraded 提示使用。
 *
 * 通用 `Picker` 不调用它：纯零件的数据由调用方给，是否保留旧值由调用方决定。
 */
export declare function retainSelectedValue(groups: PickerGroup[], value: string | undefined): {
    groups: PickerGroup[];
    retained: boolean;
};
/** 触发器宽度解析：把 width / minWidth / maxWidth 译成内联样式。
 * 定宽（width）忽略 min/max 并锁定三值；否则各自生效，缺省沿用 CSS 默认（min 120px、max 100%）。
 * 数值按 px 处理，字符串原样透传。 */
export declare function resolveTriggerSizing(opts: PickerSizing): CSSProperties;
/** 菜单宽度：至少与触发器同宽；搜索框设了下限时菜单跟着加宽，
 * 否则 100% 宽的搜索框会被菜单的 overflow:hidden 裁掉。
 * 8px = .dshpc-picker__head 左右各 4px 内距（改该 CSS 时同步改这里，有自检盯着）。
 * min-width 大于 max-width 时浏览器以 min-width 为准，所以显式设宽不会被 480 上限卡住。 */
export declare function resolveMenuSizing(referenceWidth: number, availableWidth: number | undefined, searchSizing?: PickerSizing): {
    minWidth: string;
    maxWidth: string;
};
//# sourceMappingURL=picker-logic.d.ts.map