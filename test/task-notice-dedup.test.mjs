// 通知去重的对外契约：按 TaskNotice.id 在 sessionStorage 持久去重，不按内容、不按任务身份。
// 消费方反馈 ④ 判定「core 按 id 去重是正确契约」——这条链必须真被测试覆盖。
import test from 'node:test'
import assert from 'node:assert/strict'
import { connectTaskCenter } from '../dist/adv/tasks/api.js'

const terminal = (id) => ({
  id, project: 'p', group: 'g', title: 't', state: 'done', startedAt: 1, settledAt: 2,
  toast: { success: { title: `完成 ${id}` } },
})

function makeSse() {
  const chunks = []
  let wake = () => {}
  const encoder = new TextEncoder()
  const fetchImpl = async (_url, init) => ({
    ok: true,
    body: {
      getReader() {
        let i = 0
        return {
          async read() {
            while (i >= chunks.length && !init?.signal?.aborted) {
              await new Promise((resolve) => {
                wake = resolve
                init?.signal?.addEventListener('abort', resolve, { once: true })
              })
            }
            if (init?.signal?.aborted) return { done: true }
            return { done: false, value: chunks[i++] }
          },
          cancel() {},
        }
      },
    },
  })
  return {
    fetchImpl,
    push(event, data) {
      chunks.push(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      wake()
    },
  }
}

async function wait(ms) { await new Promise((r) => setTimeout(r, ms)) }

test('通知按 id 去重：同 id 重放与刷新后都不重弹，不同 id 各自弹', async () => {
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.sessionStorage
  const backing = new Map()
  globalThis.sessionStorage = {
    getItem: (key) => backing.get(key) ?? null,
    setItem: (key, value) => { backing.set(key, String(value)) },
    removeItem: (key) => { backing.delete(key) },
    clear: () => backing.clear(),
  }
  const sse = makeSse()
  globalThis.fetch = sse.fetchImpl
  const toasts = []
  let off
  try {
    const connect = () => connectTaskCenter({
      streamUrl: '/api/tc/dedup',
      deliverToast: (payload) => toasts.push(payload.title),
    })
    off = connect()
    await wait(60)
    const notice = { id: 'persist-1', task: terminal('job-a') }
    sse.push('task-notice', notice)
    await wait(40)
    assert.deepEqual(toasts, ['完成 job-a'], '首次到达弹一次')

    sse.push('task-notice', notice)
    await wait(40)
    assert.equal(toasts.length, 1, '同一 id 重放不重弹')

    // 模拟刷新：dispose 旧接线，sessionStorage 保留，重新接线拿 outbox 重放。
    off()
    off = undefined
    await wait(30)
    off = connect()
    await wait(60)
    sse.push('task-notice', notice)
    await wait(40)
    assert.equal(toasts.length, 1, '刷新后同一 id 仍不重弹')

    // 不同 id 走不同任务身份，避免 claimSettled 的运行身份守卫干扰这条去重断言。
    sse.push('task-notice', { id: 'persist-2', task: terminal('job-b') })
    await wait(40)
    assert.deepEqual(toasts, ['完成 job-a', '完成 job-b'], '不同 id 各自弹一次')
  } finally {
    off?.()
    globalThis.fetch = originalFetch
    if (originalStorage === undefined) delete globalThis.sessionStorage
    else globalThis.sessionStorage = originalStorage
  }
})
