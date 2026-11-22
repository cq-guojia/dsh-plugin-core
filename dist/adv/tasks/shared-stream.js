/**
 * 同源跨标签 task SSE 单飞协调器。
 *
 * 工业界对标：`sse-coordinator@0.3.2`（Web Locks 排他锁 + 锁回调挂长 Promise、
 * BroadcastChannel 扇出、visibility/online 恢复、cleanup 一次收干净）。在此骨架上
 * 补本项目正确性必需项：随机届 epoch（相等比较，不依赖挂钟）、单调 seq + 缺口重拉、
 * owner-ready 基线握手、有界 notice 缓存（含 outbox 回放批次）。
 *
 * 两级生命周期（本版核心不变量）：
 *   Session —— 一个协调器实例的整个寿命；controller 只在 dispose() 时 abort。
 *   Lease   —— 一次持锁届；giveUp / watchdog / lifetime / pagehide 只 endLease()
 *               （让出锁），run loop 退避后自动重申请，绝不 abort session。
 *               因此断流不会永久离线，bfcache 恢复无需重建 session。
 *
 * 零 DOM at import time：navigator / BroadcastChannel / crypto / performance 只在函数内惰性读取。
 */
import { connectTaskStream } from './stream.js';
const WIRE_VERSION = 1;
const LOCK_PREFIX = 'dshpc/task-stream/v1/';
const CHANNEL_PREFIX = 'dshpc/task-stream/v1/';
const WATCHDOG_MS = 50000; // > 2 × keepAlive(25s)，保活字节重置计时
const LIFETIME_MS = 10 * 60 * 1000; // 连接寿命上限，到期主动轮换
const NOTICE_LIMIT = 512; // 与 api.ts 的 SEEN_NOTICE_LIMIT 对齐
const STATE_RETRY_MS = 300;
const REPLAY_WINDOW_MS = 600; // 建连回放窗口：窗口内 notice 只入缓存不逐条广播
const BACKOFF_MAX_MS = 30000; // 断流后重申请锁的退避上限
function isWire(value) {
    if (value === null || typeof value !== 'object')
        return false;
    const w = value;
    return w.v === WIRE_VERSION && typeof w.ns === 'string' &&
        typeof w.kind === 'string' && typeof w.epoch === 'string' && typeof w.seq === 'number';
}
function noticeIdOf(value) {
    if (value === null || typeof value !== 'object')
        return undefined;
    const id = value.id;
    return typeof id === 'string' ? id : undefined;
}
/** 随机届 ID：只做相等比较，天然免疫挂钟回拨与冷启动回拨（原 #18）。 */
function newEpoch() {
    const c = typeof crypto === 'undefined' ? undefined : crypto;
    if (c !== undefined && typeof c.randomUUID === 'function')
        return c.randomUUID();
    counter += 1;
    return `epoch:${Math.random().toString(36).slice(2)}:${counter.toString(36)}`;
}
let counter = 0;
/** 单调时钟：节流不受系统时间回拨影响（原 #19）。 */
function monotonic() {
    const p = typeof performance === 'undefined' ? undefined : performance;
    return p !== undefined && typeof p.now === 'function' ? p.now() : Date.now();
}
function stableHash(input) {
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i += 1) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(36);
}
function sleep(ms, signal) {
    return new Promise((resolve) => {
        if (signal.aborted) {
            resolve();
            return;
        }
        const onAbort = () => { clearTimeout(timer); resolve(); };
        const timer = setTimeout(() => { signal.removeEventListener('abort', onAbort); resolve(); }, ms);
        signal.addEventListener('abort', onAbort, { once: true });
    });
}
/**
 * 加入同源单飞。返回 disposer：只释放本标签持有的引用，不替别的标签关流。
 * `connectTaskCenter` 负责按 streamUrl 幂等 + refcount，这里每个实例就是一条引用。
 */
export function connectSharedTaskStream(options) {
    const ns = `${WIRE_VERSION}:${stableHash(options.streamUrl)}`;
    const state = {
        controller: new AbortController(),
        selfId: `peer:${Math.random().toString(36).slice(2)}`,
        ns,
        lockName: `${LOCK_PREFIX}${ns}`,
        channelName: `${CHANNEL_PREFIX}${ns}`,
        channel: null,
        offline: false,
        disposed: false,
        currentEpoch: '',
        seenSeq: 0,
        baselineReceived: false,
        baselineRequestAt: 0,
        stateRetry: undefined,
        lease: undefined,
        seenReplay: new Set(),
        backoffMs: STATE_RETRY_MS,
        wake: new AbortController(),
        lifecycleBound: [],
    };
    function openChannel() {
        if (state.channel !== null)
            return state.channel;
        const factory = options.channelFactory ?? (() => {
            if (typeof BroadcastChannel === 'undefined')
                return null;
            try {
                const raw = new BroadcastChannel(state.channelName);
                let handler = null;
                raw.onmessage = (event) => { handler?.({ data: event.data }); };
                return {
                    postMessage: (data) => raw.postMessage(data),
                    set onmessage(fn) { handler = fn; },
                    get onmessage() { return handler; },
                    close: () => raw.close(),
                };
            }
            catch {
                return null;
            }
        });
        state.channel = factory(state.channelName);
        if (state.channel !== null)
            state.channel.onmessage = (event) => receive(event.data);
        return state.channel;
    }
    function send(wire) {
        if (state.disposed || state.controller.signal.aborted)
            return;
        const full = {
            v: WIRE_VERSION,
            ns: state.ns,
            epoch: wire.epoch ?? state.lease?.epoch ?? state.currentEpoch,
            seq: wire.seq ?? 0,
            kind: wire.kind,
            ...(wire.event === undefined ? {} : { event: wire.event }),
            ...(wire.payload === undefined ? {} : { payload: wire.payload }),
            ...(wire.from === undefined ? {} : { from: wire.from }),
            ...(wire.to === undefined ? {} : { to: wire.to }),
            ...(wire.ready === undefined ? {} : { ready: wire.ready }),
            ...(wire.tasks === undefined ? {} : { tasks: wire.tasks }),
            ...(wire.notices === undefined ? {} : { notices: wire.notices }),
            ...(wire.what === undefined ? {} : { what: wire.what }),
        };
        try {
            state.channel?.postMessage(full);
        }
        catch (error) {
            console.error('dsh-plugin-core: shared task stream post failed', error);
        }
    }
    function clearStateRetry() {
        if (state.stateRetry !== undefined) {
            clearTimeout(state.stateRetry);
            state.stateRetry = undefined;
        }
    }
    function scheduleStateRetry() {
        if (state.stateRetry !== undefined)
            return;
        state.stateRetry = setTimeout(() => {
            state.stateRetry = undefined;
            if (state.disposed || state.controller.signal.aborted || state.offline)
                return;
            if (state.baselineReceived)
                return;
            requestState('join');
        }, STATE_RETRY_MS * 4);
    }
    /** 请求基线：节流命中必补发定时器（原 #6 根治），时钟单调（原 #19 根治）。 */
    function requestState(reason) {
        if (state.disposed || state.controller.signal.aborted || state.offline)
            return;
        // owner 自己就是基线来源，BC 不回环给自己，发包只会每 1.2s 无限自问（原专家 #4）。
        if (state.lease !== undefined && !state.lease.ended)
            return;
        const now = monotonic();
        if (reason !== 'join' && now - state.baselineRequestAt < STATE_RETRY_MS) {
            scheduleStateRetry();
            return;
        }
        state.baselineRequestAt = now;
        send({ kind: 'state-request', from: state.selfId });
        scheduleStateRetry();
    }
    /** notice 去重集合有界淘汰：Set 按插入序，超上限删最早的（长寿命 session 慢泄漏根治）。 */
    function markSeen(id) {
        if (state.seenReplay.has(id))
            return;
        if (state.seenReplay.size >= NOTICE_LIMIT) {
            const oldest = state.seenReplay.values().next();
            if (!oldest.done)
                state.seenReplay.delete(oldest.value);
        }
        state.seenReplay.add(id);
    }
    function applyBaseline(tasks, notices) {
        try {
            options.applyBaseline(tasks);
        }
        catch (error) {
            console.error('dsh-plugin-core: shared task baseline failed', error);
        }
        for (const notice of notices) {
            const id = noticeIdOf(notice);
            if (id !== undefined)
                markSeen(id);
            try {
                options.onNotice?.(notice);
            }
            catch (error) {
                console.error('dsh-plugin-core: shared task notice replay failed', error);
            }
        }
    }
    function receive(data) {
        if (state.disposed || state.controller.signal.aborted || state.offline)
            return;
        if (!isWire(data) || data.ns !== state.ns)
            return;
        if (data.from === state.selfId)
            return;
        // 定向回包只认发给自己（原 #17 根治）；ready 才带权威基线。
        // 必须过届校验：跨发送者 BC 无全局序，旧 owner 的 reply 可能迟到于新 owner 的 epoch 信号，
        // 若无条件采纳会把 currentEpoch 打回旧届并清掉重试 → follower 永久收不到新 owner 的帧。
        // 空届（新标签刚加入、还没收到 epoch 信号）放行并采纳 reply 的届，否则要求严格相等。
        if (data.kind === 'state-reply') {
            if (data.to !== state.selfId)
                return;
            if (state.currentEpoch !== '' && data.epoch !== state.currentEpoch)
                return;
            if (data.ready === true) {
                state.currentEpoch = data.epoch;
                state.seenSeq = data.seq;
                state.baselineReceived = true;
                clearStateRetry();
                applyBaseline(data.tasks ?? [], data.notices ?? []);
            }
            return;
        }
        if (data.to !== undefined && data.to !== state.selfId)
            return;
        // state-request 不携带可信 epoch（加入者 epoch 为空），必须在 epoch 闸门之前处理。
        if (data.kind === 'state-request') {
            const lease = state.lease;
            if (lease !== undefined && !lease.ended && lease.ready) {
                send({
                    kind: 'state-reply', to: data.from, ready: true,
                    tasks: options.getState(), notices: [...lease.noticeCache],
                });
            }
            return;
        }
        // signal 不带数据帧的 seq 语义，单独处理，不进帧闸门。
        if (data.kind === 'signal') {
            if (data.what === 'epoch' || data.what === 'cache') {
                if (data.epoch !== state.currentEpoch) {
                    state.currentEpoch = data.epoch;
                    state.seenSeq = 0;
                }
                state.baselineReceived = false;
                requestState('signal');
            }
            else if (data.what === 'dead') {
                state.baselineReceived = false;
                requestState('signal');
            }
            return;
        }
        // frame：只认当前届（相等比较，原 #18 根治）。
        if (data.epoch !== state.currentEpoch)
            return;
        if (data.kind !== 'frame' || data.seq <= state.seenSeq)
            return;
        if (data.seq > state.seenSeq + 1) {
            state.baselineReceived = false; // 缺口：重拉必须补发（原 #6）
            requestState('gap');
        }
        state.seenSeq = data.seq;
        if (data.event === 'task') {
            try {
                options.onTask(data.payload, false);
            }
            catch (error) {
                console.error('dsh-plugin-core: shared task frame failed', error);
            }
        }
        else if (data.event === 'notice') {
            try {
                options.onNotice?.(data.payload);
            }
            catch (error) {
                console.error('dsh-plugin-core: shared notice frame failed', error);
            }
        }
    }
    function cacheNotice(lease, notice) {
        const id = noticeIdOf(notice);
        if (id !== undefined && state.seenReplay.has(id))
            return;
        if (id !== undefined)
            markSeen(id);
        lease.noticeCache.push(notice);
        if (lease.noticeCache.length > NOTICE_LIMIT)
            lease.noticeCache.shift();
    }
    function finishReplay(lease) {
        if (lease.replayDone)
            return;
        lease.replayDone = true;
        lease.ready = true;
        // 广播一次轻量信号让 follower 自拉取缓存（outbox 回放批次不逐条扇出）。
        send({ kind: 'signal', what: 'cache' });
    }
    function track(lease, timer) {
        lease.timers.add(timer);
    }
    function cleanupLease(lease) {
        for (const timer of lease.timers)
            clearTimeout(timer);
        lease.timers.clear();
        lease.abortOff?.();
        lease.abortOff = undefined;
        lease.streamConn?.close();
        lease.streamConn = undefined;
        if (state.lease === lease)
            state.lease = undefined;
    }
    /** 让出一届锁：只 resolve 锁回调的 Promise，不动 session controller。 */
    function endLease(lease) {
        if (lease.ended)
            return;
        lease.ended = true;
        lease.release?.();
        // cleanupLease 由 asOwner 的 finally 执行；若 Promise 尚未建立则兜底。
        if (lease.release === undefined)
            cleanupLease(lease);
    }
    function asOwner(lock) {
        const lease = {
            epoch: newEpoch(),
            seq: 0,
            ready: false,
            replayDone: false,
            lastAliveAt: monotonic(),
            noticeCache: [],
            streamConn: undefined,
            ended: false,
            release: undefined,
            abortOff: undefined,
            timers: new Set(),
        };
        state.lease = lease;
        state.currentEpoch = lease.epoch;
        state.seenSeq = 0;
        state.baselineReceived = false;
        clearStateRetry(); // 晋升 owner 后不再做 follower 的基线重拉
        // 成为 owner 的第一件事：广播新届（BC 同一发送者 FIFO，follower 先见 epoch 再见帧）。
        send({ kind: 'signal', what: 'epoch' });
        lease.streamConn = connectTaskStream({
            streamUrl: options.streamUrl,
            headers: options.headers,
            retryDelaysMs: options.retryDelaysMs,
            // 只有真实 SSE 字节才判活；BC 流量不刷新（原 #8 根治）。
            onAlive: () => {
                lease.lastAliveAt = monotonic();
                state.backoffMs = STATE_RETRY_MS;
            },
            onTask: (task, snapshot) => {
                try {
                    options.onTask(task, snapshot);
                }
                catch (error) {
                    console.error('dsh-plugin-core: shared owner task failed', error);
                }
                if (snapshot)
                    return; // 基线帧不逐条广播，follower 靠 state-reply 拿全量
                if (!lease.replayDone)
                    return; // 回放窗口内不广播
                if (lease.ended)
                    return;
                lease.seq += 1;
                send({ kind: 'frame', event: 'task', payload: task, seq: lease.seq });
            },
            onNotice: (notice) => {
                cacheNotice(lease, notice);
                try {
                    options.onNotice?.(notice);
                }
                catch (error) {
                    console.error('dsh-plugin-core: shared owner notice failed', error);
                }
                if (!lease.replayDone)
                    return; // outbox 回放批次只入缓存
                if (lease.ended)
                    return;
                lease.seq += 1;
                send({ kind: 'frame', event: 'notice', payload: notice, seq: lease.seq });
            },
            onGiveUp: (reason) => {
                try {
                    options.onGiveUp?.(reason);
                }
                catch (error) {
                    console.error('dsh-plugin-core: shared task onGiveUp failed', error);
                }
                send({ kind: 'signal', what: 'dead' });
                endLease(lease);
            },
        });
        track(lease, setTimeout(() => finishReplay(lease), REPLAY_WINDOW_MS));
        // watchdog 只在 owner 跑（原 #14 根治）；超时只让出锁，run loop 重申请。
        track(lease, setInterval(() => {
            if (state.disposed || lease.ended || state.controller.signal.aborted)
                return;
            if (monotonic() - lease.lastAliveAt < WATCHDOG_MS)
                return;
            endLease(lease);
        }, WATCHDOG_MS / 2));
        track(lease, setTimeout(() => endLease(lease), LIFETIME_MS));
        return new Promise((resolve) => {
            const release = () => { resolve(); };
            lease.release = release;
            lock.signal.addEventListener('abort', release, { once: true });
            const onSessionAbort = () => { release(); };
            state.controller.signal.addEventListener('abort', onSessionAbort, { once: true });
            lease.abortOff = () => state.controller.signal.removeEventListener('abort', onSessionAbort);
        }).finally(() => {
            cleanupLease(lease);
        });
    }
    async function run() {
        const lockFactory = options.lockFactory ?? (() => {
            const nav = typeof navigator === 'undefined' ? undefined : navigator;
            const locks = nav?.locks;
            return locks === undefined ? null : locks;
        });
        const locks = lockFactory();
        if (locks === null) {
            // 无 Web Locks：显式离线，绝不退回每标签各开一条。
            console.warn('dsh-plugin-core: Web Locks unavailable; task stream stays offline to avoid connection exhaustion');
            state.offline = true;
            clearStateRetry();
            return;
        }
        while (!state.disposed && !state.controller.signal.aborted) {
            try {
                await locks.request(state.lockName, { signal: state.controller.signal }, (lock) => asOwner(lock));
            }
            catch (error) {
                if (!state.disposed && !state.controller.signal.aborted) {
                    console.error('dsh-plugin-core: shared task lock failed', error);
                }
            }
            if (state.disposed || state.controller.signal.aborted)
                return;
            await sleep(state.backoffMs, state.wake.signal);
            state.backoffMs = Math.min(state.backoffMs * 2, BACKOFF_MAX_MS);
        }
    }
    function recover() {
        if (state.disposed || state.controller.signal.aborted || state.offline)
            return;
        // 从冻结/隐藏恢复时重置退避并打断在飞的 sleep，避免 bfcache 恢复后睡满 30s 空窗。
        state.backoffMs = STATE_RETRY_MS;
        state.wake.abort();
        state.wake = new AbortController();
        const lease = state.lease;
        if (lease !== undefined && !lease.ended) {
            // 疑似死流：交给 watchdog 语义，到阈值就让出锁重选。
            if (monotonic() - lease.lastAliveAt >= WATCHDOG_MS)
                endLease(lease);
        }
        else {
            requestState('signal');
        }
    }
    const onHide = () => {
        const lease = state.lease;
        if (lease !== undefined)
            endLease(lease);
    };
    const onShow = () => { recover(); };
    const onOnline = () => { recover(); };
    const lifecycle = options.lifecycle;
    if (lifecycle !== undefined) {
        const bound = (type, listener) => {
            lifecycle.addEventListener(type, listener);
            state.lifecycleBound.push({ type, listener });
        };
        bound('pagehide', onHide);
        bound('freeze', onHide);
        bound('pageshow', onShow);
        bound('resume', onShow);
        bound('visibilitychange', onShow);
        bound('online', onOnline);
    }
    openChannel();
    void run();
    requestState('join');
    return () => {
        if (state.disposed)
            return;
        state.disposed = true;
        state.controller.abort();
        state.wake.abort();
        const lease = state.lease;
        if (lease !== undefined)
            endLease(lease);
        clearStateRetry();
        for (const { type, listener } of state.lifecycleBound) {
            lifecycle?.removeEventListener(type, listener);
        }
        state.lifecycleBound.length = 0;
        state.channel?.close();
        state.channel = null;
    };
}
//# sourceMappingURL=shared-stream.js.map