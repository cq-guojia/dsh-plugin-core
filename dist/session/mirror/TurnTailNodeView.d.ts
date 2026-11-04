import { createElement as h, type ReactNode } from 'react';
import type { Translate } from '../../utils/i18n.js';
import type { ChatNodeStoreFace } from '../faces.js';
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
        /** 官方 closing.finalNode.seq（判定「该轮之后还有内容」用）。 */
        finalNode?: {
            seq: number;
        };
    } | null;
    branchUnavailable?: boolean;
    tokenUsage?: TurnTokenUsageFace;
}
/** 官方 hasAssistantReplyContent。 */
export declare function hasAssistantReplyContent(blocks: ReadonlyArray<ContentBlockFace>): boolean;
/** 尾部操作行要的两个判定（官方用 nodeStore 快照算；这里按同一 order/store 预计算）。 */
export interface TurnTailFacts {
    /** 官方 endsWithResponse：操作行常显（true）还是悬停才显（false）。 */
    endsWithResponse(turn: number): boolean;
    /** 官方 hasLaterChatNode：该轮之后还有内容（分支不可用）。 */
    hasLaterChatNode(turn: number, anchorSeq: number): boolean;
}
/**
 * 按 order + nodeStore 预计算尾部事实。
 * @param props.order - 渲染顺序（官方 order）。
 * @param props.store - 节点仓库。
 * @param props.lastTurn - 最后一轮的 turn 号（官方 timeline.turnOrder.at(-1)）。
 */
export declare function buildTurnTailFacts(props: {
    order: readonly string[];
    store: ChatNodeStoreFace;
    lastTurn: number | undefined;
}): TurnTailFacts;
/** Turn 尾部操作行：复制 / 分支 / 用量 / 结束时钟。 */
export declare function TurnTailNodeViewMirror(props: {
    data: TurnTailDataFace;
    /** 分支：以该轮 tail seq 截断开分支（undefined = 不渲染分支按钮）。 */
    onBranchAt?: (seq: number) => void;
    /** 官方 conversation.chat.turnTail 插槽内容（如 DeliverablesTail），渲染在操作行之前。 */
    tailSlot?: ReactNode;
    /** 官方 endsWithResponse / hasLaterChatNode（undefined = 操作行常显、分支可用）。 */
    facts?: TurnTailFacts;
    t: Translate;
}): ReturnType<typeof h> | null;
export {};
//# sourceMappingURL=TurnTailNodeView.d.ts.map