// 通知任务中心的使用帮助 —— 真源（TS 数据模块）。md 与 demo 文档体都从这份派生。
// 本文只讲「怎么用」；契约口径与不变量在 docs/architecture/task-notifications.md。
import type { DocTopic } from '../development/doc-format.js'

const subscribeExample = `import { useSyncExternalStore } from 'react'
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
taskNotifications.connect()`

const lifecycleExample = `import { notifyTask, notifyMessage, setDefaultTaskProject } from 'dsh-plugin-core/ui'

setDefaultTaskProject('dsh-task-reminder')   // app 入口设一次

// ① 自己管结束
const handle = notifyTask('扫描工作区文件', { group: 'scan', detail: { done: 12, total: 40 } })
handle.update({ detail: { done: 20, total: 40 } })
handle.background()          // 收起到后台：只发 backgrounded 事件，不结算
handle.done('扫描完成')

// ② 包住一段异步：成功 done、失败 fail，结果与异常原样透传
await notifyTask.run('扫描工作区文件', () => runWork(), { group: 'scan' })

// ③ 只广播一句：不进列表、不闪
notifyMessage('已保存', { group: 'notice', icon: 'check', level: 'success' })`

const keyedExample = `import { notifyTask, taskKey, taskNotifications } from 'dsh-plugin-core/ui'

// 键 = 「让这两条算同一件事」的那几个值。稳定、可枚举，不放时间 / 随机数 / 进度文案。
const key = ['close', workspaceId, taskId]

// ① 只是要它在那儿：反复登记也只有一条，内容按最后一次刷新，句柄还是同一个
const handle = notifyTask('正在结案', { key, timeoutMs: 30 * 60_000 })
handle.done('已结案')

// ② 还要知道「是不是我刚起的」：created === false 说明本页已经在跑，别再起第二份活
const task = notifyTask.ensure('正在结案', { key })
if (task.created) void closeTask(workspaceId, taskId).finally(() => task.handle.done())

// ③ 读侧判断「这个任务是不是已经在处理中」：记录带着归一化后的键
const running = taskNotifications.select('*').some((t) => t.key === taskKey(key))`

const actionsExample = `import { notifyTask, taskNotifications } from 'dsh-plugin-core/ui'

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
if (!ok) showToast('该任务已无法还原')   // showToast 由调用方提供`

const doc: DocTopic = {
  title: { zh: '通知任务中心', en: 'Task Notification Hub' },
  exports: [
    'notifyTask',
    'notifyMessage',
    'taskNotifications',
    'taskKey',
    'TaskNotificationConflictError',
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
      heading: { zh: '长耗时任务：登记、订阅、跨页、按钮', en: 'Long tasks: register, subscribe, cross-page, actions' },
      prose: [
        {
          zh: '数据只在内存：本页与同源标签页各一份，刷新或关页即失；不落文件、不发请求、不轮询。跨页只传纯数据（结构化克隆可得），不带函数、组件或 Promise。',
          en: 'Data lives in memory only: one copy per page and per same-origin tab, gone on reload or close — no files, no requests, no polling. Only plain structured-cloneable data crosses pages: no functions, components or promises.',
        },
        {
          zh: '两条通道：**状态池**（`getSnapshot` / `subscribe`，可直接喂 `useSyncExternalStore`）与**事件总线**（`subscribeTaskNotificationEvents`，一次性事实，不留存）。要进列表、能被结束的用 `notifyTask`；只播一句、不进列表的用 `notifyMessage`。',
          en: 'Two channels: the **pool** (`getSnapshot` / `subscribe`, feeds `useSyncExternalStore`) and the **event bus** (`subscribeTaskNotificationEvents`, one-off facts, no history). Use `notifyTask` for rows that appear in the list and can be ended; `notifyMessage` for a one-off announcement that stays out of it.',
        },
        {
          zh: '按钮：要给后台条目加「拉回来」这类操作，就传 `actions: [{ label?, icon?, color?, run }]`（`label` 与 `icon` 至少给一个）。方法留在创建页内存里，记录只带文案 / 图标标识 / 颜色，所以别的标签页也画得出按钮，点击会发回创建页执行。一条记录可带多颗按钮，展示方按顺序全画出来；只给 `icon` 的那颗是正方形图标钮。',
          en: 'Actions: to give a backgrounded row something to do, pass `actions: [{ label?, icon?, color?, run }]` (at least one of `label` and `icon`). The method stays in the creating page\'s memory and only labels, icon ids and colors cross pages, so other tabs can render the buttons and a click is executed back on the creating page. A record may carry several buttons; the renderer draws them all in order, and an icon-without-label one becomes a square icon button.',
        },
        {
          zh: '业务键：`key` 让登记变成幂等 —— 同一个键在池里最多一条。同页重复登记就地更新那条并返回同一个句柄，别的页面占着同一个键则抛 `TaskNotificationConflictError`（作业在它那一页，给了也点不动）。键只能用稳定值：`[\'close\', workspaceId, taskId]` 对，带时间 / 随机数 / 进度文案进去就等于每次都新开一条。想知道「这条是不是我刚起的」用 `notifyTask.ensure()` 的 `created`。',
          en: 'Business key: `key` makes registration idempotent — at most one row per key. Re-registering on the same page updates that row in place and returns the same handle; a key held by another page throws `TaskNotificationConflictError` (the work lives there, so a handle would be a dead button). Keys must be stable values: `[\'close\', workspaceId, taskId]` works, while timestamps, randomness or progress text mean a brand-new row every time. Use `created` from `notifyTask.ensure()` to tell whether you started it.',
        },
        {
          zh: '其余约定：`detail` 收任意 JSON 值（函数与类实例当场抛错）；`icon` / `iconSvg` 只是字符串，渲染与注入安全由消费端负责；两级分组用 `project`（`setDefaultTaskProject()` 设一次）+ `group`（缺省 `default`）。',
          en: 'The rest: `detail` takes any JSON value (functions and class instances throw immediately); `icon` / `iconSvg` are plain strings and rendering plus injection safety are the consumer\'s job; two-level grouping uses `project` (set once via `setDefaultTaskProject()`) plus `group` (default `default`).',
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
            { name: 'notifyTask.ensure(title, options?)', type: '(title: string, options?: NotifyTaskOptions) => { handle: TaskNotificationHandle; created: boolean }', def: '—', desc: { zh: '幂等登记：带 key 时本页已有同键条目就地复用并返回同一个句柄；`created === false` 说明已经在跑，别再起第二份活', en: 'Idempotent registration: with a key, a matching row on this page is reused and the same handle comes back. `created === false` means it is already running, so do not start a second job' } },
            { name: 'notifyTask.run(title, work, options?)', type: '<T>(title: string, work: Promise<T> | (() => Promise<T>), options?: NotifyTaskOptions) => Promise<T>', def: '—', desc: { zh: '包住一段异步：成功 done、失败 fail，结果与异常原样透传；带 key 撞上已在跑的同键则 reject（不调用 work）', en: 'Wraps an async task: done on success, fail on rejection, passing the result and error through. A key already running rejects without calling work' } },
            { name: 'notifyMessage(title, options?)', type: '(title: string, options?: NotifyMessageOptions) => TaskNotificationMessage', def: '—', desc: { zh: '纯广播：只发 message 事件，不进池、不动快照，因此列表不会闪', en: 'Pure broadcast: emits a message event only, writes no pool state and leaves the snapshot alone, so the list cannot flash' } },
            { name: 'getSnapshot()', type: '() => TaskNotificationSnapshot', def: '—', desc: { zh: '当前全量快照，引用稳定；可直接作 useSyncExternalStore 的第二参', en: 'Current full snapshot with a stable reference; use as the second useSyncExternalStore argument' } },
            { name: 'getServerSnapshot()', type: '() => TaskNotificationSnapshot', def: '冻结空快照', desc: { zh: 'SSR / 非宿主环境用，永远是同一个对象', en: 'For SSR and non-host environments; always the same object' } },
            { name: 'subscribe(listener)', type: '(listener: () => void) => () => void', def: '—', desc: { zh: '状态真变了才通知；返回退订函数', en: 'Notifies only on real state changes; returns an unsubscribe function' } },
            { name: 'connect()', type: '() => void', def: '—', desc: { zh: '幂等；开跨页通道并请求一次全量 baseline', en: 'Idempotent; opens the cross-page channel and requests one full baseline' } },
            { name: 'refresh()', type: '() => void', def: '—', desc: { zh: '重新向同源标签页要一次全量状态；休眠恢复时自动触发，平时不用手动调', en: 'Re-requests a full snapshot from same-origin tabs; runs automatically after sleep, no manual call needed' } },
            { name: 'select(groups?, options?)', type: '(groups?: TaskNotificationGroupFilter, options?: TaskNotificationSelectOptions) => readonly TaskNotificationRecord[]', def: '不传 = 本项目全部二级', desc: { zh: '池内自带缓存的过滤；与 selectTaskNotifications 同一套三档语义', en: 'Cached pool-level filtering; same three-tier contract as selectTaskNotifications' } },
            { name: 'register(input)', type: '(input: TaskNotificationInput) => TaskNotificationHandle', def: '—', desc: { zh: '登记一条真实任务并返回句柄；带 key 时同页重复登记就地复用（只要句柄、不要 created 就用它）', en: 'Registers a real task and returns its handle; with a key, a repeat on the same page reuses the row (use it when you need the handle but not created)' } },
            { name: 'ensure(input)', type: '(input: TaskNotificationInput) => TaskNotificationClaim', def: '—', desc: { zh: '同上，另交回 `created`：false = 本页已有同键任务，别起第二份活', en: 'Same as register, plus `created`: false means this page already has that key, so do not start a second job' } },
            { name: 'settleLocal(reason?)', type: '(reason?: string) => number', def: '—', desc: { zh: '结束本页仍持有的全部任务并返回条数，不需要句柄；跨页条目不动', en: 'Ends every task this page still owns and returns the count without needing a handle; rows from other pages are untouched' } },
            { name: 'runAction(taskId, index)', type: '(taskId: string, index: number) => Promise<boolean>', def: '—', desc: { zh: '执行第 index 个按钮：本页立即执行，跨页发回创建页并等 ack（2s 超时）。查不到方法、越界、抛错一律 false', en: 'Runs the index-th action: locally at once, or back on the owning page with an ack (2s timeout). Missing method, out-of-range index and throwing actions all resolve false' } },
            { name: 'canRestore(task)', type: '(task: TaskNotificationRecord) => boolean', def: '—', desc: { zh: '旧 restored 通道的判据，只对本页条目为真；它不决定按钮能不能点（那看 record.actions）', en: 'Judgement for the legacy restored channel, true only for rows of this page; it does not decide buttons (record.actions does)' } },
            { name: 'requestRestore(taskId)', type: '(taskId: string) => boolean', def: '—', desc: { zh: '只发本地 restored 事件，跨页返回 false；新代码用 actions + runAction', en: 'Emits a local restored event only and returns false for cross-page rows; new code uses actions + runAction' } },
            { name: 'dispose()', type: '() => void', def: '—', desc: { zh: '关通道与摘监听，保留状态，下次 connect 会复活并重发分片；按钮方法随之清空，存活条目的按钮从此刻起不可执行', en: 'Closes the channel and detaches listeners but keeps state; the next connect revives it and rebroadcasts a shard. Action methods are dropped, so surviving rows stay unclickable from then on' } },
          ],
        },
        {
          id: 'bt-handle-api',
          rows: [
            { name: 'input.project', type: 'string', def: '全局默认项目', required: '二者必有一个', desc: { zh: '一级分组；不传则取 setDefaultTaskProject 的值，两者都没有就抛错', en: 'First-level project; falls back to setDefaultTaskProject, and throws when neither exists' } },
            { name: 'input.group', type: 'string', def: "'default'", desc: { zh: '二级分组：项目内的分类；不能是空字符串', en: 'Second-level bucket inside the project; must not be empty' } },
            { name: 'input.key', type: 'string | readonly (string | number)[]', def: '—', desc: { zh: '业务键：唯一性范围是 (project, key)；字符串原样用，元组按元素归一化成稳定串。只收扁平原值，空串 / 空数组 / 对象 / NaN 当场抛错', en: 'Business key, unique per (project, key). Strings are used verbatim; tuples are normalized element-wise into a stable string. Flat primitives only — empty strings, empty arrays, objects and NaN throw immediately' } },
            { name: 'input.title', type: 'string', def: '—', required: '必填', desc: { zh: '条目标题', en: 'Row title' } },
            { name: 'input.hidden', type: 'boolean', def: 'false', desc: { zh: '不进默认列表，**只表达这一件事**（回收见 `timeoutMs`）。可在 `update` 里切换（传 false 能取消）', en: 'Kept out of the default list — that is all it means (see `timeoutMs` for reclamation). Switchable through `update` (false un-hides)' } },
            { name: 'input.timeoutMs', type: 'number', def: '0', desc: { zh: '回收窗口，从最后一次活动起算；必须是有限数且 ≥ 0，**缺省 0 = 不回收**（与 hidden 无关）。会自己跑完的短任务想兜底就显式给一个值；作业型任务别给，否则作业还在跑就先被判失败', en: 'Reclamation window counted from the last activity; must be finite and ≥ 0, and defaults to 0 = never (independent of hidden). Short self-terminating tasks may pass a value as a backstop; long jobs must not, or the row is failed while the work still runs' } },
            { name: 'input.detail', type: 'TaskNotificationDetail', def: '—', desc: { zh: '任意 JSON 值（对象 / 数组 / 数字 / 布尔 / null）；入池前克隆私有副本，函数与类实例当场抛错', en: 'Any JSON value (object / array / number / boolean / null); cloned into a private copy on the way in, while functions and class instances throw immediately' } },
            { name: 'input.actions', type: 'readonly TaskNotificationAction[]', def: '—', desc: { zh: '按钮：`{ label?, icon?, color?, run }` 数组，`label` 与 `icon` 至少给一个；run 是匿名函数、不进池不过线，只在创建页执行；`color` 是任意 CSS 色值，不传由展示方用默认档；两者都空、run 不是函数或 color 传了空串时注册当场抛错', en: 'Actions: an array of `{ label?, icon?, color?, run }` with at least one of label and icon; run is an anonymous function that never enters the pool or the wire and runs only on the creating page. `color` is any CSS color, omitted means the renderer default. Both label and icon empty, a non-function run or a blank color throws at registration' } },
            { name: 'record.actions', type: 'readonly { label?: string; icon?: string; color?: string }[] | undefined', def: 'undefined', desc: { zh: '跨页可见的只有文案 / 图标标识 / 颜色，下标即动作 id；没有按钮的记录不带这个字段', en: 'Only labels, icon ids and colors cross pages, and the index is the action id; rows without actions carry no such field' } },
            { name: 'record.key', type: 'string | undefined', def: 'undefined', desc: { zh: '归一化后的业务键；读侧拿它判断「这个任务是不是已经在处理中」，比对自己的键要用 `taskKey()` 算一次，别手拼', en: 'The normalized business key; the read side uses it to tell whether the work is already running. Compare with your own key through `taskKey()` instead of hand-joining strings' } },
            { name: 'taskKey(key)', type: '(key: TaskKey) => string', def: '—', desc: { zh: '把业务键归一化成池里存的那串（元组 → `#` + JSON，字符串原样）；读写两侧用同一份才不会对不上', en: 'Normalizes a business key into the stored form (tuples become # + JSON, strings stay verbatim); both sides must use it or they will disagree' } },
            { name: 'TaskNotificationConflictError', type: 'class extends Error', def: '—', desc: { zh: '同键已在别的页面登记时抛出；带 `code`（值为 TASK_NOTIFICATION_CONFLICT）、`key` 与 `ownerOrigin`。判冲突用 `code`（core 被打进每个插件副本，跨副本 `instanceof` 不可靠）', en: 'Thrown when another page holds the key; carries `code` (TASK_NOTIFICATION_CONFLICT), `key` and `ownerOrigin`. Judge by `code`, since core is inlined into each plugin bundle and `instanceof` is unreliable across copies' } },
            { name: 'input.projectLabel / groupLabel', type: 'string', def: '—', desc: { zh: '项目 / 分组的显示名覆盖', en: 'Project / group display-name overrides' } },
            { name: 'handle.update(patch)', type: '(patch: TaskNotificationPatch) => void', def: '—', desc: { zh: '只改纯数据字段，随时可调用；按钮改不了 —— 换一组要带同一个 key 重新登记', en: 'Updates plain data fields, callable any time. Buttons cannot change through it — re-register with the same key to swap them' } },
            { name: 'handle.background()', type: '() => void', def: '—', desc: { zh: '标记收起并发 backgrounded 事件，不结算', en: 'Marks the task backgrounded and emits a backgrounded event without settling' } },
            { name: 'handle.done(detail?) / fail(reason?)', type: '(detail?: TaskNotificationDetail) => void', def: '—', desc: { zh: '幂等；成功后条目立刻移出池并发 settled 事件', en: 'Idempotent; removes the row immediately and emits a settled event' } },
            { name: 'handle.track(promise)', type: '<T>(promise: Promise<T>) => Promise<T>', def: '—', desc: { zh: '句柄已在手时的兜底收尾；返回原 Promise。包一段异步的日常写法是 notifyTask.run', en: 'Fallback settlement when the handle is already in hand; returns the original promise. The everyday way to wrap async work is notifyTask.run' } },
            { name: 'handle.settled', type: 'Promise<TaskNotificationSettlement>', def: '—', desc: { zh: '只在真正结束时兑现；收起不兑现', en: 'Resolves only on a real ending, never on collapse' } },
            { name: 'subscribeTaskNotificationEvents(listener)', type: '(listener: TaskNotificationEventListener) => () => void', def: '—', desc: { zh: '监听 registered / updated / backgrounded / settled / message / restored / peer-left', en: 'Listens for registered / updated / backgrounded / settled / message / restored / peer-left' } },
            { name: 'createTaskNotificationPool(options?)', type: '(options?: TaskNotificationPoolOptions) => TaskNotificationPool', def: '—', desc: { zh: '独立池；测试可注入 origin / channelName / offline / lifecycle / locks（locks: null 关掉失联清理）', en: 'Standalone pool; tests can inject origin / channelName / offline / lifecycle / locks (locks: null disables dead-page cleanup)' } },
            { name: 'TASK_NOTIFICATIONS_LOCK_PREFIX', type: 'string', def: '—', desc: { zh: '存活锁名前缀，后接本页 origin；协议升级时随键一起换命名空间', en: 'Liveness lock-name prefix, followed by the page origin; the protocol bump carries it to a new namespace' } },
          ],
        },
      ],
      code: [
        { id: 'bt-keyed-example', lang: 'ts', src: keyedExample },
        { id: 'bt-actions-example', lang: 'ts', src: actionsExample },
        { id: 'bt-lifecycle-example', lang: 'ts', src: lifecycleExample },
        { id: 'bt-subscribe-example', lang: 'ts', src: subscribeExample },
      ],
    },
  ],
}

export default doc
