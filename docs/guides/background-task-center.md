# 接入后台任务中心

一个插件要把长任务交给后端执行、要终态弹卡 / 通知、要在核心列表里看到进度并带「查看 / 重跑」按钮时，
按这篇接入。消费方只写两处接线代码（本页接线 + 每次发起），再加一次展示挂载；列表画面、进度展示、终态分发都归核心控件。

> 签名与参数以 `docs/api/task-notifications.md` 为准；契约与不变量见 `docs/architecture/task-notifications.md`。

## 前置条件

- 执行体能注册成核心的开放执行器：`kind` 任意字符串，handler 收 `(args, ctx)` 并返回
  `{ outcome: 'done' | 'failed', reason? }`。宿主 agent 走官方 API；shell / host 脚本在插件自己的 host 侧注册。
- 服务端能按 viewer 给出任务基线并订阅增量，供 `serveTaskStream` 推送。没有服务端推送时也可用纯本地模式
  （`connectTaskCenter` 不传 `streamUrl`），适合调试与单测。

## 步骤

1. **接线随面板生命周期**（`client/task-ui.ts`）：注册按钮 id → 本页函数，订阅终态刷自己的数据。
   列表与 Toast 共用这一份 handlers。**所有按钮在所有页都画**、不隐藏不置灰；发起面板不在前台时点按钮，
   核心先暂存意图、切回该面板，等下面这份接线重新注册后补发 handler；面板已激活则立即执行。
   无可执行目标（条目失效 / 无 panelId / 面板已激活仍无 handler）才给一次统一提示。
   **切走时调返回的注销函数、切回来重新注册**——这是跨面板按钮生效的前提。
   `toast.*.scope:'all'` 每个标签页都弹卡、每页都有按钮；`'origin'` 只发起页弹卡（其它页无卡自然无按钮）。

   ```ts
   import { mountTaskUI } from 'dsh-plugin-core/ui/task-ui'

   export function mountLedgerTaskUi(): () => void {
     return mountTaskUI({
       project: 'dsh-task-reminder',       // null / 省略 = 收所有项目
       groups: ['close'],
       handlers: {
         'open-log': (task) => openLog(task.detail?.logPath),
         retry: (task) => void startClose(task.detail?.taskId),
       },
       onSettled: () => refreshBoard(),    // 只刷自己的台账数据，核心列表自己刷
     })
   }
   // 面板 useEffect 里 return mountLedgerTaskUi()，切走注销、重挂重注册。
   ```

2. **每次发起**（`client/close-task.ts`）：标题、通知、按钮声明全是纯数据跟着记录走。

   ```ts
   import { startTask } from 'dsh-plugin-core/adv/tasks'

   await startTask({
     project: 'dsh-task-reminder',
     group: 'close',
     title: { category: '任务结案', description: `结案 ${taskId}` }, // 分类 + 说明，展示成「分类丨说明」
     key: `close:${taskId}`,              // 同项目幂等，重复发起就地更新
     kind: 'reminder:close-task',         // 执行器名，核心不枚举
     args: { taskId },                    // 纯数据，不带函数
     toast: { success: { title: { category: '任务结案', description: `已结案 ${taskId}` }, button: { id: 'open-log', text: '看日志' }, scope: 'all' } },

     notify: { success: { message: '结案完成', broadcast: 'plugin' } },
     rowButtons: [{ id: 'open-log', text: '看日志', when: 'done' }],
   })
   ```

3. **挂核心列表**（`client/index.ts`）：本插件不画行、不写 filter、不拼进度文案。

   ```ts
   import { TaskBar } from 'dsh-plugin-core/adv/tasks/ui'
   import { connectTaskLayout, connectTaskCenter } from 'dsh-plugin-core/adv/tasks'

   // 两个 disposer 都要挂进 cleanup：核心按 streamUrl 做 refcount，漏接就不释放连接。
   const offTasks = connectTaskCenter({
     streamUrl: '/api/task-center/stream',
     headers: () => ({}),
   })
   const offLayout = connectTaskLayout(ctx)  // 自动记 panelId，点按钮先切回发起面板
   ctx.effect(() => () => {
     offTasks?.()
     offLayout()
   })
   // 展示用核心原生 TaskBar（形态 / 尺寸 / 宽度 / 跑马灯都沿用核心）
   h(TaskBar, { groups: ['close'] })
   h(TaskBar, { form: 'icon', size: 'lg', groups: ['close'] })
   h(TaskBar, { maxWidth: 110, groups: ['close'] })
   ```

4. **服务端推送**（host 侧）：基线 + 增量由服务端提供，`authorize` 必填。

   ```ts
   import { serveTaskStream } from 'dsh-plugin-core/host'

   serveTaskStream(ctx, {
     basePath: '/api/task-center',
     authorize: (req) => currentViewer(req),
     source: {
       snapshot: (viewer) => listTasks(viewer),            // 全量基线，只恢复列表、不弹卡
       subscribe: (emit, viewer) => watchTasks(emit, viewer), // 状态增量，只更新列表、不弹卡
       subscribeNotices: (emit, viewer) => watchNotices(emit, viewer), // 一次性通知，才弹卡；订阅时回放 outbox 补断线期间的
     },
   })
   ```

   **服务端 `onSubmit` 必须把 client 随提交发来的 `origin` 与 `panelId` 回填到任务记录**
   （两者是 core 自动记、不在 `StartTaskInput` 契约里的页面级/面板级身份）。`origin` 决定
   `scope:'origin'` 的通知只在发起标签页弹，`panelId` 决定点按钮时切回哪个面板。前端在
   `store.merge` / `deliverNotice` 里对服务端漏发的这两个字段做了本地兜底，但那是防线不是常态；
   服务端正常必须回填，否则跨页归属与切面板会退化。

  **`key` 与 `project` 都要回显**：`startTask` 先落一条带 `key`/`project`/`group` 的乐观 running 行
  再发 POST（缺省由核心补齐并随 payload 发出），服务端必须在所有 SSE 帧（`running`/进度/终态）与
  通知里回显同一个 `key` 和提交体里的 `project`。真源靠同 `(project,key)` 归一覆盖乐观行；任一字段
  失配会出现「乐观行 + 真源行」两条，且快速任务的终态可能被晚到的乐观行覆回 `running`。提交失败时
  核心会回滚乐观行，不留幽灵行。

  **终态（`done` / `failed`）帧必带 `settledAt`**（有限数结算时刻），`running` 帧不得携带。
  入口 `isTaskRecord` 按状态校验并拒收缺时刻的终态帧；客户端不会用本地时间补服务端时钟。
  服务端是状态真源，SSE 推终态时请务必带上，否则该帧被拒收、任务停在 `running` 并有告警。

  **SSE 错误按阶段区分**：鉴权失败（`authorize` 抛错或返回空）401、服务侧故障（订阅/快照/推流失败）503。
  退避档只约束「无数据进展的连接」（连上就 EOF / 首帧前 reject / fetch 失败），用尽即通过
  `connectTaskCenter({ onGiveUp })` 上报（`onGiveUp` 是 `TaskCenterHost` 字段，默认接线即可拿到）；
  一旦某轮读到过字节（含保活），无论 EOF 还是异常断开都算有进展、退避归零继续重连。永久错误
  （其余 4xx，`reason.permanent=true`，如 401）让单飞协调器进入停机（halted）：**让出持有的锁、
  停掉重申请**，不再无限轮转刷鉴权失败。恢复有两条路：① 页面恢复可见 / 网络恢复（`visibilitychange`
  / `online`）自动唤醒；② 应用在 `onGiveUp` 里刷新凭证后，重新调用一次 `connectTaskCenter` 触发
  `resume`（`headers` 是函数，新连接取到新 token）。两条路都重新申请锁、不会永久离线。无 Web Locks
  时保持离线；Node 直连路径在 permanent giveUp 后由再次接线重建连接。

  **同源多标签只建一条 SSE**：`connectTaskCenter` 内部自动启用单飞协调器——`navigator.locks`
  在同源标签中选一个 owner 建真连接，其它标签经 BroadcastChannel 收同一份帧；owner 关闭可由等待者接管。
  连接数是「每个 `streamUrl` 全局一条」，不再是「每标签一条」，因此不会挤爆 http/1.1 每域 6 连接上限。
  消费方接线不变（照上面调 `connectTaskCenter` 即可），但有两个契约：

- 按按钮提交任务的 POST 是瞬时请求、结束即释放 socket，不属于常驻连接，不并入 SSE（合并需换成双向协议，
  既要新端点又照样占连接数，违反「零额外服务开销」）；按钮事件照常走 POST。
- `connectTaskLayout(ctx)` 现在返回 disposer，必须与 `connectTaskCenter` 的返回值一起挂进
  `ctx.effect` 的 cleanup；核心内部按合并后的 `streamUrl` 做 refcount，漏接 cleanup 会让连接不释放。

浏览器缺 `navigator.locks` 时不会退回每标签各开一条——会显式告警并保持离线，提交仍可用。

**届与通知水位（v0.45.x，含后续加固，以核心 `package.json` 为准）**：同源标签视为一个逻辑进程，owner 的届是 Lamport `{tick,id}`；
最大 tick 只由持锁 owner 写 localStorage（follower 不写，避免跨标签 read-modify-write 把高值覆盖回低值），
无存储时退模块内存；读取取存储与内存的最大值，存储被清空也不回拨。新标签继承后 +1，不会铸出低于在册
follower 的届。`signal` 只是「去拉基线」的提示、不安装届，只有 `state-reply` 是安装入口；旧届 reply
一律丢弃，真换届重置 seq 水位。`state-request` 带接收方的 `noticeSince`（已收通知的最大服务端
`settledAt`），owner 回放 `settledAt >= since` 的缓存项：新标签从加入时刻起算，不会被历史通知灌满；
同毫秒多投靠 notice id 去重兜底，不拿时间戳当身份。缓存保留全量，切主后新 owner 仍可回放。这里的
水位只裁本地 BC 回放，不是服务端 cursor；服务端须用真实时钟生成 `settledAt`，不要给远未来的值。
`visibilitychange` 隐藏时也触发，`online` / `pageshow` / `resume` 也可能在后台发生——所有唤醒事件
统一过可见性闸门，隐藏期间不清 halted。

## 消费方复查反馈的处置（v0.45.0）

| 反馈 | 研判结论 | 责任方 / 处理 |
|---|---|---|
| ① 升级后仍见旧行为 | 消费方依赖仍钉 `dsh-plugin-core@0.44.0`，旧包当然没有 v2 修复；core 不做旧版本兼容分支（已定口径，兼容分支只会把协议倒回不可比较的随机届） | 消费方升到**核心当前版本**（两包同号，以 `package.json` 为准）并重新构建产物 |
| ② 冷标签 owner 届低于在册 follower | core 真问题：Lamport 时钟只存内存，新标签从 0 起铸届会被 follower 三道闸门全拒；已改为最大 tick 只由持锁 owner 落盘，读取取存储与内存最大值 | core 已修（#2），消费方随升级获得 |
| ③ 跨运行 `settledAt` 被旧运行污染 | core 真问题：`carryIdentity` 无条件继承旧终态时刻；同运行 first-wins 应保留，跨运行必须取新值 | core 已修（#3），消费方随升级获得 |
| ④ notice id 重启后重号 | 非 core bug：core 按 `TaskNotice.id` 在 sessionStorage 有界去重（最近 512 个），id 必须**跨会话/重启全局唯一**；按内容或时间去重会误吞真重跑的同内容通知，core 无法替服务端造身份（这条去重链有端到端回归） | 消费方用持久化单调序号或 UUID 生成 id，不要从 0 重计 |
| ⑤ `origin` / `panelId` 未回显 | 非 core bug：core 在 `startTask` 时随提交体发出这两个字段，要求服务端在帧与通知里回显；store 对缺失做 fail-open 本地兜底是刻意的「不漏结果」——强校验拒收会让任务从列表消失，比归属判错更糟 | 服务端回显 `origin` / `panelId`；core 不改为拒收 |
| ⑥ 新标签被灌历史 notice | core 真问题：回放没有接收方水位；已加 `noticeSince` / `noticeWatermark`，并按 `>=` 重放同毫秒通知、由 id 去重兜底 | core 已修（#6），消费方随升级获得 |
| ⑦ 切走标签误清 halted | core 真问题：`visibilitychange` 隐藏时也触发，被当纯 show；所有唤醒事件已统一过 `isVisible()` 闸门 | core 已修（#7），消费方随升级获得 |
| ⑧ 同毫秒 `startedAt` 撞号 | 非 core bug：core 只能用服务端已有的 `startedAt` 认运行实例，单方加随机/计数会伪造一个与真源对不上的身份；同 key 严格递增是服务端可保证的契约 | 服务端保证同 key `startedAt` 严格递增，或另行评审引入显式 `runId` 契约 |
| ⑨ 基线声明去重但重复回调 | core 真问题：`cacheNotice()` 内部先 `markSeen`，`applyBaseline` 再查集合会把当前这条自己吞掉；已改为入缓存前快照 `fresh` | core 已修（#9），消费方随升级获得 |

### 第二轮封口：专家评判后的 core 责任与契约

六条「非 bug」经独立 API 评审逐条复核，结论并非全部甩给消费方——其中四条暴露了 core 自身的责任缺口，已一并治本；剩余两条维持契约但写清可履行方式。

| 条目 | 专家评判与结论 | 消费方 / 服务端怎么用 |
|---|---|---|
| 跨 realm 低届 owner（隐私模式 / 存储被清空，各标签内存兜底独立） | **core 真缺口，已修**：高届 follower 在任何权威消息（开局 signal / 低届 reply / 低届 frame）上都广播 fencing claim，低届 owner 让锁并重铸更高届；晚重拉也能自愈，不再依赖共享存储 | 随升级获得 |
| 乐观行随 owner 基线传播成跨标签幽灵 running | **core 真缺口，已修**：`getBaseline()` 只发真源已确认的行，乐观行不外泄 | 随升级获得；POST 在飞期间别的标签看不到该行 |
| 同页混版共享 store / executor | **core 隔离缺口，已修**：store / executor 的全局收口符号随协议升到 v2，与 wire / notify 一致；0.44 与新版插件同页不再共享池和注册表 | 同页并存版本各自独立；仍应统一升到当前版本 |
| 512 条 outbox 回放后老通知重弹 | **core 缺口，已修**：去重除 id 集合外，按 project 记已见最大 `settledAt` 水位；id 被挤出 512 后，`settledAt` 更早的回放仍被吞（同毫秒靠 id 去重，不误伤） | 随升级获得；通知 id 仍须全局唯一 |
| `origin` / `panelId` 缺失静默多弹 | **core 诊断缺口，已修**：`scope:'origin'` 且服务端没回显 origin 时，每个任务 id 打一次 `console.warn`，不再静默退化 | 服务端在 SSE 帧 / 通知里回显 `origin` / `panelId`（提交响应无需回显，core 不读它）。fail-open 保留本地值仍刻意不改为拒收——拒收会让任务从列表消失 |
| 连续 401 的「有界」无 core 机制 | **core 缺口，已修**：连续两次 permanent giveUp 后，冷却窗口内的 resume / online 唤醒 no-op；只有读到真实 SSE 字节才清零（不是 600ms 定时器），延迟鉴权也算数。有界从文档承诺变成 core 保证 | 在 `onGiveUp` 里刷新凭证；同步刷新后立即重接线仍立即生效（streak=1 不受冷却） |
| `online` 唤醒无法关闭 | **core 缺口，已修**：`TaskCenterHost.autoRecoverOnOnline?: boolean`（默认 true），设 false 则不因 online 唤醒；监听器始终只绑一次、事件时读当前值 | 严格「仅显式恢复」应用设 `autoRecoverOnOnline:false`，凭证就绪后显式调 `resume`；也可先 false 拦旧 headers、刷新后置 true，改值即时生效。`visibilitychange` 等可见性恢复仍生效 |
| 消费方仍钉 `0.44.0` | 先决条件，非 core 可代劳 | 把依赖升到**核心当前版本**（两包同号，以 `package.json` 为准），重构产物再部署；钉旧版等于所有修复都不生效 |
| notice id 重启重号被吞 | 契约，非 core bug：`id` 是通知唯一身份，core 无法替服务端造一个跨重启稳定的 id | 生成 id 时加入**宿主实例级随机熵**（UUID 或持久化到磁盘的单调计数），不要只用内存 `++seq` |
| 同毫秒 `startedAt` 撞号 | 契约，非 core bug：core 只能认服务端给的 `startedAt`，单方造 id 会与真源对不上；撞号时新 running 会被当重放吞 | 服务端保证同 key 的 `startedAt` **严格递增**（`max(Date.now(), last+1)`）；做不到时需评审显式 `runId` 契约（包含 store 身份判定与文档同步），core 不单方扩展协议 |

### 第三轮边缘项封口：消费方复查与专家盲扫

| 条目 | 结论 | 怎么用 / 依据 |
|---|---|---|
| `autoRecoverOnOnline:false` 后置改值不生效 | **core 真问题，已修**：旧实现按建流时的开关值决定是否绑 online，先 false 后改 true 的应用永远收不到唤醒；现始终只绑一次、事件时读当前值，改值即时生效，不重绑也不掐在飞流 | 初始化设 false 拦旧 headers 的 401，凭证刷新后置 true，下一次 online 即唤醒；同 key 重复接线仍不重建 |
| `scope:'origin'` 缺 origin 跨副本重复 warn | 判定可接受，不修：默认 host 每模块实例一份 `warnedMissingOrigin`，但通知按 id 在 sessionStorage 去重，同一通知不会二次进入判定，同 tab 通常只 warn 一次；多副本各自告警是独立实例的正常诊断 | 服务端按契约回显 `origin` / `panelId` 即可消除告警；不回显时 fail-open 仍弹卡，只是配置错误可发现 |
| Node 直连 401 计数时序 | **core 真问题，已修**：旧实现在 `onGiveUp` 回调前累加 permanent streak，回调内同步刷新凭证重接后的第二次 401 直接踩到 streak≥2 冷却被吞，Node 无其他恢复路径会永久停机；现与单飞路径同序——先置停机、再跑回调、最后累加 | 与浏览器路径一致「连续两次 permanent 才冷却」：首次失败后回调内重接仍立即放通，凭证未刷新才进入冷却 |
| sessionStorage 写入失败后去重失效 | **core 真问题，已修**：配额满 / 禁用导致 `setItem` 抛错时状态只留在内存 fallback，旧 `loadSeenNotices` 每次都从存储拿空值；现读时并集 fallback 与存储值（ids 去重、watermark 取最大） | 写入失败不影响按 id 去重与按 project 的 `settledAt` 水位，同一通知不重弹；恢复写入后状态自然回到存储 |

## 验证

- 起一个任务：列表出现真实行，进度文案来自执行器 `ctx.report()`，不是占位值。
- 终态只弹一次卡、只跑一次 `onSettled`；同 key 再发起就地更新，不堆两条。
- 去别的面板再点「查看」：先切回发起面板，再执行本页 handler。
- 断开 SSE：客户端退避重连，重连后服务端重推基线，列表恢复且不重复弹卡。
- 让服务端返回 401：`reason.permanent=true`，协调器让锁停机、不刷鉴权失败；刷新凭证后重新调一次
  `connectTaskCenter`（或页面恢复可见 / 网络恢复）即恢复订阅，不重复弹卡。
- 401 停机后切走标签（页面隐藏）不应触发重连；切回来才恢复订阅。
- 新开标签后不弹加入前的历史通知，只收加入后结算的通知；老标签断档重连只拿增量。
- 先开 A、再开 B 并让 A 退出后 B 接管；A 中的 follower 仍能收到 B 的帧（届不回拨）。
- 同一任务重跑（`startedAt` 更新）后再次结算会弹卡，旧运行的 `settledAt` 与最后一段进度文字都不会带过来。
- 服务端连发 `updatedAt` 递增的进度帧，再发一条不带 progress 的帧（如终态帧）：最后一段文字保留不丢。
- 服务端倒序推两条进度帧：UI 只显示 `updatedAt` 更大的那段，不会被旧帧盖回。
- 任务进入终态：绿色「成功」/ 红色「失败」标签出现，披露文字连同扫光一起消失（一行不再有「正在归档会话…」）。
- 运行中行的 `00:26 - 披露文字`：杠左右两侧间距相同（`row-meta` / `row-detail` 两层同值 gap）。
- 服务端误发一条 `rowButtons` 非数组的帧：该字段被核心剥离，任务照常进列表、不抛错（进度坏值同理）。
- 按钮一律照画；发起面板未激活时点按钮先暂存意图、切回后等该面板 handler 重注册补发（上限 32 条、8 秒未重注册即丢弃）；只有真正无可执行目标（条目过期 / 无 panelId / 面板已激活但无 handler）才给一次统一提示，不静默。

## 常见失败

| 现象 | 原因 | 处理 |
|---|---|---|
| 点了按钮提示「操作已失效」 | 条目已过期 / 无 panelId / 面板已激活但无 handler（`TaskBar` / Toast 都照画按钮，无可执行目标就提示） | 确认 `mountTaskUI` 的 handlers 已按当前面板注册（TaskBar 共用同一份） |
| 切到别的页点了按钮没反应 | 发起面板的 handlers 没有随面板重挂重新注册，暂存的意图 8 秒后丢弃 | 面板 `useEffect` 里 `return mountLedgerTaskUi()`，切走注销、重挂重注册 |
| 终态弹两次 | 本地执行与服务端投影都当成终态分发 | 用 `coordinator.project` 统一投影，不另写分发路径 |
| 进度不显示 | 进度塞进了 `detail`；或帧的 `updatedAt` 倒挂被 LWW 丢弃 | 用 `ctx.report({ message })` 上报到显式 `progress` 字段；服务端保证同 key 的 `updatedAt` 严格递增 |
| 运行中进度文字被清空 | 服务端发了不带 progress 的帧（按契约这是「不变更」，核心保留旧值）；或任务已进终态（展示层刻意不渲染文字） | 运行中若确实要清空，发一条 `progress.message: ''` 且 `updatedAt` 更大的帧；终态不再显示文字是设计口径，不是 bug |
| 重跑后显示上一次的文字 | 服务端没更新 `startedAt`，核心认不出新运行 | 同 key 重跑时给新的、更大的 `startedAt`（与 `settledAt` 契约同一套运行身份） |
| 切面板后 UI 落错页 | 自行调 handler，没走 `press` | 点击统一走核心列表 / `pressTaskButton` |
| 刷新后按钮消失 | 未重新接线 | 每次插件挂载都调 `mountTaskUI` 重新注册 handlers |

## 相关

- 对外 API：`docs/api/task-notifications.md`
- 设计契约：`docs/architecture/task-notifications.md`

## 更新日志

- 2026-11-18：按新体系重写接入步骤（开放执行器 + 两处接线 + 服务端 SSE）；删状态源 / 双时钟 / 租约 / 幂等缓存口径。
- 2026-11-20：`TaskBar` 改从 `adv/tasks/ui` 引；按钮一律照画、点失败走统一 i18n 提示；服务端 `source` 补 `subscribeNotices`（唯一弹卡源）。
- 2026-11-21 20:10:40：补跨标签单飞 SSE：一条常驻连接、按钮 POST 不并入、layout disposer 必须 cleanup、无 Web Locks 显式离线
- 2026-11-22：401 permanent 改为「让锁停机 + resume/可见性恢复」（不再无意义退避重连）；协议升 v2（Lamport 届），验证清单补 401 恢复步骤
- 2026-11-22（消费方 v0.45.0 复查）：补届/水位契约与 9 条反馈的处置表（core 修 ②③⑥⑦⑨，其余 ④条判定为消费方/服务端契约并写明依据）；验收补冷标签接管、新标签不弹历史通知、重跑再结算、隐藏态不唤醒
- 2026-11-22（专家复查加固）：tick 改由持锁 owner 独占落盘 + 读取取存储/内存最大值，消除跨标签 RMW 回拨；通知水位改 `>=` 避免同毫秒漏投；所有唤醒事件统一过可见性闸门；补 v1 隔离、sessionStorage 去重与存储清空回归
- 2026-11-22（第二轮封口）：修跨 realm 低届 owner 永久脱节（fencing claim + 让锁重铸，真跨 realm 动态 import 回归替掉同进程假绿）；修乐观行随基线传播成跨标签幽灵行（`getBaseline` 只发真源确认行）；其余六条明确为消费方 / 服务端契约并写入「第二轮封口」表与 API 文档，含升级同号、notice id 全局唯一、回显 origin/panelId、startedAt 严格递增、凭证刷新时机、online 唤醒口径
- 2026-11-22（专家评判复核）：六条契约逐条独立评审，四条判为 core 责任已修（符号 v2 隔离、512+settledAt 水位、origin 缺失告警、401 冷却真实有界），`autoRecoverOnOnline` 开关落地；删提交响应回显死条款，评审结论写入「专家评判后的 core 责任与契约」表
- 2026-11-22（消费方第二轮残留封口）：fencing 挑战从只挡开局 signal 扩到低届 state-reply / frame，晚重拉的 high-epoch follower 不再冻到 owner 寿命轮换；401 连续失败计数改在真实 SSE 字节上清零，600ms 后才返 401 的延迟鉴权也被冷却覆盖；补两条针对性回归
- 2026-11-22（边缘项封口）：`autoRecoverOnOnline` 改每次事件读当前值、online 监听始终只绑一次（先 false 后 true 后置生效）；Node 直连 401 计数移到 `onGiveUp` 回调之后（回调内重接不被冷却吞）；sessionStorage 写入失败时并集内存 fallback 与存储值（配额满仍去重）；跨副本重复 warn 判定可接受不修。新增第三轮封口表，补三条回归，616 项测试全绿
- 2026-11-22（真机 Lock 接口纠错）：修单飞锁每次拿锁就 TypeError 导致 owner 永远当不上、SSE 一条建不起来的 P0；`SharedLockLike` 按浏览器真实形状改为 name / mode，删掉误接的 `lock.signal.addEventListener`（释放已有 controller.signal 与 endLease 两条路径）；两个测试夹具去掉假 signal 防假绿，补真实形状下 owner 建流持锁回归，617 测试全绿
