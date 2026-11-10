import test from 'node:test'
import assert from 'node:assert/strict'
import { buildModelRoutes, serveModelCatalog } from '../dist/host/index.js'
import { connectHost, getWorkspaceFiles, modelCatalog, refreshModelCatalog, workspaceList } from '../dist/ui/index.js'

/** 最小 llm face：按脚本返回 provider 与各自模型。 */
function llmFace(providers, models) {
  return {
    listProviders: () => providers,
    listModels: async (id) => {
      const value = models[id]
      if (value instanceof Error) throw value
      return value ?? []
    },
  }
}

test('buildModelRoutes：按供应商列模型、跳过列不出的、按名字排序', async () => {
  const routes = await buildModelRoutes(llmFace(
    [{ id: 'openai', name: 'OpenAI' }, { id: 'anthropic', name: 'Anthropic' }, { id: 'broken', name: 'Broken' }],
    {
      openai: [{ id: 'gpt-4', name: 'GPT-4' }],
      anthropic: [{ id: 'claude' }],
      broken: new Error('no key'),
    },
  ))
  assert.deepEqual(routes.map((route) => route.provider), ['anthropic', 'openai'])
  assert.deepEqual(routes[1].models, [{ id: 'gpt-4', name: 'GPT-4' }])
  assert.deepEqual(routes[0].models, [{ id: 'claude' }])
})

test('buildModelRoutes：没有任何模型 ⇒ 空目录（不编数据）', async () => {
  assert.deepEqual(await buildModelRoutes(llmFace([{ id: 'openai', name: 'OpenAI' }], {})), [])
})

test('modelCatalog：setRoutes / setUnavailable 推快照并通知订阅者', () => {
  let notified = 0
  const off = modelCatalog.subscribe(() => { notified += 1 })
  modelCatalog.setRoutes([{ provider: 'p', displayName: 'P', models: [{ id: 'm' }] }])
  assert.equal(modelCatalog.getSnapshot().status, 'ready')
  assert.equal(modelCatalog.getSnapshot().routes.length, 1)
  modelCatalog.setUnavailable('HTTP 500')
  assert.equal(modelCatalog.getSnapshot().status, 'unavailable')
  assert.equal(notified, 2)
  off()
})

test('connectHost：接 remote.workspaceFiles ⇒ 核心自持；形状不符不认', () => {
  const service = { list: async () => ({ path: '', entries: [], truncated: false }) }
  const callbacks = []
  connectHost({ inject: (_deps, cb) => { callbacks.push([_deps, cb]) } })
  const entry = callbacks.find(([deps]) => deps.includes('remote.workspaceFiles'))
  assert.ok(entry !== undefined, 'connectHost 必须注入 remote.workspaceFiles')
  entry[1]({ 'remote.workspaceFiles': service })
  assert.equal(getWorkspaceFiles(), service)
  // 探针 list 不在（旧宿主 / 注入时机过早）⇒ 不认，保持原值，绝不把半个服务当能用
  entry[1]({ remote: { workspaceFiles: { read: () => {} } } })
  assert.equal(getWorkspaceFiles(), service)
})

test('workspaceList 换源即镜像新快照并转发通知', () => {
  const rows = [{ workspaceId: 'w1', title: 'NAS' }]
  let listeners = 0
  const source = {
    getSnapshot: () => ({ items: rows }),
    subscribe: (_listener) => { listeners += 1; return () => { listeners -= 1 } },
  }
  let notified = 0
  const off = workspaceList.subscribe(() => { notified += 1 })
  workspaceList.setSource(source)
  assert.deepEqual(workspaceList.getSnapshot(), rows)
  assert.ok(notified >= 1) // setSource 必须推一帧通知
  workspaceList.setSource(source) // 旧订阅已解，不叠加
  assert.equal(listeners, 1)
  off()
})

test('workspaceList：归档集合镜像官方快照，推新集合即时跟随', () => {
  const rows = [{ workspaceId: 'w1', title: 'NAS' }]
  let archived = ['s1']
  let notify = () => {}
  const source = {
    getSnapshot: () => ({ items: rows, archivedSessionIds: archived }),
    subscribe: (listener) => { notify = listener; return () => {} },
  }
  let notified = 0
  const off = workspaceList.subscribe(() => { notified += 1 })
  workspaceList.setSource(source)
  assert.equal(workspaceList.getArchiveSnapshot(), archived) // 稳定引用，useSyncExternalStore 可比
  assert.equal(workspaceList.isSessionArchived('s1'), true)
  assert.equal(workspaceList.isSessionArchived('s2'), false)
  assert.deepEqual(workspaceList.getSnapshot(), rows) // items 读法不变，explorer 零改动
  assert.ok(notified >= 1)
  archived = ['s1', 's2']
  notify() // 宿主 follow 流推来新归档集合
  assert.equal(workspaceList.getArchiveSnapshot(), archived)
  assert.equal(workspaceList.isSessionArchived('s2'), true)
  assert.ok(notified >= 2)
  workspaceList.setSource({ getSnapshot: () => ({ items: rows }), subscribe: () => () => {} })
  assert.deepEqual(workspaceList.getArchiveSnapshot(), []) // 字段缺席按未归档，不编造
  assert.equal(workspaceList.isSessionArchived('s1'), false)
  off()
})

test('serveModelCatalog：只声明 webServer；llm 请求时惰性现取，缺失 / 异常都自己收口', async () => {
  const llm = {
    listProviders: () => [{ id: 'openai', name: 'OpenAI' }],
    listModels: async () => [{ id: 'gpt-4' }],
  }
  const registered = []
  const ctx = {
    inject: (deps, cb) => {
      assert.deepEqual(deps, ['webServer'], 'llm 不能进 inject 依赖')
      cb({ webServer: { register: (route) => registered.push(route) } })
    },
    get: (name) => (name === 'llm' ? llm : undefined),
  }
  serveModelCatalog(ctx, { path: '/api/x/models' })
  assert.equal(registered.length, 1)
  const reply = () => ({
    status: 0, body: '',
    writeHead(status) { this.status = status },
    end(body) { this.body = body },
  })

  const ok = reply()
  await registered[0].handler({ url: '/api/x/models', headers: {} }, ok)
  assert.equal(ok.status, 200)
  assert.equal(JSON.parse(ok.body).routes[0].provider, 'openai')

  const forbidden = reply()
  const guarded = []
  serveModelCatalog({
    inject: (_deps, cb) => cb({ webServer: { register: (route) => guarded.push(route) } }),
    get: () => llm,
  }, { path: '/api/x/models', authorize: (req) => req.headers?.['x-trusted'] === 'yes' })
  await guarded[0].handler({ headers: {} }, forbidden)
  assert.equal(forbidden.status, 403, '守卫拒绝 ⇒ 403，不查模型')

  const missing = reply()
  serveModelCatalog({ inject: (_deps, cb) => cb({ webServer: { register: (route) => registered.push(route) } }), get: () => undefined }, { path: '/api/x/models' })
  await registered[1].handler({ headers: {} }, missing)
  assert.equal(missing.status, 503, 'llm 晚挂载 / 缺席 ⇒ 503，而不是路由不注册')

  const broken = reply()
  serveModelCatalog({
    inject: (_deps, cb) => cb({ webServer: { register: (route) => registered.push(route) } }),
    get: () => ({ listProviders: () => { throw new Error('boom') }, listModels: async () => [] }),
  }, { path: '/api/x/models' })
  await registered[2].handler({ headers: {} }, broken)
  assert.equal(broken.status, 500, 'listProviders 抛错也要自己收口，不让宿主 destroy 连接')

  const inactive = reply()
  serveModelCatalog({
    inject: (_deps, cb) => cb({ webServer: { register: (route) => registered.push(route) } }),
    get: () => { throw new Error('cannot get required service "llm" in inactive context') },
  }, { path: '/api/x/models' })
  await registered[3].handler({ headers: {} }, inactive)
  assert.equal(inactive.status, 503, 'ctx 失活抛错按不可用处理，不冒成 rejected promise')

  const hookUndefined = reply()
  serveModelCatalog({
    inject: (_deps, cb) => cb({ webServer: { register: (route) => registered.push(route) } }),
    get: () => { throw new Error('inactive') },
  }, { path: '/api/x/models', getLlm: () => undefined })
  await registered[4].handler({ headers: {} }, hookUndefined)
  assert.equal(hookUndefined.status, 503, 'getLlm 返回 undefined 时也不能落到会抛的 ctx.get')
})

test('connectHost / refreshModelCatalog：不接线不取目录；刷新重拉且禁用缓存', async () => {
  const calls = []
  const saved = globalThis.fetch
  globalThis.fetch = (path, init) => {
    calls.push([path, init?.cache])
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ routes: [{ provider: 'openai', displayName: 'OpenAI', models: [{ id: 'gpt-4' }] }] }) })
  }
  try {
    await assert.rejects(refreshModelCatalog(), /模型目录未接线/)
    connectHost({ inject: () => {} })
    assert.equal(calls.length, 0, '不传 modelsPath 完全不取模型目录')
    connectHost({ inject: () => {} }, { modelsPath: '/api/x/models' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    assert.equal(calls.length, 1)
    assert.equal(calls[0][1], 'no-store', '目录必须现查，不能吃浏览器缓存')
    const state = await refreshModelCatalog()
    assert.equal(state.status, 'ready')
    assert.equal(state.routes[0].provider, 'openai')
    assert.equal(calls.length, 2, '刷新是第二次真实请求')
  } finally {
    globalThis.fetch = saved
  }
})
