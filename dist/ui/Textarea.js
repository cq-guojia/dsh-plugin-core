/**
 * 多行文本输入（P3 输入类家族唯一实现；皮肤见 controls-css.ts 的 `.dshpc-textarea`）。
 *
 * 以前提示词框是 `task-editor.tsx` 里手写的 `<textarea>` + 业务 CSS `.dshpc-ed-prompt`；
 * 现上提为基础层件（U20 #6，2026-10-05），业务文件只 `import { Textarea }`。
 */
import { createElement as h } from 'react';
import { FieldHint } from './FieldHint.js';
import { ensureComponentStyles } from './css.js';
import { FIELD_CSS } from './controls-css.js';
/** 多行文本输入。 */
export function Textarea(props) {
    ensureComponentStyles('field', FIELD_CSS);
    const { value, onChange, placeholder, error, disabled, id, rows, spellCheck, className, style } = props;
    const box = h('textarea', {
        id,
        rows,
        value,
        placeholder,
        disabled,
        spellCheck: spellCheck === true,
        'aria-label': props['aria-label'],
        className: `dshpc-textarea${error === true ? ' dshpc-textarea--error' : ''}${className !== undefined && className !== '' ? ` ${className}` : ''}`,
        style,
        onChange: (event) => { onChange(event.target.value); },
    });
    // 多行的问号放**右下角**（2026-10-20 用户：不要垂直居中，那样像贴在中间的空白上）
    if (props.hint === undefined)
        return box;
    return h('span', { className: 'dshpc-fieldwrap dshpc-fieldwrap--block' }, box, h(FieldHint, { text: props.hint }));
}
//# sourceMappingURL=Textarea.js.map