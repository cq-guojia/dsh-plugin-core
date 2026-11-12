/**
 * Background task pool: queryable state + subscriptions + one-shot event delivery.
 *
 * Two separate channels, by design (they must not be merged into one bus):
 *   - the pool is a snapshot you can read at any time (useSyncExternalStore);
 *   - the event bus delivers one-shot notices, optionally consumed by plugins.
 * "Collapse to background" is an event, not a third Promise outcome: the task
 * Promise settles only when the owner calls done()/fail() or passes a Promise
 * to track(). This keeps every `await` a normal two-outcome await.
 *
 * Cross-page: each page owns its own shard (keyed by origin) and broadcasts the
 * full shard on every change, with a per-origin monotonic seq. A new page sends
 * `hello`; every online page replies with its full shard. That reply IS the
 * baseline -- no polling, no leader election, no replay of history needed.
 * Late / duplicated / out-of-order messages are dropped by seq comparison.
 *
 * Cross-bundle: core is inlined into every plugin bundle, so a module-level
 * store would be one pool per plugin. The global Symbol.for host collapses all
 * copies on the same page into one pool and one event bus.
 *
 * Zero React / zero DOM at import time. BroadcastChannel and lifecycle hooks are
 * opened lazily on the first connect(); Node and SSR can import this module.
 */
import { createStore } from 'zustand/vanilla';
/** Protocol version lives in the keys: a different wire shape gets its own host. */
export const TASK_NOTIFICATIONS_PROTOCOL = 2;
export const TASK_NOTIFICATIONS_KEY = Symbol.for('dsh-plugin-core/task-notifications/v2');
export const TASK_NOTIFICATIONS_EVENTS_KEY = Symbol.for('dsh-plugin-core/task-notifications/events/v2');
export const TASK_NOTIFICATIONS_CHANNEL = 'dsh-plugin-core/task-notifications/v2';
/** Default project lives on a global symbol: every inlined copy must see one value. */
export const TASK_NOTIFICATIONS_PROJECT_KEY = Symbol.for('dsh-plugin-core/task-notifications/project/v2');
/** 静默任务的默认回收窗口；与 TanStack Query 的 gcTime 默认值一致。 */
export const TASK_NOTIFICATIONS_HIDDEN_TTL_MS = 5 * 60000;
const EMPTY_TASKS = Object.freeze([]);
const EMPTY_SNAPSHOT = Object.freeze({ tasks: EMPTY_TASKS, revision: 0 });
function projectSlot() {
    const g = globalThis;
    return g[TASK_NOTIFICATIONS_PROJECT_KEY];
}
function writeProjectSlot() {
    const g = globalThis;
    let slot = g[TASK_NOTIFICATIONS_PROJECT_KEY];
    if (slot === undefined) {
        slot = {};
        g[TASK_NOTIFICATIONS_PROJECT_KEY] = slot;
    }
    return slot;
}
/** Set once at app start. `undefined` clears it (tests rely on this). */
export function setDefaultTaskProject(project) {
    if (project !== undefined && project.trim() === '') {
        throw new Error('task notification default project must be a non-empty string');
    }
    const slot = writeProjectSlot();
    if (project === undefined)
        delete slot.value;
    else
        slot.value = project;
}
export function getDefaultTaskProject() {
    return projectSlot()?.value;
}
function normalizeGroup(group) {
    if (group === undefined)
        return 'default';
    if (group.trim() === '')
        throw new Error('task notification group must be a non-empty string');
    return group;
}
function requireProject(project) {
    if (project === null)
        return null;
    if (project !== undefined)
        return project;
    const fallback = getDefaultTaskProject();
    if (fallback === undefined) {
        throw new Error('task notification project is required: call setDefaultTaskProject() once at app start, or pass `project` explicitly');
    }
    return fallback;
}
/** Per-snapshot derived cache: same snapshot + same filter returns the SAME array. */
const SELECT_CACHE = new WeakMap();
/**
 * Three tiers, in that order:
 *   - no filter / empty array: every group of the current project;
 *   - one or more names: only those groups of the current project;
 *   - `'*'`: every project and every group (pass `{ project }` to scope it).
 *
 * The returned reference is stable for the lifetime of the snapshot.
 */
export function selectTaskNotifications(snapshot, groups, options = {}) {
    const allProjects = groups === '*' && options.project === undefined;
    const project = allProjects ? null : requireProject(options.project);
    const groupKey = groups === undefined || groups === '*'
        ? ''
        : groups.length === 0
            ? ''
            : [...groups].sort().join('\u0000');
    const cacheKey = `${project ?? '\u0001*'}\u0002${groups === '*' ? '*' : groupKey}\u0002${options.includeHidden === true ? 'hidden' : ''}`;
    let perSnapshot = SELECT_CACHE.get(snapshot);
    if (perSnapshot === undefined) {
        perSnapshot = new Map();
        SELECT_CACHE.set(snapshot, perSnapshot);
    }
    const cached = perSnapshot.get(cacheKey);
    if (cached !== undefined)
        return cached;
    const wanted = groupKey === '' ? null : new Set(groupKey.split('\u0000'));
    const result = Object.freeze(snapshot.tasks.filter((task) => {
        if (options.includeHidden !== true && task.hidden === true)
            return false;
        if (project !== null && task.project !== project)
            return false;
        if (wanted === null)
            return true;
        return wanted.has(task.group);
    }));
    perSnapshot.set(cacheKey, result);
    return result;
}
export function createTaskNotificationEventBus() {
    const listeners = new Set();
    return {
        subscribe(listener) {
            listeners.add(listener);
            return () => { listeners.delete(listener); };
        },
        emit(event) {
            // One broken consumer must not stop core's own listener or the others.
            for (const listener of [...listeners]) {
                try {
                    listener(event);
                }
                catch (error) {
                    console.error('background task event listener failed', error);
                }
            }
        },
    };
}
function claim(key, create, isValid) {
    const g = globalThis;
    const existing = g[key];
    if (existing !== undefined) {
        if (!isValid(existing)) {
            throw new Error('Incompatible dsh-plugin-core background task host; reload the page.');
        }
        return existing;
    }
    const created = create();
    g[key] = created;
    return created;
}
export function claimTaskNotifications(create) {
    return claim(TASK_NOTIFICATIONS_KEY, create, isPool);
}
export function claimTaskNotificationEvents(create) {
    return claim(TASK_NOTIFICATIONS_EVENTS_KEY, create, isEventBus);
}
function isPool(value) {
    return (typeof value === 'object' &&
        value !== null &&
        value.protocol === TASK_NOTIFICATIONS_PROTOCOL &&
        typeof value.getSnapshot === 'function');
}
function isEventBus(value) {
    return (typeof value === 'object' &&
        value !== null &&
        typeof value.emit === 'function' &&
        typeof value.subscribe === 'function');
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/** JSON value check with a depth guard so a cyclic payload cannot hang the parser. */
function isDetail(value, depth = 0) {
    if (depth > 20)
        return false;
    if (value === null)
        return true;
    const kind = typeof value;
    if (kind === 'string' || kind === 'boolean')
        return true;
    if (kind === 'number')
        return Number.isFinite(value);
    if (Array.isArray(value))
        return value.every((item) => isDetail(item, depth + 1));
    if (isRecord(value))
        return Object.values(value).every((item) => isDetail(item, depth + 1));
    return false;
}
/**
 * Private copy on the way in: mutating the object afterwards must not leak into
 * the pool, and anything the wire cannot carry must fail here — not later, and
 * not differently depending on whether a channel happens to be open.
 */
function cloneDetail(value) {
    if (value === undefined)
        return undefined;
    if (!isDetail(value)) {
        throw new Error('task notification detail must be a JSON value (string, number, boolean, null, array or plain object)');
    }
    return typeof structuredClone === 'function'
        ? structuredClone(value)
        : JSON.parse(JSON.stringify(value));
}
function isTaskRecord(value) {
    if (!isRecord(value))
        return false;
    if (value.detail !== undefined && !isDetail(value.detail))
        return false;
    return (typeof value.id === 'string' &&
        typeof value.project === 'string' &&
        typeof value.group === 'string' &&
        typeof value.title === 'string' &&
        (value.status === 'running' || value.status === 'done' || value.status === 'failed') &&
        typeof value.startedAt === 'number' &&
        typeof value.updatedAt === 'number' &&
        typeof value.origin === 'string' &&
        typeof value.backgrounded === 'boolean');
}
function isNotice(value) {
    if (!isRecord(value) || !isTaskRecord(value.task))
        return false;
    if (value.type === 'settled')
        return value.outcome === 'done' || value.outcome === 'failed';
    return value.type === 'registered' || value.type === 'updated' || value.type === 'backgrounded';
}
function isWireMessageValue(value) {
    if (!isRecord(value))
        return false;
    if (value.detail !== undefined && !isDetail(value.detail))
        return false;
    return (typeof value.id === 'string' &&
        typeof value.project === 'string' &&
        typeof value.group === 'string' &&
        typeof value.title === 'string' &&
        typeof value.at === 'number' &&
        (value.level === 'info' || value.level === 'success' || value.level === 'warning' || value.level === 'error'));
}
/** Reject malformed / foreign messages instead of letting them poison the pool. */
function parseMessage(value) {
    if (!isRecord(value) || typeof value.origin !== 'string')
        return null;
    if (value.kind === 'hello')
        return { kind: 'hello', origin: value.origin };
    if (value.kind === 'bye') {
        return typeof value.seq === 'number' ? { kind: 'bye', origin: value.origin, seq: value.seq } : null;
    }
    if (value.kind === 'message') {
        if (typeof value.seq !== 'number' || !isWireMessageValue(value.message))
            return null;
        return { kind: 'message', origin: value.origin, seq: value.seq, message: value.message };
    }
    if (value.kind === 'shard') {
        if (typeof value.seq !== 'number' || !Array.isArray(value.tasks))
            return null;
        if (!value.tasks.every(isTaskRecord))
            return null;
        const tasks = value.tasks;
        if (value.notice === undefined)
            return { kind: 'shard', origin: value.origin, seq: value.seq, tasks };
        if (!isNotice(value.notice))
            return null;
        return { kind: 'shard', origin: value.origin, seq: value.seq, tasks, notice: value.notice };
    }
    return null;
}
function noticeToEvent(notice, remote) {
    if (notice.type === 'settled') {
        return {
            type: 'settled',
            outcome: notice.outcome === 'failed' ? 'failed' : 'done',
            task: notice.task,
            remote,
        };
    }
    return { type: notice.type, task: notice.task, remote };
}
function makeOrigin() {
    const c = globalThis.crypto;
    if (typeof c?.randomUUID === 'function')
        return c.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
function openChannel(name) {
    if (typeof BroadcastChannel === 'undefined')
        return null;
    try {
        const channel = new BroadcastChannel(name);
        // Node keeps the loop alive for an open channel; browsers have no unref.
        const withUnref = channel;
        withUnref.unref?.();
        return channel;
    }
    catch {
        return null;
    }
}
/** Deterministic order across pages: startedAt first, id as the tie-break. */
function compareTasks(a, b) {
    return a.startedAt - b.startedAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}
/** One lock per page, named by origin. Bumping the protocol gives a clean namespace. */
export const TASK_NOTIFICATIONS_LOCK_PREFIX = 'dsh-plugin-core/task-notifications/v2/';
function lockNameFor(pageOrigin) {
    return `${TASK_NOTIFICATIONS_LOCK_PREFIX}${pageOrigin}`;
}
/**
 * `navigator.locks` bridge. Resolved lazily so importing this module never
 * touches the DOM (Node / SSR can import it). Returns null where unavailable:
 * the pool then behaves exactly as before and simply keeps no liveness data.
 */
function browserLocks() {
    const locks = typeof navigator === 'undefined' ? undefined : navigator.locks;
    if (locks === undefined || locks === null || typeof locks.request !== 'function')
        return null;
    return {
        hold(name) {
            // Never resolves: the lock lives as long as this page does.
            void locks.request(name, () => new Promise(() => { }));
        },
        free(name) {
            // ifAvailable: no queueing. Getting the lock here means nobody held it,
            // and returning from the callback releases it again immediately.
            return locks
                .request(name, { ifAvailable: true }, (lock) => lock === null)
                .then((occupied) => occupied === false)
                .catch(() => false);
        },
    };
}
export function createTaskNotificationPool(options = {}) {
    const origin = options.origin ?? makeOrigin();
    const channelName = options.channelName ?? TASK_NOTIFICATIONS_CHANNEL;
    const offline = options.offline === true;
    const wantLifecycle = options.lifecycle ?? (typeof window !== 'undefined' && typeof document !== 'undefined');
    const bus = () => options.events ?? taskNotificationEvents;
    const locks = options.locks === undefined ? browserLocks() : options.locks;
    /** Page -> settle function, so a task can be ended without the caller's handle. */
    const finishers = new Map();
    /** Remotes currently being probed, so overlapping triggers do not stack up. */
    const probing = new Set();
    let locksHeld = false;
    const store = createStore(() => EMPTY_SNAPSHOT);
    const shards = new Map();
    const knownSeq = new Map();
    let seq = 0;
    let revision = 0;
    let idSeq = 0;
    /** 广播消息自己的序号，不参与分片 seq，避免打乱 baseline 的比较。 */
    let messageSeq = 0;
    let channel = null;
    let everConnected = false;
    let everPublished = false;
    function collect() {
        const all = [];
        const now = Date.now();
        for (const shard of shards.values()) {
            for (const task of shard.tasks) {
                // 超过回收窗口的一律不进快照：本页的先结算（见 expireLocal），远端的直接丢。
                if (task.timeoutMs !== undefined && now - task.updatedAt > task.timeoutMs)
                    continue;
                all.push(task);
            }
        }
        return Object.freeze(all.sort(compareTasks));
    }
    let expiring = false;
    /**
     * 把本页到点的任务结算为 failed。惰性执行：只在下次写之前跑，不装定时器。
     * 只放弃池里的记录，不取消调用方还在跑的 work —— 那个我们没能力动。
     */
    function expireLocal() {
        if (expiring)
            return;
        const now = Date.now();
        for (const task of [...localShard()]) {
            if (task.timeoutMs === undefined || now - task.updatedAt <= task.timeoutMs)
                continue;
            const finish = finishers.get(task.id);
            if (finish === undefined)
                continue;
            expiring = true;
            try {
                finish('failed', 'timed out');
            }
            finally {
                expiring = false;
            }
        }
    }
    function post(message) {
        if (channel === null)
            return;
        channel.postMessage(message);
    }
    function localShard() {
        return shards.get(origin)?.tasks ?? EMPTY_TASKS;
    }
    function emit(notice, remote) {
        bus().emit(noticeToEvent(notice, remote));
    }
    function broadcastShard(notice) {
        const tasks = localShard();
        const message = { kind: 'shard', origin, seq, tasks, ...(notice === undefined ? {} : { notice }) };
        post(message);
    }
    /** One write path: new local shard -> new snapshot -> local event -> cross-page message. */
    function publish(nextTasks, notice) {
        expireLocal();
        seq += 1;
        revision += 1;
        shards.set(origin, { origin, seq, tasks: Object.freeze([...nextTasks]) });
        knownSeq.set(origin, seq);
        everPublished = true;
        store.setState({ tasks: collect(), revision }, true);
        emit(notice, false);
        broadcastShard(notice);
    }
    /**
     * 纯广播：**不写池、不动快照**，所以订阅列表不会因为它多一行再少一行。
     * 本地先发一次，再发给同源其他页（一次性，不参与 baseline）。
     */
    function broadcast(input) {
        const project = requireProject(input.project);
        if (project === null)
            throw new Error('task notification project cannot be null when broadcasting');
        const group = normalizeGroup(input.group);
        const detail = cloneDetail(input.detail);
        const message = {
            id: `${origin}:msg:${String(++messageSeq)}`,
            project,
            group,
            title: input.title,
            ...(input.icon === undefined ? {} : { icon: input.icon }),
            ...(input.iconSvg === undefined ? {} : { iconSvg: input.iconSvg }),
            ...(detail === undefined ? {} : { detail }),
            level: input.level ?? 'info',
            at: Date.now(),
        };
        bus().emit({ type: 'message', message, remote: false });
        connect();
        post({ kind: 'message', origin, seq: ++messageSeq, message });
        return message;
    }
    function find(id) {
        return localShard().find((task) => task.id === id);
    }
    function replace(tasks, record) {
        return tasks.map((task) => (task.id === record.id ? record : task));
    }
    /** Claim the page-level liveness lock. Called on connect, idempotent. */
    function holdLiveness() {
        if (locksHeld || locks === null)
            return;
        locksHeld = true;
        locks.hold(lockNameFor(origin));
    }
    /** A page vanished without `bye`: drop its shard and say so. */
    function dropRemoteShard(pageOrigin) {
        if (!shards.delete(pageOrigin))
            return;
        revision += 1;
        store.setState({ tasks: collect(), revision }, true);
        bus().emit({ type: 'peer-left', origin: pageOrigin, remote: true });
    }
    /**
     * Remove shards whose page no longer holds its liveness lock.
     *
     * Two probes 250ms apart: a page that just started may not have taken its
     * lock yet, and a stale shard must not be dropped on that single sample.
     * Runs only on real events (message received, tab became visible) — there is
     * no timer, so an idle or backgrounded tab costs nothing.
     */
    function probeDeadPeers() {
        if (locks === null)
            return;
        for (const pageOrigin of [...shards.keys()]) {
            if (pageOrigin === origin || probing.has(pageOrigin))
                continue;
            probing.add(pageOrigin);
            void (async () => {
                try {
                    if (!(await locks.free(lockNameFor(pageOrigin))))
                        return;
                    await new Promise((resolve) => setTimeout(resolve, 250));
                    if (!(await locks.free(lockNameFor(pageOrigin))))
                        return;
                    dropRemoteShard(pageOrigin);
                }
                finally {
                    probing.delete(pageOrigin);
                }
            })();
        }
    }
    function onMessage(raw) {
        const message = parseMessage(raw);
        if (message === null || message.origin === origin)
            return;
        if (message.kind === 'hello') {
            broadcastShard();
            return;
        }
        if (message.kind === 'bye') {
            // A stale bye must not delete a shard that has since been re-advertised.
            if (message.seq < (knownSeq.get(message.origin) ?? 0))
                return;
            knownSeq.set(message.origin, message.seq);
            dropRemoteShard(message.origin);
            return;
        }
        if (message.kind === 'message') {
            // 纯广播不带状态、不进池：直接交给监听者，列表不会因为它变化。
            bus().emit({ type: 'message', message: message.message, remote: true });
            return;
        }
        const seen = knownSeq.get(message.origin) ?? 0;
        if (message.seq <= seen)
            return;
        knownSeq.set(message.origin, message.seq);
        shards.set(message.origin, { origin: message.origin, seq: message.seq, tasks: Object.freeze([...message.tasks]) });
        revision += 1;
        store.setState({ tasks: collect(), revision }, true);
        if (message.notice !== undefined)
            emit(message.notice, true);
        // A shard without a live page behind it is a zombie; check on every arrival.
        probeDeadPeers();
    }
    function onPageHide() {
        post({ kind: 'bye', origin, seq });
    }
    function onPageShow() {
        connect();
        // bfcache / 休眠恢复：pagehide 已让对端删掉本页分片。seq 必须前进后重发，
        // 否则对端会拿「已知 seq」把这份全量分片当旧消息丢掉，本页任务永久消失。
        seq += 1;
        knownSeq.set(origin, seq);
        broadcastShard();
        refresh();
    }
    function onVisibility() {
        if (document.visibilityState === 'visible') {
            connect();
            refresh();
            probeDeadPeers();
        }
    }
    function attachLifecycle() {
        if (!wantLifecycle)
            return;
        window.addEventListener('pagehide', onPageHide);
        window.addEventListener('pageshow', onPageShow);
        document.addEventListener('visibilitychange', onVisibility);
    }
    function detachLifecycle() {
        if (!wantLifecycle)
            return;
        window.removeEventListener('pagehide', onPageHide);
        window.removeEventListener('pageshow', onPageShow);
        document.removeEventListener('visibilitychange', onVisibility);
    }
    function connect() {
        if (offline || channel !== null)
            return;
        channel = openChannel(channelName);
        if (channel === null)
            return;
        channel.onmessage = (event) => { onMessage(event.data); };
        attachLifecycle();
        // Take the liveness lock before advertising anything: a page that has
        // published a shard must already be distinguishable from a dead one.
        holdLiveness();
        const reopened = everConnected;
        everConnected = true;
        post({ kind: 'hello', origin });
        // 重连（含 dispose 后再用）：对端可能已按 bye 删过本页分片，必须带新 seq 补发全量，
        // 否则本页任务在对端永久消失。首次连接没有分片，不必发。
        if (reopened && everPublished) {
            seq += 1;
            knownSeq.set(origin, seq);
            broadcastShard();
        }
    }
    function refresh() {
        post({ kind: 'hello', origin });
    }
    function register(input) {
        // Resolve before touching the pool: a missing project must not leave a row behind.
        const project = requireProject(input.project);
        if (project === null)
            throw new Error('task notification project cannot be null when registering');
        const group = normalizeGroup(input.group);
        const detail = cloneDetail(input.detail);
        const hidden = input.hidden === true;
        const timeoutMs = input.timeoutMs ?? (hidden ? TASK_NOTIFICATIONS_HIDDEN_TTL_MS : 0);
        if (timeoutMs < 0)
            throw new Error('task notification timeoutMs must be >= 0');
        connect();
        const now = Date.now();
        const id = `${origin}:${String(++idSeq)}`;
        const record = {
            id,
            project,
            group,
            ...(input.projectLabel === undefined ? {} : { projectLabel: input.projectLabel }),
            ...(input.groupLabel === undefined ? {} : { groupLabel: input.groupLabel }),
            ...(input.icon === undefined ? {} : { icon: input.icon }),
            ...(input.iconSvg === undefined ? {} : { iconSvg: input.iconSvg }),
            title: input.title,
            ...(detail === undefined ? {} : { detail }),
            status: 'running',
            startedAt: now,
            updatedAt: now,
            origin,
            backgrounded: false,
            ...(hidden ? { hidden: true } : {}),
            ...(timeoutMs > 0 ? { timeoutMs } : {}),
        };
        let isSettled = false;
        let resolveSettled = () => { };
        const settled = new Promise((resolve) => { resolveSettled = resolve; });
        publish([...localShard(), record], { type: 'registered', task: record });
        function finish(outcome, reason) {
            if (isSettled)
                return;
            const current = find(id);
            if (current === undefined)
                return;
            isSettled = true;
            finishers.delete(id);
            const final = {
                ...current,
                status: outcome === 'done' ? 'done' : 'failed',
                reason,
                updatedAt: Date.now(),
            };
            publish(localShard().filter((task) => task.id !== id), { type: 'settled', task: final, outcome });
            resolveSettled({ outcome, reason, task: final });
        }
        finishers.set(id, finish);
        const handle = {
            id,
            get isSettled() { return isSettled; },
            settled,
            update(patch) {
                if (isSettled)
                    return;
                const detail = cloneDetail(patch.detail);
                if (patch.group !== undefined && patch.group.trim() === '') {
                    throw new Error('task notification group must be a non-empty string');
                }
                const current = find(id);
                if (current === undefined)
                    return;
                const next = {
                    ...current,
                    ...(patch.title === undefined ? {} : { title: patch.title }),
                    ...(detail === undefined ? {} : { detail }),
                    ...(patch.group === undefined ? {} : { group: patch.group }),
                    ...(patch.groupLabel === undefined ? {} : { groupLabel: patch.groupLabel }),
                    ...(patch.icon === undefined ? {} : { icon: patch.icon }),
                    ...(patch.iconSvg === undefined ? {} : { iconSvg: patch.iconSvg }),
                    ...(patch.hidden === undefined ? {} : patch.hidden ? { hidden: true } : {}),
                    // updatedAt 前移即「续期」：回收窗口从最后一次活动起算。
                    updatedAt: Date.now(),
                };
                publish(replace(localShard(), next), { type: 'updated', task: next });
            },
            background() {
                if (isSettled)
                    return;
                const current = find(id);
                if (current === undefined || current.backgrounded)
                    return;
                const next = { ...current, backgrounded: true, updatedAt: Date.now() };
                publish(replace(localShard(), next), { type: 'backgrounded', task: next });
            },
            done(detail) {
                if (detail !== undefined)
                    handle.update({ detail });
                finish('done');
            },
            fail(reason) {
                finish('failed', reason);
            },
            track(promise) {
                promise.then(() => { finish('done'); }, (error) => { finish('failed', error instanceof Error ? error.message : String(error)); });
                return promise;
            },
        };
        return handle;
    }
    /**
     * End every task this page still owns, whether or not the caller kept its
     * handle (component remount, HMR, page switch). Cross-page rows are untouched:
     * only their owning page may settle them.
     */
    function settleLocal(reason) {
        let settledCount = 0;
        for (const task of [...localShard()]) {
            const finish = finishers.get(task.id);
            if (finish === undefined)
                continue;
            finish('done', reason);
            settledCount += 1;
        }
        return settledCount;
    }
    const pool = {
        protocol: TASK_NOTIFICATIONS_PROTOCOL,
        origin,
        getSnapshot: () => store.getState(),
        getServerSnapshot: () => EMPTY_SNAPSHOT,
        subscribe: (listener) => {
            connect();
            return store.subscribe(listener);
        },
        connect,
        refresh,
        select: (groups, options) => selectTaskNotifications(store.getState(), groups, options),
        register,
        broadcast,
        settleLocal,
        canRestore: (task) => task.origin === origin,
        requestRestore(taskId) {
            const record = find(taskId);
            if (record === undefined || record.origin !== origin)
                return false;
            bus().emit({ type: 'restored', taskId, remote: false });
            return true;
        },
        /** 关通道、摘监听并广播 bye；状态保留，之后 register / subscribe 会自动重连。 */
        dispose() {
            onPageHide();
            detachLifecycle();
            if (channel !== null) {
                channel.onmessage = null;
                channel.close();
                channel = null;
            }
        },
    };
    return pool;
}
/**
 * One pool and one event bus per page, shared by every inlined core copy.
 *
 * Both are lazy facades: importing `ui` must not touch globalThis, must not
 * create a store, and must not throw when an older core left an incompatible
 * host behind (that used to break the whole `ui` entry on import). The host is
 * claimed on first actual use instead.
 */
let sharedPool;
let sharedBus;
function globalPool() {
    if (sharedPool === undefined)
        sharedPool = claimTaskNotifications(() => createTaskNotificationPool());
    return sharedPool;
}
function globalBus() {
    if (sharedBus === undefined)
        sharedBus = claimTaskNotificationEvents(createTaskNotificationEventBus);
    return sharedBus;
}
export const taskNotifications = {
    protocol: TASK_NOTIFICATIONS_PROTOCOL,
    get origin() { return globalPool().origin; },
    getSnapshot: () => globalPool().getSnapshot(),
    getServerSnapshot: () => globalPool().getServerSnapshot(),
    subscribe: (listener) => globalPool().subscribe(listener),
    connect: () => { globalPool().connect(); },
    refresh: () => { globalPool().refresh(); },
    select: (groups, options) => globalPool().select(groups, options),
    register: (input) => globalPool().register(input),
    broadcast: (input) => globalPool().broadcast(input),
    settleLocal: (reason) => globalPool().settleLocal(reason),
    canRestore: (task) => globalPool().canRestore(task),
    requestRestore: (taskId) => globalPool().requestRestore(taskId),
    dispose: () => { globalPool().dispose(); },
};
function notifyTaskBase(title, options = {}) {
    return taskNotifications.register({
        title,
        ...(options.project === undefined ? {} : { project: options.project }),
        ...(options.group === undefined ? {} : { group: options.group }),
        ...(options.detail === undefined ? {} : { detail: options.detail }),
        ...(options.projectLabel === undefined ? {} : { projectLabel: options.projectLabel }),
        ...(options.groupLabel === undefined ? {} : { groupLabel: options.groupLabel }),
        ...(options.icon === undefined ? {} : { icon: options.icon }),
        ...(options.iconSvg === undefined ? {} : { iconSvg: options.iconSvg }),
        ...(options.hidden === undefined ? {} : { hidden: options.hidden }),
        ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
    });
}
/**
 * 纯广播：只发一个 `message` 事件，**不进池、不进列表**，所以不会有「出现一帧又消失」的闪动。
 *
 * 常驻、要进监控列表、要能被结束的，用 `notifyTask`。
 */
export function notifyMessage(title, options = {}) {
    return taskNotifications.broadcast({
        title,
        ...(options.project === undefined ? {} : { project: options.project }),
        ...(options.group === undefined ? {} : { group: options.group }),
        ...(options.detail === undefined ? {} : { detail: options.detail }),
        ...(options.icon === undefined ? {} : { icon: options.icon }),
        ...(options.iconSvg === undefined ? {} : { iconSvg: options.iconSvg }),
        ...(options.level === undefined ? {} : { level: options.level }),
    });
}
function runTask(title, work, options = {}) {
    const handle = notifyTaskBase(title, options);
    let pending;
    try {
        pending = typeof work === 'function' ? work() : work;
    }
    catch (error) {
        // 同步抛错也要收尾，否则池里留下一条永远 running 的条目。
        handle.fail(error instanceof Error ? error.message : String(error));
        return Promise.reject(error);
    }
    return handle.track(pending);
}
export const notifyTask = Object.assign(notifyTaskBase, { run: runTask });
export const taskNotificationEvents = {
    subscribe: (listener) => globalBus().subscribe(listener),
    emit: (event) => { globalBus().emit(event); },
};
export function subscribeTaskNotificationEvents(listener) {
    return taskNotificationEvents.subscribe(listener);
}
export function emitTaskNotificationEvent(event) {
    taskNotificationEvents.emit(event);
}
//# sourceMappingURL=task-notifications.js.map