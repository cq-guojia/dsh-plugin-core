import type { ChatNodeFace, ProjectionStoreFace, SnapshotFace } from './faces.js';
import type { UiSessionFace } from './pending-approval.js';
/** 官方 questionSchema 里的一个选项。 */
export interface PendingQuestionOption {
    readonly label: string;
    readonly description?: string;
}
/** 官方 active 行里的一道题。 */
export interface PendingQuestionItem {
    readonly id: string;
    readonly question: string;
    readonly header?: string;
    readonly detail?: string;
    readonly options?: readonly PendingQuestionOption[];
    readonly multiSelect?: boolean;
}
/** 官方 active 行：`state === 'open'` 正在阻塞等答；`'continued'` 是已超时、可补答。 */
export interface PendingQuestionSet {
    readonly callId: string;
    readonly state: 'open' | 'continued';
    readonly questions: readonly PendingQuestionItem[];
}
/**
 * 官方 `ctx.userQuestionPanels`（外壳包 `ui-user-questions` 用 `ctx.reflect.provide` 提供，
 * `uqs_index.ts:376-379`）。本仓只用到 `reveal` 一个动作：官方题面板被收起后，卡还在外壳的私有表里，
 * 只有这个动作能把它放回 composer 座位（顺带重新出现在 `sessionStatus.pendingInteraction` 上）。
 */
export interface UserQuestionPanelsFace {
    /**
     * 把某次调用的作答面板放回 composer，排在其它待答之前。
     * @param sessionId - 这个 call 所属会话。
     * @param callId - `ask_user_question` 的工具调用 id。
     * @returns 那张卡还在、能放回来时为 true。
     */
    reveal(sessionId: string, callId: string): boolean;
}
/**
 * 从 chat 快照直接读「还没结算的 ask_user_question 调用」——投影缺席或暂时为空时的等价来源。
 * 官方 tool 卡就是这么判 pending 的（`model.state === 'running'`，ui-tool lib/client.js:2369），
 * 问题与选项都记在调用参数里，所以卡片能连选项一起画。
 * @param order - chat 快照的节点键顺序。
 * @param read - 按 key 读节点。
 * @returns 最后一组未结算的提问；没有则 null。
 */
export declare function pendingQuestionsFromNodes(order: readonly string[], read: (key: string) => ChatNodeFace | undefined): PendingQuestionSet | null;
/**
 * 订阅该会话当前待答的一组问题（官方一次只展示一组：`ahead of any other pending question`）。
 * 能力缺席（宿主没注册该投影）返回 null ⇒ 不画题卡。
 * @param projections - `session.projections`（与 inbox 同一入口）。
 */
export declare function openPendingQuestions(projections: ProjectionStoreFace | undefined): SnapshotFace<PendingQuestionSet | null> | null;
/** 一条作答（官方 `AskUserQuestionAnswerItem`）：选中项标签 + 可选自定义文本。 */
export interface PendingQuestionAnswerItem {
    readonly id: string;
    readonly selected: readonly string[];
    readonly custom?: string;
}
/** 题卡的活体态（官方 `QuestionCardSnapshot` 的消费子集）。 */
export interface PendingQuestionCardState {
    readonly state: 'open' | 'continued';
    /** 前台倒计时（请求没带 deadline 时缺席）。 */
    readonly countdown?: {
        readonly remainingMs: number;
        readonly running: boolean;
    };
    /** 当前有没有活通道（官方 `canSubmit = card.channel !== 'none'`）；`cancel` 型关闭要求它是活的。 */
    readonly channel?: 'waterfall' | 'rpc' | 'none';
}
/**
 * 官方 `PendingQuestion` 载体的消费面（`ui-user-questions` 注册进 `uiSession` 的
 * pending-interaction 域值）。`answer()` 是官方面板自己那条作答路径，内部按
 * waterfall（open）/ rpc（continued）择一。
 */
export interface PendingQuestionFace {
    readonly key: string;
    readonly kind: string;
    readonly questions: readonly PendingQuestionItem[];
    /** 已结算调用的回放（只读审阅卡）才有；活体请求没有。 */
    readonly review?: readonly PendingQuestionAnswerItem[];
    /**
     * 关闭面板的语义：`hide` 只是离座（可从工具调用重新打开，请求仍在）；
     * `cancel` 会真把请求取消掉。预览只对 `hide` 给关闭钮。
     */
    readonly dismissal?: 'hide' | 'cancel';
    snapshot(): PendingQuestionCardState;
    /** 卡片态变化（倒计时 / open↔continued）的订阅面。 */
    subscribe?(listener: () => void): () => void;
    answer(answer: {
        answers: readonly PendingQuestionAnswerItem[];
    }): Promise<void>;
    dismiss?(): Promise<void>;
}
/**
 * 官方 `QuestionComposer.parseRecommendedLabel`：把选项标签里的「(推荐) / (recommended)」尾缀
 * 拆出来做徽标，作答值仍用原标签。
 * @param label - 选项原始标签。
 * @returns 展示用标签 + 是否推荐。
 */
export declare function parseRecommendedLabel(label: string): {
    label: string;
    recommended: boolean;
};
/**
 * 官方 `recommendedOptions`：单选取「标记了推荐的第一项」，多选取全部推荐项（隐式草稿）。
 * @param question - 一道题。
 * @returns 该题默认勾选的标签。
 */
export declare function recommendedOptions(question: PendingQuestionItem): string[];
/** 弹窗交给 `QuestionPanel` 的作答入参（活体在就有，缺席就一个都不给 = 只读）。 */
export interface QuestionPanelWiring {
    answer?: (answers: readonly PendingQuestionAnswerItem[]) => Promise<void>;
    dismiss?: () => void | Promise<void>;
    dismissal?: 'hide' | 'cancel';
    subscribeCard?: (listener: () => void) => () => void;
    readCard?: () => PendingQuestionCardState;
}
/**
 * 由活体载体推出面板的作答入参。**作答与关闭钮是两件事**：两种 `dismissal` 官方都给关闭钮，
 * 只是语义不同 —— `hide`（有 callId）= 收起面板、可从工具调用重开；`cancel`（无 callId）= 放弃整组问题。
 * 所以这里永远给 `answer`，`dismiss` 只要载体有就给，语义交给 `dismissal` 区分。
 * @param live - 活体载体；undefined = 载体缺席 ⇒ 返回空对象，面板走只读。
 */
export declare function questionPanelWiring(live: PendingQuestionFace | undefined): QuestionPanelWiring;
/**
 * 订阅某个会话此刻的题卡活体（`uiSession.sessionStatus.pendingInteraction`，kind = 'question'）。
 * 能力缺席（没有 uiSession / 宿主没装题面板外壳包）返回 null ⇒ 题卡退回只读投影渲染。
 * @param uiSession - 宿主 client 服务 `uiSession`。
 * @param sessionId - 预览中的会话 id。
 */
export declare function openLiveQuestion(uiSession: UiSessionFace | undefined, sessionId: string): SnapshotFace<PendingQuestionFace | undefined> | null;
//# sourceMappingURL=pending-questions.d.ts.map