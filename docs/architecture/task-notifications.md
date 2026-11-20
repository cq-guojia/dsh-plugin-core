# 后台任务中心

执行在后端，状态真源在服务端，前端只登记、投影、转发按钮。本文只写**契约口径与不变量**；
对外签名与参数以 `docs/api/task-notifications.md` 为准，实现在 `src/adv/tasks/` 与 `src/host/task-stream.ts`。

## 定位与边界

- 消费方只写两处接线：`mountTaskUI`（本页注册 handlers + 订阅终态）、`startTask`（每次发起）；展示用核心原生 `TaskBar`，消费方不画列表。
  `TaskBar` 保留原有 UI（icon/pill 形态、sm/md/lg 尺寸、固定宽 / 最小宽 / 最大宽、超长跑马灯），数据来自共享池。
- 状态真源在服务端：执行、进度推进、终态判定都在后端；前端经 SSE 收到整条 `TaskRecord` 后投影到本地 store。
- 没有前端 pull 心跳、没有状态源、没有双时钟租约、没有 tombstone 判死门。终态由执行器结果或服务端投影
  直接驱动一次；SSE 的注释保活帧只保连接，不是业务心跳。
- 跨页只传结构化克隆安全的纯数据，不带函数、组件、Promise。按钮的处理函数留在注册它的页面内存里。

## 分层

| 层 | 文件 | 职责 |
|---|---|---|
| 开放执行器 | `src/runtime/executor.ts` | `kind` 任意串的 id→handler 注册表；不认识「任务」语义，零 React / 宿主 / DOM |
| 纯数据契约 | `src/adv/tasks/model.ts` | `TaskRecord` / `StartTaskInput` 与三通道配置；全是纯数据，无函数 |
| 共享状态 | `src/adv/tasks/store.ts` | 同标签页共享池（Symbol.for 收口）、key 幂等、过滤、handlers、终态订阅 |
| 编排 | `src/adv/tasks/coordinator.ts` | 登记→执行→进度→终态→toast/notify→切面板执行按钮；零 React / DOM，宿主能力全注入 |
| 对外接线 | `src/adv/tasks/api.ts` | 三处消费方 API、SSE 自动订阅、layout 接线、默认 toast/notify 适配 |
| 核心控件 | `src/adv/tasks/TaskBar.ts`（实现）、`src/adv/tasks/ui.ts`（展示面出口 `adv/tasks/ui`） | `TaskBar`：原 UI（pill/icon、sm/md/lg、width/min/max、跑马灯）；数据来自共享池，行按钮点击走 `pressTaskButton`。`adv/tasks` 保持纯逻辑入口，不加载 React |
| 服务端推送 | `src/host/task-stream.ts` | `serveTaskStream` 三流隔离：快照 `event: task-snapshot` + 状态 `event: task`（都只投影、不弹卡）+ 一次性通知 `event: task-notice`（唯一弹卡源，source 的 outbox 补断线通知），强制 `authorize` |

## 不变量（不可破）

1. **终态只分发一次**：`store` 用 `announced` 去重；本地执行与服务端投影同时到达也不重复弹卡 / 回调。
2. **终态不被迟到消息复活**：`store.merge` 见到本地已终态（`done`/`failed`）的记录时丢弃其 `running` 投影（判据是状态，不是 `settledAt` 是否存在——时钟可能因重放/擦除而不在，拿它当状态标志会让 guard 静默失效）。
3. **按钮查找 handler 后切面板执行**：`press(buttonId, taskId)` 先 `store.get(taskId)` 取记录、`getHandler(buttonId, task.project)` 查本页 handler，找不到直接返回 false（不切面板，避免无意义跳走）；找到才 `host.selectPanel(task.panelId)` 再执行 handler。
   `panelId` 由 `startTask` 从 `layout.panelInfo.getSnapshot().activePanelId` 自动记（宿主 0.2.2-rc.3 核实），消费方不传；本地与服务端模式都记，服务端模式随提交 payload 发出、由服务端回填到记录，服务端没回填时 `store.merge` / `deliverNotice` 保留本地那份。
4. **按钮所有页都画、不隐藏不置灰**：`scope:'all'` 每页弹卡且每页都有按钮，`scope:'origin'` 只发起页弹卡（其它页无卡自然无按钮）；不按 `getHandler` 过滤。点击走 `press`（查到 handler 才切面板执行）；返回 false（条目失效 / 注册 handler 的插件已卸载）时给一次统一 i18n 提示（`notifyTaskActionFailed()` → `taskbarActionFailed`），不静默。`TaskBar` 可传 `onActionFailure` 自己接管该提示。
5. **执行器开放、不写死、不兜底**：`kind` 是任意字符串；没有注册的执行体就结算为 failed，不自绘替代、不猜实现、不降级。
6. **配置跟着记录走**：toast / notify / rowButtons 是记录上的纯数据，任何页面按同一份配置渲染；
   `scope: 'all'` 每页弹卡、`'origin'` 只发起页弹卡；按钮（Toast 与列表行）一律照画不隐藏，点了跳回发起面板执行。
7. **服务端是唯一状态通道**：不接 `follow()`（仅宿主领域状态）与 `remote.$on`（仅审批瀑布）；重连靠服务端基线，
   客户端不维护 cursor / 版本门。
8. **多副本收口**：executor 注册表与 task store 都挂 `globalThis[Symbol.for(...)]`，同页所有插件副本共用一份。
9. **进度是显式字段**：`progress: { message, updatedAt, current?, total?, percent? }` 由 `ctx.report()` 上报，不塞进 `detail`。

## 边界与已知限制

- 跨标签页按钮回源（点 B 页的按钮回到 A 页执行）暂不实现；同标签页共享池内本页直执已覆盖主路径。
- 终态记录留在快照里供 `when=done/failed` 的按钮渲染；留存策略由展示层决定，核心不定时清理。
- `ui/task-ui` 只转发 `mountTaskUI`，零官方 `@deepseek-ai/*` 静态依赖；`ui` 入口 import 不会因宿主外解析不到平台模块而崩。

## 更新日志

- 2026-11-18：整套重构为后端执行 + 开放执行器 + 服务端 SSE 投影 + 核心列表控件；
  删任务池 / 状态源 / 双时钟租约 / tombstone / 权威引擎 / 有界缓存 / `TaskBar` / `useTasks`。
- 2026-11-20 13:44:37：校正不变量：去重符号改 store.announced、按钮按 when 显示不按 handler 隐藏
