/**
 * 端到端：服务端 notice → SSE → 客户端解析 → coordinator → toast。
 * 用户 2026-11-19 报「成功通知完全不弹」，此前只有孤立单元测试，没有覆盖这条完整链路。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { connectTaskStream } from '../dist/adv/tasks/stream.js'
import { serveTaskStream } from '../dist/host/index.js'
import { createCoordinator } from '../dist/adv/tasks/coordinator.js'
import { createTaskStore } from '../dist/adv/tasks/store.js'

function terminal(id) {
  return {
    id, project: 'p', group: 'g', title: 't', state: 'done', startedAt: 1, settledAt: 2,
    toast: { success: { title: `完成 ${id}` } },
    notify: { success: { message: `done ${id}` } },
  }
}

/**
 * 建一条真实的 SSE 通道：serveTaskStream 注册到 fake webServer，
 * fetchImpl 直接调用该路由 handler 并把响应喂给 connectTaskStream 的 reader。
 */
function makeChannel(source) {
  let handler
  const ctx = { inject: (_d, cb) => cb({ webServer: { register: (r) => { handler = r.handler } } }) }
  const dispose = serveTaskStream(ctx, { basePath: '/api/tc', authorize: () => 'v', source, keepAliveMs: 100000 })
  const encoder = new TextEncoder()
  const fetchImpl = async () => {
    const chunks = []
    let wake = () => {}
    // 用可读流：先等基线写完，之后新的 notice 帧通知 reader 再读。
    void handler({ url: '/api/tc/stream' }, {
      writeHead: () => {},
      write: (c) => { chunks.push(encoder.encode(c)); wake(); wake = () => {}; return true },
      end: () => {},
      on: () => {},
    })
    return {
      ok: true,
      body: {
        getReader() {
          let i = 0
          return {
            async read() {
              while (i >= chunks.length) await new Promise((r) => { wake = r })
              return { done: false, value: chunks[i++] }
            },
          }
        },
      },
    }
  }
  return { fetchImpl, dispose }
}

test('端到端：成功 notice 经 SSE 到达后 toast + notify 各弹一次', async () => {
  let noticeListener
  const source = {
    snapshot: () => [],
    subscribe: () => () => {},
    subscribeNotices: (cb) => { noticeListener = cb; return () => {} },
  }
  const { fetchImpl, dispose } = makeChannel(source)

  const store = createTaskStore()
  const toasts = []
  const notices = []
  const coordinator = createCoordinator({
    store,
    host: {
      deliverToast: (p) => toasts.push(p),
      deliverNotify: (p) => notices.push(p),
    },
  })

  const conn = connectTaskStream({
    streamUrl: '/api/tc/stream',
    fetchImpl,
    onTask: (t) => coordinator.project([t]),
    onNotice: (n) => coordinator.deliverNotice(n),
  })

  await new Promise((r) => setTimeout(r, 20))
  assert.ok(noticeListener !== undefined, '客户端订阅了 notification 通道')
  noticeListener({ id: 'n1', task: terminal('job-1') })
  await new Promise((r) => setTimeout(r, 20))

  assert.equal(toasts.length, 1, '成功 toast 弹一次')
  assert.equal(toasts[0].title, '完成 job-1')
  assert.equal(notices.length, 1, '成功 notify 弹一次')
  conn.close()
  dispose()
})

test('端到端：状态终态帧（无 notice）只投影列表，不弹卡', async () => {
  let taskListener
  const source = {
    snapshot: () => [],
    subscribe: (cb) => { taskListener = cb; return () => {} },
  }
  const { fetchImpl, dispose } = makeChannel(source)
  const store = createTaskStore()
  const toasts = []
  const coordinator = createCoordinator({ store, host: { deliverToast: (p) => toasts.push(p) } })
  const conn = connectTaskStream({
    streamUrl: '/api/tc/stream', fetchImpl,
    onTask: (t) => coordinator.project([t]),
    onNotice: (n) => coordinator.deliverNotice(n),
  })
  await new Promise((r) => setTimeout(r, 20))
  taskListener(terminal('job-2')) // 终态只走状态帧，没有 notice
  await new Promise((r) => setTimeout(r, 20))
  assert.equal(toasts.length, 0, '状态帧不弹卡')
  assert.equal(store.get('job-2')?.state, 'done', '但状态仍投影进列表')
  conn.close()
  dispose()
})
