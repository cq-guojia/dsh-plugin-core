# 20261022-0107-demo-预览站代码展示统一改用核心-codeviewer-7653：demo 预览站代码展示统一改用核心 CodeViewer

- **标签**：界面、demo、CodeViewer、代码展示、预览站
- **状态**：closed · 2026-10-22 01:23:26 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **创建**：2026-10-22 01:07:22 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **封卷**：2026-10-22 01:23:26 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- 头部四行由脚本维护，顺序固定：标签 → 状态 → 创建 → 封卷。
     「- **标签**：…」按 new --tags 插在最上面，没有标签就不写（分类只进台账与历史，不进本文档）；
     「- **封卷**：…」在结案时加在最后。 -->

## 背景

- 用户原话（2026-10-22）：「demo 页面不是有代码展示吗？你把所有代码展示，都变成核心里我们做好的那个第三方代码展示，也就是我们文件预览的那个展示」。
- 此前 demo 预览站的代码块走**官方** `CodeBlock`（`packages/demo/src/doc.tsx:13` import `@deepseek-ai/dsh-client-ui-primitives`），而文件预览的源码态早已换成核心自研 `CodeViewer` ⇒ 同一套 demo 里两套代码展示，观感与能力都不一致（官方 CodeBlock 整篇 tokenize 成巨型 DOM，拖宽重排会卡；CodeViewer 是行级视图 + Lezer 增量高亮、可框选复制、带行号）。

## 待办

- [x] `doc.tsx` 两处 `CodeBlock` → `CodeViewer`：`CodeOnly`（用法 / 安装类纯代码块）与 `Example`（右侧可滚动代码栏）。
- [x] 语言映射：CodeViewer 按 `path` 的扩展名选语法 ⇒ `snippet.${lang}`；doc-data 里实际只用 bash / ts / tsx，三种 `languageForPath` 都有（`code-viewer-lang.ts:66`）。
- [x] 复制按钮文案走核心字典（`t as coreT`，`codeCopy` / `codeCopied`），删掉 demo 自己的 `docCopy` / `docCopied`。
- [x] 高度：卡片里没有确定高度上下文 ⇒ `height: 'auto'`（外层 `.dshpc-doc-example__scroll` 的 `max-height:320px` 负责滚）。
- [x] demo `tsc -p packages/demo/tsconfig.json --noEmit` 干净（顺带修 `blocks.tsx` `sampleLabel` 的 `DemoMessageKey` 类型）。
- [x] `build:demo` 重建；产物 grep 确认 `dshpc-cv__copy` / `snippet.` 进包，官方 `CodeBlock` 只剩文案字符串、无调用。
- [ ] 用户真机验收：代码高亮 / 行号 / 复制钮 / 明暗跟随 / 窄栏塌成一列后代码仍在示例下方。

## 下一步

- 用户在宿主里重装 demo，随便翻几页（快速开始 / 参考 / explorer）看代码块；有样式或高亮问题报回来。
- 若某页代码块多到挂载吃力（目前 doc-data 全量仅 16 块，单 section 最多 7 块，暂不优化）再说懒挂载。

## 过程

- 两处替换点：`doc.tsx:79`（`CodeOnly`）、`doc.tsx:129`（`Example`）。demo 里除此之外没有别的官方 CodeBlock 调用点（grep 确认）。
- `CodeViewer` 的 CSS（`dshpc-cv*`）在 `CONTROLS_CSS` 里（`src/ui/css.ts:41`），`ensureControls()` 已带 ⇒ demo 不用额外注册样式。
- `CodeViewer` 依赖 `@uiw/react-codemirror` / `@codemirror/*`——已是 demo bundle 既有依赖（explorer → TextPreview → CodeViewer），**没有新增 npm 依赖**，bundle 体积无变化（2.1MB）。
- demo typecheck 暴露 `blocks.tsx:106` 的 `sampleLabel(normal: string)` 不合规（上一轮改的），顺手收紧成 `DemoMessageKey`。

## 结论

- demo 预览站所有代码展示统一走核心 `CodeViewer`，与文件预览源码态同一个件；官方 `CodeBlock` 在 demo 侧不再使用。
- commit `54d097a` 已 push main（未 bump、未打 tag）。
- **未真机验收**；另：`src/ui/Picker.ts` 的两条 biome 警告属并发任务 `…20a8`，不是本任务改动，未动。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-22 01:07:22 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 创建任务（doing）
- 2026-10-22 01:13:18 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 首轮交付：doc.tsx 两处官方 CodeBlock 换成核心 CodeViewer（CodeOnly/Example，lang→snippet.<ext> 喂 path、height auto、复制文案走核心 coreT），删 docCopy/docCopied、roadmap 文案改核心 CodeViewer；顺手修 blocks.tsx sampleLabel 的 DemoMessageKey 类型。demo typecheck 干净、build:demo 重建、产物 grep 确认 dshpc-cv 进包且无官方 CodeBlock 调用；commit 54d097a 已 push。待用户真机验收
- 2026-10-22 01:21:11 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 二轮（用户反馈）：CodeViewer 加 lineNumbers 开关（默认 true 保持文件预览带行号），demo 的 CodeOnly/Example 传 false ⇒ 预览站代码片段不显示行号。核心 dist 与 demo dist 重建，demo typecheck + 77 用例全绿，commit 03697f4 已 push。待真机验收
- 2026-10-22 01:23:26 · close · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 结案：验收通过：demo 预览站所有代码展示统一走核心 CodeViewer（CodeOnly / Example 两处，官方 CodeBlock 在 demo 侧不再使用）；按用户要求片段不显示行号（新增 lineNumbers 开关，默认 true，文件预览源码态仍带行号）。复制文案走核心字典、删 docCopy/docCopied、roadmap 文案同步。核心 dist 与 demo dist 重建，demo typecheck + 77 用例全绿。commit 54d097a / 03697f4 已 push main（未 bump、未打 tag）
