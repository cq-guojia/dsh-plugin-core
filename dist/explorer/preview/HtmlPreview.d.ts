import { createElement as h } from 'react';
import { type Translate } from '../../utils/i18n.js';
import { type WorkspaceFilesFace } from '../types.js';
/**
 * 把 HTML 字节做成官方同款的静态预览文档：剔除禁用标签/属性、head 首项插 CSP。
 * 真正的兜底是 iframe `sandbox=""`（禁脚本执行）+ CSP（禁一切外链）。
 */
export declare function buildStaticHtml(data: Uint8Array): string | undefined;
export interface HtmlPreviewProps {
    workspaceFiles: WorkspaceFilesFace;
    sessionId: string;
    path: string;
    /** true = 源码态（走 TextPreview + 256K 截断）。 */
    sourceView: boolean;
    translate?: Translate;
}
export declare function HtmlPreview(props: HtmlPreviewProps): ReturnType<typeof h>;
//# sourceMappingURL=HtmlPreview.d.ts.map