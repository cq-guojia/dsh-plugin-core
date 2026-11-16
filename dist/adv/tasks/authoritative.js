let idempotencySeq = 0;
function newIdempotencyKey(clientId) {
    idempotencySeq += 1;
    const random = Math.random().toString(36).slice(2);
    return `${clientId}:${Date.now().toString(36)}:${idempotencySeq.toString(36)}:${random}`;
}
/**
 * version 单调合并，返回真正变更的行。终态是一道单向门：
 * 一旦见过版本 v 的终态，v 及以下的任何行都不得再改这条记录。
 * 注意：这里只更新投影与终态门，**不 emit 通知**——通知只由通道 B 投递。
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
        if (terminal !== undefined && row.version <= terminal)
            continue;
        const current = state.seen.get(row.key);
        if (current !== undefined && current.version > row.version)
            continue;
        if (current !== undefined && current.version === row.version && current.state === row.state)
            continue;
        state.seen.set(row.key, row);
        state.watermark.set(row.key, row.version);
        if (row.tombstone === true || row.state !== 'running')
            state.terminal.set(row.key, row.version);
        accepted.push(row);
    }
    return accepted;
}
export function createAuthoritativeEngine(options) {
    const { onChange, onNotice, clientId } = options;
    const rebaseMinMs = options.rebaseMinMs ?? 5000;
    const actionTimeoutMs = options.actionTimeoutMs ?? 5000;
    const backends = new Map();
    const projects = new Map();
    /** 每个后端实例一条连接：不同 project 可能走不同后端。 */
    const followers = new Map();
    let started = false;
    let disposed = false;
    let lastRebase = 0;
    let reconnectFailures = 0;
    let reconnectTimer = null;
    /** 通道 B 的确认游标：每个后端一条独立通知流，各自按 clientId 隔离；服务端下发、连续成功前缀推进。 */
    const noticeCursors = new Map();
    let noticePumping = false;
    let noticePending = false;
    /** stop / dispose 时自增，作废在途 pump；它不得再投递通知或推进游标。 */
    let pumpGeneration = 0;
    function clientCursor(backend) {
        return noticeCursors.get(backend)?.get(clientId);
    }
    function setClientCursor(backend, cursor) {
        let byClient = noticeCursors.get(backend);
        if (byClient === undefined) {
            byClient = new Map();
            noticeCursors.set(backend, byClient);
        }
        byClient.set(clientId, cursor);
    }
    /** 后端 → 它负责的 project。通知与 follow 都按这条归属分组，绝不跨后端代查。 */
    function byBackend() {
        const grouped = new Map();
        for (const [project, backend] of backends) {
            const bucket = grouped.get(backend);
            if (bucket === undefined)
                grouped.set(backend, [project]);
            else
                bucket.push(project);
        }
        return grouped;
    }
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
        if (mergeInto(projectState(project), rows).length === 0)
            return;
        emitChange();
    }
    /**
     * 单个后端的通道 B：只拉它自己负责的 project，用它自己的游标推进与 ack。
     * 不同后端可能是不同服务 / 不同鉴权域，拿一个后端代查全部会静默丢通知。
     * generation 用于作废 stop() 前发出的在途 pump：stop 后它不得再 onNotice / ack。
     */
    async function pumpBackendNotices(backend, projects, generation) {
        let cursor = clientCursor(backend);
        const seenCursors = new Set();
        // keyset 分页拉全未确认通知。seenCursors 是死循环兜底：服务端必须按 cursor 过滤，
        // 但若实现有误重复返回同一页，这里必须停，不能把测试/页面挂死。
        for (;;) {
            if (disposed || generation !== pumpGeneration)
                return;
            if (cursor !== undefined) {
                if (seenCursors.has(cursor))
                    return;
                seenCursors.add(cursor);
            }
            const page = await backend.listNotices(projects, cursor);
            if (disposed || generation !== pumpGeneration || page.notices.length === 0)
                return;
            let delivered = 0;
            for (const notice of page.notices) {
                onNotice(notice);
                cursor = notice.cursor;
                delivered += 1;
            }
            if (delivered > 0 && cursor !== undefined) {
                await backend.ackNotices(projects, cursor);
                if (disposed || generation !== pumpGeneration)
                    return;
                setClientCursor(backend, cursor);
            }
            if (page.nextCursor === undefined || page.nextCursor === cursor)
                return;
            cursor = page.nextCursor;
        }
    }
    /**
     * 通道 B 总入口：按后端归属逐个 pump，各后端通知流与游标彼此隔离。
     * emit 同步（运行时吞监听者异常），因此 onNotice 返回即视为投递成功，
     * 推进连续成功前缀的游标后 ack；ack 失败时内存游标不前进，下次重新拉。
     * pumping 期间的新提示记 pending，结束后补拉一轮；串行化防止并发重复投递。
     * 每个后端单独 try/catch：一个后端故障不得挡住其他后端的通知。
     */
    async function pumpNotices() {
        if (disposed || !started || backends.size === 0)
            return;
        if (noticePumping) {
            noticePending = true;
            return;
        }
        noticePumping = true;
        const generation = pumpGeneration;
        try {
            do {
                noticePending = false;
                for (const [backend, projects] of byBackend()) {
                    if (disposed || generation !== pumpGeneration)
                        return;
                    try {
                        await pumpBackendNotices(backend, projects, generation);
                    }
                    catch {
                        // 单后端拉取失败不影响其余后端；下次提示 / 可见时重试。
                    }
                }
            } while (noticePending && !disposed && generation === pumpGeneration);
        }
        catch {
            // 通知拉取失败不影响投影；下次 follow 提示 / 可见时重试。
        }
        finally {
            noticePumping = false;
            // 在途 pump 被 stop() 作废、或重挂期间有新提示进来时，pending 仍为 true 但没人再拉：
            // 这里补拉一轮，避免那次提示被吞到下次偶发事件才处理。新一轮用当前 pumpGeneration。
            if (noticePending && started && !disposed)
                void pumpNotices();
        }
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
            }
            if (disposed || generation !== state.epoch)
                return;
            state.cursor = cursor;
            reconnectFailures = 0;
            startFollow();
        }
        catch {
            // 查询失败不判死、不降级：服务端 watchdog 是权威。
        }
    }
    function startFollow() {
        if (disposed || backends.size === 0)
            return;
        for (const [backend, owned] of byBackend()) {
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
                else if (event.kind === 'notice-available')
                    void pumpNotices();
                advanceCursor(project, event);
            }, () => {
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
        void pumpNotices();
    }
    return {
        attach(project, backend) {
            if (disposed)
                throw new Error('authoritative engine is disposed');
            if (typeof backend.list !== 'function' || typeof backend.follow !== 'function'
                || typeof backend.listNotices !== 'function' || typeof backend.ackNotices !== 'function'
                || typeof backend.invoke !== 'function' || typeof backend.ack !== 'function') {
                throw new Error(`task backend for ${project} must provide list/follow/listNotices/ackNotices/invoke/ack`);
            }
            backends.set(project, backend);
            projectState(project);
            // 重挂到新后端实例时，旧实例不再服务任何 project，其游标条目应回收；
            // 仍被其他 project 共用的后端保留游标，避免重复投递。
            const active = new Set(backends.values());
            for (const stale of noticeCursors.keys()) {
                if (!active.has(stale))
                    noticeCursors.delete(stale);
            }
            if (started) {
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
                let timer = null;
                try {
                    const timed = new Promise((_, reject) => {
                        timer = setTimeout(() => reject(new Error('action timeout')), actionTimeoutMs);
                    });
                    const raw = await Promise.race([backend.invoke({
                            project, key, actionId,
                            token: action.token,
                            version: record.version,
                            idempotencyKey: entry.idempotencyKey,
                        }), timed]);
                    const result = { ...raw, idempotencyKey: entry.idempotencyKey };
                    if (result.ok) {
                        entry.result = result;
                        entry.at = Date.now();
                    }
                    return result;
                }
                finally {
                    if (timer !== null)
                        clearTimeout(timer);
                }
            }
            catch (error) {
                return { ok: false, reason: error instanceof Error ? error.message : String(error) };
            }
        },
        /** 暴露幂等键供上层在 action 事件里回传，迟到结果由它抑制二次 emit。 */
        idempotencyKeyFor(project, key, actionId, version) {
            return invokes.get(invokeCacheKey(project, key, actionId, version))?.idempotencyKey;
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
        stop() {
            // 作废在途 pump：它此后不得 onNotice / ack。游标保留——重连后从已确认点续拉，
            // 不因一次断连就重头投递全部通知（at-least-once 下会重复 emit）。
            pumpGeneration += 1;
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
            noticeCursors.clear();
        },
    };
}
//# sourceMappingURL=authoritative.js.map