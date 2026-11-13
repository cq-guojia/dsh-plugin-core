/** 全局注册表键：`Symbol.for` 跨 bundle 副本天然共享同一个符号。 */
export const TOAST_QUEUE_KEY = Symbol.for('dsh-plugin-core/toast-queue');
/** 界面长期缺席时不让广播把队列撑成无限历史。 */
const MAX_PENDING = 20;
function queue() {
    const g = globalThis;
    let q = g[TOAST_QUEUE_KEY];
    if (q === undefined) {
        q = { listeners: new Set(), pending: [] };
        g[TOAST_QUEUE_KEY] = q;
    }
    return q;
}
function enqueue(q, payload) {
    q.pending.push({ payload, at: Date.now() });
    if (q.pending.length > MAX_PENDING)
        q.pending.splice(0, q.pending.length - MAX_PENDING);
}
/** 单个订阅者画失败不能拖垮其它订阅者，也不能把消息无声吞掉。 */
function deliver(listener, payload) {
    try {
        listener(payload);
        return true;
    }
    catch (error) {
        console.warn(`[dsh-plugin-core] toast 渲染失败：${String(error)}`);
        return false;
    }
}
/** 投递一条提示。不碰 DOM，也不要求界面已挂载。 */
export function pushToast(payload) {
    const q = queue();
    if (q.listeners.size === 0) {
        enqueue(q, payload);
        return;
    }
    let shown = false;
    for (const listener of q.listeners) {
        if (deliver(listener, payload))
            shown = true;
    }
    // 一个都没画成才回队；有任一订阅者画过就不再补发，避免重复弹。
    if (!shown)
        enqueue(q, payload);
}
/** 界面订阅投递；订阅时只补发「还没过自己停留时长」的。返回退订函数。 */
export function subscribeToasts(listener) {
    const q = queue();
    q.listeners.add(listener);
    const now = Date.now();
    for (const item of q.pending.splice(0)) {
        if (now - item.at > item.payload.durationMs)
            continue;
        if (!deliver(listener, item.payload))
            enqueue(q, item.payload);
    }
    return () => {
        q.listeners.delete(listener);
    };
}
//# sourceMappingURL=toast-queue.js.map