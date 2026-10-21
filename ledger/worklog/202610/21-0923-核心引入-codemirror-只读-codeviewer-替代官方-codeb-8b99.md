# 20261021-0923-核心引入-codemirror-只读-codeviewer-替代官方-codeb-8b99：核心引入 CodeMirror 只读 CodeViewer（替代官方 CodeBlock）

> **✅ 完成封卷**：2026-10-21 17:41:12（@GuoJia-Agent）
> **创建**：2026-10-21 09:23:59（@GuoJia-Agent）
> **分类**：基建 ｜ **标签**：CodeViewer、CodeMirror、核心、预览

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

- 官方 `CodeBlock`（Shiki）把整篇 tokenize 成 `<pre>` + 每 token 一个 `<span>` 的巨型 DOM，大文件拖宽会触发整棵子树重排 ⇒ 首屏与拖拽都卡；观感也差。需求：把核心的只读代码查看器换成 CodeMirror 6。
- 兄弟项目 `dsh-task-dispatch-table` 已落地过一遍。本任务把它「抽进共享底座」（落主包），供以后所有插件复用，而不是每个插件各抄一份。
- 早前 `src/explorer/preview/TextPreview.ts:5` 写过「不为此引 CodeMirror 全家桶进共享底座」——本任务即反转该旧决策；但按拍板红线，**本阶段不进 explorer、不动 `ui/official.ts` 既有导出**，只把可复用 `CodeViewer` 做进核心 `src/ui` 并导出，替换 `TextPreview` 里 `CodeBlock` 是后续单独任务。

## 待办

- [x] `package.json` 加 CodeMirror 依赖（与 tdt 同版本，resolve 落在 `^` 区间内）
- [x] `src/ui/CodeViewer.ts`（`.ts` + `createElement`，`dshpc-` 类名；图标 / `writeClipboard` 经 `ui/official.ts` 单一入口取）
- [x] `src/ui/code-viewer-lang.ts` + `src/ui/code-viewer-theme.ts`（`dshpc-` 前缀、吃 `--dshpc-*` token）
- [x] CSS：`src/ui/code-viewer.css` + `gen-css.mjs` 生成 `.generated.ts`，接入 `src/ui/css.ts` 的 `CONTROLS_CSS`
- [x] i18n 加 `codeCopy` / `codeCopied` 文案键（死 key 自检已绿）
- [x] 走**子路径** `./ui/code-viewer` 导出（不进主桶 —— 主桶必须零平台模块静态依赖，与 `ui/official` / `ui/host` 同例）
- [x] `pnpm run build` 干净；`node --test` 76/77 绿（唯一失败是**既有** `doc-data.generated.ts` 孤儿，与本次无关）
- [ ] **未做**：替换 `explorer/TextPreview` 的 `CodeBlock`（后续任务，按拍板红线不动 explorer）
- [x] `commit` + `push`：c638149 推到 `main`（调试期不打 tag、不 bump；dist 随提交入库；不含 docs 生成 WIP 孤儿）
- [ ] **未做**：`AGENTS.md`「ui 零官方依赖」旧约束改写 + `TextPreview.ts:5`「不引 CodeMirror」旧注释反转（文档，另议）

## 下一步

- 已结案（落主包范围全部完成并入库）。
- 后续独立任务（非本任务交付）：① 替换 `explorer/TextPreview.ts:101` 的 `CodeBlock` 为 `dsh-plugin-core/ui/code-viewer`；② 处理 `doc-data` 孤儿让 `css-contract` 全绿；③ 改写 `AGENTS.md` 旧「ui 零官方依赖」约束与 `TextPreview.ts:5` 旧注释。

## 过程

### 兄弟项目分析（dsh-task-dispatch-table，2026-10-21 逐文件核对）

- 定位：`src/client/ui/CodeViewer.tsx` + `src/client/ui/lang.ts` + `src/client/ui/cm-themes.ts`，样式在 `src/client/archive-session-css.ts:256-265`。
- **是引包，不是抄代码**：`package.json` 依赖 `@uiw/react-codemirror ^4.25.12` + `@codemirror/{state,view,language,legacy-modes}` + `@codemirror/lang-{javascript,json,markdown,python,html,css,yaml}` + `@lezer/highlight`；全仓 `src/`（除 `node_modules`）只有 `import` 语句，无 vendored 源码。
- `lang.ts` / `cm-themes.ts` 注释写「移植自 DSH-better-sidebar」= 扩展名→语言键映射表、one-dark/one-light 配色**思路**的移植，实现仍全部建立在公开 npm 包 API 之上。
- 三文件分工：`CodeViewer.tsx`（React 包裹层）/ `lang.ts`（扩展名→语言包纯函数）/ `cm-themes.ts`（表面 + 选区 + 语法色主题）。
- 关键设计（均已真机修过，原样沿用）：
  1. 只读但可选中：`<CodeMirror readOnly>`（= `EditorState.readOnly` 拦输入），**故意不设** `editable=false`（后者连带禁鼠标选区，无法框选复制）。`CodeViewer.tsx:8-10,102`。
  2. 透明叠宿主面板：`theme="none"` 关掉 `@uiw` 默认白底。`CodeViewer.tsx:12,100`。
  3. 默认 `EditorView.lineWrapping` 全换行，避免横向滚动条；`basicSetup` 关掉 fold/autocompletion/search 等非必要项。
  4. 明暗只认 `body[data-ds-dark-theme]`（宿主 `toggleAttribute` 写），`MutationObserver` 跟随；禁用 `prefers-color-scheme`（跟系统不跟宿主会白字白底隐形）。`CodeViewer.tsx:34-67`。
  5. 选区色用不透明实色（暗 `#3E4451` / 浅 `#c8d3f0`）——CM 把选区画成文字底下背景层、不给选中字重上色，半透明白会压浅字隐身。`cm-themes.ts:63-75`。
  6. 复制钮：右上角官方 `IconCopyOutlineRegular` + 官方 `writeClipboard`，hover 浮现，1.5s 自动还原。`CodeViewer.tsx:77-96`。
- 用法：`file-preview.tsx` 的 `TextPreview` 源码态 `h(CodeViewer, { text, path, t })`（`:672`），`task-editor.tsx` 同款。

### 核心现状核对（dsh-plugin-core）

- `src/ui/official.ts` 已是官方 primitives **唯一** import 点（L1 adapter），`TextPreview.ts:9` 从它取 `CodeBlock / MarkdownText / languageForPath`。⇒ CodeViewer 要的图标与 `writeClipboard` 同样走 `official.ts`，**不**在别处 import 平台模块。
- 样式：`src/ui/css.ts` 模块级 `createStyleKit({ id: 'dsh-plugin-core-ui' })`，`ensureControls()` 注册 token + `CONTROLS_CSS`；CSS 由 `scripts/gen-css.mjs` 从真 `.css` 生成 `*.generated.ts`（如 `card-css.ts` + `card-css.generated.ts`），前缀 `dshpc-` / `--dshpc-*`。⇒ CodeViewer 样式照此接入，不新建 style id（多插件隔离已由 `setStyleKit({id})` 承担）。
- ⚠️ `AGENTS.md` 仍写「ui 必须零 `@deepseek-ai/*` 依赖」——与源码现状（official.ts 已引官方）冲突，属旧约束未改写；以源码为准。文档改写不属本任务，列出备查。

### 提交与结案（2026-10-21）

- `commit` + `push` c638149 → `main`：38 文件含 `dist/`；调试期不打 tag、不 bump；docs 生成 WIP 孤儿（doc-format.* / gen-docs.mjs / tsconfig.docs.json / explorer.doc.ts / explorer.generated.md / packages/demo/src/doc-data.generated.ts）未带入。
- explorer 按用户要求未动；替换其 `CodeBlock` 列为后续独立任务。
- 既有 `css-contract` 红项（doc-data 孤儿）非本次引入，留待该 WIP 主人处理或单独清理。

## 结论

- 落主包**完成并已入库**：核心新增只读 `CodeViewer`（CodeMirror 6），文件 `src/ui/CodeViewer.ts` + `code-viewer-lang.ts` + `code-viewer-theme.ts` + `code-viewer.css`，样式经 `createStyleKit` 注入（`CONTROLS_CSS`），类名 `dshpc-cv*`、吃 `--dshpc-*`；依赖 `@uiw/react-codemirror` + `@codemirror/{state,view,language,legacy-modes,lang-*}` + `@lezer/highlight` 入 `package.json`（正常 `dependencies`）。
- **导出走子路径 `./ui/code-viewer`** 而非主桶：因 `CodeViewer` 静态依赖 `ui/official`（平台模块），主桶必须保持零 `@deepseek-ai` 静态依赖，否则 `Node` 单测 `import` 主桶即崩（旧坑，见 `official.ts` 注释）；`ui/official` / `ui/host` 同理走子路径。
- 验证：`pnpm run build` 干净（gen + tsc，`noUnusedLocals`/`strict` 全开）；`node --test` 76/77 通过。唯一红项是**既有** `css-contract` 孤儿 `packages/demo/src/doc-data.generated.ts`（另一份 docs 生成 WIP 遗留，未跟踪、与本次无关，未提交）。
- 已 `commit` + `push`：`c638149` → `main`（调试期不打 tag、不 bump；`dist/` 随提交入库；不含 docs 生成 WIP 孤儿）。
- 红线守住：未进 explorer、未动 `ui/official.ts` 既有导出。
- **本任务范围外（已单列、非本任务交付）**：① 替换 `explorer/TextPreview.ts:101` 的官方 `CodeBlock`；② `AGENTS.md` 旧「ui 零官方依赖」约束改写 + `TextPreview.ts:5` 旧注释反转；③ 处理既有 `doc-data` 孤儿让 `css-contract` 全绿。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-21 09:23:59 · new · @GuoJia-Agent · 创建任务（open）
- 2026-10-21 09:25:40 · claim · @GuoJia-Agent · 认领 → doing
- 2026-10-21 09:25:47 · log · @GuoJia-Agent · 建任务台账并填正文：核心 src/ui/CodeViewer.tsx 引入 CodeMirror 只读查看器替代官方 CodeBlock，明确不进 explorer、不动 ui/official
- 2026-10-21 09:30:08 · log · @GuoJia-Agent · 补全 worklog 前因后果：兄弟预览栈逐文件核对（仅 CodeMirror 一处第三方）、官方 CodeBlock 卡顿根因、本会话决策时间线、放核心的红线与暗色判据坑
- 2026-10-21 09:37:05 · log · @GuoJia-Agent · 补全 worklog 背景与完整讨论纪要（含完整讨论过程、兄弟项目预览栈逐文件核对、放核心的红线）
- 2026-10-21 17:09:33 · log · @GuoJia-Agent · 落主包实现完成：核心新增只读 CodeViewer(CodeMirror6)，文件 CodeViewer.ts+lang+theme+css，依赖入 package.json，导出走子路径 ./ui/code-viewer（主桶零平台依赖）；build 干净，node --test 76/77 绿（唯一红项 css-contract 既有 doc-data 孤儿，与本次无关）；未 commit（待授权），未替换 explorer 的 CodeBlock
- 2026-10-21 17:16:12 · log · @GuoJia-Agent · 已 commit+push c638149 到 main（调试期不打 tag 不 bump），38 文件含 dist；未带入 docs 生成 WIP 孤儿（doc-format.*/explorer.doc.ts/explorer.generated.md/gen-docs.mjs/tsconfig.docs.json/packages/demo/src/doc-data.generated.ts）；explorer 按用户要求未动
- 2026-10-21 17:40:49 · log · @GuoJia-Agent · 更新 worklog 结论/下一步/过程：标记落主包已 commit+push(c638149) 入库并准备结案；明确替换 explorer CodeBlock / AGENTS.md 旧约束 / doc-data 孤儿为后续独立任务
- 2026-10-21 17:41:12 · close · @GuoJia-Agent · 结案：核心引入只读 CodeViewer(CodeMirror6)：子路径 ./ui/code-viewer 导出、依赖入 package.json、样式经 createStyleKit 注入；commit c638149 推 main；explorer 未动，替换其 CodeBlock / AGENTS.md 旧约束 / doc-data 孤儿列为后续
