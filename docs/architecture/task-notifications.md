# 后台任务中心

弹窗收起到后台后的统一数据面。本文只写**契约口径与不变量**；类型签名与参数以
`src/adv/tasks/pool.ts` 的 TypeScript 声明为准，不在本文复制第二份。

## 定位与边界

`adv` 的应用模块 `dsh-plugin-core/adv/tasks`（池 + `useTasks` + `TaskBar`，见
`docs/architecture/structure.md` §六）；通知广播与默认分组在 `dsh-plugin-core/runtime`，任务侧只转发。
零 React、零 DOM 依赖，import 期不访问 `window` / `document` / `BroadcastChannel`，因此 Node 单测与 SSR 可直接加载。

适用范围：

- 数据只在本页与各同源标签页的**内存**里，进程或页面关闭即失；不落文件、不发请求、不轮询。
- 跨页只传纯数据（结构化克隆可得），不带函数、组件、`ReactNode`、Promise。
- 跨页条目能看；带 `actions` 的也能点 —— 请求发回创建它的那一页执行（`origin` 判据），不是把方法传过去。
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
- 派生结果有缓存：`selectTaskNotifications(snapshot, groups?, options?)` 对同一快照、同一过滤条件返回同一数组，
  不会每次渲染现算新引用。
- 两级分组：`project`（项目，一级）+ `group`（项目内二级，缺省 `default`）。
- 过滤三档：不传 / 空数组 = 本项目的全部二级；一个或多个名字 = 本项目这几个二级；
  `'*'` = 所有项目所有二级。第三参 `{ project }` 可以换项目，`{ project: null }` 表示不限项目。
- 项目名由**调用方显式给**，但只需在 app 入口 `setDefaultTaskProject()` 设一次；
  `notifyTask` 与 `selectTaskNotifications` 都从全局默认取值。core 拿不到项目名：
  `createStyleKit({ id })` 的 `id` 是每副本私有的 style 标签 id，不是项目标识。
  `projectLabel` / `groupLabel` 只覆盖显示名。

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

## 业务键与幂等登记

带 `key` 的登记是**幂等**的：同一个键在一个项目里同时最多对应一条记录。

| 情形 | 行为 |
|---|---|
| 本页已有同键条目 | 就地更新那一条（只覆盖本次给了的字段），返回**同一个**句柄；不新增、不发 `registered` |
| 别的页面已有同键条目 | 抛 `TaskNotificationConflictError`（`code: 'TASK_NOTIFICATION_CONFLICT'`，带 `key` 与 `ownerOrigin`），不返回假句柄 |
| 没有该键 | 正常新建 |
| 记录离开池（`done` / `fail` / 超时 / `settleLocal`） | 键随之释放，下一次同名作业是新的一条 |

注意：`timeoutMs` 缺省 0（不回收），所以没显式给窗口时，只有 `done` / `fail` / `settleLocal` 能让键释放 —— 作业型登记方要在 `finally` 里收尾，漏了会让同一个键一直被占（直到页面重载）。

- 唯一性范围是 `(project, key)`，`group` 不参与 —— 同一件事不该落在两个二级分组里。
- 键由**调用方**给，核心不解释含义、不校验语义，只做相等判等。它回答的是「这两条算不算同一件事」，所以只能用确定、且不会变的值：`['close', workspaceId, taskId]` 对；`['close', Date.now()]`、`['close', 标题]` 错——每次算出新键就等于每次都新开一条，等于没做去重。
- 写法：字符串原样用；数组按元素归一化成稳定串（池里存成 `#` + JSON）。两种形态分属两个空间，手拼 `a:b` 不会和 `['a', 'b']` 撞成同一个键。只收扁平原值（字符串 / 有限数字）；空串、空数组、对象、`NaN` 当场抛错。
- 读侧拿到的是 `record.key`（归一化后的串）。业务要拿自己的键比对，用同一份 `taskKey()` 算，别自己拼。
- 「这条是不是我刚起的」看 `notifyTask.ensure(...)` 的 `created`：`false` 说明本页已有同键任务，**别再起第二份活**——作业只该有一个执行者，`done` / `fail` 也归它。`notifyTask.run` 撞键时直接 reject 且不调用 `work()`：它没法既不起第二份活、又返回这段 work 的结果。
- 键会进快照、界面与日志，**别放敏感信息**（与 Temporal 对 Workflow Id 的警告同源）；核心不做运行时检查。
- 复用一条记录时 `actions` 一并换成本次给的那组方法（重挂载后的新闭包才是活着的那份）；不传就保留上一组，传空数组等于清空。`timeoutMs` 与 `hidden` 的默认值只在**首次**登记时定，复用沿用原记录（`update` 同样改不了窗口，只能靠活动续期）。
- 已知边界：判重看的是已合并的快照，刚打开、还没收到对端分片的页面看不见别人的键（约一个广播往返）。要硬保证得用 `navigator.locks` 给键持锁，代价是登记变异步，本阶段不做。

> 先例：Temporal 的 Workflow Id 保证「同 ID 同时最多一个在跑、Close 后可复用」，运行中再启动由 `WorkflowIdConflictPolicy` 决定（默认 `Fail`，也可 `Use Existing`）；Sonner `{ id }`、Chrome `notifications.create(id)`、Web Notification `tag` 都是同键就地替换；Web Locks / `docker --name` / VS Code command id 在跨上下文时一律报冲突。能在单上下文替换、跨上下文只能拒绝，是因为**执行体在谁手里**——跨页给句柄等于给假按钮。

## 按钮与动作

收起之后要能「拉回来」，靠的不是把方法传过去（函数过不了结构化克隆，这一点没有例外），而是**方法留在原地、只传 id**。

- 注册时给 `actions: [{ label, run }]`。`run` 是匿名函数，只在创建它的页面里执行；`label` 是纯数据。
- 记录里只有 `label`，下标就是动作 id；所以别的标签页也画得出按钮，点它时发 `invoke` 回创建页。
- 方法存在池私有的 `runners: Map<taskId#index, fn>` 里，与 `finishers` 同生命周期：
  `done` / `fail` / 超时回收 / `settleLocal` 结束即删（按 `id#` 前缀清），`dispose` 整表清空。不这么做就是闭包攥着组件树不放。
  带同一个 `key` 重新登记时整组换成本次给的方法 —— 重挂载后的新闭包才是活着的那份。
- `runAction(taskId, index): Promise<boolean>`：本页条目立即执行；跨页条目发 `invoke` 等 `invoked` ack，
  2s 没有回应按失败算。查不到方法、下标越界、方法抛错，一律 `false`，异常不冒给调用方。
- `false` 只说明**这一次没触发成功**：任务不存在、下标越界、方法已被清掉（页面重挂、句柄丢了、创建页已 dispose）、
  方法抛错，或跨页没人回 ack。它不等于「这条不可操作」——别的按钮、结束路径可能都还好；
  要判断有没有按钮看 `record.actions`，不要看 `canRestore`（那是旧 restored 通道的判据）。
- 界面上「点了没反应」不再允许：`TaskBar` 拿到 `false` 就调 `onActionFailure`，没给回调时弹一次核心自带提示
  （`taskbarActionFailed`）。只提示不重试 —— 上面几种原因核心都自愈不了，重试只是再等 2s。
  默认提示走 `notify()`，项目没挂 toast 宿主就还是静默，那种项目必须自己接 `onActionFailure`。
- **回收是独立开关**：`timeoutMs` 缺省 **0 = 不回收**，与 `hidden` 无关（2026-11-15 反转：hidden 缺省 5 分钟会让还在跑的作业先被判失败）。
  代价是「不回收的行会留到页面重载」，所以作业型登记方必须在 `finally` 里 `done` / `fail`，否则同一个键下次 `ensure` 会被当成还在跑。
- **到点自己结算（2026-11-16）**：带 `timeoutMs` 的本页条目由一条定时器守着最早到期的窗口 —— 到点按 `failed('timed out')` 结算并移出快照，**不依赖别人再写一条记录**（此前只有下次写入前才惰性结算，没人碰的任务会变成清不掉的僵尸）。每次登记 / `update` / `background` / 结束都按最后一次活动重排，所以持续活动会续期；`dispose` 摘表、重连再排。后台标签页的定时器会被浏览器节流，写入前的惰性结算保留作兜底。远端条目仍只由所属页结算，本页不替别人写状态。
  定时器只结算池里的记录，**不取消调用方还在跑的 work**，也不做心跳 / 不跟存活检测混用（那套仍只在收到分片 / 页面可见时探测）。

先例：VS Code `registerCommand(id, 匿名回调)` 与 `showInformationMessage(msg, ...items)`（方法留在扩展进程，UI 只回选中的字符串）；
Chrome 扩展通知的点击回调只有 `(notificationId, buttonIndex)`；Comlink `expose` 用闭包持有真实对象、消息只带 `path`。
宿主自己的 `userQuestionPanels.reveal(sessionId, callId)` 也是同一手法。

## 对外两个入口

日常写法是 `notifyTask`，形态对齐成熟实现，**不引入重载**（返回类型不随参数变）：

| 入口 | 形态 | 先例 |
|---|---|---|
| `notifyTask(title, options?)` → 句柄 | 自己管结束 | `ora(text)` 返回实例；`toast.loading(msg)` 返回 id |
| `notifyTask.ensure(title, options?)` → `{ handle, created }` | 幂等登记，带 `key` 时复用本页同键条目 | Temporal `Use Existing`（返回运行中那条的引用） |
| `notifyTask.run(title, work, options?)` → `work` 的原结果 | 自动收尾（成功 `done`、失败 `fail`）；带 `key` 撞上已在跑的同键则 reject | `oraPromise(p)`、`toast.promise(p, opts)`、`window.withProgress(opts, task)` |

- 第一个参数恒为标题：项目来自 `setDefaultTaskProject()`，二级分组来自 `options.group`，两者都能省。
- `work` 收 `Promise` 或返回 `Promise` 的函数（函数形式让任务在调用后才启动），与 `oraPromise` / `toast.promise` 相同。
- 基础入口**恒返回句柄**；自动收尾独立成 `run`，而不是塞进同一个函数的第三参 —— 后者会让调用处看不出拿到的是句柄还是 Promise，三家先例都没这么做。
- `taskNotifications.register(input)` 保留给「需要对象参数或池级能力」的场合，`notifyTask` 内部就是它。
- `handle.track(promise)` 保留为兜底（句柄已在手时才用得上），文档从主推降为备选，避免两套写法并存。
- `detail` 收任意 JSON 值（对象、数组、数字、布尔、null），入池前 `structuredClone` 取私有副本；
  函数、DOM 节点与类实例当场抛错。**调用方不需要自己 `JSON.stringify`**。

## 两类：常驻任务 vs 纯广播

| | 常驻任务（监控） | 纯广播（通知） |
|---|---|---|
| 入口 | `notifyTask` / `notifyTask.run` | `notifyMessage` |
| 进池 | 是 | **否** |
| 列表表现 | 出现 → 挂着（可 `update` 进度）→ `done()` 后消失 | **完全不出现**，只发一个 `message` 事件 |
| 跨页 | 分片同步，对端可见 | 一次性消息，不参与 baseline |
| 结束 | 必须有人 `done()` / `fail()` | 没有结束这回事，发完即止 |

- 纯广播**不写 shard、不动快照**：`revision` 不变，`useSyncExternalStore` 的订阅者不会被叫醒，
  所以不可能出现「先多一行再少一行」的闪动。
- **别用 `notifyTask(...).done()` 冒充广播**：它会先发 `registered` 再发 `settled`，列表必然闪一帧。
- 广播跨页走独立消息类型 `kind: 'message'`，带自己的序号，不参与分片 `seq` 与 baseline；
  旧版本副本解析失败直接丢弃，不会污染池，因此升协议不是必需的。
- 图标：`icon`（图标名 / 图标字体类名）与 `iconSvg`（原始 SVG 源）都是字符串，核心只存不解释；
  渲染方式与安全性由消费端负责 —— 组件和 ReactNode 跨页传不了。

## 两级分组

| 层 | 字段 | 谁给 | 缺省 |
|---|---|---|---|
| 一级 | `project` | app 入口 `setDefaultTaskProject('dsh-task-reminder')` 一次 | 无默认则抛错，不静默塞 `default` |
| 二级 | `group` | 调用时 `{ group: 'scan' }` | `default` |

- 默认项目挂在 `globalThis[Symbol.for('.../project/v2')]` 上：core 被打进每个插件各自的 bundle，
  模块级变量会让每个副本各存一份，app 里设一次对别的副本不生效。
- 读取三档见「快照契约」：本项目全部 → 本项目指定二级 → `'*'` 全站。
- 已知边界：同页多个插件共用一个全局默认项目，谁的 UI 要读**别人**的项目必须显式传 `{ project }`。
- 跨项目条目能看不能结束：`canRestore` 仍按 `origin` 判定，`settleLocal` 只清本页分片。
  按钮不在这条限制里：跨页条目照样能点，走的是 `runAction` 的 `invoke` 回传。

## 失联页面清理

状态在页面内存，页面消失时必须有人收尾：否则池里留下一条永远 `running` 的僵尸条目——它不属于本页（`canRestore` 为 false），本页也没有它的句柄，谁点都结束不掉。

判活用浏览器原生 **Web Locks**，不用心跳：

- 每页 `connect()` 时持一把以 origin 命名的锁（`TASK_NOTIFICATIONS_LOCK_PREFIX + origin`），永不主动释放。
  申请可能被浏览器拒绝（不透明 origin、存储分区、策略禁用），也可能在 bfcache 恢复时已被 UA 释放：
  这两种情况都要**重新申请**（`refresh()` 与 `pageshow(persisted)` 会补），被拒时只告警、不假装拿到了。
- 其他页对已知远端 origin 用 `{ ifAvailable: true }` 探测同名锁：**立刻拿得到 = 没有持有者 = 那页已经不在了**；回调返回即释放，探测本身不留痕迹。
- 探测时机只有真实事件：**收到分片**、**页面重新可见**。没有定时器，空闲或后台标签零开销。
- 防误判：连续两次探测（间隔 250ms）都拿得到才清，刚启动、还没拿锁的页不会被误删。
- 已知边界：某页始终拿不到锁（被拒且一直没重试成功）时，对端两探后仍会清掉它的分片。这不叫误判，
  是该页自己没证明活着；它下次 `publish` 会带新 `seq` 把分片补回去。
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
- 消息先过形状校验，畸形 / 外来消息直接丢，不进池。分片是整片校验的：**一条坏记录会带走同一片里的其他记录**，
  所以写入侧（`register` 的 `timeoutMs` / 字符串字段、`fail` 的 `reason`）按同一套规则先验，坏值在本页就抛。
- 通知随分片一起广播，对端合并状态后按 `remote: true` 转发到本页事件总线；本地是 `false`。
- `invoke` / `invoked` 是跨页按钮调用：`invoke` 只带 `taskId`、下标与 `reqId`，按 `target` 点名
  创建页执行；创建页执行完回 `invoked`，发起页按 `reqId` 配对。两者都不带状态、不参与分片 `seq`
  比较，形状不符直接丢。发起页 2s 收不到 `invoked` 就按失败算（创建页崩溃、被挂起或同一条已经结束）。

这不覆盖不同浏览器、不同 profile、不同机器：那需要经共同服务进程的推送链，
宿主 `HostWebServerLike` 目前只有请求-应答（`writeHead` / `end`），本阶段不做，只留扩展位置。

## 多副本收口

core 被打进每个插件各自的 bundle，模块级状态天然是每个副本一份。池与事件总线都挂在
`globalThis[Symbol.for(...)]` 上，同页所有副本共享同一个池、同一条总线，注册与通知不会重复 N 次。
键里带协议版本；宿主存在但形状不符时**直接报错**，不静默复用、不降级兜底。

已知边界：新加的池方法只存在于新副本上。同页若有**旧副本先占住**宿主，它没有 `ensure`，
新副本调 `ensure` 会当场拿到 `TypeError`（老方法 `register` / `runAction` 等照旧可用）。
处置是把那个插件重装到带 `ensure` 的版本，不是加兜底。

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

- 2026-11-16：`timeoutMs` 改为定时器到点自动结算（此前只在下次写入前惰性回收，僵尸任务清不掉）；对外展示名由「通知任务中心」改为「后台任务中心」；`TaskBar` 定宽 / 上限时计数并入同一段跑马灯、三角贴右不溢出；自定义色实心按钮字色固定用主题无关白
- 2026-11-15：新增业务键幂等登记 —— `key`（字符串 / 元组）、`record.key`、`taskKey()`、`notifyTask.ensure()` / `pool.ensure()`（返回 `{ handle, created }`）、跨页 `TaskNotificationConflictError`；同页同键就地更新并复用同一句柄，键随记录离池释放；`notifyTask.run` 撞键 reject 且不跑 `work`
- 2026-11-15：后台作业三处收口 —— `Button` 补回 `background` 底色轴（与 `color` 正交）、`hidden` 与回收解耦（`timeoutMs` 缺省 0，删 `TASK_NOTIFICATIONS_HIDDEN_TTL_MS`）、`TaskBar` 动作失败不再静默（`onActionFailure` + 自带提示 `taskbarActionFailed`）
- 2026-11-15：收拾几处既有缺陷——存活锁被拒不再漏成 unhandled（复位并在 `refresh` / bfcache 恢复时重试，`offline` 池不申请）、记录可选字段与写入侧入参同套校验（`timeoutMs` 有限非负、`reason` 转字符串）、`update({ hidden: false })` 能取消隐藏、广播序号只自增一次、跨页陈旧判据只放行「同 seq 重发」
- 2026-11-15：新增按钮动作 `actions: [{ label, run }]` 与 `runAction(taskId, index): Promise<boolean>`——方法只留在创建页内存（`runners`，与 `finishers` 同生命周期），记录里只存 `label`；跨页点击发 `invoke` 回创建页、等 `invoked` ack（2s 超时按失败）。`requestRestore` 保留为本页旧通道
- 2026-11-12：新增纯广播 `notifyMessage()`（只发 `message` 事件，不进池、不动快照，因此不闪）；任务与消息都支持 `icon` / `iconSvg`
- 2026-11-12：两级分组（`project` + 二级 `group`）与协议 2；`setDefaultTaskProject()` 一次定型；`notifyTask` 改为 `(title, options?)`；`selectTaskNotifications` 改为三档 + `'*'` 全站；`detail` 放宽为任意 JSON 值（入池前克隆私有副本）
- 2026-11-12：新增 `settleLocal()`（无需句柄地收尾本页条目）与失联页面清理（Web Locks 判活，无定时器，触发于收到分片 / 页面可见）；协议与 `bye` 路径不变
- 2026-11-12：新增日常入口 `notifyTask` / `notifyTask.run`（形态对齐 `oraPromise` / `toast.promise` / `withProgress`）；`register`、句柄与跨页协议一律不变
- 2026-11-12 14:57:52：建立后台任务池契约；阶段 0 / 1 落地并通过全链自检
- 2026-11-12：能力对外定名「通知任务中心 / Task Notification Hub」，内部两条通道为「任务快照池」与「事件总线」；显示层标题、组名同步
- 2026-11-12：按用户「都改呀」完成统一改名——公共导出、源码、测试、契约与帮助文档、demo、`SectionId`、i18n 前缀 `tn*`、协议键与全部文件路径都换成 `task-notifications`；协议结构未变，`PROTOCOL` 仍为 1，不留旧别名与兼容层
