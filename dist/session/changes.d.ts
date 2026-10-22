/** 一个被改的文件（官方 isChangedFile）。 */
export interface ChangedFile {
    readonly path: string;
    readonly display: string;
    readonly added: number;
    readonly deleted: number;
    readonly binary?: true;
    readonly oversized?: true;
}
/** 一轮的改动汇总（官方 isChangesSummary）。 */
export interface ChangesSummary {
    readonly turn: number;
    readonly total: number;
    readonly added: number;
    readonly deleted: number;
    readonly files: readonly ChangedFile[];
}
/** 官方 changesSummaryUrl（client.js:90-96）：文档相对路由。 */
export declare function changesSummaryUrl(sessionId: string, seq: number): string;
/** 官方 isChangesSummary（client.js:49-53）：不合规返回 null（官方按 missing 处理）。 */
export declare function parseChangesSummary(value: unknown): ChangesSummary | null;
/**
 * 读某 turn 的 turn 级业务值（官方 `TurnLocation.data`：`ConversationLocationDataStore`，
 * 用 `.get(key)` 读，**不是 Map 也不是普通对象** —— conversation.d.ts:87-95）。
 * 兼容 Map / 纯对象两种形态只为容忍宿主改版；官方契约就是 `.get`。
 */
export declare function turnDeliverablesValue(face: unknown, key: string): unknown;
/**
 * 某 turn 的 `workspace/changes` 事件 seq（官方 changesForClosing：读 turn.data 的
 * `deliverables.changes`）。没有公告 = null（官方此时不挂卡）。
 */
export declare function turnDeliverablesChangesSeq(face: unknown): number | null;
//# sourceMappingURL=changes.d.ts.map