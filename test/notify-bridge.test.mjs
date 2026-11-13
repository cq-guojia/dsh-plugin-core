import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BROADCAST_TOAST_MS,
  ensureNotifyBridge,
  disconnectNotifyBridge,
} from '../dist/ui/feedback/notify-bridge.js'
import { emitTaskNotificationEvent } from '../dist/ui/infra/task-notifications.js'

const message = {
  id: 'origin-1:msg:1',
  project: 'demo',
  group: 'default',
  title: '任务完成',
  level: 'success',
  detail: '共 3 条',
  at: Date.now(),
}

test('广播接收端：只挂一次、只认 message、detail 只取字符串', () => {
  disconnectNotifyBridge()

  const seen = []
  const other = []

  ensureNotifyBridge((payload) => {
    seen.push(payload)
  })
  // 第二次调用不该再订阅（一页只挂一次）
  ensureNotifyBridge(() => {
    other.push(1)
  })

  emitTaskNotificationEvent({ type: 'message', message, remote: false })
  assert.equal(seen.length, 1, '一条广播只渲染一次')
  assert.equal(other.length, 0, '第二个 ensure 不再订阅')
  assert.equal(seen[0].message, '任务完成')
  assert.equal(seen[0].variant, 'success')
  assert.equal(seen[0].description, '共 3 条')
  assert.equal(seen[0].durationMs, BROADCAST_TOAST_MS)

  // 非字符串 detail 不塞进 description（跨页只保证纯数据可读）
  emitTaskNotificationEvent({
    type: 'message',
    message: { ...message, id: 'origin-1:msg:2', detail: { rows: 3 } },
    remote: false,
  })
  assert.equal(seen.length, 2)
  assert.equal(seen[1].description, undefined)

  // 任务结算事件不属于提示通道，不渲染
  emitTaskNotificationEvent({
    type: 'settled',
    outcome: 'done',
    task: {
      id: 't1',
      project: 'demo',
      group: 'default',
      title: 't',
      status: 'done',
      origin: 'o',
      backgrounded: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    remote: false,
  })
  assert.equal(seen.length, 2, 'settled 不弹提示')

  disconnectNotifyBridge()
})
