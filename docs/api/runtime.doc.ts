// runtime 层（运行时底座）的使用帮助 —— 真源（TS 数据模块）。md 与 demo 文档体都从这份派生。
// 本文只讲「怎么用」；分层判据与依赖方向在 docs/architecture/structure.md。
import type { DocTopic } from '../development/doc-format.js'

const notifyExample = `import { notifyMessage, setDefaultTaskProject, subscribeNotifications } from 'dsh-plugin-core/runtime'

// app 入口设一次：一级分组（项目）。core 被内联进每个插件，所有副本看到同一个值
setDefaultTaskProject('dsh-task-reminder')

// 订阅：本页自己发的收到 remote=false，同源其它页面收到 remote=true
const off = subscribeNotifications((message, remote) => {
  if (remote) return                       // 本页那份已经处理过了
  console.log(message.title, message.level) // 弹不弹、怎么弹由你决定，这里没有默认行为
})

// 第一个参数恒为标题（永远必填）；其余进可选项
notifyMessage('已保存', { group: 'notice', level: 'success', detail: { rows: 3 } })

// 只发一句、不带任何字段
notifyMessage('同步完成')

off()`

const scopeExample = `import { createNotifyScope } from 'dsh-plugin-core/runtime'

// 一个 scope = 一个逻辑端（一条通道 + 一份订阅者名单 + 自己的消息序号）。
// 同一个 channelName 的两个 scope 互收 —— 浏览器里两个标签页天然就是两个 scope。
const pageA = createNotifyScope({ channelName: 'probe', origin: 'page-a' })
const pageB = createNotifyScope({ channelName: 'probe', origin: 'page-b' })

pageB.subscribe((message, remote) => console.log(remote, message.title))
pageA.notifyMessage('cross page')   // pageB 收到 remote=true

pageA.dispose()
pageB.dispose()`

const storeExample = `import { createStore } from 'dsh-plugin-core/runtime'
import { useSyncExternalStore } from 'react'

const store = createStore({ open: false, count: 0 })

store.setState({ open: true })          // 缺省合并
store.setState({ open: false, count: 0 }, true) // replace=true 整块替换

const off = store.subscribe(() => {
  // 只报「变了」，不带新旧值：要比较就在回调里自己读 store.getState()
})

// React 侧三参必须齐：第三参给 SSR / 非宿主环境的冻结快照
const server = store.getState()
const state = useSyncExternalStore(store.subscribe, store.getState, () => server)

off()`

const doc: DocTopic = {
  title: { zh: 'runtime —— 运行时底座', en: 'runtime — runtime foundations' },
  exports: [
    'notifyMessage',
    'subscribeNotifications',
    'createNotifyScope',
    'defaultNotifyScope',
    'setDefaultTaskProject',
    'getDefaultTaskProject',
    'resolveProject',
    'normalizeGroup',
    'NOTIFY_CHANNEL',
    'NOTIFY_PROTOCOL',
    'NOTIFY_PROJECT_KEY',
    'NOTIFY_EVENTS_KEY',
    'createEventBus',
    'claimEventBus',
    'createStore',
    'RuntimeStore',
  ],
  sections: [
    {
      id: 'runtime',
      heading: { zh: '概览', en: 'Overview' },
      prose: [
        {
          zh: '零 React、零界面：**持状态、建连接、有副作用，但不画东西**。装两样能力 —— **跨页通知**（发一条 / 收一条）与**状态容器**（`getState` / `setState` / `subscribe`），外加它们各自需要的跨 bundle 单例与传输小件。',
          en: 'Zero React and no UI: it holds state, opens connections and has side effects, but draws nothing. Two capabilities live here — **cross-page notifications** (send one / receive one) and a **state container** (`getState` / `setState` / `subscribe`), plus the per-bundle singletons and transport helpers they each need.',
        },
        {
          zh: '为什么单独一层：发跨页消息的既有 `ui` 侧（`ui/feedback/notify.ts` 的广播），也有 `adv/tasks` 侧的任务通知广播（终态 notify 经这里的 `notifyMessage` 发出）。放在任何一边都会让另一边形同反向依赖。这一层**不认识任务**，也不替任何消费方决定收到之后干什么 —— 弹 toast 是 `ui/feedback/notify-bridge.ts` 的选择。开放执行器注册表也在这里（`executors`），只做 kind→handler 的登记与查找。',
          en: 'Why a separate layer: both the `ui` side (`ui/feedback/notify.ts` broadcast) and task notification broadcasts from `adv/tasks` (terminal notifies go out through `notifyMessage` here) need cross-page messaging. Putting it in either one makes the other a reverse dependency. This layer **knows nothing about tasks** and never decides what a receiver should do — raising a toast is `ui/feedback/notify-bridge.ts`\'s choice. The open executor registry (`executors`) also lives here, doing nothing but kind→handler registration and lookup.',
        },
        {
          zh: '单例口径：core 会被内联进每个插件 bundle，所以默认分组、事件总线、默认逻辑端都用 `Symbol.for` 收口，避免两个副本各建一份（先到者占坑、后者静默拿到错对象，只在多插件同页时复现）。**通道本身不单例**：`BroadcastChannel` 收不到自己 post 的消息，收口会让同页的第二个逻辑端永远收不到。',
          en: 'Singleton policy: core is inlined into every plugin bundle, so the default project, the event bus and the default scope are all claimed through `Symbol.for` — otherwise two copies each build their own (first one wins, the second silently gets the wrong object, and it only shows up when several plugins share a page). **The channel is deliberately not a singleton**: `BroadcastChannel` never delivers your own post, so collapsing it would leave a second logical endpoint on the same page permanently deaf.',
        },
        {
          zh: 'import 期不访问 `window` / `document` / `BroadcastChannel`：通道在第一次收发时才开，Node 单测与 SSR 可以直接加载这个子包。',
          en: 'Nothing touches `window` / `document` / `BroadcastChannel` at import time — the channel opens on first use, so Node tests and SSR can load this subpath directly.',
        },
      ],
    },
    {
      id: 'runtime-notify',
      heading: { zh: '跨页通知', en: 'Cross-page notifications' },
      prose: [
        {
          zh: '一条通知只出事件、**不进任何列表**：没有 id 可查、也不可结束，发完即止。要常驻、要能被结束的状态请用任务中心（`dsh-plugin-core/adv/tasks`）。',
          en: 'A notification is an event only and **never enters any list**: nothing to look up, nothing to end. For state that persists and can be settled, use the task hub (`dsh-plugin-core/adv/tasks`).',
        },
        {
          zh: '`notifyMessage(title, options?)`：**标题是第一个参数，永远必填**（不混在可选项里）；`project` 缺省取 `setDefaultTaskProject()` 设的值，两者都没有直接抛错，不静默塞默认值；`group` 缺省 `default`，空串抛错；`level` 缺省 `info`；`detail` 收任意 JSON 值，入队前克隆一份私有副本，函数 / 类实例当场抛错。',
          en: '`notifyMessage(title, options?)`: **the title is the first parameter and always required** (never buried in an options object). `project` falls back to `setDefaultTaskProject()`, and throws when neither exists instead of quietly inventing a default; `group` defaults to `default` and rejects empty strings; `level` defaults to `info`; `detail` takes any JSON value, cloned into a private copy on the way in, while functions and class instances throw immediately.',
        },
        {
          zh: '投递顺序固定：**先给本页订阅者**（`remote: false`），再发给同源其它页面（对端 `remote: true`）。所以本页不必再自己弹一次，判断 `remote` 就能避免重复。',
          en: 'Delivery order is fixed: **local subscribers first** (`remote: false`), then same-origin pages (`remote: true` on the receiving side). The sending page therefore never needs a second local toast — branch on `remote` to avoid duplicates.',
        },
        {
          zh: '没有默认行为：不订阅就没人显示，广播等于空放。现成的接收端是 `ui/feedback/notify-bridge.ts`（把消息翻成 toast 载荷），不想弹提示的插件根本不用引它。',
          en: 'There is no default behaviour: without a subscriber nothing is shown and the broadcast goes nowhere. The ready-made receiver is `ui/feedback/notify-bridge.ts` (turns a message into a toast payload); a plugin that wants no toasts simply never imports it.',
        },
        {
          zh: '消息字段刻意保持通用：**不带 `taskId`、不带 `outcome`**。runtime 不认识任务，只关心事情发生了；不认识任务 UI 的订阅方也能按自己的职责处理。任务层若要把终态语义带出来，只映射成通用 `level: \'success\' | \'error\'`——那是语义级别，不是任务结果本体；要拿完整结果请用任务层的 `onSettled`。',
          en: 'Message fields are deliberately generic: **no `taskId`, no `outcome`**. The runtime knows nothing about tasks, only that something happened, so a subscriber that never imports task UI can still act on it. The task layer maps terminal semantics to a generic `level: \'success\' | \'error\'` — a semantic level, not the task outcome itself; consumers that need the full result use the task-layer `onSettled`.',
        },
      ],
      api: [
        {
          id: 'runtime-notify-api',
          rows: [
            { name: 'notifyMessage(title, options?)', type: '(title: string, options?: NotifyMessageOptions) => NotifyMessage', def: '—', required: 'title 必填', desc: { zh: '发一条：本页订阅者先收，再广播给同源其它页面；返回消息本体（含 id / at）', en: 'Send one: local subscribers first, then broadcast to same-origin pages; returns the message itself (with id / at)' } },
            { name: 'options.project', type: 'string', def: '全局默认项目', required: '二者必有一个', desc: { zh: '一级分组；不传则取 `setDefaultTaskProject()` 的值，都没有就抛错', en: 'First-level group; falls back to `setDefaultTaskProject()`, throws when neither exists' } },
            { name: 'options.group', type: 'string', def: "'default'", desc: { zh: '二级分组；空串抛错', en: 'Second-level group; an empty string throws' } },
            { name: 'options.level', type: "'info' | 'success' | 'warning' | 'error'", def: "'info'", desc: { zh: '语义级别：核心只传数据，怎么显示由消费端决定', en: 'Semantic level: the core only carries the value, rendering is the consumer\'s call' } },
            { name: 'options.icon / iconSvg', type: 'string', def: '—', desc: { zh: '图标标识 / 原始 SVG 源，核心只存不解释', en: 'Icon id / raw SVG source; stored verbatim, never interpreted' } },
            { name: 'options.detail', type: 'NotifyDetail', def: '—', desc: { zh: '任意 JSON 值；克隆私有副本，函数 / DOM 节点 / 类实例当场抛错', en: 'Any JSON value; cloned into a private copy, while functions, DOM nodes and class instances throw' } },
            { name: 'subscribeNotifications(listener)', type: '(listener: (message, remote: boolean) => void) => () => void', def: '—', desc: { zh: '订阅默认逻辑端；返回退订函数。`remote` 表示是否来自别的页面', en: 'Subscribe to the default scope; returns an unsubscribe function. `remote` tells whether it came from another page' } },
            { name: 'setDefaultTaskProject(project)', type: '(project: string | undefined) => void', def: '—', required: 'app 入口调一次', desc: { zh: '设一级分组；空串抛错，传 `undefined` 清空（测试用）。挂在全局 symbol 上，同页所有副本共享', en: 'Sets the first-level group; blank strings throw and `undefined` clears it (tests). Lives on a global symbol so every copy on the page shares it' } },
            { name: 'getDefaultTaskProject()', type: '() => string | undefined', def: 'undefined', desc: { zh: '读当前默认分组', en: 'Reads the current default group' } },
            { name: 'createNotifyScope(options?)', type: '(options?: { channelName?: string; origin?: string }) => NotifyScope', def: '默认通道 / 随机 origin', desc: { zh: '建一个独立逻辑端（同 `channelName` 的两个 scope 互收）；`dispose()` 关通道并清订阅者', en: 'Builds an independent endpoint (two scopes sharing a `channelName` hear each other); `dispose()` closes the channel and drops subscribers' } },
            { name: 'defaultNotifyScope()', type: '() => NotifyScope', def: '—', desc: { zh: '跨 bundle 单例的默认逻辑端：一条通道、一份订阅者名单', en: 'The cross-bundle singleton endpoint: one channel, one subscriber list' } },
            { name: 'resolveProject(project?)', type: '(project?: string | null) => string | null', def: '—', desc: { zh: '把「显式给 / 取默认」合成一个值；`null` 表示不按分组过滤（只有查询侧会传）', en: 'Folds explicit-or-default into one value; `null` means no group filter (query side only)' } },
            { name: 'normalizeGroup(group?)', type: '(group?: string) => string', def: "'default'", desc: { zh: '空串抛错，其余原样返回', en: 'Rejects blank strings, returns anything else verbatim' } },
            { name: 'NOTIFY_CHANNEL / NOTIFY_PROTOCOL', type: 'string / number', def: '—', desc: { zh: '通道名与协议版本；协议升级时两者与几个 `NOTIFY_*_KEY` 一起换命名空间（跨副本 ABI，不能单方面改）', en: 'Channel name and protocol version; a protocol bump moves them and the `NOTIFY_*_KEY` symbols together (cross-copy ABI, never changed unilaterally)' } },
          ],
        },
      ],
      code: [
        { id: 'runtime-notify-example', lang: 'ts', src: notifyExample },
        { id: 'runtime-scope-example', lang: 'ts', src: scopeExample },
      ],
    },
    {
      id: 'runtime-store',
      heading: { zh: '状态容器', en: 'State container' },
      prose: [
        {
          zh: '全仓**唯一**接触 `zustand` 的地方：上层只认 `RuntimeStore`，将来换实现（换版本或自研）只改 `src/runtime/store.ts` 一个文件。接口故意只有四个方法，不给 selector / 中间件 / devtools —— 一暴露，上层就依赖 zustand 的具体形态，收口就白做了。',
          en: 'The **only** place in the repo that touches `zustand`: callers only see `RuntimeStore`, so swapping the implementation (version bump or hand-rolled) is a one-file change in `src/runtime/store.ts`. The interface is deliberately four methods — no selectors, middleware or devtools, because exposing them would leak zustand\'s shape and make the isolation pointless.',
        },
        {
          zh: '零 React：React 侧由消费方自己接 `useSyncExternalStore` 三参（现成例子是 `adv/tasks/TaskBar.ts` 的任务栏），和 `zustand/vanilla` 与 `zustand` 的分法一致。`subscribe` 只报「变了」，不带新旧值；需要派生数据在调用方算并自带缓存。',
          en: 'Zero React: the React side wires its own three-argument `useSyncExternalStore` (the working example is the task bar in `adv/tasks/TaskBar.ts`), mirroring the `zustand/vanilla` vs `zustand` split. `subscribe` only says "it changed" and carries no old or new value; derived data is computed and cached by the caller.',
        },
      ],
      api: [
        {
          id: 'runtime-store-api',
          rows: [
            { name: 'createStore(initialState)', type: '(initialState: T | (() => T)) => RuntimeStore<T>', def: '—', desc: { zh: '建容器；传工厂可让模块级创建不在 import 期求值（与 zustand 一致）', en: 'Create the container; a factory keeps module-level creation from evaluating at import time (same as zustand)' } },
            { name: 'getState()', type: '() => T', def: '—', desc: { zh: '读当前状态；可直接作 `useSyncExternalStore` 的第二参', en: 'Read the current state; usable as the second `useSyncExternalStore` argument' } },
            { name: 'setState(next, replace?)', type: '(next: T, replace?: boolean) => void', def: 'replace = false', desc: { zh: '缺省按 zustand 的合并语义；`replace: true` 整块替换（调用方保证传的是完整的 T）', en: 'Merges by default (zustand semantics); `replace: true` swaps the whole state, so the caller owns passing a complete T' } },
            { name: 'subscribe(listener)', type: '(listener: () => void) => () => void', def: '—', desc: { zh: '状态真变了才通知；返回退订函数', en: 'Notifies only on real changes; returns an unsubscribe function' } },
          ],
        },
      ],
      code: [{ id: 'runtime-store-example', lang: 'ts', src: storeExample }],
    },
    {
      id: 'runtime-bus',
      heading: { zh: '事件总线', en: 'Event bus' },
      prose: [
        {
          zh: '一次性事实的通道：**不留存、不可重放**，没订阅时发的就丢了。与快照（状态容器）互不替代 —— 新页面没听过历史事件，要补历史只能读快照。',
          en: 'A channel for one-off facts: **no history, no replay** — anything emitted while nobody listens is gone. It never replaces a snapshot (the state container): a freshly opened page has heard no past events, so history can only come from the snapshot.',
        },
        {
          zh: '一个坏掉的监听者不许拖垮其它监听者，`emit` 逐个 `try`。跨 bundle 副本要用 `claimEventBus(key, isValid, create)` 收口：同一个 `key` 全局只有一个总线，已有值形状不对时直接抛错 —— 悄悄换一个会让事件分流且不报错。',
          en: 'One broken listener must not take the others down, so `emit` wraps each call in `try`. Cross-bundle copies converge through `claimEventBus(key, isValid, create)`: one bus per `key` globally, and a shape-mismatched existing value throws — silently replacing it would split events with no error at all.',
        },
      ],
      api: [
        {
          id: 'runtime-bus-api',
          rows: [
            { name: 'createEventBus<E>()', type: '<E>() => EventBus<E>', def: '—', desc: { zh: '建一条多播总线：`emit(event)` / `subscribe(listener) => unsubscribe`', en: 'Create a multicast bus: `emit(event)` / `subscribe(listener) => unsubscribe`' } },
            { name: 'claimEventBus(key, isValid, create)', type: '(key: symbol, isValid: (v: unknown) => boolean, create: () => EventBus<E>) => EventBus<E>', def: '—', desc: { zh: '跨 bundle 单例收口；已有值不合法直接抛 `Incompatible dsh-plugin-core event bus`', en: 'Cross-bundle singleton claim; an invalid existing value throws `Incompatible dsh-plugin-core event bus`' } },
          ],
        },
      ],
    },
  ],
}

export default doc
