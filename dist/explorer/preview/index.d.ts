import { createElement as h } from 'react';
import { type Translate } from '../../utils/i18n.js';
import { type OfficeToPdfFace } from '../types.js';
import type { FsFace } from '../fs-face.js';
export { BytesPreview, type BytesPreviewProps } from './BytesPreview.js';
export { HtmlPreview, buildStaticHtml, type HtmlPreviewProps } from './HtmlPreview.js';
export { OfficePreview, type OfficePreviewProps } from './OfficePreview.js';
export { TextPreview, type TextPreviewProps } from './TextPreview.js';
export interface FilePreviewProps {
    /** 只读文件面（绝对路径）。 */
    files: FsFace;
    /** Office 预览要的会话；可省 ⇒ 预览体按宿主工作区快照自己挑一条。 */
    sessionId?: string;
    path: string;
    /** 官方 remote.officeToPdf；未就位传 null ⇒ Office 文件出「不可用」空态。 */
    officeToPdf?: OfficeToPdfFace | null;
    /** true = 源码态（md/html 生效）。 */
    sourceView?: boolean;
    translate?: Translate;
}
export declare function FilePreview(props: FilePreviewProps): ReturnType<typeof h> | null;
//# sourceMappingURL=index.d.ts.map