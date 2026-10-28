<!-- 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改；改对应的 .doc.ts 后重跑 node scripts/gen-docs.mjs -->

# explorer —— 工作区浏览

> EN: explorer — Workspace browsing

导出：openFilePreview、pickWorkspaceFile、FileBrowser、FilePreview

## 概览

> EN: Overview

提供工作区文件浏览与选择，数据来自宿主提供的工作区文件快照。

> EN: Workspace file browsing and picking, driven by the host-provided workspace file snapshot.

**接线归核心**：client `apply` 里调一次 `connectHost(ctx)`，读文件服务、会话 id、工作区快照都由核心自己解，调用时只给容器和路径。

> EN: **Wiring belongs to core**: call `connectHost(ctx)` once in the client apply; the file service, session id and workspace snapshot are resolved by core — you only pass a container and a path.

落点只给一个元素：页面里**包住主区**的那个（核心会补成 flex 行、让主区伸展，关闭时还原），不要传 `document.body` 再自己套 fixed——那是浮层，不是分栏。

> EN: Pass one element: the one wrapping the main area. Core makes it a flex row and lets the main area stretch, restoring it on close. Never pass `document.body` with your own fixed positioning — that is an overlay, not a split.

绝对路径按最长前缀匹配所属工作区；落在任何工作区外时，文件照样能预览（官方 read 允许工作区外文件），只有目录树退化成只读路径栏。

> EN: Absolute paths are matched to their workspace by longest prefix. Outside every workspace the file still previews (official read allows it); only the directory tree degrades to a read-only path bar.

## 0. 装包

> EN: 0. Install

```bash id="explorer-install-code"
pnpm add dsh-plugin-core
```

## 1. 接入示例

> EN: 1. Usage

`connectHost(ctx)` 只收这一小块，不把整个 ctx 传进核心。

> EN: `connectHost(ctx)` takes just that one slice; the whole ctx never enters core.

```tsx id="explorer-usage-code"
import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'

// 只在 client apply 里接线一次（接工作区快照 + 读文件服务），之后不用再碰服务
connectHost(ctx)

// 右侧分栏预览（占宽度、挤窄主区）：一个容器 + 一个路径就够
openFilePreview({ mount, path: '/abs/ledger' })   // 文件夹 ⇒ 目录树；文件 ⇒ 直接预览
openFilePreview({ mount, path: 'docs/README.md' }) // 工作区相对路径也行

// 覆盖项：指定工作区快照 / 指定会话 / Office 转 PDF / 与别处共用的根缓存
openFilePreview({ mount, path, workspaceAnchors, sessionId, officeToPdf, rootCache })

// 锚定弹窗选文件（Promise 返回路径，不自己挂 dock）
const r = await pickWorkspaceFile({ anchor, filter: { exts: ['md'] } })
```

## API

> EN: API

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `openFilePreview(opts)` | `OpenFilePreviewOptions => FilePreviewHandle` | — | — | 在右侧分栏打开文件 / 文件夹预览，返回可关闭它的句柄。预览内容二选一：`path`（核心解析并渲染）或 `content`（由调用方给内容） | Opens a file/folder preview in the right-side dock and returns a handle to close it. Body is one of two: `path` (resolved and rendered by core) or `content` (rendered from your own node) |
| `opts.mount` | `HTMLElement` | 是 | — | 页面里**包住主区**的那个元素；不必自己写 flex（核心补成 flex 行并让主区伸展，关闭时还原）。不要传 `document.body` | The element wrapping the main area; no flex needed (core turns it into a flex row, stretches the main area, and restores it on close). Never `document.body` |
| `opts.workspaceFiles` | `WorkspaceFilesFace` | — | — | 读文件服务。**一般不用传**：`connectHost(ctx)` 接线后核心自己持有；传了以传入为准。传 `content` 时可省 | File service. **Usually unnecessary**: core holds it after `connectHost(ctx)`; when passed it wins. Optional when passing `content` |
| `opts.sessionId` | `string` | — | — | 该工作区的真实会话 id。**一般不用传**：按路径匹配所属工作区，匹配不出就取最近有会话的工作区；传 `content` 时可省 | A real session id. **Usually unnecessary**: resolved from the path’s workspace, else the most recently updated workspace with a session; optional when passing `content` |
| `opts.path` | `string` | — | — | 工作区相对路径；绝对路径会自动按最长前缀匹配所属工作区。与 `content` 二选一 | Workspace-relative path; absolute paths are matched to their workspace by longest prefix. Mutually exclusive with `content` |
| `opts.content` | `() => ReactNode` | — | — | 自定义预览内容，塞进同一个右侧 dock；传它时不需要 `path` | Custom preview body rendered in the same dock; no `path` needed when set |
| `opts.officeToPdf` | `OfficeToPdfFace` | — | — | Office 转 PDF 能力；缺失则该格式走「不支持」而不是报错 | Office→PDF capability; without it that format shows "unsupported" instead of erroring |
| `opts.rootName` | `string` | — | — | 兜底显示名（路径匹配不出工作区时用） | Fallback display name, used when no workspace matches the path |
| `pickWorkspaceFile(opts)` | `PickWorkspaceFileOptions => Promise<PickedFile>` | — | — | 锚定按钮弹出模态选文件，解析出 `{ path, isDir }` | Anchored modal picker that resolves `{ path, isDir }` |
| `opts.anchor` | `HTMLElement` | 是 | — | 模态贴着它弹 | The modal anchors next to it |
| `opts.filter` | `PickFilter` | — | — | 按扩展名过滤 `{ exts: ['md'] }`；`dirs: true` 则只允许选文件夹 | Filter by extension `{ exts: ['md'] }`; `dirs: true` restricts picking to folders |
