/**
 * 输入类控件 —— **全站唯一实现**（L2 组件皮肤，P3）
 *
 * - `Input`：文本输入（size sm 24 / md 28 / lg 32，error 描红）；
 * - `PrefixedInput`：前缀 + 文本输入（如路径 / 接口前缀）；
 * - `NumberInput`：数字步进（显式 `− / +`，替换原生 `<input type="number">` 的浏览器 spinner，
 *   支持 step / min / max、clamp、Enter 提交、失焦回弹）。
 *
 * 高度一律吃 `--dshpc-control-h-*`；有边 / 无边同高（边框在内部补回）。
 */
import { ensureControls } from './css.js';
import { createElement as h, useEffect, useState } from 'react';
import { IconButton } from './Button.js';
function sizeClass(size) {
    return size === 'lg' ? '--lg' : size === 'md' ? '--md' : '--sm';
}
/** 文本输入。默认铺满容器（width:100%，与 Textarea 同口径）；要定宽由调用方在外面包壳（如 192px 搜索槽）。 */
export function Input(props) {
    ensureControls();
    const { value, onChange, placeholder, size = 'lg', error, disabled, type, className, style } = props;
    return h('input', {
        ref: props.inputRef,
        type: type ?? 'text',
        value,
        placeholder,
        disabled,
        'aria-label': props['aria-label'],
        title: props.title,
        className: `dshpc-input dshpc-input${sizeClass(size)}${error === true ? ' dshpc-input--error' : ''}${className !== undefined && className !== '' ? ` ${className}` : ''}`,
        style,
        onChange: (event) => { onChange(event.target.value); },
        onKeyDown: props.onKeyDown,
        onBlur: props.onBlur,
    });
}
/** 前缀 + 文本输入。 */
export function PrefixedInput(props) {
    ensureControls();
    const { prefix, value, onChange, placeholder, size = 'lg', error, disabled, type, className, style } = props;
    return h('div', {
        className: `dshpc-pfx dshpc-pfx${sizeClass(size)}${error === true ? ' dshpc-pfx--error' : ''}${className !== undefined && className !== '' ? ` ${className}` : ''}`,
        style,
    }, h('span', { className: 'dshpc-pfx__label' }, prefix), h('input', {
        type: type ?? 'text',
        value,
        placeholder,
        disabled,
        'aria-label': props['aria-label'],
        title: props.title,
        className: 'dshpc-pfx__input',
        onChange: (event) => { onChange(event.target.value); },
    }));
}
/**
 * 数字步进输入：显式 `− / +` 按钮 + 可输入数字。
 *
 * @param props 见 {@link NumberInputProps}。
 * @returns 数字步进控件。
 */
export function NumberInput(props) {
    ensureControls();
    const { value, onChange, min = -Infinity, max = Infinity, step = 1, size = 'lg', inputWidth, disabled, suffix, label, decreaseLabel = '减少', increaseLabel = '增加', className, style, } = props;
    const [text, setText] = useState(String(value));
    // 外部值变化（如切档位重置）时同步回输入框。
    useEffect(() => { setText(String(value)); }, [value]);
    const clamp = (n) => Math.min(max, Math.max(min, n));
    const commit = (raw) => {
        // ⚠️ 空串按「输入无效」回弹，**不能**当成 0（2026-10-08 真机 bug：`Number('') === 0` ⇒
        // 用户按 Delete 把数字删空后失焦，值被 clamp 成 min，看起来就是「按 Delete 不管用」）。
        if (raw.trim() === '') {
            setText(String(value));
            return;
        }
        const n = Number(raw);
        if (!Number.isFinite(n)) {
            setText(String(value));
            return;
        }
        const next = clamp(n);
        setText(String(next));
        if (next !== value)
            onChange(next);
    };
    const bump = (dir) => {
        const base = Number.isFinite(Number(text)) ? Number(text) : value;
        const next = clamp(base + dir * step);
        setText(String(next));
        if (next !== value)
            onChange(next);
    };
    return h('div', {
        className: `dshpc-num dshpc-num${sizeClass(size)}${disabled === true ? ' dshpc-num--disabled' : ''}${className !== undefined && className !== '' ? ` ${className}` : ''}`,
        style,
    }, h(IconButton, { variant: 'plain', size, icon: '−', label: decreaseLabel, disabled, onClick: () => { bump(-1); } }), 
    // 中段（数字 + 后缀）成组居中：消费端把宽度拉大时，「−」钉最左、「+」钉最右、数字组始终居中
    // （用户 2026-10-18：加减号必须在最左 / 最右，宽度由消费端调）。
    h('span', { className: 'dshpc-num__mid' }, h('input', {
        className: 'dshpc-num__input',
        ...(inputWidth === undefined ? {} : { style: { width: `${inputWidth}px` } }),
        value: text,
        disabled,
        inputMode: 'numeric',
        'aria-label': label,
        onChange: (event) => { setText(event.target.value); },
        onBlur: () => { commit(text); },
        onKeyDown: (event) => { if (event.key === 'Enter')
            commit(text); },
    }), suffix !== undefined ? h('span', { className: 'dshpc-num__suffix' }, suffix) : null), h(IconButton, { variant: 'plain', size, icon: '+', label: increaseLabel, disabled, onClick: () => { bump(1); } }));
}
/**
 * 下拉锚点的统一样式（**全站唯一一份**）：`SelectField` 与 `TaskPicker` 共用 —— 两者是同一类锚点，
 * 不许各抄一份（2026-10-04 评审：TaskPicker 曾抄第二/第三份，观感会持续漂移）。
 */
export const FIELD_ANCHOR_STYLE = {
    display: 'inline-flex', alignItems: 'center', gap: '6px', height: 'var(--dshpc-control-h-lg)', boxSizing: 'border-box',
    minWidth: 0, maxWidth: '100%', padding: '0 var(--dshpc-space-2)',
    border: '0.5px solid var(--dshpc-border-heavy)', borderRadius: 'var(--dshpc-radius-md)', background: 'var(--dshpc-surface-1)',
    color: 'var(--dshpc-fg)', font: 'inherit', fontSize: 'var(--dshpc-font-md)', lineHeight: 'var(--dshpc-line-md)', cursor: 'pointer',
    transition: 'background var(--dshpc-dur-fast) var(--dshpc-ease), color var(--dshpc-dur-fast) var(--dshpc-ease), border-color var(--dshpc-dur-fast) var(--dshpc-ease)',
};
/** 下拉锚点里那行文字（省略号三件套收敛到 `.dshpc-ellipsis`，见 ui-style-guide §三 待抽象 #1）。 */
export const FIELD_LABEL_STYLE = {
    flex: '1 1 auto', minWidth: 0, textAlign: 'left',
};
/** 尺寸档 → 锚点几何（高度 / 字号 / 行高 / 图标 / 间距）。**翻译只此一处**，下拉类控件共用。 */
export function fieldMetricsOf(size) {
    return {
        height: size === 'sm' ? 'var(--dshpc-control-h-sm)' : size === 'md' ? 'var(--dshpc-control-h-md)' : 'var(--dshpc-control-h-lg)',
        font: size === 'sm' ? 'var(--dshpc-font-sm)' : 'var(--dshpc-font-md)',
        line: size === 'sm' ? 'var(--dshpc-line-sm)' : 'var(--dshpc-line-md)',
        icon: size === 'sm' ? 14 : 16,
        gap: size === 'sm' ? 'var(--dshpc-space-1)' : '6px',
    };
}
//# sourceMappingURL=Field.js.map