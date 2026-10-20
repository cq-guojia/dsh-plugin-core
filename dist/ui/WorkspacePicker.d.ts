import { createElement as h, type ReactNode } from 'react';
import { type PickerSize } from './Picker.js';
import { type Translate } from '../utils/i18n.js';
export interface WorkspacePickerProps {
    value?: string | string[];
    defaultValue?: string | string[];
    mode?: 'single' | 'multiple';
    max?: number;
    onChange?: (value: string | string[]) => void;
    /** 允许「不选」。 */
    clearable?: boolean;
    /** 下拉内搜索框（默认关；要就传 true）。 */
    searchable?: boolean;
    disabled?: boolean;
    size?: PickerSize;
    placement?: 'down' | 'up';
    className?: string;
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