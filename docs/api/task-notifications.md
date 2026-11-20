# 后台任务中心

> EN: Background Task Hub

本文件由 `scripts/gen-docs.mjs` 从同名 `.doc.ts` 生成，请勿手改。

导出：startTask、mountTaskUI、TaskBar、connectTaskCenter、connectTaskLayout、defaultTaskHost、pressTaskButton、projectTasks、subscribeTaskNotifications、taskCenterStore、executors、createExecutorRegistry、TaskRecord、StartTaskInput、TaskProgress、TaskButton、TaskToastConfig、TaskNotifyConfig、TaskRowButton、TaskNotificationRecord、serveTaskStream、connectTaskStream

## 后端执行 + 通知 + 核心控件

> EN: Backend execution + notification + core controls

这里叫**后台任务中心**：执行在后端（开放执行器），状态真源在服务端，前端只登记、投影、转发按钮。没有前端 pull 心跳、没有状态源、没有双时钟租约、没有 tombstone 判死——终态由执行器结果或服务端投影直接驱动一次。消费方只写两处接线：`mountTaskUI` 注册 handlers / 订阅终态、`startTask` 发起；展示用核心原生的 `TaskBar`（icon/pill 形态、sm/md/lg 尺寸、宽度与跑马灯），不用自己画列表。

> EN: This is the **background task hub**: work runs on the backend through open executors, the server owns task state, and the front end only registers, projects and forwards button presses. There is no client pull heartbeat, no status source, no dual-clock lease and no tombstone gate — a terminal state is driven once by the executor result or a server projection. Consumers write two wiring points: `mountTaskUI` registers handlers / terminal callback, `startTask` starts work; display uses the original `TaskBar` (icon/pill forms, sm/md/lg sizes, width and marquee) — no hand-drawn list.

所有配置都是**纯数据跟着记录走**：标题、Toast、通知、按钮文案与显示时机在发起时声明，任何页面看到同一条任务都按同一份配置渲染，不需要发起页在场。跨页只传结构化克隆安全的值，不带函数、组件或 Promise。

> EN: All configuration is **plain data carried by the record**: title, toast, notification, button labels and visibility are declared at start time, so every page renders the same task from the same configuration without the originating page being present. Only structured-cloneable values cross pages — no functions, components or promises.

```ts id="bt-start-example"
import { startTask } from 'dsh-plugin-core/adv/tasks'

// await 等的是登记成功，不是任务跑完。标题 / 通知 / 按钮全是纯数据，跟着记录走。
await startTask({
  project: 'dsh-task-reminder',
  group: 'scan',
  title: '扫描工作区',
  key: 'scan:workspace-1',          // 同 (project, key) 同时最多一条，重复发起就地更新
  kind: 'reminder:scan',            // 开放执行器名，核心不枚举、不校验
  args: { path: '/ws' },            // 纯数据，过不了进程边界，不带函数

  toast: {                          // 终态弹卡；整态不写 = 该态不弹
    success: { title: '扫描完成', button: { id: 'view', text: '看日志' }, scope: 'all' },
    failure: { title: '扫描失败', scope: 'origin' },
  },
  notify: {                         // 终态通知，与 toast 是两件事
    success: { message: '扫描完成', detail: { count: 12 }, scope: 'all', broadcast: 'plugin' },
  },
  rowButtons: [                     // 列表行按钮；文案与 when 由核心控件画
    { id: 'view', text: '查看', when: 'running' },
    { id: 'view', text: '看日志', when: 'done' },
  ],
})
```

```ts id="bt-mount-ui-example"
import { mountTaskUI } from 'dsh-plugin-core/ui/task-ui'

// 本页接线一次：列表与 Toast 共用这一份 handlers，终态只刷消费方自己的数据。
mountTaskUI({
  project: 'dsh-task-reminder',     // null / 省略 = 收所有项目
  groups: ['scan'],
  handlers: {
    view: (task) => openLogPanel(task.detail?.logPath),
    retry: (task) => void startScan(task.detail?.path),
  },
  onSettled: (task, outcome) => refreshBoard(),  // 核心列表自己刷，这里只刷自己的数据
})
```

```ts id="bt-taskbar-example"
import { TaskBar } from 'dsh-plugin-core/adv/tasks/ui'

// TaskBar 是高级控件的展示面，单独从 adv/tasks/ui 引；adv/tasks 只出逻辑，Node 引它不带 React。
// 展示栏沿用核心原 UI：icon / pill 两形态、sm/md/lg 尺寸、width/min/max 宽度，
// 文字过长自动省略 + hover 跑马灯。数据来自共享任务池，无需本插件画行。
// pill 长条
h(TaskBar, { groups: ['scan'] })
h(TaskBar, { size: 'lg', groups: ['scan'] })
// 只有图标（正方形，有任务在跑时带绿点）
h(TaskBar, { form: 'icon', groups: ['scan'] })
h(TaskBar, { form: 'icon', size: 'lg', groups: ['scan'] })
// 定宽 220；上限 110（放不下省略号、hover 跑马灯）
h(TaskBar, { width: 220, groups: ['scan'] })
h(TaskBar, { maxWidth: 110, groups: ['scan'] })
```

## 开放执行器：kind 任意，谁执行谁注册

> EN: Open executors: any kind, the executor registers itself

执行器注册表是**开放基础能力，不认识「任务」语义**：`kind` 是任意字符串，核心不枚举、不校验名字、不为某一种执行方式写死分支。宿主 agent（会话）有官方 API 可直接接；shell / 插件 host 脚本由插件在自己的 host 侧注册 handler（内部怎么执行由它决定），核心只负责登记、调度、进度与终态回传。同标签页所有插件副本共用一个注册表，A 注册的执行器 B 也能调到。

> EN: The executor registry is an **open primitive that knows nothing about "tasks"**: `kind` is any string, the core neither enumerates nor validates names and hard-codes no branch for a particular execution style. Host agents (sessions) have an official API and can be wired directly; shell / plugin host scripts register their own handler on the host side (how it runs is their decision), while the core only registers, dispatches and relays progress and terminal state. All plugin copies in one tab share one registry, so an executor registered by A is callable by B.

执行体拿到 `args`（纯数据）与 `ctx`：`ctx.report(progress)` 上报「最后一段话 + 可选数值进度」。返回 `{ outcome: 'done' | 'failed', reason? }` 即终态；抛错按 failed 结算。进度写进记录的显式字段 `progress`（message / updatedAt / current / total / percent），不塞进 `detail`。核心当前不提供取消信号，执行体不要等 `ctx.signal`。

> EN: A handler receives `args` (plain data) and `ctx`: `ctx.report(progress)` reports the last message plus optional numeric progress. Returning `{ outcome: 'done' | 'failed', reason? }` settles the task; a thrown error settles as failed. Progress lands in the explicit `progress` field (message / updatedAt / current / total / percent), never inside `detail`. There is no cancellation signal in the core today — handlers must not wait on `ctx.signal`.

```ts id="bt-executor-example"
import { executors } from 'dsh-plugin-core/adv/tasks'

// 谁要执行谁注册：kind 是任意字符串，宿主 agent、插件 host 脚本、shell 都是一种 handler。
const off = executors.register('reminder:scan', async (args, ctx) => {
  ctx.report({ message: '枚举文件', current: 1, total: 2 })
  await scan(args.path as string)
  ctx.report({ message: '建立索引', current: 2, total: 2 })
  return { outcome: 'done' }
})
// off() 注销；同名重复注册会抛错（先注销旧的）。

// 宿主侧接服务端推送（状态真源在服务端）：
import { serveTaskStream } from 'dsh-plugin-core/host'
serveTaskStream(ctx, {
  basePath: '/api/task-center',
  authorize: (req) => currentViewer(req),   // 必填：宿主不提供全局鉴权
  source: {
    snapshot: (viewer) => listTasks(viewer),          // 全量基线，只恢复列表、不弹卡
    subscribe: (emit, viewer) => watchTasks(emit, viewer), // 状态增量，只更新列表、不弹卡
    subscribeNotices: (emit, viewer) => watchNotices(emit, viewer), // 一次性通知，才弹卡；订阅时回放 outbox 补断线期间的
  },
})
```

## 通知三通道：Toast、notify、列表按钮

> EN: Three notification channels: toast, notify, list buttons

三条通道各司其职、互不混用：**Toast** 是终态弹卡，`toast.success` / `toast.failure` 两态完全对称，每态可配 `scope`（`all` 每个页面都弹、`origin` 只发起页弹）与一个按钮（`TaskButton`：`{ id, text, icon?, color? }`）；**notify** 是终态消息，`message` + `detail` 纯数据，`scope` 同上，核心只把通知发出去、不做任何 UI（弹卡/alert 由接收方自己决定）；`broadcast` 字段保留兼容但核心不再据此决定发不发，范围由订阅方的 scope/project 决定；**列表按钮**是 `rowButtons: [{ id, text, when }]`，`when` ∈ `running` / `done` / `failed` / `always`（缺省 always），同一 id 可按状态重复声明，跟着记录走。

> EN: Three channels with separate jobs: **toast** is the terminal card — `toast.success` / `toast.failure` are fully symmetric, each with a `scope` (`all` every page, `origin` only the originating page) and one button (`TaskButton`: `{ id, text, icon?, color? }`). **Notify** is a terminal message — `message` plus plain `detail`, the same `scope`, the core only sends the notification and does no UI (cards/alerts are a decision by the receiver); the `broadcast` field is kept for compatibility but the core no longer uses it to decide whether to send — scope is decided by the scope/project chosen by the subscriber. **List buttons** are `rowButtons: [{ id, text, when }]`, where `when` is `running` / `done` / `failed` / `always` (default always); the same id may be declared repeatedly per state and travels with the record.

按钮 id 查的是本页 `handlers`（列表与 Toast 共用同一份）。**所有按钮在所有页都画**，不隐藏、不置灰，也不按 origin 或 getHandler 过滤——点击走 `pressTaskButton` → `selectPanel(panelId)` 跳回发起面板再执行 handler，「查看」这类动作的 UI 落在发起面板上。这里的「所有页」受 scope 约束：`scope:"all"` 每页弹卡且每页都有按钮，`scope:"origin"` 只在发起页弹卡（其它页连卡都没有，自然没有按钮）。`panelId` 由核心在 `startTask` 时自动记录（本地与服务端模式都记，随提交给服务端回填），消费方不传。若 handler 找不到（条目已失效或注册它的插件已卸载），Toast 按钮与列表按钮都给一次提示（走核心 i18n）；列表按钮还可传 `onActionFailure` 自己接管。终态只分发一次：本地执行与服务端投影不会重复弹卡。

> EN: A button id resolves against this page's `handlers` (shared by the list and toast). **Every button is drawn on every page** — never hidden, never greyed out, never filtered by origin or getHandler — and a click goes through `pressTaskButton` → `selectPanel(panelId)` to jump back to the originating panel before running the handler, so a "view" action lands its UI there. "Every page" is still bounded by scope: `scope:'all'` toasts and buttons on every page, `scope:'origin'` toasts only on the originating page (no card elsewhere, hence no button). `panelId` is recorded automatically by the core in `startTask` (both local and server modes, submitted for server backfill); consumers never pass it. If the handler is missing (stale entry or the registering plugin was unloaded), both the toast button and the list button give one notice (through the core i18n); list buttons may also pass `onActionFailure` to handle it themselves. Terminal states are delivered once: local execution and server projection never double-toast.

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `toast.success / failure` | `TaskToastState \| undefined` | — | undefined | 每态独立；整态不写 = 该态不弹卡 | Per state; omitting the whole state means no card for it |
| `toast.<态>.title` | `string` | 该态要弹卡时必填 | — | 卡片主行 | Card headline |
| `toast.<态>.button` | `TaskButton \| undefined` | — | undefined | 该态一个按钮：{ id, text, icon?, color? }，id 对应 handlers；画在每页（scope:all）或发起页（scope:origin） | One button for that state: { id, text, icon?, color? }; id resolves to handlers; drawn on every page (scope:all) or the originating page (scope:origin) |
| `toast.<态>.scope` | `'all' \| 'origin'` | — | 'origin' | 所有页面 / 只有发起页 | Every page / originating page only |
| `notify.<态>.message` | `string` | — | — | 通知正文 | Notification text |
| `notify.<态>.detail` | `NotifyDetail \| undefined` | — | undefined | 附带的纯 JSON，接收方自己取 | Attached plain JSON, read by the receiver |
| `notify.<态>.scope` | `'all' \| 'origin'` | — | 'origin' | 所有标签页 / 只在发起的那个标签页（页面级 origin，切面板不影响）；两态可不同 | Every tab / only the originating tab (page-level origin; switching panels does not affect it); per state |
| `notify.<态>.broadcast` | `'plugin' \| 'global' \| undefined` | — | undefined | 兼容字段：核心忽略它，notify 一律发通知；范围由订阅方的 scope / project 决定 | Compatibility field: ignored by the core — notify always sends; scope is decided by the scope/project chosen by the subscriber |
| `rowButtons[]` | `readonly TaskRowButton[]` | — | undefined | 列表行按钮声明，文案与 when 跟着记录走 | List-row button declarations; labels and when travel with the record |
| `rowButtons[].when` | `'running' \| 'done' \| 'failed' \| 'always' \| undefined` | — | 'always' | 显示时机；同一 id 可按状态重复声明 | Visibility; the same id may be declared repeatedly per state |
| `subscribeTaskNotifications(options)` | `(options) => () => void` | — | — | 收任务广播：scope=plugin 只收同项目（不传 project 时回落全局默认项目，没设则报错），global 收所有；收到纯数据自己处理 | Receive task broadcasts: scope=plugin filters to same project (falls back to the global default project when project is omitted, throws if unset), global receives all; plain data, consumer decides |
| `mountTaskUI(options)` | `(options: MountTaskUIOptions) => () => void` | — | — | 注册 handlers + 订阅终态；handlers 按 project 命名空间（同名按钮不同项目互不覆盖），返回注销函数 | Registers handlers and subscribes to terminal states; handlers are namespaced by project (same button id in different projects does not collide); returns an unsubscribe function |
| `TaskBar` | `React component` | — | — | 核心原生展示栏：pill/icon 形态、sm/md/lg 尺寸、固定宽 / 最小宽 / 最大宽，超长 hover 跑马灯；数据来自共享池 | Core native bar: pill/icon forms, sm/md/lg sizes, fixed/min/max width with hover marquee; reads the shared pool |
| `pressTaskButton(buttonId, taskId)` | `(buttonId: string, taskId: string) => boolean` | — | — | 先切回发起面板再执行 handler；找不到返回 false | Switches back to the originating panel before running the handler; false when not found |

## 服务端投影：SSE 是唯一状态通道

> EN: Server projection: SSE is the only state channel

服务端是状态真源：任务执行、进度推进、终态判定都在服务端。`serveTaskStream` 注册一条 SSE 路由，三条流物理隔离：`event: task-snapshot`（全量基线）与 `event: task`（进度/终态状态）只投影列表、**永不弹卡**；`event: task-notice`（带唯一 id 的一次性完成通知）才触发 toast/notify。`authorize` 强制必填，归属过滤在服务端按 viewer 做。服务端按阶段分类错误：鉴权失败（`authorize` 抛错或返回空）回 401，服务侧故障（订阅/快照/推流失败）回 503——绝不把服务故障写成 401。客户端 `connectTaskCenter({ streamUrl, onGiveUp })` 订阅：退避档只约束「无数据进展的连接」（连上就 EOF、首帧前 reject、fetch 失败），档位用尽即放弃并回调 `onGiveUp`；一旦某轮读到过字节（含保活），无论 EOF 还是异常断开都算有进展、退避归零继续重连；永久错误（其余 4xx）立即停流并上报。`onGiveUp` 是 `TaskCenterHost` 字段、默认接线即可拿到（401 的 `reason.permanent=true`，应用据此刷新凭证后再调一次 `connectTaskCenter` 显式重连，`headers` 是函数会取新 token）。通知按 id 存 sessionStorage 去重（有界），刷新 / 重连重推历史不会重弹，而每个标签页各自独立，关页即清——`scope:"all"` 才能让同源每个页面各弹一次。断线期间结算的通知靠服务端 source 的 outbox 回放补发。关键不变量：状态可反复重放，通知是一次性事件——弹卡绝不挂在状态投影上（参照 ledger 的通道 A/B 模式）。

> EN: The server owns the truth: execution, progress and settlement all happen there. `serveTaskStream` registers one SSE route with three physically separated streams: `event: task-snapshot` (full baseline) and `event: task` (progress/terminal state) only project the list and **never announce**; `event: task-notice` (a one-shot completion event with a unique id) is the only toast/notify trigger. `authorize` is mandatory and viewer-based ownership filtering happens server-side. Errors are classified by phase: auth failure (`authorize` throws or returns empty) is 401, service-side failure (subscribe/snapshot/streaming) is 503 — a service fault is never written as 401. Clients subscribe with `connectTaskCenter({ streamUrl, onGiveUp })`: the bounded retry applies only to connections with **no data progress** (immediate EOF, reject before first frame, fetch failure) — exhausting the delays gives up and calls `onGiveUp`; once a round has read any bytes (keep-alive included), EOF or abnormal disconnect both count as progress and reset the budget to keep reconnecting; permanent faults (other 4xx) stop immediately and report. `onGiveUp` is a `TaskCenterHost` field available on the default wiring (401 has `reason.permanent=true`; the app refreshes credentials then calls `connectTaskCenter` again to reconnect explicitly — `headers` is a function and picks up the new token). Notices are de-duplicated by id in sessionStorage (bounded), so refresh / reconnect replays of history never re-announce, while each tab keeps its own copy and clears on close — that is what lets `scope:"all"` announce once per same-origin page. Notices settled during a disconnect are replayed from the server source outbox. Core invariant: state is replayable, notices are one-shot — announcing is never wired to state projection (mirrors ledger's channel A/B pattern).

`connectTaskLayout(ctx)` 是从宿主 client ctx 接 layout 的便捷入口：通过 `ctx.inject(['layout'])` 拿 layout 服务，发起时从 `panelInfo.getSnapshot().activePanelId` 自动记面板（宿主 0.2.2-rc.3 核实，不在 ILayout 顶层），点按钮时用 `selectPanel(panelId)` 切回。不传 `streamUrl` 时是纯本地内存模式，适合单测与预览站。

> EN: `connectTaskLayout(ctx)` is the convenience wiring from a host client ctx: it obtains the layout service through `ctx.inject(['layout'])`, records `panelInfo.getSnapshot().activePanelId` automatically at start (verified against host 0.2.2-rc.3 — it is not a top-level ILayout field), and calls `selectPanel(panelId)` on button presses. Without `streamUrl` it runs as a local in-memory mode for tests and the preview site.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `serveTaskStream(ctx, options)` | `(ctx, options: TaskStreamOptions) => () => void` | — | 宿主侧 SSE 端点；authorize 必填，source 给基线 + 订阅 | Host-side SSE endpoint; authorize is mandatory, source supplies baseline + subscribe |
| `connectTaskCenter(host)` | `(host: TaskCenterHost) => () => void` | — | 一次接线；带 streamUrl 时自动订阅并重连，重复调用覆盖上一次 | One-shot wiring; with streamUrl it subscribes and reconnects; repeated calls replace the previous one |
| `connectTaskLayout(ctx)` | `(ctx: LayoutClientContext) => void` | — | 从宿主 client ctx 接 layout：自动记 panelId、点按钮切回面板 | Wires layout from a host client ctx: records panelId and switches back on button presses |
| `projectTasks(records)` | `(records: readonly TaskRecord[]) => void` | — | 手动投影入口：只把记录投影进列表，不弹卡、不分发终态（弹卡只走 task-notice） | Manual projection entry: projects records into the list only — no cards, no terminal delivery (cards come only from task-notice) |
| `taskCenterStore` | `TaskStore` | 全局单例 | 同标签页共享的任务状态；getSnapshot / subscribe / select / getHandler / clearAll（全清：任务、幂等键、终态声明与 handlers，清后需重新 mountTaskUI） | Shared task state per tab; getSnapshot / subscribe / select / getHandler / clearAll (clears everything: tasks, idempotency keys, settlement claims and handlers — remount after) |

```ts id="bt-connect-example"
import { connectTaskLayout } from 'dsh-plugin-core/adv/tasks'

// client apply 里接一次：核心自动记当前 panelId，点按钮先切回发起面板再执行 handler。
connectTaskLayout(ctx)

// 或者自己接 host：带 streamUrl 时自动订阅 SSE 并投影。
import { connectTaskCenter } from 'dsh-plugin-core/adv/tasks'
const off = connectTaskCenter({
  streamUrl: '/api/task-center/stream',
  headers: () => ({ authorization: token() }),
  activePanelId: () => currentPanel(),
  selectPanel: (id) => switchPanel(id),
})
```

## TaskRecord：一条任务记录

> EN: TaskRecord: what one task record holds

记录全是服务端下发或调用方给的纯数据，跨页克隆安全、无函数。身份字段：`id`、`key`（同项目幂等）、`project` / `group`（两级分组）、`startedAt`；归属字段：`panelId`（核心自动记，点按钮切回面板用）、`origin`（核心自动记的发起标签页 id，scope:origin 据此判定弹卡）；执行字段：`kind` / `args` / `detail` / `icon`；展示字段：`progress` / `toast` / `notify` / `rowButtons`；终态字段：`state` / `reason` / `settledAt`。`settledAt` 是终态（`done` / `failed`）的**必填有限数**结算时刻，由终态真源（本地执行器或服务端）给出，`running` 帧不得携带；入口 `isTaskRecord` 按状态校验，终态缺结算时刻的帧被拒收——列表靠它算终态行停留与退场，缺了会导致终态行不消失、显示假计时。服务端 SSE 是状态真源，请勿省略；客户端不会补本地时间冒充服务端时钟。服务端模式下 `startTask` 先落一条带 `key`/`project`/`group` 的乐观 running 行再 POST（缺省都由核心补齐并随 payload 发出）；**服务端必须在所有 SSE 帧与通知里回显同一个 `key` 和提交体里的 `project`**（归一按 `(project,key)`），真源才归一覆盖乐观行——失配会留下一条永不消失的幽灵 `running` 行，且快速任务的终态可能被晚到的乐观行覆回。提交失败核心自动回滚乐观行。

> EN: A record is all plain data from the server or the caller — structured-clone safe, no functions. Identity: `id`, `key` (idempotent per project), `project` / `group` (two-level grouping), `startedAt`; ownership: `panelId` (core-recorded, used to switch back on button presses) and `origin` (core-recorded originating tab id, the basis for scope:origin announcement); execution: `kind` / `args` / `detail` / `icon`; presentation: `progress` / `toast` / `notify` / `rowButtons`; terminal: `state` / `reason` / `settledAt`. `settledAt` is a **required finite number** for terminal states (`done` / `failed`), supplied by the terminal authority (local executor or server); `running` frames must not carry it. `isTaskRecord` validates by state and rejects terminal frames missing it — the list needs it for terminal row retention/eviction; without it rows never leave and show a fake timer. The server is the state source of truth via SSE: do not omit it; the client never injects a local timestamp to impersonate the server clock. In server mode `startTask` first writes an optimistic running row carrying `key`/`project`/`group` (defaults are filled by the core and sent in the payload); **the server must echo the same `key` and the submitted `project` in every SSE frame and notice** — reconciliation is by `(project,key)` — otherwise a ghost `running` row persists and the terminal state of a fast task can be overwritten by the late optimistic write. A failed submit rolls the optimistic row back automatically.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `record.state` | `'running' \| 'done' \| 'failed'` | — | 服务端投影下来的事实；终态到达后不再被迟到的 running 复活 | Fact projected from the server; a late running update cannot revive a settled state |
| `record.progress` | `TaskProgress \| undefined` | undefined | 最后一段话 + 更新时间 + 可选数值，显式字段，不进 detail | Last message + update time + optional numbers, an explicit field never stored in detail |
| `record.panelId` | `string \| undefined` | undefined | 发起面板；点按钮先切回它，再由 core 自动填 | Originating panel; buttons switch back to it first; filled automatically by the core |
| `record.origin` | `string \| undefined` | undefined | 发起标签页 id（core 自动记）；scope:origin 只在同 id 标签页弹卡，服务端未回填时按多弹兜底 | Originating tab id (core-recorded); scope:origin announces only on the matching tab, fails open when the server omits it |
| `startTask(input)` | `(input: StartTaskInput) => Promise<TaskRecord>` | — | 等登记成功，不等跑完；key 同项目幂等 | Resolves on registration, not completion; key is idempotent per project |

## 更新日志

本文件为生成投影，变更记录在同名 `.doc.ts` 真源与本仓 git 历史。
