import { createElement as h } from 'react';
import { type Translate } from '../../utils/i18n.js';
import { type OfficeToPdfFace } from '../types.js';
export interface OfficePreviewProps {
    officeToPdf: OfficeToPdfFace | null;
    sessionId: string;
    path: string;
    translate?: Translate;
}
export declare function OfficePreview(props: OfficePreviewProps): ReturnType<typeof h>;
//# sourceMappingURL=OfficePreview.d.ts.map