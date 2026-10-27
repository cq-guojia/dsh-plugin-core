# 20261018-1124-文档补全-agents-入口-每个包的-props-方法说明-890a：文档补全：AGENTS 入口 + 每个包的 props/方法说明

- **标签**：建设、文档、AGENTS、props
- **状态**：closed · 2026-10-19 11:39:21 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **创建**：2026-10-18 11:24:47 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **封卷**：2026-10-19 11:39:21 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- 头部四行由脚本维护，顺序固定：标签 → 状态 → 创建 → 封卷。
     「- **标签**：…」按 new --tags 插在最上面，没有标签就不写（分类只进台账与历史，不进本文档）；
     「- **封卷**：…」在结案时加在最后。 -->

## 背景

用户要求补全文档，两条硬要求：①AI / Agent 看得懂且**知道去哪看**；②人看得明白、有明确方法说明。
另定下分工：**文档 ≠ 规则**——文档只说「有什么、怎么用、边界在哪」；「必须怎么遵守」由消费方
项目自己的 agents 管，本仓不越权。

用户拍板的方案：`docs/` 随 npm 包一起发（`files` 加 `docs`），插件侧只需在自己 agents 里
写一行指向 `node_modules/dsh-plugin-core/docs/...`；**不要把所有文章都塞进去**，砍掉决策史等长文。

## 待办

等用户确认后 close（按用户给的流程：做完 → 专家检查 → 提交确认 → 用户点头才 close）。

## 下一步

用户确认后结案；若指出问题则改完再确认。

## 过程

**关键修正：文档落位必须符合注入规则的槽位规范**（`.codebuddy/rules/__rulemux__300.CODE.md`）。
我最初的计划（`docs/design.md` / `docs/ui.md` / `docs/INDEX.md` …）**不合规**，按规则重排：

| 槽位 | 落位 | 本次产物 |
|---|---|---|
| 文档规范 | `docs/README.md`（路径固定） | 槽位表 + 阅读顺序 + 三条硬约定 |
| 运行逻辑 | `docs/design/architecture.md`（固定） | 五包分层 / 依赖方向 / 样式注入机制 / 数据流 / 触发关系 |
| 功能总索引 | `docs/design/features.md`（固定） | 每包提供什么 + 对应导出 + 「不提供什么」 |
| 各功能 | `docs/design/features/<包>.md` | design / ui / utils / explorer / session 五份 |
| 样式规范 | `docs/design/style.md`（自定，已登记） | token 口径 / 前缀只换变量不换类名 / 明暗判据 / 三条硬规矩 |
| 方法规范 | `docs/design/methods.md`（自定，已登记） | 「不抛错、给兜底、不编造」总口径 + 新增方法 checklist |
| 外部事实 | `docs/design/external/dsh-host.md`（自定，已登记） | 宿主 8 条已核实事实（产物形态 / 官方包不可解析 / 位置参数校验 / 明暗判据 / 类名发现 / 官方表单缺口 / 取数通路 / 会话 UI 未开放） |
| 样例 | `docs/examples/integration.md`（自定，已登记） | 从零接入六步 + 接入坑表 |
| 需求与决策 | `docs/requirements.md`（追加槽位，已登记） | 已有 |
| 数据库说明 | 不适用（本包无数据库） | 按规则保留行、写明原因，未删行 |

另建根 `AGENTS.md`（给**改 core 的 agent**：仓结构 / 必知事实 / 测试命令 / checklist / 目录速查），
与面向**消费方**的 `docs/README.md` 分开——两者受众不同，合并不清。

**props 表的准确性来源**：写文档前先把 9 个控件的 `export interface *Props` 全部抓出来核对
（Button / Segmented / Textarea / Checkbox / MarqueeText / Loading / SectionHead / LiveText /
BackToTop / Field 家族），表格里的默认值逐条对照源码，不凭记忆写。

**分发机制**（回答用户「文档会不会进最终生产端」）：不会——打包器只把**被 import 的代码**
打进 bundle，`.md` 永远进不去；且 DSH 插件发布物是 `dist` 而非 `node_modules`。
`docs/` 只存在于「开发时装了依赖的机器」上，正是 agent 需要它的地方。

## 结论

**产出**：根 `AGENTS.md` + 10 份 `docs/` 文档 + `package.json` 的 `files` 加 `docs`
+ README 加「文档在哪」入口表。

**专家检查结果**（本次自检，非外部专家）：

| 检查项 | 结果 |
|---|---|
| 相对链接有效性（13 条） | ✅ 0 坏链 |
| 槽位登记 vs 实际文件 | ✅ 完全一致（含「不适用」行保留） |
| props 默认值 vs 源码 | ✅ 逐条对照过 |
| `npm run build` | ✅ 0 error |
| `node --test test/*.test.mjs` | ✅ 33 条全过 |

**仍未验证**：文档是「照着源码写的」，但**没人照着文档接过一次插件**——
「按 `docs/examples/integration.md` 走能不能真接上」要等第一个消费者。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
