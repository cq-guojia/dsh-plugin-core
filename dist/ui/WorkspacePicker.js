// 领域选择器：WorkspacePicker（选工作区）。
// 通用交互由 ui 的 Picker 承担；工作区数据由本组件自己订（host-data.ts 的
// workspaceList，connectHost 喂官方 `workspaces` 服务快照）—— 消费方不再传数组
// （用户 2026-10-20 拍板）。FilePicker 已删（用户同日：文件选择框没有用）。
import { createElement as h, useSyncExternalStore } from 'react';
import { ensureControls } from './css.js';
import { Picker } from './Picker.js';
import { t } from '../utils/i18n.js';
import { workspaceList } from './host-data.js';
import { folderIcon } from './picker-icons.js';
/** 选工作区（交互全管：单选 / 多选 / 上限 / 空态；数据自动来自宿主工作区快照）。 */
export function WorkspacePicker(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const items = useSyncExternalStore(workspaceList.subscribe, workspaceList.getSnapshot);
    return h(Picker, {
        options: items.map((w) => ({ value: w.workspaceId, label: w.title })),
        value: props.value,
        defaultValue: props.defaultValue,
        mode: props.mode,
        max: props.max,
        onChange: props.onChange,
        clearable: props.clearable,
        searchable: props.searchable,
        hint: props.hint,
        icon: props.icon === undefined ? folderIcon() : props.icon ?? undefined,
        placeholder: props.placeholder ?? tt('explorerRoot'),
        disabled: props.disabled,
        size: props.size,
        placement: props.placement,
        className: props.className,
    });
}
//# sourceMappingURL=WorkspacePicker.js.map