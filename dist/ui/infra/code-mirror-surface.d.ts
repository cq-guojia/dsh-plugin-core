/**
 * CodeMirror 共用底座 —— 只读 CodeViewer 与可编辑 CodeEditor 共用这一份渲染。
 *
 * 放 infra 而不是某个控件目录：它是跨类共用的底座，不是控件（`structure.md` §二）。
 * 不对外导出，只在 `dsh-plugin-core/ui/code-viewer` 子路径内被两个控件引用 ——
 * `@uiw/react-codemirror` 是重依赖，不能从 `src/ui/index.ts` 可达。
 *
 * 明暗判据（唯一）：body[data-ds-dark-theme]，禁用 prefers-color-scheme。
 */
import { type CSSProperties, type ReactElement, type ReactNode } from 'react';
export interface CodeMirrorSurfaceProps {
    /** 受控文本。 */
    value: string;
    /** 文件路径（按扩展名选语法高亮）。 */
    path: string;
    /** 只读开关：true = EditorState.readOnly，挡住一切输入但仍可框选复制。 */
    readOnly: boolean;
    /** 可编辑时回传全文；只读时不传。 */
    onChange?: (value: string) => void;
    /** 可选：浮在编辑器右上角的插槽（只读查看器的复制按钮）。 */
    overlay?: ReactNode;
    className?: string;
    style?: CSSProperties;
    height?: string;
    lineNumbers?: boolean;
    focusLine?: number;
}
export declare function CodeMirrorSurface(props: CodeMirrorSurfaceProps): ReactElement;
//# sourceMappingURL=code-mirror-surface.d.ts.map