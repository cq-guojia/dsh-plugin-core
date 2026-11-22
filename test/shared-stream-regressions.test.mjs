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
  title: 'x', state: 'done', startedAt: 1, settledAt: 2, ...over,
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
          const ac = new AbortController()
          holders.set(name, ac)
          const onAbort = () => ac.abort()
          options.signal.addEventListener('abort', onAbort, { once: true })
          callback({ signal: ac.signal }).finally(() => {
            options.signal.removeEventListener('abort', onAbort)
            if (holders.get(name) === ac) holders.delete(name)
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
  const off = connectSharedTaskStream({
    streamUrl: '/stream', lockFactory: () => locks, channelFactory,
    lifecycle, getState: () => [], applyBaseline: () => {}, onTask: () => {},
  })
  await wait(30)
  off()
  await wait(20) // 等微任务跑完 Promise.finally → fake lock 释放
  assert.equal(added.length, 6, '挂了 6 个生命周期监听')
  assert.equal(removed.length, added.length, 'dispose 全部移除')
  for (let i = 0; i < added.length; i += 1) {
    assert.equal(removed[i].type, added[i].type)
    assert.equal(removed[i].listener, added[i].listener)
  }
  assert.equal(closed, true, 'dispose 关闭了 BroadcastChannel')
  assert.equal(locks.holders.size, 0, 'dispose 释放了锁，无残留 owner')
  globalThis.fetch = originalFetch
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
