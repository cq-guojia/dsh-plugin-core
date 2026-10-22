import type { ChatNodeFace } from '../faces.js';
import type { Translate } from '../../utils/i18n.js';
/** 官方 ProcessActivity（contract/process-groups.d.ts:2）。 */
export type ProcessActivity = 'read' | 'readImage' | 'search' | 'write' | 'edit' | 'commands' | 'code' | 'webSearch' | 'webFetch' | 'subagents' | 'plan' | 'questions' | 'tools';
/** 官方 ProcessGroupData（contract/process-groups.d.ts:15；归档场景 running 恒空）。 */
export interface ProcessGroupDataFace {
    turn: number;
    closed: boolean;
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
/** 官方 activity（10426-10449）：工具名 → 活动类别。 */
export declare function toolActivity(name: string): ProcessActivity;
/**
 * 官方 TurnGroups.rebuild 的移植：把 keyed 流切成「独立条目 + 过程分组」。
 * @param order - 官方渲染顺序（node key 列表）。
 * @param readNode - keyed 节点读取。
 * @param isTurnClosed - turn 是否已闭合（官方 turns.get(turn).status === 'closed'）。
 */
export declare function buildProcessGroups(order: readonly string[], readNode: (key: string) => ChatNodeFace | undefined, isTurnClosed: (turn: number) => boolean): GroupedView;
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