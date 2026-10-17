import { createElement as h } from 'react';
import { type Translate } from '../utils/i18n.js';
import { type PickerGroup } from './picker-logic.js';
/**
 * 模型选择的两种形态（需求文档 §6）：
 * - `cascade`（级联）：先选供应商、再选模型（一行两个下拉，stp 的形态）
 * - `flat`（平铺）：一个下拉列出全部（dispatch 的形态）
 *
 * 两种形态吃**同一份分组数据**，只是渲染方式不同 —— 调用方不用准备两套数据。
 * 数据由调用方给（供应商目录来自 `llm/listProviders` 这类宿主路由，组件取不到）。
 */
export type ModelPickerVariant = 'cascade' | 'flat';
export interface ModelPickerProps {
    /** 分组数据：一组 = 一个供应商。 */
    groups: PickerGroup[];
    variant?: ModelPickerVariant;
    /** 最终模型值（`option.value`，编码口径由调用方定，如 `${provider}/${id}`）。 */
    value?: string;
    /** 候选可能不完整 ⇒ 如实提示。 */
    degraded?: boolean;
    disabled?: boolean;
    translate?: Translate;
    onChange?: (value: string) => void;
}
export declare function ModelPicker(props: ModelPickerProps): ReturnType<typeof h>;
//# sourceMappingURL=ModelPicker.d.ts.map