import { createElement as h, type ReactNode } from 'react';
import type { Translate } from '../../utils/i18n.js';
import { type TurnTokenUsageFace } from './TurnUsagePanel.js';
/** 官方 AssistantContentBlock 的消费面（只用到 kind / text）。 */
interface ContentBlockFace {
    kind?: string;
    text?: string;
}
/** 官方 TurnTailChatData 的消费面（ui-chat contract/chat-nodes.d.ts:137）。 */
export interface TurnTailDataFace {
    turn: number;
    seq: number;
    closing: {
        time: number;
        blocks: ReadonlyArray<ContentBlockFace>;
    } | null;
    branchUnavailable?: boolean;
    tokenUsage?: TurnTokenUsageFace;
}
/** 官方 hasAssistantReplyContent。 */
export declare function hasAssistantReplyContent(blocks: ReadonlyArray<ContentBlockFace>): boolean;
/** Turn 尾部操作行：复制 / 分支 / 用量 / 结束时钟。 */
export declare function TurnTailNodeViewMirror(props: {
    data: TurnTailDataFace;
    /** 分支：以该轮 tail seq 截断开分支（undefined = 不渲染分支按钮）。 */
    onBranchAt?: (seq: number) => void;
    /** 官方 conversation.chat.turnTail 插槽内容（如 DeliverablesTail），渲染在操作行之前。 */
    tailSlot?: ReactNode;
    t: Translate;
}): ReturnType<typeof h> | null;
export {};
//# sourceMappingURL=TurnTailNodeView.d.ts.map