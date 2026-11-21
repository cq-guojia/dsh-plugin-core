// 跨标签单飞协调器的核心不变量（内存锁 / 内存总线，无 DOM、无网络）。
import test from 'node:test'
import assert from 'node:assert/strict'
import { connectSharedTaskStream } from '../dist/adv/tasks/shared-stream.js'
import { connectTaskStream } from '../dist/adv/tasks/stream.js'

const task = (over = {}) => ({
  id: `t-${Math.random().toString(36).slice(2)}`, project: 'p', group: 'g',
  title: 'x', state: 'done', startedAt: 1, settledAt: 2, ...over,
})

/** 内存 Web Locks：同 name 串行持锁，abort 或 callback resolve 即释放。 */
function makeLocks() {
  const holders = new Map()
  return {
    holders,
    request(name, options, callback) {
      return new Promise((resolve, reject) => {
        const run = () => {
          // 重入检查：多个等待者同时被唤醒时只有一个能拿到锁。
          if (holders.has(name) || options.signal.aborted) { reject(new Error('busy/aborted')); return }
          const ac = new AbortController()
          holders.set(name, ac)
          const onOuter = () => ac.abort()
          options.signal.addEventListener('abort', onOuter, { once: true })
          callback({ signal: ac.signal }).finally(() => {
            options.signal.removeEventListener('abort', onOuter)
            if (holders.get(name) === ac) holders.delete(name)
            resolve()
          })
        }
        const poll = setInterval(() => {
          if (!holders.has(name)) { clearInterval(poll); run() }
        }, 5)
        options.signal.addEventListener('abort', () => clearInterval(poll), { once: true })
      })
    },
  }
}

/** 内存 BroadcastChannel：同名互通，不回环给发送者（对齐浏览器语义）。 */
function makeBus() {
  const channels = new Map()
  return {
    factory(name) {
      const peers = channels.get(name) ?? new Set()
      channels.set(name, peers)
      let handler = null
      const self = {
        postMessage(data) {
          for (const peer of peers) if (peer !== self) peer.onmessage?.({ data })
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

test('裸 import re-export 入口不碰 DOM（Node 可直接加载）', async () => {
  const mod = await import('../dist/adv/tasks/index.js')
  assert.equal(typeof mod.connectSharedTaskStream, 'function')
})

test('N 个上下文只有 1 个 owner、1 条 SSE；owner 关闭后自动 failover', async () => {
  const locks = makeLocks()
  const bus = makeBus()
  let streams = 0
  const owners = []
  const tasks = []
  const baselines = []
  const notices = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = (_url, init) => {
    streams += 1
    const ownerIndex = owners.length
    owners.push(ownerIndex)
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
  const members = []
  try {
    for (let i = 0; i < 3; i += 1) {
      members.push(connectSharedTaskStream({
        streamUrl: '/stream', lockFactory: () => locks, channelFactory: bus.factory,
        getState: () => tasks, applyBaseline: (rows) => baselines.push(...rows),
        onTask: (raw) => tasks.push(raw), onNotice: (n) => notices.push(n),
      }))
    }
    await new Promise((r) => setTimeout(r, 700))
    assert.equal(streams, 1, '3 个标签只建 1 条 SSE')
    members[0]() // owner 关闭
    await new Promise((r) => setTimeout(r, 200))
    assert.equal(streams, 2, 'owner 关闭后恰好一个等待者接管')
  } finally {
    for (const off of members) off()
    globalThis.fetch = originalFetch
  }
})

test('晚加入标签拿到全量基线 + notice 缓存（含 outbox 回放批次）', async () => {
  const locks = makeLocks()
  const bus = makeBus()
  const baselineTasks = [task({ id: 'baseline-1' })]
  const replayNotice = { id: 'notice-replay', task: baselineTasks[0] }
  const originalFetch = globalThis.fetch
  globalThis.fetch = (_url, init) => Promise.resolve({
    ok: true,
    body: { getReader: () => {
      let sent = false
      return { read: () => new Promise((resolve) => {
        if (init?.signal?.aborted) { resolve({ done: true }); return }
        if (!sent) {
          sent = true
          // 模拟服务端 outbox 回放批次：event: task-notice + data: notice。
          resolve({
            done: false,
            value: new TextEncoder().encode(
              `event: task-notice\ndata: ${JSON.stringify(replayNotice)}\n\n`,
            ),
          })
          return
        }
        init.signal.addEventListener('abort', () => resolve({ done: true }), { once: true })
      }) }
    } },
  })
  const owner = connectSharedTaskStream({
    streamUrl: '/stream', lockFactory: () => locks, channelFactory: bus.factory,
    getState: () => baselineTasks, applyBaseline: () => {},
    onTask: () => {}, onNotice: () => {},
  })
  try {
    await new Promise((r) => setTimeout(r, 700))
    const followerNotices = []
    const followerTasks = []
    const off = connectSharedTaskStream({
      streamUrl: '/stream', lockFactory: () => locks, channelFactory: bus.factory,
      getState: () => [], applyBaseline: (rows) => followerTasks.push(...rows),
      onTask: () => {}, onNotice: (n) => followerNotices.push(n),
    })
    await new Promise((r) => setTimeout(r, 200))
    assert.ok(followerTasks.some((t) => t.id === 'baseline-1'), 'follower 收到 owner 全量基线')
    assert.ok(followerNotices.some((n) => n.id === 'notice-replay'), 'follower 收到 outbox 回放批次的 notice')
    off()
  } finally {
    owner()
    globalThis.fetch = originalFetch
  }
})

test('SSE 保活注释帧触发 onAlive（单标签 owner 判活的根因回归）', async () => {
  let alive = 0
  const conn = connectTaskStream({
    streamUrl: '/stream',
    onAlive: () => { alive += 1 },
    fetchImpl: () => Promise.resolve({
      ok: true,
      body: { getReader: () => {
        let sent = false
        return { read: () => new Promise((resolve) => {
          if (sent) return
          sent = true
          resolve({ done: false, value: new TextEncoder().encode(': keep-alive\n\n') })
        }) }
      } },
    }),
  })
  await new Promise((r) => setTimeout(r, 30))
  conn.close()
  assert.equal(alive, 1, '保活注释帧（无 data:）必须上抛 onAlive，否则单标签 owner 50s 被误杀')
})

test('无 Web Locks 不开 SSE（宁可离线也不退回 N 连接）', async () => {
  const bus = makeBus()
  let streams = 0
  const originalFetch = globalThis.fetch
  globalThis.fetch = () => { streams += 1; throw new Error('should not fetch') }
  const warnings = []
  const originalWarn = console.warn
  console.warn = (...a) => warnings.push(a.join(' '))
  const off = connectSharedTaskStream({
    streamUrl: '/stream', lockFactory: () => null, channelFactory: bus.factory,
    getState: () => [], applyBaseline: () => {}, onTask: () => {},
  })
  await new Promise((r) => setTimeout(r, 20))
  try {
    assert.equal(streams, 0, '无锁时零 SSE')
    assert.ok(warnings.some((w) => w.includes('Web Locks unavailable')))
  } finally {
    off()
    globalThis.fetch = originalFetch
    console.warn = originalWarn
  }
})
