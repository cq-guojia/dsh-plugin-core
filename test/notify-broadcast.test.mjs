import test from 'node:test'
import assert from 'node:assert/strict'
import {
  connectToasts,
  notify,
  setDefaultTaskProject,
  taskNotifications,
} from '../dist/ui/index.js'
import { emitTaskNotificationEvent } from '../dist/ui/infra/task-notifications.js'
import { disconnectNotifyBridge, isNotifyBridgeConnected } from '../dist/ui/feedback/notify-bridge.js'
import { TOAST_QUEUE_KEY, subscribeToasts } from '../dist/ui/feedback/toast-queue.js'

// 独立文件：广播接收端是全局单例；每个用例用 disconnectNotifyBridge() 真正退订事件订阅，
// 只删 Symbol.for 键清不掉模块级 sharedBus 里的 listener。
test('广播：本地事件已发出后通知中心抛错，只渲染一条（catch 不再补一条）', () => {
  const prevDocument = globalThis.document
  const prevWarn = console.warn
  const warns = []
  const originalBroadcast = taskNotifications.broadcast
  disconnectNotifyBridge()
  delete globalThis[TOAST_QUEUE_KEY]
  console.warn = (msg) => warns.push(String(msg))

  try {
    globalThis.document = {} // 只为了让发送侧的 DOM 环境判据为真；不碰任何 DOM API
    setDefaultTaskProject('probe')
    const seen = []
    const off = subscribeToasts((payload) => seen.push(payload.message))
    connectToasts()

    taskNotifications.broadcast = () => {
      // 模拟通知中心「先发本地 message 事件，再在跨页投递时抛错」：桥已经渲染过一条。
      emitTaskNotificationEvent({
        type: 'message',
        message: {
          id: 'probe:msg:1',
          project: 'probe',
          group: 'default',
          title: '广播',
          level: 'info',
          at: Date.now(),
        },
        remote: false,
      })
      throw new Error('演示：本地事件发出后跨页投递失败')
    }

    notify('广播', { broadcast: true })
    assert.deepEqual(seen, ['广播'], '桥已渲染一条，catch 不能再补一条')
    assert.ok(warns.some((w) => w.includes('广播未完全送达')), '失败要看得见')
    off()
  } finally {
    taskNotifications.broadcast = originalBroadcast
    setDefaultTaskProject(undefined)
    disconnectNotifyBridge()
    delete globalThis[TOAST_QUEUE_KEY]
    if (prevDocument === undefined) delete globalThis.document
    else globalThis.document = prevDocument
    console.warn = prevWarn
  }
})

test('广播：接收端没接上时降级本页并告警，不静默丢消息', () => {
  const prevDocument = globalThis.document
  const prevWarn = console.warn
  const warns = []
  disconnectNotifyBridge()
  delete globalThis[TOAST_QUEUE_KEY]
  console.warn = (msg) => warns.push(String(msg))
  try {
    assert.equal(isNotifyBridgeConnected(), false, '这个用例必须在没有桥 listener 的前提下跑')
    globalThis.document = {}
    setDefaultTaskProject('probe')
    const seen = []
    const off = subscribeToasts((payload) => seen.push(payload.message))
    notify('降级', { broadcast: true })
    assert.deepEqual(seen, ['降级'])
    assert.ok(warns.some((w) => w.includes('广播条件不满足')), '漏调 connectToasts 要看得见')
    off()
  } finally {
    setDefaultTaskProject(undefined)
    disconnectNotifyBridge()
    delete globalThis[TOAST_QUEUE_KEY]
    if (prevDocument === undefined) delete globalThis.document
    else globalThis.document = prevDocument
    console.warn = prevWarn
  }
})

test('广播：description 不是字符串时当场抛错（函数/对象不能跨页）', () => {
  assert.throws(
    () => notify('x', { broadcast: true, description: { bad: true } }),
    /description must be a string/,
  )
})
