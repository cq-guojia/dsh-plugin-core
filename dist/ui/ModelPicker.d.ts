import { createElement as h, type ReactNode } from 'react';
import { type Translate } from '../utils/i18n.js';
import { type PickerSize } from './Picker.js';
import { type PickerGroup } from './picker-logic.js';
/**
 * 模型选择器的两种形态（消费者自选）：
 * - `grouped`（分组，默认）：**一个下拉、完全独立**，供应商做组头、模型列在下面，不与任何东西联动。
 * - `cascade`（联动）：**两个下拉、彼此联动** —— 先选供应商，后面模型列表跟着筛；
 *   换供应商会清空已选模型（旧模型不属于新供应商）。
 *
 * **返回口径一致**：`onChange` 一律发最终模型值（`${provider}/${id}`）；级联态换供应商先发 `''`。
 * 选「默认模型」也发 `''` —— 表示没选，调用方自己处理。
 *
 * **数据自带**：不传 `groups` 就读 `connectHost(ctx, { modelsPath })` 喂进的真实目录。
 */
export type ModelPickerVariant = 'grouped' | 'cascade';
export interface ModelPickerProps {
    /** 覆盖内置目录（一般不用；测试或特殊数据源时才传）。 */
    groups?: PickerGroup[];
    variant?: ModelPickerVariant;
    /** 最终模型值；`''` = 默认模型（没选）。 */
    value?: string;
    /** 非受控初始值。 */
    defaultValue?: string;
    onChange?: (value: string) => void;
    /** 是否提供「默认模型」选项（默认提供；不需要就传 false）。 */
    allowDefault?: boolean;
    /** 「默认模型」的文案（默认取内置字典）。 */
    defaultLabel?: string;
    /** 未选时的文字（默认「模型」）。 */
    placeholder?: string;
    /** 触发器前置图标：不传 = 默认星形；传 `null` = 不显示；传元素 = 自定义。 */
    icon?: ReactNode | null;
    /** 问号提示文字（传了才显示）。 */
    hint?: string;
    /** 目录不可用时的如实提示（不传则由目录状态决定）。 */
    degraded?: boolean;
    disabled?: boolean;
    clearable?: boolean;
    /** 下拉内搜索框（默认开；要关传 false）。 */
    searchable?: boolean;
    size?: PickerSize;
    placement?: 'down' | 'up';
    className?: string;
    translate?: Translate;
}
export declare function ModelPicker(props: ModelPickerProps): ReturnType<typeof h>;
//# sourceMappingURL=ModelPicker.d.ts.map