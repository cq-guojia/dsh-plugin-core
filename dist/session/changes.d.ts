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
 * 官方 CHANGES_DIFF_PATH（client.js）的文档相对路由：单文件某轮首尾对比的只读 GET。
 * 与 `changesSummaryUrl` 同属宿主 changes 服务（鉴权随宿主会话，裸 fetch 同机制）。
 */
export declare function changesDiffUrl(sessionId: string, seq: number, index: number): string;
/** 官方 DiffHunk（isHunk 校验字段）。lines 每行以 `+` / `-` / ` ` 开头。 */
export interface DiffHunk {
    readonly oldStart: number;
    readonly oldLines: number;
    readonly newStart: number;
    readonly newLines: number;
    readonly lines: readonly string[];
}
/** 官方 ChangesDiff（isChangesDiff 校验字段）：text 对比或 binary / oversized 拒读。 */
export interface ChangesDiff {
    readonly kind: 'text' | 'binary' | 'oversized';
    readonly path: string;
    readonly display: string;
    readonly before?: boolean;
    readonly after?: boolean;
    readonly coarse?: boolean;
    readonly hunks?: readonly DiffHunk[];
}
/** 官方 isChangesDiff（client.js）：不合规返回 null（官方按 missing 处理）。 */
export declare function parseChangesDiff(value: unknown): ChangesDiff | null;
/** 官方 MAX_RENDERED_LINES：超过即截断（出 diff.truncated 提示），防巨型对比卡死预览。 */
export declare const DIFF_MAX_RENDERED_LINES = 5000;
/** 官方 DiffRow：行号计算后的一行（上下文双边计数，删计旧边，增计新边）。 */
export interface DiffRow {
    readonly kind: 'add' | 'del' | 'context';
    readonly old: number | undefined;
    readonly new: number | undefined;
    readonly text: string;
}
/** 官方 hunkRows（client.js）。 */
export declare function hunkRows(hunk: DiffHunk): readonly DiffRow[];
/** 官方 hunkHeader：`@@ -oldStart,oldLines +newStart,newLines @@`。 */
export declare function hunkHeader(hunk: DiffHunk): string;
/** 官方 noteOf：新建 / 删除 / 无变化 的提示键（无提示 = undefined）。 */
export declare function diffNoteKey(diff: ChangesDiff): 'diffCreated' | 'diffDeleted' | 'diffUnchanged' | undefined;
/**
 * 某 turn 的 `workspace/changes` 事件 seq（官方 changesForClosing：读 turn.data 的
 * `deliverables.changes`）。没有公告 = null（官方此时不挂卡）。
 */
export declare function turnDeliverablesChangesSeq(face: unknown): number | null;
//# sourceMappingURL=changes.d.ts.map