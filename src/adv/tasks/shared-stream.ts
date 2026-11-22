/**
 * 同源跨标签 task SSE 单飞协调器。
 *
 * 工业界对标：`sse-coordinator@0.3.2`（Web Locks 排他锁 + 锁回调挂长 Promise、
 * BroadcastChannel 扇出、visibility/online 恢复、cleanup 一次收干净）。在此骨架上
 * 补本项目正确性必需项：Lamport 逻辑届（全序可比较）、单调 seq + 缺口重拉、
 * owner-ready 基线握手、session 级 notice 缓存、permanent giveUp 的 halted/resume。
 *
 * 核心不变量（本版）：
 *   Epoch      —— Lamport 届 {tick,id}，全序可比较；只有「更新」的届能安装，旧届任何消息被挡。
 *                 随机 epoch 无法比较新旧，是「新主 reply 被旧届校验拒绝→follower 永久脱节」的根因。
 *   signal     —— 纯 hint：只触发重拉基线，绝不改 currentEpoch/seenSeq。
 *   state-reply —— 唯一权威安装入口：带 owner 的届 + seq + tasks + notices。
 *   Session    —— 协调器实例整个寿命；controller 只在 dispose() 时 abort；noticeCache 在 session 级。
 *   Lease      —— 一次持锁届；giveUp / watchdog / lifetime / pagehide 只 endLease() 让出锁。
 *   halted     —— permanent giveUp（401）置位：让出锁、停重申请，等 recover/resume 唤醒。
 *
 * 协议 v2：届从 string 改为 Lamport 对象，锁/通道前缀同步升 v2，与旧版本物理隔离
 * （旧标签继续用 v1 各自单飞，刷新后自愈，不会出现新旧混用同一通道的死锁）。
 * 零 DOM at import time：navigator / BroadcastChannel / performance 只在函数内惰性读取。
 */
import { connectTaskStream, type TaskStreamConnection, type TaskStreamGiveUpReason } from './stream.js'

const WIRE_VERSION = 2
const LOCK_PREFIX = 'dshpc/task-stream/v2/'
const CHANNEL_PREFIX = 'dshpc/task-stream/v2/'
const WATCHDOG_MS = 50_000          // > 2 × keepAlive(25s)，保活字节重置计时
const LIFETIME_MS = 10 * 60 * 1000  // 连接寿命上限，到期主动轮换
const NOTICE_LIMIT = 512            // 与 api.ts 的 SEEN_NOTICE_LIMIT 对齐
const STATE_RETRY_MS = 300
const REPLAY_WINDOW_MS = 600        // 建连回放窗口：窗口内 notice 只入缓存不逐条广播
const BACKOFF_MAX_MS = 30_000       // 断流后重申请锁的退避上限

/** 锁 / 通道的最小形状：浏览器原生即满足；测试注入内存实现。 */
export interface SharedLockLike {
  readonly signal: AbortSignal
}
export interface SharedLockManager {
  request(
    name: string,
    options: { signal: AbortSignal },
    callback: (lock: SharedLockLike) => Promise<void>,
  ): Promise<void>
}
export interface SharedChannelLike {
  postMessage(data: unknown): void
  onmessage: ((event: { data: unknown }) => void) | null
  close(): void
}
export type SharedChannelFactory = (name: string) => SharedChannelLike | null
export type SharedLockFactory = () => SharedLockManager | null

export interface SharedStreamOptions {
  readonly streamUrl: string
  readonly onTask: (task: unknown, snapshot: boolean) => void
  readonly onNotice?: (notice: unknown) => void
  readonly headers?: () => Record<string, string>
  readonly retryDelaysMs?: readonly number[]
  readonly onGiveUp?: (reason: TaskStreamGiveUpReason) => void
  /** 测试注入内存锁 / 通道；不传则惰性取 navigator.locks / BroadcastChannel。 */
  readonly lockFactory?: SharedLockFactory
  readonly channelFactory?: SharedChannelFactory
  /** owner 的全量任务快照来源（taskStore.getSnapshot().tasks）。 */
  readonly getState: () => readonly unknown[]
  /** follower 收到基线后应用（幂等合并）。 */
  readonly applyBaseline: (tasks: readonly unknown[]) => void
  /**
   * 页面生命周期监听宿主。实现方负责把 document 事件（freeze/resume/
   * visibilitychange）与 window 事件（pagehide/pageshow/online）路由到正确目标。
   * 不传则不挂（Node / 测试）。
   */
  readonly lifecycle?: SharedLifecycle
}
export interface SharedLifecycle {
  addEventListener(type: string, listener: (...args: never[]) => void): void
  removeEventListener(type: string, listener: (...args: never[]) => void): void
}

type WireKind = 'frame' | 'state-request' | 'state-reply' | 'signal'

/** Lamport 逻辑届：tick 全序，id 仅作同 tick 的确定性 tie-break。 */
interface Epoch {
  readonly tick: number
  readonly id: string
}
const ZERO_EPOCH: Epoch = { tick: 0, id: '' }
function compareEpoch(a: Epoch, b: Epoch): number {
  if (a.tick !== b.tick) return a.tick < b.tick ? -1 : 1
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}
function isEpoch(value: unknown): value is Epoch {
  if (value === null || typeof value !== 'object') return false
  const e = value as Record<string, unknown>
  return typeof e.tick === 'number' && Number.isFinite(e.tick) && typeof e.id === 'string'
}
/** 新届：本地 Lamport 时钟 +1；id 用 selfId 做同 tick 的确定性 tie-break。 */
function newEpoch(clock: number, selfId: string): Epoch {
  return { tick: clock + 1, id: selfId }
}

interface Wire {
  readonly v: number
  readonly ns: string
  readonly kind: WireKind
  /** Lamport 届；全序可比较，旧届消息一律丢弃。 */
  readonly epoch: Epoch
  readonly seq: number
  readonly event?: 'task' | 'notice'
  readonly payload?: unknown
  readonly from?: string
  readonly to?: string
  readonly ready?: boolean
  readonly tasks?: readonly unknown[]
  readonly notices?: readonly unknown[]
  readonly what?: 'epoch' | 'dead' | 'cache'
}

function isWire(value: unknown): value is Wire {
  if (value === null || typeof value !== 'object') return false
  const w = value as Record<string, unknown>
  return w.v === WIRE_VERSION && typeof w.ns === 'string' &&
    typeof w.kind === 'string' && isEpoch(w.epoch) && typeof w.seq === 'number'
}

function noticeIdOf(value: unknown): string | undefined {
  if (value === null || typeof value !== 'object') return undefined
  const id = (value as { id?: unknown }).id
  return typeof id === 'string' ? id : undefined
}

/** 单调时钟：节流不受系统时间回拨影响（原 #19）。 */
function monotonic(): number {
  const p = typeof performance === 'undefined' ? undefined : performance
  return p !== undefined && typeof p.now === 'function' ? p.now() : Date.now()
}

function stableHash(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) { resolve(); return }
    const onAbort = (): void => { clearTimeout(timer); resolve() }
    const timer = setTimeout(() => { signal.removeEventListener('abort', onAbort); resolve() }, ms)
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

/** 一次持锁届的状态；定时器集中，endLease/finally 一次收干净。 */
interface Lease {
  readonly epoch: Epoch
  seq: number
  ready: boolean
  replayDone: boolean
  lastAliveAt: number
  streamConn: TaskStreamConnection | undefined
  ended: boolean
  release: (() => void) | undefined
  /** 移除 session controller 上的 abort 监听；每届一个，cleanup 必须成对摘掉（否则累积泄漏）。 */
  abortOff: (() => void) | undefined
  readonly timers: Set<ReturnType<typeof setTimeout>>
}

/** 一个协调器实例的会话状态。 */
interface Session {
  readonly controller: AbortController
  readonly selfId: string
  readonly ns: string
  readonly lockName: string
  readonly channelName: string
  channel: SharedChannelLike | null
  offline: boolean
  disposed: boolean
  /** 当前已安装届（Lamport 全序）；ZERO_EPOCH 表示还没见过任何届。 */
  currentEpoch: Epoch
  /** Lamport 本地时钟：收到消息时抬到最大 tick，晋升 owner 时 +1 产生新届。 */
  clock: number
  /** permanent giveUp（401）后置位：让出锁并停重申请，等 recover/resume 唤醒。 */
  halted: boolean
  seenSeq: number
  baselineReceived: boolean
  baselineRequestAt: number
  stateRetry: ReturnType<typeof setTimeout> | undefined
  lease: Lease | undefined
  /** notice 去重跨 lease 保留，切主后不重复补齐同一条。 */
  readonly seenReplay: Set<string>
  /** notice 回放缓存提升到 session 级：切主后新 owner 仍有历史可回放（原 #8）。 */
  readonly noticeCache: unknown[]
  backoffMs: number
  /** 退避等待的可唤醒信号：recover/resume 时 abort 打断在飞 sleep，避免最长 30s 空窗。 */
  wake: AbortController
  readonly lifecycleBound: Array<{ type: string; listener: (...args: never[]) => void }>
}

/** 连接句柄：可调用释放；resume 供 permanent giveUp 后显式恢复（刷新凭证）。 */
export interface SharedStreamHandle {
  (): void
  resume(): void
}

/**
 * 加入同源单飞。返回 disposer：只释放本标签持有的引用，不替别的标签关流。
 * `connectTaskCenter` 负责按 streamUrl 幂等 + refcount，这里每个实例就是一条引用。
 */
export function connectSharedTaskStream(options: SharedStreamOptions): SharedStreamHandle {
  const ns = `${WIRE_VERSION}:${stableHash(options.streamUrl)}`
  const state: Session = {
    controller: new AbortController(),
    selfId: `peer:${Math.random().toString(36).slice(2)}`,
    ns,
    lockName: `${LOCK_PREFIX}${ns}`,
    channelName: `${CHANNEL_PREFIX}${ns}`,
    channel: null,
    offline: false,
    disposed: false,
    currentEpoch: ZERO_EPOCH,
    clock: 0,
    halted: false,
    seenSeq: 0,
    baselineReceived: false,
    baselineRequestAt: 0,
    stateRetry: undefined,
    lease: undefined,
    seenReplay: new Set<string>(),
    noticeCache: [],
    backoffMs: STATE_RETRY_MS,
    wake: new AbortController(),
    lifecycleBound: [],
  }

  function openChannel(): SharedChannelLike | null {
    if (state.channel !== null) return state.channel
    const factory = options.channelFactory ?? (() => {
      if (typeof BroadcastChannel === 'undefined') return null
      try {
        const raw = new BroadcastChannel(state.channelName)
        let handler: ((event: { data: unknown }) => void) | null = null
        raw.onmessage = (event: MessageEvent) => { handler?.({ data: event.data }) }
        return {
          postMessage: (data) => raw.postMessage(data),
          set onmessage(fn) { handler = fn },
          get onmessage() { return handler },
          close: () => raw.close(),
        }
      } catch { return null }
    })
    state.channel = factory(state.channelName)
    if (state.channel !== null) state.channel.onmessage = (event) => receive(event.data)
    return state.channel
  }

  function send(wire: Omit<Wire, 'v' | 'ns' | 'epoch' | 'seq'> & Partial<Pick<Wire, 'epoch' | 'seq'>>): void {
    if (state.disposed || state.controller.signal.aborted) return
    const full: Wire = {
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
    }
    try { state.channel?.postMessage(full) } catch (error) {
      console.error('dsh-plugin-core: shared task stream post failed', error)
    }
  }

  function clearStateRetry(): void {
    if (state.stateRetry !== undefined) { clearTimeout(state.stateRetry); state.stateRetry = undefined }
  }

  function scheduleStateRetry(): void {
    if (state.stateRetry !== undefined) return
    state.stateRetry = setTimeout(() => {
      state.stateRetry = undefined
      if (state.disposed || state.controller.signal.aborted || state.offline) return
      if (state.baselineReceived) return
      requestState('join')
    }, STATE_RETRY_MS * 4)
  }

  /** 请求基线：节流命中必补发定时器（原 #6 根治），时钟单调（原 #19 根治）。 */
  function requestState(reason: 'join' | 'gap' | 'signal'): void {
    if (state.disposed || state.controller.signal.aborted || state.offline) return
    // owner 自己就是基线来源，BC 不回环给自己，发包只会每 1.2s 无限自问（原专家 #4）。
    if (state.lease !== undefined && !state.lease.ended) return
    const now = monotonic()
    if (reason !== 'join' && now - state.baselineRequestAt < STATE_RETRY_MS) {
      scheduleStateRetry()
      return
    }
    state.baselineRequestAt = now
    send({ kind: 'state-request', from: state.selfId })
    scheduleStateRetry()
  }

  /** notice 去重集合有界淘汰：Set 按插入序，超上限删最早的（长寿命 session 慢泄漏根治）。 */
  function markSeen(id: string): void {
    if (state.seenReplay.has(id)) return
    if (state.seenReplay.size >= NOTICE_LIMIT) {
      const oldest = state.seenReplay.values().next()
      if (!oldest.done) state.seenReplay.delete(oldest.value)
    }
    state.seenReplay.add(id)
  }

  function applyBaseline(tasks: readonly unknown[], notices: readonly unknown[]): void {
    try { options.applyBaseline(tasks) } catch (error) {
      console.error('dsh-plugin-core: shared task baseline failed', error)
    }
    for (const notice of notices) {
      cacheNotice(notice)  // 基线 notices 也进 session 缓存，晋升 owner 后可回放（#8）
      try { options.onNotice?.(notice) } catch (error) {
        console.error('dsh-plugin-core: shared task notice replay failed', error)
      }
    }
  }

  function receive(data: unknown): void {
    if (state.disposed || state.controller.signal.aborted || state.offline) return
    if (!isWire(data) || data.ns !== state.ns) return
    if (data.from === state.selfId) return
    // Lamport：任何合法消息都把本地时钟抬到所见最大 tick，保证新届严格大于所有已见旧届。
    if (data.epoch.tick > state.clock) state.clock = data.epoch.tick

    // 定向回包只认发给自己（原 #17）；state-reply 是唯一权威安装入口。
    // 旧届 reply 必须丢弃：跨发送者 BC 无全局序，迟到的旧 reply 会把 currentEpoch 打回旧届，
    // 新 owner 的帧随后被等届闸门全丢 → follower 永久脱节（#1 根因）。
    if (data.kind === 'state-reply') {
      if (data.to !== state.selfId || data.ready !== true) return
      const cmp = compareEpoch(data.epoch, state.currentEpoch)
      if (cmp < 0) return
      if (cmp === 0 && data.seq < state.seenSeq) return  // 同届 seq 不回退（#7）
      state.currentEpoch = data.epoch
      // seq 是每 lease 从 0 重计：真换届（cmp>0）必须把水位重置到 reply 的 seq，
      // 否则新 owner 的帧 seq=1..旧N 全被 <= 吞掉且缺口检测不触发（跨届 Math.max 是 bug）。
      // 同届（cmp=0）才用 max 防乱序回退。
      state.seenSeq = cmp > 0 ? data.seq : Math.max(state.seenSeq, data.seq)
      state.baselineReceived = true
      clearStateRetry()
      applyBaseline(data.tasks ?? [], data.notices ?? [])
      return
    }
    if (data.to !== undefined && data.to !== state.selfId) return

    // state-request 不携带可信届（加入者 ZERO_EPOCH），必须在届闸门之前处理。
    if (data.kind === 'state-request') {
      const lease = state.lease
      if (lease !== undefined && !lease.ended && lease.ready) {
        send({
          kind: 'state-reply', to: data.from, ready: true,
          seq: lease.seq,                                // #7：带 owner 当前 seq
          tasks: options.getState(), notices: [...state.noticeCache],  // #8：session 级缓存
        })
      }
      return
    }

    // signal 降级为纯 hint（#1）：只触发重拉，绝不改 currentEpoch/seenSeq。
    // 旧届 hint 直接丢弃，避免无谓重拉（即便放行也只是多拉一次，不破坏正确性）。
    if (data.kind === 'signal') {
      if (compareEpoch(data.epoch, state.currentEpoch) < 0) return
      if (data.what === 'epoch' || data.what === 'cache' || data.what === 'dead') {
        state.baselineReceived = false
        requestState('signal')
      }
      return
    }

    // frame：只认当前届（Lamport 全序相等），旧届帧一律丢弃。
    if (compareEpoch(data.epoch, state.currentEpoch) !== 0) return
    if (data.kind !== 'frame' || data.seq <= state.seenSeq) return
    if (data.seq > state.seenSeq + 1) {
      state.baselineReceived = false   // 缺口：重拉必须补发（原 #6）
      requestState('gap')
    }
    state.seenSeq = data.seq
    if (data.event === 'task') {
      try { options.onTask(data.payload, false) } catch (error) {
        console.error('dsh-plugin-core: shared task frame failed', error)
      }
    } else if (data.event === 'notice') {
      cacheNotice(data.payload)  // follower 也缓存，切主后可回放（#8）
      try { options.onNotice?.(data.payload) } catch (error) {
        console.error('dsh-plugin-core: shared notice frame failed', error)
      }
    }
  }

  /** notice 入 session 级回放缓存：按 id 与 seenReplay 去重，有界淘汰。 */
  function cacheNotice(notice: unknown): void {
    const id = noticeIdOf(notice)
    if (id !== undefined && state.seenReplay.has(id)) return
    if (id !== undefined) markSeen(id)
    state.noticeCache.push(notice)
    if (state.noticeCache.length > NOTICE_LIMIT) state.noticeCache.shift()
  }

  function finishReplay(lease: Lease): void {
    if (lease.replayDone) return
    lease.replayDone = true
    lease.ready = true
    // 广播一次轻量信号让 follower 自拉取缓存（outbox 回放批次不逐条扇出）。
    send({ kind: 'signal', what: 'cache' })
  }

  function track(lease: Lease, timer: ReturnType<typeof setTimeout>): void {
    lease.timers.add(timer)
  }

  function cleanupLease(lease: Lease): void {
    for (const timer of lease.timers) clearTimeout(timer)
    lease.timers.clear()
    lease.abortOff?.()
    lease.abortOff = undefined
    lease.streamConn?.close()
    lease.streamConn = undefined
    if (state.lease === lease) state.lease = undefined
  }

  /** 让出一届锁：只 resolve 锁回调的 Promise，不动 session controller。 */
  function endLease(lease: Lease): void {
    if (lease.ended) return
    lease.ended = true
    lease.release?.()
    // cleanupLease 由 asOwner 的 finally 执行；若 Promise 尚未建立则兜底。
    if (lease.release === undefined) cleanupLease(lease)
  }

  function asOwner(lock: SharedLockLike): Promise<void> {
    // 新届必须基于 max(clock, 当前届.tick) 并回写 clock：owner 自己发的 epoch 信号不回环给自己
    // （BC 语义），若只靠 receive 收别人的消息抬时钟，连续两次任职且期间没收到任何带 tick 的
    // 消息时，newEpoch(clock) 会算出与上一届完全相同的届 → follower 把它当旧届/同届低 seq 拒收。
    const epoch = newEpoch(Math.max(state.clock, state.currentEpoch.tick), state.selfId)
    state.clock = epoch.tick
    const lease: Lease = {
      epoch,
      seq: 0,
      ready: false,
      replayDone: false,
      lastAliveAt: monotonic(),
      streamConn: undefined,
      ended: false,
      release: undefined,
      abortOff: undefined,
      timers: new Set(),
    }
    state.lease = lease
    state.currentEpoch = lease.epoch
    state.seenSeq = 0
    state.baselineReceived = false
    clearStateRetry()  // 晋升 owner 后不再做 follower 的基线重拉

    // 成为 owner 的第一件事：广播新届（BC 同一发送者 FIFO，follower 先见 epoch 再见帧）。
    send({ kind: 'signal', what: 'epoch' })

    lease.streamConn = connectTaskStream({
      streamUrl: options.streamUrl,
      headers: options.headers,
      retryDelaysMs: options.retryDelaysMs,
      // 只有真实 SSE 字节才判活；BC 流量不刷新（原 #8 根治）。
      onAlive: () => {
        lease.lastAliveAt = monotonic()
        state.backoffMs = STATE_RETRY_MS
      },
      onTask: (task, snapshot) => {
        try { options.onTask(task, snapshot) } catch (error) {
          console.error('dsh-plugin-core: shared owner task failed', error)
        }
        if (snapshot) return           // 基线帧不逐条广播，follower 靠 state-reply 拿全量
        if (!lease.replayDone) return  // 回放窗口内不广播
        if (lease.ended) return
        lease.seq += 1
        send({ kind: 'frame', event: 'task', payload: task, seq: lease.seq })
      },
      onNotice: (notice) => {
        cacheNotice(notice)
        try { options.onNotice?.(notice) } catch (error) {
          console.error('dsh-plugin-core: shared owner notice failed', error)
        }
        if (!lease.replayDone) return  // outbox 回放批次只入缓存
        if (lease.ended) return
        lease.seq += 1
        send({ kind: 'frame', event: 'notice', payload: notice, seq: lease.seq })
      },
      onGiveUp: (reason) => {
        // 先置 halted 再调回调：消费方可能在回调里同步刷新凭证并重接（触发 resume），
        // 若 halted 尚未置位，resume 的 `!halted` 守卫会把它当 no-op 吞掉 → 停机睡满 30s。
        if (reason.permanent) state.halted = true
        try { options.onGiveUp?.(reason) } catch (error) {
          console.error('dsh-plugin-core: shared task onGiveUp failed', error)
        }
        send({ kind: 'signal', what: 'dead' })
        // permanent（401/403/404）：让出锁 + 置 halted 停重申请，杜绝无限轮转刷请求（#2）。
        // 非 permanent（5xx/网络退避用尽）：只让锁，run loop 正常退避重申请。
        // 两条路都释放锁——持锁停机是错的；恢复靠 recover/resume 唤醒，不会永久离线。
        endLease(lease)
      },
    })

    track(lease, setTimeout(() => finishReplay(lease), REPLAY_WINDOW_MS))
    // watchdog 只在 owner 跑（原 #14 根治）；超时只让出锁，run loop 重申请。
    track(lease, setInterval(() => {
      if (state.disposed || lease.ended || state.controller.signal.aborted) return
      if (monotonic() - lease.lastAliveAt < WATCHDOG_MS) return
      endLease(lease)
    }, WATCHDOG_MS / 2))
    track(lease, setTimeout(() => endLease(lease), LIFETIME_MS))

    return new Promise<void>((resolve) => {
      const release = (): void => { resolve() }
      lease.release = release
      lock.signal.addEventListener('abort', release, { once: true })
      const onSessionAbort = (): void => { release() }
      state.controller.signal.addEventListener('abort', onSessionAbort, { once: true })
      lease.abortOff = () => state.controller.signal.removeEventListener('abort', onSessionAbort)
    }).finally(() => {
      cleanupLease(lease)
    })
  }

  async function run(): Promise<void> {
    const lockFactory = options.lockFactory ?? (() => {
      const nav = typeof navigator === 'undefined' ? undefined : navigator
      const locks = nav?.locks
      return locks === undefined ? null : locks as unknown as SharedLockManager
    })
    const locks = lockFactory()
    if (locks === null) {
      // 无 Web Locks：显式离线，绝不退回每标签各开一条。
      console.warn('dsh-plugin-core: Web Locks unavailable; task stream stays offline to avoid connection exhaustion')
      state.offline = true
      clearStateRetry()
      return
    }
    while (!state.disposed && !state.controller.signal.aborted) {
      if (state.halted) {
        // permanent giveUp：不重申请锁，等 recover/resume 清 halted + wake 唤醒（#2）。
        // 长睡 + 可打断，期间不刷任何请求，也绝不永久离线。
        await sleep(BACKOFF_MAX_MS, state.wake.signal)
        continue
      }
      try {
        await locks.request(state.lockName, { signal: state.controller.signal }, (lock) => asOwner(lock))
      } catch (error) {
        if (!state.disposed && !state.controller.signal.aborted) {
          console.error('dsh-plugin-core: shared task lock failed', error)
        }
      }
      if (state.disposed || state.controller.signal.aborted) return
      if (state.halted) continue  // 持锁期间 giveUp 置位：跳过退避，直接进 halted 等待
      await sleep(state.backoffMs, state.wake.signal)
      state.backoffMs = Math.min(state.backoffMs * 2, BACKOFF_MAX_MS)
    }
  }

  function recover(): void {
    if (state.disposed || state.controller.signal.aborted || state.offline) return
    // 可见性/在线恢复：清除 permanent 停机，允许重新申请锁（#2：不永久离线）。
    state.halted = false
    // 从冻结/隐藏恢复时重置退避并打断在飞的 sleep，避免 bfcache 恢复后睡满 30s 空窗。
    state.backoffMs = STATE_RETRY_MS
    state.wake.abort()
    state.wake = new AbortController()
    const lease = state.lease
    if (lease !== undefined && !lease.ended) {
      // 疑似死流：交给 watchdog 语义，到阈值就让出锁重选。
      if (monotonic() - lease.lastAliveAt >= WATCHDOG_MS) endLease(lease)
    } else {
      requestState('signal')
    }
  }

  const onHide = (): void => {
    const lease = state.lease
    if (lease !== undefined) endLease(lease)
  }
  const onShow = (): void => { recover() }
  const onOnline = (): void => { recover() }

  const lifecycle = options.lifecycle
  if (lifecycle !== undefined) {
    const bound = (type: string, listener: (...args: never[]) => void): void => {
      lifecycle.addEventListener(type, listener)
      state.lifecycleBound.push({ type, listener })
    }
    bound('pagehide', onHide)
    bound('freeze', onHide)
    bound('pageshow', onShow)
    bound('resume', onShow)
    bound('visibilitychange', onShow)
    bound('online', onOnline)
  }

  openChannel()
  void run()
  requestState('join')

  const handle = (): void => {
    if (state.disposed) return
    state.disposed = true
    state.controller.abort()
    state.wake.abort()
    const lease = state.lease
    if (lease !== undefined) endLease(lease)
    clearStateRetry()
    for (const { type, listener } of state.lifecycleBound) {
      lifecycle?.removeEventListener(type, listener)
    }
    state.lifecycleBound.length = 0
    state.channel?.close()
    state.channel = null
  }
  /**
   * permanent giveUp 后显式恢复（消费方刷新凭证、再次接线时调用）。
   * 与 recover 同源：清 halted + 打断在飞长睡，让 run loop 立即重申请锁；
   * headers 是函数，新 lease 自然取到新凭证（#2）。
   */
  handle.resume = (): void => {
    if (state.disposed || state.controller.signal.aborted || state.offline) return
    if (!state.halted) return  // 没停机就不动，避免重复接线打断在飞退避
    state.halted = false
    state.backoffMs = STATE_RETRY_MS
    state.wake.abort()
    state.wake = new AbortController()
  }
  return handle
}
