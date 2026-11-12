<!-- 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改；改对应的 .doc.ts 后重跑 node scripts/gen-docs.mjs -->

# 通知任务中心

> EN: Task Notification Hub

导出：notifyTask、taskNotifications、taskNotificationEvents、TASK_NOTIFICATIONS_LOCK_PREFIX、createTaskNotificationPool、createTaskNotificationEventBus、selectTaskNotifications、subscribeTaskNotificationEvents、emitTaskNotificationEvent

## 让长耗时任务登记、订阅与跨页可见

> EN: Register, subscribe and observe long-running tasks

两条通道不能互相替代：状态池给任意时刻可读的全量快照，可直接喂 `useSyncExternalStore`；事件总线只投递一次性事实，不留存。新开的页面没听过历史事件，靠 `hello` 换回全量分片补齐；反过来，「收起」是一次性事实，读完快照看不出来，必须监听事件。

> EN: Two channels that do not replace each other: the pool exposes a queryable full snapshot that feeds `useSyncExternalStore`; the event bus delivers one-off facts and keeps no history. A freshly opened page has heard no past events, so `hello` exchanges a full shard as baseline. Conversely, collapsing is a one-off fact invisible in a snapshot — listen to events for it.

数据只在内存：本页与各同源标签页各持一份，进程或页面关闭即失；不落文件、不发请求、不轮询。跨页消息只能是结构化克隆可得的纯数据，不带函数、组件、`ReactNode` 或 Promise。条目一律来自真实注册与真实时钟，库内不含模拟或占位数据。

> EN: Data lives in memory only: one copy per page and per same-origin tab, gone when the process or page closes. No files, no requests, no polling. Cross-page messages are plain structured-cloneable data — no functions, components, `ReactNode` or promises. Every row comes from a real registration and the real clock; the library ships no mock or placeholder data.

快照是 `{ tasks, revision }`，`tasks` 按开始时间再按 id 排序，跨页顺序确定；无变化不产生新对象，`getServerSnapshot()` 永远是同一个冻结空快照。`selectTaskNotifications()` 对同一快照与同一过滤条件返回同一数组。分组名由调用方显式给，`groupLabel` 只覆盖显示名。

> EN: A snapshot is `{ tasks, revision }`; `tasks` sorts by start time then id, so order is identical across pages. No change means no new object, and `getServerSnapshot()` always returns the same frozen empty snapshot. `selectTaskNotifications()` returns the same array for the same snapshot and filter. The caller supplies the group id explicitly; `groupLabel` only overrides the display name.

两个入口分工与 `oraPromise` / `toast.promise` / `withProgress` 一致：`notifyTask(group, title, options?)` 返回句柄，自己收尾；`notifyTask.run(group, title, work)` 包住一段异步，成功与失败自动收尾并透传结果。两者前两参一致，且基础入口的返回类型不随参数变化。需要对象参数或池级能力时仍用 `taskNotifications.register()`。

> EN: The two entries split the work the way `oraPromise` / `toast.promise` / `withProgress` do: `notifyTask(group, title, options?)` returns a handle you settle yourself, while `notifyTask.run(group, title, work)` wraps an async task, settling it either way and passing the result through. Both take the same first two arguments, and the base entry never changes its return type based on its arguments. Use `taskNotifications.register()` when you need an options object or pool-level control.

结束权在调用方：`done()` / `fail()` 幂等，`track(promise)` 让成功与 reject 走同一收尾且返回原 Promise。`settled` 只在任务真正结束时兑现；收起不兑现它，而是发一个 `backgrounded` 事件。这就是「Promise 两态 + 收起作为事件」，调用方 `await` 的仍是正常两态。

> EN: The caller decides when a task ends: `done()` / `fail()` are idempotent, and `track(promise)` settles on both success and rejection while returning the original promise. `settled` resolves only on a real ending; collapsing emits a `backgrounded` event instead. This is the "two-state promise plus collapse as event" contract — callers still await ordinary two-state promises.

跨页走浏览器原生 `BroadcastChannel`：每页广播自己那份全量分片并带单调 `seq`，旧序号、重复与畸形消息一律丢弃；`pagehide` / `pageshow` 覆盖标签页离开、bfcache 与休眠恢复。只覆盖同源标签页，不覆盖不同浏览器、不同 profile 或不同机器。跨页条目能看不能点，只有创建它的那一页能请求还原。

> EN: Cross-page sync uses the native `BroadcastChannel`: each page broadcasts its own full shard with a monotonic `seq`; stale, duplicate and malformed messages are dropped. `pagehide` / `pageshow` cover tab teardown, bfcache and sleep/wake. Only same-origin tabs are covered — not other browsers, profiles or machines. Cross-page rows are read-only; only the owning page may request a restore.

页面消失要有人收尾，否则留下永远 `running` 的僵尸条目：它不属于本页、本页也没有它的句柄，谁都结束不掉。判活用浏览器原生 Web Locks——每页持一把以 origin 命名的锁，其他页用 `ifAvailable` 探测同名锁，立刻拿得到就说明那页已经不在了；探测只发生在收到分片与页面重新可见时，没有定时器，连续两次（间隔 250ms）都拿得到才清。`navigator.locks` 不可用时不清理，其余行为不变。崩溃掉的渲染进程规范不保证释放锁，那类残留留到浏览器重启。

> EN: A vanished page must be cleaned up, otherwise a row stays `running` forever: it belongs to another page, this page holds no handle for it, and nobody can end it. Liveness uses native Web Locks — each page holds a lock named after its origin, and other pages probe the same name with `ifAvailable`: getting it immediately means that page is gone. Probes run only when a shard arrives or the tab becomes visible, never on a timer, and only two successful probes 250ms apart drop a shard. Without `navigator.locks` nothing is cleaned up and everything else stays as before. A crashed renderer is not guaranteed to release its lock by the spec, so that residue lasts until the browser restarts.

句柄会丢：组件重挂载、HMR、页面切走再回来，`useRef` 里的句柄就没了，但条目还在池里。`settleLocal(reason?)` 结束本页仍持有的全部任务并返回条数，不需要句柄；跨页条目一律不动。

> EN: Handles get lost: a component remount, HMR or switching pages clears the `useRef` that held them while the row stays in the pool. `settleLocal(reason?)` ends every task this page still owns and returns the count, without needing a handle; rows owned by other pages are never touched.

同页多副本收口到 `globalThis[Symbol.for(...)]` 上的同一个池与同一条总线，注册与通知不会重复 N 次；键里带协议版本，形状不符直接报错而不是静默降级。本能力是数据面：可收起弹窗、例外控件与事件查看控件不属于它，由后续任务单独提供。

> EN: Multiple copies on one page share a single pool and bus on `globalThis[Symbol.for(...)]`, so registration and notification never fire N times. Keys carry a protocol version; a shape mismatch throws instead of silently degrading. This capability is the data plane only: collapsible dialogs, exception controls and the event-viewer control are out of scope and arrive in separate tasks.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `taskNotifications` | `TaskNotificationPool` | 全局单例 | 同页所有副本共享的池；惰性创建，首次使用才占用全局键 | Pool shared by all copies on the page; lazy, claims the global key on first use |
| `notifyTask(group, title, options?)` | `(group: string, title: string, options?: NotifyTaskOptions) => TaskNotificationHandle` | — | 日常入口：位置参数登记一条任务并返回句柄；需要对象参数或池级能力时用 register | Everyday entry: registers a task positionally and returns its handle; reach for register when you need an options object or pool-level control |
| `notifyTask.run(group, title, work)` | `<T>(group: string, title: string, work: Promise<T> \| (() => Promise<T>)) => Promise<T>` | — | 包住一段异步：成功 done、失败 fail，结果与异常原样透传 | Wraps an async task: done on success, fail on rejection, passing the result and error through |
| `getSnapshot()` | `() => TaskNotificationSnapshot` | — | 当前全量快照，引用稳定；可直接作 useSyncExternalStore 的第二参 | Current full snapshot with a stable reference; use as the second useSyncExternalStore argument |
| `getServerSnapshot()` | `() => TaskNotificationSnapshot` | 冻结空快照 | SSR / 非宿主环境用，永远是同一个对象 | For SSR and non-host environments; always the same object |
| `subscribe(listener)` | `(listener: () => void) => () => void` | — | 状态真变了才通知；返回退订函数 | Notifies only on real state changes; returns an unsubscribe function |
| `connect()` | `() => void` | — | 幂等；开跨页通道并请求一次全量 baseline | Idempotent; opens the cross-page channel and requests one full baseline |
| `refresh()` | `() => void` | — | 重新向同源标签页要一次全量状态；休眠恢复时自动触发，平时不用手动调 | Re-requests a full snapshot from same-origin tabs; runs automatically after sleep, no manual call needed |
| `select(groups?)` | `(groups?: readonly string[]) => readonly TaskNotificationRecord[]` | 不传 = 全站 | 池内自带缓存的过滤；与 selectTaskNotifications 同一套三态 | Cached pool-level filtering; same three-state contract as selectTaskNotifications |
| `register(input)` | `(input: TaskNotificationInput) => TaskNotificationHandle` | — | 登记一条真实任务并返回句柄 | Registers a real task and returns its handle |
| `settleLocal(reason?)` | `(reason?: string) => number` | — | 结束本页仍持有的全部任务并返回条数，不需要句柄；跨页条目不动 | Ends every task this page still owns and returns the count without needing a handle; rows from other pages are untouched |
| `canRestore(task)` | `(task: TaskNotificationRecord) => boolean` | — | 只有本页创建的条目可还原 | Only rows created on this page can be restored |
| `requestRestore(taskId)` | `(taskId: string) => boolean` | — | 发本地 restored 事件；跨页条目返回 false，不跨页传递 | Emits a local restored event; returns false for cross-page rows, never crosses pages |
| `dispose()` | `() => void` | — | 关通道与摘监听，保留状态；下次 connect 会复活并重发全量分片 | Closes the channel and detaches listeners but keeps state; the next connect revives it and rebroadcasts a full shard |

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `input.group` | `string` | 必填 | — | 调用方给的分组 id；core 取不到项目名 | Caller-supplied group id; core cannot discover a project name |
| `input.title` | `string` | 必填 | — | 条目标题 | Row title |
| `input.detail / groupLabel` | `string` | — | — | 详情文案 / 分组显示名覆盖 | Detail text / group display-name override |
| `handle.update(patch)` | `(patch: TaskNotificationPatch) => void` | — | — | 只改纯数据字段，随时可调用 | Updates plain data fields, callable any time |
| `handle.background()` | `() => void` | — | — | 标记收起并发 backgrounded 事件，不结算 | Marks the task backgrounded and emits a backgrounded event without settling |
| `handle.done(detail?) / fail(reason?)` | `(text?: string) => void` | — | — | 幂等；成功后条目立刻移出池并发 settled 事件 | Idempotent; removes the row immediately and emits a settled event |
| `handle.track(promise)` | `<T>(promise: Promise<T>) => Promise<T>` | — | — | 句柄已在手时的兜底收尾；返回原 Promise。包一段异步的日常写法是 notifyTask.run | Fallback settlement when the handle is already in hand; returns the original promise. The everyday way to wrap async work is notifyTask.run |
| `handle.settled` | `Promise<TaskNotificationSettlement>` | — | — | 只在真正结束时兑现；收起不兑现 | Resolves only on a real ending, never on collapse |
| `subscribeTaskNotificationEvents(listener)` | `(listener: TaskNotificationEventListener) => () => void` | — | — | 监听 registered / updated / backgrounded / settled / restored / peer-left | Listens for registered / updated / backgrounded / settled / restored / peer-left |
| `createTaskNotificationPool(options?)` | `(options?: TaskNotificationPoolOptions) => TaskNotificationPool` | — | — | 独立池；测试可注入 origin / channelName / offline / lifecycle / locks（locks: null 关掉失联清理） | Standalone pool; tests can inject origin / channelName / offline / lifecycle / locks (locks: null disables dead-page cleanup) |
| `TASK_NOTIFICATIONS_LOCK_PREFIX` | `string` | — | — | 存活锁名前缀，后接本页 origin；协议升级时随键一起换命名空间 | Liveness lock-name prefix, followed by the page origin; the protocol bump carries it to a new namespace |

```ts id="bt-subscribe-example"
import { useSyncExternalStore } from 'react'
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
// off() 于卸载时调用
```

```ts id="bt-lifecycle-example"
import { notifyTask } from 'dsh-plugin-core/ui'

// 分组名必须由调用方给：core 取不到项目名

// ① 自己管结束：拿到句柄，随时更新，自己收尾
const handle = notifyTask('dsh-task-reminder', '扫描工作区文件', { detail: '已完成 12 / 40' })
handle.background()   // 只发 backgrounded 事件，不结算任务
handle.done('扫描完成')
// handle.fail('被用户取消')

// ② 包住一段异步：成功 done、失败 fail，结果与异常原样透传
await notifyTask.run('dsh-task-reminder', '扫描工作区文件', () => runWork())

// 句柄已经在手时才用得上的兜底：与 run 同一个收尾，不改变原 Promise 的结算语义
// await handle.track(otherWork())   // otherWork(): Promise<void>，由调用方提供
// await handle.settled              // 只在真正结束时兑现；收起不兑现
```
