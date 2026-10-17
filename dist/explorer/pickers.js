import { createElement as h } from 'react';
import { ensureControls } from '../ui/css.js';
import { Picker } from '../ui/Picker.js';
import { t } from '../utils/i18n.js';
/** 选工作区（交互全管：单选 / 多选 / 上限 / 空态；数据调用方给）。 */
export function WorkspacePicker(props) {
    ensureControls();
    const tt = props.translate ?? t;
    return h(Picker, {
        options: props.workspaces.map((w) => ({ value: w, label: w })),
        value: props.value,
        mode: props.mode,
        max: props.max,
        searchable: true,
        placeholder: props.placeholder ?? tt('explorerRoot'),
        disabled: props.disabled,
        onChange: props.onChange,
    });
}
/** 选文件（同上：交互全管，数据调用方给）。 */
export function FilePicker(props) {
    ensureControls();
    const tt = props.translate ?? t;
    return h(Picker, {
        options: props.files.map((f) => ({ value: f, label: f })),
        value: props.value,
        mode: props.mode,
        max: props.max,
        searchable: true,
        placeholder: props.placeholder ?? tt('pickerPlaceholder'),
        disabled: props.disabled,
        onChange: props.onChange,
    });
}
//# sourceMappingURL=pickers.js.map