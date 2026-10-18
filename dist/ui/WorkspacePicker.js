// 领域选择器：WorkspacePicker / FilePicker。
// 它们是 ui 的 Picker 的薄封装（领域数据 + 通用选择器交互），与 explorer 的浏览/预览无关 ——
// 放在 ui 里，需要选工作区/选文件的地方不必引入整个 explorer（需求文档 §2.4）。
import { createElement as h } from 'react';
import { ensureControls } from './css.js';
import { Picker } from './Picker.js';
import { t } from '../utils/i18n.js';
/** 选工作区（交互全管：单选 / 多选 / 上限 / 空态；数据调用方给）。 */
export function WorkspacePicker(props) {
    ensureControls();
    const tt = props.translate ?? t;
    return h(Picker, {
        options: props.workspaces.map((w) => ({ value: w, label: w })),
        value: props.value,
        defaultValue: props.defaultValue,
        mode: props.mode,
        max: props.max,
        onChange: props.onChange,
        clearable: props.clearable,
        searchable: props.searchable ?? true,
        placeholder: props.placeholder ?? tt('explorerRoot'),
        disabled: props.disabled,
        size: props.size,
        placement: props.placement,
        className: props.className,
    });
}
/** 选文件（同上：交互全管，数据调用方给）。 */
export function FilePicker(props) {
    ensureControls();
    const tt = props.translate ?? t;
    return h(Picker, {
        options: props.files.map((f) => ({ value: f, label: f })),
        value: props.value,
        defaultValue: props.defaultValue,
        mode: props.mode,
        max: props.max,
        onChange: props.onChange,
        clearable: props.clearable,
        searchable: props.searchable ?? true,
        placeholder: props.placeholder ?? tt('pickerPlaceholder'),
        disabled: props.disabled,
        size: props.size,
        placement: props.placement,
        className: props.className,
    });
}
//# sourceMappingURL=WorkspacePicker.js.map