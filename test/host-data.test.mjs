import test from 'node:test'
import assert from 'node:assert/strict'
import { buildModelRoutes } from '../dist/host/index.js'
import { modelCatalog, workspaceList } from '../dist/ui/index.js'

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
