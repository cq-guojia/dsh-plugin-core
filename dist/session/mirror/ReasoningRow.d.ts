import { createElement as h } from 'react';
import type { Translate } from '../../utils/i18n.js';
/** 思考行：折叠 = 「思考 · 首行预览 ⌄」；展开 = thinkBody 全文（MarkdownText compact）。 */
export declare function ReasoningRowMirror(props: {
    text: string;
    running?: boolean;
    /** 官方 preview 政策（settledReasoningPreview）：完成后是否仍显示首行预览。 */
    preview?: boolean;
    t: Translate;
}): ReturnType<typeof h> | null;
//# sourceMappingURL=ReasoningRow.d.ts.map