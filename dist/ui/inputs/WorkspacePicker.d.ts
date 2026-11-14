import { createElement as h, type ReactNode } from 'react';
import { type PickerSize } from './Picker.js';
import { type PickerOption, type PickerSizing } from './picker-logic.js';
import { type Translate } from '../../utils/i18n.js';
import { type HostWorkspaceItem } from '../infra/host-data.js';
/** 取值口径：`value` / `onChange` 第一参用工作区的哪个字段。 */
export type WorkspaceKey = 'id' | 'path' | 'title';
/**
 * 快照行 → 选项。缺该字段、或与前面撞值的行**置灰保留**：静默丢会让工作区凭空消失，
 * 回落到别的口径则等于混用两种值（2026-11-15）。
 */
export declare function workspaceOptionsOf(items: readonly HostWorkspaceItem[], key: WorkspaceKey): PickerOption[];
export interface WorkspacePickerProps extends PickerSizing {
    /** value / onChange 用哪个字段做值：`id` = workspaceId（默认）/ `path` = 宿主 realpath / `title` = 显示名。 */
    valueKey?: WorkspaceKey;
    value?: string | string[];
    defaultValue?: string | string[];
    mode?: 'single' | 'multiple';
    max?: number;
    /**
     * 第一参是选中值（口径见 `valueKey`）；第二参是对应的完整工作区对象 ——
     * 想要 title / sessionIds / updatedAt 直接取，不必自己再去快照里查。
     * 多选给数组（与第一参同序）；「所有工作区」与清空给 `undefined`。
     */
    onChange?: (value: string | string[], item: HostWorkspaceItem | HostWorkspaceItem[] | undefined) => void;
    /**
     * 是否提供「所有工作区」默认项（**默认提供**；只在单选形态下出现）：
     * 选中即发 `''` —— 表示不筛，是否当「全部」由消费方自己处理。
     */
    allowDefault?: boolean;
    /** 「所有工作区」的文案（默认取内置字典）。 */
    defaultLabel?: string;
    /** 允许「不选」。 */
    clearable?: boolean;
    /** 下拉内搜索框（默认关；要就传 true）。 */
    searchable?: boolean;
    disabled?: boolean;
    /** 无障碍名（下拉本身没有可见标签时传它）。 */
    ariaLabel?: string;
    /** 校验不通过：描红（与 Input / Textarea 同口径，只描边框）。 */
    error?: boolean;
    /**
     * 宿主一个工作区都没有时的触发器文案（默认「暂无可选」）。
     * 此时控件自动禁用：消费方拿不到候选数组，判不了空；点开一个空菜单也没意义。
     */
    emptyLabel?: string;
    size?: PickerSize;
    placement?: 'down' | 'up';
    className?: string;
    /** 下拉内搜索框的宽度三轴（与 Picker 同口径）；不传铺满菜单宽度。 */
    searchSizing?: PickerSizing;
    /** 未选时的文字（默认「工作区」；想叫「选择工作区」就传它）。 */
    placeholder?: string;
    /** 触发器前置图标：不传 = 默认文件夹；传 `null` = 不显示；传元素 = 自定义。 */
    icon?: ReactNode | null;
    /** 问号提示文字（传了才显示）。 */
    hint?: string;
    translate?: Translate;
}
/** 选工作区（交互全管：单选 / 多选 / 上限 / 空态；数据自动来自宿主工作区快照）。 */
export declare function WorkspacePicker(props: WorkspacePickerProps): ReturnType<typeof h>;
//# sourceMappingURL=WorkspacePicker.d.ts.map