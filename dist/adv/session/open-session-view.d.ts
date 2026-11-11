import type { ChatViewFace, MessageImageLoader, SessionSnapshotFace, SessionsFace, SnapshotFace, UiConversationFace } from './faces.js';
import { type PendingApprovalFace, type UiSessionFace } from './pending-approval.js';
import { type PendingQuestionFace, type PendingQuestionSet, type UserQuestionPanelsFace } from './pending-questions.js';
/** 弹窗数据源：已解析的 target 与向前翻页句柄；解析失败给 null。 */
export interface SessionViewTarget {
    readonly target: SnapshotFace<ChatViewFace | undefined>;
    /** 向前翻一页更早的历史（官方 loadOlder；未 open / 翻尽时官方自行空转）。 */
    loadOlder(): void;
    readonly session: SnapshotFace<SessionSnapshotFace>;
    /** 官方 `inbox` 投影面（faceOf('inbox')）：首轮等待期用户消息的 host 侧真源。 */
    readonly inbox: SnapshotFace<unknown>;
    /**
     * 图片 loader = 官方 `uiConversation.imageUrl` 绑本会话（图要授权，弹窗自己拿不到 URL）。
     * 缺席（老宿主没有该方法）= 图片块退回「[图片]」文本占位，不画空框。
     */
    readonly loadImage?: MessageImageLoader;
    /**
     * 「等待审批」在线请求面（`uiSession.sessionStatus` 派生；见 pending-approval.ts）。
     * null = 调用方没给 uiSession / 宿主没这服务 ⇒ 弹窗不画审批卡。只在该会话**此刻真在等审批**时有值。
     */
    readonly pendingApproval: SnapshotFace<PendingApprovalFace | undefined> | null;
    /**
     * 待答题卡的**活体**（`uiSession.sessionStatus.pendingInteraction`，kind = 'question'）。
     * 有值时题面板可作答（`answer()` 是官方面板同一条路）；null / 无值 ⇒ 退回下面的只读投影。
     */
    readonly pendingQuestion: SnapshotFace<PendingQuestionFace | undefined> | null;
    /**
     * 「选择题卡」的只读兜底（官方 `userQuestions` 投影里的第一组待答问题）。
     * null = 宿主没注册该投影；只在活体缺席时用于按官方面板形态只读渲染（有选项、不可点）。
     */
    readonly pendingQuestions: SnapshotFace<PendingQuestionSet | null> | null;
    /**
     * 把官方题面板放回 composer（官方 `userQuestionPanels.reveal`）：题卡被收起后，载体会从
     * `pendingInteraction` 上消失，调它一次就能回来，预览里的面板随之可作答。
     * null = 调用方没给 `userQuestionPanels` 服务。
     */
    readonly revealPendingQuestion: ((callId: string) => boolean) | null;
    /** 释放 sessions.retain 引用（弹窗关闭时必调；否则会话 scope 永不回收）。 */
    dispose(): void;
}
/** 默认 retain source（写进宿主 retainedBy；调用方可覆盖成自己的插件名）。 */
export declare const DEFAULT_RETAIN_SOURCE = "dsh-plugin-core";
/** 打开只读视图：物化 binding → 探测拉尾页 → 建 chat target。会话不可解析时返回 null。 */
export declare function openSessionView(sessions: SessionsFace, uiConversation: UiConversationFace, id: string, 
/** retain 引用记进宿主 retainedBy 的键；默认 'dsh-plugin-core'。 */
retainSource?: string, 
/** 宿主 `uiSession` 服务：给了才会接「等待审批」那条链（缺席 = 不渲染审批卡）。 */
uiSession?: UiSessionFace, 
/**
 * 宿主 `userQuestionPanels` 服务（外壳包 `ui-user-questions` 提供）。
 * 只用一个动作：`reveal(sessionId, callId)` —— 官方题面板被收起后，把那张卡重新放回 composer，
 * 顺便让它重新出现在 `sessionStatus.pendingInteraction` 上（于是预览里的面板就能作答）。
 */
questionPanels?: UserQuestionPanelsFace): SessionViewTarget | null;
//# sourceMappingURL=open-session-view.d.ts.map