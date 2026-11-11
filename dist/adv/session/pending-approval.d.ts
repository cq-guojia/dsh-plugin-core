import type { SnapshotFace } from './faces.js';
/** 官方 `ApprovalDecision`（ui-approval contract/slots.d.ts:62）只有两档；「始终允许」属权限预设。 */
export type ApprovalDecision = 'allowed-once' | 'rejected';
/** `PendingApproval` 的消费面（只复述渲染 / 作答要用的字段）。 */
export interface PendingApprovalFace {
    readonly key: string;
    readonly kind: string;
    readonly sessionId?: string;
    readonly toolName: string;
    readonly callId?: string;
    readonly reason?: string;
    /** 请求方给的本地化文案表（`{ en, zh, … }`），官方按当前 UI 语言挑。 */
    readonly displayReason?: Readonly<Record<string, string>>;
    readonly answerable: boolean;
    answer(outcome: ApprovalDecision): Promise<void>;
}
/** `uiSession` 服务的消费面（只取根状态快照）。 */
export interface UiSessionFace {
    readonly sessionStatus?: SnapshotFace<ReadonlyMap<string, {
        readonly pendingInteraction?: unknown;
    }>>;
}
/**
 * 订阅某个会话的待审批请求。能力缺席（没有 uiSession / 没 active 快照面）返回 null ⇒ 弹窗不画卡。
 * @param uiSession - 宿主 client 服务 `uiSession`。
 * @param sessionId - 预览中的会话 id。
 */
export declare function openPendingApproval(uiSession: UiSessionFace | undefined, sessionId: string): SnapshotFace<PendingApprovalFace | undefined> | null;
//# sourceMappingURL=pending-approval.d.ts.map