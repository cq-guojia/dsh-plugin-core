# 20261124-0244-3fda-修复刷新后终态-toast-丢失: 修复刷新后终态 toast 丢失

- **Tags**: 终态通知, origin, sessionStorage, 刷新恢复
- **Status**: doing · 2026-11-24 02:52:25 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-24 02:44:13 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

消费方报「提交后台任务后刷新页面，终态 toast 不弹，但 onSettled 归档/刷新照常」。根因在核心 origin 机制：`createNotifyScope()` 用 `crypto.randomUUID()` 生成、只存内存（`src/runtime/notify.ts` 的 `makeOrigin()`），提交时随 `startTask` 写进记录并由服务端回显；刷新后内存 origin 变了，`defaultTaskHost.isOrigin()` 判定不等，`deliverToast` 第一行 return。onSettled 无 origin 门，故不受影响。需求：origin 应跟「窗口/标签页」走，而非「这一次页面加载」。

## To Do

- 用户后续在真实浏览器里验收：刷新后终态 toast 正常弹、别的标签页不弹。

## Next

- 验收若有异议再开新任务；本单已发版 v0.46.4，无待办动作。

## Process

- 需求评估：契约（`coordinator.ts:27-31` 写「当前标签页 id」）与实现（内存随机）本就不一致，属 bug 修复而非新功能。MDN 核实 sessionStorage 按 origin + 标签页分区、跨 reload/restore 保留、新 tab 新建、关页清除，正是「窗口身份」语义。
- 方案取舍：否决「直接把 `makeOrigin()` 换 sessionStorage」（会让同页两个 `createNotifyScope()` 拿到相同 origin，被 BroadcastChannel 自过滤 `data.origin === origin` 互吞，破坏 `notify.ts:13-15` 不变量）；采纳「tab 身份与逻辑端实例身份分离」——`getTabOrigin()` 服务任务归属，`createNotifyScope().origin` 保持随机只服务 BC。跨标签单飞 SSE 不用 notify origin（用 selfId + Lamport 届 + localStorage maxtick），不受影响。
- 改动：`src/runtime/notify.ts` 新增 `getTabOrigin()`（sessionStorage key `dshpc:notify:tab-origin:v1`，读写 try/catch + 内存 fallback）；`src/runtime/index.ts` 导出；`src/adv/tasks/api.ts:345` 默认 origin 从 `defaultNotifyScope().origin` 改为 `getTabOrigin`；测试 `test/tab-origin.test.mjs` 三条（cache-busting import 模拟刷新）；文档真源 `docs/api/runtime.doc.ts` / `docs/api/task-notifications.doc.ts` / `docs/architecture/task-notifications.md` 不变量 15 + 已知限制。
- 验证：`pnpm run build` → `pnpm test`（631 项全过，含新增 3 条）→ `pnpm run typecheck` → `pnpm run build:demo` → koc-codelint（10 文件 L0-L5 全过）均通过。

## Conclusion

刷新后终态 toast 丢失已修复：origin 改为 sessionStorage 的标签页级身份，逻辑端 id 仍随机，两者不再互相污染。已知边界：浏览器「复制标签页」会同 origin 双弹（接受）；升级瞬间已在飞、带旧随机 origin 的任务仍丢一次终态 toast（旧值从未持久化，无法回收）。用户指令发版：core / demo 同号 bump 到 0.46.4，提交 + push + tag `v0.46.4`。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261124-0244-3fda-修复刷新后终态-toast-丢失 --note "...". -->
- 2026-11-24 02:44:13 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created
- 2026-11-24 02:45:07 · claim · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · claimed → doing
- 2026-11-24 02:49:01 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 交付：getTabOrigin（sessionStorage tab 身份）替换默认 scope origin；src/runtime/notify.ts + api.ts:345 + 3 条回归 + 文档真源；build/test(631)/typecheck/build:demo/codelint 全过
- 2026-11-24 02:52:25 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 发版 v0.46.4：core/demo 同号 bump，文档投影已同步，build/test(631)/typecheck/build:demo 全过，待 commit+push+tag
