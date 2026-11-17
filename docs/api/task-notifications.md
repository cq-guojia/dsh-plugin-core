# 后台任务中心

> EN: Background Task Hub

本文件由 `scripts/gen-docs.mjs` 从同名 `.doc.ts` 生成，请勿手改。

导出：notifyTask、notifyMessage、TaskBar、useTasks、taskNotifications、taskKey、StatusRow、StatusSource、TaskNotificationConflictError、taskNotificationEvents、TASK_NOTIFICATIONS_LOCK_PREFIX、TASK_NOTIFICATIONS_PROJECT_KEY、setDefaultTaskProject、getDefaultTaskProject、createTaskNotificationPool、createTaskNotificationEventBus、selectTaskNotifications、subscribeTaskNotificationEvents、emitTaskNotificationEvent

## 长耗时任务：登记、订阅、跨页、按钮

> EN: Long tasks: register, subscribe, cross-page, actions

这里叫**后台任务中心**：它借 runtime 的跨页通知能力搬运状态，本身是「登记 → 订阅 → 结束」的任务池，和「发一条句子就完」的通知是两回事（纯广播看 `notifyMessage`）。默认这条路径不落盘、不发请求：本页与同源标签页各持一份内存投影，刷新即失。要服务端执行、刷新后照常看护的，走下面的**服务端任务**（`notifyTask.background` + 状态源）。跨页只传纯数据（结构化克隆可得），不带函数、组件或 Promise。

> EN: This is the **background task hub**: it borrows the runtime cross-page notification channel to move state around, but it is a "register → subscribe → settle" pool, not a "send one sentence and forget" notification (plain broadcasts are `notifyMessage`). The default path writes nothing and makes no requests: each page and same-origin tab holds an in-memory projection that is gone on reload. For work that runs on a server and stays watched after a reload, use **server-backed tasks** below (`notifyTask.background` + a status source). Only plain structured-cloneable data crosses pages: no functions, components or promises.

两条通道：**状态池**（`getSnapshot` / `subscribe`，可直接喂 `useSyncExternalStore`）与**事件总线**（`subscribeTaskNotificationEvents`，一次性事实，不留存）。要进列表、能被结束的用 `notifyTask`；只播一句、不进列表的用 `notifyMessage`。

> EN: Two channels: the **pool** (`getSnapshot` / `subscribe`, feeds `useSyncExternalStore`) and the **event bus** (`subscribeTaskNotificationEvents`, one-off facts, no history). Use `notifyTask` for rows that appear in the list and can be ended; `notifyMessage` for a one-off announcement that stays out of it.

按钮：要给后台条目加「拉回来」这类操作，就传 `actions: [{ label?, icon?, color?, run }]`（`label` 与 `icon` 至少给一个）。方法留在创建页内存里，记录只带文案 / 图标标识 / 颜色，所以别的标签页也画得出按钮，点击会发回创建页执行。一条记录可带多颗按钮，展示方按顺序全画出来；只给 `icon` 的那颗是正方形图标钮。

> EN: Actions: to give a backgrounded row something to do, pass `actions: [{ label?, icon?, color?, run }]` (at least one of `label` and `icon`). The method stays in the creating page's memory and only labels, icon ids and colors cross pages, so other tabs can render the buttons and a click is executed back on the creating page. A record may carry several buttons; the renderer draws them all in order, and an icon-without-label one becomes a square icon button.

业务键：`key` 让登记变成幂等 —— 同一个键在池里最多一条。同页重复登记就地更新那条并返回同一个句柄，别的页面占着同一个键则抛 `TaskNotificationConflictError`（作业在它那一页，给了也点不动）。键只能用稳定值：`['close', workspaceId, taskId]` 对，带时间 / 随机数 / 进度文案进去就等于每次都新开一条。想知道「这条是不是我刚起的」用 `notifyTask.ensure()` 的 `created`。

> EN: Business key: `key` makes registration idempotent — at most one row per key. Re-registering on the same page updates that row in place and returns the same handle; a key held by another page throws `TaskNotificationConflictError` (the work lives there, so a handle would be a dead button). Keys must be stable values: `['close', workspaceId, taskId]` works, while timestamps, randomness or progress text mean a brand-new row every time. Use `created` from `notifyTask.ensure()` to tell whether you started it.

其余约定：`detail` 收任意 JSON 值（函数与类实例当场抛错）；`icon` / `iconSvg` 只是字符串，渲染与注入安全由消费端负责；两级分组用 `project`（`setDefaultTaskProject()` 设一次）+ `group`（缺省 `default`）。

> EN: The rest: `detail` takes any JSON value (functions and class instances throw immediately); `icon` / `iconSvg` are plain strings and rendering plus injection safety are the consumer's job; two-level grouping uses `project` (set once via `setDefaultTaskProject()`) plus `group` (default `default`).

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `taskNotifications` | `TaskNotificationPool` | — | 全局单例 | 同页所有副本共享的池；惰性创建，首次使用才占用全局键 | Pool shared by all copies on the page; lazy, claims the global key on first use |
| `setDefaultTaskProject(project)` | `(project: string \| undefined) => void` | app 入口调一次 | — | 设一级分组（项目）；挂在全局符号上，同页所有副本共享；传 undefined 清空（测试用） | Sets the first-level project on a global symbol so every copy on the page shares it; pass undefined to clear it (tests) |
| `getDefaultTaskProject()` | `() => string \| undefined` | — | undefined | 读当前默认项目 | Reads the current default project |
| `notifyTask(title, options?)` | `(title: string, options?: NotifyTaskOptions) => TaskNotificationHandle` | — | — | 日常入口：项目取全局默认、二级分组取 options.group（缺省 default）；需要对象参数或池级能力时用 register | Everyday entry: project from the global default, group from options.group (default "default"); reach for register when you need an options object or pool-level control |
| `notifyTask.ensure(title, options?)` | `(title: string, options?: NotifyTaskOptions) => { handle: TaskNotificationHandle; created: boolean }` | — | — | 幂等登记：带 key 时本页已有同键条目就地复用并返回同一个句柄；`created === false` 说明已经在跑，别再起第二份活 | Idempotent registration: with a key, a matching row on this page is reused and the same handle comes back. `created === false` means it is already running, so do not start a second job |
| `notifyTask.run(title, work, options?)` | `<T>(title: string, work: Promise<T> \| (() => Promise<T>), options?: NotifyTaskOptions) => Promise<T>` | — | — | 包住一段异步：成功 done、失败 fail，结果与异常原样透传；带 key 撞上已在跑的同键则 reject（不调用 work） | Wraps an async task: done on success, fail on rejection, passing the result and error through. A key already running rejects without calling work |
| `notifyMessage(title, options?)` | `(title: string, options?: NotifyMessageOptions) => TaskNotificationMessage` | — | — | 纯广播：只发 message 事件，不进池、不动快照，因此列表不会闪 | Pure broadcast: emits a message event only, writes no pool state and leaves the snapshot alone, so the list cannot flash |
| `getSnapshot()` | `() => TaskNotificationSnapshot` | — | — | 当前全量快照，引用稳定；可直接作 useSyncExternalStore 的第二参 | Current full snapshot with a stable reference; use as the second useSyncExternalStore argument |
| `getServerSnapshot()` | `() => TaskNotificationSnapshot` | — | 冻结空快照 | SSR / 非宿主环境用，永远是同一个对象 | For SSR and non-host environments; always the same object |
| `subscribe(listener)` | `(listener: () => void) => () => void` | — | — | 状态真变了才通知；返回退订函数 | Notifies only on real state changes; returns an unsubscribe function |
| `connect()` | `() => void` | — | — | 幂等；开跨页通道并请求一次全量 baseline | Idempotent; opens the cross-page channel and requests one full baseline |
| `refresh()` | `() => void` | — | — | 重新向同源标签页要一次全量状态；休眠恢复时自动触发，平时不用手动调 | Re-requests a full snapshot from same-origin tabs; runs automatically after sleep, no manual call needed |
| `select(groups?, options?)` | `(groups?: TaskNotificationGroupFilter, options?: TaskNotificationSelectOptions) => readonly TaskNotificationRecord[]` | — | 不传 = 本项目全部二级 | 池内自带缓存的过滤；与 selectTaskNotifications 同一套三档语义 | Cached pool-level filtering; same three-tier contract as selectTaskNotifications |
| `register(input)` | `(input: TaskNotificationInput) => TaskNotificationHandle` | — | — | 登记一条真实任务并返回句柄；带 key 时同页重复登记就地复用（只要句柄、不要 created 就用它） | Registers a real task and returns its handle; with a key, a repeat on the same page reuses the row (use it when you need the handle but not created) |
| `ensure(input)` | `(input: TaskNotificationInput) => TaskNotificationClaim` | — | — | 同上，另交回 `created`：false = 本页已有同键任务，别起第二份活 | Same as register, plus `created`: false means this page already has that key, so do not start a second job |
| `settleLocal(reason?)` | `(reason?: string) => number` | — | — | 结束本页仍持有的全部任务并返回条数，不需要句柄；跨页条目不动 | Ends every task this page still owns and returns the count without needing a handle; rows from other pages are untouched |
| `runAction(taskId, index)` | `(taskId: string, index: number) => Promise<boolean>` | — | — | 执行第 index 个按钮：本页立即执行，跨页发回创建页并等 ack（2s 超时）。查不到方法、越界、抛错一律 false | Runs the index-th action: locally at once, or back on the owning page with an ack (2s timeout). Missing method, out-of-range index and throwing actions all resolve false |
| `canRestore(task)` | `(task: TaskNotificationRecord) => boolean` | — | — | 旧 restored 通道的判据，只对本页条目为真；它不决定按钮能不能点（那看 record.actions） | Judgement for the legacy restored channel, true only for rows of this page; it does not decide buttons (record.actions does) |
| `requestRestore(taskId)` | `(taskId: string) => boolean` | — | — | 只发本地 restored 事件，跨页返回 false；新代码用 actions + runAction | Emits a local restored event only and returns false for cross-page rows; new code uses actions + runAction |
| `dispose()` | `() => void` | — | — | 关通道与摘监听、停掉心跳定时器，在途探测的结果也一律丢弃（卸载后不改状态）；保留池状态，下次 connect 会复活并重发分片；按钮方法随之清空，存活条目的按钮从此刻起不可执行 | Closes the channel, detaches listeners and stops the heartbeat timer; an in-flight probe result is also discarded so nothing changes state after unload. Pool state is kept and the next connect revives it and rebroadcasts a shard. Action methods are dropped, so surviving rows stay unclickable from then on |

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `input.project` | `string` | 二者必有一个 | 全局默认项目 | 一级分组；不传则取 setDefaultTaskProject 的值，两者都没有就抛错 | First-level project; falls back to setDefaultTaskProject, and throws when neither exists |
| `input.group` | `string` | — | 'default' | 二级分组：项目内的分类；不能是空字符串 | Second-level bucket inside the project; must not be empty |
| `input.key` | `string \| readonly (string \| number)[]` | — | — | 业务键：唯一性范围是 (project, key)；字符串原样用，元组按元素归一化成稳定串。只收扁平原值，空串 / 空数组 / 对象 / NaN 当场抛错 | Business key, unique per (project, key). Strings are used verbatim; tuples are normalized element-wise into a stable string. Flat primitives only — empty strings, empty arrays, objects and NaN throw immediately |
| `input.title` | `string` | 必填 | — | 条目标题 | Row title |
| `input.hidden` | `boolean` | — | false | 不进默认列表，**只表达这一件事**（回收见 `timeoutMs`）。可在 `update` 里切换（传 false 能取消） | Kept out of the default list — that is all it means (see `timeoutMs` for reclamation). Switchable through `update` (false un-hides) |
| `input.timeoutMs` | `number` | — | 0 | 回收窗口，从最后一次活动起算；必须是有限数且 ≥ 0，**缺省 0 = 不回收**（与 hidden 无关）。给了窗口就有定时器到点自动结算为 `failed('timed out')` 并移出列表，不用等下一次写入；每次 update / background 都续期。会自己跑完的短任务想兜底就显式给一个值；作业型任务别给，否则作业还在跑就先被判失败 | Reclamation window counted from the last activity; must be finite and ≥ 0, and defaults to 0 = never (independent of hidden). With a window, a timer settles the row as `failed('timed out')` and removes it without waiting for another write; every update / background renews it. Short self-terminating tasks may pass a value as a backstop; long jobs must not, or the row is failed while the work still runs |
| `input.detail` | `TaskNotificationDetail` | — | — | 任意 JSON 值（对象 / 数组 / 数字 / 布尔 / null）；入池前克隆私有副本，函数与类实例当场抛错 | Any JSON value (object / array / number / boolean / null); cloned into a private copy on the way in, while functions and class instances throw immediately |
| `input.actions` | `readonly TaskNotificationAction[]` | — | — | 按钮：`{ label?, icon?, color?, run }` 数组，`label` 与 `icon` 至少给一个；run 是匿名函数、不进池不过线，只在创建页执行；`color` 是任意 CSS 色值，不传由展示方用默认档；两者都空、run 不是函数或 color 传了空串时注册当场抛错 | Actions: an array of `{ label?, icon?, color?, run }` with at least one of label and icon; run is an anonymous function that never enters the pool or the wire and runs only on the creating page. `color` is any CSS color, omitted means the renderer default. Both label and icon empty, a non-function run or a blank color throws at registration |
| `record.actions` | `readonly { label?: string; icon?: string; color?: string }[] \| undefined` | — | undefined | 跨页可见的只有文案 / 图标标识 / 颜色，下标即动作 id；没有按钮的记录不带这个字段 | Only labels, icon ids and colors cross pages, and the index is the action id; rows without actions carry no such field |
| `record.key` | `string \| undefined` | — | undefined | 归一化后的业务键；读侧拿它判断「这个任务是不是已经在处理中」，比对自己的键要用 `taskKey()` 算一次，别手拼 | The normalized business key; the read side uses it to tell whether the work is already running. Compare with your own key through `taskKey()` instead of hand-joining strings |
| `taskKey(key)` | `(key: TaskKey) => string` | — | — | 把业务键归一化成池里存的那串（元组 → `#` + JSON，字符串原样）；读写两侧用同一份才不会对不上 | Normalizes a business key into the stored form (tuples become # + JSON, strings stay verbatim); both sides must use it or they will disagree |
| `TaskNotificationConflictError` | `class extends Error` | — | — | 同键已在别的页面登记时抛出；带 `code`（值为 TASK_NOTIFICATION_CONFLICT）、`key` 与 `ownerOrigin`。判冲突用 `code`（core 被打进每个插件副本，跨副本 `instanceof` 不可靠） | Thrown when another page holds the key; carries `code` (TASK_NOTIFICATION_CONFLICT), `key` and `ownerOrigin`. Judge by `code`, since core is inlined into each plugin bundle and `instanceof` is unreliable across copies |
| `input.projectLabel / groupLabel` | `string` | — | — | 项目 / 分组的显示名覆盖 | Project / group display-name overrides |
| `handle.update(patch)` | `(patch: TaskNotificationPatch) => void` | — | — | 只改纯数据字段，随时可调用；按钮改不了 —— 换一组要带同一个 key 重新登记 | Updates plain data fields, callable any time. Buttons cannot change through it — re-register with the same key to swap them |
| `handle.background()` | `() => void` | — | — | 标记收起并发 backgrounded 事件，不结算；UI 侧由 Modal 的 onBackground 接入 | Marks the task backgrounded and emits a backgrounded event without settling; wired from the UI via Modal.onBackground |
| `handle.done(detail?) / fail(reason?)` | `(detail?: TaskNotificationDetail) => void` | — | — | 幂等；成功后条目立刻移出池并发 settled 事件 | Idempotent; removes the row immediately and emits a settled event |
| `handle.track(promise)` | `<T>(promise: Promise<T>) => Promise<T>` | — | — | 句柄已在手时的兜底收尾；返回原 Promise。包一段异步的日常写法是 notifyTask.run | Fallback settlement when the handle is already in hand; returns the original promise. The everyday way to wrap async work is notifyTask.run |
| `handle.settled` | `Promise<TaskNotificationSettlement>` | — | — | 只在真正结束时兑现；收起不兑现 | Resolves only on a real ending, never on collapse |
| `subscribeTaskNotificationEvents(listener)` | `(listener: TaskNotificationEventListener) => () => void` | — | — | 监听 registered / updated / backgrounded / settled / message / restored / peer-left | Listens for registered / updated / backgrounded / settled / message / restored / peer-left |
| `createTaskNotificationPool(options?)` | `(options?: TaskNotificationPoolOptions) => TaskNotificationPool` | — | — | 独立池；测试可注入 origin / channelName / offline / lifecycle / locks（locks: null 关掉失联清理） | Standalone pool; tests can inject origin / channelName / offline / lifecycle / locks (locks: null disables dead-page cleanup) |
| `TASK_NOTIFICATIONS_LOCK_PREFIX` | `string` | — | — | 存活锁名前缀，后接本页 origin；协议升级时随键一起换命名空间 | Liveness lock-name prefix, followed by the page origin; the protocol bump carries it to a new namespace |

```ts id="bt-keyed-example"
import { notifyTask, taskKey, taskNotifications } from 'dsh-plugin-core/adv/tasks'

// 键 = 「让这两条算同一件事」的那几个值。稳定、可枚举，不放时间 / 随机数 / 进度文案。
const key = ['close', workspaceId, taskId]

// ① 只是要它在那儿：反复登记也只有一条，内容按最后一次刷新，句柄还是同一个
const handle = notifyTask('正在结案', { key, timeoutMs: 30 * 60_000 })
handle.done('已结案')

// ② 还要知道「是不是我刚起的」：created === false 说明本页已经在跑，别再起第二份活
const task = notifyTask.ensure('正在结案', { key })
if (task.created) void closeTask(workspaceId, taskId).finally(() => task.handle.done())

// ③ 读侧判断「这个任务是不是已经在处理中」：记录带着归一化后的键
const running = taskNotifications.select('*').some((t) => t.key === taskKey(key))
```

```ts id="bt-actions-example"
import { notifyTask, taskNotifications } from 'dsh-plugin-core/adv/tasks'

// ① 弹窗这边：按钮名 + 点它干什么。run 写匿名函数就行，不用起名
//    color 可选：不传用展示方的默认档（灰底），传了就是该按钮的底色
//    icon 可选：只给 icon 不给 label，展示方会画成正方形图标钮
const handle = notifyTask('收到确认', {
  actions: [
    { label: '重新打开', run: () => reopenDialog() },
    { label: '知道了', color: '#16a34a', icon: 'common.base:gou', run: () => handle.done() },
    { icon: 'common.base:shuaxin', run: () => reload() },
  ],
})
handle.background()

// ② 通知中心这边：文案是 task.actions[i].label，点击按下标调
//    方法本身留在创建它的页面里，不会随记录传过来
const ok = await taskNotifications.runAction(handle.id, 0)
if (!ok) showToast('该任务已无法还原')   // showToast 由调用方提供
```

```ts id="bt-lifecycle-example"
import { notifyTask, setDefaultTaskProject } from 'dsh-plugin-core/adv/tasks'

setDefaultTaskProject('dsh-task-reminder')   // app 入口设一次

// ① 自己管结束
const handle = notifyTask('扫描工作区文件', { group: 'scan', detail: { done: 12, total: 40 } })
handle.update({ detail: { done: 20, total: 40 } })
handle.background()          // 收起到后台：只发 backgrounded 事件，不结算
handle.done('扫描完成')

// ② 包住一段异步：成功 done、失败 fail，结果与异常原样透传
await notifyTask.run('扫描工作区文件', () => runWork(), { group: 'scan' })
```

```ts id="bt-subscribe-example"
import { useSyncExternalStore } from 'react'
import { taskNotifications, selectTaskNotifications } from 'dsh-plugin-core/adv/tasks'

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

## 服务端任务：状态源、双时钟与幂等

> EN: Server-backed tasks: status source, two clocks and idempotency

服务端执行的长任务用 `notifyTask.background(title, options)` 登记，它等价于 `ensure` 加 `serverBacked: true`，必须有稳定的 `key`。作业**一开始就登记**，不等用户「收起」——收起只是关前端展示。每个项目注册**一个**批量状态源 `setStatusSource(project, (keys) => StatusRow[])`，核心按 `min(轮询周期, 租约/2)` 一次问该项目全部在跑的 key，不是逐任务轮询。拿到 `running` 续租，`done` / `failed` 立即结算；状态源抛错或漏 key 都只算本轮没确认，不误杀、也不续租。

> EN: Register long server-side jobs with `notifyTask.background(title, options)` — the same as `ensure` plus `serverBacked: true`, and a stable `key` is required. Register the job **when it starts**, not when the user collapses the UI; collapsing only hides the front end. Register **one** batch status source per project via `setStatusSource(project, (keys) => StatusRow[])`. The core asks all running keys of that project in one call every `min(poll interval, lease/2)` — never per-task. `running` renews the lease, `done`/`failed` settles at once; a thrown or incomplete reply counts as "not confirmed this round" — no false kill, no renewal.

双时钟：`leaseMs`（缺省 5 分钟）是**可续**短租约，从最后一次确认起算，发现「不再证明活着」的作业；`maxDurationMs`（缺省 0 = 不限）从 `startedAt` 起算，**续租不重置**，到点无条件结算为 `failed(max duration exceeded)`，拦住无限续命的僵尸。只有持有执行权的本页会探测与结算；别的标签页只是投影。卸载调 `dispose()` 会一并停掉探测与租约定时器。at-least-once 是前提：服务端处理器必须幂等，`key` 只防重复提交、不替代幂等。

> EN: Two clocks: `leaseMs` (default 5 min) is the **renewable** short lease counted from the last confirmation, catching work that stops proving it is alive; `maxDurationMs` (default 0 = unlimited) counts from `startedAt` and is **not reset by renewal**, settling as `failed(max duration exceeded)` on arrival to stop immortal zombies. Only the owning page probes and settles; other tabs are projections. `dispose()` stops both the probe and lease timers. Delivery is at-least-once: server handlers must be idempotent, and `key` only prevents duplicate submission — it does not replace idempotency.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `notifyTask.background(title, options?)` | `(title: string, options?: NotifyTaskOptions) => TaskNotificationClaim` | — | 登记服务端任务（= ensure + serverBacked）；必须有 key。`created === false` 时不要起第二份服务端作业 | Registers a server-backed task (= ensure + serverBacked); a key is required. When `created === false`, do not start a second server job |
| `taskNotifications.setStatusSource(project, source)` | `(project: string, source: StatusSource) => void` | — | 按项目注册一个批量状态源，后者覆盖前者；source 签名 (keys) => StatusRow[] \| Promise<StatusRow[]> | Registers one batch status source per project, later ones replace earlier; source is (keys) => StatusRow[] \| Promise<StatusRow[]> |
| `StatusRow` | `{ key: string; state: "running" \| "done" \| "failed"; reason?: string }` | — | 状态源回报的一行：key 是归一化后的业务键，state 决定续租或结算，reason 是失败原因 | One row from a status source: key is the normalized business key, state decides renewal or settlement, reason is the failure text |
| `input.serverBacked` | `boolean` | false | 标为服务端任务：必须有 key，由状态源看护而非 timeoutMs 回收 | Marks a server-backed task: requires a key, watched by a status source instead of timeoutMs |
| `input.leaseMs` | `number` | 300000 | 可续短租约（毫秒），从最后一次确认起算；必须 > 0。轮询周期取 min(60s, leaseMs/2) | Renewable short lease in ms from the last confirmation; must be > 0. Poll interval is min(60s, leaseMs/2) |
| `input.maxDurationMs` | `number` | 0 | 总执行上限（毫秒），从 startedAt 算、续租不重置；0 = 不设上限。到点结算为 failed(max duration exceeded) | Total execution cap in ms from startedAt, never reset by renewal; 0 = no cap. On arrival settles as failed(max duration exceeded) |
| `handle.touch()` | `() => void` | — | 可选加速：把租约从现在起算；只对服务端任务有效，不调用也不影响 pull 看护 | Optional acceleration: renews the lease from now; only for server-backed tasks, and skipping it does not affect pull watching |

```ts id="bt-server-example"
import {
  taskNotifications,
  notifyTask,
  type StatusRow,
} from 'dsh-plugin-core/adv/tasks'

// ① 每个项目注册一个批量状态源：核心周期性调用，一次问该项目全部在跑的 key。
//    响应询问是必须实现的；抛错 / 漏 key 都只算本轮没确认，租约会兜底。
taskNotifications.setStatusSource('dsh-task-dispatch-table', async (keys) => {
  const rows = await api.queryJobsByKeys(keys)   // api 由消费方提供
  return rows.map((row) => ({
    key: row.key,
    state: row.state,                            // 'running' | 'done' | 'failed'
    ...(row.reason ? { reason: row.reason } : {}),
  })) satisfies StatusRow[]
})

// ② 作业一开始就登记，不等用户「收起」。created === false 就别起第二份作业。
const claim = notifyTask.background('正在结案', {
  key: ['close', workspaceId, taskId],
  group: 'close',
  detail: { workspaceId, taskId },               // 展示用；后端任务号存服务端
  leaseMs: 5 * 60_000,                           // 可续短租约，缺省 5 分钟
  maxDurationMs: 30 * 60_000,                    // 总上限，从 startedAt 算、续租不重置
})
if (!claim.created) return
await api.submitCloseJob({ workspaceId, taskId })

// ③ 可选加速：主动续租 / 改展示数据。不写也能靠 pull 正常看护。
claim.handle.touch()
claim.handle.update({ detail: { phase: '正在写回' } })
// 结束时由状态源回报 done / failed，核心据此结算（不要在状态源里替核心结算）。
```

## 服务端权威任务：恢复、判死与命令

> EN: Authoritative server tasks: recovery, watchdog and commands

旧的状态源模式只是「按已知 key 问服务端」：页面全关后拿不到 key，刷新会把时钟从零算起，按钮 handler 也随页面销毁。要完整恢复，改用 `taskNotifications.setTaskBackend(project, backend)` + `notifyTask.server(title, options)`。后端必须提供 `list / follow / listNotices / ackNotices / invoke / ack` 六个能力，缺一即注册失败——不做静默降级。

> EN: The status-source mode only asks the server about keys it already knows: after every page closes there are no keys, a reload restarts the clock, and action handlers die with the page. For full recovery use `taskNotifications.setTaskBackend(project, backend)` plus `notifyTask.server(title, options)`. A backend must provide `list / follow / listNotices / ackNotices / invoke / ack`; registering otherwise throws — there is no silent fallback.

两条通道各司其职：通道 A（`list / follow`）只水合在跑任务，终态墓碑只更新本地终态门，绝不发 `settled`、绝不 ack；通道 B（`listNotices / ackNotices`）专门投递未确认的终态通知，事件发出后才按连续成功前缀 ack。因此页面重开后基线回放不会造成重复通知，未确认的通知仍会通过通道 B 送达。通道 B 按后端归属分组：每个后端只查自己注册的 project、用自己的游标推进与 ack，绝不拿首个后端代查全部项目——不同后端可能是不同服务或不同鉴权域。

> EN: Two channels with separate jobs: channel A (`list / follow`) only hydrates running tasks; a terminal tombstone only updates the local terminal gate and never emits `settled` nor acks. Channel B (`listNotices / ackNotices`) delivers unacknowledged terminal notices; the cursor advances only after the event is emitted. A page reopen therefore never duplicates a notice from baseline replay, and unacknowledged notices still arrive through channel B. Channel B is grouped by backend ownership: each backend queries only the projects registered to it and advances/acks with its own cursor — it never queries all projects through whichever backend was registered first, since backends may be different services or auth domains.

前端的通知去重 id 与终态交接结果用有界 LRU 缓存（上限 512），不会随长时间开页无限增长；跨页 / 重开去重靠服务端 cursor。句柄兑现以登记时服务端原子 create 返回的权威记录为真源，本地缓存只是「通知早于 waiter」的快路径——淘汰后仍能兑现、不留 pending，且同 key 重建不会被上一轮终态错误兑现。

> EN: Notification de-duplication ids and terminal handoff results on the client use a bounded LRU cache (limit 512) and never grow without bound on a long-lived page. Cross-page / reopen de-duplication relies on the server cursor. Settling an authoritative handle uses the authoritative record returned by the server atomic create at registration as the source of truth; the local cache is only a fast path for "notice before waiter" — eviction still settles without leaving a pending handle, and reusing a key can never settle a fresh handle with the previous instance terminal.

按钮命令的幂等缓存同样有界：按（项目、任务、按钮、版本）为键，容量上限 512、写入后超过 60 秒即过期（到点那一秒仍有效），两轴都由同一套通用有界缓存执行——容量满淘汰最久未用项，过期条目在下次访问时删除并换新幂等键。窗口内重复点击复用同一条目（成功后连结果一起回放，不再发请求），窗口外重新发命令；长生命周期页面不会因为点过的按钮越积越多而无界增长。

> EN: Button command idempotency is bounded the same way: keyed by (project, task, action, version), capped at 512 entries and expiring once more than 60 seconds have passed since the write (the boundary second still counts), both enforced by the shared bounded cache — the oldest unused entry is evicted at capacity, and an expired entry is deleted on next access so a fresh idempotency key is minted. Clicks inside the window reuse the entry (and replay the cached result after success, sending no request); outside it a new command is sent. A long-lived page therefore cannot grow without bound as more buttons are clicked.

真源在服务端：原子 `create` 决定 `created`，`startedAt / deadlineAt / version` 由服务端生成，超时与租约由服务端 watchdog 判定，终态按 TTL 清理。核心只按单调 version 合并基线、分页与增量；按钮是 `{id, token, expiresAt}` 描述，`runAction` 按 actionId 走服务端命令，不依赖页面闭包。点击按钮会向 `taskNotificationEvents` 发 `action` 事件（含任务快照、actionId、ok、reason、result），消费方据此把界面带回来。权威句柄只有 `id / isSettled / settled`，没有 update/touch/background/done/fail/track——终态由服务端判定，编译期即阻止误用。

> EN: The server owns the truth: atomic `create` decides `created`; `startedAt / deadlineAt / version` come from the server; a server watchdog decides timeouts and lease expiry; terminal records are cleared by TTL. Actions are `{id, token, expiresAt}` descriptors and `runAction` dispatches by actionId to the server, never through page closures. Every click emits an `action` event to `taskNotificationEvents` (with task snapshot, actionId, ok, reason, result) so consumers can restore their UI. An authoritative handle exposes only `id / isSettled / settled`; update/touch/background/done/fail/track do not exist — the server decides terminal state, and the type system prevents misuse.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `taskNotifications.setTaskBackend(project, backend)` | `(project: string, backend: TaskBackend) => void` | — | 切换到服务端权威模式；必须提供 list/follow/listNotices/ackNotices/invoke/ack，否则抛错 | Switches to authoritative mode; list/follow/listNotices/ackNotices/invoke/ack are mandatory or registration throws |
| `notifyTask.server(title, options?)` | `(title: string, options?: NotifyTaskOptions) => Promise<AuthoritativeClaim>` | — | 服务端原子 create 登记；句柄只有 id/isSettled/settled，没有可被页面写的方法 | Registers through server-side atomic create; the handle exposes only id/isSettled/settled with no page-writable methods |
| `createHttpTaskBackend(options)` | `(options: HttpTaskBackendOptions) => TaskBackend` | — | HTTP transport；从 dsh-plugin-core/adv/tasks/http-backend 导入，长连接断开由引擎退避重连 | HTTP transport from dsh-plugin-core/adv/tasks/http-backend; the engine reconnects a dropped stream with backoff |
| `serveTaskCenter(ctx, options)` | `(ctx: HostContextLike, options: TaskCenterRouteOptions) => () => void` | — | 宿主侧路由装配（dsh-plugin-core/host/task-center）；authorize 必填，宿主不提供全局鉴权 | Host-side route wiring (dsh-plugin-core/host/task-center); authorize is mandatory because the host provides no global auth |

## useTasks：React 读取入口

> EN: useTasks: the React read hook

把池的快照接到组件上并按分组过滤，等价于自己写 `useSyncExternalStore` 三参 + `selectTaskNotifications`。只读、不享任何状态：想自己画页面用它，不想自己画就用 `TaskBar`。`connect()` 由池在首次订阅时自己完成，返回值里的 `connect` 只是把同一件事交给你，方便在挂载时显式要一次 baseline。

> EN: Wires the pool snapshot into a component and filters by group — the same as writing the three-argument `useSyncExternalStore` plus `selectTaskNotifications` yourself. Read-only and state-free: use it to draw your own page, or use `TaskBar` if you would rather not. The pool connects on first subscribe; the returned `connect` just hands the same call to you so mount can explicitly ask for a baseline.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `options.groups` | `readonly string[] \| '*'` | 默认项目全部二级 | 二级分组过滤，与 `selectTaskNotifications` 同口径 | Second-level filter, same contract as `selectTaskNotifications` |
| `options.project` | `string \| null` | 全局默认项目 | 换项目看；`null` = 不按项目过滤 | Look at another project; `null` means no project filter |
| `options.includeHidden` | `boolean` | false | `hidden` 的任务默认不进列表，传 true 连它们一起列 | `hidden` rows stay out of the list by default; pass true to include them |
| `返回` | `{ tasks: readonly TaskNotificationRecord[]; connect(): void }` | — | `tasks` 按 `startedAt` 排序、同一快照内引用稳定；`connect` 幂等 | `tasks` are sorted by `startedAt` with a stable reference inside one snapshot; `connect` is idempotent |

## TaskBar：后台任务中心展示栏

> EN: TaskBar: background task bar

封装好的展示栏：未展开是一颗按钮，展开了列出后台正在跑的任务。数据全部来自池本身（项目用 `setDefaultTaskProject()` 设一次），不需要自己 `useSyncExternalStore`。触发器与下拉框（Picker）同款皮：同高度档、字号同 `Button` 的 md 档（13px，sm 档 12px）、1px 加重描边、md 圆角、右侧一颗 6px 三角。两种形态：`pill`（图标 + 文字 + 运行数，默认）与 `icon`（只有图标，宽高相等即正方形，有任务时右上角一颗绿点）。`size` 三档：sm(24) / md(28，默认) / lg(32)。

> EN: A ready-made bar: a button when collapsed, a list of running background tasks when open. All data comes from the pool itself (set the project once with `setDefaultTaskProject()`); no `useSyncExternalStore` on your side. The trigger wears the dropdown (Picker) skin: same height steps, the `Button` md font size (13px, 12px on sm), 1px heavy border, md radius, a 6px caret on the right. Two forms: `pill` (icon, label and running count — the default) and `icon` (icon only, square, with a green dot while tasks run). `size` has three steps: sm (24), md (28, default) and lg (32).

下拉里只画面板一层框，行与行之间是一条虚线，行本身不带底色 / 描边。行内是图标 + 标题 + `已执行 00:00:01`（每秒跳动，走核心唯一心跳 `useNowMs`，不另起定时器）。记录带 `actions` 时右侧按顺序画出**全部**按钮，点第 i 颗调 `runAction(id, i)`（方法在创建那条任务的那一页，这里只拿得到文案与颜色）；行内按钮**固定最小号**（sm），不随触发器尺寸变；不传色是中性灰底（`secondary`），`actions[i].color` 传了就用该色实心底 + 反色文字（`primary` 档，两主题都读得清）；`actions[i].icon` 传图标（`库名:图标名`），没传（或解析不出）就补 `defaultIcon`（默认 CPU），保证每颗按钮都有图标位、文字起点对齐；只有 icon 没有 label 时画成**正方形**图标钮。`icon` 是消费端标识、不保证是字体图标名，解析不出就回落 `defaultIcon`（默认 `common.base:cpu`）。有任务在跑时图标字形呼吸（CSS 动画，无定时器）。`width` / `minWidth` / `maxWidth` 与 `Button` 同口径约束触发器宽度：定宽优先、另两者失效；定宽或给了上限时文字放不下折叠成省略号、hover 以跑马灯展开全名（复用全站唯一 `MarqueeText`），图标 / 计数 / 三角不让位。行只做 hover 反馈（极淡蓝底），不可点、没有选中态。

> EN: The panel draws a single frame: a dashed rule between rows, no per-row background or border. Each row shows icon, title and `Running 00:00:01` (ticks every second off the shared ticker `useNowMs`, no timer of its own). When the record carries `actions`, **all** buttons are drawn in order and the i-th one calls `runAction(id, i)` (the method lives in the creating page, only labels and colors cross). In-row buttons are always the smallest size (sm) and never follow the trigger; no color means the neutral filled `secondary`, an action `color` becomes the background with inverse text (`primary` tier), readable in both themes; `actions[i].icon` draws an icon (`lib:name`); without one (or when it cannot be resolved) `defaultIcon` (CPU) fills in, so every button keeps an icon slot and labels line up; an action with an icon but no label renders as a **square** icon button. `icon` is a consumer-side identifier, not necessarily a font icon name; anything unresolvable falls back to `defaultIcon` (default `common.base:cpu`). While tasks run the glyph breathes (CSS animation, no timers). `width`/`minWidth`/`maxWidth` size the trigger exactly like `Button`: a fixed width wins and voids the other two; with a fixed width or an upper bound the label collapses to an ellipsis and marquees on hover (the single shared `MarqueeText`), while icon, count and caret never give way. Rows only give hover feedback (a very faint blue tint): not clickable, no selected state.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `form` | `'icon' \| 'pill'` | 'pill' | 形态：只图标 / 图标 + 文字长条 | Form: icon only, or icon plus a text pill |
| `size` | `'sm' \| 'md' \| 'lg'` | 'md' | 尺寸档（24 / 28 / 32）；只图标形态宽高相等，永远是正方形 | Size step (24 / 28 / 32); the icon-only form is a square |
| `groups` | `readonly string[] \| '*'` | 默认项目全部二级 | 过滤，与 `selectTaskNotifications` 同口径 | Filter, same contract as `selectTaskNotifications` |
| `project / includeHidden` | `string \| null / boolean` | — / false | 换项目看 / 连 hidden 一起列 | Look at another project / include hidden rows |
| `onActionFailure` | `(failure: TaskActionFailure) => void` | — | 行内按钮点了没生效时调它（条目已失效 / 方法在别页且等不到 ack / 下标越界）。不传就由本栏弹一次核心自带提示 `taskbarActionFailed` —— 不再静默 | Called when an inline button did not take effect (row gone, method on another page and no ack, index out of range). Without it the bar raises the built-in `taskbarActionFailed` notice instead of staying silent |
| `placement` | `'down' \| 'up'` | 'down' | 面板首选展开方向，空间不够自动翻 | Preferred panel direction; flips when space runs out |
| `defaultIcon` | `string` | 'common.base:cpu' | 任务没带图标时的默认图标（`库名:图标名`） | Icon used when a task carries none (`lib:name`) |
| `width` | `number \| string` | — | 固定宽（px 或任意 CSS 宽度）；与 `minWidth` / `maxWidth` 互斥，一旦设定后两者失效。只图标形态恒为正方形，忽略这三个参数 | Fixed width (px or any CSS width); mutually exclusive with `minWidth`/`maxWidth`. The icon-only form is always square and ignores all three |
| `minWidth` | `number \| string` | — | 最小宽：`width` 未设时生效 | Minimum width: applies when `width` is unset |
| `maxWidth` | `number \| string` | — | 最大宽：`width` 未设时生效；文字放不下折叠成省略号，hover 以跑马灯展开全名 | Maximum width: applies when `width` is unset; overflowing text collapses to an ellipsis and marquees on hover |
| `className / style` | `—` | — | 追加类 / 样式，只允许补布局 | Append class / style, layout patches only |

```tsx id="bt-taskbar-example"
import { TaskBar, setDefaultTaskProject } from 'dsh-plugin-core/adv/tasks'

// app 入口：项目设一次，展示栏与 notifyTask 共用同一个默认项目
setDefaultTaskProject('dsh-task-reminder')

// 长条形态：图标 + 文字 + 运行数；点开列出后台正在跑的任务
h(TaskBar, { groups: ['scan'] })

// 只图标形态：正方形（宽高相等），有任务在跑时右上角一颗绿点
h(TaskBar, { form: 'icon' })

// 尺寸三档：sm(24) / md(28，默认) / lg(32)
h(TaskBar, { form: 'icon', size: 'sm' })

// 宽度三轴（与 Button 同口径）：定宽优先；放不下折叠成省略号，hover 以跑马灯展开
h(TaskBar, { width: 220 })
h(TaskBar, { maxWidth: 140 })
h(TaskBar, { minWidth: 160 })

// 任务挂按钮：文案 + 可选颜色（不传就是默认灰底），一行几颗就画几颗
const handle = notifyTask('扫描工作区', {
  group: 'scan',
  actions: [
    { label: '查看', run: () => openScan() },
    { label: '取消', color: '#dc2626', run: () => handle.fail('cancelled') },
  ],
})
```

## 更新日志

本文件为生成投影，变更记录在同名 `.doc.ts` 真源与本仓 git 历史。
