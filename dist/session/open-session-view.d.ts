import type { ChatViewFace, SessionSnapshotFace, SessionsFace, SnapshotFace, UiConversationFace } from './faces.js';
/** 弹窗数据源：已解析的 target 与向前翻页句柄；解析失败给 null。 */
export interface SessionViewTarget {
    readonly target: SnapshotFace<ChatViewFace | undefined>;
    /** 向前翻一页更早的历史（官方 loadOlder；未 open / 翻尽时官方自行空转）。 */
    loadOlder(): void;
    readonly session: SnapshotFace<SessionSnapshotFace>;
    /** 释放 sessions.retain 引用（弹窗关闭时必调；否则会话 scope 永不回收）。 */
    dispose(): void;
}
/** 默认 retain source（写进宿主 retainedBy；调用方可覆盖成自己的插件名）。 */
export declare const DEFAULT_RETAIN_SOURCE = "dsh-plugin-core";
/** 打开只读视图：物化 binding → 探测拉尾页 → 建 chat target。会话不可解析时返回 null。 */
export declare function openSessionView(sessions: SessionsFace, uiConversation: UiConversationFace, id: string, 
/** retain 引用记进宿主 retainedBy 的键；默认 'dsh-plugin-core'。 */
retainSource?: string): SessionViewTarget | null;
//# sourceMappingURL=open-session-view.d.ts.map