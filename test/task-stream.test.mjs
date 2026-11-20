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

test('connectTaskStream：连上后断线会重连（不把 200 当永久错误），retry 归零', async () => {
  let call = 0
  const fakeFetch = async () => {
    call += 1
    return {
      ok: true,
      status: 200,
      body: {
        getReader() {
          let sent = false
          return {
            async read() {
              if (call === 1) {
                // 第一次连接：推一帧后立刻 EOF（服务端正常关流 / 断线）。
                if (sent) return { done: true }
                sent = true
                const encoder = new TextEncoder()
                return { done: false, value: encoder.encode(`event: task\ndata: ${JSON.stringify(rec('a'))}\n\n`) }
              }
              // 第二次连接：挂住，证明确实重连了。
              return new Promise(() => {})
            },
          }
        },
      },
    }
  }
  const gave = []
  const conn = connectTaskStream({
    streamUrl: '/x', fetchImpl: fakeFetch, retryDelaysMs: [5],
    onGiveUp: (r) => gave.push(r),
  })
  await new Promise((r) => setTimeout(r, 60))
  assert.equal(call, 2, 'EOF 后必须重连（旧回归：status=200 被判永久错误、直接 giveUp）')
  assert.equal(gave.length, 0, '断线不算永久错误')
  conn.close()
})

test('connectTaskStream：收到帧后 read() reject 断开不累积 retry、不 giveUp', async () => {
  let call = 0
  const encoder = new TextEncoder()
  // 每轮推一帧后以 reject 断开（网络切换/代理超时）——都是有数据进展的真连接。
  const fakeFetch = async () => {
    call += 1
    return {
      ok: true, status: 200,
      body: {
        getReader() {
          let sent = false
          return {
            async read() {
              if (sent) throw new Error('connection reset')
              sent = true
              return { done: false, value: encoder.encode('event: task\ndata: {"id":"x"}\n\n') }
            },
          }
        },
      },
    }
  }
  const gave = []
  const conn = connectTaskStream({
    streamUrl: '/x', fetchImpl: fakeFetch, retryDelaysMs: [5, 5, 5],
    onGiveUp: (r) => gave.push(r),
  })
  await new Promise((r) => setTimeout(r, 90))
  // 修复前：retry 在 catch 路径不归零，第 4 轮（delays 用尽）就 giveUp；
  // 修复后：finally 里按 gotFrame 归零，每轮都从 delays[0] 重来但始终有进展，不 giveUp。
  assert.ok(call > 4, '有数据进展的断线持续重连，不受退避用尽限制')
  assert.equal(gave.length, 0, '不误报 giveUp')
  conn.close()
})

test('connectTaskStream：每轮 200 后立即 EOF（假连接）不无限空刷，退避用尽即放弃', async () => {
  let call = 0
  // 每轮都返回 200 + 立即 EOF、从不推帧——模拟网关剥掉 SSE / accept 后立刻关流。
  const fakeFetch = async () => {
    call += 1
    return {
      ok: true, status: 200,
      body: { getReader: () => ({ async read() { return { done: true } } }) },
    }
  }
  const gave = []
  const conn = connectTaskStream({
    streamUrl: '/x', fetchImpl: fakeFetch, retryDelaysMs: [1, 1],
    onGiveUp: (r) => gave.push(r),
  })
  await new Promise((r) => setTimeout(r, 80))
  assert.equal(call, 3, '首连 + 2 次退避重试后用尽（不是无限空刷）')
  assert.equal(gave.length, 1, '退避用尽上报 giveUp')
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

test('serveTaskStream：snapshot 同步抛错回 503，不误报 401（鉴权已过）', async () => {
  let handler
  const ctx = { inject: (_d, cb) => cb({ webServer: { register: (r) => { handler = r.handler } } }) }
  const source = {
    snapshot: () => { throw new Error('db down') }, // 同步抛，正是旧实现误判 401 的触发点
    subscribe: () => () => {},
  }
  const status = []
  const res = {
    writeHead: (s) => { status.push(s) },
    write: () => true,
    end: () => {},
    on: () => {},
  }
  serveTaskStream(ctx, { basePath: '/api/snap', authorize: () => 'v', source })
  await handler({ url: '/api/snap/stream' }, res)
  await new Promise((r) => setTimeout(r, 10)) // handler 内部是异步 IIFE，不返回 promise
  assert.deepEqual(status, [503], '快照故障是服务不可用，不是未认证')
})

test('serveTaskStream：头已发后基线写失败只 end，不再 writeHead 503（防 ERR_HTTP_HEADERS_SENT）', async () => {
  let handler
  const ctx = { inject: (_d, cb) => cb({ webServer: { register: (r) => { handler = r.handler } } }) }
  const source = {
    snapshot: () => [{ id: 'a', project: 'p', group: 'g', title: 't', state: 'running', startedAt: 1 }],
    subscribe: () => () => {},
  }
  const heads = []
  let ended = false
  const res = {
    writeHead: (s) => { heads.push(s) },
    write: () => { throw new Error('client gone') }, // 基线帧写入就失败
    end: () => { ended = true },
    on: () => {},
  }
  serveTaskStream(ctx, { basePath: '/api/writefail', authorize: () => 'v', source })
  await handler({ url: '/api/writefail/stream' }, res)
  await new Promise((r) => setTimeout(r, 10))
  assert.deepEqual(heads, [200], '只 writeHead 一次，失败后不再写 503')
  assert.equal(ended, true, '失败后仍 end 收尾')
})

test('serveTaskStream：subscribe 的 offTask 抛错不泄漏其它订阅与连接集合', async () => {
  let handler
  const ctx = { inject: (_d, cb) => cb({ webServer: { register: (r) => { handler = r.handler } } }) }
  let noticeDetached = false
  const source = {
    snapshot: () => [],
    subscribe: () => () => { throw new Error('detach boom') },
    subscribeNotices: () => () => { noticeDetached = true },
  }
  let onClose
  const res = {
    writeHead: () => {}, write: () => true, end: () => {},
    on: (_evt, cb) => { onClose = cb },
  }
  serveTaskStream(ctx, { basePath: '/api/clean', authorize: () => 'v', source })
  await handler({ url: '/api/clean/stream' }, res)
  await new Promise((r) => setTimeout(r, 10)) // 等异步 handler 建好订阅与 close 回调
  assert.equal(typeof onClose, 'function', 'close 回调已注册')
  onClose?.() // 触发清理：offTask 抛错不能挡住 offNotice
  assert.equal(noticeDetached, true, 'offTask 抛错后 offNotice 仍被 detach')
  onClose?.() // 二次调用幂等，不重复 detach
  assert.equal(noticeDetached, true)
})

test('connectTaskStream：4xx 立即放弃不重试，退避档用尽也放弃并上报', async () => {
  let calls = 0
  const fakeFetch = async () => { calls += 1; return { ok: false, status: 401, body: null } }
  const gave = []
  const conn = connectTaskStream({
    streamUrl: '/x', fetchImpl: fakeFetch, retryDelaysMs: [1, 1],
    onGiveUp: (r) => gave.push(r),
  })
  await new Promise((r) => setTimeout(r, 40))
  assert.equal(calls, 1, '401 永久错误只请求一次，不重试')
  assert.equal(gave.length, 1)
  assert.equal(gave[0].status, 401)
  assert.equal(gave[0].permanent, true)
  conn.close()

  let tries = 0
  const fakeFetch503 = async () => { tries += 1; return { ok: false, status: 503, body: null } }
  const gave503 = []
  const conn2 = connectTaskStream({
    streamUrl: '/x', fetchImpl: fakeFetch503, retryDelaysMs: [1, 1],
    onGiveUp: (r) => gave503.push(r),
  })
  await new Promise((r) => setTimeout(r, 80))
  assert.equal(tries, 3, '503 重试 2 次（共 3 次请求）后用尽退避档停下')
  assert.equal(gave503.length, 1)
  assert.equal(gave503[0].permanent, false)
  conn2.close()
})

test('serveTaskStream：快照慢于 keepAliveMs 时保活不抢在 writeHead 前隐式发头', async () => {
  let handler
  const ctx = { inject: (_d, cb) => cb({ webServer: { register: (r) => { handler = r.handler } } }) }
  const source = {
    // 快照故意慢于保活间隔，模拟服务端取基线耗时的情况。
    snapshot: () => new Promise((resolve) => setTimeout(() => resolve([]), 40)),
    subscribe: () => () => {},
  }
  const order = []
  const res = {
    writeHead: () => { order.push('head') },
    write: (c) => { order.push(String(c).includes('keep-alive') ? 'keepalive' : 'frame'); return true },
    end: () => {},
    on: () => {},
  }
  serveTaskStream(ctx, {
    basePath: '/api/slow', authorize: () => 'v', source, keepAliveMs: 5,
  })
  await handler({ url: '/api/slow/stream' }, res)
  await new Promise((r) => setTimeout(r, 60))
  assert.equal(order[0], 'head', 'writeHead 必须是第一次写，保活不得抢先（否则 ERR_HTTP_HEADERS_SENT）')
  assert.ok(order.includes('keepalive'), 'writeHead 之后保活仍正常启动')
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
