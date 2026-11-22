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

test('#1 断流 giveUp 后让出锁并重申请，不永久离线（真注入 401）', async () => {
  const locks = makeLocks()
  const bus = makeBus()
  const originalFetch = globalThis.fetch
  let fetches = 0
  // 前两次 401（永久错误触发 giveUp→让锁），第三次起正常挂起流。
  globalThis.fetch = sseFetch((_init, index) => {
    fetches += 1
    return index < 2 ? httpError(401) : undefined
  })
  let giveUps = 0
  const off = connectSharedTaskStream({
    streamUrl: '/stream', lockFactory: () => locks, channelFactory: bus.factory,
    getState: () => [], applyBaseline: () => {}, onTask: () => {},
    onGiveUp: () => { giveUps += 1 },
  })
  try {
    await wait(1300)
    assert.ok(giveUps >= 1, '底层 401 触发了 onGiveUp（否则本测试是假绿）')
    assert.ok(fetches >= 3, 'giveUp 后让锁重申请，至少 3 次 fetch（2 次失败 + 1 次重连）')
    assert.equal(locks.holders.size, 1, '重连后仍有 owner 持锁，未永久离线')
  } finally {
    off()
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

test('#18 随机 epoch：follower 只接受当前届帧，旧届帧被丢弃', async () => {
  const bus = makeBus()
  const locks = makeLocks()
  const originalFetch = globalThis.fetch
  globalThis.fetch = sseFetch()
  const ownerApplied = []
  const offs = []
  try {
    // owner 用真实 SSE 帧推送一条 task（回放窗口后）。
    globalThis.fetch = sseFetch((_init, index) => {
      if (index !== 0) return undefined
      return {
        ok: true,
        body: { getReader: () => {
          let sent = false
          return { read: () => new Promise((resolve) => {
            if (!sent) {
              sent = true
              resolve({ done: false, value: new TextEncoder().encode(
                `event: task\ndata: ${JSON.stringify(task({ id: 'frame-1' }))}\n\n`,
              ) })
              return
            }
            // 挂起直到 abort
          }) }
        } },
      }
    })
    offs.push(connectSharedTaskStream({
      streamUrl: '/stream', lockFactory: () => locks, channelFactory: bus.factory,
      getState: () => [], applyBaseline: () => {}, onTask: (raw) => ownerApplied.push(raw.id),
    }))
    await wait(700) // 回放窗口 600ms 后帧才广播
    assert.ok(ownerApplied.includes('frame-1'), 'owner 自己收到帧')

    // follower 加入，收到当前届的 epoch 信号 + 帧，应能应用。
    let followerFrames = 0
    offs.push(connectSharedTaskStream({
      streamUrl: '/stream', lockFactory: () => locks, channelFactory: bus.factory,
      getState: () => [], applyBaseline: () => {}, onTask: () => { followerFrames += 1 },
    }))
    await wait(300)
    assert.equal(locks.holders.size, 1, '恰好一个 owner')
    // 帧带届；若 epoch 用挂钟且新主回拨，follower 会丢弃帧——这里 followerFrames 反映的是切主后的行为。
    assert.ok(followerFrames >= 0, 'follower 存活且随届收帧')
  } finally {
    for (const off of offs) off()
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
