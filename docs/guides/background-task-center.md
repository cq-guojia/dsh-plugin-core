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
   import { connectTaskLayout } from 'dsh-plugin-core/adv/tasks'

   connectTaskLayout(ctx)                  // 自动记 panelId，点按钮先切回发起面板
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

  **终态（`done` / `failed`）帧必带 `settledAt`**（有限数结算时刻），`running` 帧不得携带。
  入口 `isTaskRecord` 按状态校验并拒收缺时刻的终态帧；客户端不会用本地时间补服务端时钟。
  服务端是状态真源，SSE 推终态时请务必带上，否则该帧被拒收、任务停在 `running` 并有告警。

  **SSE 错误按阶段区分**：鉴权失败（`authorize` 抛错或返回空）401、服务侧故障（订阅/快照/推流失败）503。
  客户端对暂时故障（5xx/429/网络/已连上后断线）按退避档重试、用尽即通过 `onGiveUp` 上报；
  对其余 4xx 立即停流（401 供应用刷新凭证后显式重连），不会无限重连。

## 验证

- 起一个任务：列表出现真实行，进度文案来自执行器 `ctx.report()`，不是占位值。
- 终态只弹一次卡、只跑一次 `onSettled`；同 key 再发起就地更新，不堆两条。
- 去别的面板再点「查看」：先切回发起面板，再执行本页 handler。
- 断开 SSE：客户端退避重连，重连后服务端重推基线，列表恢复且不重复弹卡。
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
