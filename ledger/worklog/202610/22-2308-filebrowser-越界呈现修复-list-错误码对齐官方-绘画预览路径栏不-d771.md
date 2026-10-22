# 20261022-2308-filebrowser-越界呈现修复-list-错误码对齐官方-绘画预览路径栏不-d771：FileBrowser 越界呈现修复 + list 错误码对齐官方（绘画预览路径栏不可点）

> **创建**：2026-10-22 23:08:11（@GuoJia-Agent）
> **分类**：缺陷 ｜ **标签**：explorer、FileBrowser、sessionId、错误码

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

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
  面包屑、目录树可展开；不传 ⇒ 维持现状 + hint 文案。
- 调用方（绘画预览所在插件）按 `workspaceAnchors` 接线（demo `blocks.tsx` 已是范本）。

## 下一步

等用户真机验收；验收通过后由用户决定是否提交（本会话未授权 commit）。

## 过程

设计讨论（用户逐轮拍板）：
1. 初判"换对 sessionId"被用户否决——调用方手里只有路径，没有"哪个工作区"的概念；
2. 用户定调：**核心库自己判断**（消费方可能传任何绝对路径），路径→工作区→会话的解析收敛到核心；
3. 用户确认匹配思路：工作区列表拿出来前缀匹配，命中取其会话；该工作区没会话就没办法。

落地：
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

验证：`pnpm run build` ✓；`node --test test/*.test.mjs` 97/97 ✓（含新测试）；
`pnpm run typecheck` ✓；`pnpm run build:demo` ✓。

## 结论

- 不是判断逻辑写错码，是**官方 API 不对称 + 调用方只给路径不给工作区**：read 允许区外文件、
  list 限区内目录、list 按 sessionId 派生根。三方事实叠加才有该现象。
- 根治落在核心库：`workspaceAnchorForPath` + `workspaceAnchors` prop，路径→工作区→会话解析对
  **所有调用方**生效，不绑架调用方先算 sessionId；匹配不到不劣化（回落 + hint 说破）。
- 遗留坑（有意不扩张）：① 只解析入口 path 一次，不跟踪 dir 切换（跨工作区跳转走调用方
  onSelectWorkspace）；② 前缀匹配字面大小写，Windows 跨形态归一归调用方；③ 调用方不传
  anchors 时场景依旧（提示在 hint 文案和文档里）。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-22 23:08:11 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-22 23:23:04 · log · @GuoJia-Agent · 落码完成：workspaceAnchorForPath 纯函数+单测、FileBrowser 五处 list 换解析 sessionId、crumbBarPlain hint、移除 lookup-not-found、demo 接线、dsh-host.md §12；build/test 97 过/typecheck/build:demo 全绿
