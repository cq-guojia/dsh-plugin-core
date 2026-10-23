import { createElement as h } from 'react';
import type { Translate } from '../../utils/i18n.js';
/** 点变更文件出去的出口载荷：带「改动身份」，调用方据此开审阅（本包走文件预览 dock 的 content 槽）。 */
export interface ChangedFileReviewLocator {
    readonly sessionId: string;
    readonly seq: number;
    readonly index: number;
    /** 工作区相对路径（作审阅头）。 */
    readonly display: string;
}
export declare function ChangedFilesCard(props: {
    sessionId: string;
    seq: number;
    /** 点击出口：官方 openReview(index) 的等价物，带改动身份。无则整张卡不可点。 */
    onOpenReview?: (locator: ChangedFileReviewLocator) => void;
    t: Translate;
}): ReturnType<typeof h> | null;
//# sourceMappingURL=ChangedFilesCard.d.ts.map