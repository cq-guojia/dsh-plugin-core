# 20261121-1434-bcbb-单飞sse问题清单核实与修复: 单飞SSE问题清单核实与修复

- **Tags**: SSE, 单飞, 问题清单, 修复
- **Status**: doing · 2026-11-21 15:16:54 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-21 14:34:37 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

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

## Conclusion

本轮只核实 + 方案，无代码变更。

失真块方案要点：把「基线」按来源分成两类语义——`task-snapshot`/gap 重拉/state-reply 是**权威快照**，应能覆盖本地陈旧状态；本地乐观行靠「基线里无同 key 即保留」来护，而非靠「同 key 一律不覆盖」。Node 直连补 `snapshot` 透传；定向 reply 同步 epoch；`merge` 在 running 分支清 `announced`。

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
