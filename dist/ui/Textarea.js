/**
 * 多行文本输入（P3 输入类家族唯一实现；皮肤见 controls-css.ts 的 `.dsh-tdt-textarea`）。
 *
 * 以前提示词框是 `task-editor.tsx` 里手写的 `<textarea>` + 业务 CSS `.dsh-tdt-ed-prompt`；
 * 现上提为基础层件（U20 #6，2026-10-05），业务文件只 `import { Textarea }`。
 */
import { createElement as h } from 'react';
import { ensureControls } from './css.js';
/** 多行文本输入。 */
export function Textarea(props) {
    ensureControls();
    const { value, onChange, placeholder, error, disabled, id, rows, spellCheck, className, style } = props;
    return h('textarea', {
        id,
        rows,
        value,
        placeholder,
        disabled,
        spellCheck: spellCheck === true,
        'aria-label': props['aria-label'],
        className: `dsh-tdt-textarea${error === true ? ' dsh-tdt-textarea--error' : ''}${className !== undefined && className !== '' ? ' ' + className : ''}`,
        style,
        onChange: (event) => { onChange(event.target.value); },
    });
}
//# sourceMappingURL=Textarea.js.map