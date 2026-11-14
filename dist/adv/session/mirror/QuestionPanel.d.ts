import type { ReactElement } from 'react';
import type { Translate } from '../../../utils/i18n.js';
import { type PendingQuestionAnswerItem, type PendingQuestionCardState, type PendingQuestionItem } from '../pending-questions.js';
/** 官方 QuestionComposer.tsx:637-642：单选已选中某项 ⇒ 抑制自定义输入行的 focus-within 高亮。 */
export declare function customRowYielded(multiSelect: boolean, selectedCount: number): boolean;
export interface QuestionPanelProps {
    /** 卡片身份（官方 `PendingQuestion.key`），落到 `data-question-key`。 */
    panelKey?: string;
    /** 这一批题（官方 active 行的 questions）。 */
    questions: readonly PendingQuestionItem[];
    /** 载体态快照（只读兜底路径用）；不给按 `open` 画。 */
    card?: PendingQuestionCardState;
    /** 活体载体的态读取器（官方 `PendingQuestion.snapshot`，引用稳定）；给了就每次重渲染现读。 */
    readCard?: () => PendingQuestionCardState;
    /**
     * 作答通道（官方 `PendingQuestion.answer`）。缺席 = 只读：选项照常显示但不可点、没有底栏动作
     * （宿主没装题面板外壳包 / 只有投影时走这条）。
     */
    answer?: (answers: readonly PendingQuestionAnswerItem[]) => Promise<void>;
    /** 收起面板（官方 `dismiss()`，callId 卡只是离座、请求仍在）。缺席 = 不画关闭钮。 */
    dismiss?: () => void | Promise<void>;
    /**
     * 关闭钮的语义（官方 `pending.dismissal`）：`hide` = 只离座、可从工具调用重开；
     * `cancel` = 放弃整组问题（会真把请求撤销，官方还要求当前有活通道才允许）。默认按 `hide`。
     */
    dismissal?: 'hide' | 'cancel';
    /** 载体卡片态的订阅面（倒计时 / open↔continued）；缺席 = 静态快照。 */
    subscribeCard?: (listener: () => void) => () => void;
    t: Translate;
}
/**
 * 待答题目面板（官方 QuestionComposer 的 1:1 复刻）。
 * @param props - 题目批次、载体态与作答通道。
 */
export declare function QuestionPanel(props: QuestionPanelProps): ReactElement;
//# sourceMappingURL=QuestionPanel.d.ts.map