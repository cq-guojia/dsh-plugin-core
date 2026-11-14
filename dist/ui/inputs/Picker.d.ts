import { createElement as h, type ReactNode } from 'react';
import { type Translate } from '../../utils/i18n.js';
import { type PickerGroup, type PickerOption, type PickerSizing } from './picker-logic.js';
export type { PickerGroup, PickerOption };
export type PickerSize = 'sm' | 'md' | 'lg';
export interface PickerProps extends PickerSizing {
    /** 分组数据（模型选择里一组 = 一个 provider）。 */
    groups?: PickerGroup[];
    /** 扁平数据的快捷写法；与 `groups` 二选一。 */
    options?: PickerOption[];
    /** 受控值。给了它就是受控；不给就内部管（配 `defaultValue`）。 */
    value?: string | string[];
    /** 非受控模式下的初始值。 */
    defaultValue?: string | string[];
    onChange?: (value: string | string[]) => void;
    mode?: 'single' | 'multiple';
    /** 多选上限；到上限后其余选项置灰并提示（不静默截断）。 */
    max?: number;
    searchable?: boolean;
    /** 首屏最多显示多少条选项（按选项条数跨组计）；每点一次「显示更多」再追加 limit 条，搜索结果同样分页。不传 = 全量。 */
    limit?: number;
    /** 单选时允许「不选」——选项列表顶部多一项清除。 */
    clearable?: boolean;
    placeholder?: string;
    /** 候选可能不完整（宿主没接上服务之类）⇒ 如实告诉用户，不编造。 */
    degraded?: boolean;
    /** 校验不通过：描红（与 Input / Textarea 同口径，只描边框）。 */
    error?: boolean;
    disabled?: boolean;
    size?: PickerSize;
    /** 菜单首选展开方向：靠近视口底部时传 `up`；实际会按可用空间自动翻转（flip）。 */
    placement?: 'down' | 'up';
    /** 选中后是否收起菜单；多选默认**不收起**（方便连续选）。 */
    closeOnSelect?: boolean;
    /** 触发器文字对齐：默认 `left`；`center` 只在确实需要居中的地方显式传（2026-10-20）。 */
    align?: 'left' | 'center';
    /** 多选时是否把已选项列在触发器上（默认列）。 */
    showLabels?: boolean;
    /** 触发器文字前的图标（任意 ReactNode；不传就没有这一段）。 */
    icon?: ReactNode;
    /** 问号提示文字：给了就在触发器后面挂标准 FieldHint（排版收进组件，调用方不再手动拼）。 */
    hint?: string;
    className?: string;
    /** 展开 / 收起回调（领域选择器借它做「打开即补拉目录」这类事）。 */
    onOpenChange?: (open: boolean) => void;
    /** 下拉内搜索框的宽度三轴（与触发器同口径：定宽锁三值）；不传沿用 CSS 的 100% 铺满。 */
    searchSizing?: PickerSizing;
    ariaLabel?: string;
    translate?: Translate;
}
/**
 * 通用选择器：单选 / 多选 / 上限 / 搜索 / 分组 / 空态 / 降级。
 *
 * **纯零件，不自己取数** —— 选项由调用方传入（工作区列表、模型列表这类数据要跨 host↔client
 * 边界，通道是插件私有的，组件取不到，见需求文档 §6）。
 */
export declare function Picker(props: PickerProps): ReturnType<typeof h>;
//# sourceMappingURL=Picker.d.ts.map