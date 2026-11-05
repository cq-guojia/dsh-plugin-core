import { type ReactElement } from 'react';
import type { Translate } from '../../../utils/i18n.js';
/** 官方 AskQuestionCard 只两态：有答案（dl/dt/dd）与无答案（verdict + 问题清单）。 */
export interface AskCardFace {
    kind: 'answered' | 'unanswered';
    questions: {
        id: string;
        question: string;
        answers?: string[];
    }[];
    verdict?: string;
    skippedLabel?: string;
}
/** 行面：摘要在行上，卡在展开体里；`state` 覆盖官方那两处强制态。 */
export interface AskFace {
    summary: string;
    card?: AskCardFace;
    state?: 'ok' | 'stopped';
}
/**
 * 可移植的 ask_user_question 行模型（官方 AskQuestionRow 2285-2360 的子集）。
 * @param name - 工具名（非 ask_user_question 一律 null）。
 * @param argsRaw - 调用参数 JSON。
 * @param output - 结算结果正文。
 * @param errorCode - root.error.code。
 * @param settled - 上游是否已结算。
 * @param t - 文案。
 * @returns 行面；条件不足返回 null（调用方落回通用卡）。
 */
export declare function askCardModel(name: string, argsRaw: string, output: string, errorCode: string | undefined, settled: boolean, t: Translate): AskFace | null;
/** 官方 AskQuestionCard（1285-1318）：无答案 = 判定语 + 问题清单；有答案 = 一问一答的 dl。 */
export declare function AskQuestionCardView({ card }: {
    card: AskCardFace;
}): ReactElement;
//# sourceMappingURL=AskCard.d.ts.map