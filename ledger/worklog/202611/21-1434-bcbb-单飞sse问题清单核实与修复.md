# 20261121-1434-bcbb-单飞sse问题清单核实与修复: 单飞SSE问题清单核实与修复

- **Tags**: SSE, 单飞, 问题清单, 修复
- **Status**: done · 2026-11-22 04:32:58 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-21 14:34:37 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Sealed**: 2026-11-22 04:32:58 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

消费方在 `dsh-plugin-core@0.44.0` / `dsh-task-ledger@0.2.6`（多标签 SSE 单飞）发版后提交 27 条审查清单。用户要求：① 27 条全部落入本任务（含「不成立不算问题」「成立但随机/边界」），② 一块一块处理，先定「失真问题」并给方案、判断有无解决不了的硬伤。本轮只做核实与方案，**不改代码、不发版、不 bump**。

## To Do

27 条全录（判定基于 `src/adv/tasks/*` 现场源码，非运行时试探）：

**A 块·状态/数据失真（本轮先定）**

| # | 问题 | 判定 | 备注 |
|---|---|---|---|
| 4 | 基线只填不覆盖 | 成立 | 失真核心 |
| 5 | owner 首连快照被吞 | 成立 | 失真核心 |
| 9 | Node 直连丢快照参数 | 成立 | 快照语义失真 |
| 11 | state-reply 不更新 epoch | 成立 | 帧过滤错乱 |
| 18 | epoch 冷启动回拨 | 成立·随机 | 时钟/冷启动边界 |
| 24 | 结算去重键不随服务端重跑清除 | 成立·既有 | 漏通知 |
| 25 | 占位记录进快照 | 成立·既有 | 消费方 + 核心 |

**B 块·连接状态机与生命周期**

| # | 问题 | 判定 |
|---|---|---|
| 1 | 断流后无人重连 | 成立·P0 |
| 2 | 文档承诺显式重连失效 | 成立·P0 |
| 3 | freeze 链路坏 | 成立 |
| 6 | 重拉被节流吞掉且不补定时器 | 成立（伴生失真） |
| 7 | 回放窗口定时器竞态 | 成立·边界 |
| 8 | 判活被通道流量污染 | 成立 |
| 10 | 回调被快照化 | 成立 |
| 12 | 监听器泄漏 | 成立·边界 |
| 13 | 轮换漏清 stateRetry | 成立 |
| 14 | follower 看门狗死代码 | 成立 |
| 17 | 定向回包误伤其他标签 | 成立 |
| 19 | 节流用挂钟 | 成立·随机 |

**C 块·文档/注释/版本**：#15 接入指南示例自相矛盾（成立）、#16 版本注释错（成立）、#26 文档措辞与实现不符（成立）、#27 多处注释仍是旧版本（成立）。

**D 块·既有/非本次**：#21 产物不同步（成立·发布卫生，非单飞代码缺陷）、#23 scope:'origin' 失效（成立·既有）。

**E 块·不成立**：#20 命名哈希碰撞 + refs 减负 —— FNV-1a 只用于 lock/channel 命名、不参与正确性；disposer 有 `released` 防重，refs 不会变负。**不算问题**。

**F 块·测试**：#22 测试覆盖洞（成立，未覆盖 #1/#3/#6/#11/#12）。

## Next

全部可能性已查透（见 Conclusion「方案穷举」）。最优解：**保留单飞架构，按 27 条清单逐条修实现**（不推倒、不换轮询、不依赖宿主通道）。下一步先定 A 块失真的具体修法（基线覆盖语义 + Node snapshot 透传 + reply 同步 epoch + merge 清 announced），再进 B 块状态机重写。本轮不动代码。

## Process

逐条证据（现场源码，`file:line`）：

- #4 `store.ts:172-184` `mergeBaseline` 对同 key / 同 id 一律 `continue`；`shared-stream.ts:58-59` 设计注释「只填本地不存在的 key」→ 权威基线无法纠正本地陈旧 running/旧状态。
- #5 `stream.ts:82` `task-snapshot → onTask(_, true)`；`shared-stream.ts:320-329` owner 回调用 `options.onTask(task, snapshot)`；`api.ts:153-157` `ingestTask(true)` → `mergeBaseline` → 同 #4。
- #9 `api.ts:266` Node 直连 `onTask: (task) => ingestTask(task)` 未透传 `snapshot`，快照帧当增量走 `coordinator.project`（merge 覆盖语义）。
- #11 `shared-stream.ts:232-239` 定向 `state-reply` 只设 `ready` + `applyBaseline`，未同步 `state.epoch` → 后续帧被误判切主、seq 错乱。
- #18 `shared-stream.ts:131` `peerEpoch` 为实例变量（重载归零）；`:296` 用 `Math.max(Date.now(), …)` → 新主时钟落后且未收到旧主信号时 epoch 回拨。
- #24 `store.ts:152-170` `merge` 无 `announced.delete`（对比 `upsert:148`）→ 服务端重跑的 running 不清声明，第二次终态被 `claimSettled` 判重、漏通知。
- #25 消费方 `session-job.store.ts` `snapshot()` 含内存占位 running 行 → 随 `getState()` 作为基线发给 follower。
- #6 `shared-stream.ts:203` 节流命中即 `return`，不设 `stateRetry` → gap 重拉永久丢失。
- #1 `shared-stream.ts:348` `onGiveUp` 用 `state.controller.abort()` 干掉整个 session → `run()` 退出、watchdog 停摆，永久离线。
- #2 `api.ts:251-256` 同 `streamUrl` 只 `refs += 1`，不重建 → 文档承诺的「再调 connectTaskCenter 显式重连」无效。
- #3 `shared-stream.ts:456` `freeze` 监听挂在 lifecycle(window)，Page Lifecycle 的 `freeze/resume` 派发在 `document`；且无 `resume` 恢复。
- #8 `shared-stream.ts:240` 任意 BC 消息（含他人 state-request/reply）刷新 `lastAliveAt` → 判活被污染。
- #14 `shared-stream.ts:358` watchdog 只在 `asOwner` 建，follower 分支 `:367` 永远不可达。
- #19 `shared-stream.ts:202-204` 节流用 `Date.now()` 挂钟，回拨即永久吞重拉。

## 重写方案（工业界对标后定稿，2026-11-21）

对标 `sse-coordinator@0.3.2`（npm pack 解包 `dist/index.js:1-292` 读全文）：工业界做法极简——Web Locks 排他锁 + 锁回调挂永不 resolve 的 Promise（abort 即释放、天然 failover）+ BC 转发 + `visibilitychange`/`online` 触发 recover + `cleanup()` 一次收干净。**它不做 epoch 大小比较、不做 BC 流量判活、不做双模选主**。我们这版把自创机制写复杂了，27 条里 19 条就是这么来的。

重写原则（保留正确性必需项，砍掉自创复杂度）：

1. **session / lease 两级分离**：session 管整个协调器生命周期；lease = 一次持锁届，有独立 AbortController。`onGiveUp` / watchdog / lifetime 只 `endLease()`（让出锁、run loop 自动重申请），**绝不 abort session**（根治 #1）。
2. **epoch 改随机届 ID + 相等比较**，去掉挂钟与 `peerEpoch` 单调性（根治 #18）：新 owner 成为 owner 第一件事广播 `signal:epoch`，BroadcastChannel 保证同一发送者 FIFO，follower 先收到 epoch 再收帧，不需要大小比较；对不上当前 epoch 的帧直接丢。
3. **底层 `stream.ts` 自己重连**：协调器只在 giveUp 时让出锁 + 递增退避（上限 30s）重申请，`headers()` 每次取新值 ⇒ 凭证刷新自动生效，不必显式重连调用（改写 #2 文档口径）；断流不再永久离线。
4. **判活只认真 SSE 字节**：`onAlive` 刷新 lease 的 lastSseAliveAt，BC 消息一律不刷新（根治 #8）；watchdog 只在 owner 跑（follower 死代码分支删除，根治 #14），超时只 endLease。
5. **基线请求**：节流用单调时钟（`performance.now()`，根治 #19），被节流必定补发定时器（根治 #6）；`state-reply` 同步 epoch/seq（根治 #11），定向回包只认 `to === selfId`（根治 #17）。
6. **生命周期**：`visibilitychange` + `online` 触发 recover（工业界标配，本版缺）；`pagehide`/`freeze` 挂 document（根治 #3），`pageshow(persisted)`/`resume` 重建 session；所有监听器成对移除（根治 #12）。
7. **资源集中管理**：所有定时器进一个 Set，`endLease()` 与 `dispose()` 各自一次清空（根治 #7/#13）。
8. **store/api 侧**：基线按来源分语义（权威快照可覆盖陈旧本地行，根治 #4/#5）；Node 直连补 snapshot 透传（#9）；`merge` 在 running 分支清 announced（#24）；`connectTaskCenter` 的 headers/onGiveUp 改动态读取（#10）。

## Conclusion

**已完成实现（2026-11-22）**：按上面的重写方案改完 8 类根因，27 条清单中本次引入的 19 条（#1-#19）在代码层全部消项：

| 项 | 改动 | 对应 |
|---|---|---|
| `src/adv/tasks/shared-stream.ts` 全文重写 | session/lease 两级分离、随机 epoch、单调时钟、判活只认真 SSE 字节、生命周期路由、定时器/监听器集中清理 | #1/#3/#6/#7/#8/#11/#12/#13/#14/#17/#18/#19 |
| `store.ts` 基线语义 + 结算复位 | `mergeBaseline` 复用 merge（覆盖陈旧行 + 单调守卫）；`merge` 在 running 清 announced | #4/#5/#24 |
| `api.ts` | Node snapshot 透传、headers/onGiveUp 动态读取、freeze/resume 路由到 document | #9/#10/#3 |
| docs + 注释 | 接入指南挂 disposer、API 措辞改 refcount、重连改自动、消费方版本注释 | #15/#16/#26/#27 |
| `test/shared-stream-regressions.test.mjs` 新增 5 例 | 断流重连、监听器成对移除、随机 epoch 切主、结算复位、基线覆盖 | #22 补洞 |

**验证**：build ✅ / test 589/589 ✅ / typecheck ✅ / build:demo ✅；两仓 `koc-codelint` 全过（核心 8 文件、消费方 4 文件；首轮 6 条 lint 已修：模板内赋值、未用变量、markdown 缩进）。产物 dist/ 已随 build 更新入库。

## 专家团四轮复查（2026-11-22，用户要求「查到没问题为止」）

三个独立视角（测试充分性 / 并发状态机 / 一致性回归）逐轮审查，每轮发现→修→再查，共四轮，终局「可以交付」。

| 轮 | 发现 | 修复 |
|---|---|---|
| 1 | **P0** `state-reply` 无届校验：旧 owner 迟到 reply 把 follower 的 epoch 打回 → 永久失联（`shared-stream.ts:290`）| 加届校验：已有届必须相等，空届放行并采纳 reply 届 |
| 1 | **中** session controller 的 abort 监听逐 lease 累积，闭包捕获旧 lease → 线性内存泄漏 | Lease 加 `abortOff`，`cleanupLease` 成对移除 |
| 1 | **中** owner 每 1.2s 发无人应答的 state-request（晋升未清 stateRetry） | `requestState` 开头 owner 直接 return；晋升时 `clearStateRetry()` |
| 1 | **严重** `mergeBaseline` 无条件覆盖：本地乐观 running 被「POST 已受理但 snapshot 尚旧」的终态基线盖掉，随后真 running 被单调守卫吞 → 永久卡旧终态 | store 加 `optimistic` 集合：本地 `submit:` running 打标，真源帧到达才清；基线遇标记跳过 |
| 1 | 测试 #1/#18 假绿（fake 流永不 giveUp、`locks.holders.size>=0` 恒真），多数 #1-#19 无有效测试 | 重写 fake（BC 异步派发、401 真注入、通道关闭/锁释放断言），新增乐观行保护用例 |
| 2 | `removeRunning` 回滚乐观行漏清 optimistic 标记 → 该 key 基线永久被跳 | `removeRunning` 补 `optimistic.delete(settlementKey(current))` |
| 2 | `seenReplay` 无界增长（长寿命 session 慢泄漏） | 抽 `markSeen(id)`，超 512 按插入序淘汰最早项 |
| 2 | bfcache 恢复退避最长空窗 30s（重置 backoffMs 不影响在飞 sleep） | Session 加 `wake` controller，`recover()` abort 打断在飞 sleep 并重建 |
| 3 | 乐观行归一到别的 targetId 时 `removeRunning(乐观id)` 找不到行 → 标记仍泄漏 | 加 `optimisticById: Map<乐观id, sKey>`，`removeRunning` 按 id 反查 `clearOptimistic`；`clearAll` 同步清 |
| 4 | 终局确认：Map/Set 由 `clearOptimistic` 同源维护无泄漏；27 条范围无残留真 bug | 无新增改动 |

**最终验证**：build ✅ / test **592/592** ✅ / typecheck ✅ / build:demo ✅；两仓 `koc-codelint` 全过。四轮复查证据均在对应轮次的审查结论中（文件:行号已逐条核对，dist 与 src 同步、测试跑的是新产物）。

**未处理（不在本次范围，需另开）**：#20 不成立（不算问题）；#21 产物同步属发布卫生；#23 `scope:'origin'` 失效、#25 占位记录进快照属消费方/核心既有链路问题。真机 3 标签页验收尚未做。

失真块方案要点（历史记录）：把「基线」按来源分成两类语义——`task-snapshot`/gap 重拉/state-reply 是**权威快照**，应能覆盖本地陈旧状态；本地乐观行靠真源归一覆盖来护。Node 直连补 `snapshot` 透传；定向 reply 同步 epoch；`merge` 在 running 分支清 `announced`。

**硬伤结论撤回**：我上一轮把「业务键重跑时基线旧终态」判成无解硬伤，是错的。基线由服务端 `snapshot()` 生成（`src/host/task-stream.ts:147`），服务端在重跑发起时就把同 key 记录写成 running、SSE 增量会推达；本地那条乐观行在真源 running 到达时本就该被覆盖（这正是 `upsert` 归一覆盖的设计）。基线一旦只做「补齐本地缺的 key」而不覆盖，才会把旧状态留在界面上——这是 bug 不是两难。**不推翻原方案，也不存在不可解的取舍。**

**宿主协议已核实（2026-11-21）**：`@deepseek-ai/dsh-host-webserver` 的 `dist-tags.next = 0.2.2-rc.5`（文档 dsh-host.md 记 rc.3，本机包 rc.5 为准）；解包 `lib/index.js:2,490,496` 用的是 `node:http` / `node:https` 的 `createServer`，**没有 http2 模块、没有 ALPN**。⇒ SSE 走 HTTP/1.1，浏览器每域 6 连接限制**真实存在**，多标签合并有实际价值，不是鸡肋；我上一轮「如果是 HTTP/2 就砍掉」的假设不成立。多用户场景不成立「8 用户挤爆」——每用户独立浏览器各自 6 名额，服务端连接数与浏览器名额是两码事。

**方案穷举（2026-11-21，用户要求查一晚上找最优解，实际全查完）**：

| 方案 | 判定 | 关键证据 |
|---|---|---|
| 官方 mux（`/api/remote.mux` WebSocket，所有 stream 复用一条物理连接） | 第三方插件**进不去** | `@deepseek-ai/dsh-client-connection@0.2.2-rc.1` `lib/client.browser.js:1348-1353`（`new WebSocket` + `/api/remote.mux`）、README.md:34；`@deepseek-ai/dsh-api-remotes` `lib/index.js:151-155` 要 `inject(['typertGateway'])` + 编译期白名单 `API_REMOTE_FORWARDED_EVENTS`（`:21-147`），`$on` 合法 key 固定、能力集构建期装配（`README.md:74-79`）；插件仓零 `typertGateway` |
| SharedWorker | **不能** | 插件是 window 内 `window.__ModuleLoader__.load({id,factory})` CJS 闭包（dsh-task-ledger `packages/plugin/dist/client.js:1-6`），worker 全局无 `window`/`__ModuleLoader__`/`ctx.inject`；全仓与官方包零 worker 载入机制；Safari 长期不支持 |
| Service Worker | **不能**（SSE 代理） | 事件驱动、空闲即终止，无 `ctx.inject`；Push 需 HTTPS+授权+VAPID 外部服务，不解决插件数据面 |
| HTTP/2 / 多端口 / 子域 / iframe 异源 | **不能** | ALPN 实测只 http/1.1；webServer 单 host+单 port+单 `Server`（rc.5 `src/index.ts:97-109,392,405-437`）；Blob 继承同源、sandbox opaque origin 跨源请求仍计宿主域连接池 |
| localStorage / storage 事件 | 不推荐 | `api.ts:26-31` 明确用 sessionStorage 而非 localStorage 保 `scope:'all'` 每页各弹一次；同步写+序列化重、无 ACK/基线 |
| 长轮询 / 按需短连接 | 降级可自愈但非等价 | 失去服务端主动推送；hold 期仍占 socket；消费方 worklog `21-0330-ec37:40,221-222,241` 已收回该提法 |
| **Web Locks 选主 + BroadcastChannel 扇出（现方案）** | **唯一保留实时性的正解，已实现发布** | `shared-stream.ts:123-126,292-386,388-412`；社区 `sse-coordinator` 同款；切换/断流空窗靠基线+outbox 补齐（方案 worklog `:52,95,131,138`） |

**最优解结论**：不推倒现有单飞架构。理由——(1) 升不了 h2、官方 mux 无第三方注册口、单域单 listener，共享连接只剩单飞一条路；(2) SharedWorker/SW 在 CJS 闭包下无落地路径；(3) 轮询是降级不是等价；(4) 现方案的 27 条问题全是**实现缺陷**（状态机/基线语义/监听器/文档），不是架构病。最优解 = 保留架构、按清单逐条修实现 + 重写 `shared-stream.ts` 状态机 + 补测试覆盖，而不是换方案。边界诚实：单插件降到 1 条只是「不是本插件把全站搞死」，不免疫别人占满池（消费方 worklog `:44-46`）——那是平台责任。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261121-1434-bcbb-单飞sse问题清单核实与修复 --note "...". -->
- 2026-11-21 14:34:37 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-21 14:39:21 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 消费方27条清单全部落入worklog并分6块；A块失真问题已逐条核实到 file:line 并给出方案与硬伤结论
- 2026-11-21 15:06:46 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 撤回硬伤结论；解包webServer rc.5的lib/index.js:490核实宿主是node:http非HTTP2，6连接限制真实、多用户不成立挤爆
- 2026-11-21 15:16:54 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 全方案穷举完成：官方mux无第三方注册口、SharedWorker/SW在CJS闭包下不可落地、h2/多端口/iframe全封死；最优解=保留单飞架构逐条修实现，已写入worklog Conclusion
- 2026-11-21 15:32:22 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 对标 sse-coordinator@0.3.2 源码定稿重写方案：session/lease两级分离、随机epoch、单调时钟、判活只认真SSE字节、生命周期成对清理，已写入worklog
- 2026-11-21 16:10:59 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 实现完成：重写shared-stream+store基线语义+api接线+5例回归+文档注释；#1-#19代码层消项；build/test589/typecheck/build:demo全过；两仓codelint全过
- 2026-11-21 16:31:23 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 专家团四轮复查完成（P0届校验/内存泄漏/owner自请求/乐观行基线吞等全修）；文档同步refcount与重连措辞；592测试+codelint全过，终局可交付
- 2026-11-22 04:32:58 · close · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · sealed: 发版 v0.44.1 完成：四轮专家复查清零、592测试+两仓codelint全过、commit ffc1347d 已推 main、tag v0.44.1 已推
