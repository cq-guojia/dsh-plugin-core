# 功能总索引

本包提供什么、对应哪个文件。详细用法在 `docs/design/features/<包名>.md`。

| 子路径 | 提供什么 | 详细文档 |
|---|---|---|
| `dsh-plugin-core/design` | token 变量表（含深色段）、`createStyleKit` 注入器工厂、`DARK_THEME_SELECTOR` | [`features/design.md`](features/design.md) |
| `dsh-plugin-core/ui` | 控件：Button / IconButton / Segmented / Textarea / Checkbox / Input 家族 / Picker / ModelPicker / WorkspacePicker / **Card** / **StripCard** / **Chip** / Modal / toast / Loading / SectionHead / MarqueeText / LiveText / BackToTop / **PanelDock（可停靠分栏）** / resizer / EmptyState | [`features/ui.md`](features/ui.md) |
| `dsh-plugin-core/utils` | 日期（含相对时间过去/未来）、字符串、字节/计数、时间区间、HTTP 取数、内置中英多语言 | [`features/utils.md`](features/utils.md) |
| `dsh-plugin-core/explorer` | `openFilePreview`（侧边栏预览）/ `pickWorkspaceFile`（弹窗选文件，Promise 返回相对路径）/ `FileBrowser` 面板本体、`WorkspaceFilesFace` 契约与纯逻辑层（**不含选工作区**——在 ui） | [`features/explorer.md`](features/explorer.md) |
| `dsh-plugin-core/explorer/preview` | 单文件预览体（md / 代码高亮 / HTML / PDF / Office / 图片，可单独 import） | 同上 |
| `dsh-plugin-core/session` | `SessionPreview`（弹窗 / 侧栏 / 整页三种承载）、`SessionSource` 契约、`renderMessage` 定制扩展点 | [`features/session.md`](features/session.md) |

## 不提供什么

- 官方会话 UI 的完整镜像（工具卡 / 代码块 / 推理行）—— `session` 目前只有最简渲染，
  富内容走 `renderMessage` 扩展点。
- 代码语法高亮 / PDF / Office 预览 —— `explorer` 的预览只有文本与图片。
- 设置页骨架、i18n 框架（插件自己的文案插件自己管）、`host` 宿主类型面。
