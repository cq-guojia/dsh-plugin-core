# 通知任务中心

> EN: Task Notification Hub

本文件由 `scripts/gen-docs.mjs` 从同名 `.doc.ts` 生成，请勿手改。

导出：notifyTask、notifyMessage、taskNotifications、taskNotificationEvents、TASK_NOTIFICATIONS_LOCK_PREFIX、TASK_NOTIFICATIONS_PROJECT_KEY、setDefaultTaskProject、getDefaultTaskProject、createTaskNotificationPool、createTaskNotificationEventBus、selectTaskNotifications、subscribeTaskNotificationEvents、emitTaskNotificationEvent

## 长耗时任务：登记、订阅、跨页、按钮

> EN: Long tasks: register, subscribe, cross-page, actions

数据只在内存：本页与同源标签页各一份，刷新或关页即失；不落文件、不发请求、不轮询。跨页只传纯数据（结构化克隆可得），不带函数、组件或 Promise。

> EN: Data lives in memory only: one copy per page and per same-origin tab, gone on reload or close — no files, no requests, no polling. Only plain structured-cloneable data crosses pages: no functions, components or promises.

两条通道：**状态池**（`getSnapshot` / `subscribe`，可直接喂 `useSyncExternalStore`）与**事件总线**（`subscribeTaskNotificationEvents`，一次性事实，不留存）。要进列表、能被结束的用 `notifyTask`；只播一句、不进列表的用 `notifyMessage`。

> EN: Two channels: the **pool** (`getSnapshot` / `subscribe`, feeds `useSyncExternalStore`) and the **event bus** (`subscribeTaskNotificationEvents`, one-off facts, no history). Use `notifyTask` for rows that appear in the list and can be ended; `notifyMessage` for a one-off announcement that stays out of it.

按钮：要给后台条目加「拉回来」这类操作，就传 `actions: [{ label, run }]`。方法留在创建页内存里，记录只带文案，所以别的标签页也画得出按钮，点击会发回创建页执行。

> EN: Actions: to give a backgrounded row something to do, pass `actions: [{ label, run }]`. The method stays in the creating page's memory and only labels cross pages, so other tabs can render the buttons and a click is executed back on the creating page.

其余约定：`detail` 收任意 JSON 值（函数与类实例当场抛错）；`icon` / `iconSvg` 只是字符串，渲染与注入安全由消费端负责；两级分组用 `project`（`setDefaultTaskProject()` 设一次）+ `group`（缺省 `default`）。

> EN: The rest: `detail` takes any JSON value (functions and class instances throw immediately); `icon` / `iconSvg` are plain strings and rendering plus injection safety are the consumer's job; two-level grouping uses `project` (set once via `setDefaultTaskProject()`) plus `group` (default `default`).

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `taskNotifications` | `TaskNotificationPool` | — | 全局单例 | 同页所有副本共享的池；惰性创建，首次使用才占用全局键 | Pool shared by all copies on the page; lazy, claims the global key on first use |
| `setDefaultTaskProject(project)` | `(project: string \| undefined) => void` | app 入口调一次 | — | 设一级分组（项目）；挂在全局符号上，同页所有副本共享；传 undefined 清空（测试用） | Sets the first-level project on a global symbol so every copy on the page shares it; pass undefined to clear it (tests) |
| `getDefaultTaskProject()` | `() => string \| undefined` | — | undefined | 读当前默认项目 | Reads the current default project |
| `notifyTask(title, options?)` | `(title: string, options?: NotifyTaskOptions) => TaskNotificationHandle` | — | — | 日常入口：项目取全局默认、二级分组取 options.group（缺省 default）；需要对象参数或池级能力时用 register | Everyday entry: project from the global default, group from options.group (default "default"); reach for register when you need an options object or pool-level control |
| `notifyTask.run(title, work, options?)` | `<T>(title: string, work: Promise<T> \| (() => Promise<T>), options?: NotifyTaskOptions) => Promise<T>` | — | — | 包住一段异步：成功 done、失败 fail，结果与异常原样透传 | Wraps an async task: done on success, fail on rejection, passing the result and error through |
| `notifyMessage(title, options?)` | `(title: string, options?: NotifyMessageOptions) => TaskNotificationMessage` | — | — | 纯广播：只发 message 事件，不进池、不动快照，因此列表不会闪 | Pure broadcast: emits a message event only, writes no pool state and leaves the snapshot alone, so the list cannot flash |
| `getSnapshot()` | `() => TaskNotificationSnapshot` | — | — | 当前全量快照，引用稳定；可直接作 useSyncExternalStore 的第二参 | Current full snapshot with a stable reference; use as the second useSyncExternalStore argument |
| `getServerSnapshot()` | `() => TaskNotificationSnapshot` | — | 冻结空快照 | SSR / 非宿主环境用，永远是同一个对象 | For SSR and non-host environments; always the same object |
| `subscribe(listener)` | `(listener: () => void) => () => void` | — | — | 状态真变了才通知；返回退订函数 | Notifies only on real state changes; returns an unsubscribe function |
| `connect()` | `() => void` | — | — | 幂等；开跨页通道并请求一次全量 baseline | Idempotent; opens the cross-page channel and requests one full baseline |
| `refresh()` | `() => void` | — | — | 重新向同源标签页要一次全量状态；休眠恢复时自动触发，平时不用手动调 | Re-requests a full snapshot from same-origin tabs; runs automatically after sleep, no manual call needed |
| `select(groups?, options?)` | `(groups?: TaskNotificationGroupFilter, options?: TaskNotificationSelectOptions) => readonly TaskNotificationRecord[]` | — | 不传 = 本项目全部二级 | 池内自带缓存的过滤；与 selectTaskNotifications 同一套三档语义 | Cached pool-level filtering; same three-tier contract as selectTaskNotifications |
| `register(input)` | `(input: TaskNotificationInput) => TaskNotificationHandle` | — | — | 登记一条真实任务并返回句柄 | Registers a real task and returns its handle |
| `settleLocal(reason?)` | `(reason?: string) => number` | — | — | 结束本页仍持有的全部任务并返回条数，不需要句柄；跨页条目不动 | Ends every task this page still owns and returns the count without needing a handle; rows from other pages are untouched |
| `runAction(taskId, index)` | `(taskId: string, index: number) => Promise<boolean>` | — | — | 执行第 index 个按钮：本页立即执行，跨页发回创建页并等 ack（2s 超时）。查不到方法、越界、抛错一律 false | Runs the index-th action: locally at once, or back on the owning page with an ack (2s timeout). Missing method, out-of-range index and throwing actions all resolve false |
| `canRestore(task)` | `(task: TaskNotificationRecord) => boolean` | — | — | 旧 restored 通道的判据，只对本页条目为真；它不决定按钮能不能点（那看 record.actions） | Judgement for the legacy restored channel, true only for rows of this page; it does not decide buttons (record.actions does) |
| `requestRestore(taskId)` | `(taskId: string) => boolean` | — | — | 只发本地 restored 事件，跨页返回 false；新代码用 actions + runAction | Emits a local restored event only and returns false for cross-page rows; new code uses actions + runAction |
| `dispose()` | `() => void` | — | — | 关通道与摘监听，保留状态，下次 connect 会复活并重发分片；按钮方法随之清空，存活条目的按钮从此刻起不可执行 | Closes the channel and detaches listeners but keeps state; the next connect revives it and rebroadcasts a shard. Action methods are dropped, so surviving rows stay unclickable from then on |

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `input.project` | `string` | 二者必有一个 | 全局默认项目 | 一级分组；不传则取 setDefaultTaskProject 的值，两者都没有就抛错 | First-level project; falls back to setDefaultTaskProject, and throws when neither exists |
| `input.group` | `string` | — | 'default' | 二级分组：项目内的分类；不能是空字符串 | Second-level bucket inside the project; must not be empty |
| `input.title` | `string` | 必填 | — | 条目标题 | Row title |
| `input.hidden` | `boolean` | — | false | 不进默认列表；开了之后默认 5 分钟兜底。可在 `update` 里切换（传 false 能取消） | Kept out of the default list; hidden rows default to a 5-minute TTL. Switchable through `update` (false un-hides) |
| `input.timeoutMs` | `number` | — | hidden ? 5 分钟 : 0 | 回收窗口，从最后一次活动起算；必须是有限数且 ≥ 0，0 表示永不回收 | Reclamation window counted from the last activity; must be finite and ≥ 0, where 0 means never |
| `input.detail` | `TaskNotificationDetail` | — | — | 任意 JSON 值（对象 / 数组 / 数字 / 布尔 / null）；入池前克隆私有副本，函数与类实例当场抛错 | Any JSON value (object / array / number / boolean / null); cloned into a private copy on the way in, while functions and class instances throw immediately |
| `input.actions` | `readonly TaskNotificationAction[]` | — | — | 按钮：`{ label, run }` 数组，run 是匿名函数、不进池不过线，只在创建页执行；label 为空或 run 不是函数时注册当场抛错 | Actions: an array of `{ label, run }`; run is an anonymous function that never enters the pool or the wire and runs only on the creating page. An empty label or a non-function run throws at registration |
| `record.actions` | `readonly { label: string }[] \| undefined` | — | undefined | 跨页可见的只有按钮文案，下标即动作 id；没有按钮的记录不带这个字段 | Only labels cross pages, and the index is the action id; rows without actions carry no such field |
| `input.projectLabel / groupLabel` | `string` | — | — | 项目 / 分组的显示名覆盖 | Project / group display-name overrides |
| `handle.update(patch)` | `(patch: TaskNotificationPatch) => void` | — | — | 只改纯数据字段，随时可调用；actions 注册时定型，不能改 | Updates plain data fields, callable any time; actions are fixed at registration and cannot change |
| `handle.background()` | `() => void` | — | — | 标记收起并发 backgrounded 事件，不结算 | Marks the task backgrounded and emits a backgrounded event without settling |
| `handle.done(detail?) / fail(reason?)` | `(detail?: TaskNotificationDetail) => void` | — | — | 幂等；成功后条目立刻移出池并发 settled 事件 | Idempotent; removes the row immediately and emits a settled event |
| `handle.track(promise)` | `<T>(promise: Promise<T>) => Promise<T>` | — | — | 句柄已在手时的兜底收尾；返回原 Promise。包一段异步的日常写法是 notifyTask.run | Fallback settlement when the handle is already in hand; returns the original promise. The everyday way to wrap async work is notifyTask.run |
| `handle.settled` | `Promise<TaskNotificationSettlement>` | — | — | 只在真正结束时兑现；收起不兑现 | Resolves only on a real ending, never on collapse |
| `subscribeTaskNotificationEvents(listener)` | `(listener: TaskNotificationEventListener) => () => void` | — | — | 监听 registered / updated / backgrounded / settled / message / restored / peer-left | Listens for registered / updated / backgrounded / settled / message / restored / peer-left |
| `createTaskNotificationPool(options?)` | `(options?: TaskNotificationPoolOptions) => TaskNotificationPool` | — | — | 独立池；测试可注入 origin / channelName / offline / lifecycle / locks（locks: null 关掉失联清理） | Standalone pool; tests can inject origin / channelName / offline / lifecycle / locks (locks: null disables dead-page cleanup) |
| `TASK_NOTIFICATIONS_LOCK_PREFIX` | `string` | — | — | 存活锁名前缀，后接本页 origin；协议升级时随键一起换命名空间 | Liveness lock-name prefix, followed by the page origin; the protocol bump carries it to a new namespace |

```ts id="bt-actions-example"
import { notifyTask, taskNotifications } from 'dsh-plugin-core/ui'

// ① 弹窗这边：按钮名 + 点它干什么。run 写匿名函数就行，不用起名
const handle = notifyTask('收到确认', {
  actions: [
    { label: '重新打开', run: () => reopenDialog() },
    { label: '知道了', run: () => handle.done() },
  ],
})
handle.background()

// ② 通知中心这边：文案是 task.actions[i].label，点击按下标调
//    方法本身留在创建它的页面里，不会随记录传过来
const ok = await taskNotifications.runAction(handle.id, 0)
if (!ok) showToast('该任务已无法还原')   // showToast 由调用方提供
```

```ts id="bt-lifecycle-example"
import { notifyTask, notifyMessage, setDefaultTaskProject } from 'dsh-plugin-core/ui'

setDefaultTaskProject('dsh-task-reminder')   // app 入口设一次

// ① 自己管结束
const handle = notifyTask('扫描工作区文件', { group: 'scan', detail: { done: 12, total: 40 } })
handle.update({ detail: { done: 20, total: 40 } })
handle.background()          // 收起到后台：只发 backgrounded 事件，不结算
handle.done('扫描完成')

// ② 包住一段异步：成功 done、失败 fail，结果与异常原样透传
await notifyTask.run('扫描工作区文件', () => runWork(), { group: 'scan' })

// ③ 只广播一句：不进列表、不闪
notifyMessage('已保存', { group: 'notice', icon: 'check', level: 'success' })
```

```ts id="bt-subscribe-example"
import { useSyncExternalStore } from 'react'
import { taskNotifications, selectTaskNotifications } from 'dsh-plugin-core/ui'

// 快照可直接喂 useSyncExternalStore；三个参数都给，SSR / 非宿主环境不炸
const snapshot = useSyncExternalStore(
  taskNotifications.subscribe,
  taskNotifications.getSnapshot,
  taskNotifications.getServerSnapshot,
)

// 三档：不传 = 本项目全部二级；数组 = 这几个二级；'*' = 全站
const mine = selectTaskNotifications(snapshot, ['scan'])
const everything = selectTaskNotifications(snapshot, '*')

// 幂等：开同源标签页通道并要一次全量 baseline
taskNotifications.connect()
```

## 更新日志

本文件为生成投影，变更记录在同名 `.doc.ts` 真源与本仓 git 历史。
