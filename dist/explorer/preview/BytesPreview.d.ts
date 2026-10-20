import { createElement as h } from 'react';
import { type Translate } from '../../utils/i18n.js';
import { type WorkspaceFilesFace } from '../types.js';
export interface BytesPreviewProps {
    workspaceFiles: WorkspaceFilesFace;
    sessionId: string;
    path: string;
    kind: 'image' | 'pdf';
    mime: string;
    translate?: Translate;
}
export declare function BytesPreview(props: BytesPreviewProps): ReturnType<typeof h>;
//# sourceMappingURL=BytesPreview.d.ts.map