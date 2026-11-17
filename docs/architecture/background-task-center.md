# 后台任务中心（服务端执行设计）

后台任务中心是 `adv/tasks` 里的一整块高级组件：它把「提交到服务端执行的长任务」登记、投影、看护到结算。本文是这套**服务端执行路径的设计契约**——定的是「真源在哪、心跳谁问、时钟怎么走、什么算幂等」。纯内存数据面（状态池、跨页分片、事件总线、业务键）见 [task-notifications.md](task-notifications.md)；对外 API 以 `docs/api/task-notifications.md` 为准。消费方怎么接见 [接入后台任务中心](../guides/background-task-center.md)。

## 1. 系统上下文

| 外部系统 | 方向 | 协议 | 用途 |
|---|---|---|---|
| 消费方服务端 | 出站 | 消费方自定（HTTP / RPC） | 任务真源：按 key 存后端任务号与状态、执行作业、清理终态 |
| 宿主 DSH 运行时 | 入站 | CJS 闭包 | 插件运行载体；提供跨页通知与状态容器能力 |

核心不直连任何具体后端：服务端由消费方通过**状态源**注入，核心只持有「怎么问、问到后怎么做」的逻辑。

## 2. 模块与依赖

| 模块 | 职责 | 依赖 | 不能依赖 |
|---|---|---|---|
| `src/adv/tasks/pool.ts` | 状态池、登记、心跳调度、状态源注册、结算 | `src/runtime/store.ts`、`src/runtime/notify.ts` | `src/ui/**`、官方 primitives、任何业务后端 |
| `src/adv/tasks/useTasks.ts` | 只读投影：把池快照接到 React | 池 | 自己取数、直接问服务端 |
| `src/adv/tasks/TaskBar.ts` | 展示栏：列运行任务、点按钮 | 池、`useTasks` | 直接问服务端 |
| `src/runtime/store.ts` | 状态容器 `getState` / `setState` / `subscribe` | 无 | `src/ui/**`、`src/adv/**`、React |
| `src/runtime/notify.ts` | 跨页通知：发一条 / 收一条 | 无 | `src/ui/**`、`src/adv/**`、React |

方向一句话定死：`runtime → adv/tasks`；池是唯一与服务端打交道的模块，UI 只投影、不取数，反向依赖一律不许。

```text
src/
├── runtime/                                        # 运行时底座：无界面、不认识任务
│   ├── store.ts                                    # 状态容器：池的可查询状态与订阅边界
│   └── notify.ts                                   # 跨页通知：任务事件借它搬运到同源标签页
└── adv/tasks/                                      # 后台任务中心：一整块高级组件
    ├── pool.ts                                     # 池 + 心跳 + 状态源 + 结算（纯 TS）
    ├── useTasks.ts                                 # React 只读投影
    └── TaskBar.ts                                  # 展示栏
```

## 3. 关键链路

### 3.1 登记从任务开始，不从「收起」开始

1. 作业一开始执行，就用稳定 key 登记进后台任务中心；「移交后台 / 收起」只是关掉前端展示，不是此时才创建任务。
2. 同 key 在本页已有条目 → 就地复用，返回同一个句柄，不发新事件。
3. 同 key 在别的页持有 → 报冲突，只拦「再起一份执行」，不拦「看到同一个服务端作业」。
4. 失败分支：消费方拿 `created` 判断该不该真正起作业；`created === false` 时不得重复执行。

### 3.2 服务端真源，前端只是投影

1. 后端任务号（后端作业 id）存在**服务端**，按 key 查；登记时的 `detail` 只放给人看的提示，不作真源。
2. 前端快照是从状态源查回来的投影：刷新或关页后，用同一批 key 重新查服务端即可重建，不靠闭包里的变量。
3. 结算以后端返回为准：状态源说完成就完成、说失败就失败，核心不自行推断。
4. 失败分支：状态源查询抛错时，本轮不续租、也不判失败，让租约自然到期（见 3.4）。

### 3.3 核心主动批量问（pull 心跳）

1. 消费方按项目注册**一个**状态源，签名是 `(keys) => StatusRow[]`：给一批 key，回一批状态。
2. 核心按 `min(轮询周期, 租约/2)` 批量问一次：一次请求覆盖该项目全部在跑的 key，不是每个任务一次请求。
3. 消费方响应询问是**必须实现**的；消费方主动 `touch()` / `update()` 只是可选加速，不写也能靠 pull 正常看护。
4. 拿到 `running` → 续租；拿到终态 → 走 3.4；查询异常 → 本轮什么都不做。

### 3.4 双时钟：短租约 + 总上限

1. **短租约**（缺省 5 分钟）：从最后一次成功续租起算；连续多次询问都没能确认存活，租约到点即判失败并移出列表。它负责发现「不再证明活着」的任务。
2. **总上限** `maxDurationMs`：从 `startedAt` 起算，续租**不重置**它；到点无条件结算为超时。它负责拦住「一直在续命、永远不结束」的僵尸。
3. 两个时钟职责分离：租约短而可续，总限长而不可续；缺任一个都有对应事故（僵尸泄露 / 无限占位）。
4. 失败分支：会话休眠、后台节流导致漏问，靠租约兜底；`dispose()` 必须停掉心跳定时器（批量探测与双时钟检查同属这一条），否则卸载后仍改状态。

### 3.5 刷新重建与多标签页

1. 刷新后同 key 的多个标签页共存是合法的——都是同一个服务端作业的显示投影。
2. 冲突只作用于「执行权」：不阻止显示，只阻止第二份作业被起起来。
3. 每条投影按 origin 标记本页 / 远端；只有持有执行权的那一页能结算，其它页只读。

### 3.6 终态清理

1. 任务进入 `done` / `fail` / 超时后即成终态，移出在跑列表。
2. 服务端按 TTL 清理终态记录（含后端任务号），避免越积越多。
3. 终态记录不参与刷新重建：已被清理的 key 不会被复活成一条新任务。

### 3.7 服务端权威模式（完整恢复）

旧的状态源模式只按**已知 key** 问服务端，存在四个缺口：页面全关后拿不到 key、时钟起点存在页面内存、看护随页面关闭而停、按钮 handler 随页面销毁。要完整恢复，使用 `setTaskBackend(project, backend)` + `notifyTask.server()`：

1. 后端**必须**提供 `list / follow / listNotices / ackNotices / invoke / ack` 六项能力；注册时校验，缺项即抛，不静默降级到轮询。
2. 服务端是唯一真源：原子 `create` 决定 `created`；`startedAt / deadlineAt / version` 由服务端生成；判死与总上限由服务端 watchdog 执行；终态按 TTL 清理。
3. 核心只做投影与调和：按单调 version 合并基线/分页/增量，终态墓碑挡住迟到快照；按钮只存描述，执行走服务端命令。
4. **两条通道分离**：通道 A（`list / follow`）只水合在跑任务，终态墓碑只更新本地终态门，**不 emit `settled`、不 ack**；通道 B（`listNotices / ackNotices`）专职投递未确认的终态通知，`notificationId / cursor` 由服务端生成，事件发出后按连续成功前缀 ack（at-least-once，不追求 exactly-once）。这样页面重开时基线回放不会重复通知，未确认通知仍能送达。
5. **通道 B 按后端归属分组**：每个后端只查询自己注册的 project，用各自的游标推进与 ack，不拿首个后端代查全部——不同后端可能是不同服务 / 不同鉴权域，代查会静默丢通知。
6. **前端缓存有界**：通知去重 id、终态交接结果、按钮命令幂等缓存共用同一套有界缓存（容量上限 512）。前两者按 LRU 淘汰；幂等缓存额外带 60 秒写入 TTL，过期条目在下次访问时删除、点击换新键，窗口内重复点击复用同一条目并回放成功结果。长生命周期页面不随开页时长或点击次数无限增长；跨页 / 重开去重靠服务端 cursor。句柄兑现以登记时服务端原子 create 返回的权威记录为真源，本地缓存只是「通知早于 waiter」的快路径：淘汰后仍能兑现、不留 pending，同 key 重建不会被上一轮终态错误兑现。
7. 按钮点击向 `taskNotificationEvents` 发 `action` 事件（task 快照 + actionId + index + ok + reason + result），消费方据此恢复界面，不必另开通知通道。
8. 权威句柄只有 `id / isSettled / settled`，没有 update/touch/background/done/fail/track——终态由服务端判定，编译期即阻止误用。
9. 该模式下的记录写入专用分片 `__server__`，不参与跨页 bye；页面关闭只断连接，不删服务端任务。

## 4. 与成熟方案的对应

设计逐条对齐成熟实现的已核实行为，不自行发明机制。

| 本设计机制 | 成熟方案对应行为 | 来源 |
|---|---|---|
| 稳定 key 幂等登记；同键冲突按策略处理；key 不放敏感信息 | Temporal Workflow Id：同命名空间内同 ID 同时最多一个在跑，冲突由 `WorkflowIdConflictPolicy` 决定；ID 会进 UI / 日志 / 查询，禁止放敏感信息 | [Temporal Workflows](https://docs.temporal.io/workflows) |
| pull 心跳；租约可续；续租不代表能无限跑 | SQS visibility timeout：从消息投递起算，用 `ChangeMessageVisibility` 周期性延长；但延长不能突破首次接收起 12 小时的硬上限 | [SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html) |
| 租约到点被判 stalled，作业可能被再处理；处理器必须幂等 | BullMQ：锁到期未续即 stalled 并回到 waiting 重处理；官方明确任务按 at-least-once 设计，jobId 去重不能替代业务幂等 | [BullMQ stalled jobs](https://docs.bullmq.io/guide/workers/stalled-jobs) |
| `maxDurationMs` 不可续；终态按 TTL 清理 | Kubernetes Job：`activeDeadlineSeconds` 到点终止并判 `DeadlineExceeded`、优先于 `backoffLimit`；`ttlSecondsAfterFinished` 清理已完成 Job，不设就不自动清 | [Kubernetes Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/) |
| 前端去重 / 交接 / 命令幂等缓存有界：容量 LRU（上限 512）+ 幂等键 60 秒写入 TTL | Java `LinkedHashMap` access-order + `removeEldestEntry` 固定 `MAX_ENTRIES`（"maintaining a steady state of 100 entries"）；Guava / Caffeine `maximumSize` + `expireAfterWrite`（缓存自动淘汰以约束内存，键按写入窗口过期、访问不续命，区别于一直保留到显式删除的 `ConcurrentMap`） | [LinkedHashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/LinkedHashMap.html) · [Caffeine](https://github.com/ben-manes/caffeine/wiki) |
| 通道 B 按后端归属分组，各后端只查自己的 project、各用自己的游标与 ack | 多租户 SSE：通道从已认证身份推导、按租户前缀隔离、"process each tenant's messages in its own queue"；多租户 webhook：tenant 是隔离单元，订阅 / 凭据 / 游标互不共享 | [Isolating tenants on SSE endpoints](http://www.server-sent-events.com/sse-protocol-fundamentals-architecture/security-headers-for-event-streams/isolating-tenants-on-shared-sse-endpoints) · [Svix multi-tenant webhooks](https://www.svix.com/resources/guides/multi-tenant-webhook-service) |

> 结论：at-least-once 是这些系统的共同前提，所以「业务处理器幂等」是接入方的硬义务，不是可选优化；key 只减少重复提交，不替代幂等。

## 5. 不可破的约束

- **必须**以服务端为真源；**禁止**把前端闭包里的后端任务号当真值——刷新即失，重建只能靠按 key 查服务端。
- **必须**在作业开始时就登记；**禁止**把「移交后台」实现成此时才创建作业——那会丢掉已经开始的执行。
- **必须**按项目注册单个批量状态源、一次问所有 key；**禁止**逐任务轮询——请求数随任务数线性增长，资源开销不可控。
- **必须**由核心主动问（pull）；消费方响应询问是必需能力；主动 `touch()` 只是可选加速，**禁止**把它当唯一心跳源——框架不能赌消费方纪律。
- **必须**实现双时钟：短租约可续、`maxDurationMs` 从 `startedAt` 算且不可续；**禁止**无限期租约。
- 状态源查询失败时**必须**不续租、也不立即判死，让租约自然到期；**禁止**网络抖动一次就结算任务。
- 同 key 多标签页只作显示投影；冲突**只拦执行权**，不拦显示。
- 终态任务**不得**被刷新复活；服务端**必须**按 TTL 清理终态。
- `dispose()` **必须**停掉心跳定时器（探测 + 双时钟）；**禁止**留下卸载后仍改状态的悬挂定时器。
- 一切新增能力**必须**落在 `adv/tasks` 这个高级组件内（宿主路由装配在 `src/host/task-center.ts`），只调用 `runtime` 的 `notify` 与 `store` 能力；**禁止**另起一套底层机制。
- 服务端权威模式下**禁止**客户端判死、禁止把 handler 留给页面、禁止能力缺失时静默降级；这三条是相对旧状态源模式的硬约束。
- **禁止**给官方组件缺失做降级兜底；宿主内官方包恒在，改版就重新适配，不自绘顶替。

## 6. 术语

| 术语 | 含义 | 别称 |
|---|---|---|
| 真源 | 任务状态的权威值，存在服务端、按 key 可查 | 服务端状态 |
| 投影 | 前端状态池里由真源查回来的那一行快照 | 显示态 |
| key | 标识「这两条算同一件事」的稳定业务键，唯一范围是 `(project, key)` | 业务键 |
| 状态源 | 消费方按项目注册的批量查询函数 `(keys) => StatusRow[]` | 探针回调 |
| 租约 | 最后一次成功确认存活后允许经过的时长，到点未确认即判失败 | 心跳超时 |
| 双时钟 | 可续的短租约 + 不可续的 `maxDurationMs` 总上限 | — |
| 收起 | 关掉前端展示，不影响服务端执行，也不是结算 | 移交后台 |

## 更新日志

- 2026-11-16 17:38:04：落定后台任务中心服务端执行设计：服务端真源、pull 批量心跳、双时钟、幂等与 TTL，逐条对齐成熟项目
- 2026-11-16 18:01:41：C 方案落地：架构文档从目标设计改为已实现契约，心跳定时器口径与代码一致
- 2026-11-16 20:33:57：审计修正：dispose 丢弃在途探测结果，避免卸载后结算与重排定时器；StatusRow/StatusSource 补进公开导出
- 2026-11-16：新增服务端权威模式（§3.7），修复页面生命周期决定服务端任务命运的四条断点；能力缺失不再静默降级
- 2026-11-17：命令幂等缓存纳入统一有界缓存，容量 LRU（512）+ 60 秒写入 TTL 双定界；与通知去重 / 终态交接共用实现
