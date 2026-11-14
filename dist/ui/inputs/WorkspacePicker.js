// 领域选择器：WorkspacePicker（选工作区）。
// 通用交互由 ui 的 Picker 承担；工作区数据由本组件自己订（host-data.ts 的
// workspaceList，connectHost 喂官方 `workspaces` 服务快照）—— 消费方不再传数组
// （用户 2026-10-20 拍板）。FilePicker 已删（用户同日：文件选择框没有用）。
import { createElement as h, useSyncExternalStore } from 'react';
import { ensureControls } from '../infra/css.js';
import { Picker } from './Picker.js';
import { t } from '../../utils/i18n.js';
import { workspaceList } from '../infra/host-data.js';
import { folderIcon } from './picker-icons.js';
/** 某个口径下的字符串值；缺字段 = undefined（不回落别的口径）。 */
function workspaceValueOf(w, key) {
    return key === 'id' ? w.workspaceId : key === 'path' ? w.path : w.title;
}
/**
 * 快照行 → 选项。缺该字段、或与前面撞值的行**置灰保留**：静默丢会让工作区凭空消失，
 * 回落到别的口径则等于混用两种值（2026-11-15）。
 */
export function workspaceOptionsOf(items, key) {
    const used = new Set();
    return items.map((w) => {
        const value = workspaceValueOf(w, key);
        const taken = value === undefined || used.has(value);
        if (value !== undefined)
            used.add(value);
        return { value: value ?? w.workspaceId, label: w.title, disabled: taken };
    });
}
/** 选工作区（交互全管：单选 / 多选 / 上限 / 空态；数据自动来自宿主工作区快照）。 */
export function WorkspacePicker(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const items = useSyncExternalStore(workspaceList.subscribe, workspaceList.getSnapshot, workspaceList.getSnapshot);
    const valueKey = props.valueKey ?? 'id';
    const options = workspaceOptionsOf(items, valueKey);
    // 「所有工作区」放最上面（单选才有意义）；选中发 '' —— 空串表示不筛
    const allOption = props.allowDefault !== false && props.mode !== 'multiple'
        ? { value: '', label: props.defaultLabel ?? tt('workspaceAll') }
        : undefined;
    // 值 → 对象只从当前快照里查；查不到（已删的工作区 / '') 就是 undefined，不编造。
    const { onChange } = props;
    const emit = onChange === undefined
        ? undefined
        : (value) => {
            const hit = (v) => items.find((w) => workspaceValueOf(w, valueKey) === v);
            onChange(value, Array.isArray(value) ? value.flatMap((v) => hit(v) ?? []) : hit(value));
        };
    return h(Picker, {
        options: allOption === undefined ? options : [allOption, ...options],
        value: props.value,
        defaultValue: props.defaultValue,
        mode: props.mode,
        max: props.max,
        onChange: emit,
        clearable: props.clearable,
        searchable: props.searchable,
        width: props.width,
        minWidth: props.minWidth,
        maxWidth: props.maxWidth,
        searchSizing: props.searchSizing,
        hint: props.hint,
        icon: props.icon === undefined ? folderIcon() : props.icon ?? undefined,
        placeholder: props.placeholder ?? tt('explorerRoot'),
        disabled: props.disabled,
        size: props.size,
        placement: props.placement,
        className: props.className,
        translate: props.translate,
    });
}
//# sourceMappingURL=WorkspacePicker.js.map