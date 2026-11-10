import { createElement as h, type ReactNode } from 'react';
import { type Translate } from '../../utils/i18n.js';
import { type PickerSize } from './Picker.js';
import { type PickerGroup, type PickerSizing } from './picker-logic.js';
/**
 * 选择模型的三种形态（消费者自选）：
 * - `grouped`（分组，默认）：一个下拉，供应商做组头、模型列在下面。
 * - `flat`（平铺）：一个下拉，所有模型平铺成「厂商-模型」，不分组，搜厂商名即可筛。
 * - `cascade`（联动）：两个下拉，先选供应商、模型列表跟着筛；两个框都带搜索。
 *
 * **返回口径一致**：`onChange` 一律发最终模型值（`${provider}/${id}`）；级联态换供应商先发 `''`。
 * 选「默认模型」也发 `''` —— 表示没选，调用方自己处理。
 *
 * **数据自带**：不传 `groups` 就读 `connectHost(ctx, { modelsPath })` 喂进的真实目录。
 * **宽度**：`width` / `minWidth` / `maxWidth` 管整个控件的占位宽度（三种形态通用，触发器自动铺满）；
 * `searchSizing` 管所有搜索框；cascade 的两个框另可分别用 `providerSizing` / `modelSizing` 覆盖。
 */
export type ModelPickerVariant = 'grouped' | 'flat' | 'cascade';
export interface ModelPickerProps extends PickerSizing {
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
    /** 下拉内搜索框（默认开；要关传 false）。三种形态、cascade 两个框一起生效。 */
    searchable?: boolean;
    size?: PickerSize;
    placement?: 'down' | 'up';
    /** 组件根元素的类名：grouped / flat 落在 Picker 根，cascade 落在两框外层 row。 */
    className?: string;
    /** cascade 外层 row 的附加类名（与 className 叠加，单独定制布局用）。 */
    rowClassName?: string;
    /** cascade 厂商框的类名。 */
    providerClassName?: string;
    /** cascade 模型框的类名。 */
    modelClassName?: string;
    /** 下拉内搜索框的宽度三轴（所有形态共用）；不传沿用 CSS 的 100% 铺满。 */
    searchSizing?: PickerSizing;
    /** cascade：厂商框单独宽度；不传跟随 width / minWidth / maxWidth。 */
    providerSizing?: PickerSizing;
    /** cascade：模型框单独宽度；不传跟随 width / minWidth / maxWidth。 */
    modelSizing?: PickerSizing;
    translate?: Translate;
}
export declare function ModelPicker(props: ModelPickerProps): ReturnType<typeof h>;
//# sourceMappingURL=ModelPicker.d.ts.map