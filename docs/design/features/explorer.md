# explorer —— 工作区浏览

依赖 `ui` + `design`。装的是「工作区 / 文件」这个领域：浏览面板、预览、选工作区、选文件。

## 宿主契约：`WorkspaceFilesFace`

**由插件从 `ctx` 取出这一小块传进来**（不要传整个 `ctx`——那会把本包和宿主版本焊死）。
宿主 breaking 时改的是插件「取出」的一行。

| 方法 | 签名要点 |
|---|---|
| `read` | `(sessionId, path, range, signal?)` —— ⚠️ `range` **必传**（官方按位置参数个数校验，省了会被远端拒），读全量传 `{}` |
| `readBytes` | `(sessionId, path, options, signal?)` —— `options` 同样必传；不传 range 读全量 |
| `list` | `(sessionId, path, signal?)` ⇒ `{ path, entries: [{ name, type, size? }], truncated }`；list 一个文件会报 not-directory |
| `stat?` | 可选；宿主过旧没有此方法时降级。只认普通文件，目录会抛 |

类型与工具（`types.ts`）：`WorkspaceFilesFace` / `DirEntry` / `Listing` / `PreviewKind`，
以及 `crumbsOf` / `parentOf` / `joinPath` / `extOf` / `mimeOf` / `previewKindOf`。

## `ExplorerPanel`

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `workspaceFiles` | `WorkspaceFilesFace` | — | 必填，注入的宿主能力 |
| `sessionId` | `string` | — | 必填 |
| `path` | `string` | `''` | 起始路径，`''` = 工作区根 |
| `onSelect` | `(path: string \| null) => void` | — | 选中文件 / 清空选中时回调 |
| `onOpenFile` | `(path: string) => void` | — | 点文件时回调（与 `onSelect` 同时触发） |
| `emptyText` | `string` | 内置「空目录」 | — |
| `translate` | `Translate` | 内置 | — |

提供：面包屑（可点回跳，含上一级 / 刷新）、目录树（目录优先排序 + 显示体积）、
预览区（文本 / 图片 / 不支持兜底）。

```tsx
import { ExplorerPanel } from 'dsh-plugin-core/explorer'

h(ExplorerPanel, {
  workspaceFiles,           // 从 ctx 取出
  sessionId,
  path: '',
  onSelect: (p) => setCurrent(p),
})
```

## `WorkspacePicker` / `FilePicker`

都是 `ui` 的 `Picker` 的薄封装，**数据调用方给**：

| 组件 | 数据参数 | 其余 |
|---|---|---|
| `WorkspacePicker` | `workspaces: readonly string[]` | `value` `defaultValue` `mode` `max` `onChange` `clearable` `searchable` `disabled` `size` `placement` `className` `placeholder` `translate` |
| `FilePicker` | `files: readonly string[]` | 同上 |

工作区列表**组件不自己取**：它是 host 侧 `ctx.workspaceRegistry.list()` 取的，要经插件自己的
HTTP 通道送到 client，那条通道是插件私有的。

## 单文件预览（`dsh-plugin-core/explorer/preview`）

`FilePreview({ workspaceFiles, sessionId, path, translate? })` —— 按扩展名分派：
图片 ⇒ `readBytes` 转 Blob（卸载时 `revokeObjectURL`）；文本类 ⇒ `read` 取正文；
认不出的二进制 ⇒ 明确「暂不支持预览」，不硬撑。

## 已知限制（选型前必读）

- **无代码语法高亮**（不引 `@codemirror/*`），代码文件按纯文本渲染。
- **不支持 PDF / Office 预览**（那要依赖宿主 `officeToPdf`）。
- 目录树**无懒加载 / 虚拟滚动**，超大目录（官方上限 2000 条）会一次渲染完。
- 面包屑超宽时**简单换行**，没有「折叠为当前层名 + 下拉选层」。

## 定制边界

- 宿主能力接口稳定 ⇒ 换宿主版本通常只改插件侧「取出」那一行。
- 要加预览类型：在调用方自己渲染（用 `previewKindOf` 判断），或提需求进本包。
- 不要 fork 面板：内部与 `ui` 的样式域耦合，fork 后跟不上 token 调整。
