# 文档索引

本文件是本项目文档库的唯一索引：有哪些文档、各自在哪，看下面这棵树。槽位与格式由 `koc-code-docwriter` skill 管；项目特有的落位约定见 `docs/development/doc-format.md`。

## 目录

```text
docs/                                               # 项目文档库入口与唯一索引
├── architecture/                                   # 系统组成、代码分层与不可破的约束
│   ├── overview.md                                 # 五子包分层、依赖方向、样式注入机制与不变量
│   ├── structure.md                                # 控件归类、代码分层树与 demo 展示分区
│   └── task-notifications.md                       # 后端执行 + 开放执行器 + 服务端 SSE 投影的契约与不变量
├── features/                                       # 功能范围与尚未归属的结论
│   ├── overview.md                                 # 功能总索引槽位说明：职责已交帮助索引
│   └── scope.md                                    # 需求范围、不做的部分与发布口径
├── guides/                                         # 做一件事的入口与步骤
│   ├── background-task-center.md                   # 开放执行器 + 两处接线 + 服务端 SSE 的接入步骤
│   ├── index.md                                    # 帮助索引：按你要做的事挑一份文档
│   ├── integration.md                              # 从零接入一个插件的步骤
│   └── style.md                                    # 样式使用侧：token、换肤、前缀规则
├── api/                                            # 各子包的对外契约、控件与参数参考
│   ├── design.md                                   # design 子包：token、createStyleKit、明暗判据
│   ├── explorer.md                                 # 工作区浏览与文件预览的接入方式与 API
│   ├── icons.md                                    # 图标：字体图标库注册、在线样式注入、官方 icons 归属
│   ├── methods.md                                  # utils 方法统一口径与返回值约定
│   ├── runtime.md                                  # runtime 子包：跨页通知、状态容器与事件总线
│   ├── session.md                                  # 会话只读预览的接入方式与 API
│   ├── task-notifications.md                       # startTask / mountTaskUI / TaskBar / 执行器 / SSE 的 API 参考
│   ├── ui.md                                       # 控件清单与全部 props 参考
│   └── utils.md                                    # utils 子包方法参考
├── development/                                    # 改本仓时才用的开发规范与文档库约定
│   ├── copywriting.md                              # 帮助文案标准：读者定性、双语对等、格式冻结
│   ├── doc-format.md                               # .doc.ts 真源与双投影的 schema、落位约定、生成闸
│   ├── methods.md                                  # 往 utils 里新增方法时要过的 checklist
│   └── style.md                                    # 改动本仓样式的 why、派生色口径与三条硬规矩
└── dependencies/                                   # 仓库外依赖的已核实行为，带来源与版本
    └── dsh-host.md                                 # DSH 宿主 API、官方 primitives 与产物形态
```

## 更新日志

- 2026-11-08 23:34:50：按文档库规范建立版本元数据与统一目录索引
- 2026-11-13 16:22:31：按 1.2.0 槽位规范完成结构迁移，索引收敛为四段形态
- 2026-11-13 17:30:00：新增 `api/icons.md`（字体图标 + 官方 primitives 图标同页枚举）
- 2026-11-16：新增 `api/runtime.md`（运行时底座：跨页通知 / 状态容器 / 事件总线）；`api/task-notifications.md` 收 `TaskBar` 与 `useTasks`（原先在 `api/ui.md`）
- 2026-11-16：任务模块对外展示名改为「后台任务中心」（底层仍用跨页通知）；`timeoutMs` 改为定时器到点自动回收
- 2026-11-16 17:38:04：新增 architecture/task-notifications.md 与 guides/background-task-center.md
- 2026-11-17：`api/ui.md` 补 Modal 例外控件 / 收起 / 保树隐藏契约与 `useModalBackground()`；`architecture/task-notifications.md` 阶段 2 标完成
- 2026-11-17（v0.42.0）：`api/ui.md` 补 `ModalLockExempt` 与 Confirm/Alert 内置按钮例外、写明「有 locked 不等于有例外」边界；确认弹窗 `lockExceptions` 只收内置钮名
- 2026-11-18：后台任务中心整套重构为后端执行 + 开放执行器 + 服务端 SSE 投影 + 核心列表控件；删旧任务池 / 状态源 / 双时钟租约 / 旧 `TaskBar` 实现 / `useTasks`，文档与索引同步收敛
- 2026-11-20：修消费方审查意见——`TaskBar` 展示面出口拆到 `adv/tasks/ui`（`adv/tasks` 保持纯逻辑）；任务按钮（Toast 与列表）一律照画、点了找不到 handler 走统一 i18n 提示；三流隔离与按标签页去重口径入档，相关手写文档同步更新
- 2026-11-20（消费方二次对照）：服务端 `startTask` 把 `panelId` 随提交发出供服务端回填（乐观行也带上，补上"核心自动记 panelId"承诺）；SSE 保活 timer 移到 `writeHead` 之后（防慢快照触发 `ERR_HTTP_HEADERS_SENT`）；`TaskStore.clear()` 改名 `clearAll()` 并写清清了什么
- 2026-11-20（消费方三次对照）：按用户拍板回正按钮口径——所有按钮在所有页都画、点了跳回发起面板执行（回退 v0.43.4 里「Toast 按钮只在发起页画」的口径）；`store.merge` / `deliverNotice` 对服务端漏发的 `panelId` 做本地兜底；`defaultTaskHost` 按注入的 `originId` 判归属，消除 startTask 与 toast 判定双来源；SSE `cleanup()` 幂等。文档同步：架构不变量 3 的 press 顺序改正、不变量 4/6 按钮口径回正、`projectTasks` 改成"只投影不分发终态"、`TaskButton` 补 icon/color、README.en.md 补齐后台任务中心与出口表、中英适配范围列全 React-free 入口、接入指南补"服务端必须回填 origin/panelId"
- 2026-11-21：按消费方通读反馈治本修任务中心 5 项——`settledAt` 升为终态必填契约（`isTaskRecord` 按状态校验、`projectTasks` 与 SSE 走同一道闸、store 单调 guard 改用状态判据、本地时钟只在本地执行器这一真源生成）；SSE `cleanup` 逐项隔离外部 detach 异常且先摘集合、`serveTaskStream` 按阶段分 401（鉴权）/503（服务故障）（快照故障不再误报 401）；`serveTaskSubmit` 补边界载荷形状校验（非对象 400、onSubmit 故障 500 不回显）；客户端按状态码分类重连（暂时故障有上限退避、永久错误停流上报 `onGiveUp`，不再无限重连）。文档同步 `settledAt` 必填契约与错误分类/退避语义
- 2026-11-21（架构师两轮复审）：修掉复审引入的回归——SSE 连上后断线不再误判永久错误（200 后 status 归暂态）、但「200 后立即 EOF」的假连接靠 `gotFrame` 累计退避不再无限空刷；`streaming` 标志紧跟 `writeHead`（头已发失败只 end 不二次写 503）；各端点响应写入逐段隔离 + IIFE `.catch()` 兜底，杜绝未处理 rejection；补 8 条回归测试。三方专家会裁决砍掉判别联合改造与公共 disposer 原语等过度设计，保留最小治本范围
- 2026-11-21（消费方四轮反馈·专家会+架构师裁决）：`TaskCenterHost` 补 `onGiveUp` 并直传 SSE 流（默认接线终于能拿 401 信号刷新凭证重连，导出 `TaskStreamGiveUpReason`）；retry 归零移入 finally，覆盖「收到帧后 read() reject」断线路径（此前累积 retry 过早 giveUp），文档写明退避上限只约束无数据进展的连接；`startTask` 服务端模式改为「先落带 key 的乐观行 → 再 POST → 失败回滚」，关闭「SSE 终态先于响应到达被乐观行覆回 running」的时序竞态，新增 `removeRunning` 最小回滚 API，服务端须回显 key（demo 已同步）；架构不变量 2 判据文档同步为「状态终态」；补 4 条回归测试。裁决打回 live 间接层与 store 分层/restart/epoch 等过度设计，也不采用「upsert 前查终态跳过」补丁
- 2026-11-21（架构师复查收口）：第二轮复查发现上一轮修复的边界漏洞——乐观行 project/group 缺省为 'default' 却未随提交体发出，服务端回显自身缺省时 `(project,key)` 归一键失配、留下永不消失的幽灵 running 行；把缺省提到一处算一次，乐观行与 POST body 共用同一份。公开 API 参考与接入指南的回显契约同步为「key + project 都要回显」，新增省略 project/group 路径的回归测试。两轮复查确认无必改缺陷、无设计回潮
- 2026-11-21（注释勘误）：`isTaskRecord` 源码注释里「store 的单调防复活靠 settledAt 判断已终态」的旧口径改为状态判据（`isSettled(state)`），与 `store.ts` 的 guard 实现一致，避免后来者按旧判据改回 bug；同步重建 dist 产物
- 2026-11-22（单飞 SSE 二次审查 · 发版 v0.45.0）：协议升 v2——随机 epoch 换 Lamport 届（可全序比较），signal 降为纯 hint、state-reply 唯一安装且拒旧届，跨届 reply 重置 seq 水位；401 permanent 改为「让锁停机 + 可见性/网络恢复或再次接线 resume」，新增 `SharedStreamHandle.resume()`，杜绝无限轮转也不永久离线；session 级 notice 缓存跨 lease 回放；store 运行身份三层判据（乐观行让位 / 有 key 比 startedAt / 无 key 用 id）+ `isStale` 统一守卫生效于 merge 与 deliverNotice，`claimSettled` 按 startedAt 认运行实例，修复断网重跑漏结算与旧 notice 覆盖新 running；四视角专家两轮复查追加 clock 回写、回调内 resume、乐观归一让位三处边界修复。文档同步 401 停机/恢复口径与 401 验收步骤，新增 6 条回归测试
