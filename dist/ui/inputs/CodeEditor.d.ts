/**
 * CodeEditor —— 可编辑的 CodeMirror 控件（录入类）。
 *
 * 与只读 CodeViewer 共用 `infra/code-mirror-surface`，两者同在 `dsh-plugin-core/ui/code-viewer`
 * 子路径导出：调用方想只读用 CodeViewer、想编辑用 CodeEditor，重依赖只在这一条子路径里。
 * 不要把它加进 `src/ui/index.ts` —— 那会把 CodeMirror 拖进所有插件的包。
 *
 * 受控：控件自己不存文本，改一个字就经 onChange 回传全文，由调用方决定怎么保存。
 */
import { type CSSProperties, type ReactElement } from 'react';
export interface CodeEditorProps {
    /** 受控文本。 */
    value: string;
    /** 文本变化回调（每次编辑带出全文）。 */
    onChange: (value: string) => void;
    /** 可选：文件路径，按扩展名选语法高亮；不传即纯文本。 */
    path?: string;
    /** 可选：透传调用方样式类名。 */
    className?: string;
    /** 可选：透传根 div 行内样式。 */
    style?: CSSProperties;
    /** 可选：编辑器高度，默认 "100%"；无确定高度上下文传 "auto" 随内容撑高。 */
    height?: string;
    /** 可选：是否显示行号，默认 true。 */
    lineNumbers?: boolean;
    /** 可选：挂载/换文本后把这一行滚到视口中部。 */
    focusLine?: number;
}
export declare function CodeEditor(props: CodeEditorProps): ReactElement;
//# sourceMappingURL=CodeEditor.d.ts.map