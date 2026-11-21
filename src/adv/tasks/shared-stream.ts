/**
 * 同源跨标签 task SSE 单飞协调器。
 *
 * N 个标签各开一条常驻 SSE 会耗尽 http/1.1 每域 6 连接上限，宿主自己的请求全在浏览器排队。
 * 这里让同源所有标签共用一条：Web Locks 选一个 owner 建真 SSE，帧经 BroadcastChannel
 * 扇出给其它标签；owner 关闭 / 崩溃 / 失联后锁释放，等待者自动成为新 owner。
 *
 * 设计不变量：
 *   - 零 DOM at import time：navigator / BroadcastChannel 只在函数内惰性读取，Node 可直接 import。
 *   - 锁名 / 通道名只含协议版本 + streamUrl 命名空间（**不含 headers**，token 刷新不得击穿单飞）。
 *   - 帧带 epoch + 单调 seq：切主后的迟到旧帧丢弃；seq 缺口触发全量基线重拉。
 *   - 基线补齐靠 state-request/state-reply；owner 未 ready 时回 ready=false，绝不把空基线当权威。
 *   - notice 有界缓存含 outbox 回放批次，随 state-reply 补齐；回放批次不逐条广播，只发一次轻量信号。
 *   - 生命周期：AbortSignal + pagehide/freeze/onGiveUp/断流立即释放锁；pageshow(persisted) 重建 session。
 */
import { connectTaskStream, type TaskStreamConnection, type TaskStreamGiveUpReason } from './stream.js'

const WIRE_VERSION = 1
const LOCK_PREFIX = 'dshpc/task-stream/v1/'
const CHANNEL_PREFIX = 'dshpc/task-stream/v1/'
const WATCHDOG_MS = 50_000          // > 2 × SSE keepAlive(25s)，避免把保活当失联
const LIFETIME_MS = 10 * 60 * 1000  // 连接寿命上限，到期主动释放重选
const NOTICE_LIMIT = 512            // 与 api.ts 的 SEEN_NOTICE_LIMIT 对齐
const STATE_RETRY_MS = 300
const REPLAY_WINDOW_MS = 600        // 建连后的回放窗口：窗口内 notice 只入缓存不广播

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
  /** 注入点：测试用内存锁 / 通道；不传则惰性取 navigator.locks / BroadcastChannel。 */
  readonly lockFactory?: SharedLockFactory
  readonly channelFactory?: SharedChannelFactory
  /** owner 的全量任务快照来源（取 taskStore.getSnapshot().tasks）。 */
  readonly getState: () => readonly unknown[]
  /** follower 收到基线后应用（mergeBaseline：只填本地不存在的 key）。 */
  readonly applyBaseline: (tasks: readonly unknown[]) => void
  /** 页面生命周期监听的宿主；不传则不挂（Node / 测试）。 */
  readonly lifecycle?: SharedLifecycle
}

export interface SharedLifecycle {
  addEventListener(type: string, listener: (...args: never[]) => void): void
  removeEventListener(type: string, listener: (...args: never[]) => void): void
}

type WireKind = 'frame' | 'state-request' | 'state-reply' | 'signal'
interface Wire {
  readonly v: number
  readonly ns: string
  readonly kind: WireKind
  readonly epoch: number
  readonly seq: number
  readonly event?: 'task' | 'notice'
  readonly snapshot?: boolean
  readonly payload?: unknown
  readonly from?: string
  readonly to?: string
  readonly ready?: boolean
  readonly tasks?: readonly unknown[]
  readonly notices?: readonly unknown[]
  readonly what?: 'epoch' | 'cache' | 'dead'
}

function isWire(value: unknown): value is Wire {
  if (value === null || typeof value !== 'object') return false
  const w = value as Record<string, unknown>
  return w.v === WIRE_VERSION && typeof w.ns === 'string' && typeof w.kind === 'string' &&
    typeof w.epoch === 'number' && typeof w.seq === 'number'
}

function noticeIdOf(value: unknown): string | undefined {
  if (value === null || typeof value !== 'object') return undefined
  const id = (value as { id?: unknown }).id
  return typeof id === 'string' ? id : undefined
}

function stableHash(input: string): string {
  // FNV-1a 32bit：稳定、无依赖、同串同值；只用于命名，不用于安全。
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

/**
 * 加入同源单飞。返回 disposer：只释放本标签持有的引用，不替别的标签关流。
 * `connectTaskCenter` 负责按 streamUrl 幂等 + refcount，这里每个实例就是一条引用。
 */
export function connectSharedTaskStream(options: SharedStreamOptions): () => void {
  const ns = `${WIRE_VERSION}:${stableHash(options.streamUrl)}`
  const lockName = `${LOCK_PREFIX}${ns}`
  const channelName = `${CHANNEL_PREFIX}${ns}`
  const selfId = `peer:${Math.random().toString(36).slice(2)}`
  let channel: SharedChannelLike | null = null
  let disposed = false
  /** 跨标签见过最大 epoch：本机挂钟落后/回拨时也不发出比前任更小的 epoch。 */
  let peerEpoch = 0

  // 一次 session = 一次申请锁的生命周期。bfcache 恢复要整体重建（AbortSignal 一次性）。
  interface Session {
    controller: AbortController
    epoch: number
    seq: number
    ready: boolean
    owner: boolean
    lastAliveAt: number
    baselineRequestAt: number
    noticeCache: unknown[]
    seenReplay: Set<string>
    streamConn: TaskStreamConnection | undefined
    /** 本次持锁的独立信号：轮换 owner 只 abort 它，绝不 abort 整个 session。 */
    hold: AbortController | undefined
    /** 无 Web Locks：离线，不重发 state-request（否则每 1.2s 空转）。 */
    offline: boolean
    stateRetry: ReturnType<typeof setTimeout> | undefined
    watchdog: ReturnType<typeof setInterval> | undefined
    lifetime: ReturnType<typeof setTimeout> | undefined
    replayGrace: ReturnType<typeof setTimeout> | undefined
  }
  let session: Session | undefined

  function openChannel(): SharedChannelLike | null {
    if (channel !== null) return channel
    const factory = options.channelFactory ?? (() => {
      if (typeof BroadcastChannel === 'undefined') return null
      try {
        const raw = new BroadcastChannel(channelName)
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
    channel = factory(channelName)
    if (channel !== null) channel.onmessage = (event) => receive(event.data)
    return channel
  }

  function send(
    state: Session,
    wire: Omit<Wire, 'v' | 'ns' | 'epoch' | 'seq'> & Partial<Pick<Wire, 'epoch' | 'seq'>>,
  ): void {
    if (disposed || state.controller.signal.aborted) return
    const full: Wire = {
      v: WIRE_VERSION, ns, epoch: wire.epoch ?? state.epoch, seq: wire.seq ?? state.seq,
      kind: wire.kind,
      ...(wire.event === undefined ? {} : { event: wire.event }),
      ...(wire.snapshot === undefined ? {} : { snapshot: wire.snapshot }),
      ...(wire.payload === undefined ? {} : { payload: wire.payload }),
      ...(wire.from === undefined ? {} : { from: wire.from }),
      ...(wire.to === undefined ? {} : { to: wire.to }),
      ...(wire.ready === undefined ? {} : { ready: wire.ready }),
      ...(wire.tasks === undefined ? {} : { tasks: wire.tasks }),
      ...(wire.notices === undefined ? {} : { notices: wire.notices }),
      ...(wire.what === undefined ? {} : { what: wire.what }),
    }
    try { openChannel()?.postMessage(full) } catch (error) {
      console.error('dsh-plugin-core: shared task stream post failed', error)
    }
  }

  function requestState(state: Session, reason: 'join' | 'gap' | 'signal'): void {
    if (disposed || state.controller.signal.aborted || state.offline) return
    const now = Date.now()
    if (reason !== 'join' && now - state.baselineRequestAt < STATE_RETRY_MS) return
    state.baselineRequestAt = now
    send(state, { kind: 'state-request', from: selfId })
    if (state.stateRetry !== undefined) clearTimeout(state.stateRetry)
    state.stateRetry = setTimeout(() => {
      if (!state.ready && !disposed && !state.controller.signal.aborted) requestState(state, 'join')
    }, STATE_RETRY_MS * 4)
  }

  function applyBaseline(state: Session, tasks: readonly unknown[], notices: readonly unknown[]): void {
    try { options.applyBaseline(tasks) } catch (error) {
      console.error('dsh-plugin-core: shared task baseline failed', error)
    }
    for (const notice of notices) {
      const id = noticeIdOf(notice)
      if (id !== undefined) {
        if (state.seenReplay.has(id)) continue
        state.seenReplay.add(id)
      }
      try { options.onNotice?.(notice) } catch (error) {
        console.error('dsh-plugin-core: shared task notice replay failed', error)
      }
    }
  }

  function receive(data: unknown): void {
    const state = session
    if (disposed || state === undefined || state.offline || state.controller.signal.aborted) return
    if (!isWire(data) || data.ns !== ns) return
    if (data.from === selfId || data.to === selfId) {
      if (data.kind === 'state-reply' && data.to === selfId && data.ready === true) {
        state.ready = true
        if (state.stateRetry !== undefined) { clearTimeout(state.stateRetry); state.stateRetry = undefined }
        applyBaseline(state, data.tasks ?? [], data.notices ?? [])
      }
      return
    }
    state.lastAliveAt = Date.now()

    // state-request 不带 owner epoch（新加入者 epoch=0），必须在 epoch 闸门之前处理，
    // 否则晚加入标签的请求会被当「切主后的迟到旧帧」丢掉，永远拿不到基线。
    if (data.kind === 'state-request') {
      if (state.owner && state.ready) {
        send(state, {
          kind: 'state-reply', to: data.from, ready: true,
          tasks: options.getState(), notices: [...state.noticeCache],
        })
      }
      return
    }

    if (data.epoch > peerEpoch) peerEpoch = data.epoch
    if (data.epoch > state.epoch) {
      state.epoch = data.epoch
      state.seq = 0
      state.ready = false
      state.seenReplay.clear()
      state.noticeCache = []
    } else if (data.epoch < state.epoch) {
      return // 切主后的迟到旧帧
    }
    if (data.kind === 'frame' && data.seq <= state.seq) return

    if (data.kind === 'frame') {
      if (data.seq > state.seq + 1) requestState(state, 'gap')
      state.seq = data.seq
      if (data.event === 'task') {
        try { options.onTask(data.payload, data.snapshot === true) } catch (error) {
          console.error('dsh-plugin-core: shared task frame failed', error)
        }
      } else if (data.event === 'notice') {
        try { options.onNotice?.(data.payload) } catch (error) {
          console.error('dsh-plugin-core: shared notice frame failed', error)
        }
      }
    } else if (data.kind === 'signal') {
      if (data.what === 'dead') state.ready = false
      else requestState(state, 'signal') // 切主 / 回放完成：重拉基线
    }
  }

  function cacheNotice(state: Session, notice: unknown): void {
    const id = noticeIdOf(notice)
    if (id !== undefined && state.seenReplay.has(id)) return
    if (id !== undefined) state.seenReplay.add(id)
    state.noticeCache.push(notice)
    if (state.noticeCache.length > NOTICE_LIMIT) state.noticeCache.shift()
  }

  function asOwner(state: Session, lock: SharedLockLike): Promise<void> {
    // 逻辑时钟：同 ms 交接 / 挂钟回拨都不得让新 owner 的 epoch 不大于上一届。
    state.hold = new AbortController()
    state.owner = true
    state.epoch = Math.max(Date.now(), state.epoch + 1, peerEpoch + 1)
    peerEpoch = state.epoch
    state.seq = 0
    state.ready = false
    state.seenReplay.clear()
    state.noticeCache = []
    state.lastAliveAt = Date.now()
    send(state, { kind: 'signal', what: 'epoch' })

    // 回放窗口内 notice 只入缓存 + 本地投影；窗口结束发一次轻量信号让 follower 自拉。
    let replayDone = false
    const finishReplay = (): void => {
      if (replayDone) return
      replayDone = true
      state.ready = true
      send(state, { kind: 'signal', what: 'cache' })
    }

    state.streamConn = connectTaskStream({
      streamUrl: options.streamUrl,
      headers: options.headers,
      retryDelaysMs: options.retryDelaysMs,
      // SSE 保活是 `:` 注释帧，parseTaskFrames 不上抛；单独判活，避免单标签 owner 被看门狗误杀。
      onAlive: () => { state.lastAliveAt = Date.now() },
      onTask: (task, snapshot) => {
        try { options.onTask(task, snapshot) } catch (error) {
          console.error('dsh-plugin-core: shared owner task failed', error)
        }
        if (!snapshot && !replayDone) finishReplay() // 真增量到达 = 回放窗口结束
        if (!snapshot && state.ready) {
          state.seq += 1
          send(state, { kind: 'frame', event: 'task', payload: task })
        }
      },
      onNotice: (notice) => {
        cacheNotice(state, notice)
        try { options.onNotice?.(notice) } catch (error) {
          console.error('dsh-plugin-core: shared owner notice failed', error)
        }
        if (!replayDone) return // outbox 回放批次不逐条广播，靠 state-reply 补齐
        state.seq += 1
        send(state, { kind: 'frame', event: 'notice', payload: notice })
      },
      onGiveUp: (reason) => {
        if (options.onGiveUp !== undefined) {
          try { options.onGiveUp(reason) } catch (error) {
            console.error('dsh-plugin-core: shared task onGiveUp failed', error)
          }
        } else {
          console.warn('dsh-plugin-core: task stream gave up', reason)
        }
        send(state, { kind: 'signal', what: 'dead' })
        state.controller.abort()
      },
    })

    state.replayGrace = setTimeout(finishReplay, REPLAY_WINDOW_MS)
    const hold = state.hold
    state.lifetime = setTimeout(() => {
      console.warn('dsh-plugin-core: task stream lifetime reached, rotating leadership')
      hold.abort() // 只释放本次持锁；session 仍活着，run() 会重新申请
    }, LIFETIME_MS)
    state.watchdog = setInterval(() => {
      if (disposed || state.controller.signal.aborted) return
      if (Date.now() - state.lastAliveAt < WATCHDOG_MS) return
      state.lastAliveAt = Date.now()
      // owner：保活/帧 50s 没动静视为流已死，释放锁重选；follower 只重拉，绝不抢锁。
      // 只 abort hold —— 之前误 abort session controller 会让单标签永久离线。
      if (state.owner) {
        console.warn('dsh-plugin-core: task stream looks stale, rotating leadership')
        hold.abort()
      } else {
        requestState(state, 'signal')
      }
    }, WATCHDOG_MS / 2)

    return new Promise<void>((resolve) => {
      const done = (): void => { resolve() }
      lock.signal.addEventListener('abort', done, { once: true })
      hold.signal.addEventListener('abort', done, { once: true })
      state.controller.signal.addEventListener('abort', done, { once: true })
    }).finally(() => {
      state.owner = false
      state.hold = undefined
      if (state.watchdog !== undefined) clearInterval(state.watchdog)
      if (state.lifetime !== undefined) clearTimeout(state.lifetime)
      if (state.replayGrace !== undefined) clearTimeout(state.replayGrace)
      state.streamConn?.close()
      state.streamConn = undefined
    })
  }

  async function run(state: Session): Promise<void> {
    const lockFactory = options.lockFactory ?? (() => {
      const nav = typeof navigator === 'undefined' ? undefined : navigator
      const locks = nav?.locks
      return locks === undefined ? null : locks as unknown as SharedLockManager
    })
    const locks = lockFactory()
    if (locks === null) {
      // 浏览器无 Web Locks：不静默退回每标签各开一条。显式告警，submit 仍走短 POST。
      console.warn('dsh-plugin-core: Web Locks unavailable; task stream stays offline to avoid connection exhaustion')
      state.offline = true // 停掉 state-request 重试，避免每 1.2s 空转
      return
    }
    while (!disposed && !state.controller.signal.aborted) {
      try {
        await locks.request(lockName, { signal: state.controller.signal }, (lock) => asOwner(state, lock))
      } catch (error) {
        if (!disposed && !state.controller.signal.aborted) {
          console.error('dsh-plugin-core: shared task lock failed', error)
        }
      }
      if (disposed || state.controller.signal.aborted) return
      await sleep(STATE_RETRY_MS, state.controller.signal)
    }
  }

  function stop(state: Session): void {
    state.controller.abort()
    state.hold?.abort()
    if (state.stateRetry !== undefined) clearTimeout(state.stateRetry)
    if (state.watchdog !== undefined) clearInterval(state.watchdog)
    if (state.lifetime !== undefined) clearTimeout(state.lifetime)
    if (state.replayGrace !== undefined) clearTimeout(state.replayGrace)
    state.streamConn?.close()
    state.streamConn = undefined
  }

  function start(): void {
    if (disposed) return
    const state: Session = {
      controller: new AbortController(),
      epoch: 0, seq: 0, ready: false, owner: false,
      lastAliveAt: Date.now(), baselineRequestAt: 0,
      noticeCache: [], seenReplay: new Set<string>(), streamConn: undefined,
      hold: undefined, offline: false,
      stateRetry: undefined, watchdog: undefined, lifetime: undefined, replayGrace: undefined,
    }
    session = state
    openChannel()
    void run(state).then(() => {
      // 无锁离线：run() 已置 offline；这里确保不再重试（不重启 session）。
      if (state.offline && state.stateRetry !== undefined) {
        clearTimeout(state.stateRetry)
        state.stateRetry = undefined
      }
    })
    requestState(state, 'join')
  }

  const pageHide = (): void => { if (session !== undefined) stop(session) }
  const pageShow = (event: { persisted?: boolean }): void => {
    if (event.persisted !== true || disposed) return
    // AbortSignal 一次性：必须新建 session（新 controller），复用旧的会永久拿不到锁。
    if (session !== undefined) stop(session)
    start()
  }
  if (options.lifecycle !== undefined) {
    options.lifecycle.addEventListener('pagehide', pageHide as (...a: never[]) => void)
    options.lifecycle.addEventListener('freeze', pageHide as (...a: never[]) => void)
    options.lifecycle.addEventListener('pageshow', pageShow as (...a: never[]) => void)
  }

  start()

  return () => {
    if (disposed) return
    disposed = true
    if (session !== undefined) stop(session)
    if (options.lifecycle !== undefined) {
      options.lifecycle.removeEventListener('pagehide', pageHide as (...a: never[]) => void)
      options.lifecycle.removeEventListener('freeze', pageHide as (...a: never[]) => void)
      options.lifecycle.removeEventListener('pageshow', pageShow as (...a: never[]) => void)
    }
    channel?.close()
    channel = null
  }
}
