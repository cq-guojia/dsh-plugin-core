// 单文件预览分派：按扩展名选预览体（image/pdf/md/html/office/text），认不出 ⇒ 明确兜底。
// md/html 的「渲染 ⇄ 源码」由面板工具条切 sourceView 传进来。
import { createElement as h } from 'react';
import { ensureControls } from '../../ui/css.js';
import { t } from '../../utils/i18n.js';
import { previewInfoOf } from '../types.js';
import { BytesPreview } from './BytesPreview.js';
import { HtmlPreview } from './HtmlPreview.js';
import { OfficePreview } from './OfficePreview.js';
import { TextPreview } from './TextPreview.js';
export { BytesPreview } from './BytesPreview.js';
export { HtmlPreview, buildStaticHtml } from './HtmlPreview.js';
export { OfficePreview } from './OfficePreview.js';
export { TextPreview } from './TextPreview.js';
export function FilePreview(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const info = previewInfoOf(props.path);
    const sourceView = props.sourceView === true;
    switch (info.kind) {
        case 'image':
        case 'pdf':
            return h(BytesPreview, {
                workspaceFiles: props.workspaceFiles,
                sessionId: props.sessionId,
                path: props.path,
                kind: info.kind,
                mime: info.mime ?? 'application/octet-stream',
                translate: tt,
            });
        case 'office':
            return h(OfficePreview, {
                officeToPdf: props.officeToPdf ?? null,
                sessionId: props.sessionId,
                path: props.path,
                translate: tt,
            });
        case 'html':
            return h(HtmlPreview, {
                workspaceFiles: props.workspaceFiles,
                sessionId: props.sessionId,
                path: props.path,
                sourceView,
                translate: tt,
            });
        case 'md':
        case 'text':
            return h(TextPreview, {
                workspaceFiles: props.workspaceFiles,
                sessionId: props.sessionId,
                path: props.path,
                markdown: info.kind === 'md',
                sourceView,
                translate: tt,
            });
    }
    // switch 已穷尽 PreviewKind；保留 return 满足 TS 控制流分析
    return null;
}
//# sourceMappingURL=index.js.map