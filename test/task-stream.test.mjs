import test from 'node:test'
import assert from 'node:assert/strict'
import { parseTaskFrames, connectTaskStream } from '../dist/adv/tasks/stream.js'
import { serveTaskStream } from '../dist/host/index.js'

function rec(id, state = 'running') {
  return { id, project: 'p', group: 'g', title: 't', state, startedAt: 1 }
}

test('parseTaskFrames：只解 event: task 的完整帧，保留半帧', () => {
  const got = []
  const rest = parseTaskFrames(
    ': keep-alive\n\nevent: task\ndata: {"id":"a"}\n\nevent: other\ndata: {"id":"b"}\n\nevent: task\ndata: {"id"',
    (x) => got.push(x),
  )
  assert.deepEqual(got, [{ id: 'a' }])
  assert.equal(rest, 'event: task\ndata: {"id"')
})

test('parseTaskFrames：CRLF 分隔与多行 data 拼接', () => {
  const got = []
  parseTaskFrames(
    'event: task\r\ndata: {"id":"crlf","title":\r\ndata: "多行拼接"}\r\n\r\n',
    (x) => got.push(x),
  )
  assert.equal(got.length, 1)
  assert.equal(got[0].id, 'crlf')
  assert.equal(got[0].title, '多行拼接')
})

test('parseTaskFrames：CRLF 帧被 chunk 切开也能拼回（末尾孤立 \\r 留待下片）', () => {
  const got = []
  const full = 'event: task\r\ndata: {"id":"split"}\r\n\r\n'
  const cut = full.indexOf('\r\n\r\n') + 1
  assert.ok(full.slice(0, cut).endsWith('\r'), 'chunk1 ends with lone CR')
  const rest1 = parseTaskFrames(full.slice(0, cut), (x) => got.push(x))
  const rest2 = parseTaskFrames(rest1 + full.slice(cut), (x) => got.push(x))
  assert.equal(got.length, 1)
  assert.equal(got[0].id, 'split')
  assert.equal(rest2, '')
})

test('parseTaskFrames：data 里的转义与换行安全解析', () => {
  const got = []
  parseTaskFrames('event: task\ndata: {"id":"x","title":"a\\"b"}\n\n', (x) => got.push(x))
  assert.equal(got[0].title, 'a"b')
})

test('parseTaskFrames：状态帧走 onTask，通知帧走 onNotice（通知才是弹卡源）', () => {
  const tasks = []
  const notices = []
  parseTaskFrames(
    'event: task-snapshot\ndata: {"id":"old"}\n\n' +
    'event: task\ndata: {"id":"new"}\n\n' +
    'event: task-notice\ndata: {"id":"n1","task":{"id":"new"}}\n\n',
    (x, snapshot) => tasks.push([x.id, snapshot]),
    (x) => notices.push(x.id),
  )
  assert.deepEqual(tasks, [['old', true], ['new', false]])
  assert.deepEqual(notices, ['n1'], '通知帧不混进状态投影')
})

test('connectTaskStream：fetch 流解析后回调 onTask，close 中断', async () => {
  const encoder = new TextEncoder()
  const frame = `event: task\ndata: ${JSON.stringify(rec('a', 'done'))}\n\n`
  const fakeFetch = async () => ({
    ok: true,
    body: {
      getReader() {
        let sent = false
        return {
          async read() {
            if (sent) return new Promise(() => {}) // 挂住，等 close abort
            sent = true
            return { done: false, value: encoder.encode(frame) }
          },
        }
      },
    },
  })
  const got = []
  const conn = connectTaskStream({ streamUrl: '/x', fetchImpl: fakeFetch, onTask: (t) => got.push(t) })
  await new Promise((r) => setTimeout(r, 20))
  assert.equal(got.length, 1)
  assert.equal(got[0].id, 'a')
  conn.close()
})

test('connectTaskStream：退避等待中 close 立即打断，不等满 delay', async () => {
  // fetch 立刻失败 ⇒ 进入退避 sleep（这里给很长 60s，若 close 不打断测试会挂住）。
  const fakeFetch = async () => { throw new Error('offline') }
  const conn = connectTaskStream({
    streamUrl: '/x', fetchImpl: fakeFetch, onTask: () => {}, retryDelaysMs: [60_000],
  })
  await new Promise((r) => setTimeout(r, 10)) // 让循环进入 sleep
  const t0 = Date.now()
  conn.close()
  await new Promise((r) => setTimeout(r, 50))
  assert.ok(Date.now() - t0 < 1000, 'close 后不挂在退避等待里')
})

test('serveTaskStream：缺 authorize 直接抛，不裸奔路由', () => {
  const ctx = { inject: (_d, cb) => cb({ webServer: { register() {} } }) }
  assert.throws(
    () => serveTaskStream(ctx, { basePath: '/x', source: { snapshot: () => [], subscribe: () => () => {} } }),
    /requires authorize/,
  )
})

test('serveTaskStream：webServer 未就位时不抛，不连累同 apply 其它路由', () => {
  let injected = false
  const ctx = { inject: (_d, cb) => { injected = true; cb({ webServer: undefined }) } }
  assert.doesNotThrow(() => serveTaskStream(ctx, {
    basePath: '/x', authorize: () => 'v',
    source: { snapshot: () => [], subscribe: () => () => {} },
  }))
  assert.equal(injected, true)
})

test('serveTaskStream：基线先推全量，订阅增量，保活头正确', async () => {
  let handler
  const registered = []
  const ctx = { inject: (_d, cb) => cb({ webServer: { register: (r) => { registered.push(r); handler = r.handler } } }) }
  let listener
  const source = {
    snapshot: () => [rec('base')],
    subscribe: (cb) => { listener = cb; return () => {} },
  }
  const written = []
  const res = {
    writeHead: (_s, h) => { written.push(['head', h]) },
    write: (c) => { written.push(['write', c]); return true },
    end: () => {},
    on: () => {},
  }
  const dispose = serveTaskStream(ctx, {
    basePath: '/api/tc',
    authorize: () => 'viewer-1',
    source,
    keepAliveMs: 100000,
  })
  assert.equal(registered.length, 1)
  assert.equal(registered[0].path, '/api/tc/stream')
  await handler({ url: '/api/tc/stream' }, res)
  await new Promise((r) => setTimeout(r, 0))
  const head = written.find((w) => w[0] === 'head')
  assert.equal(head[1]['content-type'], 'text/event-stream; charset=utf-8')
  assert.equal(head[1]['x-accel-buffering'], 'no')
  assert.ok(written.some((w) => String(w[1]).includes('"id":"base"')))
  listener(rec('delta', 'done'))
  assert.ok(written.some((w) => String(w[1]).includes('"id":"delta"')))
  dispose()
})
