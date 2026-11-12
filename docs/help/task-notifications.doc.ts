// 通知任务中心的使用帮助 —— 真源（TS 数据模块）。md 与 demo 文档体都从这份派生。
// 本文只讲「怎么用」与「边界在哪」；契约口径与不变量在 docs/design/task-notifications.md。
import type { DocTopic } from '../design/doc-format.js'

const subscribeExample = `import { useSyncExternalStore } from 'react'
import {
  taskNotifications,
  selectTaskNotifications,
  subscribeTaskNotificationEvents,
} from 'dsh-plugin-core/ui'

// 三个参数都给：getServerSnapshot 让 SSR / 非宿主环境不炸
const snapshot = useSyncExternalStore(
  taskNotifications.subscribe,
  taskNotifications.getSnapshot,
  taskNotifications.getServerSnapshot,
)

// 过滤三态：不传 = 全站；一个 = 只看该组；多个 = 看这几个
const visible = selectTaskNotifications(snapshot, ['dsh-task-reminder'])

// 幂等：开同源标签页通道，并向在线页面要一次全量 baseline
taskNotifications.connect()

// 事件是一次性事实，不留存；退订函数照常调用
const off = subscribeTaskNotificationEvents((event) => {
  if (event.type === 'backgrounded') {
    // 收起发生了；任务仍在跑，快照里也看得到
  }
})
// off() 于卸载时调用`

const lifecycleExample = `import { taskNotifications } from 'dsh-plugin-core/ui'

// 分组名必须由调用方给：core 取不到项目名
const handle = taskNotifications.register({
  group: 'dsh-task-reminder',
  title: '扫描工作区文件',
})

handle.update({ detail: '已完成 12 / 40' })
handle.background()   // 只发 backgrounded 事件，不结算任务

// 结束权在调用方；两者幂等，成功后条目立刻移出池
handle.done('扫描完成')
// handle.fail('被用户取消')

// Promise 兜底：成功与 reject 走同一个收尾，且不改变原 Promise 的结算语义
// await handle.track(runWork())   // runWork(): Promise<void>，由调用方提供
// await handle.settled            // 只在真正结束时兑现；收起不兑现`

const doc: DocTopic = {
  title: { zh: '通知任务中心', en: 'Task Notification Hub' },
  exports: [
    'taskNotifications',
    'taskNotificationEvents',
    'createTaskNotificationPool',
    'createTaskNotificationEventBus',
    'selectTaskNotifications',
    'subscribeTaskNotificationEvents',
    'emitTaskNotificationEvent',
  ],
  sections: [
    {
      id: 'task-notifications',
      heading: { zh: '让长耗时任务登记、订阅与跨页可见', en: 'Register, subscribe and observe long-running tasks' },
      prose: [
        {
          zh: '两条通道不能互相替代：状态池给任意时刻可读的全量快照，可直接喂 `useSyncExternalStore`；事件总线只投递一次性事实，不留存。新开的页面没听过历史事件，靠 `hello` 换回全量分片补齐；反过来，「收起」是一次性事实，读完快照看不出来，必须监听事件。',
          en: 'Two channels that do not replace each other: the pool exposes a queryable full snapshot that feeds `useSyncExternalStore`; the event bus delivers one-off facts and keeps no history. A freshly opened page has heard no past events, so `hello` exchanges a full shard as baseline. Conversely, collapsing is a one-off fact invisible in a snapshot — listen to events for it.',
        },
        {
          zh: '数据只在内存：本页与各同源标签页各持一份，进程或页面关闭即失；不落文件、不发请求、不轮询。跨页消息只能是结构化克隆可得的纯数据，不带函数、组件、`ReactNode` 或 Promise。条目一律来自真实注册与真实时钟，库内不含模拟或占位数据。',
          en: 'Data lives in memory only: one copy per page and per same-origin tab, gone when the process or page closes. No files, no requests, no polling. Cross-page messages are plain structured-cloneable data — no functions, components, `ReactNode` or promises. Every row comes from a real registration and the real clock; the library ships no mock or placeholder data.',
        },
        {
          zh: '快照是 `{ tasks, revision }`，`tasks` 按开始时间再按 id 排序，跨页顺序确定；无变化不产生新对象，`getServerSnapshot()` 永远是同一个冻结空快照。`selectTaskNotifications()` 对同一快照与同一过滤条件返回同一数组。分组名由调用方显式给，`groupLabel` 只覆盖显示名。',
          en: 'A snapshot is `{ tasks, revision }`; `tasks` sorts by start time then id, so order is identical across pages. No change means no new object, and `getServerSnapshot()` always returns the same frozen empty snapshot. `selectTaskNotifications()` returns the same array for the same snapshot and filter. The caller supplies the group id explicitly; `groupLabel` only overrides the display name.',
        },
        {
          zh: '结束权在调用方：`done()` / `fail()` 幂等，`track(promise)` 让成功与 reject 走同一收尾且返回原 Promise。`settled` 只在任务真正结束时兑现；收起不兑现它，而是发一个 `backgrounded` 事件。这就是「Promise 两态 + 收起作为事件」，调用方 `await` 的仍是正常两态。',
          en: 'The caller decides when a task ends: `done()` / `fail()` are idempotent, and `track(promise)` settles on both success and rejection while returning the original promise. `settled` resolves only on a real ending; collapsing emits a `backgrounded` event instead. This is the "two-state promise plus collapse as event" contract — callers still await ordinary two-state promises.',
        },
        {
          zh: '跨页走浏览器原生 `BroadcastChannel`：每页广播自己那份全量分片并带单调 `seq`，旧序号、重复与畸形消息一律丢弃；`pagehide` / `pageshow` 覆盖标签页离开、bfcache 与休眠恢复。只覆盖同源标签页，不覆盖不同浏览器、不同 profile 或不同机器。跨页条目能看不能点，只有创建它的那一页能请求还原。',
          en: 'Cross-page sync uses the native `BroadcastChannel`: each page broadcasts its own full shard with a monotonic `seq`; stale, duplicate and malformed messages are dropped. `pagehide` / `pageshow` cover tab teardown, bfcache and sleep/wake. Only same-origin tabs are covered — not other browsers, profiles or machines. Cross-page rows are read-only; only the owning page may request a restore.',
        },
        {
          zh: '同页多副本收口到 `globalThis[Symbol.for(...)]` 上的同一个池与同一条总线，注册与通知不会重复 N 次；键里带协议版本，形状不符直接报错而不是静默降级。本能力是数据面：可收起弹窗、例外控件与事件查看控件不属于它，由后续任务单独提供。',
          en: 'Multiple copies on one page share a single pool and bus on `globalThis[Symbol.for(...)]`, so registration and notification never fire N times. Keys carry a protocol version; a shape mismatch throws instead of silently degrading. This capability is the data plane only: collapsible dialogs, exception controls and the event-viewer control are out of scope and arrive in separate tasks.',
        },
      ],
      api: [
        {
          id: 'bt-pool-api',
          rows: [
            { name: 'taskNotifications', type: 'TaskNotificationPool', def: '全局单例', desc: { zh: '同页所有副本共享的池；惰性创建，首次使用才占用全局键', en: 'Pool shared by all copies on the page; lazy, claims the global key on first use' } },
            { name: 'getSnapshot()', type: '() => TaskNotificationSnapshot', def: '—', desc: { zh: '当前全量快照，引用稳定；可直接作 useSyncExternalStore 的第二参', en: 'Current full snapshot with a stable reference; use as the second useSyncExternalStore argument' } },
            { name: 'getServerSnapshot()', type: '() => TaskNotificationSnapshot', def: '冻结空快照', desc: { zh: 'SSR / 非宿主环境用，永远是同一个对象', en: 'For SSR and non-host environments; always the same object' } },
            { name: 'subscribe(listener)', type: '(listener: () => void) => () => void', def: '—', desc: { zh: '状态真变了才通知；返回退订函数', en: 'Notifies only on real state changes; returns an unsubscribe function' } },
            { name: 'connect()', type: '() => void', def: '—', desc: { zh: '幂等；开跨页通道并请求一次全量 baseline', en: 'Idempotent; opens the cross-page channel and requests one full baseline' } },
            { name: 'refresh()', type: '() => void', def: '—', desc: { zh: '重新向同源标签页要一次全量状态；休眠恢复时自动触发，平时不用手动调', en: 'Re-requests a full snapshot from same-origin tabs; runs automatically after sleep, no manual call needed' } },
            { name: 'select(groups?)', type: '(groups?: readonly string[]) => readonly TaskNotificationRecord[]', def: '不传 = 全站', desc: { zh: '池内自带缓存的过滤；与 selectTaskNotifications 同一套三态', en: 'Cached pool-level filtering; same three-state contract as selectTaskNotifications' } },
            { name: 'register(input)', type: '(input: TaskNotificationInput) => TaskNotificationHandle', def: '—', desc: { zh: '登记一条真实任务并返回句柄', en: 'Registers a real task and returns its handle' } },
            { name: 'canRestore(task)', type: '(task: TaskNotificationRecord) => boolean', def: '—', desc: { zh: '只有本页创建的条目可还原', en: 'Only rows created on this page can be restored' } },
            { name: 'requestRestore(taskId)', type: '(taskId: string) => boolean', def: '—', desc: { zh: '发本地 restored 事件；跨页条目返回 false，不跨页传递', en: 'Emits a local restored event; returns false for cross-page rows, never crosses pages' } },
            { name: 'dispose()', type: '() => void', def: '—', desc: { zh: '关通道与摘监听，保留状态；下次 connect 会复活并重发全量分片', en: 'Closes the channel and detaches listeners but keeps state; the next connect revives it and rebroadcasts a full shard' } },
          ],
        },
        {
          id: 'bt-handle-api',
          rows: [
            { name: 'input.group', type: 'string', def: '—', required: '必填', desc: { zh: '调用方给的分组 id；core 取不到项目名', en: 'Caller-supplied group id; core cannot discover a project name' } },
            { name: 'input.title', type: 'string', def: '—', required: '必填', desc: { zh: '条目标题', en: 'Row title' } },
            { name: 'input.detail / groupLabel', type: 'string', def: '—', desc: { zh: '详情文案 / 分组显示名覆盖', en: 'Detail text / group display-name override' } },
            { name: 'handle.update(patch)', type: '(patch: TaskNotificationPatch) => void', def: '—', desc: { zh: '只改纯数据字段，随时可调用', en: 'Updates plain data fields, callable any time' } },
            { name: 'handle.background()', type: '() => void', def: '—', desc: { zh: '标记收起并发 backgrounded 事件，不结算', en: 'Marks the task backgrounded and emits a backgrounded event without settling' } },
            { name: 'handle.done(detail?) / fail(reason?)', type: '(text?: string) => void', def: '—', desc: { zh: '幂等；成功后条目立刻移出池并发 settled 事件', en: 'Idempotent; removes the row immediately and emits a settled event' } },
            { name: 'handle.track(promise)', type: '<T>(promise: Promise<T>) => Promise<T>', def: '—', desc: { zh: '成功与 reject 走同一收尾；返回原 Promise', en: 'Settles on both success and rejection; returns the original promise' } },
            { name: 'handle.settled', type: 'Promise<TaskNotificationSettlement>', def: '—', desc: { zh: '只在真正结束时兑现；收起不兑现', en: 'Resolves only on a real ending, never on collapse' } },
            { name: 'subscribeTaskNotificationEvents(listener)', type: '(listener: TaskNotificationEventListener) => () => void', def: '—', desc: { zh: '监听 registered / updated / backgrounded / settled / restored / peer-left', en: 'Listens for registered / updated / backgrounded / settled / restored / peer-left' } },
            { name: 'createTaskNotificationPool(options?)', type: '(options?: TaskNotificationPoolOptions) => TaskNotificationPool', def: '—', desc: { zh: '独立池；测试可注入 origin / channelName / offline / lifecycle', en: 'Standalone pool; tests can inject origin / channelName / offline / lifecycle' } },
          ],
        },
      ],
      code: [
        { id: 'bt-subscribe-example', lang: 'ts', src: subscribeExample },
        { id: 'bt-lifecycle-example', lang: 'ts', src: lifecycleExample },
      ],
    },
  ],
}

export default doc
