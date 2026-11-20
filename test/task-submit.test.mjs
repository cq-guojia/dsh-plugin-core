import test from 'node:test'
import assert from 'node:assert/strict'
import { serveTaskSubmit, serveTaskStream } from '../dist/host/index.js'

function fakeCtx() {
  const routes = new Map()
  const web = { register: (r) => routes.set(r.path, r) }
  return { routes, ctx: { inject: (_d, cb) => cb({ webServer: web }), get: () => web } }
}

function post(route, body) {
  const raw = JSON.stringify(body)
  const req = { headers: {} }
  let ended
  const done = new Promise((resolve) => { ended = resolve })
  const record = { status: 200 }
  const res = { writeHead: (s) => { record.status = s }, end: (b) => ended({ status: record.status, body: b }) }
  req.on = (e, cb) => { if (e === 'data') cb(Buffer.from(raw)) }
  req.once = (e, cb) => { if (e === 'end') cb() }
  Promise.resolve(route.handler(req, res)).catch((error) => res.end(JSON.stringify({ error: String(error) })))
  return done
}

test('提交端点：POST payload 交给 onSubmit，回 id', async () => {
  let got
  const { routes, ctx } = fakeCtx()
  serveTaskSubmit(ctx, { path: '/s', authorize: () => true, onSubmit: (p) => { got = p; return 'id-1' } })
  const reply = await Promise.race([
    post(routes.get('/s'), { title: '中文', seconds: 30 }),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1000)),
  ])
  assert.deepEqual(JSON.parse(reply.body), { ok: true, id: 'id-1' })
  assert.equal(got.title, '中文')
  assert.equal(got.seconds, 30)
})

test('提交端点：非对象 payload（null/数字/字符串/数组）回 400 且不到 onSubmit', async () => {
  for (const bad of [null, 42, 'x', [1, 2]]) {
    let called = false
    const { routes, ctx } = fakeCtx()
    serveTaskSubmit(ctx, { path: '/bad', authorize: () => true, onSubmit: () => { called = true; return 'x' } })
    const reply = await Promise.race([
      post(routes.get('/bad'), bad),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1000)),
    ])
    assert.equal(reply.status, 400, '非法 payload 回 400')
    const parsed = JSON.parse(reply.body)
    assert.equal(parsed.ok, false, `payload=${JSON.stringify(bad)} 应拒绝`)
    assert.equal(parsed.code, 'invalid-payload')
    assert.equal(called, false, '非法 payload 不得进 onSubmit')
  }
})

test('提交端点：onSubmit 自身抛错回 500，不回显内部错误原文', async () => {
  const { routes, ctx } = fakeCtx()
  serveTaskSubmit(ctx, {
    path: '/boom', authorize: () => true,
    onSubmit: () => { throw new Error('db password=secret') },
  })
  const reply = await Promise.race([
    post(routes.get('/boom'), { title: 'x' }),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1000)),
  ])
  assert.equal(reply.status, 500, '服务端业务故障回 500，不是 400')
  const parsed = JSON.parse(reply.body)
  assert.equal(parsed.code, 'submit-failed')
  assert.ok(!reply.body.includes('secret'), '不回显内部错误原文')
})

test('提交端点：非法 JSON / 空 body 与非法 payload 同形状 400', async () => {
  for (const rawBody of ['not-json', '']) {
    const { routes, ctx } = fakeCtx()
    serveTaskSubmit(ctx, { path: '/shape', authorize: () => true, onSubmit: () => 'x' })
    const req = { headers: {} }
    let ended
    const done = new Promise((resolve) => { ended = resolve })
    let status = 200
    const res = { writeHead: (s) => { status = s }, end: (b) => ended(b) }
    req.on = (e, cb) => { if (e === 'data' && rawBody) cb(Buffer.from(rawBody)) }
    req.once = (e, cb) => { if (e === 'end') cb() }
    await routes.get('/shape').handler(req, res)
    const parsed = JSON.parse(await done)
    assert.equal(status, 400, `body=${JSON.stringify(rawBody)} 回 400`)
    assert.deepEqual(parsed, { ok: false, error: 'bad-request', code: 'invalid-payload' })
  }
})

test('提交端点：鉴权拒绝返回 403', async () => {
  const { routes, ctx } = fakeCtx()
  serveTaskSubmit(ctx, { path: '/deny', authorize: () => false, onSubmit: () => 'x' })
  const reply = await Promise.race([
    post(routes.get('/deny'), {}),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1000)),
  ])
  assert.deepEqual(JSON.parse(reply.body), { error: 'forbidden' })
})

test('提交端点：authorize 自身抛错也回 403，不挂死请求', async () => {
  const { routes, ctx } = fakeCtx()
  serveTaskSubmit(ctx, {
    path: '/auth-throw',
    authorize: () => { throw new Error('auth service down') },
    onSubmit: () => 'x',
  })
  const reply = await Promise.race([
    post(routes.get('/auth-throw'), {}),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1000)),
  ])
  assert.deepEqual(JSON.parse(reply.body), { error: 'forbidden' })
})

test('提交端点：authorize 异步抛错也回 403，不挂死请求', async () => {
  const { routes, ctx } = fakeCtx()
  serveTaskSubmit(ctx, {
    path: '/auth-reject',
    authorize: async () => { throw new Error('auth down') },
    onSubmit: () => 'x',
  })
  const reply = await Promise.race([
    post(routes.get('/auth-reject'), {}),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1000)),
  ])
  assert.deepEqual(JSON.parse(reply.body), { error: 'forbidden' })
})

test('刷新恢复：新 SSE 连接从 snapshot 拿到已提交且仍在运行的任务', async () => {
  const { routes, ctx } = fakeCtx()
  const tasks = new Map(), listeners = new Set()
  const emit = (t) => { tasks.set(t.id, t); for (const l of listeners) l(t) }
  serveTaskSubmit(ctx, {
    path: '/submit', authorize: () => true,
    onSubmit: (p) => {
      emit({ id: 't1', project: 'p', group: 'g', title: p.title, state: 'running', startedAt: 1 })
      setTimeout(() => emit({ id: 't1', project: 'p', group: 'g', title: p.title, state: 'done', startedAt: 1, settledAt: 2 }), 10)
      return 't1'
    },
  })
  serveTaskStream(ctx, {
    basePath: '/tasks', authorize: () => 'v',
    source: { snapshot: () => [...tasks.values()], subscribe: (l) => { listeners.add(l); return () => listeners.delete(l) } },
  })
  await Promise.race([
    post(routes.get('/submit'), { title: '中文' }),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1000)),
  ])
  const frames = []
  routes.get('/tasks/stream').handler({}, {
    writeHead: () => {}, write: (c) => { frames.push(String(c)); return true }, end: () => {}, on: () => {},
  })
  await new Promise((r) => setTimeout(r, 20))
  assert.ok(frames.some((f) => f.includes('"id":"t1"')), '基线含运行中的任务')
  assert.ok(frames.some((f) => f.includes('"state":"done"')), '刷新后仍收到终态')
})
