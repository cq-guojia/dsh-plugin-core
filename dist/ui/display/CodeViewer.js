/**
 * CodeViewer —— 只读源码查看器（替代官方 Shiki CodeBlock），DSH 共享底座版。
 *
 * 为什么换成 CodeMirror 6：官方 CodeBlock 把整篇 tokenize 成 <pre> + 每 token 一个
 * <span> 的巨型 DOM，拖动改宽会触发整棵子树重排，大文件首屏与拖拽都卡。CodeMirror
 * 是行级视图 + Lezer 增量高亮，宽度变化只重排可视区，天然不为整篇买单。
 *
 * 移植自兄弟项目 dsh-task-dispatch-table（src/client/ui/CodeViewer.tsx），按本仓约定重写：
 * 类名 dshpc-cv*、颜色吃 --dshpc-* token、官方图标 / writeClipboard 经 ui/official.ts 单一入口。
 *
 * 只读但可选中：底座用 <CodeMirror readOnly>（= EditorState.readOnly，挡住一切输入），
 * 不设置 editable=false —— 后者会把内容设为不可编辑并连带禁用鼠标选区，导致无法框选复制。
 * 需要可编辑请用同一子路径导出的 CodeEditor。
 *
 * 明暗判据（唯一）：body[data-ds-dark-theme]（见 design/style-kit.ts DARK_THEME_SELECTOR），
 * 禁用 prefers-color-scheme。
 */
import { createElement as h, useState } from 'react';
import { IconButton } from '../actions/Button.js';
import { writeClipboard } from '../official.js';
import { FontIcon } from './font-icon.js';
import { ensureComponentStyles } from '../infra/css.js';
import { CODE_VIEWER_CSS } from './code-viewer-css.js';
import { CodeMirrorSurface } from '../infra/code-mirror-surface.js';
export function CodeViewer(props) {
    // 复制钮用 .dshpc-cv__copy：谁用 dshpc 类名谁注入（与底座同一个域，幂等）。
    ensureComponentStyles('code-viewer', CODE_VIEWER_CSS);
    const { text, path, t, className, style, height = '100%', lineNumbers = true } = props;
    const [copied, setCopied] = useState(false);
    const copy = () => {
        void writeClipboard(text).then((ok) => {
            if (ok) {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
            }
        });
    };
    return h(CodeMirrorSurface, {
        value: text,
        path,
        readOnly: true,
        height,
        lineNumbers,
        className,
        style,
        focusLine: props.focusLine,
        overlay: h(IconButton, {
            variant: 'outline',
            size: 'md',
            icon: h(FontIcon, { name: copied ? 'common.base:gou' : 'common.base:fuzhi' }),
            label: copied ? t('codeCopied') : t('codeCopy'),
            className: 'dshpc-cv__copy',
            onClick: copy,
        }),
    });
}
//# sourceMappingURL=CodeViewer.js.map