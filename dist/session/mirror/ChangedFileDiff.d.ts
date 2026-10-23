import { type ReactNode } from 'react';
import { type Translate } from '../../utils/i18n.js';
/** 一个变更文件的 diff 体（状态机 + unified 行渲染）。 */
export declare function ChangedFileDiff(props: {
    sessionId: string;
    seq: number;
    index: number;
    /** 官方 display（工作区相对路径，作卡头）。 */
    display: string;
    /** 文案翻译；缺省用核心字典（demo 自带字典不认 changes/diff 这些 key）。 */
    t?: Translate;
}): ReactNode;
//# sourceMappingURL=ChangedFileDiff.d.ts.map