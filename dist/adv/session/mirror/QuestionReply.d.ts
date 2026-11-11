import type { ReactElement } from 'react';
import type { Translate } from '../../../utils/i18n.js';
/** 官方 `QuestionReplyQuestion`：一批里的一道题（只留展示需要的字段）。 */
export interface QuestionReplyQuestionFace {
    readonly id: string;
    readonly question: string;
    readonly header?: string;
}
/** 官方 `QuestionReplyAnswer`。 */
export interface QuestionReplyAnswerFace {
    readonly id: string;
    readonly selected?: readonly string[];
    readonly custom?: string;
}
/** 官方 `QuestionReplyData`（会话节点 data）。 */
export interface QuestionReplyDataFace {
    readonly callId?: string;
    readonly outcome?: string;
    readonly questions?: readonly QuestionReplyQuestionFace[];
    readonly answers?: readonly QuestionReplyAnswerFace[];
    /** 题面解析不出来时的原话（model-facing payload）。 */
    readonly text?: string;
    readonly time?: number | Date | string;
}
/**
 * 官方 `replyAnswerValues`：某题的作答值 = 选中项按原顺序 + 非空自定义文本。
 * @param data - 一条 reply 节点数据。
 * @param id - 题目 id。
 * @returns 展示用的作答值，空数组表示这题被跳过。
 */
export declare function replyAnswerValues(data: QuestionReplyDataFace, id: string): string[];
/**
 * 官方 `replyClipboardText`：每题「题（组标题 — 题干）+ 作答」一段，题面读不出来时退回原话。
 * @param data - 一条 reply 节点数据。
 * @param t - 翻译函数。
 * @returns 可复制的纯文本。
 */
export declare function replyClipboardText(data: QuestionReplyDataFace, t: Translate): string;
/**
 * 已作答/已跳过的一批题（官方 `QuestionReplyBubble`）：右对齐气泡，题在上、答案在下，带时间与复制。
 * @param props - 节点数据与翻译函数。
 */
export declare function QuestionReplyBubble(props: {
    data: QuestionReplyDataFace;
    t: Translate;
}): ReactElement;
//# sourceMappingURL=QuestionReply.d.ts.map