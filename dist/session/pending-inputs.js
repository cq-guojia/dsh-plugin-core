/** 官方 observedInputs：durable user 节点 source.rpcId（本地回显被持久节点取代的判据）。 */
export function observedRpcIds(order, readNode) {
    const ids = new Set();
    for (const key of order) {
        const source = readNode(key)?.data?.source;
        if (typeof source !== 'object' || source === null)
            continue;
        const face = source;
        if (face.kind === 'user' && typeof face.rpcId === 'string')
            ids.add(face.rpcId);
    }
    return ids;
}
/** 官方 visibleSubmissions：queued 不走回显气泡；已被 durable 节点取代的不重复画。 */
export function visiblePendingInputs(pending, observed) {
    if (pending === undefined)
        return [];
    return pending.filter(item => item.placement !== 'queued' && !observed.has(item.requestId));
}
/** 回显附件 → 附件卡数据（只取官方已有的真实名字/大小；图片预览需宿主 loadImage，不造）。 */
export function pendingFiles(item) {
    const out = [];
    for (const attachment of item.attachments ?? []) {
        const value = attachment.value;
        if (typeof value?.name !== 'string' || value.name === '')
            continue;
        out.push({ name: value.name, bytes: typeof value.bytes === 'number' ? value.bytes : 0 });
    }
    return out;
}
const EMPTY_FILES = [];
/** inbox 投影里的用户消息：官方只看 next-step，首轮唤醒新 turn 的消息在 next-turn ⇒ 两条队列都要。 */
function inboxUserMessages(inbox) {
    if (typeof inbox !== 'object' || inbox === null)
        return [];
    const rec = inbox;
    const out = [];
    for (const target of ['next-turn', 'next-step']) {
        const list = rec[target];
        if (!Array.isArray(list))
            continue;
        for (const item of list) {
            if (typeof item !== 'object' || item === null)
                continue;
            const msg = item;
            if (msg.source?.kind !== 'user')
                continue;
            out.push(msg);
        }
    }
    return out;
}
/** content 块 → 文本 / 附件：只取官方真实字段，字段缺席不编造。 */
function inboxContent(msg) {
    if (!Array.isArray(msg.content))
        return { text: '', files: EMPTY_FILES };
    const texts = [];
    const files = [];
    for (const block of msg.content) {
        if (typeof block !== 'object' || block === null)
            continue;
        const part = block;
        if (part.type === 'text' && typeof part.text === 'string') {
            texts.push(part.text);
            continue;
        }
        if (part.type !== 'image' && part.type !== 'file')
            continue;
        if (typeof part.attachment !== 'object' || part.attachment === null)
            continue;
        const value = part.attachment;
        if (typeof value.name !== 'string' || value.name === '')
            continue;
        files.push({ name: value.name, bytes: typeof value.bytes === 'number' ? value.bytes : 0 });
    }
    return { text: texts.join(''), files };
}
function fromSubmission(item) {
    return {
        key: item.requestId,
        text: item.text ?? '',
        files: pendingFiles(item),
        pending: item.placement === 'steering',
        echo: item.placement !== 'steering',
    };
}
/**
 * 官方 ChatFlow.pendingInputs（ui-chat 0.2.1-rc.5 lib/client.js:2815-2839）的等价合并：
 * host `inbox` 投影 + session.pendingSubmissions 本地回显，按 source.rpcId / requestId 去重。
 *
 * 为什么必须两路：本地回显只在客户端内存里，且 `observeSubmissionInbox()` 在 inbox 到达后
 * 会 retire 它；inbox 投影是 host 侧 durable 值（尾页 projections baseline 也会 seed），
 * 冷读 / 新打开预览时拿得到。只画回显 ⇒ 等待期整条用户消息被吞，只剩「深度求索中」。
 */
export function waitingUserRows(inbox, pending, observed) {
    const local = new Map(visiblePendingInputs(pending, observed).map(item => [item.requestId, item]));
    const rows = [];
    const messages = inboxUserMessages(inbox);
    for (const [i, msg] of messages.entries()) {
        const rpcId = msg.source?.rpcId;
        if (rpcId !== undefined) {
            const echo = local.get(rpcId);
            if (echo !== undefined) {
                rows.push(fromSubmission(echo));
                local.delete(rpcId);
                continue;
            }
            if (observed.has(rpcId))
                continue;
        }
        const content = inboxContent(msg);
        if (content.text === '' && content.files.length === 0)
            continue;
        rows.push({
            key: msg.id ?? `inbox-${String(i)}`,
            text: content.text,
            files: content.files,
            pending: true,
            echo: false,
        });
    }
    for (const item of local.values()) {
        const row = fromSubmission(item);
        if (row.text === '' && row.files.length === 0)
            continue;
        rows.push(row);
    }
    return rows;
}
//# sourceMappingURL=pending-inputs.js.map