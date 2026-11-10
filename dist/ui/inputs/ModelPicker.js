import { createElement as h, useEffect, useState, useSyncExternalStore } from 'react';
import { t } from '../../utils/i18n.js';
import { Picker } from './Picker.js';
import { flattenOptions, groupOf, retainSelectedValue, toFlatOptions } from './picker-logic.js';
import { modelCatalog } from '../infra/host-data.js';
import { sparkleIcon } from './picker-icons.js';
import { ensureComponentStyles } from '../infra/css.js';
import { PICKER_CSS } from './picker-css.js';
export function ModelPicker(props) {
    ensureComponentStyles('picker', PICKER_CSS);
    const tt = props.translate ?? t;
    const value = props.value;
    const variant = props.variant ?? 'grouped';
    const searchable = props.searchable ?? true;
    const defaultOption = props.allowDefault === false
        ? undefined
        : { value: '', label: props.defaultLabel ?? tt('modelDefault') };
    // 目录状态：外部没喂目录（Node 自检 / 宿主缺服务）⇒ 空 + 如实降级，不编数据。
    const catalog = useSyncExternalStore(modelCatalog.subscribe, modelCatalog.getSnapshot, modelCatalog.getSnapshot);
    const catalogGroups = props.groups ??
        (catalog.status === 'ready'
            ? catalog.routes.map((route) => ({
                value: route.provider,
                label: route.displayName,
                options: route.models.map((model) => ({
                    value: `${route.provider}/${model.id}`,
                    label: model.name ?? model.id,
                })),
            }))
            : []);
    // 旧值可能已不在目录里（供应商被摘掉 / 目录刷新）：按真实值补一条保留项，
    // 让触发器与菜单都显示它、级联态也能反推出 provider，绝不静默丢掉用户的选择。
    const retained = retainSelectedValue(catalogGroups, props.value);
    const groups = retained.groups;
    // 目录不可用、空目录、或旧值已失效 ⇒ 如实提示「候选可能不完整」，别让空列表看起来像坏了。
    const degraded = props.degraded ?? (catalog.status === 'unavailable'
        || (catalog.status === 'ready' && catalogGroups.length === 0)
        || retained.retained);
    const icon = props.icon === undefined ? sparkleIcon() : props.icon ?? undefined;
    const emitModel = (v) => {
        props.onChange?.(typeof v === 'string' ? v : v[0] ?? '');
    };
    const sizing = { width: props.width, minWidth: props.minWidth, maxWidth: props.maxWidth };
    // 联动态的厂商选择必须组件自己记 —— 值是从模型值反推的，换厂商会把模型清成 ''
    // （拍板口径），反推就再也找不到刚点的厂商（2026-10-20 真机：选完厂商后面仍是黑的）。
    const [pickedProvider, setPickedProvider] = useState('');
    const curGroup = groupOf(groups, value ?? '');
    const provider = pickedProvider !== '' && groups.some((g) => g.value === pickedProvider)
        ? pickedProvider
        : curGroup?.value ?? '';
    // 值定到某模型上 ⇒ 临时选的厂商功成身退，回到按值反推
    useEffect(() => {
        if (value !== undefined && value !== '')
            setPickedProvider('');
    }, [value]);
    if (variant === 'flat') {
        const options = toFlatOptions(groups);
        return h(Picker, {
            options: defaultOption === undefined ? options : [defaultOption, ...options],
            value,
            defaultValue: props.defaultValue,
            ...sizing,
            searchSizing: props.searchSizing,
            icon,
            placeholder: props.placeholder ?? tt('modelModel'),
            degraded,
            disabled: props.disabled,
            clearable: props.clearable,
            searchable,
            hint: props.hint,
            size: props.size,
            placement: props.placement,
            className: props.className,
            translate: props.translate,
            onChange: emitModel,
        });
    }
    if (variant === 'grouped') {
        return h(Picker, {
            // 「默认模型」放最上面：空 label 的组，Picker 只渲染选项不渲染组头
            groups: defaultOption === undefined
                ? groups
                : [{ value: '', label: '', options: [defaultOption] }, ...groups],
            value,
            defaultValue: props.defaultValue,
            ...sizing,
            searchSizing: props.searchSizing,
            icon,
            placeholder: props.placeholder ?? tt('modelModel'),
            degraded,
            disabled: props.disabled,
            clearable: props.clearable,
            searchable,
            hint: props.hint,
            size: props.size,
            placement: props.placement,
            className: props.className,
            translate: props.translate,
            onChange: emitModel,
        });
    }
    // cascade：两个下拉联动 —— 供应商筛模型；换供应商清空模型
    const group = groups.find((g) => g.value === provider);
    const options = group === undefined ? [] : flattenOptions([group]);
    // 根元素统一吃 className（其它形态根就是 Picker），row 另留一条独立定制轴；
    // 两个框各自的类名也交出去，消费方才能分别控制布局。
    const rowClass = ['dshpc-picker__row', props.className, props.rowClassName]
        .filter((part) => part !== undefined && part !== '')
        .join(' ');
    return h('div', { className: rowClass }, h(Picker, {
        options: groups.map((g) => ({ value: g.value, label: g.label })),
        value: provider === '' ? undefined : provider,
        placeholder: tt('modelProvider'),
        degraded,
        disabled: props.disabled,
        ...(props.providerSizing ?? sizing),
        searchSizing: props.searchSizing,
        searchable,
        size: props.size,
        placement: props.placement,
        className: props.providerClassName,
        translate: props.translate,
        onChange: (v) => {
            setPickedProvider(typeof v === 'string' ? v : v[0] ?? '');
            props.onChange?.('');
        },
    }), h(Picker, {
        options: defaultOption === undefined ? options : [defaultOption, ...options],
        value,
        defaultValue: props.defaultValue,
        ...(props.modelSizing ?? sizing),
        searchSizing: props.searchSizing,
        icon,
        placeholder: props.placeholder ?? tt('modelModel'),
        degraded,
        disabled: props.disabled === true || provider === '',
        clearable: props.clearable,
        searchable,
        hint: props.hint,
        size: props.size,
        placement: props.placement,
        className: props.modelClassName,
        translate: props.translate,
        onChange: emitModel,
    }));
}
//# sourceMappingURL=ModelPicker.js.map