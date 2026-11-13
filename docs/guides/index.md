# 帮助索引

> EN: Help index

本文件由 `scripts/gen-docs.mjs` 从同名 `.doc.ts` 生成，请勿手改。

## 按你要做的事挑一份

> EN: Pick the one you need

本索引只回答「读哪一份」。按你要做的事挑一行，跳过去读完就能写代码。

> EN: This index answers one question: which document to read. Pick the row matching your task.

索引与接入样例在 `docs/guides/`，各子包的 API 参考在 `docs/api/`：`<主题>.md` 给人读，同目录的 `.doc.ts` 是真源。改内容请改真源后重跑 `node scripts/gen-docs.mjs`，`.md` 由它生成。

> EN: The index and integration guide live in `docs/guides/`; per-package API references live in `docs/api/`. `<topic>.md` is what you read, and the `.doc.ts` beside it is the source. Edit the source, then rerun `node scripts/gen-docs.mjs` — the `.md` is generated.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `把这个包接进我的插件` | `integration.md` | — | 装包、初始化样式、最小可用控件与工具函数、清理，一条龙示例 | Install, style init, minimal working controls and helpers, teardown — end to end |
| `用控件（按钮 / 输入 / 选择器 / 弹窗 / 右侧分栏）` | `ui.md` | — | 控件清单与全部 props；弹窗与 PanelDock 的布局约定在此 | Control inventory and every prop; dialog and PanelDock layout contracts are here |
| `建 style kit、覆盖 token、多插件同页隔离` | `design.md` | — | design 子包的 API：`createStyleKit` / `registerStyle` / 注入机制 | The `design` subpackage API: `createStyleKit` / `registerStyle` / how injection works |
| `处理日期、字符串、字节、HTTP` | `utils.md` | — | 纯函数清单与参数，含每个函数的失败返回值 | Pure helpers and their arguments, including each one’s failure return |
| `加工作区文件浏览与预览` | `explorer.md` | — | 右侧分栏预览与文件选择器；都要宿主提供的工作区快照 | Right-dock preview and file picker; both need the host workspace snapshot |
| `把一次会话渲染成只读预览` | `session.md` | — | 会话数据链与弹窗 props；归档会话同样可读 | The session data chain and dialog props; archived sessions read fine too |
| `让长耗时任务登记、订阅并跨页可见` | `task-notifications.md` | — | 状态池、订阅、事件通知、跨页同步与结束句柄；只讲数据面，不含弹窗与查看控件 | Pool, subscription, events, cross-page sync and settlement handles — the data plane only, no dialog or viewer control |
| `查方法的统一口径（失败不抛错、兜底不编造）` | `methods.md` | — | 所有 utils 方法的共同行为约定，写调用代码前先看它 | Shared behavior contract of every utils helper — read before writing call sites |
| `用 token、配色或定制皮肤` | `style.md` | — | token 清单、明暗判据、能改什么改到哪为止 | Token inventory, dark-mode predicate, and how far customization goes |

## 更新日志

本文件为生成投影，变更记录在同名 `.doc.ts` 真源与本仓 git 历史。
