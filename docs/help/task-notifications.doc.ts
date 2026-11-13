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

// 三档：不传 = 本项目全部二级；数组 = 本项目这几个二级；'*' = 全站所有项目
const visible = selectTaskNotifications(snapshot, ['scan'])
const everything = selectTaskNotifications(snapshot, '*')

// 幂等：开同源标签页通道，并向在线页面要一次全量 baseline
taskNotifications.connect()

// 事件是一次性事实，不留存；退订函数照常调用
const off = subscribeTaskNotificationEvents((event) => {
  if (event.type === 'backgrounded') {
    // 收起发生了；任务仍在跑，快照里也看得到
  }
})
// off() 于卸载时调用`

const lifecycleExample = `import { notifyTask, setDefaultTaskProject } from 'dsh-plugin-core/ui'

// 项目在 app 入口设一次；core 取不到项目名，所以必须有人告诉它
setDefaultTaskProject('dsh-task-reminder')

// ① 自己管结束：拿到句柄，随时更新，自己收尾
const handle = notifyTask('扫描工作区文件', { group: 'scan', detail: { done: 12, total: 40 } })
handle.background()   // 只发 backgrounded 事件，不结算任务
handle.done('扫描完成')
// handle.fail('被用户取消')

// ② 包住一段异步：成功 done、失败 fail，结果与异常原样透传
await notifyTask.run('扫描工作区文件', () => runWork(), { group: 'scan' })

// ③ 只想广播一句：不进列表，只发 message 事件，不会闪
notifyMessage('已保存', { group: 'notice', icon: 'check', level: 'success' })

// 句柄已经在手时才用得上的兜底：与 run 同一个收尾，不改变原 Promise 的结算语义
// await handle.track(otherWork())   // otherWork(): Promise<void>，由调用方提供
// await handle.settled              // 只在真正结束时兑现；收起不兑现`

const doc: DocTopic = {
  title: { zh: '通知任务中心', en: 'Task Notification Hub' },
  exports: [
    'notifyTask',
    'notifyMessage',
    'taskNotifications',
    'taskNotificationEvents',
    'TASK_NOTIFICATIONS_LOCK_PREFIX',
    'TASK_NOTIFICATIONS_PROJECT_KEY',
    'setDefaultTaskProject',
    'getDefaultTaskProject',
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
          zh: '快照是 `{ tasks, revision }`，`tasks` 按开始时间再按 id 排序，跨页顺序确定；无变化不产生新对象，`getServerSnapshot()` 永远是同一个冻结空快照。`selectTaskNotifications()` 对同一快照与同一过滤条件返回同一数组。',
          en: 'A snapshot is `{ tasks, revision }`; `tasks` sorts by start time then id, so order is identical across pages. No change means no new object, and `getServerSnapshot()` always returns the same frozen empty snapshot. `selectTaskNotifications()` returns the same array for the same snapshot and filter.',
        },
        {
          zh: '两条路，别混用：要进列表、要监控、要能被结束的，用 `notifyTask`；只想广播一句、不需要留在列表里的，用 `notifyMessage(title, options?)`。后者**不写池、不动快照**（`revision` 不变），只发一个 `message` 事件，所以不会出现「列表闪一下」。反过来，用 `notifyTask(...).done()` 冒充广播会先 `registered` 再 `settled`，必闪一帧。',
          en: 'Two paths, not interchangeable: use `notifyTask` when the row must appear in the list, be monitored and be endable; use `notifyMessage(title, options?)` when you only need to announce something and it should not stay in the list. The latter writes nothing to the pool and does not touch the snapshot (`revision` stays put) — it only emits a `message` event, so the list cannot flash. Faking a broadcast with `notifyTask(...).done()` emits `registered` then `settled` and always flashes one frame.',
        },
        {
          zh: '想让提示在所有页面都弹：`notify(msg, { broadcast: true })`。本页**不单独弹**，只发广播，再由内置接收端渲染 —— 一条提示只出现一次，开几个标签页就各弹一次；停留时长与本页提示一致（2600ms），不随消息走。接收端不挂在提示界面上：页面加载时调一次 `connectToasts()`（纯逻辑、零 DOM）就接好，界面由 `mountToasts()` 单独挂 —— 否则「没弹过提示的页面」收不到广播。跨页只能传纯数据，所以带 `actions`（函数）的提示无法广播：类型上 `broadcast: true` 分支把 `actions` 声明成 `never`，写了就编译不过；绕过类型的 JS 调用方在运行期当场抛错，不静默丢按钮（与 `detail` 传函数同一口径）。广播发不出去时（如没设默认项目）降级为本页提示，消息不丢。只用本页提示的，直接 `notify(msg)`，完全不经过通知中心。',
          en: 'To make a toast appear on every page, use `notify(msg, { broadcast: true })`. The current page does not render it directly — it broadcasts, and the built-in receiver renders, so one message shows once and every open tab shows its own copy; duration matches local toasts (2600ms) and is not carried by the message. The receiver is not tied to the toast UI: call `connectToasts()` once per page (pure logic, no DOM) and it is wired; `mountToasts()` mounts the UI separately — without it a page that never showed a toast would miss every broadcast. Only plain data crosses pages, so `actions` (functions) cannot be broadcast: on the `broadcast: true` branch `actions` is typed as `never`, so passing it does not compile, and a JS caller that bypasses types gets a runtime throw instead of a silently dropped button (same rule as passing a function as `detail`). If the broadcast cannot be sent (e.g. no default project set) it degrades to a local toast so the message is not lost. For a local toast, call `notify(msg)` — it never touches the hub.',
        },
        {
          zh: '图标：`icon`（图标名 / 图标字体类名）与 `iconSvg`（原始 SVG 源）都只是字符串，核心只存不解释，渲染与注入安全由消费端负责 —— 组件和 ReactNode 跨页传不了。',
          en: 'Icons: `icon` (an icon name or icon-font class) and `iconSvg` (raw SVG source) are plain strings; core stores them without interpreting, and rendering plus injection safety are the consumer\'s job — components and ReactNodes cannot cross pages.',
        },
        {
          zh: '两级分组：`project`（项目）在 app 入口用 `setDefaultTaskProject()` 设一次，`group` 是项目内的二级分类（缺省 `default`）。读取三档：不传 / 空数组 = 本项目全部二级；一个或多个名字 = 本项目这几个二级；`'*'` = 所有项目所有二级。第三参 `{ project }` 可以换项目，`{ project: null }` 表示不限项目。项目名 core 取不到，所以必须有人设；`projectLabel` / `groupLabel` 只覆盖显示名。',
          en: 'Two levels: `project` is set once at app start with `setDefaultTaskProject()`, and `group` is a second-level bucket inside it (default `default`). Reading has three tiers: omitted or empty = every group of the current project; one or more names = only those groups; `\'*\'` = every project and every group. A third argument `{ project }` switches projects, and `{ project: null }` drops the project filter. Core cannot discover a project name, so somebody must set it; `projectLabel` / `groupLabel` only override display names.',
        },
        {
          zh: '`detail` 收任意 JSON 值（对象、数组、数字、布尔、null），入池前库取一份私有副本：调用方之后改原对象不会污染状态，也不需要自己 `JSON.stringify`。函数、DOM 节点与类实例当场抛错，不会等到跨页广播时才炸。',
          en: '`detail` accepts any JSON value (object, array, number, boolean, null); the pool takes a private copy on the way in, so later mutation by the caller cannot change stored state and no `JSON.stringify` is needed. Functions, DOM nodes and class instances throw right away instead of failing later during the cross-page broadcast.',
        },
        {
          zh: '两个入口分工与 `oraPromise` / `toast.promise` / `withProgress` 一致：`notifyTask(title, options?)` 返回句柄，自己收尾；`notifyTask.run(title, work, options?)` 包住一段异步，成功与失败自动收尾并透传结果。第一参恒为标题，项目来自全局默认、二级分组来自 `options.group`，两者都能省；基础入口的返回类型不随参数变化。需要对象参数或池级能力时仍用 `taskNotifications.register()`。',
          en: 'The two entries split the work the way `oraPromise` / `toast.promise` / `withProgress` do: `notifyTask(title, options?)` returns a handle you settle yourself, while `notifyTask.run(title, work, options?)` wraps an async task, settling it either way and passing the result through. The first argument is always the title: the project comes from the global default and the group from `options.group`, so both can be omitted, and the base entry never changes its return type based on its arguments. Use `taskNotifications.register()` when you need an options object or pool-level control.',
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
          zh: '页面消失要有人收尾，否则留下永远 `running` 的僵尸条目：它不属于本页、本页也没有它的句柄，谁都结束不掉。判活用浏览器原生 Web Locks——每页持一把以 origin 命名的锁，其他页用 `ifAvailable` 探测同名锁，立刻拿得到就说明那页已经不在了；探测只发生在收到分片与页面重新可见时，没有定时器，连续两次（间隔 250ms）都拿得到才清。`navigator.locks` 不可用时不清理，其余行为不变。崩溃掉的渲染进程规范不保证释放锁，那类残留留到浏览器重启。',
          en: 'A vanished page must be cleaned up, otherwise a row stays `running` forever: it belongs to another page, this page holds no handle for it, and nobody can end it. Liveness uses native Web Locks — each page holds a lock named after its origin, and other pages probe the same name with `ifAvailable`: getting it immediately means that page is gone. Probes run only when a shard arrives or the tab becomes visible, never on a timer, and only two successful probes 250ms apart drop a shard. Without `navigator.locks` nothing is cleaned up and everything else stays as before. A crashed renderer is not guaranteed to release its lock by the spec, so that residue lasts until the browser restarts.',
        },
        {
          zh: '句柄会丢：组件重挂载、HMR、页面切走再回来，`useRef` 里的句柄就没了，但条目还在池里。`settleLocal(reason?)` 结束本页仍持有的全部任务并返回条数，不需要句柄；跨页条目一律不动。',
          en: 'Handles get lost: a component remount, HMR or switching pages clears the `useRef` that held them while the row stays in the pool. `settleLocal(reason?)` ends every task this page still owns and returns the count, without needing a handle; rows owned by other pages are never touched.',
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
            { name: 'setDefaultTaskProject(project)', type: '(project: string | undefined) => void', def: '—', required: 'app 入口调一次', desc: { zh: '设一级分组（项目）；挂在全局符号上，同页所有副本共享；传 undefined 清空（测试用）', en: 'Sets the first-level project on a global symbol so every copy on the page shares it; pass undefined to clear it (tests)' } },
            { name: 'getDefaultTaskProject()', type: '() => string | undefined', def: 'undefined', desc: { zh: '读当前默认项目', en: 'Reads the current default project' } },
            { name: 'notifyTask(title, options?)', type: '(title: string, options?: NotifyTaskOptions) => TaskNotificationHandle', def: '—', desc: { zh: '日常入口：项目取全局默认、二级分组取 options.group（缺省 default）；需要对象参数或池级能力时用 register', en: 'Everyday entry: project from the global default, group from options.group (default "default"); reach for register when you need an options object or pool-level control' } },
            { name: 'notifyTask.run(title, work, options?)', type: '<T>(title: string, work: Promise<T> | (() => Promise<T>), options?: NotifyTaskOptions) => Promise<T>', def: '—', desc: { zh: '包住一段异步：成功 done、失败 fail，结果与异常原样透传', en: 'Wraps an async task: done on success, fail on rejection, passing the result and error through' } },
            { name: 'notifyMessage(title, options?)', type: '(title: string, options?: NotifyMessageOptions) => TaskNotificationMessage', def: '—', desc: { zh: '纯广播：只发 message 事件，不进池、不动快照，因此列表不会闪', en: 'Pure broadcast: emits a message event only, writes no pool state and leaves the snapshot alone, so the list cannot flash' } },
            { name: 'getSnapshot()', type: '() => TaskNotificationSnapshot', def: '—', desc: { zh: '当前全量快照，引用稳定；可直接作 useSyncExternalStore 的第二参', en: 'Current full snapshot with a stable reference; use as the second useSyncExternalStore argument' } },
            { name: 'getServerSnapshot()', type: '() => TaskNotificationSnapshot', def: '冻结空快照', desc: { zh: 'SSR / 非宿主环境用，永远是同一个对象', en: 'For SSR and non-host environments; always the same object' } },
            { name: 'subscribe(listener)', type: '(listener: () => void) => () => void', def: '—', desc: { zh: '状态真变了才通知；返回退订函数', en: 'Notifies only on real state changes; returns an unsubscribe function' } },
            { name: 'connect()', type: '() => void', def: '—', desc: { zh: '幂等；开跨页通道并请求一次全量 baseline', en: 'Idempotent; opens the cross-page channel and requests one full baseline' } },
            { name: 'refresh()', type: '() => void', def: '—', desc: { zh: '重新向同源标签页要一次全量状态；休眠恢复时自动触发，平时不用手动调', en: 'Re-requests a full snapshot from same-origin tabs; runs automatically after sleep, no manual call needed' } },
            { name: 'select(groups?, options?)', type: '(groups?: TaskNotificationGroupFilter, options?: TaskNotificationSelectOptions) => readonly TaskNotificationRecord[]', def: '不传 = 本项目全部二级', desc: { zh: '池内自带缓存的过滤；与 selectTaskNotifications 同一套三档语义', en: 'Cached pool-level filtering; same three-tier contract as selectTaskNotifications' } },
            { name: 'register(input)', type: '(input: TaskNotificationInput) => TaskNotificationHandle', def: '—', desc: { zh: '登记一条真实任务并返回句柄', en: 'Registers a real task and returns its handle' } },
            { name: 'settleLocal(reason?)', type: '(reason?: string) => number', def: '—', desc: { zh: '结束本页仍持有的全部任务并返回条数，不需要句柄；跨页条目不动', en: 'Ends every task this page still owns and returns the count without needing a handle; rows from other pages are untouched' } },
            { name: 'canRestore(task)', type: '(task: TaskNotificationRecord) => boolean', def: '—', desc: { zh: '只有本页创建的条目可还原', en: 'Only rows created on this page can be restored' } },
            { name: 'requestRestore(taskId)', type: '(taskId: string) => boolean', def: '—', desc: { zh: '发本地 restored 事件；跨页条目返回 false，不跨页传递', en: 'Emits a local restored event; returns false for cross-page rows, never crosses pages' } },
            { name: 'dispose()', type: '() => void', def: '—', desc: { zh: '关通道与摘监听，保留状态；下次 connect 会复活并重发全量分片', en: 'Closes the channel and detaches listeners but keeps state; the next connect revives it and rebroadcasts a full shard' } },
          ],
        },
        {
          id: 'bt-handle-api',
          rows: [
            { name: 'input.project', type: 'string', def: '全局默认项目', required: '二者必有一个', desc: { zh: '一级分组；不传则取 setDefaultTaskProject 的值，两者都没有就抛错', en: 'First-level project; falls back to setDefaultTaskProject, and throws when neither exists' } },
            { name: 'input.group', type: 'string', def: "'default'", desc: { zh: '二级分组：项目内的分类；不能是空字符串', en: 'Second-level bucket inside the project; must not be empty' } },
            { name: 'input.title', type: 'string', def: '—', required: '必填', desc: { zh: '条目标题', en: 'Row title' } },
            { name: 'input.detail', type: 'TaskNotificationDetail', def: '—', desc: { zh: '任意 JSON 值（对象 / 数组 / 数字 / 布尔 / null）；入池前克隆私有副本，函数与类实例当场抛错', en: 'Any JSON value (object / array / number / boolean / null); cloned into a private copy on the way in, while functions and class instances throw immediately' } },
            { name: 'input.projectLabel / groupLabel', type: 'string', def: '—', desc: { zh: '项目 / 分组的显示名覆盖', en: 'Project / group display-name overrides' } },
            { name: 'handle.update(patch)', type: '(patch: TaskNotificationPatch) => void', def: '—', desc: { zh: '只改纯数据字段，随时可调用', en: 'Updates plain data fields, callable any time' } },
            { name: 'handle.background()', type: '() => void', def: '—', desc: { zh: '标记收起并发 backgrounded 事件，不结算', en: 'Marks the task backgrounded and emits a backgrounded event without settling' } },
            { name: 'handle.done(detail?) / fail(reason?)', type: '(detail?: TaskNotificationDetail) => void', def: '—', desc: { zh: '幂等；成功后条目立刻移出池并发 settled 事件', en: 'Idempotent; removes the row immediately and emits a settled event' } },
            { name: 'handle.track(promise)', type: '<T>(promise: Promise<T>) => Promise<T>', def: '—', desc: { zh: '句柄已在手时的兜底收尾；返回原 Promise。包一段异步的日常写法是 notifyTask.run', en: 'Fallback settlement when the handle is already in hand; returns the original promise. The everyday way to wrap async work is notifyTask.run' } },
            { name: 'handle.settled', type: 'Promise<TaskNotificationSettlement>', def: '—', desc: { zh: '只在真正结束时兑现；收起不兑现', en: 'Resolves only on a real ending, never on collapse' } },
            { name: 'subscribeTaskNotificationEvents(listener)', type: '(listener: TaskNotificationEventListener) => () => void', def: '—', desc: { zh: '监听 registered / updated / backgrounded / settled / restored / peer-left', en: 'Listens for registered / updated / backgrounded / settled / restored / peer-left' } },
            { name: 'createTaskNotificationPool(options?)', type: '(options?: TaskNotificationPoolOptions) => TaskNotificationPool', def: '—', desc: { zh: '独立池；测试可注入 origin / channelName / offline / lifecycle / locks（locks: null 关掉失联清理）', en: 'Standalone pool; tests can inject origin / channelName / offline / lifecycle / locks (locks: null disables dead-page cleanup)' } },
            { name: 'TASK_NOTIFICATIONS_LOCK_PREFIX', type: 'string', def: '—', desc: { zh: '存活锁名前缀，后接本页 origin；协议升级时随键一起换命名空间', en: 'Liveness lock-name prefix, followed by the page origin; the protocol bump carries it to a new namespace' } },
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
