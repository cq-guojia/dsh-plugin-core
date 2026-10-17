import { createElement as h } from 'react';
import { ensureControls } from './css.js';
import { t } from '../utils/i18n.js';
import { Picker } from './Picker.js';
import { flattenOptions, groupOf } from './picker-logic.js';
export function ModelPicker(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const value = props.value ?? '';
    const variant = props.variant ?? 'flat';
    if (variant === 'flat') {
        return h(Picker, {
            options: flattenOptions(props.groups),
            value: value === '' ? undefined : value,
            placeholder: tt('modelModel'),
            degraded: props.degraded,
            disabled: props.disabled,
            searchable: true,
            onChange: (v) => props.onChange?.(typeof v === 'string' ? v : v[0] ?? ''),
        });
    }
    const group = groupOf(props.groups, value);
    const provider = group?.value ?? '';
    return h('div', { className: 'dsh-tdt-picker__row' }, h(Picker, {
        options: props.groups.map((g) => ({ value: g.value, label: g.label })),
        value: provider === '' ? undefined : provider,
        placeholder: tt('modelProvider'),
        disabled: props.disabled,
        // 换供应商 ⇒ 清空已选模型（旧的模型不属于新供应商）；参数不用，故不命名
        onChange: () => props.onChange?.(''),
    }), h(Picker, {
        options: group?.options ?? [],
        value: value === '' ? undefined : value,
        placeholder: tt('modelModel'),
        degraded: props.degraded,
        disabled: props.disabled === true || provider === '',
        searchable: true,
        onChange: (v) => props.onChange?.(typeof v === 'string' ? v : v[0] ?? ''),
    }));
}
//# sourceMappingURL=ModelPicker.js.map