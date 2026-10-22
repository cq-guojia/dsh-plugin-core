/** 最小可观察快照（官方 ObservableSnapshot 的同构面）。 */
export interface SnapshotFace<T> {
    getSnapshot(): T;
    subscribe(fn: () => void): () => void;
}
/** 会话生命周期快照（官方 SessionSnapshot 的消费面子集）。 */
export interface SessionSnapshotFace {
    openState?: 'cold' | 'loading' | 'open' | 'error';
    hasMore?: boolean;
    loadingOlder?: boolean;
}
/**
 * 会话绑定（官方 SessionBinding 的消费面子集）。
 * open 幂等拉尾页；loadOlder 向前翻页（公开，但要求已 open）。均运行时探测调用。
 */
export interface SessionBindingFace {
    readonly sessionId: string;
    readonly session: SnapshotFace<SessionSnapshotFace> & {
        open?(): Promise<void>;
        loadOlder?(): Promise<void>;
    };
}
/** sessions 服务（官方 ISessions 的消费面）。retain 缺失时退化为「仅已物化会话可读」。 */
export interface SessionsFace {
    binding(id: string): SessionBindingFace | undefined;
    retain?(target: string, options: {
        source: string;
        signal?: AbortSignal;
    }): {
        release(): void;
    };
}
/** chat target 快照（官方 ChatSnapshot 的消费面子集）。 */
export interface ChatViewFace {
    /** 渲染顺序（官方 order：immutable 的 node key 列表）。 */
    readonly order?: readonly string[];
    /** keyed 节点仓库（官方 ChatNodeStore：get + processSource）。 */
    readonly nodes?: ChatNodeStoreFace;
    /** 时间线（官方 ConversationTimelineSnapshot：turnOrder / turns 供尾部行与分组收折判定）。 */
    readonly timeline?: {
        readonly turnOrder?: readonly number[];
        readonly turns?: TurnsFace;
    };
    /** 官方兼容投影（老 kind 名；仅在 order 缺失时兜底）。 */
    readonly legacy?: {
        readonly nodes?: readonly ConversationNodeLike[];
        readonly turnTimings?: ReadonlyMap<number, {
            startTime: number;
            endTime?: number;
        }>;
    };
}
/** keyed 节点仓库（官方 ChatNodeStore 的消费面：get + processSource）。 */
export interface ChatNodeStoreFace {
    get(key: string): ChatNodeFace | undefined;
    processSource(key: string): {
        getSnapshot(): TurnProcessPresentationFace | undefined;
    };
}
/** 官方 ConversationTimelineSnapshot.turns 的消费面（键为 number，兼容字符串键）。 */
export type TurnsFace = ReadonlyMap<number | string, {
    status?: 'open' | 'closed';
}>;
/** keyed ChatNode（官方 ChatConversationViewNode + ChatNodeDataMap[kind] 的消费面）。 */
export interface ChatNodeFace {
    key: string;
    kind: string;
    anchorSeq: number;
    data?: Record<string, unknown>;
    location?: NodeLocationFace;
}
/** 节点位置（官方 ConversationLocation 的消费面）。 */
export interface NodeLocationFace {
    kind?: string;
    turn?: TurnLocationFace;
}
/** Turn 位置（官方 TurnLocation 的消费面）。 */
export interface TurnLocationFace {
    turn: number;
    status?: 'open' | 'closed';
    start?: {
        time: number;
    };
    end?: {
        time: number;
        data?: {
            reason?: {
                kind?: string;
            };
        };
    };
}
/** 官方 TurnProcessChatData（ui-chat contract/chat-nodes.d.ts:83）。 */
export interface TurnProcessSpecFace {
    turn: number;
    controlAnchorSeq: number;
    processStartSeq: number;
    answerAnchorSeq: number | null;
    answerStep: number | null;
    inlineReasoning: boolean;
    messageCount: number;
    toolCallCount: number;
    subagentCount: number;
}
/** 官方 ChatTurnProcessPresentation 的消费面（processSource(key) 的快照）。 */
export interface TurnProcessPresentationFace {
    turn: number;
    spec?: TurnProcessSpecFace | null;
    turnStarted?: boolean;
    turnClosed?: boolean;
    hasExternalProcess?: boolean;
    hasInterleavedInput?: boolean;
    compactAnswer?: boolean;
}
/** uiConversation 服务（官方 UiConversation.binding 的消费面）。 */
export interface UiConversationFace {
    binding(source: SessionBindingFace): {
        target(target: 'chat'): SnapshotFace<ChatViewFace | undefined>;
    };
}
/**
 * 内容块（官方 ContentBlock 是 merge-extensible map）。
 * `attachment` = 官方 `FileAttachmentRef`（2026-10-03 核实：只有 attachmentId / name / bytes，
 * **没有路径**）⇒ 附件在 UI 上只能显示「图标 + 名字 + 大小」，点开走不了工作区路径。
 */
export interface ContentBlockLike {
    type: string;
    text?: string;
    attachment?: {
        attachmentId?: string;
        name?: string;
        bytes?: number;
    };
}
/** assistant 内容块（官方 AssistantBlock，records.d.ts:26-43）。 */
export type AssistantBlockLike = {
    kind: 'text';
    text: string;
} | {
    kind: 'reasoning';
    text: string;
} | {
    kind: 'image';
    attachment: unknown;
} | {
    kind: 'tool-call';
    callId: string;
    name: string;
    argsRaw: string;
} | {
    kind: 'other';
    block: unknown;
};
/** 渲染需要的节点公共字段。 */
interface NodeBaseLike {
    kind: string;
    seq: number;
    time: number;
}
/** 官方 ConversationNode 联合的渲染字段复述；kind 收窄靠 switch + fallback。 */
export type ConversationNodeLike = NodeBaseLike & {
    content?: readonly ContentBlockLike[];
    blocks?: readonly AssistantBlockLike[];
    call?: {
        name: string;
        argsRaw: string;
    } | null;
    isError?: boolean;
    error?: {
        name: string;
        code: string;
    };
    /** 官方 ToolResultNode.meta（tool-fs diffs / read 窗口；归档快照透传）。 */
    meta?: unknown;
    name?: string | null;
    args?: string | null;
    outcome?: {
        kind: 'success' | 'error';
        text?: string;
    } | null;
    message?: string;
    code?: string;
    turn?: number;
    retryState?: 'scheduled' | 'started' | 'cancelled';
    mode?: string;
    retry?: number;
    maxRetries?: number;
    delayMs?: number;
    failure?: {
        message?: string;
        code?: string;
    } | null;
    summary?: string | null;
    type?: string;
    data?: unknown;
};
export {};
//# sourceMappingURL=faces.d.ts.map