import { createElement as h } from 'react';
import { type Translate } from '../../utils/i18n.js';
import { type WorkspaceFilesFace } from '../types.js';
export interface FilePreviewProps {
    workspaceFiles: WorkspaceFilesFace;
    sessionId: string;
    path: string;
    translate?: Translate;
}
/** 单文件预览：文本 / 图片 / 不支持（明确兜底，不硬撑）。 */
export declare function FilePreview(props: FilePreviewProps): ReturnType<typeof h>;
//# sourceMappingURL=index.d.ts.map