/**
 * 订阅某个会话的待审批请求。能力缺席（没有 uiSession / 没 active 快照面）返回 null ⇒ 弹窗不画卡。
 * @param uiSession - 宿主 client 服务 `uiSession`。
 * @param sessionId - 预览中的会话 id。
 */
export function openPendingApproval(uiSession, sessionId) {
    const status = uiSession?.sessionStatus;
    if (status === undefined || typeof status.getSnapshot !== 'function' || typeof status.subscribe !== 'function')
        return null;
    // 快照值 = 官方对象本身（引用稳定、answerable 是 getter）⇒ getSnapshot 可直接给 React。
    const read = () => {
        try {
            return approvalFace(status.getSnapshot().get(sessionId)?.pendingInteraction);
        }
        catch {
            return undefined;
        }
    };
    return { getSnapshot: read, subscribe: (onChange) => status.subscribe(onChange) };
}
/** 只认 `kind === 'approval'` 且真能作答的域值（别的 pending-interaction 域一律当没有）。 */
function approvalFace(value) {
    if (typeof value !== 'object' || value === null)
        return undefined;
    const record = value;
    if (record.kind !== 'approval' || typeof record.key !== 'string' || typeof record.toolName !== 'string')
        return undefined;
    if (typeof record.answer !== 'function')
        return undefined;
    return value;
}
//# sourceMappingURL=pending-approval.js.map