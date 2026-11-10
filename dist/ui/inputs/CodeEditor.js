/**
 * CodeEditor —— 可编辑的 CodeMirror 控件（录入类）。
 *
 * 与只读 CodeViewer 共用 `infra/code-mirror-surface`，两者同在 `dsh-plugin-core/ui/code-viewer`
 * 子路径导出：调用方想只读用 CodeViewer、想编辑用 CodeEditor，重依赖只在这一条子路径里。
 * 不要把它加进 `src/ui/index.ts` —— 那会把 CodeMirror 拖进所有插件的包。
 *
 * 受控：控件自己不存文本，改一个字就经 onChange 回传全文，由调用方决定怎么保存。
 */
import { createElement as h } from 'react';
import { CodeMirrorSurface } from '../infra/code-mirror-surface.js';
export function CodeEditor(props) {
    return h(CodeMirrorSurface, {
        value: props.value,
        path: props.path ?? '',
        readOnly: false,
        onChange: props.onChange,
        className: props.className,
        style: props.style,
        height: props.height,
        lineNumbers: props.lineNumbers,
        focusLine: props.focusLine,
    });
}
//# sourceMappingURL=CodeEditor.js.map