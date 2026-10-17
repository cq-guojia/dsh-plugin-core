# 20261018-0605-explorer-子包-工作区浏览-预览-选工作区-文件-d32e

> **✅ 完成封卷**：2026-10-18 06:10:08（@GuoJia-Agent）
> **创建**：2026-10-18 06:05:00（@GuoJia-Agent）
> **分类**：建设 ｜ **标签**：explorer、工作区、预览

## 背景

用户拍板「explorer 要抽」。源：`dsh-task-dispatch-table/src/client/file-browser.tsx`（868 行）+ 
`file-preview.tsx`（794 行）。**只有这一家有**，另两家搜不到 —— 抽它是「把一家的形状当通用」，
风险在 Q0 里记过； mitigations 是接口已抽象好（`WorkspaceFilesFace`）。

## 待办

无。

## 下一步

`session` 子包（会话预览）。

## 过程

**接口面照抄宿主契约**（`WorkspaceFilesFace`：`read` / `readBytes` / `list` / 可选 `stat`），
两个坑沿用源注释：`read` 的 `range` **必传**（官方按位置参数个数校验）、`stat` 是可选的（宿主过旧要降级）。

**没搬的两块（裁剪是有意的，不是漏）**：

- **CodeMirror 代码预览**（`CodeViewer.tsx` + `cm-themes.ts`）⇒ 会引入 `@codemirror/*` 重依赖。
- **Office / PDF 预览** ⇒ 依赖宿主 `officeToPdf`（那个能力可能根本没就位，源里本来就判空降级）。

⇒ 预览只做 **文本 / 图片 / 不支持** 三类，其它类型给明确兜底而不是硬撑。

**做了什么**：

- `types.ts`：接口面 + 路径工具（`crumbsOf` / `parentOf` / `joinPath`）+ 类型猜测
  （`previewKindOf`：图片按扩展名；无扩展名按文本——源码类文件常无后缀如 `Dockerfile`；
  认不出的二进制返回 `unsupported`）
- `ExplorerPanel.ts`：面包屑（可点回跳）+ 目录树（目录优先排序、显示体积）+ 预览区 + 上一级/刷新
- `preview/index.ts`：文件预览体；图片走 Blob URL 并在卸载时 `revokeObjectURL`，不泄漏
- `pickers.ts`：`WorkspacePicker` / `FilePicker`，都基于 ui 的 `Picker`（交互全管），**数据调用方给**
  —— 工作区列表是 host 侧 `ctx.workspaceRegistry.list()` 取的，要经插件私有通道送 client，组件取不到

**踩坑**：`new Blob([res.data])` 在 TS 5.9 下报错（`Uint8Array<ArrayBufferLike>` 不是合法 `BlobPart`）
⇒ 包一层 `new Uint8Array(res.data)`。

## 结论

`dsh-plugin-core/explorer` + `/explorer/preview` 可用，25 条自检全过，两个入口都能直接 import。

留坑（比前面几个任务都重）：
- **只做文本/图片预览** —— 代码文件目前按纯文本渲染（无高亮），PDF/Office 显示「暂不支持预览」。
  要补齐就得引 `@codemirror/*`（重依赖）和宿主 `officeToPdf`，那是另一个任务。
- 目录树**没有懒加载/虚拟滚动**，超大目录（官方上限 2000 条）会一次渲染完。
- 仍未在浏览器渲染验证（全包系统性缺口）。
- 面包屑超宽时**没有折叠**（源实现有「折叠为当前层名 + 下拉选层」），本版是简单换行。
