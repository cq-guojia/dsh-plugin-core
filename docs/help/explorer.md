<!-- 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改；改对应的 .doc.ts 后重跑 node scripts/gen-docs.mjs -->

# explorer —— 工作区浏览

> EN: explorer — Workspace browsing

导出：openFilePreview、pickWorkspaceFile、FileBrowser、FilePreview

## 概览

> EN: Overview

提供文件浏览与选择；数据走宿主侧只读 FS 路由，**不限工作区**（工作区之外也能浏览）。界面与原版一致。

> EN: File browsing and picking **not limited to workspaces**: one root tree (workspace nodes + the real root), served by a host-side read-only FS route.

**接线归核心，但要两条**：宿主 `apply` 调 `serveFsRoute({ path })`，client `apply` 用同一个常量调 `connectFs({ path })`（`connectHost(ctx)` 照旧负责工作区快照）。浏览**不需要会话**。

> EN: **Core does the wiring, but with two calls**: `serveFsRoute({ path })` on the host side and `connectFs({ path })` with the same constant on the client side (`connectHost(ctx)` still covers the workspace snapshot). Browsing needs **no session**.

落点只给一个元素：页面里**包住主区**的那个（核心会补成 flex 行、让主区伸展，关闭时还原），不要传 `document.body` 再自己套 fixed——那是浮层，不是分栏。

> EN: Pass one element: the one wrapping the main area. Core makes it a flex row and lets the main area stretch, restoring it on close. Never pass `document.body` with your own fixed positioning — that is an overlay, not a split.

面包屑口径不变：路径所属工作区名作根名，其下按相对层级展开。▾ 下拉**新增一行「根目录」置顶**（其余仍列各工作区）；点其他工作区 = 直接列该区根目录（不需要会话）。

> EN: Inside a workspace the breadcrumb starts at its name and the ▾ menu nests it there; outside it starts at the real root (`/` or a drive). A workspace root still appears in the real path, tagged “Workspace”.

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
import { connectFs, openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'
import { serveFsRoute } from 'dsh-plugin-core/host'
import { FS_PATH } from './paths'   // 你自己的常量：宿主与 client 必须用同一个

// ── 宿主半边（apply）：挂一条只读文件路由（不限工作区；读文件/列目录都在它上面） ──
serveFsRoute(ctx, { path: FS_PATH })

// ── client 半边（apply）：接一次（connectHost 照旧负责工作区快照） ──
connectHost(ctx)
connectFs({ path: FS_PATH })

// 右侧分栏预览（占宽度、挤窄主区）：一个容器 + 一个路径就够
openFilePreview({ mount, path: '/abs/ledger' })    // 文件夹 ⇒ 目录树；文件 ⇒ 直接预览
openFilePreview({ mount, path: 'docs/README.md' }) // 工作区相对路径也行（相对谁见下）
openFilePreview({ mount })                         // 不给路径 ⇒ 根节点（工作区清单 + 盘符）

// 锚定弹窗选文件（Promise 返回**绝对路径**，不自己挂 dock）
const r = await pickWorkspaceFile({ anchor, filter: { exts: ['md'] } })
const dir = await pickWorkspaceFile({ anchor, filter: { dirs: true } })  // 只选文件夹
```

## API

> EN: API

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `openFilePreview(opts)` | `OpenFilePreviewOptions => FilePreviewHandle` | — | — | 在右侧分栏打开文件 / 文件夹预览，返回可关闭它的句柄。预览内容二选一：`path`（核心解析并渲染）或 `content`（由调用方给内容） | Opens a file/folder preview in the right-side dock and returns a handle to close it. Body is one of two: `path` (resolved and rendered by core) or `content` (rendered from your own node) |
| `opts.mount` | `HTMLElement` | 是 | — | 页面里**包住主区**的那个元素；不必自己写 flex（核心补成 flex 行并让主区伸展，关闭时还原）。不要传 `document.body` | The element wrapping the main area; no flex needed (core turns it into a flex row, stretches the main area, and restores it on close). Never `document.body` |
| `opts.sessionId` | `string` | — | — | **只在两种情况下需要**：① 相对路径的基准工作区；② Office 预览（转 PDF 要一条有效会话，缺省由核心取最近有会话的工作区） | Needed in exactly two cases: (1) the base workspace for a relative path; (2) Office preview (conversion needs one valid session; core falls back to the most recent workspace with one) |
| `opts.path` | `string` | — | — | 绝对路径或工作区相对路径（相对路径要有可解析的基准，否则返回 `null` 并 warn）；不传 ⇒ 根节点。与 `content` 二选一 | Absolute or workspace-relative (a relative one needs a resolvable base, else `null` + a warning); omitted ⇒ the root node. Mutually exclusive with `content` |
| `opts.content` | `() => ReactNode` | — | — | 自定义预览内容，塞进同一个右侧 dock；传它时不需要 `path` | Custom preview body rendered in the same dock; no `path` needed when set |
| `opts.officeToPdf` | `OfficeToPdfFace` | — | — | Office 转 PDF 能力；缺失则该格式走「不支持」而不是报错 | Office→PDF capability; without it that format shows "unsupported" instead of erroring |
| `opts.rootName` | `string` | — | — | 兜底显示名（路径匹配不出工作区时用） | Fallback display name, used when no workspace matches the path |
| `pickWorkspaceFile(opts)` | `PickWorkspaceFileOptions => Promise<PickedPath \| null>` | — | — | 锚定按钮弹出模态选文件，解析出 `{ path, isDir, workspaceRel?, workspace? }`；`path` 是**绝对路径** | Anchored modal picker resolving `{ path, isDir, workspaceRel?, workspace? }`; `path` is **absolute** |
| `opts.anchor` | `HTMLElement` | 是 | — | 模态贴着它弹 | The modal anchors next to it |
| `opts.filter` | `PickFilter` | — | — | `exts` 只要这些扩展名（目录仍可展开导航）；`dirs: true` 只允许选文件夹（文件不渲染） | `exts` limits files (folders still expand); `dirs: true` picks folders only (files hidden, plus a “Select this folder” action in the crumb bar) |
