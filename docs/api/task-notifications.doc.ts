// 后台任务中心的使用帮助 —— 真源（TS 数据模块）。md 与 demo 文档体都从这份派生。
// 契约口径与不变量见 docs/architecture/task-notifications.md。
import type { DocTopic } from '../development/doc-format.js'

const startExample = `import { startTask } from 'dsh-plugin-core/adv/tasks'

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
})`

const mountUiExample = `import { mountTaskUI } from 'dsh-plugin-core/ui/task-ui'

// 本页接线一次：列表与 Toast 共用这一份 handlers，终态只刷消费方自己的数据。
mountTaskUI({
  project: 'dsh-task-reminder',     // null / 省略 = 收所有项目
  groups: ['scan'],
  handlers: {
    view: (task) => openLogPanel(task.detail?.logPath),
    retry: (task) => void startScan(task.detail?.path),
  },
  onSettled: (task, outcome) => refreshBoard(),  // 核心列表自己刷，这里只刷自己的数据
})`

const mountListExample = `import { TaskBar } from 'dsh-plugin-core/adv/tasks'

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
h(TaskBar, { maxWidth: 110, groups: ['scan'] })`

const executorExample = `import { executors } from 'dsh-plugin-core/adv/tasks'

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
})`

const connectExample = `import { connectTaskLayout } from 'dsh-plugin-core/adv/tasks'

// client apply 里接一次：核心自动记当前 panelId，点按钮先切回发起面板再执行 handler。
connectTaskLayout(ctx)

// 或者自己接 host：带 streamUrl 时自动订阅 SSE 并投影。
import { connectTaskCenter } from 'dsh-plugin-core/adv/tasks'
const off = connectTaskCenter({
  streamUrl: '/api/task-center/stream',
  headers: () => ({ authorization: token() }),
  activePanelId: () => currentPanel(),
  selectPanel: (id) => switchPanel(id),
})`

const doc: DocTopic = {
  title: { zh: '后台任务中心', en: 'Background Task Hub' },
  exports: [
    'startTask',
    'mountTaskUI',
    'TaskBar',
    'connectTaskCenter',
    'connectTaskLayout',
    'defaultTaskHost',
    'pressTaskButton',
    'projectTasks',
    'subscribeTaskNotifications',
    'taskCenterStore',
    'executors',
    'createExecutorRegistry',
    'TaskRecord',
    'StartTaskInput',
    'TaskProgress',
    'TaskToastConfig',
    'TaskNotifyConfig',
    'TaskRowButton',
    'TaskNotificationRecord',
    'serveTaskStream',
    'connectTaskStream',
  ],
  sections: [
    {
      id: 'task-notifications',
      heading: { zh: '后端执行 + 通知 + 核心控件', en: 'Backend execution + notification + core controls' },
      prose: [
        {
          zh: '这里叫**后台任务中心**：执行在后端（开放执行器），状态真源在服务端，前端只登记、投影、转发按钮。没有前端 pull 心跳、没有状态源、没有双时钟租约、没有 tombstone 判死——终态由执行器结果或服务端投影直接驱动一次。消费方只写两处接线：`mountTaskUI` 注册 handlers / 订阅终态、`startTask` 发起；展示用核心原生的 `TaskBar`（icon/pill 形态、sm/md/lg 尺寸、宽度与跑马灯），不用自己画列表。',
          en: 'This is the **background task hub**: work runs on the backend through open executors, the server owns task state, and the front end only registers, projects and forwards button presses. There is no client pull heartbeat, no status source, no dual-clock lease and no tombstone gate — a terminal state is driven once by the executor result or a server projection. Consumers write two wiring points: `mountTaskUI` registers handlers / terminal callback, `startTask` starts work; display uses the original `TaskBar` (icon/pill forms, sm/md/lg sizes, width and marquee) — no hand-drawn list.',
        },
        {
          zh: '所有配置都是**纯数据跟着记录走**：标题、Toast、通知、按钮文案与显示时机在发起时声明，任何页面看到同一条任务都按同一份配置渲染，不需要发起页在场。跨页只传结构化克隆安全的值，不带函数、组件或 Promise。',
          en: 'All configuration is **plain data carried by the record**: title, toast, notification, button labels and visibility are declared at start time, so every page renders the same task from the same configuration without the originating page being present. Only structured-cloneable values cross pages — no functions, components or promises.',
        },
      ],
      code: [
        { id: 'bt-start-example', lang: 'ts', src: startExample },
        { id: 'bt-mount-ui-example', lang: 'ts', src: mountUiExample },
        { id: 'bt-taskbar-example', lang: 'ts', src: mountListExample },
      ],
    },
    {
      id: 'bt-executor',
      heading: { zh: '开放执行器：kind 任意，谁执行谁注册', en: 'Open executors: any kind, the executor registers itself' },
      prose: [
        {
          zh: '执行器注册表是**开放基础能力，不认识「任务」语义**：`kind` 是任意字符串，核心不枚举、不校验名字、不为某一种执行方式写死分支。宿主 agent（会话）有官方 API 可直接接；shell / 插件 host 脚本由插件在自己的 host 侧注册 handler（内部怎么执行由它决定），核心只负责登记、调度、进度与终态回传。同标签页所有插件副本共用一个注册表，A 注册的执行器 B 也能调到。',
          en: 'The executor registry is an **open primitive that knows nothing about "tasks"**: `kind` is any string, the core neither enumerates nor validates names and hard-codes no branch for a particular execution style. Host agents (sessions) have an official API and can be wired directly; shell / plugin host scripts register their own handler on the host side (how it runs is their decision), while the core only registers, dispatches and relays progress and terminal state. All plugin copies in one tab share one registry, so an executor registered by A is callable by B.',
        },
        {
          zh: '执行体拿到 `args`（纯数据）与 `ctx`：`ctx.report(progress)` 上报「最后一段话 + 可选数值进度」。返回 `{ outcome: \'done\' | \'failed\', reason? }` 即终态；抛错按 failed 结算。进度写进记录的显式字段 `progress`（message / updatedAt / current / total / percent），不塞进 `detail`。核心当前不提供取消信号，执行体不要等 `ctx.signal`。',
          en: 'A handler receives `args` (plain data) and `ctx`: `ctx.report(progress)` reports the last message plus optional numeric progress. Returning `{ outcome: \'done\' | \'failed\', reason? }` settles the task; a thrown error settles as failed. Progress lands in the explicit `progress` field (message / updatedAt / current / total / percent), never inside `detail`. There is no cancellation signal in the core today — handlers must not wait on `ctx.signal`.',
        },
      ],
      code: [{ id: 'bt-executor-example', lang: 'ts', src: executorExample }],
    },
    {
      id: 'bt-notify-channels',
      heading: { zh: '通知三通道：Toast、notify、列表按钮', en: 'Three notification channels: toast, notify, list buttons' },
      prose: [
        {
          zh: '三条通道各司其职、互不混用：**Toast** 是终态弹卡，`toast.success` / `toast.failure` 两态完全对称，每态可配 `scope`（`all` 每个页面都弹、`origin` 只发起页弹）与一个按钮（`{ id, text }`）；**notify** 是终态消息，`message` + `detail` 纯数据，`scope` 同上，另有 `broadcast`（`plugin` 同项目 / `global` 同宿主所有插件 / 不写不广播），收到后怎么处理由接收方自己决定；**列表按钮**是 `rowButtons: [{ id, text, when }]`，`when` ∈ `running` / `done` / `failed` / `always`（缺省 always），同一 id 可按状态重复声明，跟着记录走。',
          en: 'Three channels with separate jobs: **toast** is the terminal card — `toast.success` / `toast.failure` are fully symmetric, each with a `scope` (`all` every page, `origin` only the originating page) and one button (`{ id, text }`). **Notify** is a terminal message — `message` plus plain `detail`, the same `scope`, and a separate `broadcast` (`plugin` same project, `global` every plugin in the host, omitted means no broadcast); what a receiver does with it is its own decision. **List buttons** are `rowButtons: [{ id, text, when }]`, where `when` is `running` / `done` / `failed` / `always` (default always); the same id may be declared repeatedly per state and travels with the record.',
        },
        {
          zh: '按钮 id 查的是本页 `handlers`（列表与 Toast 共用同一份）。**本页没注册的按钮不画**，不出现死按钮。点击先 `selectPanel(panelId)` 切回发起面板，再执行 handler——这样「查看」这类动作才能把 UI 落在正确的面板上；`panelId` 由核心在 `startTask` 时自动记录，消费方不传。终态只分发一次：本地执行与服务端投影不会重复弹卡。',
          en: 'A button id resolves against this page\'s `handlers` (shared by the list and toast). **A button without a registered handler is not drawn**, so there are no dead buttons. A click first calls `selectPanel(panelId)` to return to the originating panel, then runs the handler — so a "view" action lands its UI on the right panel. `panelId` is recorded automatically by the core in `startTask`; consumers never pass it. Terminal states are delivered once: local execution and server projection never double-toast.',
        },
      ],
      api: [
        {
          id: 'bt-toast-api',
          rows: [
            { name: 'toast.success / failure', type: 'TaskToastState | undefined', def: 'undefined', desc: { zh: '每态独立；整态不写 = 该态不弹卡', en: 'Per state; omitting the whole state means no card for it' } },
            { name: 'toast.<态>.title', type: 'string', def: '—', required: '该态要弹卡时必填', desc: { zh: '卡片主行', en: 'Card headline' } },
            { name: 'toast.<态>.button', type: '{ id: string; text: string } | undefined', def: 'undefined', desc: { zh: '该态一个按钮，id 对应 handlers；跨页时只在发起页显示', en: 'One button for that state; id resolves to handlers, shown only on the originating page when cross-page' } },
            { name: 'toast.<态>.scope', type: "'all' | 'origin'", def: "'origin'", desc: { zh: '所有页面 / 只有发起页', en: 'Every page / originating page only' } },
            { name: 'notify.<态>.message', type: 'string', def: '—', desc: { zh: '通知正文', en: 'Notification text' } },
            { name: 'notify.<态>.detail', type: 'NotifyDetail | undefined', def: 'undefined', desc: { zh: '附带的纯 JSON，接收方自己取', en: 'Attached plain JSON, read by the receiver' } },
            { name: 'notify.<态>.scope', type: "'all' | 'origin'", def: "'origin'", desc: { zh: '所有页面 / 只有发起页；两态可不同', en: 'Every page / originating page only; per state' } },
            { name: 'notify.<态>.broadcast', type: "'plugin' | 'global' | undefined", def: 'undefined', desc: { zh: '同项目 / 同宿主所有插件 / 不广播；不带按钮', en: 'Same project / every plugin in the host / no broadcast; carries no buttons' } },
            { name: 'rowButtons[]', type: 'readonly TaskRowButton[]', def: 'undefined', desc: { zh: '列表行按钮声明，文案与 when 跟着记录走', en: 'List-row button declarations; labels and when travel with the record' } },
            { name: 'rowButtons[].when', type: "'running' | 'done' | 'failed' | 'always' | undefined", def: "'always'", desc: { zh: '显示时机；同一 id 可按状态重复声明', en: 'Visibility; the same id may be declared repeatedly per state' } },
            { name: 'subscribeTaskNotifications(options)', type: '(options) => () => void', def: '—', desc: { zh: '收任务广播：scope=plugin 只收同项目，global 收所有；收到纯数据自己处理', en: 'Receive task broadcasts: scope=plugin filters to same project, global receives all; plain data, consumer decides' } },
            { name: 'mountTaskUI(options)', type: '(options: MountTaskUIOptions) => () => void', def: '—', desc: { zh: '注册 handlers + 订阅终态；返回注销函数', en: 'Registers handlers and subscribes to terminal states; returns an unsubscribe function' } },
            { name: 'TaskBar', type: 'React component', def: '—', desc: { zh: '核心原生展示栏：pill/icon 形态、sm/md/lg 尺寸、固定宽 / 最小宽 / 最大宽，超长 hover 跑马灯；数据来自共享池', en: 'Core native bar: pill/icon forms, sm/md/lg sizes, fixed/min/max width with hover marquee; reads the shared pool' } },
            { name: 'pressTaskButton(buttonId, taskId)', type: '(buttonId: string, taskId: string) => boolean', def: '—', desc: { zh: '先切回发起面板再执行 handler；找不到返回 false', en: 'Switches back to the originating panel before running the handler; false when not found' } },
          ],
        },
      ],
    },
    {
      id: 'bt-sse',
      heading: { zh: '服务端投影：SSE 是唯一状态通道', en: 'Server projection: SSE is the only state channel' },
      prose: [
        {
          zh: '服务端是状态真源：任务执行、进度推进、终态判定都在服务端。`serveTaskStream` 注册一条 SSE 路由，三条流物理隔离：`event: task-snapshot`（全量基线）与 `event: task`（进度/终态状态）只投影列表、**永不弹卡**；`event: task-notice`（带唯一 id 的一次性完成通知）才触发 toast/notify。`authorize` 强制必填，归属过滤在服务端按 viewer 做。客户端 `connectTaskCenter({ streamUrl })` 订阅、断线退避重连；通知按 id 存 sessionStorage 去重（有界），刷新 / 重连重推历史不会重弹，而每个标签页各自独立，关页即清——`scope:"all"` 才能让同源每个页面各弹一次。断线期间结算的通知靠服务端 source 的 outbox 回放补发。关键不变量：状态可反复重放，通知是一次性事件——弹卡绝不挂在状态投影上（参照 ledger 的通道 A/B 模式）。',
          en: 'The server owns the truth: execution, progress and settlement all happen there. `serveTaskStream` registers one SSE route with three physically separated streams: `event: task-snapshot` (full baseline) and `event: task` (progress/terminal state) only project the list and **never announce**; `event: task-notice` (a one-shot completion event with a unique id) is the only toast/notify trigger. `authorize` is mandatory and viewer-based ownership filtering happens server-side. Clients subscribe with `connectTaskCenter({ streamUrl })` and reconnect with backoff; notices are de-duplicated by id in sessionStorage (bounded), so refresh / reconnect replays of history never re-announce, while each tab keeps its own copy and clears on close — that is what lets `scope:"all"` announce once per same-origin page. Notices settled during a disconnect are replayed from the server source outbox. Core invariant: state is replayable, notices are one-shot — announcing is never wired to state projection (mirrors ledger\'s channel A/B pattern).',
        },
        {
          zh: '`connectTaskLayout(ctx)` 是从宿主 client ctx 接 layout 的便捷入口：通过 `ctx.inject([\'layout\'])` 拿 layout 服务，发起时从 `panelInfo.getSnapshot().activePanelId` 自动记面板（宿主 0.2.2-rc.3 核实，不在 ILayout 顶层），点按钮时用 `selectPanel(panelId)` 切回。不传 `streamUrl` 时是纯本地内存模式，适合单测与预览站。',
          en: '`connectTaskLayout(ctx)` is the convenience wiring from a host client ctx: it obtains the layout service through `ctx.inject([\'layout\'])`, records `panelInfo.getSnapshot().activePanelId` automatically at start (verified against host 0.2.2-rc.3 — it is not a top-level ILayout field), and calls `selectPanel(panelId)` on button presses. Without `streamUrl` it runs as a local in-memory mode for tests and the preview site.',
        },
      ],
      api: [
        {
          id: 'bt-sse-api',
          rows: [
            { name: 'serveTaskStream(ctx, options)', type: '(ctx, options: TaskStreamOptions) => () => void', def: '—', desc: { zh: '宿主侧 SSE 端点；authorize 必填，source 给基线 + 订阅', en: 'Host-side SSE endpoint; authorize is mandatory, source supplies baseline + subscribe' } },
            { name: 'connectTaskCenter(host)', type: '(host: TaskCenterHost) => () => void', def: '—', desc: { zh: '一次接线；带 streamUrl 时自动订阅并重连，重复调用覆盖上一次', en: 'One-shot wiring; with streamUrl it subscribes and reconnects; repeated calls replace the previous one' } },
            { name: 'connectTaskLayout(ctx)', type: '(ctx: LayoutClientContext) => void', def: '—', desc: { zh: '从宿主 client ctx 接 layout：自动记 panelId、点按钮切回面板', en: 'Wires layout from a host client ctx: records panelId and switches back on button presses' } },
            { name: 'projectTasks(records)', type: '(records: readonly TaskRecord[]) => void', def: '—', desc: { zh: '手动投影入口；终态只分发一次', en: 'Manual projection entry; terminal states are delivered once' } },
            { name: 'taskCenterStore', type: 'TaskStore', def: '全局单例', desc: { zh: '同标签页共享的任务状态；getSnapshot / subscribe / select / getHandler', en: 'Shared task state per tab; getSnapshot / subscribe / select / getHandler' } },
          ],
        },
      ],
      code: [{ id: 'bt-connect-example', lang: 'ts', src: connectExample }],
    },
    {
      id: 'bt-record',
      heading: { zh: 'TaskRecord：一条任务记录', en: 'TaskRecord: what one task record holds' },
      prose: [
        {
          zh: '记录全是服务端下发或调用方给的纯数据，跨页克隆安全、无函数。身份字段：`id`、`key`（同项目幂等）、`project` / `group`（两级分组）、`startedAt`；归属字段：`panelId`（核心自动记）、`origin`；执行字段：`kind` / `args` / `detail` / `icon`；展示字段：`progress` / `toast` / `notify` / `rowButtons`；终态字段：`state` / `reason` / `settledAt`。',
          en: 'A record is all plain data from the server or the caller — structured-clone safe, no functions. Identity: `id`, `key` (idempotent per project), `project` / `group` (two-level grouping), `startedAt`; ownership: `panelId` (recorded by the core) and `origin`; execution: `kind` / `args` / `detail` / `icon`; presentation: `progress` / `toast` / `notify` / `rowButtons`; terminal: `state` / `reason` / `settledAt`.',
        },
      ],
      api: [
        {
          id: 'bt-record-api',
          rows: [
            { name: 'record.state', type: "'running' | 'done' | 'failed'", def: '—', desc: { zh: '服务端投影下来的事实；终态到达后不再被迟到的 running 复活', en: 'Fact projected from the server; a late running update cannot revive a settled state' } },
            { name: 'record.progress', type: 'TaskProgress | undefined', def: 'undefined', desc: { zh: '最后一段话 + 更新时间 + 可选数值，显式字段，不进 detail', en: 'Last message + update time + optional numbers, an explicit field never stored in detail' } },
            { name: 'record.panelId', type: 'string | undefined', def: 'undefined', desc: { zh: '发起面板；点按钮先切回它，再由 core 自动填', en: 'Originating panel; buttons switch back to it first; filled automatically by the core' } },
            { name: 'startTask(input)', type: '(input: StartTaskInput) => Promise<TaskRecord>', def: '—', desc: { zh: '等登记成功，不等跑完；key 同项目幂等', en: 'Resolves on registration, not completion; key is idempotent per project' } },
          ],
        },
      ],
    },
  ],
}

export default doc
