# 运行逻辑

系统级分层、边界、触发关系与不变量。不写接口细节（那些在 `docs/api/` 与 `docs/guides/`）。

## 一句话

一个 npm 包、五个子路径导出；插件按需引，tree-shaking 掉没用到的部分。

```text
src/                                                # 源码根，按依赖方向自上而下分层
├── types/                                          # 类型垫片：只有 .d.ts，无运行时
├── design/                                         # 设计值：token、主题判据、样式注入工厂
├── utils/                                          # 纯计算：零 React、零 DOM，Node 也能跑
├── runtime/                                        # 运行时底座：零 React、有状态或有副作用
│   ├── notify.ts                                   # 跨页通知：按主题发一条 / 收一条，不替消费方决定
│   ├── store.ts                                    # 状态容器：createStore，只暴露三个方法
│   └── index.ts                                    # 运行时入口：纯转发
├── ui/                                             # 控件：只放有界面的东西
│   ├── official.ts                                 # 官方 adapter：全仓唯一 import primitives 的点
│   ├── actions/                                    # 动作类：Button
│   ├── inputs/                                     # 录入类：Input、Picker、CodeEditor 等
│   ├── display/                                    # 展示类：Card、Table、Icon、MarqueeText 等
│   ├── feedback/                                   # 反馈类：Modal、Toast、notify-bridge
│   ├── layout/                                     # 布局类：SplitGroup、PanelDock
│   ├── navigation/                                 # 导航类：Pagination
│   └── infra/                                      # ui 内部跨类共用底座：css、locale、浮层、use-store
├── adv/                                            # 应用模块：组件 + API 打包成成品
│   ├── explorer/                                   # 文件浏览：FileBrowser + 预览 API
│   ├── session/                                    # 会话预览：SessionPreview
│   ├── tasks/                                      # 后台任务：model / store / coordinator / api / stream / TaskBar（实现）+ ui.ts（展示面出口）
│   └── (执行器在 src/runtime/executor.ts，SSE 端点在 src/host/task-stream.ts)
└── host/                                           # 服务端：Node 侧路由与处理器
```

> 分层自 2026-11-16 起新增 `runtime`（浏览器底座）与 `adv/tasks`（任务成品），2026-11-18 重构：
> 通知与开放执行器在 `src/runtime/`，任务纯数据 / 共享状态 / 编排 / 接线 / 核心列表 / SSE 客户端在
> `src/adv/tasks/`（展示面出口 `ui.ts`），SSE 服务端端点在 `src/host/task-stream.ts`；旧的任务池 / 状态源 / 旧 `TaskBar` 实现 / `useTasks` 已删，现 `TaskBar` 是新体系展示栏。
> 分类判定顺序、每个类的成员、demo 分区见 `docs/architecture/structure.md`。

## 依赖方向（单向，不许反向）

```text
design  ──▶ ui ──▶ adv/explorer · adv/session · adv/tasks
runtime ──▶ ui ──▶ adv/*
utils   ──▶ 谁都能用，它不依赖谁
types   ──▶ 纯声明，谁都能用
```

不变量：

- `utils` 不得 import `ui` / `design` / `runtime` / React / DOM / 任何宿主 API —— 它将来要能被整体剥出去复用。
- `runtime` 不得 import `ui` / `design` / `adv` / React —— 只许浏览器 API 与 Node 内置。它是底座，不认识上层。
- `design` 不得依赖 `ui`（否则「只想用 token 的插件」被迫拖进 React）。
- `ui` 不得依赖 `adv.*`（反向依赖会造成环）。
- `host` 不得 import React / DOM（Node 侧入口）。

## 三个「无界面」层怎么分

`ui` 这个名字只承诺「有界面」。没有界面的东西不许往里塞，按下面三条分：

| 层 | 判据 | 能跑在哪 | 例子 |
|---|---|---|---|
| `utils` | 纯计算：同样的输入给同样的输出，不持有状态 | Node / 浏览器都行 | 日期、路径、字符串 |
| `runtime` | 持有状态、建立连接或产生副作用，但不画界面 | 主要在浏览器 | 状态容器、跨页消息收发 |
| `ui/infra` | 带 React 或只服务于控件、被 2 个以上类共用 | 只在浏览器 | 样式注入、locale、浮层底座 |

一条线划清：**画不出界面，但持有状态或产生副作用 → `runtime`；
画不出界面、且只在控件之间共用（离开 React 就没意义）→ `ui/infra`。**

> 历史例外：`utils/i18n.ts` 有当前语言这一份模块级状态，按新判据本应归 `runtime`。
> 它是既有代码，暂不动；新建的东西按上表走。

`ui/infra` 越薄越好：只有 1 个控件用 → 放那个控件旁边，不进 `infra`。

## 状态容器是最基础的能力

`runtime/store.ts` 提供最小状态容器，只三个方法，不多也不少：

```ts
interface RuntimeStore<T> {
  getState(): T
  setState(next: T): void
  subscribe(listener: () => void): () => void
}
```

它不认识任务、通知、项目、会话 —— 只存一个值，并在值变了时通知订阅者。

**上层只认 runtime，不认具体实现。** 内部当前是 `zustand/vanilla`；将来换掉只改这一个文件，
`adv/*` 的 import 一行不动。这与 `ui/official.ts` 收口官方包是同一条原则，但目的不同：

| 收口点 | 为什么收口 |
|---|---|
| `ui/official.ts` | **必须**：官方包是宿主平台模块，别处 import 会让整个入口在 Node 里崩 |
| `runtime/store.ts` | **选择**：隔离第三方实现，换库不伤上层 |

React 绑定不进 `runtime`（它零 React）：`ui/infra/use-store.ts` 用 `useSyncExternalStore`
把容器接到组件。这与 `zustand/vanilla` + `zustand` 的分法一致。

**`use-store.ts` 收三个入参，不是两个**：`subscribe` / `getSnapshot` / `getServerSnapshot`。
服务端渲染时 React 必须拿到一个稳定快照，少第三个参数会直接抛错（任务栏 `TaskBar` 用
`renderToStaticMarkup` 测，立刻踩到）。`getServerSnapshot` 由调用方给（池里那个冻结的空快照），
不由容器提供。

**副作用不进容器**：`taskCenterStore.subscribe` 只登记快照监听，不开通道、不抢锁、不补发；
跨页 bring-up 是 `connectTaskCenter`（`src/adv/tasks/api.ts`）显式接线的事——它经 Web Locks
选主 + BroadcastChannel 扇出维护同源唯一一条 SSE（`src/adv/tasks/shared-stream.ts`，Lamport 届 +
基线握手 + 通知水位）。`RuntimeStore` 保持纯容器，不加任何生命周期钩子。

不许把 selector / 中间件 / devtools 塞进 `RuntimeStore` —— 一暴露，上层就依赖具体实现，收口就白做了。

### 哪些第三方要收口

判据：**上层代码里会不会出现这个库的类型或函数名 —— 会，就收口；不会，就不管。**

| 依赖 | 上层会碰到它的形态吗 | 收口到 |
|---|---|---|
| `zustand` | 会，拿着 `subscribe` / `getState` 用 | `runtime/store.ts` |
| `@floating-ui/react` | 不会，只在组件内部算位置 | 不收口 |
| `sonner` | 不会，只在 Toast 内部渲染 | 不收口 |
| `@uiw/react-codemirror` | 不会，只在 CodeEditor 内部 | 不收口 |

## 跨页消息分两层

`runtime/notify.ts` 只做两件事：把一条数据送到别的页面、按主题收回来。

| 层 | 内容 | 在哪 |
|---|---|---|
| 底层 | 按主题发一条 / 收一条 | `runtime/notify.ts` |
| 消费 | 收到之后做什么 —— 弹 toast、改红点、记日志、什么都不做 | 消费方自己写 |

底层只送信，**不许有默认行为**。主题由调用方给（任务一个、通知一个），两边不串味。

`ui/feedback/notify-bridge.ts` 是消费方之一（它选择把通知变成 toast），不是通知本身；
不想要 toast 的插件根本不引它。

**两个 `notify` 怎么区分**：`runtime/notify.ts` 是**跨页通知**（发一条 / 收一条，导出
`notifyMessage` / `subscribeNotifications`）；`ui/feedback/notify.ts` 是**本页提示**的发送 API
（卡片 / toast，导出 `notify` / `showToast`）。目录不同、函数名不同，不混。

**默认分组跟着通知走**：`setDefaultTaskProject()` / `getDefaultTaskProject()` 现在住在
任务模块里，但 `ui/feedback/notify.ts` 广播时也要读它。任务一旦搬到 `adv/tasks`，
`ui → adv` 就违反依赖方向。所以这份「默认分组」归 `runtime/notify.ts` —— 它是发送通知的
默认标签，不是任务的数据。函数名保留不改（改名是破坏性变更）。

**事件总线只有一个主**：`TASK_NOTIFICATIONS_EVENTS_KEY` 是跨 bundle 的 `Symbol.for` 单例。
若 `adv/tasks` 与 `runtime/notify` 各建一个，先到者占坑、后者静默拿到「形状合法」的错对象，
多插件同页时任务事件与通知从此分流且不报错。所以总线由 `runtime/notify.ts` 唯一持有，
任务只往里 emit。

## 任务为什么在 `adv` 不在 `runtime`

任务池不认识工作区 / 会话 / 文件 / 模型任何一个业务对象 —— 它自己持有「项目 / 分组 / 业务键 /
状态机」。它进 `adv` 不是因为「绑定业务对象」，而是因为**它是一整块功能：组件 + 能力一起交付**，
符合 `adv` 的判据。原判据写成「必须拿到业务对象」过窄，2026-11-16 已按此修正。

它借两样东西：`runtime/store` 记当前有哪些任务，`runtime/notify` 把「某个任务完成了」广播出去。
`runtime` 不知道有「任务」这回事。

列表跨页同步走服务端 SSE 三流：`task-snapshot`（全量基线）和 `task`（进度 / 终态状态）只投影列表、
永不弹卡；带唯一 id 的一次性 `task-notice` 才触发 toast / notify，客户端按 id 在 sessionStorage
按标签页去重（刷新 / 重连重推历史不重弹）。这三条流物理隔离，通知不挂在状态投影上。

## 立包判据

**有实质内容、会持续长大的功能模块才配独立成子包；只是一个控件就进 `ui`。**

统一到「控件」粒度就够了，不要提整个页面。已按此判据砍掉的：`host` 独立子包（取消，只留
`src/host/` 这一层 Node 代码）、`llm` 独立包（ModelPicker 进 ui）、设置页骨架（不抽，等第二个消费者）。

## 样式注入（本包最特殊的机制）

```
插件启动 ──▶ setStyleKit(createStyleKit({ id }))
                    │
                    ▼
        用到的控件首次渲染 ──▶ 自注入自己那份 CSS（幂等）
                                    │
                                    ▼
                       往 <head> 插/更新一个 <style id="{id}">
                       内容 = tokens 域 + 各「已用到」的控件域拼成的 CSS 文本
```

为什么必须运行时注入：DSH 客户端产物是 `window.__ModuleLoader__.load({ id, factory })` 的
CJS 闭包，`import './x.css'` 只会产出独立 css 资源、**内核不加载它** ⇒ CSS 只能以字符串在运行时注入。

**但那只约束产物，不约束源码**。样式是分三层走的：

```
src/**/*.css            真源 —— 编辑器高亮 / 括号匹配 / 格式化 / CSS lint 都生效
        │  scripts/gen-css.mjs（构建期：lightningcss 解析 + JSON.stringify）
        ▼
*.generated.ts         字符串常量（入库，勿手改）
        │  tsc 1:1 编译
        ▼
dist/**                产物形态不变，仍由 createStyleKit 拼成一份文本注入 <style>
```

为什么要这一层：2026-10-19 曾因手写模板字符串结尾多一个反斜杠，在注入文本里留下字面反引号，
吞掉紧随其后那条规则的选择器，排查耗掉一天（见 `docs/dependencies/dsh-host.md` §9）。
`JSON.stringify` 生成 + 构建期解析闸，把这类事故从根上删掉，产物形态却一点没变。

改样式的正确姿势：改 `src/**/*.css` → `pnpm run gen:css`（或 `pnpm run build`）→ 提交含生成物与
`dist/`。`pnpm test` 的 `pretest` 会跑 `gen:css --check`，生成物不同步直接红。

为什么是工厂而不是模块级单例：单例只有一个固定 style id，多个插件同处一页时会抢同一个 `<style>` 标签、
后挂载的覆盖先挂载的。每个插件领一套自己的（`id` 按插件唯一）；变量前缀全生态统一 `dshpc`。

为什么 core 可以用模块级变量存「当前 kit」：core 会被**内联进每个插件各自的 bundle**（不是共享运行时），
模块级变量天然按插件隔离，不像共享模块那样会互相踩。

## 数据从哪来

工作区列表、模型列表、会话消息都要跨 host↔client 边界。分两条口径（2026-10-20 拍板）：

- **通用控件是纯零件**：数据由调用方经 props 给，宿主能力经接口注入（`FileBrowser`、
  `SessionPreview`、通用 `Picker` 都算这类）。
- **领域能力自带数据面**（2026-10-28 扩到 explorer）：`ModelPicker` / `WorkspacePicker` /
  `openFilePreview` / `pickWorkspaceFile` 经 `connectHost(ctx)` **接线一次**后自己取数，消费方
  不再传数组、服务、会话 id。三条通路（2026-10-20 / 2026-10-28 真机核实）：
  - 工作区：client 侧 `ctx.inject(['workspaces'])` 的快照（getSnapshot + subscribe，follow 流实时更新），
    封装在 `src/ui/infra/host-data.ts` 的 `workspaceList`。
  - 模型目录：client 侧 remote **拿不到**每个 provider 的模型 ⇒ 插件宿主侧
    `llm.listModels()` 现查、`serveModelCatalog()`（`src/host/index.ts`，`./host` 子路径）挂成只读路由，
    client 侧 `connectHost(ctx, { modelsPath })` fetch。两侧共用同一个 path 常量。
  - 读文件（2026-11-03 换数据面）：**不再走 `remote.workspaceFiles`**（它的 `list` 被
    `contains(workspaceRoot, target)` 卡死，出不了工作区）。改走插件自己的只读路由：
    宿主 `serveFsRoute({ path })`（`src/host/fs-route.ts`，`./host` 子路径）+ client
    `connectFs({ path })`（`src/adv/explorer/fs-face.ts`，`createHttpFsFace` 内部 fetch）。
    **浏览不吃会话**：路径一律绝对；相对路径只在入口按 `sessionId` → 工作区根解析一次。
    会话还剩一处用途 —— Office 预览的授权探针（懒取任意一条，见
    `docs/dependencies/dsh-host.md` §13.1）。
  任一通路缺席只影响那一块：选择器渲染空态 / 降级提示，`openFilePreview` 直接不打开并留痕。

| 组件 | 数据从哪来 |
|---|---|
| `Picker` | 选项数据（props） |
| `ModelPicker` / `WorkspacePicker` | 自取（connectHost 接线；`groups` 参数仅作覆盖） |
| `openFilePreview` / `pickWorkspaceFile` | 自取（connectHost + connectFs 接线；`sessionId` 仅作相对路径基准 / Office 覆盖） |
| `FileBrowser` | `FsFace`（props，纯零件；绝对路径、只读） |
| `SessionPreview` | `SessionSource`（props） |

不传整个 `ctx`：ctx 是宿主给的整个大对象，传进来就把本包和宿主版本焊死；只传需要的那一小块，
宿主 breaking 时改的是插件「取出」的一行。

## 触发关系

- `setStyleKit()`：插件启动时调一次；不调则走默认 kit（多插件同页会互相覆盖，务必调）。
- 控件样式**按需**：各控件首次渲染时自注入自己那份 CSS（幂等），没用到的控件其 CSS 不进包。
  `ensureControls()` 现只剩「登记 token」一件事，是可选预热而非必需步骤。
- 自注入无 `document` 时静默跳过（SSR / 单测不炸）。
- `showToast()` 无 `document` 时静默跳过。

## 更新日志

- 2026-11-08 23:34:49：按文档库规范建立版本元数据与统一目录索引
- 2026-11-13 16:22:31：文档库结构迁移：旧路径改指新槽位
- 2026-11-16 11:18:01：分层树新增 runtime 与 adv/tasks，补三个无界面层的判据、通知的两层、任务归 adv 的理由
- 2026-11-16 11:22:50：新增状态容器一节：runtime/store 三方法、收口判据、React 绑定留 ui；runtime 定义改为有状态或有副作用
- 2026-11-16 11:44:06：取消 channel 一层：notify 兼做跨页消息，按主题区分；任务只借 store 与 notify，整份同步留给任务自己
- 2026-11-18：任务池重构为服务端权威；跨页连接改由 `connectTaskCenter` 显式接线，不再挂在 store.subscribe 上
- 2026-11-22（v0.45.0）：补单飞 SSE 的届/水位口径——Lamport 最大 tick 跨标签持久化、signal 只提示且 state-reply 唯一安装、通知按服务端 `settledAt` 水位裁切回放、隐藏态不清 halted；纠正「subscribe 顺手 connect/发 hello」的过时描述
- 2026-11-16 11:52:01：跨页消息改叫 runtime/message（notify 已被提示层占用）；默认分组随 message 归 runtime，避免 ui 依赖 adv
- 2026-11-16 12:00:33：评审后修正：跨页层改回 runtime/notify（message 接不住 notifyMessage）；store 补 getServerSnapshot 与副作用边界；事件总线唯一主；adv 判据改为「一整块功能」而非「绑业务对象」
