<!-- 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改；改对应的 .doc.ts 后重跑 node scripts/gen-docs.mjs -->

# explorer —— 工作区浏览

> EN: explorer — Workspace browsing

导出：openFilePreview、pickWorkspaceFile、WorkspacePicker

## 概览

> EN: Overview

explorer 提供工作区文件浏览与选择能力，依赖宿主提供的工作区文件快照。

> EN: explorer provides workspace file browsing and picking, driven by the host-provided workspace file snapshot.

浏览态停靠是布局成员（占宽度、把主区挤窄），不要挂在 document.body 上自己套 fixed。

> EN: The browse dock is a layout member (takes width, narrows the main area); do not mount it on document.body with your own fixed positioning.

## 0. 装包

> EN: 0. Install

```bash id="explorer-install-code"
pnpm add dsh-plugin-core
```

## 1. 接入示例

> EN: 1. Usage

从 ctx 取出工作区快照，传给能力接口；不要传整个 ctx。

> EN: Pull the workspace snapshot out of ctx and pass it to the capability APIs; do not pass the whole ctx.

```tsx id="explorer-usage-code"
import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'
import { SessionPreview } from 'dsh-plugin-core/session'

// 右侧分栏预览（占宽度、挤窄主区）
openFilePreview({ mount, workspaceFiles, officeToPdf, sessionId, path, rootName })

// 锚定弹窗选文件（Promise 返回路径，不自己挂 dock）
const r = await pickWorkspaceFile({ workspaceFiles, sessionId, anchor, rootName })

// 会话预览
<SessionPreview sessionId="..." source={source} variant="modal" />
```

## API

> EN: API

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `openFilePreview` | `({ mount, workspaceFiles, sessionId, path, rootName, officeToPdf? }) => PreviewHandle` | — | 右侧分栏预览文件/文件夹，mount 为必填的 flex 行 | Preview a file/folder in a right-side dock; mount is the required flex row |
| `pickWorkspaceFile` | `({ workspaceFiles, sessionId, anchor, filter? }) => Promise<{ path, isDir }>` | — | 锚定按钮旁弹模态选文件，Promise 返回工作区相对路径 | Open a modal anchored to a button and resolve with the workspace-relative path |
