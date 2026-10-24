# 功能总索引

本包提供什么、对应哪个文件。详细用法见 [`docs/help/index.md`](../help/index.md) 里对应的那份帮助文档。

| 子路径 | 提供什么 | 详细文档 |
|---|---|---|
| `dsh-plugin-core/design` | token 变量表（含深色段）、`createStyleKit` 注入器工厂、`DARK_THEME_SELECTOR` | [`../help/design.md`](../help/design.md) |
| `dsh-plugin-core/ui` | 控件：Button / IconButton / Segmented / Textarea / Checkbox / Input 家族 / Picker / ModelPicker / WorkspacePicker / **Card** / **StripCard** / **Chip** / Modal / toast / Loading / SectionHead / MarqueeText / LiveText / BackToTop / **PanelDock（可停靠分栏）** / EmptyState | [`../help/ui.md`](../help/ui.md) |
| `dsh-plugin-core/utils` | 日期（含相对时间过去/未来）、字符串、字节/计数、时间区间、HTTP 取数、内置中英多语言 | [`../help/utils.md`](../help/utils.md) |
| `dsh-plugin-core/explorer` | `openFilePreview`（右侧分栏预览）/ `pickWorkspaceFile`（锚定弹窗选文件，Promise 返回相对路径）/ `FileBrowser` 面板本体、`WorkspaceFilesFace` 契约与纯逻辑层（**不含选工作区**——在 ui） | [`../help/explorer.md`](../help/explorer.md) |
| `dsh-plugin-core/explorer/preview` | 单文件预览体（md / 代码高亮 / HTML / PDF / Office / 图片，可单独 import） | 同上 |
| `dsh-plugin-core/session` | `SessionViewModal`（只读弹窗承载）、`openSessionView`（建数据链）、`ChangedFileDiff`、`DEFAULT_RETAIN_SOURCE` | [`../help/session.md`](../help/session.md) |

## 不提供什么

- 官方会话 UI 的镜像尚未收尾：`session` 已覆盖常见的工具卡 / 代码块 / 推理行，
  个别官方块仍有差异；已知限制列在 [`../help/session.md`](../help/session.md)。
- 代码语法高亮 / PDF / Office 预览 —— `explorer` 的预览只有文本与图片。
- 设置页骨架、i18n 框架（插件自己的文案插件自己管）、`host` 宿主类型面。
