# 通知任务中心

弹窗收起到后台后的统一数据面。本文只写**契约口径与不变量**；类型签名与参数以
`src/ui/infra/task-notifications.ts` 的 TypeScript 声明为准，不在本文复制第二份。

## 定位与边界

`ui` 的 `infra` 层模块，从 `dsh-plugin-core/ui` 扁平导出，不新增子路径
（`docs/design/structure.md` §六「不再新增子路径」）。零 React、零 DOM 依赖，
import 期不访问 `window` / `document` / `BroadcastChannel`，因此 Node 单测与 SSR 可直接加载。

适用范围：

- 数据只在本页与各同源标签页的**内存**里，进程或页面关闭即失；不落文件、不发请求、不轮询。
- 跨页只传纯数据（结构化克隆可得），不带函数、组件、`ReactNode`、Promise。
- 跨页条目**能看不能点**：只有创建它的那一页能还原弹窗（`origin` 判据）。
- 不含任何模拟 / 占位数据。条数、时间、状态、分组全部来自真实注册与真实时钟。
- 本阶段只提供新能力，不替换 `toast-host` / `loading-host` / `modal-host` 等既有机制。

## 两条通道，不许合并

| 通道 | 形态 | 消费方式 |
|---|---|---|
| 状态池 | 任意时刻可读的全量快照 | `getSnapshot` / `getServerSnapshot` / `subscribe`，可直接喂 `useSyncExternalStore` |
| 事件总线 | 一次性投递、不留存 | `subscribeTaskNotificationEvents`；core 内部与消费端用同一条 |

历史通知不能替代快照：新开的页面没听过任何历史事件，靠 `hello` 换回全量分片补齐。
反之，快照也不能替代事件：「收起」是一次性事实，读完快照看不出来。

## 快照契约

- 快照是 `{ tasks, revision }`，`tasks` 按 `startedAt` 再按 `id` 排序，跨页顺序确定。
- **引用稳定**：无变化不产生新对象；只有状态真变了才推一次新快照。
  `getServerSnapshot()` 永远是同一个冻结空快照，SSR 不炸。
- 派生结果有缓存：`selectTaskNotifications(snapshot, groups)` 对同一快照、同一过滤条件返回同一数组，
  不会每次渲染现算新引用。
- 过滤三态：不传 / 空数组 = 全站全显示；传一个 = 只看该分组；传多个 = 只看这几个。
- 分组名由**调用方显式给**。core 拿不到项目名：`createStyleKit({ id })` 的 `id` 是每副本私有的
  style 标签 id，不是项目标识。`groupLabel` 只覆盖显示名。

## 结束与收起

注册返回句柄，结束权在调用方：

- `done()` / `fail()` 幂等；成功后条目立刻从池中移除，成功后重复调用不再推快照、不再发通知。
- `track(promise)` 是兜底：成功与 reject 走同一个收尾，且返回原 Promise，不改变调用方的结算语义。
- `update()` / `background()` 只改纯数据字段，随时可调用。
- `settled` 只在任务**真正结束**时兑现。收起不兑现它，而是发一个 `backgrounded` 事件。

**Promise 第三种结局的定稿**：不往 Promise 里塞第三种值。既有命令式弹窗把「关闭」与「结算」
焊死，收起若立刻 resolve 会让调用方误判完成，不 resolve 又让调用点永久挂起。新契约是
「Promise 两态（由 `settled` 表达）+ 收起作为事件」，调用方 `await` 的仍是正常两态，
想跟踪收起就监听事件。弹窗侧在阶段 2 按此口径新开 API，不改现有 `confirmModal` / `alertModal` 签名。

## 对外两个入口

日常写法是 `notifyTask`，形态对齐成熟实现，**不引入重载**（返回类型不随参数变）：

| 入口 | 形态 | 先例 |
|---|---|---|
| `notifyTask(group, title, options?)` → 句柄 | 自己管结束 | `ora(text)` 返回实例；`toast.loading(msg)` 返回 id |
| `notifyTask.run(group, title, work)` → `work` 的原结果 | 自动收尾（成功 `done`、失败 `fail`） | `oraPromise(p)`、`toast.promise(p, opts)`、`window.withProgress(opts, task)` |

- 两个入口前两参一致（`group, title`）：从前者改后者只需换函数名再加一个活，不用记两套参数顺序。
- `work` 收 `Promise` 或返回 `Promise` 的函数（函数形式让任务在调用后才启动），与 `oraPromise` / `toast.promise` 相同。
- 基础入口**恒返回句柄**；自动收尾独立成 `run`，而不是塞进同一个函数的第三参 —— 后者会让调用处看不出拿到的是句柄还是 Promise，三家先例都没这么做。
- `taskNotifications.register(input)` 保留给「需要对象参数或池级能力」的场合，`notifyTask` 内部就是它。
- `handle.track(promise)` 保留为兜底（句柄已在手时才用得上），文档从主推降为备选，避免两套写法并存。

## 失联页面清理

状态在页面内存，页面消失时必须有人收尾：否则池里留下一条永远 `running` 的僵尸条目——它不属于本页（`canRestore` 为 false），本页也没有它的句柄，谁点都结束不掉。

判活用浏览器原生 **Web Locks**，不用心跳：

- 每页 `connect()` 时持一把以 origin 命名的锁（`TASK_NOTIFICATIONS_LOCK_PREFIX + origin`），永不主动释放。
- 其他页对已知远端 origin 用 `{ ifAvailable: true }` 探测同名锁：**立刻拿得到 = 没有持有者 = 那页已经不在了**；回调返回即释放，探测本身不留痕迹。
- 探测时机只有真实事件：**收到分片**、**页面重新可见**。没有定时器，空闲或后台标签零开销。
- 防误判：连续两次探测（间隔 250ms）都拿得到才清，刚启动、还没拿锁的页不会被误删。
- 清理动作与 `bye` 完全同路径：删该 origin 分片 → `revision` 递增 → 发 `peer-left` 事件。
- `navigator.locks` 不存在（老浏览器）→ 不做清理，其余行为不变；`createTaskNotificationPool({ locks: null })` 可显式关闭。

依据与边界：Web Locks 规范 §2.6 要求文档卸载与 agent 终止时释放其锁，`broadcast-channel` 5.x 正是用这条路替掉整套死亡检测。**渲染进程崩溃**规范不保证，那类残留留到浏览器重启；不为它引入心跳——后台标签页的定时器会被浏览器节流，心跳会误删正在跑的任务。

## 本页一键收尾

`settleLocal(reason?)` 结束本页仍持有的全部任务并返回条数，**不需要句柄**：组件重挂载、HMR、页面切走都会让调用方丢掉句柄，这条路径让本页永远能自己收干净。跨页条目一律不动，保持「只有 owner 能结束」。

## 跨页协议

浏览器原生 `BroadcastChannel`，频道名 `TASK_NOTIFICATIONS_CHANNEL`。每页有唯一 `origin`：

- 每页只维护**自己创建的分片**，任何变化都广播该分片的**全量**内容，并带本页单调 `seq`。
  全量而非增量，就不存在漏一条增量导致状态永久分叉。
- 新页 `connect()` 发 `hello`；在线页收到后回自己的全量分片。**这个回复就是 baseline**，
  不需要历史事件重放，也不需要轮询。
- 收到分片时按 `(origin, seq)` 比对：旧 `seq`、重复消息一律丢弃，天然抗乱序与重复投递。
- `pagehide` 广播 `bye`，对端移除该分片；`pageshow` / 标签页重新可见时递增 `seq` 重发全量分片
  并再要一次 baseline，覆盖 bfcache 与后台休眠。迟到 `bye` 的 `seq` 小于已知值时忽略，
  不会误删已恢复的分片。
- 消息先过形状校验，畸形 / 外来消息直接丢，不进池。
- 通知随分片一起广播，对端合并状态后按 `remote: true` 转发到本页事件总线；本地是 `false`。

这不覆盖不同浏览器、不同 profile、不同机器：那需要经共同服务进程的推送链，
宿主 `HostWebServerLike` 目前只有请求-应答（`writeHead` / `end`），本阶段不做，只留扩展位置。

## 多副本收口

core 被打进每个插件各自的 bundle，模块级状态天然是每个副本一份。池与事件总线都挂在
`globalThis[Symbol.for(...)]` 上，同页所有副本共享同一个池、同一条总线，注册与通知不会重复 N 次。
键里带协议版本；宿主存在但形状不符时**直接报错**，不静默复用、不降级兜底。

## 依赖

`zustand@5.1.0` 的 `zustand/vanilla`（`createStore`）只在本模块内部使用：`getState` /
`setState` / `subscribe` 提供可查询状态与订阅边界，不引 React。它是内部实现，不 re-export，
公共类型里不出现第三方类型，消费方看不见它。实测 ESM（Node / 单测）与
`window.__ModuleLoader__.load` 的 CJS 闭包两侧都可解析，闭包构建时会被内联，
不留给宿主 `require`。

选它的理由：需要的是 client-state 的「可查询状态 + 订阅」，`vanilla` 入口零依赖、
可显式创建、import 期无副作用；跨页同步与多副本收口是 DSH 产物形态带来的问题，
任何库都替不了，故收敛到本模块这一层。

## 阶段范围

| 阶段 | 内容 | 状态 |
|---|---|---|
| 0 | 契约定稿、依赖落位、ESM / CJS 两侧可解析验证 | 完成 |
| 1 | 状态池、订阅、事件总线、跨页分片、baseline、单例、结束句柄 | 完成 |
| 2 | 可收起弹窗：例外控件、收起事件、隐藏保树、显隐与 Tab / Esc 联动 | 未开始 |
| 3 | 事件查看控件：计数、下拉、还原弹窗、分组过滤、demo 页 | 未开始 |
| 4 | 真机验收与对外门面文档 | 未开始 |
| 5 | 统一替换既有零散机制 | 暂缓，等 1–4 稳定后按指令一次性做 |

**任务边界（2026-11-12 用户拍板）**：阶段 2（可收起弹窗：例外控件、隐藏保树、Tab / Esc 联动）与阶段 3（事件查看控件：计数、下拉、还原弹窗、过滤、该控件的 demo 页）**整体不属于「总的订阅通知中心」任务**，由用户后续单独开任务承接。本任务只交付阶段 0 / 1 的数据面，加上本轮的对外使用帮助与 demo 数据面演示页；演示页只演示真实调用池与事件总线，不实现可复用查看控件、不做下拉、不还原弹窗。

阶段 1 的自检覆盖：快照引用稳定、结束幂等、事件五类（registered / updated / backgrounded / settled / restored）、跨页即时可见、baseline、
乱序 / 重复 / 畸形消息、迟到 `bye`、休眠恢复、多副本单例、SSR，以及 CJS 闭包里
真实注册并结束一条任务（不是只检查产物字符串）。

## 更新日志

- 2026-11-12：新增 `settleLocal()`（无需句柄地收尾本页条目）与失联页面清理（Web Locks 判活，无定时器，触发于收到分片 / 页面可见）；协议与 `bye` 路径不变
- 2026-11-12：新增日常入口 `notifyTask` / `notifyTask.run`（形态对齐 `oraPromise` / `toast.promise` / `withProgress`）；`register`、句柄与跨页协议一律不变
- 2026-11-12 14:57:52：建立后台任务池契约；阶段 0 / 1 落地并通过全链自检
- 2026-11-12：能力对外定名「通知任务中心 / Task Notification Hub」，内部两条通道为「任务快照池」与「事件总线」；显示层标题、组名同步
- 2026-11-12：按用户「都改呀」完成统一改名——公共导出、源码、测试、契约与帮助文档、demo、`SectionId`、i18n 前缀 `tn*`、协议键与全部文件路径都换成 `task-notifications`；协议结构未变，`PROTOCOL` 仍为 1，不留旧别名与兼容层
