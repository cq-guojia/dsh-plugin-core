import { createElement as h, useEffect, useMemo, useRef, useState } from 'react';
import { ensureControls } from './css.js';
import { t } from '../utils/i18n.js';
import { FieldHint } from './FieldHint.js';
import { filterGroups, flattenOptions, labelsOf, toGroups, toggleValue, } from './picker-logic.js';
/**
 * 通用选择器：单选 / 多选 / 上限 / 搜索 / 分组 / 空态 / 降级。
 *
 * **纯零件，不自己取数** —— 选项由调用方传入（工作区列表、模型列表这类数据要跨 host↔client
 * 边界，通道是插件私有的，组件取不到，见需求文档 §6）。
 */
export function Picker(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const mode = props.mode ?? 'single';
    const size = props.size ?? 'md';
    const placement = props.placement ?? 'down';
    const clearable = props.clearable === true;
    const showLabels = props.showLabels !== false;
    const groups = useMemo(() => toGroups(props.groups, props.options), [props.groups, props.options]);
    const controlled = props.value !== undefined;
    const [inner, setInner] = useState(() => toArray(props.defaultValue));
    const selected = controlled
        ? toArray(props.value)
        : inner;
    const emit = (next) => {
        if (!controlled)
            setInner(next);
        props.onChange?.(mode === 'single' ? (next[0] ?? '') : next);
    };
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(-1);
    const rootRef = useRef(null);
    const searchRef = useRef(null);
    // 展开即聚焦搜索框（2026-10-20 用户：点开就能直接打字，不用再点一下）
    useEffect(() => {
        if (open && props.searchable === true)
            searchRef.current?.focus();
    }, [open, props.searchable]);
    // 点外面收起
    useEffect(() => {
        if (!open)
            return;
        const onDown = (e) => {
            const root = rootRef.current;
            if (root !== null && !root.contains(e.target))
                setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);
    // 收起时清掉搜索词与键盘游标，别让下次打开带着上次的过滤条件
    useEffect(() => {
        if (open)
            return;
        setQuery('');
        setActive(-1);
    }, [open]);
    const shown = filterGroups(groups, query);
    const flat = flattenOptions(shown);
    const atMax = mode === 'multiple' && props.max !== undefined && selected.length >= props.max;
    const summary = selected.length === 0
        ? (props.placeholder ?? tt('pickerPlaceholder'))
        : mode === 'multiple' && !showLabels
            ? tt('pickerSelected', { n: selected.length })
            : labelsOf(groups, selected).join('、') || (props.placeholder ?? tt('pickerPlaceholder'));
    const pick = (value) => {
        if (mode === 'single') {
            emit([value]);
            setOpen(false);
            return;
        }
        emit(toggleValue(selected, value, props.max));
        if (props.closeOnSelect === true)
            setOpen(false);
    };
    const clear = () => {
        emit([]);
        setOpen(false);
    };
    // 键盘可达：Esc 关、上下移、回车选（没有 aria 树那么全，但能用键盘走完一遍）
    const onKeyDown = (e) => {
        if (!open)
            return;
        if (e.key === 'Escape') {
            setOpen(false);
            return;
        }
        if (flat.length === 0)
            return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const dir = e.key === 'ArrowDown' ? 1 : -1;
            setActive((cur) => (cur + dir + flat.length) % flat.length);
            return;
        }
        if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            const hit = flat[active];
            if (hit !== undefined)
                pick(hit.value);
        }
    };
    // 触发器（右侧箭头 = 内联 SVG chevron，与官方 ⌄ 同形；ui 零官方依赖故自绘）。
    const trigger = h('button', {
        type: 'button',
        'aria-label': props.ariaLabel,
        'aria-expanded': open,
        className: `dshpc-picker__trigger dshpc-picker__trigger--${size}${props.align === 'center' ? ' dshpc-picker__trigger--center' : ''}`,
        disabled: props.disabled === true,
        onClick: () => {
            if (props.disabled !== true)
                setOpen(!open);
        },
    }, props.icon !== undefined && props.icon !== null
        ? h('span', { className: 'dshpc-picker__icon' }, props.icon)
        : null, 
    // 文字吃掉剩余宽度并靠左（默认）：否则 space-between 会把短文案推到中间
    h('span', { className: 'dshpc-picker__label' }, summary), h('svg', {
        className: 'dshpc-picker__caret',
        width: 12,
        height: 12,
        viewBox: '0 0 16 16',
        fill: 'none',
        'aria-hidden': true,
    }, h('path', {
        d: 'M4 6l4 4 4-4',
        stroke: 'currentColor',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
    })));
    // hint 给了就把触发器与 FieldHint 包进同一行（间距/对齐收进组件）。
    const triggerRow = props.hint === undefined
        ? trigger
        : h('span', { className: 'dshpc-fieldwrap dshpc-fieldwrap--inline' }, trigger, h(FieldHint, { text: props.hint }));
    return h('div', {
        className: `dshpc-picker${props.className === undefined ? '' : ` ${props.className}`}`,
        ref: rootRef,
        onKeyDown,
    }, triggerRow, open
        ? h('div', {
            className: placement === 'up'
                ? 'dshpc-picker__menu dshpc-picker__menu--up'
                : 'dshpc-picker__menu',
        }, props.degraded === true
            ? h('div', { className: 'dshpc-picker__degraded' }, tt('pickerDegraded'))
            : null, atMax ? h('div', { className: 'dshpc-picker__degraded' }, tt('pickerMaxReached', { n: props.max ?? 0 })) : null, props.searchable === true
            ? h('input', {
                ref: searchRef,
                className: 'dshpc-picker__search',
                placeholder: tt('pickerSearch'),
                value: query,
                onChange: (e) => setQuery(e.target.value),
            })
            : null, flat.length === 0 && groups.length === 0
            ? h('div', { className: 'dshpc-picker__empty' }, tt('pickerEmpty'))
            : flat.length === 0
                ? h('div', { className: 'dshpc-picker__empty' }, tt('pickerNoMatch'))
                : [
                    clearable && mode === 'single' && selected.length > 0
                        ? h('div', {
                            key: '__clear__',
                            className: 'dshpc-picker__option dshpc-picker__option--clear',
                            onClick: clear,
                        }, tt('pickerClear'))
                        : null,
                    ...shown.map((g) => h('div', { key: g.value || '_' }, g.label === ''
                        ? null
                        : h('div', { className: 'dshpc-picker__group-label' }, g.label), g.options.map((o) => {
                        // 到上限后：未选项置灰，**已选项保持可点**（点了是取消，不是再加）。
                        const blocked = o.disabled === true || (atMax && !selected.includes(o.value));
                        const activeCls = [
                            'dshpc-picker__option',
                            selected.includes(o.value) ? 'dshpc-picker__option--active' : '',
                            blocked ? 'dshpc-picker__option--disabled' : '',
                        ]
                            .filter((s) => s !== '')
                            .join(' ');
                        const idx = flat.indexOf(o);
                        return h('div', {
                            key: o.value,
                            className: activeCls,
                            'data-active': idx === active ? 'true' : undefined,
                            onClick: () => {
                                if (!blocked)
                                    pick(o.value);
                            },
                        }, mode === 'multiple'
                            ? h('span', { className: 'dshpc-picker__tick' }, selected.includes(o.value) ? '✓' : '')
                            : null, o.icon !== undefined && o.icon !== null
                            ? h('span', { className: 'dshpc-picker__option-icon' }, o.icon)
                            : null, h('span', null, o.label));
                    }))),
                ])
        : null);
}
function toArray(v) {
    if (v === undefined)
        return [];
    return Array.isArray(v) ? [...v] : [v];
}
//# sourceMappingURL=Picker.js.map