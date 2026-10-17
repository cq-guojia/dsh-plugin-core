import { createElement as h } from 'react';
import { type Translate } from '../utils/i18n.js';
import { type PickerGroup, type PickerOption } from './picker-logic.js';
export type { PickerGroup, PickerOption };
export interface PickerProps {
    /** 分组数据（模型选择里一组 = 一个 provider）。 */
    groups?: PickerGroup[];
    /** 扁平数据的快捷写法；与 `groups` 二选一。 */
    options?: PickerOption[];
    value?: string | string[];
    mode?: 'single' | 'multiple';
    /** 多选上限；到上限后不再添加（不静默截断）。 */
    max?: number;
    searchable?: boolean;
    placeholder?: string;
    /** 候选可能不完整（宿主没接上服务之类）⇒ 如实告诉用户，不编造。 */
    degraded?: boolean;
    disabled?: boolean;
    translate?: Translate;
    onChange?: (value: string | string[]) => void;
}
/**
 * 通用选择器：单选 / 多选 / 上限 / 搜索 / 分组 / 空态 / 降级。
 *
 * **纯零件，不自己取数** —— 选项由调用方传入（工作区列表、模型列表这类数据要跨 host↔client
 * 边界，通道是插件私有的，组件取不到，见需求文档 §6）。
 */
export declare function Picker(props: PickerProps): ReturnType<typeof h>;
//# sourceMappingURL=Picker.d.ts.map