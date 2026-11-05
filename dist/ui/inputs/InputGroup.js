/**
 * 组合输入框 —— 输入框 + 后置按钮组（+ 可选前置标题）焊成一体（L2 组件皮肤，P3）
 *
 * 外观与 {@link SplitGroup} 同一套口径：外框 / 圆角 / 相邻 1px 分隔 / 整体聚焦圈都由外壳画，
 * 内件（Input、Button、IconButton）把自己的边框、圆角、外圈交出来。区别只有一条：
 * **这里持状态** —— 输入值受控于调用方，提交点与撤销栈在控件内部。
 *
 * 用法：
 *   h(InputGroup, {
 *     label: '任务名', value, onChange: setValue, undoable: true,
 *     actions: [
 *       { label: '返回', variant: 'ghost', onClick: () => close() },
 *       { label: '确定', variant: 'primary', onClick: save },
 *     ],
 *   })
 *
 * 撤销口径：Enter / 失焦 / 点任一动作 = 一次提交，把提交前的值压栈；点撤销弹回栈顶。
 * 父级直接改 `value`（如外部清空）不算编辑，不进栈。
 */
import { createElement as h, useRef, useState } from 'react';
import { Button, IconButton } from '../actions/Button.js';
import { Input, withHint } from './Field.js';
import { ensureComponentStyles } from '../infra/css.js';
import { BUTTON_CSS, FIELD_CSS, INPUT_GROUP_CSS } from '../infra/controls-css.js';
import { t } from '../../utils/i18n.js';
/**
 * 渲染一个「输入框 + 按钮组」组合控件。
 *
 * @param props 见 {@link InputGroupProps}。
 * @returns 组合控件元素。
 */
export function InputGroup(props) {
    ensureComponentStyles('input-group', INPUT_GROUP_CSS);
    ensureComponentStyles('field', FIELD_CSS);
    ensureComponentStyles('button', BUTTON_CSS);
    const { value, onChange, label, placeholder, size = 'lg', height, error, disabled, actions = [], undoable = false, undoLabel = t('inputUndo'), onSubmit, } = props;
    const committed = useRef(value);
    const [undoStack, setUndoStack] = useState([]);
    const commit = () => {
        if (value === committed.current)
            return;
        const prev = committed.current;
        committed.current = value;
        setUndoStack((stack) => [...stack, prev]);
    };
    const undo = () => {
        const prev = undoStack[undoStack.length - 1];
        if (prev === undefined)
            return;
        setUndoStack((stack) => stack.slice(0, -1));
        committed.current = prev;
        onChange(prev);
    };
    const nodes = [];
    if (label !== undefined)
        nodes.push(h('span', { key: 'label', className: 'dshpc-igroup__label' }, label));
    nodes.push(h(Input, {
        key: 'input',
        value,
        onChange,
        placeholder,
        size,
        disabled,
        'aria-label': props['aria-label'],
        onBlur: commit,
        onKeyDown: (event) => {
            if (event.key !== 'Enter')
                return;
            event.preventDefault();
            commit();
            if (onSubmit !== undefined)
                onSubmit(value);
        },
    }));
    if (undoable) {
        nodes.push(h(IconButton, {
            key: 'undo',
            variant: 'plain',
            size,
            icon: '↶',
            label: undoLabel,
            disabled: disabled === true || undoStack.length === 0,
            onClick: undo,
        }));
    }
    actions.forEach((action, i) => {
        if (action.label === undefined && (action.icon === undefined || action.icon === null))
            return;
        // 必须把返回值透出去：Button / IconButton 靠「返回值是不是 Promise」决定要不要转圈
        const run = () => { commit(); return action.onClick(); };
        const off = disabled === true || action.disabled === true;
        const onlyIcon = action.label === undefined;
        nodes.push(onlyIcon
            ? h(IconButton, {
                key: `action-${String(i)}`,
                variant: 'plain',
                size,
                icon: action.icon,
                label: action.ariaLabel ?? t('inputAction'),
                disabled: off,
                onClick: run,
            })
            : h(Button, {
                key: `action-${String(i)}`,
                variant: action.variant ?? 'info',
                size,
                icon: action.icon,
                width: action.width,
                loadingText: action.loadingText,
                disabled: off,
                onClick: run,
            }, action.label));
    });
    const className = `dshpc-igroup dshpc-igroup--${size}`
        + `${error === true ? ' dshpc-igroup--error' : ''}`
        + `${props.className !== undefined && props.className !== '' ? ` ${props.className}` : ''}`;
    return withHint(h('div', {
        role: 'group',
        'aria-label': props['aria-label'] ?? label,
        id: props.id,
        className,
        style: height === undefined ? props.style : { height, ...props.style },
    }, nodes), props.hint);
}
//# sourceMappingURL=InputGroup.js.map