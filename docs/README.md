# 文档索引

本文件是本项目文档库的唯一索引：有哪些文档、各自在哪，看下面这棵树。槽位与格式由 `koc-code-docwriter` skill 管；项目特有的落位约定见 `docs/development/doc-format.md`。

## 目录

```text
docs/                                               # 项目文档库入口与唯一索引
├── architecture/                                   # 系统组成、代码分层与不可破的约束
│   ├── overview.md                                 # 五子包分层、依赖方向、样式注入机制与不变量
│   ├── structure.md                                # 控件归类、代码分层树与 demo 展示分区
│   └── task-notifications.md                       # 通知任务中心的状态、订阅、事件与跨页分片契约
├── features/                                       # 功能范围与尚未归属的结论
│   ├── overview.md                                 # 功能总索引槽位说明：职责已交帮助索引
│   └── scope.md                                    # 需求范围、不做的部分与发布口径
├── guides/                                         # 做一件事的入口与步骤
│   ├── index.md                                    # 帮助索引：按你要做的事挑一份文档
│   ├── integration.md                              # 从零接入一个插件的步骤
│   └── style.md                                    # 样式使用侧：token、换肤、前缀规则
├── api/                                            # 各子包的对外契约、控件与参数参考
│   ├── design.md                                   # design 子包：token、createStyleKit、明暗判据
│   ├── explorer.md                                 # 工作区浏览与文件预览的接入方式与 API
│   ├── icons.md                                    # 图标：字体图标库注册、在线样式注入、官方 icons 归属
│   ├── methods.md                                  # utils 方法统一口径与返回值约定
│   ├── session.md                                  # 会话只读预览的接入方式与 API
│   ├── task-notifications.md                       # 通知任务中心的状态池、事件与跨页同步
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
