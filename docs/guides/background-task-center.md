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

1. **本页接线一次**（`client/task-ui.ts`）：注册按钮 id → 本页函数，订阅终态刷自己的数据。
   列表与 Toast 共用这一份 handlers。**所有按钮在所有页都画**、不隐藏不置灰；点了跳回发起面板执行 handler，
   找不到 handler 时（条目失效或注册它的插件已卸载）给一次统一提示。
   `toast.*.scope:'all'` 每个标签页都弹卡、每页都有按钮；`'origin'` 只发起页弹卡（其它页无卡自然无按钮）。

   ```ts
   import { mountTaskUI } from 'dsh-plugin-core/ui/task-ui'

   export function mountLedgerTaskUi(): void {
     mountTaskUI({
       project: 'dsh-task-reminder',       // null / 省略 = 收所有项目
       groups: ['close'],
       handlers: {
         'open-log': (task) => openLog(task.detail?.logPath),
         retry: (task) => void startClose(task.detail?.taskId),
       },
       onSettled: () => refreshBoard(),    // 只刷自己的台账数据，核心列表自己刷
     })
   }
   ```

2. **每次发起**（`client/close-task.ts`）：标题、通知、按钮声明全是纯数据跟着记录走。

   ```ts
   import { startTask } from 'dsh-plugin-core/adv/tasks'

   await startTask({
     project: 'dsh-task-reminder',
     group: 'close',
     title: '结案',
     key: `close:${taskId}`,              // 同项目幂等，重复发起就地更新
     kind: 'reminder:close-task',         // 执行器名，核心不枚举
     args: { taskId },                    // 纯数据，不带函数
     toast: { success: { title: '已结案', button: { id: 'open-log', text: '看日志' }, scope: 'all' } },
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

**届与通知水位（v0.45.x，含 0.45.1 加固）**：同源标签视为一个逻辑进程，owner 的届是 Lamport `{tick,id}`；
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
| ① 升级后仍见旧行为 | 消费方依赖仍钉 `dsh-plugin-core@0.44.0`，旧包当然没有 v2 修复；core 不做旧版本兼容分支（已定口径，兼容分支只会把协议倒回不可比较的随机届） | 消费方升到 `0.45.1` 并重新构建产物 |
| ② 冷标签 owner 届低于在册 follower | core 真问题：Lamport 时钟只存内存，新标签从 0 起铸届会被 follower 三道闸门全拒；已改为最大 tick 只由持锁 owner 落盘，读取取存储与内存最大值 | core 已修（#2），消费方随升级获得 |
| ③ 跨运行 `settledAt` 被旧运行污染 | core 真问题：`carryIdentity` 无条件继承旧终态时刻；同运行 first-wins 应保留，跨运行必须取新值 | core 已修（#3），消费方随升级获得 |
| ④ notice id 重启后重号 | 非 core bug：core 按 `TaskNotice.id` 在 sessionStorage 有界去重（最近 512 个），id 必须**跨会话/重启全局唯一**；按内容或时间去重会误吞真重跑的同内容通知，core 无法替服务端造身份（这条去重链有端到端回归） | 消费方用持久化单调序号或 UUID 生成 id，不要从 0 重计 |
| ⑤ `origin` / `panelId` 未回显 | 非 core bug：core 在 `startTask` 时随提交体发出这两个字段，要求服务端在帧与通知里回显；store 对缺失做 fail-open 本地兜底是刻意的「不漏结果」——强校验拒收会让任务从列表消失，比归属判错更糟 | 服务端回显 `origin` / `panelId`；core 不改为拒收 |
| ⑥ 新标签被灌历史 notice | core 真问题：回放没有接收方水位；已加 `noticeSince` / `noticeWatermark`，并按 `>=` 重放同毫秒通知、由 id 去重兜底 | core 已修（#6），消费方随升级获得 |
| ⑦ 切走标签误清 halted | core 真问题：`visibilitychange` 隐藏时也触发，被当纯 show；所有唤醒事件已统一过 `isVisible()` 闸门 | core 已修（#7），消费方随升级获得 |
| ⑧ 同毫秒 `startedAt` 撞号 | 非 core bug：core 只能用服务端已有的 `startedAt` 认运行实例，单方加随机/计数会伪造一个与真源对不上的身份；同 key 严格递增是服务端可保证的契约 | 服务端保证同 key `startedAt` 严格递增，或另行评审引入显式 `runId` 契约 |
| ⑨ 基线声明去重但重复回调 | core 真问题：`cacheNotice()` 内部先 `markSeen`，`applyBaseline` 再查集合会把当前这条自己吞掉；已改为入缓存前快照 `fresh` | core 已修（#9），消费方随升级获得 |

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
- 同一任务重跑（`startedAt` 更新）后再次结算会弹卡，旧运行的 `settledAt` 不会带过来。
- 按钮一律照画；点一个失效按钮（条目过期 / 注册它的插件已卸载）会给一次统一提示，不静默。

## 常见失败

| 现象 | 原因 | 处理 |
|---|---|---|
| 点了按钮提示「操作已失效」 | 条目已过期，或注册 handler 的插件已卸载（`TaskBar` / Toast 都照画按钮，找不到就提示） | 在 `mountTaskUI` 重新注册 handlers（TaskBar 共用同一份） |
| 终态弹两次 | 本地执行与服务端投影都当成终态分发 | 用 `coordinator.project` 统一投影，不另写分发路径 |
| 进度不显示 | 进度塞进了 `detail` | 用 `ctx.report({ message })` 上报到显式 `progress` 字段 |
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
