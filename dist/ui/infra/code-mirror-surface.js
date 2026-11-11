/**
 * CodeMirror 共用底座 —— 只读 CodeViewer 与可编辑 CodeEditor 共用这一份渲染。
 *
 * 放 infra 而不是某个控件目录：它是跨类共用的底座，不是控件（`structure.md` §二）。
 * 不对外导出，只在 `dsh-plugin-core/ui/code-viewer` 子路径内被两个控件引用 ——
 * `@uiw/react-codemirror` 是重依赖，不能从 `src/ui/index.ts` 可达。
 *
 * 明暗判据（唯一）：body[data-ds-dark-theme]，禁用 prefers-color-scheme。
 */
import { createElement as h, useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { ensureComponentStyles } from './css.js';
import { CODE_VIEWER_CSS } from '../display/code-viewer-css.js';
import { languageForPath } from '../display/code-viewer-lang.js';
import { codeMirrorTheme } from '../display/code-viewer-theme.js';
const DARK_ATTR = 'data-ds-dark-theme';
function hostDark() {
    if (typeof document === 'undefined')
        return false;
    const body = document.body;
    return body === null ? false : body.hasAttribute(DARK_ATTR);
}
export function CodeMirrorSurface(props) {
    ensureComponentStyles('code-viewer', CODE_VIEWER_CSS);
    const { value, path, readOnly, onChange, overlay, className, style, height = '100%', lineNumbers = true } = props;
    const [dark, setDark] = useState(hostDark);
    /** 编辑器实例（定位到行要 dispatch scrollIntoView）。 */
    const viewRef = useRef(null);
    // 用户切主题 = 宿主 toggleAttribute 写 body[data-ds-dark-theme] ⇒ 用 MutationObserver 跟。
    // 挂载时先 sync 一次：插件挂载可能早于宿主写好该属性。
    useEffect(() => {
        if (typeof document === 'undefined' || typeof MutationObserver !== 'function')
            return;
        const body = document.body;
        if (body === null)
            return;
        const sync = () => { setDark(body.hasAttribute(DARK_ATTR)); };
        sync();
        const observer = new MutationObserver(sync);
        observer.observe(body, { attributeFilter: [DARK_ATTR] });
        return () => { observer.disconnect(); };
    }, []);
    const language = useMemo(() => languageForPath(path), [path]);
    const extensions = useMemo(() => [
        ...codeMirrorTheme(dark),
        EditorView.lineWrapping, // 默认全换行，避免横向滚动条
        ...(language !== null ? [language] : []),
    ], [dark, language]);
    // 定位到行：预览分页是逐步追加的，文本到了才能滚 ⇒ 跟着 value 再试一次。
    useEffect(() => {
        const view = viewRef.current;
        if (view === null || props.focusLine === undefined)
            return;
        if (props.focusLine > view.state.doc.lines)
            return;
        view.dispatch({ effects: EditorView.scrollIntoView(view.state.doc.line(props.focusLine).from, { y: 'center' }) });
    }, [value, props.focusLine]);
    return h('div', { className: `dshpc-cv${className ? ` ${className}` : ''}`, style }, overlay ?? null, h(CodeMirror, {
        value,
        className: 'dshpc-cv__editor dshpc-scroll-thin',
        // 明暗与语法配色交给官方：dark → oneDark（官方主题 + 完整 highlighter），
        // light → 官方亮色表面 + basicSetup 的 defaultHighlightStyle 兜底。
        // 核心 cmSurfaceTheme / cmSurfaceTint 在 extensions 里后注入，覆盖官方面板背景。
        theme: dark ? 'dark' : 'light',
        extensions,
        readOnly,
        onChange: onChange === undefined ? undefined : (next) => { onChange(next); },
        height,
        onCreateEditor: (view) => { viewRef.current = view; },
        style: { flex: '1 1 auto', minHeight: 0, overflow: 'hidden' },
        // 编辑辅助只在可编辑态打开：只读查看器不该有当前行高亮 / 补全 / 括号配对这些编辑噪音。
        basicSetup: {
            lineNumbers,
            foldGutter: false,
            highlightActiveLine: !readOnly,
            highlightActiveLineGutter: !readOnly,
            autocompletion: !readOnly,
            bracketMatching: true,
            closeBrackets: !readOnly,
            indentOnInput: !readOnly,
            searchKeymap: !readOnly,
        },
    }));
}
//# sourceMappingURL=code-mirror-surface.js.map