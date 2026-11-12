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
| 文档规范 | `docs/README.md`（本文件，路径固定） | 槽位表 + 阅读顺序 + 目录树（统一索引） |
| 文档库元数据 | `docs/.docwriter.json` | 版本闸门与初始化时间，由文档工具维护，不手改 |
| 目录树 | `docs/README.md` 的 `## 目录` 节 | 由文档工具按磁盘生成；连接符 / 顺序 / 对齐不手改，只补每行 `#` 后的一句话说明 |
| 项目门面（英 + 简中，随包发布） | 根 `README.md` / `README.en.md`；`packages/demo/README.md` / `packages/demo/README.en.md` | 两个 npm 包的对外说明：功能总览、适配范围、安装与截图；中文版是英文版的翻译，正文只此一份 |
| **帮助文档区（追加槽位）** | **`docs/help/`** | **给引用方 / Agent，随包发布；`.doc.ts` 真源 + `.md` 投影同目录** |
| 帮助索引（入口） | `docs/help/index.md`（← `index.doc.ts`） | 引用方与 Agent 的唯一入口：按任务挑一份 |
| 接入样例 | `docs/help/integration.md`（← `integration.doc.ts`） | 从零接入一个插件 |
| 各功能帮助 | `docs/help/<包名>.md`（← 同名 `.doc.ts`） | `ui` / `design` / `utils` / `explorer` / `session` / `task-notifications` 各一份 |
| 方法 / 样式的使用侧 | `docs/help/methods.md`、`docs/help/style.md` | 手写 md（无对应 demo 页，不进投影） |
| 任务进度（在办 / 已结案 / 过程叙事） | **不入 `docs/`** —— 由 `task-ledger` skill 管理（`ledger/`） | 不得在 docs 内另建进度文档 |
| 文档格式规范（帮助文档真源 + 双投影） | `docs/design/doc-format.md` | schema、section.id 契约、Bilingual、生成与类型闸 |
| 各功能真源（旧落位） | **不适用**（已迁入 `docs/help/<包名>.doc.ts`） | 保留行说明去向，不删行 |
| 样例（旧落位） | **不适用**（已迁入 `docs/help/integration.*`） | 同上 |
| 运行逻辑 | `docs/design/architecture.md`（路径固定） | 五子包分层、依赖方向、样式注入机制、不变量 |
| 通知任务中心契约 | `docs/design/task-notifications.md` | 状态快照、订阅、事件、跨页分片协议、结束句柄、Promise 结局定稿、两级分组、常驻任务与纯广播之分、Web Locks 存活判定 |
| 结构规范（运行逻辑拆分） | `docs/design/structure.md` | 代码分层树（目标态）+ demo 展示分区 + 做/暂缓标注 |
| 功能总索引 | **不适用**（职责由 `docs/help/index.md` 承担，路径固定槽位保留行） | 引用方走帮助索引，本文件不再维护第二份 |
| 外部事实 | `docs/design/external/dsh-host.md` | 宿主 API 契约、官方 primitives、CSS 类名发现、暗色判据来源 |
| 数据库说明 | **不适用**（本包无数据库） | 保留行说明原因，不删行 |
| 样式规范（本仓内部） | `docs/design/style.md` | 注入机制 why、派生色口径、三条硬规矩（使用侧在 `docs/help/style.md`） |
| 方法规范（本仓内部） | `docs/design/methods.md` | 新增 utils 方法的 checklist（使用侧在 `docs/help/methods.md`） |
| 文案撰写规范 | `docs/design/copywriting.md` | 帮助文档文案标准：禁过程叙事、段落与表格口径、双语对等、格式冻结 |
| 需求与决策（追加槽位） | `docs/requirements.md` | 需求范围 + **还没有归属的结论**（写进归属文档后即从本文删除，故本文应越来越短） |

## 三条硬约定

- **文档 ≠ 规则**：本文档只说「有什么、怎么用、边界在哪」；「必须怎么遵守」由消费方项目自己的
  `AGENTS.md` / 规则文件管，本仓不越权。
- **真源在别处就不抄第二份**：props 以 TypeScript 声明为准，本文档是索引与导读；
  真源若在宿主源码（`docs/design/external/`）也标明来源，不复制正文。
- **命名不表时间**：纯 ASCII 小写 kebab-case，版本历史交给 git。

## 目录

```text
docs/                                               # 项目文档库入口与唯一索引
├── design/                                         # 本仓内部的设计与工程规范，不随包给引用方读
│   ├── external/                                   # 宿主与官方包等仓库外事实，带来源与复核口径
│   │   └── dsh-host.md                             # DSH 宿主 API、官方 primitives 与产物形态的已核实行为
│   ├── architecture.md                             # 五子包分层、依赖方向、样式注入机制与不变量
│   ├── task-notifications.md                         # 通知任务中心的状态、订阅、事件与跨页分片契约
│   ├── copywriting.md                              # 帮助文档文案标准：读者定性、双语对等、格式冻结
│   ├── doc-format.md                               # .doc.ts 真源与 md / demo 双投影的 schema 及生成闸
│   ├── features.md                                 # 功能总索引槽位说明：职责已交帮助索引，保留占位
│   ├── methods.md                                  # 往 utils 里新增方法时要过的 checklist
│   ├── structure.md                                # 代码分层树与 demo 展示分区的结构规范
│   └── style.md                                    # 本仓改动样式的 why、派生色口径与三条硬规矩
├── help/                                           # 随包发布的帮助文档区，.doc.ts 真源与同名 .md 投影同目录
│   ├── task-notifications.md                         # 通知任务中心：状态池、事件总线与跨页同步的对外用法
│   ├── design.md                                   # design 子包使用帮助：token、createStyleKit、明暗判据
│   ├── explorer.md                                 # 工作区浏览与文件预览的接入方式与 API
│   ├── index.md                                    # 帮助索引：按你要做的事挑一份文档
│   ├── integration.md                              # 从零接入一个插件的步骤
│   ├── methods.md                                  # utils 方法统一口径与返回值约定，手写无 demo 页
│   ├── session.md                                  # 会话只读预览的接入方式与 API
│   ├── style.md                                    # 样式使用侧：token、换肤、前缀规则，手写无 demo 页
│   ├── ui.md                                       # 控件清单与全部 props 参考
│   └── utils.md                                    # utils 子包方法参考
└── requirements.md                                 # 需求范围与尚未归属的拍板结论
```
