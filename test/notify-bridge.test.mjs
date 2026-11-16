import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BROADCAST_TOAST_MS,
  ensureNotifyBridge,
  disconnectNotifyBridge,
} from '../dist/ui/feedback/notify-bridge.js'
import { notifyMessage, setDefaultTaskProject } from '../dist/runtime/notify.js'
import { emitTaskNotificationEvent } from '../dist/adv/tasks/pool.js'

// 通知自 2026-11-16 起走 `runtime/notify` 自己的通道与订阅者，不再搭任务总线：
// 这里直接用 `notifyMessage()` 驱动，验证桥把它翻成 toast 载荷的规则。
test('广播接收端：只挂一次、detail 只取字符串、任务事件不弹', () => {
  disconnectNotifyBridge()
  setDefaultTaskProject('demo')
  try {
    const seen = []
    const other = []

    ensureNotifyBridge((payload) => {
      seen.push(payload)
    })
    // 第二次调用不该再订阅（一页只挂一次）
    ensureNotifyBridge(() => {
      other.push(1)
    })

    notifyMessage('任务完成', { level: 'success', detail: '共 3 条' })
    assert.equal(seen.length, 1, '一条广播只渲染一次')
    assert.equal(other.length, 0, '第二个 ensure 不再订阅')
    assert.equal(seen[0].message, '任务完成')
    assert.equal(seen[0].variant, 'success')
    assert.equal(seen[0].description, '共 3 条')
    assert.equal(seen[0].durationMs, BROADCAST_TOAST_MS)

    // 非字符串 detail 不塞进 description（跨页只保证纯数据可读）
    notifyMessage('带对象详情', { detail: { rows: 3 } })
    assert.equal(seen.length, 2)
    assert.equal(seen[1].description, undefined)

    // 任务事件走另一条线，不进提示通道
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
        startedAt: Date.now(),
        updatedAt: Date.now(),
      },
      remote: false,
    })
    assert.equal(seen.length, 2, 'settled 不弹提示')
  } finally {
    disconnectNotifyBridge()
    setDefaultTaskProject(undefined)
  }
})
