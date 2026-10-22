// 官方「已编辑文件」卡（ChangedFiles）的数据契约。
//
// 事实（解包 @deepseek-ai/dsh-client-ui-deliverables@0.2.1-rc.2 lib/client.js）：
//   · turn 级 `deliverables.changes = { seq }` 由 `workspace/changes` 事件写进**同一份**
//     turn.data Map（presented 也在里面，见 SessionViewModal.turnDeliverablesPresented）；
//   · 卡内容走宿主只读路由 `GET api/changes.summary?sessionId&seq`（官方
//     ChangesSummaryStore 用裸 fetch，鉴权随宿主会话，插件同样拿得到）；
//   · 载荷校验逐字段复刻官方 isChangesSummary / isChangedFile（client.js:34-53）——
//     拿不到 / 不合规 = 不渲染，不猜数据、不造假。
/** 官方 changesSummaryUrl（client.js:90-96）：文档相对路由。 */
export function changesSummaryUrl(sessionId, seq) {
    return `api/changes.summary?${new URLSearchParams({ sessionId, seq: String(seq) })}`;
}
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isInt = (value) => typeof value === 'number' && Number.isSafeInteger(value);
/** 官方 isChangedFile（client.js:34-42）。 */
function isChangedFile(value) {
    if (!isRecord(value))
        return false;
    const { path, display, added, deleted, binary, oversized } = value;
    return typeof path === 'string' && path.length > 0
        && typeof display === 'string' && display.length > 0
        && isInt(added) && isInt(deleted)
        && (binary === undefined || binary === true)
        && (oversized === undefined || oversized === true);
}
/** 官方 isChangesSummary（client.js:49-53）：不合规返回 null（官方按 missing 处理）。 */
export function parseChangesSummary(value) {
    if (!isRecord(value))
        return null;
    const { turn, files, total, added, deleted } = value;
    if (!isInt(turn) || turn < 1)
        return null;
    if (!isInt(total) || !isInt(added) || !isInt(deleted))
        return null;
    if (!Array.isArray(files) || !files.every(isChangedFile))
        return null;
    return { turn, total, added, deleted, files: files };
}
/**
 * 读某 turn 的 turn 级业务值（官方 `TurnLocation.data`：`ConversationLocationDataStore`，
 * 用 `.get(key)` 读，**不是 Map 也不是普通对象** —— conversation.d.ts:87-95）。
 * 兼容 Map / 纯对象两种形态只为容忍宿主改版；官方契约就是 `.get`。
 */
export function turnDeliverablesValue(face, key) {
    const data = face?.data;
    if (data === undefined || data === null)
        return undefined;
    const get = data.get;
    if (typeof get === 'function')
        return get.call(data, key);
    if (data instanceof Map)
        return data.get(key);
    return data[key];
}
// ── diff（官方 `/api/changes.diff`，ChangedFilePreview 的数据面） ──
/**
 * 官方 CHANGES_DIFF_PATH（client.js）的文档相对路由：单文件某轮首尾对比的只读 GET。
 * 与 `changesSummaryUrl` 同属宿主 changes 服务（鉴权随宿主会话，裸 fetch 同机制）。
 */
export function changesDiffUrl(sessionId, seq, index) {
    return `api/changes.diff?${new URLSearchParams({ sessionId, seq: String(seq), index: String(index) })}`;
}
/** 官方 isHunk（client.js）。 */
function isDiffHunk(value) {
    if (!isRecord(value))
        return false;
    const { oldStart, oldLines, newStart, newLines, lines } = value;
    return [oldStart, oldLines, newStart, newLines].every((field) => isInt(field) && field >= 0)
        && Array.isArray(lines)
        && lines.every((line) => typeof line === 'string' && /^[+ -]/.test(line));
}
/** 官方 isChangesDiff（client.js）：不合规返回 null（官方按 missing 处理）。 */
export function parseChangesDiff(value) {
    if (!isRecord(value))
        return null;
    const { kind, path, display, before, after, coarse, hunks } = value;
    if (typeof path !== 'string' || path.length === 0 || typeof display !== 'string' || display.length === 0)
        return null;
    if (kind === 'binary' || kind === 'oversized') {
        return kind === 'binary'
            ? { kind: 'binary', path, display }
            : { kind: 'oversized', path, display };
    }
    if (kind !== 'text')
        return null;
    if (typeof before !== 'boolean' || typeof after !== 'boolean' || typeof coarse !== 'boolean')
        return null;
    if (!Array.isArray(hunks) || !hunks.every(isDiffHunk))
        return null;
    return { kind: 'text', path, display, before, after, coarse, hunks: hunks };
}
/** 官方 MAX_RENDERED_LINES：超过即截断（出 diff.truncated 提示），防巨型对比卡死预览。 */
export const DIFF_MAX_RENDERED_LINES = 5000;
/** 官方 hunkRows（client.js）。 */
export function hunkRows(hunk) {
    let oldNo = hunk.oldStart;
    let newNo = hunk.newStart;
    return hunk.lines.map((line) => {
        const text = line.slice(1);
        switch (line[0]) {
            case '+':
                return { kind: 'add', old: undefined, new: newNo++, text };
            case '-':
                return { kind: 'del', old: oldNo++, new: undefined, text };
            default:
                return { kind: 'context', old: oldNo++, new: newNo++, text };
        }
    });
}
/** 官方 hunkHeader：`@@ -oldStart,oldLines +newStart,newLines @@`。 */
export function hunkHeader(hunk) {
    return `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`;
}
/** 官方 noteOf：新建 / 删除 / 无变化 的提示键（无提示 = undefined）。 */
export function diffNoteKey(diff) {
    if (diff.before === false)
        return 'diffCreated';
    if (diff.after === false)
        return 'diffDeleted';
    if ((diff.hunks?.length ?? 0) === 0)
        return 'diffUnchanged';
    return undefined;
}
/**
 * 某 turn 的 `workspace/changes` 事件 seq（官方 changesForClosing：读 turn.data 的
 * `deliverables.changes`）。没有公告 = null（官方此时不挂卡）。
 */
export function turnDeliverablesChangesSeq(face) {
    const changes = turnDeliverablesValue(face, 'deliverables')?.changes;
    const seq = changes?.seq;
    return isInt(seq) ? seq : null;
}
//# sourceMappingURL=changes.js.map