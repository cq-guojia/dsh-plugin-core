# 后台任务中心

> EN: Background Task Hub

本文件由 `scripts/gen-docs.mjs` 从同名 `.doc.ts` 生成，请勿手改。

导出：startTask、mountTaskUI、TaskBar、connectTaskCenter、connectTaskLayout、defaultTaskHost、pressTaskButton、projectTasks、subscribeTaskNotifications、taskCenterStore、executors、createExecutorRegistry、TaskRecord、TaskSettlement、DisplayTitle、formatDisplayTitle、isDisplayTitle、StartTaskInput、TaskProgress、TaskButton、TaskToastConfig、TaskNotifyConfig、TaskRowButton、TaskNotificationRecord、serveTaskStream、connectTaskStream

## 后端执行 + 通知 + 核心控件

> EN: Backend execution + notification + core controls

这里叫**后台任务中心**：执行在后端（开放执行器），状态真源在服务端，前端只登记、投影、转发按钮。没有前端 pull 心跳、没有状态源、没有双时钟租约、没有 tombstone 判死——终态由执行器结果或服务端投影直接驱动一次。消费方只写两处接线：`mountTaskUI` 注册 handlers / 订阅终态、`startTask` 发起；展示用核心原生的 `TaskBar`（icon/pill 形态、sm/md/lg 尺寸、宽度与跑马灯），不用自己画列表。

> EN: This is the **background task hub**: work runs on the backend through open executors, the server owns task state, and the front end only registers, projects and forwards button presses. There is no client pull heartbeat, no status source, no dual-clock lease and no tombstone gate — a terminal state is driven once by the executor result or a server projection. Consumers write two wiring points: `mountTaskUI` registers handlers / terminal callback, `startTask` starts work; display uses the original `TaskBar` (icon/pill forms, sm/md/lg sizes, width and marquee) — no hand-drawn list.

`TaskBar` 面板是**页面级瞬时浮层**，层级低于抽屉 / 弹窗 / 耳朵 / 菜单：视觉上由主浮层遮罩自然盖住，永远不许浮到弹窗遮罩之上；面板从不被隐藏或恢复，弹窗关掉后它本来就在。行为侧只认标准模态语义（原生 `dialog` / `aria-modal="true"` / `alertdialog`）：只要页面存在活动模态，外部点击、Esc、触发器都不改 `open`；模态关闭后这些路径恢复。外部收起由 `pointerdown` 采样模态、`click` 双时刻判定：既覆盖「点外部按钮开弹窗」时弹窗尚未挂载，也覆盖「点关闭弹窗」时 click 已卸载但 pointerdown 仍开着。不声明模态语义的自绘浮层只能得到视觉遮挡，得不到事件冻结——这是浮层自身的可访问性契约，不是 TaskBar 去猜私有类名。受控 `onOpenChange(false)` 幂等可重复发；不回写会让面板停在受控的 `true`。

> EN: The `TaskBar` panel is a **page-level transient floating layer** below drawers / modals / ears / menus: the primary overlay mask covers it visually; it is never hidden or restored, so it is still there when the overlay closes. Behavior uses standard modal semantics only (native `dialog`, `aria-modal="true"`, `alertdialog`): while an active modal exists, outside clicks, Escape and the trigger never change `open`; those paths resume when it closes. Outside dismissal samples modal state on `pointerdown` and decides on `click` using both moments: a click that opens a modal is judged after it mounts, and a click that closes a modal is not mistaken for an outside click on the task panel. A custom overlay that does not declare modal semantics gets visual coverage but not event freezing — that is the overlay's accessibility contract, not something TaskBar should guess from private class names. Controlled `onOpenChange(false)` is idempotent and may repeat; not writing it back keeps the panel pinned to controlled `true`.

所有配置都是**纯数据跟着记录走**：标题、Toast、通知、按钮文案与显示时机在发起时声明，任何页面看到同一条任务都按同一份配置渲染，不需要发起页在场。跨页只传结构化克隆安全的值，不带函数、组件或 Promise。

> EN: All configuration is **plain data carried by the record**: title, toast, notification, button labels and visibility are declared at start time, so every page renders the same task from the same configuration without the originating page being present. Only structured-cloneable values cross pages — no functions, components or promises.

**所有对外显示的标题都必须是 `{ category, description }` 两段**，核心统一渲染成 `分类丨说明`（如 `任务结案丨后台任务 SSE 401 零延迟无限重连`）。分类由调用方自己定，建议中文 2–4 字、英文最多 2 个单词；核心**不校验字数、不写死分类字典**，整串过长由跑马灯在 hover 时展开。迁移时把原来的 `title: string` 改成对象，旧字符串帧会被拒收，不存在字符串兜底。

> EN: **Every user-visible title must be `{ category, description }`**; the core renders it as `category丨description` (for example `Task closed丨Background job SSE 401 reconnected`). The caller owns the category: 2–4 Chinese characters or at most two English words is recommended; the core does not validate length or hard-code a category dictionary, and overlong text expands on hover through the marquee. Migrate `title: string` to the object form — legacy string frames are rejected, with no string fallback.

```ts id="bt-start-example"
import { startTask } from 'dsh-plugin-core/adv/tasks'

// await 等的是登记成功，不是任务跑完。标题 / 通知 / 按钮全是纯数据，跟着记录走。
await startTask({
  project: 'dsh-task-reminder',
  group: 'scan',
  title: { category: '任务结案', description: '扫描工作区' }, // 分类 + 说明两段，展示成「分类丨说明」
  key: 'scan:workspace-1',          // 同 (project, key) 同时最多一条，重复发起就地更新
  kind: 'reminder:scan',            // 开放执行器名，核心不枚举、不校验
  args: { path: '/ws' },            // 纯数据，过不了进程边界，不带函数

  toast: {                          // 终态弹卡；整态不写 = 该态不弹
    success: { title: { category: '任务结案', description: '扫描完成' }, button: { id: 'view', text: '看日志' }, scope: 'all' },
    failure: { title: { category: '任务失败', description: '扫描中断' }, scope: 'origin' },
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
// 点行按钮后默认收起面板；false = 保持 open，遮罩会自然盖住它
h(TaskBar, { closeOnAction: false, groups: ['scan'] })
// 受控：传 open 必须同时接 onOpenChange 并回写；onOpenChange(false) 幂等，可重复发
h(TaskBar, { open, onOpenChange: setOpen, groups: ['scan'] })
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

选择口径：要给用户看就配 `toast`，要跨组件广播事情就发 `notify`，要在注册 UI 里干活就用 `onSettled`。三者不在同一层：前两者是声明在任务记录上的纯数据、由核心按终态分发；`onSettled` 是 `mountTaskUI` 的 UI 接线。因此下面的「三通道」只指 toast / notify / 列表按钮，**不含 `onSettled`**。三者都能表达成败，但交付形式不同：toast 是核心消化后的弹卡，notify 是纯数据消息（成败只落在 `level`），onSettled 是原始 `outcome` 加整条记录。

> EN: Rule of thumb: configure `toast` to show something to the user, send `notify` to broadcast an event across components, and use `onSettled` to do work inside a registered UI. They are not three flavours of the same channel: the first two are plain data on the task record, dispatched by the core on settlement; `onSettled` is `mountTaskUI` wiring. The "three channels" below therefore mean toast / notify / list buttons and **exclude `onSettled`**. All three can express success or failure, but they deliver it differently: toast is a card rendered by the core, notify is a plain message whose outcome only appears as `level`, and onSettled hands over the raw `outcome` plus the whole record.

三条通道各司其职、互不混用：**Toast** 是终态弹卡，`toast.success` / `toast.failure` 两态完全对称，每态可配 `scope`（`all` 每个页面都弹、`origin` 只发起页弹）与一个按钮（`TaskButton`：`{ id, text, icon?, color? }`）；**notify** 是终态消息，`message` + `detail` 纯数据，`scope` 同上，核心只把通知发出去、不做任何 UI（弹卡/alert 由接收方自己决定）；`broadcast` 字段保留兼容但核心不再据此决定发不发，范围由订阅方的 scope/project 决定；**列表按钮**是 `rowButtons: [{ id, text, when }]`，`when` ∈ `running` / `done` / `failed` / `always`（缺省 always），同一 id 可按状态重复声明，跟着记录走。

> EN: Three channels with separate jobs: **toast** is the terminal card — `toast.success` / `toast.failure` are fully symmetric, each with a `scope` (`all` every page, `origin` only the originating page) and one button (`TaskButton`: `{ id, text, icon?, color? }`). **Notify** is a terminal message — `message` plus plain `detail`, the same `scope`, the core only sends the notification and does no UI (cards/alerts are a decision by the receiver); the `broadcast` field is kept for compatibility but the core no longer uses it to decide whether to send — scope is decided by the scope/project chosen by the subscriber. **List buttons** are `rowButtons: [{ id, text, when }]`, where `when` is `running` / `done` / `failed` / `always` (default always); the same id may be declared repeatedly per state and travels with the record.

按钮 id 查的是本页 `handlers`（列表与 Toast 共用同一份）。**所有按钮在所有页都画**，不隐藏、不置灰，也不按 origin 或 getHandler 过滤——点击走 `pressTaskButton` → `selectPanel(panelId)` 跳回发起面板再执行 handler，「查看」这类动作的 UI 落在发起面板上。这里的「所有页」受 scope 约束：`scope:"all"` 每页弹卡且每页都有按钮，`scope:"origin"` 只在发起页弹卡（其它页连卡都没有，自然没有按钮）。`panelId` 由核心在 `startTask` 时自动记录（本地与服务端模式都记，随提交给服务端回填），消费方不传。若 handler 找不到（条目已失效或注册它的插件已卸载），Toast 按钮与列表按钮都给一次提示（走核心 i18n）；列表按钮还可传 `onActionFailure` 自己接管。终态只分发一次：本地执行与服务端投影不会重复弹卡。

> EN: A button id resolves against this page's `handlers` (shared by the list and toast). **Every button is drawn on every page** — never hidden, never greyed out, never filtered by origin or getHandler — and a click goes through `pressTaskButton` → `selectPanel(panelId)` to jump back to the originating panel before running the handler, so a "view" action lands its UI there. "Every page" is still bounded by scope: `scope:'all'` toasts and buttons on every page, `scope:'origin'` toasts only on the originating page (no card elsewhere, hence no button). `panelId` is recorded automatically by the core in `startTask` (both local and server modes, submitted for server backfill); consumers never pass it. If the handler is missing (stale entry or the registering plugin was unloaded), both the toast button and the list button give one notice (through the core i18n); list buttons may also pass `onActionFailure` to handle it themselves. Terminal states are delivered once: local execution and server projection never double-toast.

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `toast.success / failure` | `TaskToastState \| undefined` | — | undefined | 每态独立；整态不写 = 该态不弹卡 | Per state; omitting the whole state means no card for it |
| `startTask.title` | `DisplayTitle` | 必填 | — | 任务行标题：{ category, description }，核心渲染成「分类丨说明」，分类建议中文 2–4 字 / 英文最多 2 词，超长跑马灯 | Task row title: { category, description }, rendered as "category丨description"; 2–4 Chinese characters or at most two English words recommended, marquee when overlong |
| `toast.<态>.title` | `DisplayTitle` | 该态要弹卡时必填 | — | 卡片主行：{ category, description }，同样按「分类丨说明」渲染 | Card headline: { category, description }, rendered the same way |
| `toast.<态>.button` | `TaskButton \| undefined` | — | undefined | 该态一个按钮：{ id, text, icon?, color? }，id 对应 handlers；画在每页（scope:all）或发起页（scope:origin） | One button for that state: { id, text, icon?, color? }; id resolves to handlers; drawn on every page (scope:all) or the originating page (scope:origin) |
| `toast.<态>.scope` | `'all' \| 'origin'` | — | 'origin' | 所有页面 / 只有发起页 | Every page / originating page only |
| `notify.<态>.message` | `string` | — | — | 通知正文 | Notification text |
| `notify.<态>.detail` | `NotifyDetail \| undefined` | — | undefined | 附带的纯 JSON，接收方自己取 | Attached plain JSON, read by the receiver |
| `notify.<态>.level` | `'success' \| 'error'` | — | 按终态派生 | 任务层把 outcome 映射成通用 level；消息本身不带 taskId / outcome，运行时总线对任务无语义 | The task layer maps outcome to a generic level; the message carries no taskId/outcome and the runtime bus has no task semantics |
| `notify.<态>.scope` | `'all' \| 'origin'` | — | 'origin' | 所有标签页 / 只在发起的那个标签页（页面级 origin，切面板不影响）；两态可不同 | Every tab / only the originating tab (page-level origin; switching panels does not affect it); per state |
| `notify.<态>.broadcast` | `'plugin' \| 'global' \| undefined` | — | undefined | 兼容字段：核心忽略它，notify 一律发通知；范围由订阅方的 scope / project 决定 | Compatibility field: ignored by the core — notify always sends; scope is decided by the scope/project chosen by the subscriber |
| `rowButtons[]` | `readonly TaskRowButton[]` | — | undefined | 列表行按钮声明，文案与 when 跟着记录走 | List-row button declarations; labels and when travel with the record |
| `rowButtons[].when` | `'running' \| 'done' \| 'failed' \| 'always' \| undefined` | — | 'always' | 显示时机；同一 id 可按状态重复声明 | Visibility; the same id may be declared repeatedly per state |
| `subscribeTaskNotifications(options)` | `(options) => () => void` | — | — | 收任务广播：scope=plugin 只收同项目（不传 project 时回落全局默认项目，没设则报错），global 收所有；收到纯数据自己处理 | Receive task broadcasts: scope=plugin filters to same project (falls back to the global default project when project is omitted, throws if unset), global receives all; plain data, consumer decides |
| `mountTaskUI(options)` | `(options: MountTaskUIOptions) => () => void` | — | — | 注册 handlers + 订阅终态；handlers 按 project 命名空间（同名按钮不同项目互不覆盖），返回注销函数 | Registers handlers and subscribes to terminal states; handlers are namespaced by project (same button id in different projects does not collide); returns an unsubscribe function |
| `TaskBar` | `React component` | — | — | 核心原生展示栏：pill/icon 形态、sm/md/lg 尺寸、固定宽 / 最小宽 / 最大宽，超长 hover 跑马灯；数据来自共享池 | Core native bar: pill/icon forms, sm/md/lg sizes, fixed/min/max width with hover marquee; reads the shared pool |
| `TaskBar.closeOnAction` | `boolean` | — | true | 点行按钮后是否收起面板；false 保持展开，活动模态的遮罩自然盖住它，模态内操作不改 open；模态关闭后外部点击 / Esc / 触发器照常收 | Close the panel after a row action; false keeps it open under an active modal mask without changing open; after the modal closes, outside click / Escape / trigger close normally |
| `TaskBar.open` | `boolean \| undefined` | — | undefined | 受控展开态；传了就必须同时传 onOpenChange 并回写，运行中不要切换受控 / 非受控 | Controlled open state; pass together with onOpenChange and write it back; never switch controlled/uncontrolled at runtime |
| `TaskBar.onOpenChange` | `(open: boolean) => void` | — | undefined | 展开态变化；自动收起发 false、触发器点开发 true；回调幂等可重复发，受控时必须回写 | Open-state changes; automatic dismissal emits false and the trigger emits true; idempotent and may repeat; controlled callers must write back |
| `pressTaskButton(buttonId, taskId)` | `(buttonId: string, taskId: string) => boolean` | — | — | 先切回发起面板再执行 handler；找不到返回 false | Switches back to the originating panel before running the handler; false when not found |

## 交付边界：toast / notify / onSettled

> EN: Delivery boundaries: toast / notify / onSettled

这三者都能表达成败，但处在不同的层次、由不同的消费者接管。`onSettled` 是 UI 接线，不是第四种通知通道；它不参与跨页广播，核心列表的刷新也不依赖它。选择口径：要给用户看就配 toast，要跨组件广播事情就发 notify，要在注册 UI 里干活就用 onSettled。

> EN: All three can express success or failure, but they live at different layers and are consumed by different parties. `onSettled` is UI wiring, not a fourth notification channel: it does not broadcast across pages, and the core list does not depend on it to refresh. Choose by intent: configure toast to show the user, send notify to broadcast an event across components, and wire onSettled to do work inside a registered UI.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `层次` | `toast / notify / onSettled` | — | toast：任务记录上的显示配置，核心按终态挑一份弹卡；notify：runtime 通用通知总线的纯事件；onSettled：任务层 UI 接线回调 | toast: display config on the task record, picked by the core on settlement; notify: plain event on the runtime bus; onSettled: task-layer UI wiring callback |
| `消费者` | `toast / notify / onSettled` | — | toast：核心直接弹卡，消费方不写 UI；notify：订阅方自己决定弹卡 / 刷新 / 转发；onSettled：调用 mountTaskUI 并传入它的本页 UI | toast: the core renders the card, consumers write no UI; notify: subscribers decide whether to show, refresh or forward; onSettled: only the in-page UI that called mountTaskUI and supplied it |
| `页面范围` | `toast / notify / onSettled` | — | toast 按 scope 决定本页 / 所有页；notify 经事件总线到本页与同源其它页；onSettled 只在本标签页进程内，不跨页 | toast uses scope for this page or all pages; notify reaches local and same-origin subscribers through the bus; onSettled stays inside the current tab process |
| `携带数据` | `toast / notify / onSettled` | — | toast：按终态选中的文案 + 可选按钮，核心消化成败；notify：message + 通用 level + detail，刻意不带 taskId / outcome；onSettled：完整 TaskRecord + outcome 原文 | toast: selected copy plus optional button, with outcome already consumed by the core; notify: message plus generic level and detail, deliberately without taskId/outcome; onSettled: the full TaskRecord and raw outcome |
| `典型场景` | `toast / notify / onSettled` | — | toast：终态需要直接可见反馈且不依赖发起页在场；notify：事件要与任务 UI 解耦，接收方按自身职责处理；onSettled：已挂载的 UI 要归档或刷新自己的数据 | toast: terminal feedback must be directly visible without the originating page; notify: an event must stay decoupled from task UI and receivers handle it on their own terms; onSettled: a mounted UI needs to archive or refresh its own data |

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `mountTaskUI.onSettled` | `((task: TaskRecord, outcome: TaskSettlement['outcome']) => void) \| undefined` | undefined | 本页 UI 接线；不传就不注册，核心列表刷新与它无关 | In-page UI wiring; omitted means no listener, and the core list refresh is independent of it |
| `TaskSettlement` | `{ task: TaskRecord; outcome: 'done' \| 'failed' }` | — | 终态回调载荷：整条归一化记录加原始 outcome | Settlement payload: the full normalized record plus the raw outcome |

## 服务端投影：SSE 是唯一状态通道

> EN: Server projection: SSE is the only state channel

服务端是状态真源：任务执行、进度推进、终态判定都在服务端。`serveTaskStream` 注册一条 SSE 路由，三条流物理隔离：`event: task-snapshot`（全量基线）与 `event: task`（进度/终态状态）只投影列表、**永不弹卡**；`event: task-notice`（带唯一 id 的一次性完成通知）才触发 toast/notify。`authorize` 强制必填，归属过滤在服务端按 viewer 做。服务端按阶段分类错误：鉴权失败（`authorize` 抛错或返回空）回 401，服务侧故障（订阅/快照/推流失败）回 503——绝不把服务故障写成 401。客户端 `connectTaskCenter({ streamUrl, onGiveUp })` 订阅：退避档只约束「无数据进展的连接」（连上就 EOF、首帧前 reject、fetch 失败），档位用尽即放弃并回调 `onGiveUp`；一旦某轮读到过字节（含保活），无论 EOF 还是异常断开都算有进展、退避归零继续重连；永久错误（其余 4xx）立即停流并上报。`onGiveUp` 是 `TaskCenterHost` 字段、默认接线即可拿到（401 的 `reason.permanent=true`）。永久错误让单飞协调器进入停机（halted）：让出锁、停掉重申请，杜绝无限轮转刷鉴权失败；恢复靠页面恢复可见 / 网络恢复（`visibilitychange` / `online`）自动唤醒，或应用在 `onGiveUp` 里刷新凭证后重新调一次 `connectTaskCenter` 触发 `resume`（`headers` 是函数，新连接取到新 token），两条路都不会永久离线。连续两次 permanent 失败后进入冷却窗口，窗口内的 resume / 在线唤醒 no-op（只有读到真实 SSE 字节才清零，不是定时到点）——「有界」是 core 的真实保证，不是消费方自觉；`autoRecoverOnOnline:false` 可关闭在线唤醒，供「仅显式恢复」应用使用——开关每次 online 事件读取，监听器始终只绑一次，接线后改值即时生效。无 Web Locks 时保持离线；Node 直连路径在 permanent giveUp 后由再次接线重建连接（同一冷却语义），401 计数在 `onGiveUp` 回调之后累加，回调内同步重接的第二次失败才计入连败。通知按 id 存 sessionStorage 去重（有界 512），另按 project 记已见最大 `settledAt` 水位：超过 512 条后最早那批 id 被挤出时，更早的回放仍被水位吞掉（同毫秒靠 id 去重，不误伤）；sessionStorage 写入失败时读路径并集内存 fallback 与存储值（ids 去重、watermark 取最大），配额满也不失效。每个标签页各自独立，关页即清——`scope:"all"` 才能让同源每个页面各弹一次。断线期间结算的通知靠服务端 source 的 outbox 回放补发。关键不变量：状态可反复重放，通知是一次性事件——弹卡绝不挂在状态投影上（参照 ledger 的通道 A/B 模式）。

> EN: The server owns the truth: execution, progress and settlement all happen there. `serveTaskStream` registers one SSE route with three physically separated streams: `event: task-snapshot` (full baseline) and `event: task` (progress/terminal state) only project the list and **never announce**; `event: task-notice` (a one-shot completion event with a unique id) is the only toast/notify trigger. `authorize` is mandatory and viewer-based ownership filtering happens server-side. Errors are classified by phase: auth failure (`authorize` throws or returns empty) is 401, service-side failure (subscribe/snapshot/streaming) is 503 — a service fault is never written as 401. Clients subscribe with `connectTaskCenter({ streamUrl, onGiveUp })`: the bounded retry applies only to connections with **no data progress** (immediate EOF, reject before first frame, fetch failure) — exhausting the delays gives up and calls `onGiveUp`; once a round has read any bytes (keep-alive included), EOF or abnormal disconnect both count as progress and reset the budget to keep reconnecting; permanent faults (other 4xx) stop immediately and report. `onGiveUp` is a `TaskCenterHost` field available on the default wiring (401 has `reason.permanent=true`). A permanent fault puts the single-flight coordinator into a halted state: it releases its lock and stops re-requesting, so it never spins on repeated auth failures. It resumes either automatically on visibility / network recovery (`visibilitychange` / `online`), or when the app refreshes credentials in `onGiveUp` and calls `connectTaskCenter` once more to trigger `resume` (`headers` is a function, so the new connection picks up the new token) — neither path stays permanently offline. After two consecutive permanent failures a cooldown window applies: resume / network wake is a no-op inside it (reset only on real SSE bytes, never on a timer) — "bounded" is now a core guarantee rather than consumer discipline, and `autoRecoverOnOnline:false` disables network wake for strict explicit-only apps — the switch is read on every online event while the listener stays bound exactly once, so changing it after wiring takes effect immediately. Without Web Locks it stays offline; the Node direct path rebuilds on re-wiring after a permanent giveUp with the same cooldown semantics, counting permanent failures after the `onGiveUp` callback so a synchronous re-wire inside it is not swallowed by the cooldown. Notices are de-duplicated by id in sessionStorage (bounded to 512) plus a per-project `settledAt` watermark: once the id set overflows, older replays are still swallowed by the watermark (same-millisecond notices rely on id de-duplication); if sessionStorage writes fail, the read path unions the in-memory fallback with the stored value (ids de-duplicated, watermark maxed), so quota errors do not break de-duplication; refresh / reconnect replays of history never re-announce, while each tab keeps its own copy and clears on close — that is what lets `scope:"all"` announce once per same-origin page. Notices settled during a disconnect are replayed from the server source outbox. Core invariant: state is replayable, notices are one-shot — announcing is never wired to state projection (mirrors ledger's channel A/B pattern).

单飞协调器的正确性契约（v0.45.x，含后续加固）：① 届用 Lamport `{tick,id}`，最大 tick 只由持锁 owner 写 localStorage（follower 不写，避免跨标签 read-modify-write 把高值覆盖回低值），无存储退模块内存且读取取存储与内存的最大值，新标签继承后再 +1；跨 realm（隐私模式 / 存储被清空，各标签内存兜底独立）出现低届 owner 时，持有更高届的 follower 在低届权威消息（signal / state-reply / frame）上广播 fencing claim，低届 owner 收到更高届 claim 立即让锁并重铸更高届——晚重拉也能自愈，这是不依赖共享存储的唯一收敛路径。② `signal` 只提示重拉基线、不安装届，`state-reply` 是唯一安装入口，旧届 reply 丢弃。③ 通知回放带接收方水位 `noticeSince`（已收通知的最大服务端 `settledAt`），owner 回放 `settledAt >= since` 的项：新标签从加入时刻起算不被历史灌满，同毫秒多投由 id 去重兜底；该水位只裁本地 BC 回放、不是服务端 cursor，服务端须用真实时钟生成 `settledAt`，不要给远未来的值；断线期间的通知仍由服务端 outbox 回放补发。④ `visibilitychange` 隐藏时也触发，`online` / `pageshow` / `resume` 也可能在后台发生——所有唤醒事件统一过可见性闸门，隐藏期间不清 halted。⑤ 跨标签基线只发真源已确认的行：本地乐观行（POST 在飞）不外泄，否则回滚只在本标签生效、别的标签留下永不消失的幽灵 running。

> EN: Correctness contracts of the single-flight coordinator (v0.45.x, with later hardening): (1) epochs are Lamport `{tick,id}`; the max tick is written to localStorage only by the lock-holding owner (followers never write, avoiding a cross-tab read-modify-write that could overwrite a high value with a lower one), with a module-memory fallback whose max is taken together with the stored value; a new tab inherits that maximum before incrementing. Across realms (private mode / cleared site data, where each tab has its own memory fallback), if a lower-epoch owner appears, a follower holding a higher epoch broadcasts a fencing claim on any low-epoch authoritative message (signal / state-reply / frame); the lower-epoch owner yields its lock immediately on receiving a higher claim and re-mints a higher epoch — late baseline refetches also self-heal, the only convergence path that does not rely on shared storage. (2) `signal` only hints a baseline refetch and never installs an epoch, while `state-reply` is the sole installation entry and stale-epoch replies are dropped. (3) Notice replay carries the receiver watermark `noticeSince` (max server `settledAt` already received); the owner replays items with `settledAt >= since`, so a fresh tab is not flooded with history and same-millisecond extras are safe thanks to id de-duplication; this watermark only trims local BC replay and is not a server cursor — the server must generate real-clock `settledAt` values, never far-future ones; notices settled during a disconnect still come from the server outbox. (4) `visibilitychange` also fires when hiding, and `online` / `pageshow` / `resume` can happen in the background too — every wake event passes the same visibility gate, so a hidden page never clears halted. (5) The cross-tab baseline carries only server-confirmed rows: local optimistic rows (POST in flight) are never exported, otherwise a rollback applies only to the originating tab and other tabs keep a ghost `running` row forever.

消费方 / 服务端必须履行的契约（core 不能单方代劳）：① 依赖必须升到与本版同号（以核心 `package.json` 为准），钉旧版则所有修复都不生效；core 不做旧版本兼容分支，且 store / executor 全局收口符号已随协议升 v2，同页混版互不污染。② `TaskNotice.id` 必须跨会话 / 宿主重启全局唯一——用 UUID 或持久化到磁盘的单调计数，不要只用内存 `++seq`；core 按 id 在 sessionStorage 有界去重（最近 512 个）并按 project 记 settledAt 水位，旧 id 被挤出后更早的回放仍被吞，但重启重号仍会被吞掉、不弹卡。③ 服务端必须在所有 SSE 帧 / 通知里回显提交体里的 `origin` / `panelId`（提交响应无需回显，core 不读它）；缺字段时 core fail-open 保留本地值并打一次 console.warn 让配置错误可发现（拒收会让任务从列表消失），但 `scope:'origin'` 的弹卡归属与「查看」跳回发起面板会失效。④ 同 key 的 `startedAt` 必须严格递增（`max(Date.now(), last+1)`）——它是运行实例身份，core 用 `<=` 吞同运行重放是刻意的；撞号时新 running 也会被当重放吞。做不到时需评审显式 `runId`（含 store 身份判定与文档同步），core 不单方扩展协议。⑤ 连续两次 permanent 401 后进入 core 冷却窗口：窗口内 resume / 在线唤醒 no-op，成功建流清零；在 `onGiveUp` 里同步刷新凭证后重接线仍立即生效。⑥ `online` 默认唤醒停机；设 `autoRecoverOnOnline:false` 可关闭此事件，供严格「仅显式恢复」应用使用——凭证就绪后显式调 `resume`。开关每次 online 事件读取、监听器始终只绑一次，先 false 后 true 后置改值即时生效（不重绑、不掐流）。

> EN: Contracts the consumer / server must fulfil (the core cannot do these unilaterally): (1) Depend on the matching version (see the core `package.json`); pinning an older release means none of the fixes apply — the core keeps no back-compat branch, and the store / executor global symbols moved to v2 with the protocol so mixed versions on one page stay isolated. (2) A `TaskNotice.id` must be globally unique across sessions and host restarts — use a UUID or a counter persisted to disk, never an in-memory `++seq`; the core de-duplicates by id in bounded sessionStorage (latest 512) plus a per-project `settledAt` watermark, so older replays are still swallowed after the id set overflows, but an id reused after restart is swallowed and no card is shown. (3) The server must echo `origin` / `panelId` from the submit body in every SSE frame / notice (the submit response need not echo them — the core never reads it); when missing the core fail-opens to local values and logs one console.warn so the misconfiguration is discoverable (rejecting would make the task vanish from the list), but `scope:'origin'` announcement ownership and "view" jumping back to the originating panel stop working. (4) `startedAt` must strictly increase for the same key (`max(Date.now(), last+1)`) — it is the run identity and the core deliberately swallows same-run replays with `<=`; a collision also swallows the new running frame. If that cannot be guaranteed, an explicit `runId` (including store identity checks and docs) needs a separate review — the core does not extend the protocol unilaterally. (5) After two consecutive permanent 401s the core enters a cooldown: resume / network wake is a no-op in that window and resets on a successful connection; refreshing credentials synchronously in `onGiveUp` and re-wiring still resumes immediately. (6) `online` wakes a halt by default; `autoRecoverOnOnline:false` disables it for strict explicit-only apps — call `resume` once credentials are ready. The switch is read on every online event and the listener is bound only once, so switching from false to true after wiring takes effect immediately without rebinding or dropping the in-flight stream.

`connectTaskLayout(ctx)` 是从宿主 client ctx 接 layout 的便捷入口：通过 `ctx.inject(['layout'])` 拿 layout 服务，发起时从 `panelInfo.getSnapshot().activePanelId` 自动记面板（宿主 0.2.2-rc.3 核实，不在 ILayout 顶层），点按钮时用 `selectPanel(panelId)` 切回。不传 `streamUrl` 时是纯本地内存模式，适合单测与预览站。

> EN: `connectTaskLayout(ctx)` is the convenience wiring from a host client ctx: it obtains the layout service through `ctx.inject(['layout'])`, records `panelInfo.getSnapshot().activePanelId` automatically at start (verified against host 0.2.2-rc.3 — it is not a top-level ILayout field), and calls `selectPanel(panelId)` on button presses. Without `streamUrl` it runs as a local in-memory mode for tests and the preview site.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `serveTaskStream(ctx, options)` | `(ctx, options: TaskStreamOptions) => () => void` | — | 宿主侧 SSE 端点；authorize 必填，source 给基线 + 订阅 | Host-side SSE endpoint; authorize is mandatory, source supplies baseline + subscribe |
| `connectTaskCenter(host)` | `(host: TaskCenterHost) => () => void` | — | 一次接线；带 streamUrl 时页面维护一条共享 SSE（以当前 streamUrl 为 key），同源多标签只建一条；同 key 重复调用累加引用、各自 disposer 归零才释放，key 变化则释放旧连接重建 | One-shot wiring; with streamUrl the page keeps one shared SSE keyed by the current streamUrl, so same-origin tabs use a single connection; repeated calls with the same key add a reference released when each disposer reaches zero, and a key change releases the old connection |
| `connectTaskLayout(ctx)` | `(ctx: LayoutClientContext) => () => void` | — | 从宿主 client ctx 接 layout：自动记 panelId、点按钮切回面板；返回 disposer，须挂 cleanup | Wires layout from a host client ctx: records panelId and switches back on button presses; returns a disposer that must be cleaned up |
| `projectTasks(records)` | `(records: readonly TaskRecord[]) => void` | — | 手动投影入口：只把记录投影进列表，不弹卡、不分发终态（弹卡只走 task-notice） | Manual projection entry: projects records into the list only — no cards, no terminal delivery (cards come only from task-notice) |
| `taskCenterStore` | `TaskStore` | 全局单例 | 同标签页共享的任务状态；getSnapshot / subscribe / select / getHandler / clearAll（全清：任务、幂等键、终态声明与 handlers，清后需重新 mountTaskUI） | Shared task state per tab; getSnapshot / subscribe / select / getHandler / clearAll (clears everything: tasks, idempotency keys, settlement claims and handlers — remount after) |

```ts id="bt-connect-example"
import { connectTaskCenter, connectTaskLayout } from 'dsh-plugin-core/adv/tasks'

// client apply 里接一次：核心自动记当前 panelId，点按钮先切回发起面板再执行 handler。
// 两个 disposer 都要挂进 cleanup —— 核心按 streamUrl 做 refcount，漏一个连接不会释放。
const offLayout = connectTaskLayout(ctx)

// 或者自己接 host：带 streamUrl 时自动订阅 SSE 并投影（同源多标签只建一条）。
const offTasks = connectTaskCenter({
  streamUrl: '/api/task-center/stream',
  headers: () => ({ authorization: token() }),
  activePanelId: () => currentPanel(),
  selectPanel: (id) => switchPanel(id),
})
ctx.effect(() => () => { offTasks(); offLayout() })
```

## TaskRecord：一条任务记录

> EN: TaskRecord: what one task record holds

记录全是服务端下发或调用方给的纯数据，跨页克隆安全、无函数。身份字段：`id`、`key`（同项目幂等）、`project` / `group`（两级分组）、`startedAt`；归属字段：`panelId`（核心自动记，点按钮切回面板用）、`origin`（核心自动记的发起标签页 id，scope:origin 据此判定弹卡）；执行字段：`kind` / `args` / `detail` / `icon`；展示字段：`progress` / `toast` / `notify` / `rowButtons`；终态字段：`state` / `reason` / `settledAt`。`settledAt` 是终态（`done` / `failed`）的**必填有限数**结算时刻，由终态真源（本地执行器或服务端）给出，`running` 帧不得携带；入口 `isTaskRecord` 按状态校验，终态缺结算时刻的帧被拒收——列表靠它算终态行停留与退场，缺了会导致终态行不消失、显示假计时。服务端 SSE 是状态真源，请勿省略；客户端不会补本地时间冒充服务端时钟。服务端模式下 `startTask` 先落一条带 `key`/`project`/`group` 的乐观 running 行再 POST（缺省都由核心补齐并随 payload 发出）；**服务端必须在所有 SSE 帧与通知里回显同一个 `key` 和提交体里的 `project`**（归一按 `(project,key)`），真源才归一覆盖乐观行——失配会留下一条永不消失的幽灵 `running` 行，且快速任务的终态可能被晚到的乐观行覆回。提交失败核心自动回滚乐观行。`origin` / `panelId` 由核心随提交体发出，服务端必须在帧与通知里回显；缺失时核心 fail-open 用本地值兜底，刻意选择「不漏结果」而非拒收（拒收会让任务从列表消失）。同 key 的 `startedAt` 必须严格递增：core 用它认运行实例，单方加随机或计数会伪造一个与真源对不上的身份；若服务端无法保证递增，需另行评审引入显式 `runId` 契约。

> EN: A record is all plain data from the server or the caller — structured-clone safe, no functions. Identity: `id`, `key` (idempotent per project), `project` / `group` (two-level grouping), `startedAt`; ownership: `panelId` (core-recorded, used to switch back on button presses) and `origin` (core-recorded originating tab id, the basis for scope:origin announcement); execution: `kind` / `args` / `detail` / `icon`; presentation: `progress` / `toast` / `notify` / `rowButtons`; terminal: `state` / `reason` / `settledAt`. `settledAt` is a **required finite number** for terminal states (`done` / `failed`), supplied by the terminal authority (local executor or server); `running` frames must not carry it. `isTaskRecord` validates by state and rejects terminal frames missing it — the list needs it for terminal row retention/eviction; without it rows never leave and show a fake timer. The server is the state source of truth via SSE: do not omit it; the client never injects a local timestamp to impersonate the server clock. In server mode `startTask` first writes an optimistic running row carrying `key`/`project`/`group` (defaults are filled by the core and sent in the payload); **the server must echo the same `key` and the submitted `project` in every SSE frame and notice** — reconciliation is by `(project,key)` — otherwise a ghost `running` row persists and the terminal state of a fast task can be overwritten by the late optimistic write. A failed submit rolls the optimistic row back automatically. `origin` / `panelId` are emitted by the core in the submit body and must be echoed by the server in every frame and notice; when absent the core fail-opens to local values, deliberately choosing "never lose a result" over rejection (rejecting would make the task vanish from the list). `startedAt` must strictly increase for the same key: the core uses it to identify a run, and inventing a random or counter value client-side would fabricate an identity the server cannot match. If the server cannot guarantee monotonicity, an explicit `runId` contract needs a separate review.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `record.state` | `'running' \| 'done' \| 'failed'` | — | 服务端投影下来的事实；终态到达后不再被迟到的 running 复活 | Fact projected from the server; a late running update cannot revive a settled state |
| `record.progress` | `TaskProgress \| undefined` | undefined | 最后一段话 + 更新时间 + 可选数值，显式字段，不进 detail | Last message + update time + optional numbers, an explicit field never stored in detail |
| `record.panelId` | `string \| undefined` | undefined | 发起面板；点按钮先切回它，再由 core 自动填 | Originating panel; buttons switch back to it first; filled automatically by the core |
| `record.origin` | `string \| undefined` | undefined | 发起标签页 id（core 自动记）；scope:origin 只在同 id 标签页弹卡，服务端未回填时按多弹兜底 | Originating tab id (core-recorded); scope:origin announces only on the matching tab, fails open when the server omits it |
| `startTask(input)` | `(input: StartTaskInput) => Promise<TaskRecord>` | — | 等登记成功，不等跑完；key 同项目幂等 | Resolves on registration, not completion; key is idempotent per project |

## 更新日志

本文件为生成投影，变更记录在同名 `.doc.ts` 真源与本仓 git 历史。
