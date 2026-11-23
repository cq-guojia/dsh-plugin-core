// 消费方 27 条问题清单中「状态机 / 一致性」洞的回归测试。
// 全内存锁 / 内存总线 / 可控 fetch，无 DOM、无网络。
// fake 对齐浏览器语义：BroadcastChannel 异步派发且不回环、Web Locks 排他且 abort 释放、
// SSE 可注入「挂起流 / 立即断流 / HTTP 错误」——避免 fake 太宽松掩盖真 bug。
import test from 'node:test'
import assert from 'node:assert/strict'
import { connectSharedTaskStream } from '../dist/adv/tasks/shared-stream.js'
import { createTaskStore } from '../dist/adv/tasks/store.js'

const task = (over = {}) => ({
  id: `t-${Math.random().toString(36).slice(2)}`, project: 'p', group: 'g',
  title: { category: '任务', description: 'x' }, state: 'done', startedAt: 1, settledAt: 2, ...over,
})

/** 内存 Web Locks：同 name 排他；abort 或 callback resolve 即释放；FIFO 排队。 */
function makeLocks() {
  const holders = new Map()
  const queues = new Map()
  return {
    holders,
    request(name, options, callback) {
      return new Promise((resolve, reject) => {
        const dispatch = () => {
          if (holders.has(name)) return
          const next = (queues.get(name) ?? []).shift()
          if (next === undefined) return
          if (options.signal.aborted) { reject(new Error('aborted')); return }
          const held = Symbol(name)
          holders.set(name, held)
          // 真实 Lock 只有 name / mode，没有 signal；不捏 signal 兜住核心的错误接口假设。
          callback({ name, mode: 'exclusive' }).finally(() => {
            if (holders.get(name) === held) holders.delete(name)
            resolve()
            dispatch()
          })
        }
        const q = queues.get(name) ?? []
        q.push(dispatch)
        queues.set(name, q)
        options.signal.addEventListener('abort', () => {
          const i = q.indexOf(dispatch)
          if (i >= 0) q.splice(i, 1)
          reject(new Error('aborted'))
        }, { once: true })
        dispatch()
      })
    },
  }
}

/** 延迟拿锁：让实例先作为 follower 发出 state-request，测试才拿得到 selfId / ns。 */
function makeSlowLocks(locks, delayMs = 50) {
  return {
    request(name, options, cb) {
      return new Promise((resolve, reject) => {
        setTimeout(() => { locks.request(name, options, cb).then(resolve, reject) }, delayMs)
      })
    },
  }
}

/** 内存 BroadcastChannel：异步派发（queueMicrotask）、不回环给发送者。 */
function makeBus() {
  const channels = new Map()
  return {
    factory(name) {
      const peers = channels.get(name) ?? new Set()
      channels.set(name, peers)
      let handler = null
      const self = {
        postMessage(data) {
          for (const peer of peers) {
            if (peer !== self) queueMicrotask(() => peer.onmessage?.({ data }))
          }
        },
        set onmessage(fn) { handler = fn },
        get onmessage() { return handler },
        close() { peers.delete(self) },
      }
      peers.add(self)
      return self
    },
  }
}

/** 抓出站 wire 与通道名，并给测试一个同名的注入通道（模拟别的标签/旧届发来的消息）。 */
function spyChannel(bus) {
  let name
  let injector
  const sent = []
  const factory = (n) => {
    name = n
    const ch = bus.factory(n)
    const orig = ch.postMessage.bind(ch)
    ch.postMessage = (data) => { sent.push(data); orig(data) }
    return ch
  }
  return { factory, sent, inject: () => (injector ??= bus.factory(name)) }
}

/** 可控 fetch：hook(init, callIndex) 返回 null 表示挂起流，或返回自定义 Response。 */
function sseFetch(hook) {
  let call = 0
  return (_url, init) => {
    const index = call++
    const override = hook?.(init, index)
    if (override !== undefined) return Promise.resolve(override)
    return Promise.resolve({
      ok: true,
      body: { getReader: () => ({
        read: () => new Promise((resolve) => {
          if (init?.signal?.aborted) { resolve({ done: true }); return }
          init?.signal?.addEventListener('abort', () => resolve({ done: true }), { once: true })
        }),
      }) },
    })
  }
}

const httpError = (status) => ({ ok: false, status, body: undefined })

async function wait(ms) { await new Promise((r) => setTimeout(r, ms)) }

test('#2 permanent 401：让出锁 + 停重申请，resume 后恢复（真注入 401）', async () => {
  const locks = makeLocks()
  const bus = makeBus()
  const originalFetch = globalThis.fetch
  let fetches = 0
  // 第一次 401（永久错误 → halted），之后正常挂起流。
  globalThis.fetch = sseFetch((_init, index) => {
    fetches += 1
    return index === 0 ? httpError(401) : undefined
  })
  let giveUps = 0
  const handle = connectSharedTaskStream({
    streamUrl: '/stream', lockFactory: () => locks, channelFactory: bus.factory,
    getState: () => [], applyBaseline: () => {}, onTask: () => {},
    onGiveUp: () => { giveUps += 1 },
  })
  try {
    await wait(300)
    assert.ok(giveUps >= 1, '401 触发 onGiveUp（否则本测试是假绿）')
    const haltedFetches = fetches
    assert.equal(locks.holders.size, 0, '401 后让出锁，不持锁停机')
    await wait(600)
    assert.equal(fetches, haltedFetches, 'halted 期间不再重申请锁，杜绝 401 轮转')
    handle.resume()
    await wait(400)
    assert.ok(fetches > haltedFetches, 'resume 后重新申请锁')
    assert.equal(locks.holders.size, 1, '恢复后有 owner 持锁，不永久离线')
  } finally {
    handle()
    globalThis.fetch = originalFetch
  }
})

test('#12 dispose 成对移除监听 + 关闭通道 + 不再发帧', async () => {
  const added = []
  const removed = []
  const lifecycle = {
    addEventListener(type, listener) { added.push({ type, listener }) },
    removeEventListener(type, listener) { removed.push({ type, listener }) },
  }
  const locks = makeLocks()
  const bus = makeBus()
  const originalFetch = globalThis.fetch
  globalThis.fetch = sseFetch()
  let closed = false
  const channelFactory = (name) => {
    const ch = bus.factory(name)
    const origClose = ch.close.bind(ch)
    ch.close = () => { closed = true; origClose() }
    return ch
  }
  let off
  try {
    off = connectSharedTaskStream({
      streamUrl: '/stream', lockFactory: () => locks, channelFactory,
      lifecycle, getState: () => [], applyBaseline: () => {}, onTask: () => {},
    })
    await wait(30)
    off()
    off = undefined
    await wait(20) // 等微任务跑完 Promise.finally → fake lock 释放
    for (const type of ['pagehide', 'freeze', 'pageshow', 'resume', 'visibilitychange', 'online']) {
      assert.ok(added.some((x) => x.type === type), `挂了 ${type} 监听`)
    }
    assert.equal(removed.length, added.length, 'dispose 全部移除')
    for (let i = 0; i < added.length; i += 1) {
      assert.equal(removed[i].type, added[i].type)
      assert.equal(removed[i].listener, added[i].listener)
    }
    assert.equal(closed, true, 'dispose 关闭了 BroadcastChannel')
    assert.equal(locks.holders.size, 0, 'dispose 释放了锁，无残留 owner')
  } finally {
    off?.()
    globalThis.fetch = originalFetch
  }
})

test('#1/#7 Lamport 届：旧届 reply 丢弃、新届安装、同届 seq 不回退', async () => {
  const bus = makeBus()
  const locks = makeLocks()
  const originalFetch = globalThis.fetch
  globalThis.fetch = sseFetch()
  const { factory, sent, inject } = spyChannel(bus)
  const applied = []
  let offA
  let offB
  try {
    offA = connectSharedTaskStream({
      streamUrl: '/stream', lockFactory: () => locks, channelFactory: factory,
      getState: () => [], applyBaseline: () => {}, onTask: () => {},
    })
    await wait(700) // A ready，才回带届基线
    offB = connectSharedTaskStream({
      streamUrl: '/stream', lockFactory: () => locks, channelFactory: factory,
      getState: () => [], applyBaseline: (tasks) => applied.push(...tasks), onTask: () => {},
    })
    await wait(100)
    const req = sent.find((m) => m.kind === 'state-request')
    const fromA = sent.find((m) => m.kind === 'state-reply' && m.to === req?.from)
    assert.ok(req?.from && fromA?.epoch, 'B 发出 state-request 且 A 回了带届基线（否则假绿）')
    applied.length = 0

    const reply = (epoch, seq, tasks) => ({
      v: 2, ns: req.ns, kind: 'state-reply', epoch, seq,
      to: req.from, from: 'injector', ready: true, tasks, notices: [],
    })
    const newer = { tick: fromA.epoch.tick + 1, id: 'new-owner' }
    inject().postMessage(reply(newer, 5, [{ id: 'new' }]))
    await wait(50)
    assert.deepEqual(applied.map((t) => t.id), ['new'], '新届 reply 安装基线')

    inject().postMessage(reply(fromA.epoch, 9, [{ id: 'stale' }]))
    await wait(50)
    assert.ok(!applied.some((t) => t.id === 'stale'), '旧届 reply 被丢弃（原 #1）')

    inject().postMessage(reply(newer, 3, [{ id: 'rollback' }]))
    await wait(50)
    assert.ok(!applied.some((t) => t.id === 'rollback'), '同届 seq 回退被丢弃（原 #7）')
  } finally {
    offB?.()
    offA?.()
    globalThis.fetch = originalFetch
  }
})

test('onGiveUp 回调内同步重接能触发 resume，不停机睡满（复查 F3）', async () => {
  const bus = makeBus()
  const locks = makeLocks()
  const originalFetch = globalThis.fetch
  let fetches = 0
  globalThis.fetch = sseFetch((_init, index) => {
    fetches += 1
    return index === 0 ? httpError(401) : undefined
  })
  const shared = {}
  let off
  try {
    off = connectSharedTaskStream({
      streamUrl: '/stream', lockFactory: () => locks, channelFactory: bus.factory,
      onGiveUp: () => { shared.handle?.resume() },  // 消费方在回调里刷新凭证并同步重接
      getState: () => [], applyBaseline: () => {}, onTask: () => {},
    })
    shared.handle = off
    // 若 halted 在回调之后才置位，resume 的 !halted 守卫会吞掉重接 → 睡满 30s，500ms 内不会有新 fetch。
    // 修复后 halted 先置位，resume 立即唤醒，正常退避（STATE_RETRY_MS=300ms）后重建流。
    await wait(600)
    assert.ok(fetches >= 2, `回调内重接应在退避后立即恢复建流（实际 fetch ${fetches} 次）`)
  } finally {
    off?.()
    globalThis.fetch = originalFetch
  }
})

test('真换届 reply 重置 seenSeq，新 owner 的低序号帧不再被跨届水位吞（复查 F1）', async () => {
  const bus = makeBus()
  const locks = makeLocks()
  const originalFetch = globalThis.fetch
  globalThis.fetch = sseFetch()
  const { factory, sent, inject } = spyChannel(bus)
  const frames = []
  let offA
  let offB
  try {
    offA = connectSharedTaskStream({
      streamUrl: '/stream', lockFactory: () => locks, channelFactory: factory,
      getState: () => [], applyBaseline: () => {}, onTask: () => {},
    })
    await wait(700)
    offB = connectSharedTaskStream({
      streamUrl: '/stream', lockFactory: () => locks, channelFactory: factory,
      getState: () => [], applyBaseline: () => {}, onTask: (raw) => frames.push(raw.id),
    })
    await wait(100)
    const req = sent.find((m) => m.kind === 'state-request')
    const fromA = sent.find((m) => m.kind === 'state-reply' && m.to === req?.from)
    assert.ok(fromA?.epoch, 'A 回基线（否则假绿）')

    // 先把 follower 的水位抬到很高的旧届帧 seq=10（当前届 fromA）。
    for (let i = 1; i <= 10; i += 1) {
      inject().postMessage({
        v: 2, ns: req.ns, kind: 'frame', epoch: fromA.epoch, seq: i,
        event: 'task', payload: { id: `old-${i}` }, from: 'injector',
      })
    }
    await wait(30)
    // 新届 reply 带 seq=0（新 owner 刚开始）：应把水位重置到 0。
    const newer = { tick: fromA.epoch.tick + 1, id: 'new-owner' }
    inject().postMessage({
      v: 2, ns: req.ns, kind: 'state-reply', epoch: newer, seq: 0,
      to: req.from, from: 'injector', ready: true, tasks: [], notices: [],
    })
    await wait(30)
    // 新届 frame seq=1 必须收到；若仍用 Math.max(10,0)=10，此帧被吞（真 bug）。
    inject().postMessage({
      v: 2, ns: req.ns, kind: 'frame', epoch: newer, seq: 1,
      event: 'task', payload: { id: 'new-1' }, from: 'injector',
    })
    await wait(30)
    assert.ok(frames.includes('new-1'), '新 owner 的 seq=1 帧被接收（跨届水位已重置）')
  } finally {
    offB?.()
    offA?.()
    globalThis.fetch = originalFetch
  }
})

test('owner 断流让锁后重新任职，产出严格递增的届（复查 F2：clock 回写）', async () => {
  const bus = makeBus()
  const locks = makeLocks()
  const originalFetch = globalThis.fetch
  let fetches = 0
  // 前两次 500：底层 retryDelaysMs=[10] 只有一档，第二次仍失败即 giveUp → coordinator 让锁；
  // 第三次起正常挂起。这样才发生「让锁→重申请→第二次任职」。
  globalThis.fetch = sseFetch((_init, index) => {
    fetches += 1
    return index < 2 ? httpError(500) : undefined
  })
  const { factory, sent } = spyChannel(bus)
  let off
  try {
    off = connectSharedTaskStream({
      streamUrl: '/stream', lockFactory: () => locks, channelFactory: factory,
      retryDelaysMs: [10],
      getState: () => [], applyBaseline: () => {}, onTask: () => {},
    })
    // 第一次任职 → giveUp 让锁 → 退避重申请 → 第二次任职。owner 全程没收到任何带 tick 的
    // 他人消息（BC 不回环自己），若 asOwner 不回写 clock，两次都会算出 tick=1（真 bug）。
    await wait(900)
    const epochs = sent
      .filter((m) => m.kind === 'signal' && m.what === 'epoch')
      .map((m) => m.epoch.tick)
    assert.ok(fetches >= 2, '发生了断流后的重新建流（否则假绿）')
    assert.ok(epochs.length >= 2, `观察到至少两次任职广播（实际 ${epochs.length}）`)
    assert.ok(epochs[1] > epochs[0], `连续两届严格递增：${epochs[0]} → ${epochs[1]}`)
  } finally {
    off?.()
    globalThis.fetch = originalFetch
  }
})

test('#8 基线 notice 写入 session 缓存并随 reply 回放（跨 lease 不丢）', async () => {
  const bus = makeBus()
  const locks = makeLocks()
  const originalFetch = globalThis.fetch
  globalThis.fetch = sseFetch()
  const { factory, sent, inject } = spyChannel(bus)
  const ownerNotices = []
  let off
  try {
    // 异步拿锁：让实例在建 lease 前先发一次 state-request，测试由此拿到它的 selfId。
    const lockSlow = {
      request(name, options, cb) {
        return new Promise((resolve, reject) => {
          setTimeout(() => { locks.request(name, options, cb).then(resolve, reject) }, 50)
        })
      },
    }
    off = connectSharedTaskStream({
      streamUrl: '/stream', lockFactory: () => lockSlow, channelFactory: factory,
      getState: () => [], applyBaseline: () => {}, onTask: () => {},
      onNotice: (n) => ownerNotices.push(n),
    })
    await wait(800) // 建流 + 过回放窗口 ready
    const req = sent.find((m) => m.kind === 'state-request')
    const signal = sent.find((m) => m.kind === 'signal' && m.what === 'epoch')
    assert.ok(req?.from && signal?.epoch, '抓到 selfId 与 owner 届（否则假绿）')

    // 模拟该 owner 当 follower 时通过基线收到 notice（outbox 回放）。
    inject().postMessage({
      v: 2, ns: req.ns, kind: 'state-reply', epoch: signal.epoch, seq: 1,
      to: req.from, from: 'injector', ready: true, tasks: [],
      notices: [{ id: 'notice-cutover', task: { id: 't1' } }],
    })
    await wait(50)
    assert.ok(ownerNotices.some((n) => n.id === 'notice-cutover'), '基线 notice 已投递')

    // 新 follower 请求基线：owner 的 reply 必须带出缓存里的 notice。
    inject().postMessage({
      v: 2, ns: req.ns, epoch: signal.epoch, seq: 0,
      kind: 'state-request', from: 'fake-follower',
    })
    await wait(50)
    const reply = sent.find((m) => m.kind === 'state-reply' && m.to === 'fake-follower')
    assert.ok(reply?.notices?.some((n) => n.id === 'notice-cutover'),
      'reply 带出 session 缓存里的 notice（切主后仍在）')
  } finally {
    off?.()
    globalThis.fetch = originalFetch
  }
})

test('#24 服务端重跑终态能再次结算（announced 复位）', () => {
  const store = createTaskStore()
  const row = task({ id: 'r1', state: 'running', settledAt: undefined })
  store.merge([row])
  assert.equal(store.claimSettled(row), true, '首次终态结算')
  assert.equal(store.claimSettled(row), false, '重复结算被吞')
  store.merge([{ ...row, state: 'running', settledAt: undefined }])
  store.merge([{ ...row, state: 'done', settledAt: 99 }])
  assert.equal(store.claimSettled(row), true, '重跑终态能再次结算（原 #24）')
})

test('#4/#5 同业务键重跑：新 running 覆盖旧终态并重新开启结算', () => {
  const store = createTaskStore()
  const oldDone = task({ id: 'r-old', key: 'rerun', startedAt: 100, state: 'done', settledAt: 200 })
  store.merge([oldDone])
  assert.equal(store.claimSettled(oldDone), true, '首次终态结算')
  assert.equal(store.claimSettled(oldDone), false, '重复结算被吞')

  const rerun = task({ id: 'r-new', key: 'rerun', startedAt: 300, state: 'running', settledAt: undefined })
  store.merge([rerun])
  assert.equal(store.get('r-old').state, 'running', '同键新运行覆盖旧终态')
  store.mergeBaseline([oldDone])
  assert.equal(store.get('r-old').state, 'running', '旧终态基线不覆盖新 running（对称守卫）')

  const done = task({ id: 'r-new', key: 'rerun', startedAt: 300, state: 'done', settledAt: 400 })
  store.merge([done])
  assert.equal(store.get('r-old').state, 'done', '新运行的终态正常结算')
  assert.equal(store.claimSettled(done), true, '重跑后结算声明已复位，能再次分发')
})

test('断网期间同键重跑只见到新终态，结算声明按 startedAt 放行（复查 F2）', () => {
  const store = createTaskStore()
  const oldDone = task({ id: 'a', key: 'k', startedAt: 100, state: 'done', settledAt: 150 })
  store.merge([oldDone])
  assert.equal(store.claimSettled(oldDone), true, '旧运行结算一次')
  // 断网期间服务端完成重跑；重连只拿到新终态（没见到 startedAt=300 的 running 帧）。
  const newDone = task({ id: 'b', key: 'k', startedAt: 300, state: 'done', settledAt: 350 })
  assert.equal(store.claimSettled(newDone), true, '更大 startedAt 是新运行，放行新结算')
  assert.equal(store.claimSettled(oldDone), false, '旧运行重放仍被吞')
})

test('isStale 判定陈旧运行；乐观行归一后真源不被本地时钟挡（复查 F4）', () => {
  const store = createTaskStore()
  const newRunning = task({ id: 'srv', key: 'k', startedAt: 500, state: 'running', settledAt: undefined })
  store.merge([newRunning])
  const staleTerminal = task({ id: 'srv', key: 'k', startedAt: 100, state: 'done', settledAt: 200 })
  assert.equal(store.isStale(staleTerminal), true, '更早运行的终态判定为陈旧')

  // 乐观行归一到已有真源 id：本地 startedAt 大于服务端，真源帧必须能覆盖。
  const s2 = createTaskStore()
  s2.merge([task({ id: 'srv2', key: 'k2', startedAt: 100, state: 'running', settledAt: undefined })])
  s2.upsert(task({ id: 'submit:p\u0000k2', key: 'k2', startedAt: 9999, state: 'running', settledAt: undefined }))
  // 真源 running 带更小 startedAt 到达；归一到 srv2（非 submit 前缀），乐观标记应放行。
  s2.merge([task({ id: 'srv2', key: 'k2', startedAt: 100, state: 'running', settledAt: undefined })])
  assert.equal(s2.get('srv2').state, 'running', '真源帧已归一覆盖')
  const terminal = task({ id: 'srv2', key: 'k2', startedAt: 200, state: 'done', settledAt: 250 })
  assert.equal(s2.isStale(terminal), false, '新终态不算陈旧')
})

test('#4/#5 权威基线覆盖陈旧真源行；单调守卫挡旧 running 复活', () => {
  const store = createTaskStore()
  store.merge([task({ id: 'k1', state: 'running', settledAt: undefined })])
  store.mergeBaseline([task({ id: 'k1', state: 'done', settledAt: 10 })])
  assert.equal(store.get('k1').state, 'done', '基线覆盖本地陈旧 running')
  store.mergeBaseline([task({ id: 'k1', state: 'running', settledAt: undefined })])
  assert.equal(store.get('k1').state, 'done', '旧终态不被 running 基线复活')
})

test('#1r 本地乐观行不被旧终态基线吞，真源 running 到达后基线可覆盖', () => {
  const store = createTaskStore()
  const optimisticId = 'submit:p\u0000k2'
  // 本地先落乐观 running（id 带 submit: 前缀）。
  store.upsert(task({ id: optimisticId, key: 'k2', state: 'running', settledAt: undefined }))
  // 重连时旧终态基线到达：不得覆盖乐观行（否则真 running 被守卫吞，永久卡旧终态）。
  store.mergeBaseline([task({ id: 'srv-2', key: 'k2', state: 'done', settledAt: 5 })])
  assert.equal(store.get(optimisticId).state, 'running', '旧终态基线不覆盖未确认的乐观行')
  // 真源 running 帧到达：清乐观标记并归一覆盖。
  store.merge([task({ id: 'srv-2', key: 'k2', state: 'running', settledAt: undefined })])
  assert.equal(store.get(optimisticId).state, 'running', '真源 running 归一到本地行')
  // 此后真源终态可覆盖。
  store.mergeBaseline([task({ id: 'srv-2', key: 'k2', state: 'done', settledAt: 9 })])
  assert.equal(store.get(optimisticId).state, 'done', '真源确认后基线可覆盖')
  assert.equal(store.get(optimisticId).settledAt, 9)
})

test('乐观行回滚后乐观标记被清除，基线能带回该任务（复查 D4）', () => {
  const store = createTaskStore()
  const optimisticId = 'submit:p\u0000k3'
  store.upsert(task({ id: optimisticId, key: 'k3', state: 'running', settledAt: undefined }))
  assert.equal(store.removeRunning(optimisticId), true, '回滚乐观行')
  // 回滚后服务端其实受理了：基线带回该任务，不应被残留的乐观标记挡掉。
  store.mergeBaseline([task({ id: 'srv-3', key: 'k3', state: 'done', settledAt: 7 })])
  assert.equal(store.get('srv-3')?.state, 'done', '回滚后基线能恢复该行')
})

test('乐观行归一到已有服务端行后回滚，标记按 id 反查清除（复查 A 边界）', () => {
  const store = createTaskStore()
  // 已有同 key 的真源 running 行（不同 id）。
  store.merge([task({ id: 'srv-4', key: 'k4', state: 'running', settledAt: undefined })])
  // 本地再发起同 key：乐观 id 归一到 srv-4，但乐观标记按 submit: id 记录。
  const optimisticId = 'submit:p\u0000k4'
  store.upsert(task({ id: optimisticId, key: 'k4', state: 'running', settledAt: undefined }))
  // 提交失败回滚：按乐观 id 反查清标记（此时 tasks.get(optimisticId) 是 undefined）。
  store.removeRunning(optimisticId)
  store.mergeBaseline([task({ id: 'srv-4', key: 'k4', state: 'done', settledAt: 11 })])
  assert.equal(store.get('srv-4')?.state, 'done', '归一回滚后基线仍能覆盖真源行')
})

// ===== 消费方 v0.45.0 复查反馈的回归（9 条中 core 侧真问题的根因解验证）=====

test('#2 同 realm：冷标签继承持久化的最大 tick，存储清空不回拨内存真值（复查 P0）', async () => {
  // 注意：本例同进程共享模块级 fallback，只覆盖单 realm；跨 realm 场景见下一条 fencing 测试。
  const url = `/stream-cold-owner-${Math.random().toString(36).slice(2)}`
  const bus = makeBus()
  const locks = makeLocks()
  const slowLocks = makeSlowLocks(locks)
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.localStorage
  const stored = new Map()
  globalThis.fetch = sseFetch()
  globalThis.localStorage = {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => { stored.set(key, String(value)) },
    removeItem: (key) => { stored.delete(key) },
    clear: () => stored.clear(),
  }
  const { factory, sent } = spyChannel(bus)
  const connect = (channelFactory) => connectSharedTaskStream({
    streamUrl: url, lockFactory: () => slowLocks, channelFactory,
    getState: () => [], applyBaseline: () => {}, onTask: () => {},
  })
  let offSeed
  let offCold
  let offCleared
  try {
    // 种子实例只用来取 ns：真实系统里该 key 由前一个 owner 铸届时写入。
    offSeed = connect(factory)
    await wait(250)
    const req = sent.find((m) => m.kind === 'state-request')
    assert.ok(req?.ns, '假绿守卫：取到 ns')
    offSeed()
    offSeed = undefined
    await wait(50)

    // 前一个 owner 把最大 tick 5 落盘；冷标签必须继承后 +1，而不是从 0 铸出 1。
    stored.set(`dshpc:task-stream:maxtick:${req.ns}`, '5')
    const coldSent = []
    const coldFactory = (name) => {
      const ch = bus.factory(name)
      const orig = ch.postMessage.bind(ch)
      ch.postMessage = (data) => { coldSent.push(data); orig(data) }
      return ch
    }
    offCold = connect(coldFactory)
    await wait(250)
    const coldEpoch = coldSent.find((m) => m.kind === 'signal' && m.what === 'epoch')?.epoch
    assert.ok(coldEpoch, '冷标签广播了自己的届（否则假绿）')
    assert.equal(coldEpoch.tick, 6, `冷标签届继承存储最大值 +1，实际 ${coldEpoch.tick}`)

    // 用户清空站点数据：存储没了，但本进程内存里已见 6，第三个标签不能回拨。
    offCold()
    offCold = undefined
    stored.clear()
    await wait(50)
    const clearedSent = []
    const clearedFactory = (name) => {
      const ch = bus.factory(name)
      const orig = ch.postMessage.bind(ch)
      ch.postMessage = (data) => { clearedSent.push(data); orig(data) }
      return ch
    }
    offCleared = connect(clearedFactory)
    await wait(250)
    const clearedEpoch = clearedSent.find((m) => m.kind === 'signal' && m.what === 'epoch')?.epoch
    assert.ok(clearedEpoch, '存储清空后的新标签广播了自己的届（否则假绿）')
    assert.ok(clearedEpoch.tick > coldEpoch.tick,
      `存储清空后仍继承内存真值：${clearedEpoch.tick} > ${coldEpoch.tick}`)
  } finally {
    offCleared?.()
    offCold?.()
    offSeed?.()
    globalThis.fetch = originalFetch
    globalThis.localStorage = originalStorage
  }
})

test('#2 跨 realm：低届 owner 被高届 follower fencing 后让锁并重铸更高届（消费方 P0）', async () => {
  // 真跨 realm：带不同 query 的动态 import 得到两份模块实例，各自持有独立的 maxTickFallback。
  // 内存兜底不再共享，正是隐私模式 / 存储清空后每个浏览器标签的真实处境。
  const stamp = Math.random().toString(36).slice(2)
  const { connectSharedTaskStream: connectRealmB } = await import(
    `../dist/adv/tasks/shared-stream.js?fencing-realm=${stamp}`
  )
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.localStorage
  globalThis.fetch = sseFetch()
  globalThis.localStorage = undefined // 无存储：两 realm 的 fallback 各从 0 起
  const bus = makeBus()
  const locks = makeLocks()
  // A 用永不授予的锁管理器：保持在册 follower 态（消费方场景里 A 是刚让锁的老 owner）。
  const followerLocks = { request: () => new Promise(() => {}) }
  const opts = (factory, lockManager) => ({
    streamUrl: `/stream-fence-${stamp}`, lockFactory: () => lockManager, channelFactory: factory,
    getState: () => [], applyBaseline: () => {}, onTask: () => {},
  })
  let offA
  let offB
  try {
    // A（本模块 realm）：注入高届 reply，使它成为持有 {5,A} 的在册 follower。
    const spyA = spyChannel(bus)
    offA = connectSharedTaskStream(opts(spyA.factory, followerLocks))
    await wait(250)
    const reqA = spyA.sent.find((m) => m.kind === 'state-request')
    assert.ok(reqA?.from, '假绿守卫：A 发出基线请求')
    const high = { tick: 5, id: 'in-service-A' }
    spyA.inject().postMessage({
      v: 2, ns: reqA.ns, kind: 'state-reply', epoch: high, seq: 0,
      to: reqA.from, from: 'injector', ready: true, tasks: [], notices: [],
    })
    await wait(50)

    // B（另一 realm，空存储 / 空内存兜底）：抢锁后从 0 铸出 {1,B}——低于在册 A。
    const spyB = spyChannel(bus)
    offB = connectRealmB(opts(spyB.factory, locks))
    await wait(700)
    const bEpochs = spyB.sent.filter((m) => m.kind === 'signal' && m.what === 'epoch').map((m) => m.epoch)
    assert.ok(bEpochs.length >= 1 && bEpochs[0].tick === 1, `B 初始低届 1，实际 ${bEpochs[0]?.tick}`)

    // A 应以自己的高届广播 claim；B 收到后让锁，重铸出严格更高的届。
    const claims = spyA.sent.filter((m) => m.kind === 'signal' && m.what === 'claim')
    assert.ok(claims.some((m) => m.epoch.tick === high.tick), '高届 follower 广播了 fencing claim')
    await wait(700)
    const bFinal = spyB.sent.filter((m) => m.kind === 'signal' && m.what === 'epoch').map((m) => m.epoch)
    assert.ok(bFinal.some((e) => e.tick > high.tick),
      `低届 owner 让锁后重铸出 >${high.tick} 的届，实际 ${bFinal.map((e) => e.tick).join(',')}`)
  } finally {
    offB?.()
    offA?.()
    globalThis.fetch = originalFetch
    globalThis.localStorage = originalStorage
  }
})

test('#3 跨运行的新终态 settledAt 不被旧运行污染；同运行仍 first-wins', () => {
  const store = createTaskStore()
  const oldDone = task({ id: 'x', key: 'k', startedAt: 100, state: 'done', settledAt: 200 })
  store.merge([oldDone])
  assert.equal(store.get('x').settledAt, 200, '初次落库')
  // 同运行（startedAt 相同）的 notice 带不同 settledAt：保留先到的（既有不变量）。
  store.merge([task({ id: 'x', key: 'k', startedAt: 100, state: 'done', settledAt: 250 })])
  assert.equal(store.get('x').settledAt, 200, '同运行 first-wins 不被放宽')
  // 跨运行（startedAt 更大）只见到新终态：settledAt 必须取新值（消费方 #3）。
  store.merge([task({ id: 'x', key: 'k', startedAt: 300, state: 'done', settledAt: 400 })])
  assert.equal(store.get('x').startedAt, 300, '运行身份已更新')
  assert.equal(store.get('x').settledAt, 400, '跨运行 settledAt 取新值，不被旧 200 污染')
})

test('#6 基线回放按接收方水位裁切；晚加入者不拿历史，老 follower 只拿增量', async () => {
  const bus = makeBus()
  const locks = makeLocks()
  const slowLocks = makeSlowLocks(locks)
  const originalFetch = globalThis.fetch
  globalThis.fetch = sseFetch()
  const { factory, sent, inject } = spyChannel(bus)
  const noticeAt = (id, at) => ({ id, task: task({ id: `t-${id}`, state: 'done', startedAt: at, settledAt: at }) })
  const oldNotice = noticeAt('old', 999)
  const edgeNotice = noticeAt('edge', 1000) // 与水位同毫秒：严格 > 会漏，必须 >= 重放（id 去重兜底）
  const newNotice = noticeAt('new', 9999999999999)
  let off
  try {
    // owner 缓存两条：一条历史（settledAt=1000），一条未来（远超新标签加入时刻）。
    off = connectSharedTaskStream({
      streamUrl: `/stream-watermark-${Math.random().toString(36).slice(2)}`,
      lockFactory: () => slowLocks, channelFactory: factory,
      getState: () => [], applyBaseline: () => {}, onTask: () => {},
      onNotice: () => {},
    })
    await wait(700)
    const req = sent.find((m) => m.kind === 'state-request')
    const signal = sent.find((m) => m.kind === 'signal' && m.what === 'epoch')
    assert.ok(req && signal, '假绿守卫：owner 已发出 state-request 与 epoch 信号')
    inject().postMessage({
      v: 2, ns: req.ns, kind: 'state-reply', epoch: signal.epoch, seq: 1,
      to: req.from, from: 'injector', ready: true, tasks: [],
      notices: [oldNotice, edgeNotice, newNotice], noticeWatermark: 9999999999999,
    })
    await wait(50)

    // 新标签：since 默认 Date.now()，只应拿到 settledAt 远超现在的 newNotice。
    inject().postMessage({
      v: 2, ns: req.ns, epoch: signal.epoch, seq: 0, kind: 'state-request',
      from: 'fresh-tab', noticeSince: Date.now(),
    })
    await wait(50)
    const freshReply = sent.find((m) => m.kind === 'state-reply' && m.to === 'fresh-tab')
    assert.ok(freshReply, 'owner 回了基线（否则假绿）')
    assert.ok(!freshReply.notices.some((n) => n.id === 'old'), '新标签不拿历史 notice（#6）')
    assert.ok(!freshReply.notices.some((n) => n.id === 'edge'), '新标签不拿早于加入时刻的 notice')
    assert.ok(freshReply.notices.some((n) => n.id === 'new'), '新标签拿加入后的 notice')

    // 老 follower：since=1000，早于水位的 old 不拿；同毫秒 edge 必须重放（宁可多投，按 id 去重）。
    inject().postMessage({
      v: 2, ns: req.ns, epoch: signal.epoch, seq: 0, kind: 'state-request',
      from: 'old-follower', noticeSince: 1000,
    })
    await wait(50)
    const oldReply = sent.find((m) => m.kind === 'state-reply' && m.to === 'old-follower')
    assert.ok(oldReply.notices.some((n) => n.id === 'new'), '老 follower 拿断档增量')
    assert.ok(oldReply.notices.some((n) => n.id === 'edge'), '同毫秒通知不被水位吞掉')
    assert.ok(!oldReply.notices.some((n) => n.id === 'old'), '早于水位的历史不重拿')
  } finally {
    off?.()
    globalThis.fetch = originalFetch
  }
})

test('#9 基线重复投递同一 notice 只回调一次（去重发生在 cacheNotice 前）', async () => {
  const bus = makeBus()
  const locks = makeLocks()
  const slowLocks = makeSlowLocks(locks)
  const originalFetch = globalThis.fetch
  globalThis.fetch = sseFetch()
  const { factory, sent, inject } = spyChannel(bus)
  const once = []
  let off
  try {
    off = connectSharedTaskStream({
      streamUrl: `/stream-dedup-${Math.random().toString(36).slice(2)}`,
      lockFactory: () => slowLocks, channelFactory: factory,
      getState: () => [], applyBaseline: () => {}, onTask: () => {},
      onNotice: (n) => once.push(n.id),
    })
    await wait(700)
    const req = sent.find((m) => m.kind === 'state-request')
    const signal = sent.find((m) => m.kind === 'signal' && m.what === 'epoch')
    assert.ok(req && signal, '假绿守卫：owner 已发出 state-request 与 epoch 信号')
    const duplicate = {
      id: 'dup', task: task({ id: 't-dup', state: 'done', startedAt: 9999999999999, settledAt: 9999999999999 }),
    }
    for (let i = 0; i < 2; i += 1) {
      inject().postMessage({
        v: 2, ns: req.ns, kind: 'state-reply', epoch: signal.epoch, seq: 1,
        to: req.from, from: 'injector', ready: true, tasks: [], notices: [duplicate],
      })
    }
    await wait(50)
    assert.equal(once.filter((id) => id === 'dup').length, 1, '同一 notice 重复基线只回调一次（#9）')
  } finally {
    off?.()
    globalThis.fetch = originalFetch
  }
})

test('#7 visibilitychange 隐藏时不 recover；可见时才清 halted', async () => {
  const bus = makeBus()
  const locks = makeLocks()
  const originalFetch = globalThis.fetch
  let fetches = 0
  globalThis.fetch = sseFetch((_init, index) => {
    fetches += 1
    return index === 0 ? httpError(401) : undefined
  })
  let visible = false
  const listeners = new Map()
  const lifecycle = {
    addEventListener(type, fn) {
      const set = listeners.get(type) ?? new Set()
      set.add(fn)
      listeners.set(type, set)
    },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn) },
    isVisible: () => visible,
    fire(type) { for (const fn of listeners.get(type) ?? []) fn() },
  }
  let halted = false
  let off
  try {
    off = connectSharedTaskStream({
      streamUrl: `/stream-vis-${Math.random().toString(36).slice(2)}`,
      lockFactory: () => locks, channelFactory: bus.factory, lifecycle,
      getState: () => [], applyBaseline: () => {}, onTask: () => {},
      onGiveUp: (reason) => { if (reason.permanent) halted = true },
    })
    await wait(200)
    assert.equal(halted, true, '假绿守卫：401 已触发 permanent halted')
    const atHalt = fetches
    assert.ok(atHalt >= 1, '假绿守卫：至少发过一次 fetch')
    // 隐藏态的每一种唤醒事件都不得清 halted——只挡 visibilitychange 是补丁。
    visible = false
    for (const type of ['visibilitychange', 'online', 'pageshow', 'resume']) lifecycle.fire(type)
    await wait(400)
    assert.equal(fetches, atHalt, '隐藏态任何唤醒事件都不清 halted（无新 fetch）')
    // 可见时派发：recover 生效，重新建流。
    visible = true
    lifecycle.fire('visibilitychange')
    await wait(400)
    assert.ok(fetches > atHalt, '可见态 visibilitychange 触发 recover 重新建流')
  } finally {
    off?.()
    globalThis.fetch = originalFetch
  }
})

test('协议 v2 物理隔离：v1 帧被拒，锁与通道名均带 v2', async () => {
  const bus = makeBus()
  const locks = makeLocks()
  const slowLocks = makeSlowLocks(locks)
  const originalFetch = globalThis.fetch
  globalThis.fetch = sseFetch()
  const names = []
  const { factory, sent, inject } = spyChannel(bus)
  const channelFactory = (name) => { names.push(name); return factory(name) }
  const versionedLocks = {
    request(name, options, callback) { names.push(name); return slowLocks.request(name, options, callback) },
  }
  let applied = 0
  let tasks = 0
  let off
  try {
    off = connectSharedTaskStream({
      streamUrl: `/stream-v1-${Math.random().toString(36).slice(2)}`,
      lockFactory: () => versionedLocks, channelFactory,
      getState: () => [], applyBaseline: () => { applied += 1 }, onTask: () => { tasks += 1 },
    })
    await wait(250)
    const req = sent.find((m) => m.kind === 'state-request')
    const signal = sent.find((m) => m.kind === 'signal' && m.what === 'epoch')
    assert.ok(req && signal, '假绿守卫：owner 已接线')
    inject().postMessage({
      v: 1, ns: req.ns, kind: 'state-reply', epoch: { tick: 99, id: 'v1-owner' }, seq: 1,
      to: req.from, from: 'v1', ready: true, tasks: [task()], notices: [],
    })
    inject().postMessage({
      v: 1, ns: req.ns, kind: 'frame', epoch: signal.epoch, seq: 999,
      event: 'task', payload: task(), from: 'v1',
    })
    await wait(50)
    assert.equal(applied, 0, 'v1 reply 被 isWire 拒收')
    assert.equal(tasks, 0, 'v1 frame 被 isWire 拒收')
    assert.ok(names.length >= 2 && names.every((name) => name.includes('v2/')),
      '锁名与通道名都在 v2 命名空间')
  } finally {
    off?.()
    globalThis.fetch = originalFetch
  }
})

test('连续 permanent 401 后的 resume 有冷却；建流成功清零（专家评判 #5）', async () => {
  const bus = makeBus()
  const locks = makeLocks()
  const originalFetch = globalThis.fetch
  let fetches = 0
  globalThis.fetch = sseFetch((_init, index) => {
    fetches += 1
    return index < 2 ? httpError(401) : undefined
  })
  let off
  try {
    off = connectSharedTaskStream({
      streamUrl: `/stream-cooldown-${Math.random().toString(36).slice(2)}`,
      lockFactory: () => locks, channelFactory: bus.factory,
      getState: () => [], applyBaseline: () => {}, onTask: () => {},
    })
    await wait(400)
    assert.ok(fetches >= 1, '首次 401 已请求')
    off.resume() // 第一次恢复：streak=1，放通 → 第二次 401
    await wait(400)
    const afterTwo = fetches
    assert.ok(afterTwo >= 2, `两次 401 各请求一次（实际 ${afterTwo}）`)
    // 凭证未刷新就重复接线：连续两次 permanent 后冷却窗口内 resume 必须 no-op。
    off.resume()
    off.resume()
    await wait(200)
    assert.equal(fetches, afterTwo, '冷却期内 resume 不刷 401')
  } finally {
    off?.()
    globalThis.fetch = originalFetch
  }
})

test('autoRecoverOnOnline 后置改值即时生效：online 始终只绑一次，事件时读当前值（专家评判 A1）', async () => {
  const added = []
  const lifecycle = {
    addEventListener(type, listener) { added.push({ type, listener }) },
    removeEventListener(type) { added.splice(added.findIndex((x) => x.type === type), 1) },
    isVisible: () => true,
    autoRecoverOnOnline: false,
  }
  const locks = makeLocks()
  const originalFetch = globalThis.fetch
  let fetches = 0
  globalThis.fetch = sseFetch((_init, index) => {
    fetches += 1
    return index === 0 ? httpError(401) : undefined
  })
  let off
  try {
    off = connectSharedTaskStream({
      streamUrl: `/stream-online-live-${Math.random().toString(36).slice(2)}`,
      lockFactory: () => locks, channelFactory: makeBus().factory, lifecycle,
      getState: () => [], applyBaseline: () => {}, onTask: () => {},
    })
    const online = added.filter((x) => x.type === 'online')
    assert.equal(online.length, 1, 'online 监听始终绑定，不按初始值决定是否绑定')
    assert.ok(added.some((x) => x.type === 'visibilitychange'), '仍绑可见性事件')
    await wait(250)
    assert.ok(fetches >= 1, '假绿守卫：已发生建流尝试')
    const atHalt = fetches
    online[0].listener()
    await wait(120)
    assert.equal(fetches, atHalt, 'autoRecoverOnOnline=false 时 online 不唤醒停机')
    // 凭证就绪，消费方后置改值：同一监听器立即放行，不重绑、不掐在飞流。
    lifecycle.autoRecoverOnOnline = true
    online[0].listener()
    await wait(250)
    assert.ok(fetches > atHalt, '后置改 true 后同一监听器即时唤醒')
    assert.equal(added.filter((x) => x.type === 'online').length, 1, '改值不重绑监听器')
  } finally {
    off?.()
    globalThis.fetch = originalFetch
  }
})

test('fencing：晚重拉者收到低届 reply / frame 也挑战（第二轮残留 P1）', async () => {
  const bus = makeBus()
  const followerLocks = { request: () => new Promise(() => {}) }
  const originalFetch = globalThis.fetch
  globalThis.fetch = sseFetch()
  const { factory, sent, inject } = spyChannel(bus)
  let off
  try {
    off = connectSharedTaskStream({
      streamUrl: `/stream-fence-late-${Math.random().toString(36).slice(2)}`,
      lockFactory: () => followerLocks, channelFactory: factory,
      getState: () => [], applyBaseline: () => {}, onTask: () => {},
    })
    await wait(250)
    const req = sent.find((m) => m.kind === 'state-request')
    assert.ok(req?.from, '假绿守卫： follower 发出基线请求')

    // A 持有高届 5。低届 owner B（tick=1）已经 ready 并回包：A 晚重拉拿到低届 reply。
    inject().postMessage({
      v: 2, ns: req.ns, kind: 'state-reply', epoch: { tick: 5, id: 'in-service-A' }, seq: 0,
      to: req.from, from: 'injector', ready: true, tasks: [], notices: [],
    })
    await wait(50)
    inject().postMessage({
      v: 2, ns: req.ns, kind: 'state-reply', epoch: { tick: 1, id: 'low-B' }, seq: 0,
      to: req.from, from: 'low-B', ready: true, tasks: [], notices: [],
    })
    await wait(50)
    const claims = sent.filter((m) => m.kind === 'signal' && m.what === 'claim')
    assert.ok(claims.some((m) => m.epoch.tick === 5), '低届 state-reply 触发 fencing claim')

    // 同低届的 frame 走同一 challengeLowEpoch；换一个低届 id 绕过 5s 节流验证第二分支。
    inject().postMessage({
      v: 2, ns: req.ns, kind: 'frame', epoch: { tick: 1, id: 'low-C' }, seq: 1,
      event: 'task', payload: task(), from: 'low-C',
    })
    await wait(50)
    assert.ok(sent.filter((m) => m.kind === 'signal' && m.what === 'claim').length >= 2,
      '低届 frame 也触发 fencing claim')
  } finally {
    off?.()
    globalThis.fetch = originalFetch
  }
})

test('延迟鉴权（600ms 后 401）不误清零 streak，冷却仍生效（第二轮残留 P2）', async () => {
  const bus = makeBus()
  const locks = makeLocks()
  const originalFetch = globalThis.fetch
  let fetches = 0
  // 无字节流在 700ms 后才回 401：finishReplay 的 600ms 定时器已到点。
  globalThis.fetch = (_url, init) => {
    fetches += 1
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!init?.signal?.aborted) resolve(httpError(401))
      }, 700)
    })
  }
  let off
  try {
    off = connectSharedTaskStream({
      streamUrl: `/stream-slow-401-${Math.random().toString(36).slice(2)}`,
      lockFactory: () => locks, channelFactory: bus.factory,
      getState: () => [], applyBaseline: () => {}, onTask: () => {},
    })
    await wait(900)
    assert.ok(fetches >= 1, '首轮 401 已请求')
    off.resume() // streak=1 放通
    await wait(900)
    const afterTwo = fetches
    assert.ok(afterTwo >= 2, `二轮 401 已请求（实际 ${afterTwo}）`)
    off.resume() // streak=2 → 冷却 no-op
    await wait(200)
    assert.equal(fetches, afterTwo, '延迟 401 下冷却仍生效，无界轮转被堵住')
  } finally {
    off?.()
    globalThis.fetch = originalFetch
  }
})

test('真实 Lock 形状（只有 name/mode，无 signal）下 owner 正常建流（真机误接回归）', async () => {
  // 夹具若给 Lock 捏一个 signal，核心误读 lock.signal 时测试仍全绿、真机一拿锁就 TypeError。
  // 本用例锁定浏览器真实形状：Lock 只有 name / mode，取消信号在 request 的 options 上。
  const locks = makeLocks()
  const originalFetch = globalThis.fetch
  let fetches = 0
  globalThis.fetch = sseFetch(() => { fetches += 1; return undefined })
  let off
  try {
    off = connectSharedTaskStream({
      streamUrl: `/stream-real-lock-${Math.random().toString(36).slice(2)}`,
      lockFactory: () => locks, channelFactory: makeBus().factory,
      getState: () => [], applyBaseline: () => {}, onTask: () => {},
    })
    await wait(250)
    assert.ok(fetches >= 1, 'owner 建起 SSE：真实 Lock 无 signal，不再一拿锁就 TypeError')
    assert.equal(locks.holders.size, 1, 'owner 确实持锁，不是退避重申请')
  } finally {
    off?.()
    globalThis.fetch = originalFetch
  }
})
