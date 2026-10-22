import { createElement as h } from 'react';
import type { ReactNode } from 'react';
import type { ChatNodeFace, ChatNodeStoreFace, NodeLocationFace, TurnLocationFace, TurnProcessPresentationFace, TurnProcessSpecFace } from '../faces.js';
/**
 * 官方 TURN_PROCESS_INDEPENDENT_KINDS（lib/client.js:1525）：这些 kind 永远不进过程折叠区。
 */
export declare const TURN_PROCESS_INDEPENDENT_KINDS: ReadonlySet<string>;
/**
 * 读过程席位快照。宿主 API 形态变了也只降级成「不折叠」，不让整个弹窗白屏。
 */
export declare function readPresentation(store: ChatNodeStoreFace | undefined, key: string): TurnProcessPresentationFace | undefined;
/** 交给节点视图的 Turn 过程席位（官方 owner.turnProcess，ChatNodeSeat.tsx:1693-1706）。 */
export interface TurnProcessHandle {
    spec?: TurnProcessSpecFace;
    foldable: boolean;
    hasContent: boolean;
    open: boolean;
    /** 官方 turnProcessAlwaysOpen(node)：live / 已停止 / 失败的 turn 不允许折叠。 */
    alwaysOpen: boolean;
    setOpen(open: boolean): void;
}
/** 节点视图渲染函数（官方 slot "conversation.chat.node" 的等价物）。 */
export type NodeRenderer = (node: ChatNodeFace, turnProcess: TurnProcessHandle | undefined, 
/** 官方 groupPart：'reasoning' 只渲染思考块（组内），'response' 只渲染回复正文（组外）。 */
groupPart?: 'response' | 'reasoning') => ReactNode;
/** 取节点所属 turn（官方 turnOf，ChatNodeSeat.tsx:1660）。 */
export declare function turnOf(node: ChatNodeFace | undefined): number | undefined;
/** 官方 turnProcessAlwaysOpen（lib/client.js:1558）：live / 已停止 / 失败的 turn 不折叠。 */
export declare function turnProcessAlwaysOpen(node: ChatNodeFace | undefined): boolean;
/** 一个 keyed 节点 → 一个 flowItem（官方 ChatNodeSeat 的 JSX 等价物）。 */
export declare function ChatNodeSeatMirror(props: {
    node: ChatNodeFace;
    groupPart?: 'response' | 'reasoning';
    store?: ChatNodeStoreFace;
    /** turn → 已展开的 answerStep（官方 store 的 storedTurnProcessEntry）。 */
    openState: ReadonlyMap<number, number>;
    onSetOpen(turn: number, answerStep: number, open: boolean): void;
    /** 官方 usePresentation(policy => policy.foldCompletedTurns)；历史只读视图恒 true。 */
    foldCompleted: boolean;
    renderNode: NodeRenderer;
}): ReturnType<typeof h> | null;
export type { NodeLocationFace, TurnLocationFace };
//# sourceMappingURL=ChatNodeSeat.d.ts.map