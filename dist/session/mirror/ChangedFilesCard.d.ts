import { createElement as h } from 'react';
import type { Translate } from '../../utils/i18n.js';
export declare function ChangedFilesCard(props: {
    sessionId: string;
    seq: number;
    /** 单文件卡的打开出口（调用方的文件预览口子）。 */
    onOpen?: (path: string) => void;
    t: Translate;
}): ReturnType<typeof h> | null;
//# sourceMappingURL=ChangedFilesCard.d.ts.map