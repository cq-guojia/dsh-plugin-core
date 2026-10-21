# 文档规范（本项目的文档怎么摆）

本文件是**文档槽位表**——这个项目有哪些文档、各自在哪。规则要求：**未登记 = 不存在**。
改文档落位前先改本表。

## 阅读顺序（新会话 / 新 agent）

| 顺序 | 读什么 | 回答什么 |
|---|---|---|
| 1 | 根 `README.md` | 这是个什么项目 |
| 2 | `task-ledger` 的 `list` | 现在有哪些在办任务 |
| 3 | `task-ledger` 的 `history` | 以前做过什么 |
| 4 | 本文件 | 文档实际怎么摆 |

## 槽位表

| 槽位 | 落位 | 说明 |
|---|---|---|
| 文档规范 | `docs/README.md`（本文件，路径固定） | 槽位表 + 阅读顺序 |
| 任务进度（在办 / 已结案 / 过程叙事） | **不入 `docs/`** —— 由 `task-ledger` skill 管理（`ledger/`） | 不得在 docs 内另建进度文档 |
| 文档格式规范（.doc.ts 真源 + 双投影） | `docs/design/doc-format.md` | schema、section.id 契约、Bilingual、生成与类型闸 |
| 运行逻辑 | `docs/design/architecture.md`（路径固定） | 五子包分层、依赖方向、样式注入机制、不变量 |
| 结构规范（运行逻辑拆分） | `docs/design/structure.md` | 代码分层树（目标态）+ demo 展示分区 + 做/暂缓标注 |
| 功能总索引 | `docs/design/features.md`（路径固定） | 每个包提供什么、对应哪个导出 |
| 各功能（真源） | `docs/design/features/<包名>.doc.ts` | `design` / `ui` / `utils` / `explorer` / `session` 各一份；typed 数据模块，单一真源 |
| 各功能（生成） | `docs/design/features/<包名>.md` | 由 gen-docs 从 .doc.ts 生成，勿手改 |
| 外部事实 | `docs/design/external/dsh-host.md` | 宿主 API 契约、官方 primitives、CSS 类名发现、暗色判据来源 |
| 数据库说明 | **不适用**（本包无数据库） | 保留行说明原因，不删行 |
| 样式规范 | `docs/design/style.md` | token 清单口径、`createStyleKit`、暗色判据、定制边界 |
| 方法规范 | `docs/design/methods.md` | 日期 / 字符串 / 字节 / HTTP 的边界行为与兜底口径 |
| 样例 | `docs/examples/integration.md` | 从零接入一个插件的完整示例 |
| 需求与决策（追加槽位） | `docs/requirements.md` | 需求范围、拍板结论、遗留问题 |

## 三条硬约定

- **文档 ≠ 规则**：本文档只说「有什么、怎么用、边界在哪」；「必须怎么遵守」由消费方项目自己的
  `AGENTS.md` / 规则文件管，本仓不越权。
- **真源在别处就不抄第二份**：props 以 TypeScript 声明为准，本文档是索引与导读；
  真源若在宿主源码（`docs/design/external/`）也标明来源，不复制正文。
- **命名不表时间**：纯 ASCII 小写 kebab-case，版本历史交给 git。
