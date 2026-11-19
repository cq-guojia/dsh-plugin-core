const STORE_KEY = Symbol.for('dsh-plugin-core/tasks/store/v1');
function sameRecord(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
function createStore() {
    const tasks = new Map();
    const byKey = new Map();
    const announced = new Map();
    const handlers = new Map();
    const snapshotListeners = new Set();
    const settledListeners = new Set();
    let snapshot = Object.freeze({ tasks: Object.freeze([]), revision: 0 });
    function keyOf(task) {
        return task.key === undefined ? undefined : `${task.project}\u0000${task.key}`;
    }
    function settlementKey(task) {
        return keyOf(task) ?? `${task.project}\u0000id\u0000${task.id}`;
    }
    function publish() {
        const rows = [...tasks.values()].sort((a, b) => a.startedAt - b.startedAt);
        snapshot = Object.freeze({ tasks: Object.freeze(rows), revision: snapshot.revision + 1 });
        for (const listener of [...snapshotListeners])
            listener();
    }
    return {
        getSnapshot: () => snapshot,
        subscribe(listener) {
            snapshotListeners.add(listener);
            return () => { snapshotListeners.delete(listener); };
        },
        upsert(task) {
            const composite = keyOf(task);
            let existingId;
            if (composite !== undefined) {
                const priorId = byKey.get(composite);
                if (priorId !== undefined && priorId !== task.id)
                    existingId = priorId;
            }
            const targetId = existingId ?? task.id;
            const existed = tasks.has(targetId);
            const stored = { ...task, id: targetId };
            tasks.set(targetId, stored);
            // byKey 永远指向存活 id；否则第三次同键 upsert 会按不存在的旧 id 判成新建，堆出重复行。
            if (composite !== undefined)
                byKey.set(composite, targetId);
            if (task.state === 'running')
                announced.delete(settlementKey(task));
            publish();
            return { created: !existed, task: stored };
        },
        merge(records) {
            const changed = [];
            for (const record of records) {
                const composite = keyOf(record);
                const priorId = composite !== undefined ? byKey.get(composite) : undefined;
                const targetId = priorId ?? record.id;
                const old = tasks.get(targetId);
                // 单调：本地已终态时，迟到的 running 投影直接丢弃，防乱序把终态复活。
                if (old !== undefined && old.settledAt !== undefined && record.state === 'running')
                    continue;
                // 双方都终态时保留先到的 settledAt：本地执行与服务端投影是同一次结算，不能各算一份时间戳。
                const settledAt = old?.settledAt !== undefined && record.settledAt !== undefined
                    ? old.settledAt
                    : record.settledAt;
                const next = {
                    ...record,
                    id: targetId,
                    ...(settledAt === undefined ? {} : { settledAt }),
                };
                if (composite !== undefined)
                    byKey.set(composite, next.id);
                tasks.set(next.id, next);
                if (old === undefined || !sameRecord(old, next))
                    changed.push(next);
            }
            if (changed.length > 0)
                publish();
            return changed;
        },
        get(id) {
            return tasks.get(id);
        },
        select(project, groups) {
            const rows = snapshot.tasks;
            if (project === null)
                return groups === undefined ? rows : rows.filter((t) => groups.includes(t.group));
            return rows.filter((t) => t.project === project && (groups === undefined || groups.includes(t.group)));
        },
        registerHandlers(map) {
            const registered = [];
            for (const [id, handler] of Object.entries(map)) {
                handlers.set(id, handler);
                registered.push([id, handler]);
            }
            return () => {
                for (const [id, handler] of registered) {
                    if (handlers.get(id) === handler)
                        handlers.delete(id);
                }
            };
        },
        getHandler(id) {
            return handlers.get(id);
        },
        onSettled(listener) {
            settledListeners.add(listener);
            return () => { settledListeners.delete(listener); };
        },
        emitSettled(settlement) {
            for (const listener of [...settledListeners]) {
                try {
                    listener(settlement);
                }
                catch (error) {
                    console.error('dsh-plugin-core: task settled listener failed', error);
                }
            }
        },
        claimSettled(task) {
            const key = settlementKey(task);
            const at = task.settledAt ?? Date.now();
            // 同一结算（同 settledAt）重放不重复分发；只有更晚的新结算才能再拿一次声明。
            if (announced.has(key))
                return false;
            announced.set(key, at);
            return true;
        },
        clear() {
            tasks.clear();
            byKey.clear();
            announced.clear();
            handlers.clear();
            publish();
        },
    };
}
/** 全局 store（同标签页共用）。 */
export const taskStore = (() => {
    const holder = globalThis;
    const existing = holder[STORE_KEY];
    if (existing !== undefined)
        return existing;
    const created = createStore();
    holder[STORE_KEY] = created;
    return created;
})();
/** 新建私有 store（测试隔离）。 */
export function createTaskStore() {
    return createStore();
}
/** 终态状态判定。 */
export function isSettled(state) {
    return state === 'done' || state === 'failed';
}
/** 取一条任务当前状态下要显示的按钮（含 handler 存在性由调用方决定）。 */
export function visibleButtons(task) {
    const when = (b) => b.when === undefined || b.when === 'always' || b.when === task.state;
    return (task.rowButtons ?? []).filter(when);
}
//# sourceMappingURL=store.js.map