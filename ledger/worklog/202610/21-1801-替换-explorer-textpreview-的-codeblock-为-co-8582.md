# 20261021-1801-替换-explorer-textpreview-的-codeblock-为-co-8582：替换 explorer TextPreview 的 CodeBlock 为 CodeViewer（后续①）

- **标签**：基建、CodeViewer、TextPreview、explorer、预览
- **状态**：closed · 2026-10-22 00:45:21 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **创建**：2026-10-21 18:01:56 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **封卷**：2026-10-22 00:45:21 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- 头部四行由脚本维护，顺序固定：标签 → 状态 → 创建 → 封卷。
     「- **标签**：…」按 new --tags 插在最上面，没有标签就不写（分类只进台账与历史，不进本文档）；
     「- **封卷**：…」在结案时加在最后。 -->

## 背景

- 父任务「核心引入 CodeMirror 只读 CodeViewer」已结案（commit `c638149`）：核心落了 `src/ui/CodeViewer.ts` + `code-viewer-lang.ts` + `code-viewer-theme.ts` + css，**导出走子路径 `./ui/code-viewer`**（主桶 `./ui` 保持零平台依赖，否则 Node 测试 import 主桶会崩）。
- 本任务＝父任务 defer 的「后续独立任务①」：把 `src/explorer/preview/TextPreview.ts:101` 的官方 `CodeBlock` 换成 `CodeViewer`，让文件预览真正用上带行号、可框选复制、大文件拖宽不卡的查看器。
- 只动 explorer 消费侧，不改核心 CodeViewer 本体。

## 待办

- [x] `TextPreview.ts` 导入：`CodeBlock / MarkdownText / languageForPath` → 只留 `MarkdownText`，新增 `import { CodeViewer } from '../../ui/CodeViewer.js'`（explorer 已依赖 official，相对导入不新增平台依赖）。
- [x] 渲染：`CodeBlock` 分支 → `CodeViewer`；`.dshpc-fb__text` 改 flex 列，编辑器外包 `flex:1 1 auto;minHeight:0`，保证横幅 /「加载更多」不被 100% 高编辑器顶出视野。
- [x] `typecheck` 干净；Node 测试只 import 主桶与叶子模块、不碰 `TextPreview`/`CodeViewer`，未受影响。
- [x] 红线：**未**往主桶 `src/ui/index.ts` 加导出（曾误加、已回退——CodeViewer 只走子路径 `./ui/code-viewer`）。
- [ ] 重建 `dist/`（改动在 `src`，demo 跑 `dist`，需 `pnpm build` 才生效）。
- [ ] demo 实机验证：暗色（`body[data-ds-dark-theme]`）、大文件拖宽、>5000 行「加载更多」在视野内。
- [ ] commit + push（沿用父任务「调试期不打 tag、不 bump」惯例）。

## 下一步

- 重建 dist + demo 眼验；通过后 commit。
- **前置阻塞**：demo「加载失败」是宿主 `read` 不返回内容的老问题（`explorerFailed`），与本次渲染改动无关；要看到 CodeViewer 需先让 `read` 有数据（可给 demo 加 `import.meta.glob('?raw')` 样例 read 兜底，另议，不在本任务）。

## 过程

- 父任务结论：CodeViewer 走子路径导出、主桶零平台依赖；本任务相对导入 `../../ui/CodeViewer.js` 合规（explorer 本就 import official）。
- 曾误把 `CodeViewer` 加进主桶 `src/ui/index.ts`，违背「主桶零平台依赖」，已回退；`package.json` 确认 `./ui`→`index`、`./ui/code-viewer`→`CodeViewer`。
- Node 测试 import 清单含 `dist/ui/index.js`（主桶），证实回退必要；不含 explorer 桶 / `TextPreview`，故本任务改动不影响测试。
- `typecheck`（`tsc --noEmit`）回退后复跑干净。

## 结论

- explorer 预览已切到 `CodeViewer`（`src` 层），`typecheck` 绿。
- 未重建 `dist`、未 commit、未实机验证（read 阻塞）；留待下一步。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-21 18:01:56 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 创建任务（open）
- 2026-10-21 18:03:40 · claim · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 认领 → doing
- 2026-10-21 18:03:41 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · TextPreview 切到 CodeViewer（src 层）：导入只留 MarkdownText + 相对导入 CodeViewer，CodeBlock 分支替换，flex 列摆好横幅/编辑器/加载更多；typecheck 绿；未往主桶 index.ts 导出（曾误加已回退，CodeViewer 只走子路径 ./ui/code-viewer）；未重建 dist/未 commit/未实机验证（read 阻塞）
- 2026-10-22 00:45:21 · close · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 结案：TextPreview 已用自研 CodeViewer（行号 / 可框选复制 / 大文件不卡），主桶零平台依赖红线守住（只走子路径 ./ui/code-viewer）。原阻塞「demo 加载失败看不到渲染效果」已随 0a67 修掉 read 传参而解除，源码态真机验收通过（2026-10-22）
