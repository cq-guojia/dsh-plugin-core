const STORE_KEY = Symbol.for('dsh-plugin-core/tasks/store/v1');
function sameRecord(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
/**
 * 就地更新时保留权威身份字段 + 维护结算时钟不变量。
 *
 * origin / panelId：服务端漏发时保留本地发起身份（first-wins）。
 * settledAt 严格按状态派生，不靠「谁带了字段」：
 *   - running：显式清空结算时刻——重新发起/迟到 running 不得继承旧终态时间戳，
 *     否则 TaskBar 的停留/退场时钟会被复活的运行行污染。
 *   - 终态：只认服务端权威时间；两个合法时间并存时保留先到的那份（同一次结算不各算时间戳），
 *     绝不用本地 Date.now() 补——本地造时会盖住后到的真源时间且让重放签名漂移。
 * 入口 isTaskRecord 已保证终态必带有限数 settledAt，这里只做合并，不再补时。
 */
function carryIdentity(next, old) {
    const origin = next.origin ?? old?.origin;
    const panelId = next.panelId ?? old?.panelId;
    const settledAt = isSettled(next.state)
        ? (old !== undefined && isSettled(old.state) && old.settledAt !== undefined ? old.settledAt : next.settledAt)
        : undefined;
    const base = { ...next };
    // running 必须不带 settledAt：显式删除，不能因 spread 旧键而残留。
    if (!isSettled(next.state))
        delete base.settledAt;
    return {
        ...base,
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
                // 判据用「状态是否为终态」而非「有无 settledAt」——后者是时钟，可能因重放/擦除而不在，
                // 拿它当状态标志会让 guard 在时间戳缺失时静默失效。
                if (old !== undefined && isSettled(old.state) && !isSettled(record.state))
                    continue;
                // 归一 id + 权威身份/时钟合并，规则集中在 carryIdentity。
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
        mergeBaseline(records) {
            let changed = false;
            for (const record of records) {
                const composite = keyOf(record);
                const priorId = composite !== undefined ? byKey.get(composite) : undefined;
                if (priorId !== undefined || tasks.has(record.id))
                    continue;
                const stored = carryIdentity(record, undefined);
                tasks.set(stored.id, stored);
                if (composite !== undefined)
                    byKey.set(composite, stored.id);
                changed = true;
            }
            if (changed)
                publish();
        },
        get(id) {
            return tasks.get(id);
        },
        removeRunning(id) {
            const current = tasks.get(id);
            if (current === undefined || isSettled(current.state))
                return false;
            tasks.delete(id);
            const composite = keyOf(current);
            if (composite !== undefined && byKey.get(composite) === id)
                byKey.delete(composite);
            publish();
            return true;
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