# 20261121-1434-bcbb-单飞sse问题清单核实与修复: 单飞SSE问题清单核实与修复

- **Tags**: SSE, 单飞, 问题清单, 修复
- **Status**: doing · 2026-11-21 14:39:21 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
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

失真块方案定稿后交用户确认是否进入修复；本轮不动代码。

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

**硬伤（需用户拍板）**：业务键复用（服务端重跑同 key）时，「基线同 key 记录」可能是上一轮旧终态而非本轮权威状态，仅凭 `(project,key)` 无法区分「该覆盖」还是「该保留本地 running」。现有字段只有 `startedAt`/`settledAt` 可近似判代次，但乐观行用本地 `Date.now()`、与服务端时钟不同源 → 无银弹。彻底解需服务端给代次号（generation）或业务键不复用；否则只能选一侧取舍（保乐观行则容忍陈旧，或权威覆盖则重跑瞬间闪一下旧终态）。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261121-1434-bcbb-单飞sse问题清单核实与修复 --note "...". -->
- 2026-11-21 14:34:37 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-21 14:39:21 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 消费方27条清单全部落入worklog并分6块；A块失真问题已逐条核实到 file:line 并给出方案与硬伤结论
