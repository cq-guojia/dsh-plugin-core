# runtime —— 运行时底座

> EN: runtime — runtime foundations

本文件由 `scripts/gen-docs.mjs` 从同名 `.doc.ts` 生成，请勿手改。

导出：notifyMessage、subscribeNotifications、createNotifyScope、defaultNotifyScope、setDefaultTaskProject、getDefaultTaskProject、resolveProject、normalizeGroup、NOTIFY_CHANNEL、NOTIFY_PROTOCOL、NOTIFY_PROJECT_KEY、NOTIFY_EVENTS_KEY、createEventBus、claimEventBus、createStore、RuntimeStore

## 概览

> EN: Overview

零 React、零界面：**持状态、建连接、有副作用，但不画东西**。装两样能力 —— **跨页通知**（发一条 / 收一条）与**状态容器**（`getState` / `setState` / `subscribe`），外加它们各自需要的跨 bundle 单例与传输小件。

> EN: Zero React and no UI: it holds state, opens connections and has side effects, but draws nothing. Two capabilities live here — **cross-page notifications** (send one / receive one) and a **state container** (`getState` / `setState` / `subscribe`), plus the per-bundle singletons and transport helpers they each need.

为什么单独一层：发跨页消息的既有 `ui` 侧（`ui/feedback/notify.ts` 的广播），也有 `adv/tasks` 侧（任务池的纯广播）。放在任何一边都会让另一边形同反向依赖。这一层**不认识任务**，也不替任何消费方决定收到之后干什么 —— 弹 toast 是 `ui/feedback/notify-bridge.ts` 的选择。

> EN: Why a separate layer: both the `ui` side (`ui/feedback/notify.ts` broadcast) and the `adv/tasks` side (the pool's pure broadcast) send cross-page messages. Putting it in either one makes the other a reverse dependency. This layer **knows nothing about tasks** and never decides what a receiver should do — raising a toast is `ui/feedback/notify-bridge.ts`'s choice.

单例口径：core 会被内联进每个插件 bundle，所以默认分组、事件总线、默认逻辑端都用 `Symbol.for` 收口，避免两个副本各建一份（先到者占坑、后者静默拿到错对象，只在多插件同页时复现）。**通道本身不单例**：`BroadcastChannel` 收不到自己 post 的消息，收口会让同页的第二个逻辑端永远收不到。

> EN: Singleton policy: core is inlined into every plugin bundle, so the default project, the event bus and the default scope are all claimed through `Symbol.for` — otherwise two copies each build their own (first one wins, the second silently gets the wrong object, and it only shows up when several plugins share a page). **The channel is deliberately not a singleton**: `BroadcastChannel` never delivers your own post, so collapsing it would leave a second logical endpoint on the same page permanently deaf.

import 期不访问 `window` / `document` / `BroadcastChannel`：通道在第一次收发时才开，Node 单测与 SSR 可以直接加载这个子包。

> EN: Nothing touches `window` / `document` / `BroadcastChannel` at import time — the channel opens on first use, so Node tests and SSR can load this subpath directly.

## 跨页通知

> EN: Cross-page notifications

一条通知只出事件、**不进任何列表**：没有 id 可查、也不可结束，发完即止。要常驻、要能被结束的状态请用任务中心（`dsh-plugin-core/adv/tasks`）。

> EN: A notification is an event only and **never enters any list**: nothing to look up, nothing to end. For state that persists and can be settled, use the task hub (`dsh-plugin-core/adv/tasks`).

`notifyMessage(title, options?)`：**标题是第一个参数，永远必填**（不混在可选项里）；`project` 缺省取 `setDefaultTaskProject()` 设的值，两者都没有直接抛错，不静默塞默认值；`group` 缺省 `default`，空串抛错；`level` 缺省 `info`；`detail` 收任意 JSON 值，入队前克隆一份私有副本，函数 / 类实例当场抛错。

> EN: `notifyMessage(title, options?)`: **the title is the first parameter and always required** (never buried in an options object). `project` falls back to `setDefaultTaskProject()`, and throws when neither exists instead of quietly inventing a default; `group` defaults to `default` and rejects empty strings; `level` defaults to `info`; `detail` takes any JSON value, cloned into a private copy on the way in, while functions and class instances throw immediately.

投递顺序固定：**先给本页订阅者**（`remote: false`），再发给同源其它页面（对端 `remote: true`）。所以本页不必再自己弹一次，判断 `remote` 就能避免重复。

> EN: Delivery order is fixed: **local subscribers first** (`remote: false`), then same-origin pages (`remote: true` on the receiving side). The sending page therefore never needs a second local toast — branch on `remote` to avoid duplicates.

没有默认行为：不订阅就没人显示，广播等于空放。现成的接收端是 `ui/feedback/notify-bridge.ts`（把消息翻成 toast 载荷），不想弹提示的插件根本不用引它。

> EN: There is no default behaviour: without a subscriber nothing is shown and the broadcast goes nowhere. The ready-made receiver is `ui/feedback/notify-bridge.ts` (turns a message into a toast payload); a plugin that wants no toasts simply never imports it.

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `notifyMessage(title, options?)` | `(title: string, options?: NotifyMessageOptions) => NotifyMessage` | title 必填 | — | 发一条：本页订阅者先收，再广播给同源其它页面；返回消息本体（含 id / at） | Send one: local subscribers first, then broadcast to same-origin pages; returns the message itself (with id / at) |
| `options.project` | `string` | 二者必有一个 | 全局默认项目 | 一级分组；不传则取 `setDefaultTaskProject()` 的值，都没有就抛错 | First-level group; falls back to `setDefaultTaskProject()`, throws when neither exists |
| `options.group` | `string` | — | 'default' | 二级分组；空串抛错 | Second-level group; an empty string throws |
| `options.level` | `'info' \| 'success' \| 'warning' \| 'error'` | — | 'info' | 语义级别：核心只传数据，怎么显示由消费端决定 | Semantic level: the core only carries the value, rendering is the consumer's call |
| `options.icon / iconSvg` | `string` | — | — | 图标标识 / 原始 SVG 源，核心只存不解释 | Icon id / raw SVG source; stored verbatim, never interpreted |
| `options.detail` | `NotifyDetail` | — | — | 任意 JSON 值；克隆私有副本，函数 / DOM 节点 / 类实例当场抛错 | Any JSON value; cloned into a private copy, while functions, DOM nodes and class instances throw |
| `subscribeNotifications(listener)` | `(listener: (message, remote: boolean) => void) => () => void` | — | — | 订阅默认逻辑端；返回退订函数。`remote` 表示是否来自别的页面 | Subscribe to the default scope; returns an unsubscribe function. `remote` tells whether it came from another page |
| `setDefaultTaskProject(project)` | `(project: string \| undefined) => void` | app 入口调一次 | — | 设一级分组；空串抛错，传 `undefined` 清空（测试用）。挂在全局 symbol 上，同页所有副本共享 | Sets the first-level group; blank strings throw and `undefined` clears it (tests). Lives on a global symbol so every copy on the page shares it |
| `getDefaultTaskProject()` | `() => string \| undefined` | — | undefined | 读当前默认分组 | Reads the current default group |
| `createNotifyScope(options?)` | `(options?: { channelName?: string; origin?: string }) => NotifyScope` | — | 默认通道 / 随机 origin | 建一个独立逻辑端（同 `channelName` 的两个 scope 互收）；`dispose()` 关通道并清订阅者 | Builds an independent endpoint (two scopes sharing a `channelName` hear each other); `dispose()` closes the channel and drops subscribers |
| `defaultNotifyScope()` | `() => NotifyScope` | — | — | 跨 bundle 单例的默认逻辑端：一条通道、一份订阅者名单 | The cross-bundle singleton endpoint: one channel, one subscriber list |
| `resolveProject(project?)` | `(project?: string \| null) => string \| null` | — | — | 把「显式给 / 取默认」合成一个值；`null` 表示不按分组过滤（只有查询侧会传） | Folds explicit-or-default into one value; `null` means no group filter (query side only) |
| `normalizeGroup(group?)` | `(group?: string) => string` | — | 'default' | 空串抛错，其余原样返回 | Rejects blank strings, returns anything else verbatim |
| `NOTIFY_CHANNEL / NOTIFY_PROTOCOL` | `string / number` | — | — | 通道名与协议版本；协议升级时两者与几个 `NOTIFY_*_KEY` 一起换命名空间（跨副本 ABI，不能单方面改） | Channel name and protocol version; a protocol bump moves them and the `NOTIFY_*_KEY` symbols together (cross-copy ABI, never changed unilaterally) |

```ts id="runtime-notify-example"
import { notifyMessage, setDefaultTaskProject, subscribeNotifications } from 'dsh-plugin-core/runtime'

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

off()
```

```ts id="runtime-scope-example"
import { createNotifyScope } from 'dsh-plugin-core/runtime'

// 一个 scope = 一个逻辑端（一条通道 + 一份订阅者名单 + 自己的消息序号）。
// 同一个 channelName 的两个 scope 互收 —— 浏览器里两个标签页天然就是两个 scope。
const pageA = createNotifyScope({ channelName: 'probe', origin: 'page-a' })
const pageB = createNotifyScope({ channelName: 'probe', origin: 'page-b' })

pageB.subscribe((message, remote) => console.log(remote, message.title))
pageA.notifyMessage('cross page')   // pageB 收到 remote=true

pageA.dispose()
pageB.dispose()
```

## 状态容器

> EN: State container

全仓**唯一**接触 `zustand` 的地方：上层只认 `RuntimeStore`，将来换实现（换版本或自研）只改 `src/runtime/store.ts` 一个文件。接口故意只有四个方法，不给 selector / 中间件 / devtools —— 一暴露，上层就依赖 zustand 的具体形态，收口就白做了。

> EN: The **only** place in the repo that touches `zustand`: callers only see `RuntimeStore`, so swapping the implementation (version bump or hand-rolled) is a one-file change in `src/runtime/store.ts`. The interface is deliberately four methods — no selectors, middleware or devtools, because exposing them would leak zustand's shape and make the isolation pointless.

零 React：React 侧由消费方自己接 `useSyncExternalStore` 三参（现成例子是 `adv/tasks/useTasks.ts`），和 `zustand/vanilla` 与 `zustand` 的分法一致。`subscribe` 只报「变了」，不带新旧值；需要派生数据在调用方算并自带缓存。

> EN: Zero React: the React side wires its own three-argument `useSyncExternalStore` (the working example is `adv/tasks/useTasks.ts`), mirroring the `zustand/vanilla` vs `zustand` split. `subscribe` only says "it changed" and carries no old or new value; derived data is computed and cached by the caller.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `createStore(initialState)` | `(initialState: T \| (() => T)) => RuntimeStore<T>` | — | 建容器；传工厂可让模块级创建不在 import 期求值（与 zustand 一致） | Create the container; a factory keeps module-level creation from evaluating at import time (same as zustand) |
| `getState()` | `() => T` | — | 读当前状态；可直接作 `useSyncExternalStore` 的第二参 | Read the current state; usable as the second `useSyncExternalStore` argument |
| `setState(next, replace?)` | `(next: T, replace?: boolean) => void` | replace = false | 缺省按 zustand 的合并语义；`replace: true` 整块替换（调用方保证传的是完整的 T） | Merges by default (zustand semantics); `replace: true` swaps the whole state, so the caller owns passing a complete T |
| `subscribe(listener)` | `(listener: () => void) => () => void` | — | 状态真变了才通知；返回退订函数 | Notifies only on real changes; returns an unsubscribe function |

```ts id="runtime-store-example"
import { createStore } from 'dsh-plugin-core/runtime'
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

off()
```

## 事件总线

> EN: Event bus

一次性事实的通道：**不留存、不可重放**，没订阅时发的就丢了。与快照（状态容器）互不替代 —— 新页面没听过历史事件，要补历史只能读快照。

> EN: A channel for one-off facts: **no history, no replay** — anything emitted while nobody listens is gone. It never replaces a snapshot (the state container): a freshly opened page has heard no past events, so history can only come from the snapshot.

一个坏掉的监听者不许拖垮其它监听者，`emit` 逐个 `try`。跨 bundle 副本要用 `claimEventBus(key, isValid, create)` 收口：同一个 `key` 全局只有一个总线，已有值形状不对时直接抛错 —— 悄悄换一个会让事件分流且不报错。

> EN: One broken listener must not take the others down, so `emit` wraps each call in `try`. Cross-bundle copies converge through `claimEventBus(key, isValid, create)`: one bus per `key` globally, and a shape-mismatched existing value throws — silently replacing it would split events with no error at all.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `createEventBus<E>()` | `<E>() => EventBus<E>` | — | 建一条多播总线：`emit(event)` / `subscribe(listener) => unsubscribe` | Create a multicast bus: `emit(event)` / `subscribe(listener) => unsubscribe` |
| `claimEventBus(key, isValid, create)` | `(key: symbol, isValid: (v: unknown) => boolean, create: () => EventBus<E>) => EventBus<E>` | — | 跨 bundle 单例收口；已有值不合法直接抛 `Incompatible dsh-plugin-core event bus` | Cross-bundle singleton claim; an invalid existing value throws `Incompatible dsh-plugin-core event bus` |

## 更新日志

本文件为生成投影，变更记录在同名 `.doc.ts` 真源与本仓 git 历史。
