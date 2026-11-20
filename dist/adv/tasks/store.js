const STORE_KEY = Symbol.for('dsh-plugin-core/tasks/store/v1');
function sameRecord(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
/**
 * 就地更新时保留权威身份字段：服务端漏发 origin / panelId 时不冲掉本地发起身份，
 * 双方都带 settledAt 时保留先到的那份（同一次结算不各算时间戳）。
 * running 乐观行不带 settledAt，因此不会继承旧终态的时间戳。
 */
function carryIdentity(next, old) {
    if (old === undefined)
        return next;
    const origin = next.origin ?? old.origin;
    const panelId = next.panelId ?? old.panelId;
    const settledAt = next.settledAt !== undefined && old.settledAt !== undefined ? old.settledAt : next.settledAt;
    return {
        ...next,
        ...(origin === undefined ? {} : { origin }),
        ...(panelId === undefined ? {} : { panelId }),
        ...(settledAt === undefined ? {} : { settledAt }),
    };
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
            const stored = carryIdentity({ ...task, id: targetId }, tasks.get(targetId));
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
                // 归一 id + 权威身份兜底：settledAt 先到优先、origin/panelId 服务端漏发时保留本地发起身份。
                const next = carryIdentity({ ...record, id: targetId }, old);
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
        registerHandlers(map, project) {
            const registered = [];
            for (const [id, handler] of Object.entries(map)) {
                const key = project === undefined || project === null ? id : `${project}\u0000${id}`;
                handlers.set(key, handler);
                registered.push([key, handler]);
            }
            return () => {
                for (const [key, handler] of registered) {
                    if (handlers.get(key) === handler)
                        handlers.delete(key);
                }
            };
        },
        getHandler(id, project) {
            return handlers.get(`${project}\u0000${id}`) ?? handlers.get(id);
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
            // 按结算键去重，不看 settledAt（重放一律不重复分发）；
            // 重新发起（running）在 upsert 时删除声明，才会放行下一次结算。
            if (announced.has(key))
                return false;
            announced.set(key, task.settledAt ?? Date.now());
            return true;
        },
        clearAll() {
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