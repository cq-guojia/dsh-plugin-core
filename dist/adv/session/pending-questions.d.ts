import type { ProjectionStoreFace, SnapshotFace } from './faces.js';
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
 * 订阅该会话当前待答的一组问题（官方一次只展示一组：`ahead of any other pending question`）。
 * 能力缺席（宿主没注册该投影）返回 null ⇒ 不画题卡。
 * @param projections - `session.projections`（与 inbox 同一入口）。
 */
export declare function openPendingQuestions(projections: ProjectionStoreFace | undefined): SnapshotFace<PendingQuestionSet | null> | null;
//# sourceMappingURL=pending-questions.d.ts.map