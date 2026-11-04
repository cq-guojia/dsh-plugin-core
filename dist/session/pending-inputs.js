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
//# sourceMappingURL=pending-inputs.js.map