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
export const TASK_NOTIFICATIONS_PROTOCOL = 1;
export const TASK_NOTIFICATIONS_KEY = Symbol.for('dsh-plugin-core/task-notifications/v1');
export const TASK_NOTIFICATIONS_EVENTS_KEY = Symbol.for('dsh-plugin-core/task-notifications/events/v1');
export const TASK_NOTIFICATIONS_CHANNEL = 'dsh-plugin-core/task-notifications/v1';
const EMPTY_TASKS = Object.freeze([]);
const EMPTY_SNAPSHOT = Object.freeze({ tasks: EMPTY_TASKS, revision: 0 });
/** Per-snapshot derived cache: same snapshot + same filter returns the SAME array. */
const SELECT_CACHE = new WeakMap();
/**
 * undefined / empty = show every group; one or more = show only those groups.
 * The returned reference is stable for the lifetime of the snapshot.
 */
export function selectTaskNotifications(snapshot, groups) {
    const key = groups === undefined || groups.length === 0 ? '*' : [...groups].sort().join('\u0000');
    let perSnapshot = SELECT_CACHE.get(snapshot);
    if (perSnapshot === undefined) {
        perSnapshot = new Map();
        SELECT_CACHE.set(snapshot, perSnapshot);
    }
    const cached = perSnapshot.get(key);
    if (cached !== undefined)
        return cached;
    const result = key === '*'
        ? snapshot.tasks
        : Object.freeze(snapshot.tasks.filter((task) => groups.includes(task.group)));
    perSnapshot.set(key, result);
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
function isTaskRecord(value) {
    if (!isRecord(value))
        return false;
    return (typeof value.id === 'string' &&
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
/** Reject malformed / foreign messages instead of letting them poison the pool. */
function parseMessage(value) {
    if (!isRecord(value) || typeof value.origin !== 'string')
        return null;
    if (value.kind === 'hello')
        return { kind: 'hello', origin: value.origin };
    if (value.kind === 'bye') {
        return typeof value.seq === 'number' ? { kind: 'bye', origin: value.origin, seq: value.seq } : null;
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
export const TASK_NOTIFICATIONS_LOCK_PREFIX = 'dsh-plugin-core/task-notifications/v1/';
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
    let channel = null;
    let everConnected = false;
    let everPublished = false;
    function collect() {
        const all = [];
        for (const shard of shards.values())
            all.push(...shard.tasks);
        return Object.freeze(all.sort(compareTasks));
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
        seq += 1;
        revision += 1;
        shards.set(origin, { origin, seq, tasks: Object.freeze([...nextTasks]) });
        knownSeq.set(origin, seq);
        everPublished = true;
        store.setState({ tasks: collect(), revision }, true);
        emit(notice, false);
        broadcastShard(notice);
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
        connect();
        const now = Date.now();
        const id = `${origin}:${String(++idSeq)}`;
        const record = {
            id,
            group: input.group,
            groupLabel: input.groupLabel,
            title: input.title,
            detail: input.detail,
            status: 'running',
            startedAt: now,
            updatedAt: now,
            origin,
            backgrounded: false,
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
                const current = find(id);
                if (current === undefined)
                    return;
                const next = {
                    ...current,
                    ...(patch.title === undefined ? {} : { title: patch.title }),
                    ...(patch.detail === undefined ? {} : { detail: patch.detail }),
                    ...(patch.group === undefined ? {} : { group: patch.group }),
                    ...(patch.groupLabel === undefined ? {} : { groupLabel: patch.groupLabel }),
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
        select: (groups) => selectTaskNotifications(store.getState(), groups),
        register,
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
    select: (groups) => globalPool().select(groups),
    register: (input) => globalPool().register(input),
    settleLocal: (reason) => globalPool().settleLocal(reason),
    canRestore: (task) => globalPool().canRestore(task),
    requestRestore: (taskId) => globalPool().requestRestore(taskId),
    dispose: () => { globalPool().dispose(); },
};
function notifyTaskBase(group, title, options = {}) {
    return taskNotifications.register({ group, title, detail: options.detail, groupLabel: options.groupLabel });
}
function runTask(group, title, work) {
    const handle = notifyTaskBase(group, title);
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