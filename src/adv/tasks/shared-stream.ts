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
/** 连续 permanent giveUp 达 2 次后的 resume 冷却窗口：凭证未就绪的恢复在此窗口内 no-op。 */
const RESUME_COOLDOWN_MS = 3_000
const REPLAY_WINDOW_MS = 600        // 建连回放窗口：窗口内 notice 只入缓存不逐条广播
const BACKOFF_MAX_MS = 30_000       // 断流后重申请锁的退避上限

/**
 * Lamport 时钟的跨会话持久化（冷启动届低于在册 follower 的根治）。
 * 同源标签是一个逻辑进程，新标签必须继承「已见过的最大 tick」，否则冷标签 clock=0
 * 会铸出 {1,B} 被在册 follower 的 {5,A} 三道闸门全拒 → follower 永久脱节。
 * 用 localStorage（跨标签共享），与通知去重的 sessionStorage（每标签独立）用途不同、key 不混。
 * 无存储环境（Node 测试 / 隐私模式 / 配额异常）退化为模块内存 Map，仍优于每次归零。
 */
const MAX_TICK_PREFIX = 'dshpc:task-stream:maxtick:'
const maxTickFallback = new Map<string, number>()
function loadMaxTick(ns: string): number {
  const inMemory = maxTickFallback.get(ns) ?? 0
  try {
    if (typeof localStorage === 'undefined') return inMemory
    const raw = localStorage.getItem(MAX_TICK_PREFIX + ns)
    const tick = raw === null ? 0 : Number(raw)
    // 存储被清空 / 写入失败后恢复时，内存里更高的 tick 仍是本进程见过的真值，不能回拨。
    return Math.max(inMemory, Number.isFinite(tick) && tick >= 0 ? tick : 0)
  } catch { return inMemory }
}
function persistMaxTick(ns: string, tick: number): void {
  const inMemory = maxTickFallback.get(ns) ?? 0
  if (tick > inMemory) maxTickFallback.set(ns, tick)
  try {
    if (typeof localStorage === 'undefined') return
    const raw = localStorage.getItem(MAX_TICK_PREFIX + ns)
    const current = raw === null ? 0 : Number(raw)
    if (!Number.isFinite(current) || tick > current) localStorage.setItem(MAX_TICK_PREFIX + ns, String(tick))
  } catch { /* 存储不可用：内存兜底已做，届仍在本会话单调 */ }
}

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
  /** 可选：页面当前是否可见。visibilitychange 隐藏时也触发，只有可见时才能 recover（#7）。 */
  readonly isVisible?: () => boolean
  /**
   * 可选：是否把 online 当作停机唤醒源，默认 true。需要「仅在凭证就绪后显式恢复」的应用
   * 设为 false——否则 online 会先用旧 headers 打一次 401，消费方无法在 core 内部拦住它。
   */
  readonly autoRecoverOnOnline?: boolean | (() => boolean)
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
  readonly what?: 'epoch' | 'dead' | 'cache' | 'claim'
  /** state-request：接收方已收通知的最大 settledAt；owner 只回放比它更新的，避免新标签被灌满历史。 */
  readonly noticeSince?: number
  /** state-reply：本次基线回放的截止水位，接收方据此推进自己的 noticeSince。 */
  readonly noticeWatermark?: number
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

/**
 * 通知的结算水位：TaskNotice = { id, task: TaskRecord }，取 task.settledAt（服务端权威时间）。
 * 畸形/缺字段的通知返回 undefined——不参与水位推进，也不会被水位裁掉（保守放行，不丢通知）。
 */
function noticeSettledAtOf(value: unknown): number | undefined {
  if (value === null || typeof value !== 'object') return undefined
  const task = (value as { task?: unknown }).task
  if (task === null || typeof task !== 'object') return undefined
  const at = (task as { settledAt?: unknown }).settledAt
  return typeof at === 'number' && Number.isFinite(at) ? at : undefined
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
  /**
   * 已收通知的最大 settledAt（服务端权威时钟）。新标签从 0 起 → 只拿基线时刻之后的通知；
   * 在册 follower 随收随推进 → 重拉只拿断档期的增量。这是「新标签被灌满 512 条」的根治点。
   */
  noticeSince: number
  backoffMs: number
  /** 退避等待的可唤醒信号：recover/resume 时 abort 打断在飞 sleep，避免最长 30s 空窗。 */
  wake: AbortController
  /**
   * 最近一次 fencing 广播的目标届（字符串 tick:id）+ 时刻。同一低届只挑战一次，
   * 避免每收到一帧就刷 claim；对方让锁后与新届重选自然收敛。
   */
  lastClaimKey: string | undefined
  lastClaimAt: number
  /**
   * permanent（401）连续失败次数与最近一次时刻。凭证未刷新就 resume 会再打一次 401，
   * 若每次都放通就是无界轮转。连续失败达阈值后 resume 在冷却窗口内 no-op——
   * "有界"从此是 core 的真实保证，而不是靠消费方自觉。成功建流后清零。
   */
  permanentStreak: number
  lastPermanentAt: number
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
    clock: loadMaxTick(ns),
    halted: false,
    seenSeq: 0,
    baselineReceived: false,
    baselineRequestAt: 0,
    stateRetry: undefined,
    lease: undefined,
    seenReplay: new Set<string>(),
    noticeCache: [],
    // 通知水位用挂钟基准，与服务端 settledAt 同源（isTaskRecord 要求它是 Date.now() 级别）。
    // 新标签从「加入时刻」起算 → 历史通知全被裁掉；这不是 epoch（届仍纯 Lamport、不碰挂钟）。
    noticeSince: Date.now(),
    backoffMs: STATE_RETRY_MS,
    wake: new AbortController(),
    lastClaimKey: undefined,
    lastClaimAt: 0,
    permanentStreak: 0,
    lastPermanentAt: 0,
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
      ...(wire.noticeSince === undefined ? {} : { noticeSince: wire.noticeSince }),
      ...(wire.noticeWatermark === undefined ? {} : { noticeWatermark: wire.noticeWatermark }),
    }
    try { state.channel?.postMessage(full) } catch (error) {
      console.error('dsh-plugin-core: shared task stream post failed', error)
    }
  }

  function clearStateRetry(): void {
    if (state.stateRetry !== undefined) { clearTimeout(state.stateRetry); state.stateRetry = undefined }
  }

  /**
   * Fencing 挑战（跨 realm 低届的根治）：持有更高届的非 owner 见到低届 owner 的任何
   * 权威消息（signal 开局信号 / state-reply 基线回包 / frame 增量帧）都广播 claim
   * 要求对方让锁。localStorage 被清空 / 隐私模式下各标签内存兜底独立，冷标签可能以
   * tick=1 抢锁；晚重拉的高届 follower 若只在 signal 分支挑战，拿到的低届 reply / frame
   * 会被静默丢弃且 baselineReceived 永远 false，冻到 owner 10 分钟寿命轮换。
   * 同一低届 5s 内只挑战一次，避免每帧刷 claim。
   */
  function challengeLowEpoch(low: Epoch): void {
    if (state.currentEpoch.tick === 0 || state.lease !== undefined) return
    const key = `${low.tick}:${low.id}`
    const now = monotonic()
    if (state.lastClaimKey === key && now - state.lastClaimAt < 5000) return
    state.lastClaimKey = key
    state.lastClaimAt = now
    send({ kind: 'signal', what: 'claim' }) // epoch 取本标签 currentEpoch（非 owner 走它）
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
    // 带接收方水位：owner 只回放 settledAt > 此值的 notice（#6 根治）。
    send({ kind: 'state-request', from: state.selfId, noticeSince: state.noticeSince })
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
      // #9 根治：在 cacheNotice 之前快照 fresh——cacheNotice 内部会 markSeen，
      // 之后再查 seenReplay 会把「当前这条新 notice」自己吞掉。无 id 的通知一律视为新。
      const id = noticeIdOf(notice)
      const fresh = id === undefined || !state.seenReplay.has(id)
      cacheNotice(notice)  // 基线 notices 也进 session 缓存，晋升 owner 后可回放（#8）
      const at = noticeSettledAtOf(notice)
      if (at !== undefined && at > state.noticeSince) state.noticeSince = at
      if (!fresh) continue
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
    // 这里只抬内存时钟、不写存储：带届的消息（signal / frame / state-reply / state-request）
    // 全部由持锁 owner 发出，它铸届时已在 asOwner 落盘；follower 再写一次就是跨标签
    // read-modify-write，低 tick 标签会把已落盘的高值覆盖回去（冷标签届回拨的根因）。
    if (data.epoch.tick > state.clock) state.clock = data.epoch.tick

    // 定向回包只认发给自己（原 #17）；state-reply 是唯一权威安装入口。
    // 旧届 reply 必须丢弃：跨发送者 BC 无全局序，迟到的旧 reply 会把 currentEpoch 打回旧届，
    // 新 owner 的帧随后被等届闸门全丢 → follower 永久脱节（#1 根因）。
    if (data.kind === 'state-reply') {
      if (data.to !== state.selfId || data.ready !== true) return
      const cmp = compareEpoch(data.epoch, state.currentEpoch)
      if (cmp < 0) {
        challengeLowEpoch(data.epoch)  // 晚重拉者拿到低届 reply 也要挑战，不能只挡开局 signal
        return
      }
      if (cmp === 0 && data.seq < state.seenSeq) return  // 同届 seq 不回退（#7）
      state.currentEpoch = data.epoch
      // seq 是每 lease 从 0 重计：真换届（cmp>0）必须把水位重置到 reply 的 seq，
      // 否则新 owner 的帧 seq=1..旧N 全被 <= 吞掉且缺口检测不触发（跨届 Math.max 是 bug）。
      // 同届（cmp=0）才用 max 防乱序回退。
      state.seenSeq = cmp > 0 ? data.seq : Math.max(state.seenSeq, data.seq)
      state.baselineReceived = true
      clearStateRetry()
      // reply 自带 owner 的回放水位：接收方据此推进，下次重拉只拿增量。
      if (data.noticeWatermark !== undefined && data.noticeWatermark > state.noticeSince) {
        state.noticeSince = data.noticeWatermark
      }
      applyBaseline(data.tasks ?? [], data.notices ?? [])
      return
    }
    if (data.to !== undefined && data.to !== state.selfId) return

    // state-request 不携带可信届（加入者 ZERO_EPOCH），必须在届闸门之前处理。
    if (data.kind === 'state-request') {
      const lease = state.lease
      if (lease !== undefined && !lease.ended && lease.ready) {
        // #6 根治：按接收方水位裁切回放，新标签（since=加入时刻）拿不到历史洪水。
        // 缓存本身保留全量（#8：切主后新 owner 仍有历史可回放），只裁「回包」不裁缓存。
        const since = data.noticeSince ?? 0
        const replay = state.noticeCache.filter((notice) => {
          const at = noticeSettledAtOf(notice)
          // `>=`：水位是效率提示、不是通知身份。同毫秒结算时严格 `>` 会漏掉后一条；
          // 多投一条无害——接收方按 notice id 永久去重。无时间戳的畸形通知同样保守放行。
          return at === undefined || at >= since
        })
        let watermark = since
        for (const notice of state.noticeCache) {
          const at = noticeSettledAtOf(notice)
          if (at !== undefined && at > watermark) watermark = at
        }
        send({
          kind: 'state-reply', to: data.from, ready: true,
          seq: lease.seq,                                // #7：带 owner 当前 seq
          tasks: options.getState(), notices: replay,
          noticeWatermark: watermark,
        })
      }
      return
    }

    // signal 降级为纯 hint（#1）：只触发重拉，绝不改 currentEpoch/seenSeq。
    if (data.kind === 'signal') {
      const cmp = compareEpoch(data.epoch, state.currentEpoch)
      if (cmp < 0) {
        // 低届 owner 存在：若本标签持有更高届，fencing 挑战让它让锁（跨 realm 唯一自愈路径）。
        if (state.currentEpoch.tick > 0 && state.lease === undefined) challengeLowEpoch(data.epoch)
        return
      }
      // 更高届的 claim：本标签若正在持锁，立即让锁给高届方（它会在 run loop 中重申请）。
      // 仍不改 currentEpoch/seenSeq——届安装只走 state-reply。
      if (data.what === 'claim') {
        if (cmp > 0 && state.lease !== undefined) endLease(state.lease)
        return
      }
      if (data.what === 'epoch' || data.what === 'cache' || data.what === 'dead') {
        state.baselineReceived = false
        requestState('signal')
      }
      return
    }

    // frame：只认当前届（Lamport 全序相等），旧届帧一律丢弃。
    const frameCmp = compareEpoch(data.epoch, state.currentEpoch)
    if (frameCmp < 0) {
      challengeLowEpoch(data.epoch)  // 低届 owner 持续扇帧时同样挑战，避免冻到寿命轮换
      return
    }
    if (frameCmp !== 0) return
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
      const at = noticeSettledAtOf(data.payload)
      if (at !== undefined && at > state.noticeSince) state.noticeSince = at
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
    // 注意：这里不能清零 permanentStreak——它是定时到点，不代表真源连通。
    // 服务端延迟鉴权时 600ms 后仍返 401，若在此清零，streak 永远到不了 2，有界失效。
    // 清零只在 onAlive（读到真实 SSE 字节）里做。
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
    const epoch = newEpoch(Math.max(state.clock, state.currentEpoch.tick, loadMaxTick(state.ns)), state.selfId)
    state.clock = epoch.tick
    // 自己铸的届也必须落盘：否则本标签关门后存储里只有更旧的 tick，冷标签仍会回拨。
    persistMaxTick(state.ns, epoch.tick)
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
        // 只有真源真的吐了字节才算凭证有效——延迟鉴权（600ms 后 401）不会误清零，
        // 连续 permanent 计数得以累加、冷却真正有界。
        state.permanentStreak = 0
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
        const at = noticeSettledAtOf(notice)
        if (at !== undefined && at > state.noticeSince) state.noticeSince = at
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
            if (reason.permanent) {
          state.permanentStreak += 1
          state.lastPermanentAt = monotonic()
        }
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

  /** 连续 permanent 失败后的冷却：防止凭证未就绪的 resume/在线唤醒刷出无界 401（专家评判 #5）。 */
  function resumeCoolingDown(): boolean {
    return state.permanentStreak >= 2 && monotonic() - state.lastPermanentAt < RESUME_COOLDOWN_MS
  }

  function recover(): void {
    if (state.disposed || state.controller.signal.aborted || state.offline) return
    if (!state.halted) {
      // 未停机时 awaken 只重置退避即可，不必打断在飞 sleep（保持原语义）。
      state.backoffMs = STATE_RETRY_MS
      return
    }
    if (resumeCoolingDown()) return
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

  const lifecycle = options.lifecycle
  const onHide = (): void => {
    const lease = state.lease
    if (lease !== undefined) endLease(lease)
  }
  // #7 根治：visibilitychange 隐藏时也触发；online / pageshow / resume 同样可能在后台发生。
  // 所有唤醒事件统一过可见性闸门，隐藏期间不清 401 halted、不打断退避——
  // 只挡 visibilitychange 是补丁，事件来源换了就漏。未注入 isVisible 的环境按可见处理。
  const onWake = (): void => {
    if (!(lifecycle?.isVisible?.() ?? true)) return
    recover()
  }

  if (lifecycle !== undefined) {
    const bound = (type: string, listener: (...args: never[]) => void): void => {
      lifecycle.addEventListener(type, listener)
      state.lifecycleBound.push({ type, listener })
    }
    bound('pagehide', onHide)
    bound('freeze', onHide)
    bound('pageshow', onWake)
    bound('resume', onWake)
    bound('visibilitychange', onWake)
    const autoOnline = lifecycle.autoRecoverOnOnline
    if (autoOnline === undefined || (typeof autoOnline === 'function' ? autoOnline() : autoOnline)) {
      bound('online', onWake)
    }
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
    if (resumeCoolingDown()) return  // 连续 401 未刷新凭证时冷却，杜绝无界轮转
    state.halted = false
    state.backoffMs = STATE_RETRY_MS
    state.wake.abort()
    state.wake = new AbortController()
  }
  return handle
}
