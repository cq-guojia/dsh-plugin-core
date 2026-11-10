/**
 * `dsh-plugin-core/ui/code-viewer` 子路径入口。
 *
 * 只读与可编辑是两个控件、一份 CodeMirror 底座；共用同一条子路径，不新开导出口
 * （`docs/design/structure.md` §六：不再新增子路径）。重依赖只从这条子路径可达。
 */
export { CodeViewer, type CodeViewerProps } from './CodeViewer.js';
export { CodeEditor, type CodeEditorProps } from '../inputs/CodeEditor.js';
//# sourceMappingURL=code-viewer.d.ts.map