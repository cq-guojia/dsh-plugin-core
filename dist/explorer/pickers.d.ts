import { createElement as h } from 'react';
import { type Translate } from '../utils/i18n.js';
export interface WorkspacePickerProps {
    /**
     * 工作区名字列表 —— **由调用方给**。
     *
     * 为什么组件不自己取：工作区列表是 host 侧 `ctx.workspaceRegistry.list()` 取的，
     * 要经插件自己的 HTTP 通道送到 client，那条通道是插件私有的（需求文档 §6）。
     */
    workspaces: readonly string[];
    value?: string | string[];
    mode?: 'single' | 'multiple';
    max?: number;
    disabled?: boolean;
    placeholder?: string;
    translate?: Translate;
    onChange?: (value: string | string[]) => void;
}
/** 选工作区（交互全管：单选 / 多选 / 上限 / 空态；数据调用方给）。 */
export declare function WorkspacePicker(props: WorkspacePickerProps): ReturnType<typeof h>;
export interface FilePickerProps {
    /** 候选文件（相对路径）；同样由调用方给。 */
    files: readonly string[];
    value?: string | string[];
    mode?: 'single' | 'multiple';
    max?: number;
    disabled?: boolean;
    placeholder?: string;
    translate?: Translate;
    onChange?: (value: string | string[]) => void;
}
/** 选文件（同上：交互全管，数据调用方给）。 */
export declare function FilePicker(props: FilePickerProps): ReturnType<typeof h>;
//# sourceMappingURL=pickers.d.ts.map