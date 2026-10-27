# 20261022-2308-filebrowser-越界呈现修复-list-错误码对齐官方-绘画预览路径栏不-d771：FileBrowser 越界呈现修复 + list 错误码对齐官方（绘画预览路径栏不可点）

- **标签**：缺陷、explorer、FileBrowser、sessionId、错误码
- **状态**：closed · 2026-10-26 09:18:06 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **创建**：2026-10-22 23:08:11 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **封卷**：2026-10-26 09:18:06 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- 头部四行由脚本维护，顺序固定：标签 → 状态 → 创建 → 封卷。
     「- **标签**：…」按 new --tags 插在最上面，没有标签就不写（分类只进台账与历史，不进本文档）；
     「- **封卷**：…」在结案时加在最后。 -->

## 背景

真机现象：绘画预览空间点开 `/workspace/Temp/2026Q4/1022/192924-….md`（用户确认 `/workspace` 就是工作目录、
路径绝对在区内），文件预览正常，但第一排路径栏退化成一条**不可点、无面包屑分隔线**的完整路径。

排查（本轮全部有源码/解包依据，无试探）：
- 该形态 = `crumbBarPlain`（`src/explorer/FileBrowser.ts` 越界分支），由 `outside` state 驱动；
  `outside` 唯一置位来源 = `noteOutside`：`workspaceFiles.list` 返回 failed 且错误码 ∈
  {outside-workspace, not-found, lookup-not-found}。
- 解包 `@deepseek-ai/dsh-api-workspace-files@0.2.1-rc.2` 读 `lib/index.js` 证实：
  ① `list` 的 path 绝对/相对都收（jsDoc:491，`lstat cwd=workspaceRoot`），**目录列举限会话工作区内**
  （`confine` 的 `contains(root, target)`，576-583）；② `read/readBytes` 允许工作区外文件（jsDoc:421/480，
  无 contains）⇒「read 成功、list(父目录) 被拒」是官方设计的不对称；③ `list` 按 **sessionId** 派生
  工作区根（兄弟项目 `dsh-task-dispatch-table/src/host.ts:177` 同结论）。
- ⇒ 根因：调用方只甩绝对路径，默认 sessionId 的工作区根不含它 ⇒ 官方 confinement 拒 ⇒ 误退化。
- 社区对照（用户提供线索后读源码）：`omdsh-dev/DSH-better-sidebar` 文件树**不走**官方 list，走自建
  host 路由 `fs.tree`，且 v0.23.0 起删掉自己的 workspace fence（README 原文警告"不得当作有栅栏的"）
  ⇒ 它的"跨工作区随便逛"是绕开官方 confinement，不代表官方 API 贯通。
- GitHub issue 区搜 `outside-workspace` / `workspaceFiles absolute` 均 0 结果 ⇒ 非已知社区问题。

## 待办

- 真机验收：宿主装本版后，绘画预览场景传 `workspaceAnchors`（宿主 workspaces 快照原样）⇒ 路径栏恢复
  面包屑、目录树可展开、▾ 下拉可切工作区；不传 ⇒ 维持现状 + hint 文案。
- 调用方（绘画预览所在插件）按 `workspaceAnchors` 接线（demo `blocks.tsx` 已是范本）。

## 下一步

等用户真机验收；验收通过后由用户决定是否提交（本会话未授权 commit）。

## 过程

设计讨论（用户逐轮拍板）：
1. 初判"换对 sessionId"被用户否决——调用方手里只有路径，没有"哪个工作区"的概念；
2. 用户定调：**核心库自己判断**（消费方可能传任何绝对路径），路径→工作区→会话的解析收敛到核心；
3. 用户确认匹配思路：工作区列表拿出来前缀匹配，命中取其会话；该工作区没会话就没办法；
4. 读兄弟项目 `dsh-task-dispatch-table` 后修正认知：它"每个文件都能弹"是靠**数据层配套**
   （`GET /options` 下发 `Record<title, 会话id>`；`previewTargetOf` 逐文件算锚点；
   `onOpenFile(anchorSessionId, path)` 双参配套），不是随便一个 session；
5. 用户拍板产品边界：**切工作区是预览文档（openFilePreview）自己的事**，picker 不掺和 ⇒
   核心内置接管（调用方传 workspaceAnchors 且没自接 onSelectWorkspace 时）。

落地（第一轮）：
- `src/explorer/types.ts`：`WorkspaceAnchorItem` 加 `path?`；新增纯函数 `workspaceAnchorForPath`
  （最长前缀赢、尾斜杠归一、取 `sessionIds` 最后一个=追加序最近、相对路径不匹配）；
  `errView` 移除 `lookup-not-found`（官方 0.2.1-rc.2 无此码，来源为初版 commit eca3f25）。
- `src/explorer/FileBrowser.ts`：props 加 `workspaceAnchors`；`listSessionId`（useMemo）解析后
  **5 处 list 调用点全部换用**（fetchDir / ensureRootLearned / 初始 effect×2 / toggleDir），
  匹配不到回落 `props.sessionId`；`noteOutside` 移除 lookup-not-found；`crumbBarPlain` 加
  `dshpc-fb__bar-hint`（i18n key `explorerOutsideHint`，中英）。
- `src/explorer/open.ts`：`OpenFilePreviewOptions.workspaceAnchors` 透传。
- `src/utils/i18n.ts` + `src/explorer/explorer.css`：新 key + hint 样式（`--dshpc-fg-3` 不存在回落 fg-2）。
- `test/explorer.test.mjs`：删 lookup-not-found 断言；新增 `workspaceAnchorForPath` 单测
  （最长前缀/尾斜杠/目录边界/相对路径/无会话/无 path/空清单）。
- demo：`blocks.tsx` `useExplorerHost` 暴露 `workspaceAnchors`（workspaces 快照原样）并透传；
  `CODE_OPEN` 示例补说明。
- 文档：`docs/design/external/dsh-host.md` §12 记录官方 list/read 路径语义、越界判定、错误码全集、
  better-sidebar 对照、本仓处置（写入时误删 §11.1 来源两行，已恢复）。

落地（第二轮：内置切工作区）：
- `src/explorer/types.ts`：新增 `anchorSessionForTitle`（按 title 取该工作区最近会话，
  与路径匹配互补——调用方有 title 归属时用它，无歧义）。
- `src/explorer/open.ts`：新增内部组件 `PreviewBody`——`openFilePreview` 在「调用方没自接
  onSelectWorkspace 且传了 workspaceAnchors」时启用：▾ 下拉只列有会话的工作区；点选 ⇒
  换该工作区锚点会话 + key 重挂载 + path 回根（机制同兄弟项目
  `task-editor.tsx:2496-2508`：list 的根来自 sessionId，必须换会话+重挂载，只换 rootName 等于没切）。
  无会话的工作区不进列表、点了不切（不给假入口）。
- `docs/design/features/explorer.doc.ts`：接入示例补 workspaceAnchors + 内置切工作区说明。
- demo 零改动即获得切换能力（已传 workspaceAnchors、未传 onSelectWorkspace ⇒ 自动接管）。

验证：`pnpm run build` ✓；`node --test test/*.test.mjs` **98/98** ✓（含两个新单测）；
`pnpm run typecheck` ✓；`pnpm run build:demo` ✓。

## 结论

- 不是判断逻辑写错码，是**官方 API 不对称 + 调用方只给路径不给工作区**：read 允许区外文件、
  list 限区内目录、list 按 sessionId 派生根。三方事实叠加才有该现象。
- 根治落在核心库，且**不绑架调用方**（用户 2026-10-22 拍板：底座是第三方工具，调用方可能只甩
  一个路径；sessionId 口子保留，能传就传，不传/传错核心自己匹配）：
  工作区清单来源 = `props.workspaceAnchors`（可选覆盖）> **workspaceList 快照**
  （`connectHost` 一次性注入的宿主 `workspaces` 服务镜像，官方 `WorkspaceView` 自带
  path + sessionIds）> 都没有 ⇒ 回落 `props.sessionId`。调用方零传参即生效。
- `workspaceAnchorForPath`（最长前缀）+ `anchorSessionForTitle`（title→最近会话）两个纯函数；
  FileBrowser 5 处 list 全走解析后的 sessionId；`openFilePreview` 的 PreviewBody 内置切工作区
  （anchors 驱动、换会话 + key 重挂载 + 回根、无会话不进列表）；快照异步到达时经
  listSessionId 依赖自愈重跑。
- 遗留坑（有意不扩张）：① 只解析入口 path 一次，不跟踪 dir 切换（跨工作区跳转走 ▾ 下拉）；
  ② 前缀匹配字面大小写，Windows 跨形态归一归调用方；③ 内置兜底依赖插件 apply 调过
  `connectHost(ctx)`（一次性接线，demo 已示范）；没接过 ⇒ 回落 props.sessionId + hint 说破。
- 外部修复项（不属本仓）：绘画预览调用方确认已 `connectHost` 接线 + 传绝对路径即可，
  无需其他改动。

### 第四轮：面包屑没跟着匹配（真机截图复现，用户 2026-10-22）

现象：list 匹配生效（目录/预览正常）但面包屑显示 `C.dsh-plugin-core > workspace > Temp > …`
全绝对层级、根段是"默认文件夹"、▾ 下拉把当前路径当路径段树而非"当前工作区"。

根因：只换了 list 的 sessionId，**学根/相对化全家还在按调用方 `props.sessionId`**
（`rootCache.get/learnRoot/relativizeToRoot/stat/findAnyFileAbs/absolutizeDir`），学出的根是
别的会话的根 ⇒ 相对化失败 ⇒ 露出工作区外层级；且 rootLabel 走调用方写死的 `props.rootName`。

修正（`src/explorer/FileBrowser.ts`）：`anchorMatch`（路径匹配结果，含 title）统一驱动——
list / rootCache 键 / learnRoot / stat / absolutizeDir / 相对化 / copyPath / onPick / FilePreview
**全部换 `listSessionId`**；根标签优先级改为 **匹配出的工作区名 > props.rootName > 学根末段**。
效果：面包屑 = `[匹配到的工作区] > [区内相对层级]`，工作区之外的段一律不出现；匹配不到 ⇒
回落 props.sessionId（学根与 list 同键，仍能相对化）或越界只读态。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-22 23:08:11 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 创建任务（doing）
- 2026-10-22 23:23:04 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 落码完成：workspaceAnchorForPath 纯函数+单测、FileBrowser 五处 list 换解析 sessionId、crumbBarPlain hint、移除 lookup-not-found、demo 接线、dsh-host.md §12；build/test 97 过/typecheck/build:demo 全绿
- 2026-10-22 23:46:22 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 第二轮：openFilePreview 内置切工作区（PreviewBody：anchors 驱动、换会话+key 重挂载+回根、无会话不进列表）；anchorSessionForTitle 纯函数+单测；explorer.doc.ts 示例；98/98、typecheck、build:demo 全绿
- 2026-10-22 23:55:28 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 第三轮（用户拍板：底座不甩锅调用方）：FileBrowser/PreviewBody 兜底自动读 workspaceList 快照（connectHost 注入），零传参即匹配+可切；HostWorkspaceItem 加 path；demo 改零传参示范；98/98、typecheck、build:demo 全绿
- 2026-10-23 00:04:22 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 第四轮（真机截图）：匹配生效但学根/相对化仍按 props.sessionId ⇒ 面包屑露区外层；anchorMatch 统一驱动全部会话键（list/rootCache/learnRoot/stat/absolutizeDir/相对化/copyPath/onPick/FilePreview），根标签优先匹配工作区名；98/98、typecheck、build:demo 全绿
- 2026-10-23 00:16:32 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · session 样式防护（真机截图：多变 deliverables 卡时左下角变更卡竖排变形）：changes 卡加 align-self:flex-start+flex:none、stat nowrap、endinfo 改 margin-left:auto；根因待 DOM 取证
- 2026-10-23 00:18:41 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 回退未经同意的越界 hint：删 FileBrowser crumbBarPlain hint span + explorerOutsideHint 中英 key + bar-hint CSS（源码与产物均已清零，死 key 自检过）
- 2026-10-23 00:24:48 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · session 变更卡结构对齐官方（解包 ui-deliverables 0.2.1-rc.2 核实）：从 tail 之后挪进 tailSlot、置于网格之前（官方 Fragment>[ChangedFiles, 网格]）；全绿待真机验收
- 2026-10-23 00:47:16 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · session 变更卡补官方完整结构（0.2.1-rc.2 解包）：多文件 = header + 文件行列表（路径+每文件 +N -M 常显上色）+ COLLAPSED_ROWS=4 折叠 toggle；header 60px/tile 40×40/hover 换显预览提示；新增 changesAll/changesCollapse 文案；98/98、typecheck、build:demo 全绿
- 2026-10-26 16:55:46 · release · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 释放回公共池
- 2026-10-26 17:17:41 · claim · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 认领 → doing
- 2026-10-26 17:18:06 · close · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 结案封卷
