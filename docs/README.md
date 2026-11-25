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
- 2026-11-22（消费方 v0.45.0 复查 · 研判后治本）：core 侧修五处真问题——Lamport 最大 tick 落 localStorage（冷标签不再铸低届）、`carryIdentity` 跨运行取新 `settledAt` 而同运行仍 first-wins、`state-request`/`state-reply` 加 `noticeSince`/`noticeWatermark` 按水位裁切回放、`visibilitychange` 经 `isVisible()` 判定避免隐藏时误清 halted、基线 notice 在入缓存前快照 `fresh` 防自吞去重；其余四条逐条研判为消费方 / 服务端契约（钉旧版本、notice id 必须全局唯一、服务端须回显 origin/panelId、同 key startedAt 须严格递增或另评 runId），不改 core 实现，处置依据写入接入指南的反馈表。新增 5 条回归测试并修正一条因新语义失效的旧测试；补齐届/水位与服务端回显契约文档
- 2026-11-22（三方专家复查加固）：治掉三处补丁式实现——最大 tick 改由持锁 owner 独占落盘且读取取存储/内存最大值（消除跨标签 RMW 回拨与存储清空回拨），所有唤醒事件统一过可见性闸门（不再只挡 visibilitychange），通知回放水位改 `>=` 并由 notice id 去重兜底（同毫秒不漏投）；补 v1 协议隔离、sessionStorage 按 id 去重端到端、存储清空继承与隐藏态全事件四组回归；补齐 `docs/architecture/overview.md`（过时 subscribe/connect 描述）与 `docs/architecture/task-notifications.md`（四条新不变量）的缺口
- 2026-11-22（消费方第二轮封口）：修两条 core 真缺口——跨 realm 低届 owner（隐私模式 / 存储清空后各标签内存兜底独立）由高届 follower 广播 fencing claim、低届 owner 让锁重铸更高届；本地乐观行不再随跨标签基线外泄（新增 `store.getBaseline()`），避免 POST 失败回滚后别的标签留幽灵 running。替掉同进程假绿的「存储清空继承」测试，改用动态 import 造真跨 realm 回归；其余六条（钉旧版、notice id 全局唯一、回显 origin/panelId、startedAt 严格递增、凭证刷新时机、online 唤醒）明确为消费方 / 服务端契约，写入接入指南第二轮封口表、API 文档与 `connectTaskCenter` JSDoc
- 2026-11-22（六条契约专家组评判复核）：六条「非 bug」逐条独立评审，其中四条判为 core 责任并治本——store / executor 全局收口符号升 v2 与协议对齐（同页混版不再共享池）、通知去重加按 project 的 `settledAt` 水位（512 条溢出后老通知不重弹）、`scope:'origin'` 缺 origin 打一次 console.warn 让配置可诊断、连续两次 permanent 401 后 resume / 在线唤醒进入冷却使「有界」成为 core 保证；另给 `TaskCenterHost.autoRecoverOnOnline` 开关供严格显式恢复应用关闭 online 唤醒。删去「提交响应回显 origin/panelId」死条款；补两条回归（有界冷却、online 开关），根 README 中英补 minWidth 口径
- 2026-11-22（消费方第二轮残留封口）：fencing 挑战从只挡开局 signal 扩到低届 state-reply / frame，晚重拉的 high-epoch follower 不再冻到 owner 寿命轮换；401 连续失败计数改在真实 SSE 字节上清零，600ms 后才返 401 的延迟鉴权也被冷却覆盖；补两条针对性回归
- 2026-11-22（真机 Lock 接口纠错 · 发版 v0.45.5）：修单飞锁一拿锁就 TypeError 的 P0——`SharedLockLike` 原声明带 `signal`，但浏览器 Lock 只有 `name` / `mode`，取消信号在 `request()` 的 `options.signal` 上；删掉误接的 `lock.signal.addEventListener`，interface 按真实形状纠正（保留已有的 controller.signal 监听与 endLease 两条释放路径）。两个测试夹具原本捏了假 signal 造成假绿，一并改成真实 Lock 形状并补「真实形状下 owner 建流持锁」回归；617 测试全绿
- 2026-11-22（边缘项封口 · 发版 v0.45.4）：`autoRecoverOnOnline` 改为每次 online 事件读取当前接线值，监听器始终只绑一次，先 false 拦旧 headers、凭证刷新后置 true 即时生效（旧实现只在建流时求值，晚放行永远收不到唤醒）；Node 直连 401 计数与单飞路径同序移到 `onGiveUp` 回调之后，回调内同步重接的第二次 401 不被冷却吞掉；sessionStorage 写入失败时 `loadSeenNotices` 并集内存 fallback 与存储值（ids 去重、watermark 取最大），配额满仍按 id 去重不重弹；跨副本重复 warn 判定可接受不修（同 tab 由 sessionStorage id 去重挡住）。补三条针对性回归，616 项测试全绿
- 2026-11-23（任务中心契约升级 · 发版 v0.46.0）：任务中心三项消费端反馈治本——`TaskBar` 开放 `open` / `onOpenChange` / `closeOnAction`（默认点行按钮即收），新增跨副本前台主浮层广播（Modal / SideSheet / 选文件弹窗出现时收起页面级瞬时面板，不改 z-index 阶梯）；所有对外显示标题改为 `DisplayTitle { category, description }`，核心渲染成「分类丨说明」、超长跑马灯，分类建议中文 2–4 字 / 英文最多 2 词，代码只校验非空不判字数；宿主 toast string 契约与 notify 协议保持不变。同步 API / 架构 / 接入指南真源与 demo 调用。
- 2026-11-23（TaskBar 层级与挂起修复 · 发版 v0.46.1）：`TaskBar` 浮层改走新增的 `--dshpc-z-page-float`（= dock 900），低于抽屉 / 弹窗 / 耳朵 / 菜单，任何主浮层遮罩都盖得住它；`closeOnAction:false` 时主浮层出现只挂起（隐藏 + 不吃指针 + 关闭事件 gate），弹窗关后自动恢复，之后外部点击 / Esc / 触发器照常收起。受控 `onOpenChange(false)` 不再被去重吞掉，改为幂等可重复发；新增纯判定回归与前台 active 状态用例。
- 2026-11-23（TaskBar 浮层语义重构 · 发版 v0.46.2）：推翻 v0.46.1 的隐藏 / 恢复挂起——视觉完全交给 `page-float(900)` 与弹窗遮罩，面板从不被隐藏，弹窗关掉后本来就在；删除逐组件登记的 foreground store，改认标准模态语义（原生 dialog / `aria-modal="true"` / alertdialog），活动模态期间冻结外部 click / Esc / 触发器；外部收起改用 click 以覆盖「点外部按钮开弹窗」时序。核心 Modal / SideSheet 面板补 `aria-modal="true"`。终检补修：模态判定排除退场动画 / 祖先隐藏 / 非模态 `<dialog>`，外部收起改为 `pointerdown` 采样 + `click` 双时刻判定，避免「点关闭弹窗时把面板一起收掉」。
- 2026-11-23（交付边界文档补齐）：核对消费方关于 toast / notify / onSettled 的论断，全部与源码一致；在 API 真源补层次 / 消费者 / 页面范围 / 携带数据 / 典型场景五维对照，明确 onSettled 是 UI 接线而非第四通道、notify 刻意不带 `taskId`/`outcome`；runtime 真源补零任务语义，架构不变量补交付边界；按要求不举具体例子。
- 2026-11-23（TaskBar 终态标签 · 发版 v0.46.3）：任务行终态小标签按 `state` 区分 `done`=绿色「成功」、`failed`=红色「失败」；状态缺失或无法识别时用中性「完成」，不再一律假成功。补中英文案与纯判定回归。
- 2026-11-24（终态 toast 跨刷新归属 · 发版 v0.46.4）：任务 `origin` 缺省取 `getTabOrigin()`（sessionStorage 标签页身份，刷新保留、换页各异），与 `createNotifyScope().origin`（逻辑端实例随机 id，只服务 BroadcastChannel 自过滤）分离；刷新后同一窗口仍弹终态 toast，其它标签页不弹。补三条回归，同步 runtime / 任务通知文档真源与架构不变量。已知边界：复制标签页会同 origin 双弹，升级瞬间在飞旧任务丢一次终态 toast。
- 2026-11-24（TaskBar 点击后保持展开 · 发版 v0.46.5）：`closeOnAction` 默认值从 `true` 翻转为 `false`——点行按钮后默认保持面板展开，便于连点多个动作；仅消费方显式传 `true` 才每次收起。同步 API 真源示例与描述。
- 2026-11-24 12:11:42：api/ui 补 Card/StripCard 的 loading 色条呼吸与 FlipText 扫光两主题中性光口径
- 2026-11-25（跨面板按钮失效修复 · 发版 v0.46.7）：终态 toast / 行按钮在发起面板不在前台时，先暂存动作意图（`Symbol.for` 全局、键 = project+buttonId+panelId+startedAt、双击去重、上限 32、TTL 8 秒），`selectPanel` 切回发起页，等该页 handler 随面板重挂重新注册时以 microtask 补发；补发前重读任务并校验 startedAt / activePanel、claim-once、异常不冒泡。面板已激活则同步执行；只有条目失效 / 无 panelId / 面板已激活仍无 handler 才报统一提示，不再把「找不到 task」与「找不到 handler」混为一谈。消费方零改动（要求 handlers 随面板生命周期注册/注销）；服务端零改动。补 5 条回归，同步根 README / API 真源 / 接入指南 / 架构不变量与 demo 文案。
