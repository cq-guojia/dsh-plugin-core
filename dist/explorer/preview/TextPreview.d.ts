import { createElement as h } from 'react';
import { type Translate } from '../../utils/i18n.js';
import { type WorkspaceFilesFace } from '../types.js';
export interface TextPreviewProps {
    workspaceFiles: WorkspaceFilesFace;
    sessionId: string;
    path: string;
    /** 是否 md（决定默认渲染态）。 */
    markdown: boolean;
    /** true = 源码态（md/html 由面板工具条切换）。 */
    sourceView: boolean;
    /** 字节上限：超出即截断 + 横幅，且不出「加载更多」（HTML 源码态用）。 */
    maxBytes?: number;
    translate?: Translate;
}
export declare function TextPreview(props: TextPreviewProps): ReturnType<typeof h>;
//# sourceMappingURL=TextPreview.d.ts.map