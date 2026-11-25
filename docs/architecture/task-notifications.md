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
3. **按钮发起页未激活则暂存补发，已激活则同步执行**：`press(buttonId, taskId)` 先 `store.get(taskId)` 取记录，比对 `host.activePanelId()` 与 `task.panelId`。发起面板未激活时**即使查到 handler 也不调用**（可能是正在卸载的旧闭包），先把意图存进全局 pending（`Symbol.for('dsh-plugin-core/tasks/pending/v1')`，键 = project + buttonId + panelId + startedAt，双击覆盖去重、上限 32），再 `host.selectPanel(panelId)` 切回，返回 true；发起页重挂并 `registerHandlers` 时以 microtask 补发——重读 task、校验 activePanel、claim-once、`safeCall` 包裹，TTL 8 秒未重注册即丢弃。面板已激活则同步查 handler 并执行；无可执行目标（条目失效 / 无 panelId / 面板已激活仍无 handler / 无 selectPanel 能力）返回 false 报错，不静默留死信。
   `panelId` 由 `startTask` 从 `layout.panelInfo.getSnapshot().activePanelId` 自动记（宿主 0.2.2-rc.3 核实），消费方不传；本地与服务端模式都记，服务端模式随提交 payload 发出、由服务端回填到记录，服务端没回填时 `store.merge` / `deliverNotice` 保留本地那份。
4. **按钮所有页都画、不隐藏不置灰**：`scope:'all'` 每页弹卡且每页都有按钮，`scope:'origin'` 只发起页弹卡（其它页无卡自然无按钮）；不按 `getHandler` 过滤。点击走 `press`（发起页未激活 → 暂存 + 切回 + 重注册补发；已激活 → 同步执行）；返回 false（条目失效 / 无可执行目标）时给一次统一 i18n 提示（`notifyTaskActionFailed()` → `taskbarActionFailed`），不静默。`TaskBar` 可传 `onActionFailure` 自己接管该提示。消费方 handler 的注册位置须与发起页同生命周期（切走即注销、`registerHandlers` 时重注册），核心不要求消费方为此改动接线。
5. **执行器开放、不写死、不兜底**：`kind` 是任意字符串；没有注册的执行体就结算为 failed，不自绘替代、不猜实现、不降级。
6. **配置跟着记录走**：toast / notify / rowButtons 是记录上的纯数据，任何页面按同一份配置渲染；
   `scope: 'all'` 每页弹卡、`'origin'` 只发起页弹卡；按钮（Toast 与列表行）一律照画不隐藏，点了跳回发起面板执行。
   所有显示标题（`startTask.title` / `TaskRecord.title` / `toast.*.title`）必须是 `DisplayTitle { category, description }`，
   核心按 `分类丨说明` 渲染；分类建议中文 2–4 字 / 英文最多 2 词，代码只校验非空、不判字数，超长交给跑马灯。
   `isTaskRecord` 同时校验顶层与 toast 两态标题，旧 string 帧一律拒收、不做兜底；宿主 `deliverToast({ title: string })`
   与 notify 线上协议不变，格式化只在 `coordinator` 出宿主前发生。
   `TaskBar` 面板走 `--dshpc-z-page-float`（= dock 900），低于抽屉 / 弹窗 / 耳朵 / 菜单：
   视觉只靠层级——任何主浮层遮罩自然盖住它，面板从不被隐藏或恢复，弹窗关掉后它本来就在。
   行为侧没有逐组件登记：只认标准模态语义（原生 `dialog` / `aria-modal="true"` / `alertdialog`），
   活动模态期间冻结外部 click / Esc / 触发器，关闭后原样恢复；外部收起由 pointerdown 采样模态、
   click 双时刻判定：既覆盖「点外部按钮开弹窗」，也覆盖「点关闭弹窗」时 click 已卸载、pointerdown 仍开着。
   受控 `onOpenChange(false)` 幂等可重复发。
6a. **交付边界不混层**：toast 是记录上的显示配置、核心直接弹卡；notify 是 runtime 通用事件、不带 `taskId`/`outcome`，
   核心只发消息、UI 与后续动作全由订阅方决定；`onSettled` 是 `mountTaskUI` 的 UI 接线，本页进程内收到完整
   `TaskRecord + outcome`，不是第四种通知通道，也不驱动核心列表刷新。五维对照见 `docs/api/task-notifications.doc.ts`
   的 `bt-settlement-boundaries`。选择口径：给用户看配 toast，跨组件广播发 notify，注册 UI 里干活用 onSettled。
7. **服务端是唯一状态通道**：不接 `follow()`（仅宿主领域状态）与 `remote.$on`（仅审批瀑布）；重连靠服务端基线，
   客户端不维护 cursor / 版本门。跨标签 BC 扇出层的 `noticeSince` 水位只裁「本地回放哪些通知」，
   不参与服务端状态同步，也不是 cursor。
8. **多副本收口**：executor 注册表与 task store 都挂 `globalThis[Symbol.for(...)]`，同页所有插件副本共用一份。
9. **进度是显式字段**：`progress: { message, updatedAt, current?, total?, percent? }` 由 `ctx.report()` 上报，不塞进 `detail`。
10. **同源单飞、届全序**：每个 `streamUrl` 一条真 SSE，Web Locks 选主 + BroadcastChannel 扇出。届是 Lamport `{tick,id}`，
    最大 tick 只由持锁 owner 落 localStorage（follower 不写，避免跨标签 read-modify-write 把高值覆盖回低值）；
    无存储退模块内存，且读取时取存储与内存的最大值。跨 realm（隐私模式 / 存储被清空，各标签内存兜底独立）
    出现低届 owner 时，持更高届的 follower 在低届权威消息（signal / state-reply / frame）上广播 fencing claim，
   低届 owner 收到更高届 claim 立即让锁并重铸更高届；晚重拉者收到低届 reply / frame 也挑战，不会冻到寿命轮换。
    `signal` 只是「去拉基线」的 hint、不安装届，`state-reply` 是唯一安装入口，旧届 reply 一律丢弃，
    真换届重置 seq 水位。锁对象按浏览器真实形状使用：Lock 只有 `name` / `mode`，取消信号在 `request()` 的
   `options.signal`（会话 controller）上，不在 Lock 对象上；释放靠 callback Promise settle 或 options.signal
   abort 两条真路径。注入的测试锁不得捏造 `signal` 字段，否则接口误读会被测试假绿掩盖、真机一拿锁就抛 TypeError。
11. **通知回放按水位裁切、按 id 保证正确性**：`state-request` 带接收方 `noticeSince`（已收通知的最大服务端
    `settledAt`），owner 只回放 `settledAt >= since` 的缓存项——新标签从加入时刻起算不被历史灌满，
    同毫秒多投由 notice id 在 sessionStorage 有界去重兜底，不靠时间戳近似身份。缓存保留全量，切主后仍可回放。
12. **halted 只在可见时清**：401 等 permanent giveUp 让锁停机；`pagehide`/`freeze` 让锁，
    `visibilitychange`/`online`/`pageshow`/`resume` 统一过可见性闸门后才 `recover`，隐藏期间不刷鉴权失败。
    显式 `resume()` 是应用主动恢复通道，不受闸门约束。
13. **跨标签基线只发真源行**：本地乐观行（POST 在飞）不外泄——BC 没有删除帧，发出去后回滚只在本标签生效，
    别的标签会留一条永不消失的幽灵 running。`store.getBaseline()` 是跨标签基线的唯一来源。
14. **有界容错与可诊断**：连续两次 permanent 401 后 resume / 在线唤醒进入冷却（仅读到真实 SSE 字节清零，非定时到点），
    "有界"是 core 保证而非消费方自觉；401 计数在 `onGiveUp` 回调之后累加，回调内同步重接的第二次失败才计入连败，
    Node 直连与单飞同序。`autoRecoverOnOnline:false` 关闭 online 唤醒，但监听器始终只绑一次、
    事件时读当前值，接线后改值即时生效（不重绑、不掐在飞流）。
    通知去重除按 id 的 512 有界集合外，按 project 记已见最大 `settledAt` 水位，防 outbox 超限时老通知重弹；
    sessionStorage 写入失败时读路径并集内存 fallback 与存储值（ids 去重、watermark 取最大），配额满也不失效。
    `scope:'origin'` 却缺 `origin` 时打一次 console.warn，配置错误可发现。
15. **运行身份由服务端给**：同 key 的 `startedAt` 须严格递增，`settledAt` 是终态必填的服务端时刻；
    同运行 `settledAt` first-wins，跨运行取新值。`TaskNotice.id` 须跨会话/重启全局唯一（UUID 或持久化计数，
    不能只用内存 `++seq`）；`origin` / `panelId` 由核心随提交发出、服务端回显，缺失时核心 fail-open 保留本地值而非拒收。
    `origin` 是**标签页身份**：缺省取 `getTabOrigin()`（sessionStorage 按 origin + 标签页分区、刷新保留、关页即清），
    与 `createNotifyScope().origin`（逻辑端实例 id，每次加载随机、只服务 BroadcastChannel 自过滤）是两个概念，不得合并——
    前者随记录走决定终态弹卡归属，刷新后同一窗口仍是发起页；后者换了不影响归属。消费方自定义 `originId` 时须自行保证跨刷新稳定。
    消费方依赖必须与核心同号；401 停机时凭证刷新需在 `onGiveUp` 同步完成（或异步就绪后再接线），
    `online` 唤醒会用同一份 headers 重试，失败再次停机（有界）。

## 边界与已知限制

- 跨标签页按钮回源（点 B 标签的按钮回到 A 标签执行）暂不实现；同标签页跨面板点击走不变量 3 的暂存 / 切回 / 重注册补发，要求消费方 handlers 随面板生命周期注册 / 注销。
- 浏览器「复制标签页」会连同 sessionStorage 一起复制：两个标签拿到同一个 tab origin，终态会在两边都弹；这是浏览器事实，按可接受边界处理。升级瞬间已在飞、带着旧随机 origin 的任务仍会丢一次终态 toast——旧值从未持久化，无法回收；升级后新提交的任务不受影响。
- 终态记录留在快照里供 `when=done/failed` 的按钮渲染；留存策略由展示层决定，核心不定时清理。
- `ui/task-ui` 只转发 `mountTaskUI`，零官方 `@deepseek-ai/*` 静态依赖；`ui` 入口 import 不会因宿主外解析不到平台模块而崩。

## 更新日志

- 2026-11-18：整套重构为后端执行 + 开放执行器 + 服务端 SSE 投影 + 核心列表控件；
  删任务池 / 状态源 / 双时钟租约 / tombstone / 权威引擎 / 有界缓存 / `TaskBar` / `useTasks`。
- 2026-11-20 13:44:37：校正不变量：去重符号改 store.announced、按钮按 when 显示不按 handler 隐藏
- 2026-11-22（v0.45.0）：补单飞 SSE 四条不变量（届全序与持久化、通知水位与 id 去重、halted 可见性闸门、服务端运行身份契约）；澄清客户端水位不是服务端 cursor
- 2026-11-22（第二轮封口）：届不变量补跨 realm fencing claim（低届 owner 让锁重铸）；新增「跨标签基线只发真源行」不变量；消费方契约补齐 notice id 全局唯一、依赖同号、凭证刷新时机与 online 唤醒口径
- 2026-11-22（专家评判复核）：新增不变量 14（401 冷却真实有界、online 可关闭、512+settledAt 水位去重、origin 缺失可诊断），15 顺延；同页 store / executor 收口符号升 v2 与协议对齐；删去「提交响应回显 origin/panelId」死条款
- 2026-11-22（消费方第二轮残留封口）：不变量 10 的 fencing 扩到低届 reply / frame；不变量 14 的 streak 清零改挂真实 SSE 字节
- 2026-11-22（边缘项封口）：不变量 14 补三项——online 监听器始终只绑一次且事件时读当前开关值（后置改值即时生效）、401 streak 在 `onGiveUp` 回调后累加（Node 直连同序，回调内重接不被冷却吞）、sessionStorage 写入失败时读路径并集内存 fallback（配额满仍按 id 去重）
- 2026-11-22（真机 Lock 接口纠错）：不变量 10 补真实 Lock 形状（只有 name / mode，取消信号在 request 的 options.signal）与两条释放路径；测试夹具不得捏 signal 兜住接口误读
