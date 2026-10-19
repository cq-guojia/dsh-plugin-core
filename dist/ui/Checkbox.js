/**
 * 勾选框（P3 输入类家族唯一实现；U20 #6，2026-10-05）。
 *
 * 以前确认弹窗里是裸 `<input type="checkbox">` + 业务内联样式，现上提为基础层件。
 * 标记色默认随业务色；高危确认可传 `accentColor`（如 `var(--dshpc-warning)`）染橙。
 */
import { createElement as h } from 'react';
/** 勾选框（label + input 一体，整行可点）。 */
export function Checkbox(props) {
    const { checked, onChange, label, accentColor, disabled, className } = props;
    return h('label', {
        className: `dshpc-checkbox${className !== undefined && className !== '' ? ` ${className}` : ''}`,
        style: {
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            fontSize: 'var(--dshpc-font-md)', lineHeight: 'var(--dshpc-line-md)',
            cursor: disabled === true ? 'default' : 'pointer',
        },
    }, h('input', {
        type: 'checkbox',
        checked,
        disabled,
        style: {
            flex: 'none', margin: '2px 0 0',
            accentColor: accentColor ?? 'var(--dshpc-business)',
            width: '14px', height: '14px',
            cursor: disabled === true ? 'default' : 'pointer',
        },
        onChange: (event) => { onChange(event.target.checked); },
    }), label !== undefined ? h('span', null, label) : null);
}
//# sourceMappingURL=Checkbox.js.map