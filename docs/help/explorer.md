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

落点只给一个：页面里**包住主区**的那个（核心会补成 flex 行、让主区伸展，关闭时还原）。给元素或选择器（`'#page-row'`）都行，消费方不必存 ref；selector 解析不到就放弃本次打开（不会回落 body）。不要传 `document.body` 再自己套 fixed——那是浮层，不是分栏。

> EN: Give exactly one mount: the element wrapping the main area (core makes it a flex row and lets the main area stretch, restoring it on close). Either an element or a selector (`'#page-row'`) works, so no ref bookkeeping is needed; an unresolvable selector abandons the open (never falls back to `body`). Never pass `document.body` with your own fixed positioning — that is an overlay, not a split.

**关钮可退让**（2026-11-04 用户拍板）：dock 默认不在面板层画关钮 —— 文件模式用 `FileBrowser` 面包屑行尾那枚，`content` 模式由你给的内容自己画（无头面板画不画、画在哪，归调用方）；不想自己画就传 `opts.closeButton: 'floating'`。Esc 始终有效。`content` 与 `path` 二选一，同传时忽略 `path` 并 warn。

> EN: **The close button yields to the caller** (2026-11-04): by default the dock draws none at panel level — file mode uses the one at the end of the breadcrumb row, `content` mode draws its own (on a headerless panel that is the caller’s call); pass `opts.closeButton: 'floating'` if you would rather have the dock draw it. Esc always works. `content` and `path` are mutually exclusive — passing both ignores `path` with a warning.

面包屑口径不变：路径所属工作区名作根名，其下按相对层级展开。▾ 下拉**根层置顶**（其余仍列各工作区）：POSIX 是一条「根目录」，**Windows 没有根目录这东西，列的是盘符**（`C:/`、`D:/`…，由宿主 `op:roots` 探出来）。点其他工作区 = 直接列该区根目录（不需要会话）。

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
import { connectFs, openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/adv/explorer'
import { serveFsRoute } from 'dsh-plugin-core/host'
import { FS_PATH } from './paths'   // 你自己的常量：宿主与 client 必须用同一个

// ── 宿主半边（apply）：挂一条只读文件路由（不限工作区；读文件/列目录都在它上面） ──
serveFsRoute(ctx, { path: FS_PATH })

// ── client 半边（apply）：接一次（connectHost 照旧负责工作区快照） ──
connectHost(ctx)
connectFs({ path: FS_PATH })

// 右侧分栏预览（占宽度、挤窄主区）：一个落点 + 一个路径就够
openFilePreview({ mount: pageRowEl, path: '/abs/ledger' })      // 文件夹 ⇒ 目录树；文件 ⇒ 直接预览
openFilePreview({ mount: '#page-row', path: 'docs/README.md' })  // 落点也可以给选择器；相对路径也收（相对谁见下）
openFilePreview({ mount: '#page-row' })                          // 不给路径 ⇒ 根节点（工作区清单 + 盘符）

// 锚定弹窗选文件（Promise 返回**绝对路径**，不自己挂 dock）
const r = await pickWorkspaceFile({ anchor, filter: { exts: ['md'] } })
const dir = await pickWorkspaceFile({ anchor, filter: { dirs: true } })  // 只选文件夹

// 展开方位：默认 auto（下方优先、不够翻上方）；按钮贴着定宽区右边界时改向左展开
await pickWorkspaceFile({ anchor, placement: 'bottom-end' })   // 下方、右缘对齐
await pickWorkspaceFile({ anchor, placement: 'left-start' })   // 左侧、顶边齐平
```

## API

> EN: API

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `openFilePreview(opts)` | `OpenFilePreviewOptions => FilePreviewHandle` | — | — | 在右侧分栏打开文件 / 文件夹预览，返回可关闭它的句柄。预览内容二选一：`path`（核心解析并渲染）或 `content`（由调用方给内容）。面板**默认不画关钮**：文件模式用面包屑行尾那枚，`content` 模式由内容自己画；不想自己画就传 `opts.closeButton` | Opens a file/folder preview in the right-side dock and returns a handle to close it. Body is one of two: `path` (resolved and rendered by core) or `content` (rendered from your own node). The panel draws **no close button by default**: file mode uses the one at the end of the breadcrumb row, `content` mode draws its own — pass `opts.closeButton` if you would rather have the dock draw it |
| `opts.mount` | `HTMLElement \| string` | 是 | — | 页面里**包住主区**的那个元素，或指向它的选择器（`'#page-row'`）；不必自己写 flex（核心补成 flex 行并让主区伸展，关闭时还原）。选择器解析不到 ⇒ 返回 `null` 并 warn，不回落 body。不要传 `document.body` | The element wrapping the main area, or a selector pointing at it (`'#page-row'`); no flex needed (core turns it into a flex row, stretches the main area, and restores it on close). An unresolvable selector ⇒ `null` + a warning, never a `body` fallback. Never `document.body` |
| `opts.sessionId` | `string` | — | — | **只在两种情况下需要**：① 相对路径的基准工作区；② Office 预览（转 PDF 要一条有效会话，缺省由核心取最近有会话的工作区） | Needed in exactly two cases: (1) the base workspace for a relative path; (2) Office preview (conversion needs one valid session; core falls back to the most recent workspace with one) |
| `opts.path` | `string` | — | — | 绝对路径或工作区相对路径（相对路径要有可解析的基准，否则返回 `null` 并 warn）；不传 ⇒ 根节点。与 `content` 二选一 | Absolute or workspace-relative (a relative one needs a resolvable base, else `null` + a warning); omitted ⇒ the root node. Mutually exclusive with `content` |
| `opts.line` | `number` | — | — | 打开后定位到这一行（1 起；只对文本 / 源码态生效）。首屏没读到就自动续翻，最多 10 页；`content` 模式忽略。会话预览的 read 工具卡会把 `offset` 作为这一行传进来 | Scroll to this line after opening (1-based; text/source view only). Auto-pages up to 10 pages when the line is beyond the first chunk; ignored in `content` mode. The session mirror passes a read tool’s `offset` here |
| `opts.content` | `() => ReactNode` | — | — | 自定义预览内容，塞进同一个右侧 dock；平时优先用领域入口（如 `openSessionReview`）。面板默认不出关钮 ⇒ 内容自己画 ✕（或用 `opts.closeButton` 让 dock 画）；与 `path` 二选一 | Custom preview body rendered in the same dock; prefer a domain entry such as `openSessionReview` when one exists. No panel close button by default ⇒ the content draws its own ✕ (or use `opts.closeButton`); mutually exclusive with `path` |
| `opts.closeButton` | `'auto' \| 'header' \| 'floating' \| 'none'` | — | 'none' | 面板关钮位置。默认 `none` = 不在面板层画（文件模式用面包屑行尾、`content` 模式由内容画）；传 `floating` 让壳在右上角出一枚（占 28px，内容右上要让位） | Panel close-button placement. Default `none` = draw none at panel level (file mode uses the breadcrumb row, `content` mode draws its own); pass `floating` to have the dock put one at the top-right (occupies 28px — headerless content must leave room) |
| `opts.officeToPdf` | `OfficeToPdfFace` | — | — | Office 转 PDF 能力；缺失则该格式走「不支持」而不是报错 | Office→PDF capability; without it that format shows "unsupported" instead of erroring |
| `opts.rootName` | `string` | — | — | 兜底显示名（路径匹配不出工作区时用） | Fallback display name, used when no workspace matches the path |
| `pickWorkspaceFile(opts)` | `PickWorkspaceFileOptions => Promise<PickedPath \| null>` | — | — | 锚定按钮弹出模态选文件，解析出 `{ path, isDir, workspaceRel?, workspace? }`；`path` 是**绝对路径** | Anchored modal picker resolving `{ path, isDir, workspaceRel?, workspace? }`; `path` is **absolute** |
| `opts.anchor` | `HTMLElement` | 是 | — | 模态贴着它弹 | The modal anchors next to it |
| `opts.filter` | `PickFilter` | — | — | `exts` 只要这些扩展名（目录仍可展开导航）；`dirs: true` 只允许选文件夹（文件不渲染） | `exts` limits files (folders still expand); `dirs: true` picks folders only (files hidden, plus a “Select this folder” action in the crumb bar) |
| `opts.placement` | `PickPlacement` | — | 'auto' | 展开方位八档：`bottom-start` / `bottom-end`（下方，左缘 / 右缘对齐）、`top-start` / `top-end`（上方）、`right-start` / `right-end`（右侧，顶边 / 底边齐平）、`left-start` / `left-end`（左侧）；`auto` = 旧行为（下方优先、下方不够翻上方、横向夹紧）。方位是**优先**：该侧放得下就照它；放不下而对侧够 ⇒ **自动翻边**（bottom↔top、left↔right，对齐轴不变）；两侧都不够才夹紧进视口——按钮贴着定宽区右边界时用 `bottom-end` / `left-start` | Expansion side, eight values: `bottom-start` / `bottom-end` (below, left / right edge aligned), `top-start` / `top-end` (above), `right-start` / `right-end` (right of the trigger, top / bottom edge aligned), `left-start` / `left-end` (left of the trigger); `auto` = old behaviour (below first, flip above when short, clamp horizontally). The side is a **preference**: used when it fits; if it does not fit but the opposite side does, the panel **flips** (bottom↔top, left↔right, same start/end alignment); only when neither fits is it clamped into the viewport — use `bottom-end` / `left-start` when the trigger sits at the right edge of a fixed-width area |
