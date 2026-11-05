import { createElement as h } from 'react';
import { type Translate } from '../../../utils/i18n.js';
import { type OfficeToPdfFace } from '../types.js';
export interface OfficePreviewProps {
    officeToPdf: OfficeToPdfFace | null;
    /** 会话可省：缺省按宿主工作区快照挑「最近有会话」那条（授权探针只要求一条有效会话）。 */
    sessionId?: string;
    path: string;
    translate?: Translate;
}
export declare function OfficePreview(props: OfficePreviewProps): ReturnType<typeof h>;
//# sourceMappingURL=OfficePreview.d.ts.map