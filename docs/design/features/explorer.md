<!-- 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改；改对应的 .doc.ts 后重跑 node scripts/gen-docs.mjs -->

# explorer —— 工作区浏览

> EN: explorer — Workspace browsing

导出：openFilePreview、pickWorkspaceFile、FileBrowser、FilePreview

## 概览

> EN: Overview

提供工作区文件浏览与选择，数据来自宿主提供的工作区文件快照。

> EN: Workspace file browsing and picking, driven by the host-provided workspace file snapshot.

浏览态停靠是布局成员（占宽度、挤窄主区），不要挂 `document.body` 再自己套 fixed。

> EN: The browse dock is a layout member (takes width, narrows the main area); never mount it on `document.body` with your own fixed positioning.

## 0. 装包

> EN: 0. Install

```bash id="explorer-install-code"
pnpm add dsh-plugin-core
```

## 1. 接入示例

> EN: 1. Usage

从 ctx 取出工作区快照再传给能力接口，不要传整个 ctx。

> EN: Pull the workspace snapshot out of ctx and hand it to the capability APIs; do not pass the whole ctx.

```tsx id="explorer-usage-code"
import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'

// 右侧分栏预览（占宽度、挤窄主区）
openFilePreview({ mount, workspaceFiles, officeToPdf, sessionId, path, rootName })

// path 传绝对路径时：按最长前缀匹配所属工作区，面包屑 / 目录树与 ▾「切工作区」自动可用
openFilePreview({ mount, workspaceFiles, sessionId, path: '/abs/path.md' })
// 要覆盖宿主快照才显式传 workspaceAnchors（带 path + sessionIds）
openFilePreview({ mount, workspaceFiles, sessionId, path: '/abs/path.md', workspaceAnchors })

// 锚定弹窗选文件（Promise 返回路径，不自己挂 dock）
const r = await pickWorkspaceFile({ workspaceFiles, sessionId, anchor, rootName })
```

## API

> EN: API

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `openFilePreview(opts)` | `OpenFilePreviewOptions => FilePreviewHandle` | — | — | 在右侧分栏打开文件 / 文件夹预览，返回可关闭它的句柄。预览内容二选一：`path`（核心解析并渲染）或 `content`（由调用方给内容） | Opens a file/folder preview in the right-side dock and returns a handle to close it. Body is one of two: `path` (resolved and rendered by core) or `content` (rendered from your own node) |
| `opts.mount` | `HTMLElement` | 是 | — | 页面里的 flex 行；预览靠它占宽而不是浮在页面上方 | The page’s flex row; the preview takes width there instead of floating |
| `opts.workspaceFiles` | `WorkspaceFilesFace` | — | — | 从 ctx 取出的工作区文件服务；传 `content` 时可省 | Workspace file service taken from ctx; optional when passing `content` |
| `opts.sessionId` | `string` | — | — | 该工作区的真实会话 id（服务是会话作用域的）；传 `content` 时可省 | A real session id of that workspace (the service is session-scoped); optional when passing `content` |
| `opts.path` | `string` | — | — | 工作区相对路径；绝对路径会自动按最长前缀匹配所属工作区。与 `content` 二选一 | Workspace-relative path; absolute paths are matched to their workspace by longest prefix. Mutually exclusive with `content` |
| `opts.content` | `() => ReactNode` | — | — | 自定义预览内容，塞进同一个右侧 dock；传它时不需要 `path` | Custom preview body rendered in the same dock; no `path` needed when set |
| `opts.officeToPdf` | `OfficeToPdfFace` | — | — | Office 转 PDF 能力；缺失则该格式走「不支持」而不是报错 | Office→PDF capability; without it that format shows "unsupported" instead of erroring |
| `opts.rootName` | `string` | — | — | 兜底显示名（路径匹配不出工作区时用） | Fallback display name, used when no workspace matches the path |
| `pickWorkspaceFile(opts)` | `PickWorkspaceFileOptions => Promise<PickedFile>` | — | — | 锚定按钮弹出模态选文件，解析出 `{ path, isDir }` | Anchored modal picker that resolves `{ path, isDir }` |
| `opts.anchor` | `HTMLElement` | 是 | — | 模态贴着它弹 | The modal anchors next to it |
| `opts.filter` | `PickFilter` | — | — | 按扩展名过滤 `{ exts: ['md'] }`；`dirs: true` 则只允许选文件夹 | Filter by extension `{ exts: ['md'] }`; `dirs: true` restricts picking to folders |
