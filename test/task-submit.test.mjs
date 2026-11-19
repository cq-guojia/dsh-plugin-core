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
  const res = { writeHead: () => {}, end: (b) => ended(b) }
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
  assert.deepEqual(JSON.parse(reply), { ok: true, id: 'id-1' })
  assert.equal(got.title, '中文')
  assert.equal(got.seconds, 30)
})

test('提交端点：鉴权拒绝返回 403', async () => {
  const { routes, ctx } = fakeCtx()
  serveTaskSubmit(ctx, { path: '/deny', authorize: () => false, onSubmit: () => 'x' })
  const reply = await Promise.race([
    post(routes.get('/deny'), {}),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 1000)),
  ])
  assert.deepEqual(JSON.parse(reply), { error: 'forbidden' })
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
