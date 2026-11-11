import type { ChatNodeFace } from '../faces.js';
import type { Translate } from '../../../utils/i18n.js';
/** 官方 ProcessActivity（contract/process-groups.d.ts:2）。 */
export type ProcessActivity = 'read' | 'readImage' | 'search' | 'write' | 'edit' | 'commands' | 'code' | 'webSearch' | 'webFetch' | 'subagents' | 'plan' | 'questions' | 'tools';
/** 官方 ProcessGroupData（contract/process-groups.d.ts:15；归档场景 running 恒空）。 */
export interface ProcessGroupDataFace {
    turn: number;
    closed: boolean;
    /**
     * 所属 turn 在构建这一刻是否还开着（官方 liveProcess 的等价物）。
     * 组行据此强制展开：官方「思考中」的过程是摊开的，结束才收成一行。
     */
    live?: boolean;
    /**
     * 官方 `grouped`：这一组要不要画「已读取文件…」那行汇总壳。
     * 由呈现模式决定（`stepGrouping`）——**detailed（宿主默认）在轮次还开着时不分组**，
     * 条目直接平铺；写死 true 就会出现「官方摊开、我们收起」。
     */
    grouped?: boolean;
    summary: {
        counts: ReadonlyArray<{
            kind: ProcessActivity;
            count: number;
        }>;
    };
}
/** 官方 GroupSnapshot 的消费面。 */
export interface ProcessGroupSnapshot {
    key: string;
    members: ReadonlyArray<{
        key: string;
        groupPart?: 'response' | 'reasoning';
    }>;
    data: ProcessGroupDataFace;
}
/** 官方 RenderEntry：独立节点引用或过程分组引用。 */
export type ChatEntry = {
    kind: 'node';
    key: string;
    groupPart?: 'response' | 'reasoning';
} | {
    kind: 'group';
    key: string;
};
export interface GroupedView {
    entries: ChatEntry[];
    groups: ReadonlyMap<string, ProcessGroupSnapshot>;
}
/**
 * 官方呈现模式（ui-chat `chat-settings.ts` 的 `TRANSCRIPT_VIEW_MODES`）。
 * 默认取宿主默认值 `detailed`。
 */
export type TranscriptViewMode = 'compact' | 'standard' | 'detailed' | 'verbose';
/** 宿主默认呈现模式（ui-chat lib/client.js:14814 `DEFAULT_TRANSCRIPT_VIEW_MODE = "detailed"`）。 */
export declare const DEFAULT_TRANSCRIPT_VIEW_MODE: TranscriptViewMode;
/** 官方 activity（10426-10449）：工具名 → 活动类别。 */
export declare function toolActivity(name: string): ProcessActivity;
/**
 * 官方 TurnGroups.rebuild 的移植：把 keyed 流切成「独立条目 + 过程分组」。
 * @param order - 官方渲染顺序（node key 列表）。
 * @param readNode - keyed 节点读取。
 * @param isTurnClosed - turn 是否已闭合（官方 turns.get(turn).status === 'closed'）。
 */
export declare function buildProcessGroups(order: readonly string[], readNode: (key: string) => ChatNodeFace | undefined, isTurnClosed: (turn: number) => boolean, 
/** 官方 `transcriptView`（宿主默认 detailed）：决定 `stepGrouping`，即要不要分组。 */
mode?: TranscriptViewMode): GroupedView;
/**
 * 官方 processTitle（1820-1836）：closed 组标题 = 前 3 类活动拼接
 * （2 类用「A并B」且去「已」前缀；≥3 类用「，」连接、超 3 类补「等」）。
 */
export declare function processTitle(summary: {
    counts: ReadonlyArray<{
        kind: ProcessActivity;
    }>;
}, t: Translate): string;
//# sourceMappingURL=process-groups.d.ts.map