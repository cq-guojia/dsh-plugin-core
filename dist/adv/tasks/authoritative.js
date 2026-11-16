let idempotencySeq = 0;
function newIdempotencyKey(clientId) {
    idempotencySeq += 1;
    const random = Math.random().toString(36).slice(2);
    return `${clientId}:${Date.now().toString(36)}:${idempotencySeq.toString(36)}:${random}`;
}
/**
 * version 单调合并，返回**真正变更的行**（不是全量 seen），避免重复触发终态 ack。
 * 终态是一道单向门：一旦见过版本 v 的终态，v 及以下的任何行都不得再改这条记录，
 * 否则同版本 tombstone 后到的 running 会把已结算任务复活。
 */
function mergeInto(state, rows) {
    const accepted = [];
    for (const row of rows) {
        if (!Number.isFinite(row.version))
            continue;
        const seenVersion = state.watermark.get(row.key) ?? -1;
        if (row.version < seenVersion)
            continue;
        const terminal = state.terminal.get(row.key);
        if (terminal !== undefined && row.version <= terminal.version)
            continue;
        const current = state.seen.get(row.key);
        if (current !== undefined && current.version > row.version)
            continue;
        if (current !== undefined && current.version === row.version && current.state === row.state)
            continue;
        state.seen.set(row.key, row);
        state.watermark.set(row.key, row.version);
        if (row.tombstone === true || row.state !== 'running') {
            state.terminal.set(row.key, { version: row.version, acked: false });
        }
        accepted.push(row);
    }
    return accepted;
}
export function createAuthoritativeEngine(options) {
    const { onChange, onTerminal, clientId } = options;
    const rebaseMinMs = options.rebaseMinMs ?? 5000;
    const backends = new Map();
    const projects = new Map();
    /** 每个后端实例一条连接：不同 project 可能走不同后端，不能让首个后端代收全部。 */
    const followers = new Map();
    let started = false;
    let disposed = false;
    let lastRebase = 0;
    let reconnectFailures = 0;
    let reconnectTimer = null;
    /** 同一 (key,actionId,version) 在结果缓存窗口内复用幂等键，响应丢失时重试返回同一结果。 */
    const invokes = new Map();
    const INVOKE_CACHE_MS = 60000;
    function invokeCacheKey(project, key, actionId, version) {
        return `${project}:${key}:${actionId}:${version}`;
    }
    function projectState(project) {
        let state = projects.get(project);
        if (state === undefined) {
            state = { snapshotVersion: -1, epoch: 0, seen: new Map(), watermark: new Map(), terminal: new Map() };
            projects.set(project, state);
        }
        return state;
    }
    function emitChange() {
        const all = [];
        for (const state of projects.values()) {
            for (const row of state.seen.values()) {
                if (row.tombstone === true || row.state !== 'running')
                    continue;
                all.push(row);
            }
        }
        onChange(Object.freeze(all));
    }
    function applyRows(project, rows) {
        const state = projectState(project);
        const accepted = mergeInto(state, rows);
        if (accepted.length === 0)
            return;
        for (const row of accepted) {
            if (row.tombstone !== true && row.state === 'running')
                continue;
            const terminal = state.terminal.get(row.key);
            if (terminal === undefined || terminal.version !== row.version || terminal.acked)
                continue;
            terminal.acked = true;
            onTerminal?.(row);
        }
        emitChange();
    }
    function advanceCursor(project, event) {
        const state = projectState(project);
        if (event.kind === 'cursor')
            state.cursor = event.cursor;
    }
    async function rebase(project) {
        const backend = backends.get(project);
        if (backend === undefined || disposed)
            return;
        const state = projectState(project);
        const generation = state.epoch;
        try {
            let cursor = state.cursor;
            let first = true;
            // keyset 分页：按服务端给的 nextCursor 续拉，直到没有下一页。
            while (!disposed && generation === state.epoch) {
                const page = await backend.list(project, cursor);
                if (disposed || generation !== state.epoch)
                    return;
                if (page.rows.length > 0)
                    applyRows(project, page.rows);
                if (page.snapshotVersion < state.snapshotVersion)
                    break;
                state.snapshotVersion = page.snapshotVersion;
                if (page.nextCursor === undefined || page.nextCursor === cursor)
                    break;
                cursor = page.nextCursor;
                if (first)
                    first = false;
            }
            if (disposed || generation !== state.epoch)
                return;
            state.cursor = cursor;
            reconnectFailures = 0;
            startFollow();
        }
        catch {
            // 查询失败不判死、不降级：服务端 watchdog 是权威，下一帧/下次可见再试。
        }
    }
    function startFollow() {
        if (disposed || backends.size === 0)
            return;
        const byBackend = new Map();
        for (const [project, backend] of backends) {
            const bucket = byBackend.get(backend);
            if (bucket === undefined)
                byBackend.set(backend, [project]);
            else
                bucket.push(project);
        }
        for (const [backend, owned] of byBackend) {
            if (followers.has(backend))
                continue;
            const cursors = {};
            for (const project of owned) {
                const state = projects.get(project);
                if (state?.cursor !== undefined)
                    cursors[project] = state.cursor;
            }
            followers.set(backend, backend.follow(owned, cursors, (project, event) => {
                if (disposed || !owned.includes(project))
                    return;
                if (event.kind === 'upsert')
                    applyRows(project, event.rows);
                advanceCursor(project, event);
            }, () => {
                // 只作废这条连接覆盖的项目；指数退避 + jitter 防重连风暴。
                for (const project of owned) {
                    const state = projects.get(project);
                    if (state !== undefined)
                        state.epoch += 1;
                }
                followers.get(backend)?.();
                followers.delete(backend);
                if (disposed || reconnectTimer !== null)
                    return;
                reconnectFailures += 1;
                const delay = Math.min(15000, 250 * 2 ** Math.min(reconnectFailures, 6)) + Math.random() * 250;
                reconnectTimer = setTimeout(() => {
                    reconnectTimer = null;
                    void rebaseAll();
                }, delay);
            }));
        }
    }
    async function rebaseAll() {
        if (disposed)
            return;
        await Promise.all([...backends.keys()].map((project) => rebase(project)));
    }
    return {
        attach(project, backend) {
            if (disposed)
                throw new Error('authoritative engine is disposed');
            if (typeof backend.list !== 'function' || typeof backend.follow !== 'function'
                || typeof backend.invoke !== 'function' || typeof backend.ack !== 'function') {
                throw new Error(`task backend for ${project} must provide list/follow/invoke/ack`);
            }
            backends.set(project, backend);
            projectState(project);
            if (started) {
                // 后端集合变了：旧 follow 的 projects 列表不含新项目，必须断开重建。
                const wasStarted = started;
                this.stop();
                started = wasStarted;
                void rebaseAll();
            }
        },
        start() {
            if (started || disposed)
                return;
            started = true;
            void rebaseAll();
        },
        visible() {
            const now = Date.now();
            if (now - lastRebase < rebaseMinMs)
                return;
            lastRebase = now;
            void rebaseAll();
        },
        refresh(project) {
            if (project === undefined)
                void rebaseAll();
            else
                void rebase(project);
        },
        find(project, key) {
            return projectState(project).seen.get(key);
        },
        all() {
            const all = [];
            for (const state of projects.values()) {
                for (const row of state.seen.values()) {
                    if (row.tombstone === true || row.state !== 'running')
                        continue;
                    all.push(row);
                }
            }
            return Object.freeze(all);
        },
        async runAction(project, key, actionId) {
            try {
                const backend = backends.get(project);
                const record = projectState(project).seen.get(key);
                const action = record?.actions.find((item) => item.id === actionId);
                if (backend === undefined || record === undefined || action === undefined) {
                    return { ok: false, reason: 'action unavailable' };
                }
                if (!action.enabled || action.expiresAt <= Date.now()
                    || (action.version !== undefined && action.version !== record.version)) {
                    return { ok: false, reason: 'action expired' };
                }
                const cacheKey = invokeCacheKey(project, key, actionId, record.version);
                let entry = invokes.get(cacheKey);
                if (entry === undefined || Date.now() - entry.at > INVOKE_CACHE_MS) {
                    entry = { idempotencyKey: newIdempotencyKey(clientId), at: Date.now() };
                    invokes.set(cacheKey, entry);
                }
                if (entry.result !== undefined)
                    return entry.result;
                const result = await backend.invoke({
                    project,
                    key,
                    actionId,
                    token: action.token,
                    version: record.version,
                    idempotencyKey: entry.idempotencyKey,
                });
                // 只缓存成功：失败（含服务端明确拒绝）不封死 60 秒，token 仍有效时可重试。
                if (result.ok) {
                    entry.result = result;
                    entry.at = Date.now();
                }
                return result;
            }
            catch (error) {
                return { ok: false, reason: error instanceof Error ? error.message : String(error) };
            }
        },
        async acknowledge(request) {
            const backend = backends.get(request.project);
            if (backend === undefined)
                return;
            await backend.ack(request);
        },
        async create(input) {
            const backend = backends.get(input.project);
            if (backend?.create === undefined)
                return undefined;
            const result = await backend.create(input);
            if (result.record !== undefined)
                applyRows(input.project, [result.record]);
            return result;
        },
        has(project) {
            return backends.has(project);
        },
        /** 停止连接但保留后端与已水合状态；pool.dispose → connect 后可重新 follow。 */
        stop() {
            // 先让在途 baseline / poll 的代次失效，再断连接；否则旧结果回来会重启 follow。
            for (const state of projects.values())
                state.epoch += 1;
            for (const off of followers.values())
                off();
            followers.clear();
            started = false;
            if (reconnectTimer !== null)
                clearTimeout(reconnectTimer);
            reconnectTimer = null;
        },
        dispose() {
            disposed = true;
            this.stop();
            projects.clear();
            invokes.clear();
        },
    };
}
//# sourceMappingURL=authoritative.js.map