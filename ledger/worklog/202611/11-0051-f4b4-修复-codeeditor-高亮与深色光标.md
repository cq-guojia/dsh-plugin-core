# 20261111-0051-f4b4-修复-codeeditor-高亮与深色光标: 修复 CodeEditor 高亮与深色光标

- **Tags**: CodeEditor, 语法高亮, 深色光标, 缺陷修复
- **Status**: doing · 2026-11-11 01:00:51 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-11 00:51:46 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

用户 2026-11-11 报：Agent 在插件设置页用 `dsh-plugin-core@0.35.20` 的 `dsh-plugin-core/ui/code-viewer` 子路径控件 `CodeEditor`，传 `path: "rules.md"`、`lineNumbers: true`、`height: "200px"`，内容是 `- **关键词**：…` 形式的 Markdown 列表。重启宿主后：① 源码标记与行号显示正常，但整篇文本没有任何语法高亮（`**` 之间不加粗、列表标记和关键词不着色、所有字符同一个前景色）；② 深色主题下输入光标是黑色竖条，在深底上几乎看不见。对照只读 `CodeViewer` 打开同类 md 文件时 `# 标题` 蓝、`<!-- 注释 -->` 灰、`**粗体**` 加粗。调用方未加任何样式覆盖，产物中 `languageForPath` / `markdown()` / `syntaxHighlighting` / `HighlightStyle.define` 均已打包。

用户口径：「你先判断一下，是这边的问题归核心管，还是消费端使用不正确。如果是消费端的问题，我们不要改。」判断结论：**两个都不是消费端用错，都归核心管**，所以按用户 2026-11-11 明确指令「核心就改吧」动核心，不动消费端。

## To Do

- ~~补 `.cm-cursor` / `.cm-dropCursor` 的 `borderLeftColor`，跟随明暗判据~~ 已完成
- ~~补 Markdown 列表 / 强调标记的配色规则~~ 已完成
- ~~补自检：断言主题 CSS 规则 + 语法树到高亮 class 的真实映射~~ 已完成
- ~~`pnpm run build`、`pnpm test`、`pnpm run typecheck`、`koc-codelint` 全绿~~ 已完成（394 项）
- 宿主真机验收：`**关键词**` 加粗且着色、深色光标可见、只读 `CodeViewer` 观感无回归（唯一未落实项）
- 本轮用户只说改核心，未授权 commit / push / bump / tag，做完留工作区待验收

## Next

等用户在宿主真机装最新 `dist/` 后验收三处：`CodeEditor` 里 `-` / `**` 呈紫色、`关键词` 呈橙色加粗、深色下光标浅灰可见；并确认只读 `CodeViewer` 的标题 / 注释观感无回归（`codeMirrorTheme` 是共用主题）。验收通过后再按用户明确指令提交或发版。

## Process

- 落实①（扩展链正常）：Node 实测 `extOf('rules.md')='md'` → `languageForPath` 返回 `LanguageSupport`；`CodeEditor` 实际下发 5 个扩展，含 `LanguageSupport` + `syntaxHighlighting`；真实 `EditorState` 解析出 `StrongEmphasis` / `ListMark` / `ATXHeading1` / `CommentBlock`，`highlightingFor(state,[tags.strong])` 返回 class。故 `path` 传法正确，不是使用错误。
- 落实②（配色表缺规则）：用核心真实 `HighlightStyle` 对 `- **关键词**：内容` 跑 `highlightTree`，得到 `-`→`ͼ17`、`**`→`ͼ1b ͼ17`、`关键词`→`ͼ1b`、`：内容`→无 class；`ͼ17` 是 `tags.meta` 弱灰，`ͼ1b` 只有 `font-weight:bold` 无颜色。`src/ui/display/code-viewer-theme.ts:111` 的 `tags.strong` 无 `color`，两套表均无 `tags.list` / `tags.processingInstruction` 规则；只有 `tags.heading`（蓝，`:109`）与 `tags.comment`（灰，`:88`）有颜色，所以这段内容必然「整篇同色」。
- 落实③（光标）：`node_modules/@codemirror/view/dist/index.js:6960-6961` 定义 `.cm-cursor{borderLeft:1.2px solid black}`，只有 `:6968-6969` 的 `&dark .cm-cursor` 改浅色且要求编辑器带 `cm-dark`；核心 `src/ui/infra/code-mirror-surface.ts:88` 传 `theme:'none'`，`node_modules/@uiw/react-codemirror/src/getDefaultExtensions.ts:51-52` 因此不挂官方 light/dark 主题 ⇒ 光标恒黑。且 `basicSetup` 默认开 `drawSelection()`（`@uiw/codemirror-extensions-basic-setup/esm/index.js:80`），它把 `.cm-content` 的 `caretColor` 设成 `transparent !important`（`@codemirror/view/dist/index.js:9700-9701`），核心 `src/ui/display/code-viewer-theme.ts:44-46` 设的 `caretColor` 完全无效。只读查看器没有光标，故 v0.35.20 开放 `CodeEditor` 才暴露。
- 未完全落实项：`**` 之间「不加粗」在 Node 层只验证到规则存在且 class 确实分配到 `关键词`，浏览器侧是否生效无法离线复现（本机无 jsdom / linkedom，未授权装依赖）。修复后由宿主真机验收确认；不凭猜测写结论。
- 修复（本轮）：`src/ui/display/code-viewer-theme.ts` 的 `cmSurfaceTint(dark)` 新增 `.cm-cursor, .cm-dropCursor { borderLeftColor: var(--dshpc-fg, <按 dark 兜底>) }`；`cmSurfaceTheme` 的 caretColor 加注释说明它不是光标色来源。HIGHLIGHTS 明暗两套表把 heading 的无效 `fontStyle:'bold'` 改成 `fontWeight:'bold'`，给 `tags.strong` / `tags.emphasis` 补颜色，并在表尾新增 `tags.processingInstruction` 规则（放最后压过前面的 meta 弱灰）。
- 改前 / 改后实测对照（Node，用核心真实 HighlightStyle 对 `- **关键词**：内容` 跑 highlightTree）：改前 `-`→`ͼ17`（meta 弱灰）、`关键词`→`ͼ1b`（仅 font-weight）、主题 CSS 里没有 borderLeftColor 规则；改后亮色 `-`→`ͼ1g`、`关键词`→`ͼ1b`（`color:#986801; font-weight:bold`），暗色 `-`→`ͼ28`、`关键词`→`ͼ23`（`color:#d19a66; font-weight:bold`），光标 CSS 亮色 `var(--dshpc-fg,#383a42)` / 暗色 `var(--dshpc-fg,#abb2bf)`，且是主题作用域下的后代选择器（可盖过官方单类 `.cm-cursor`）。
- 自检：`test/code-viewer-theme.test.mjs` 7 项（明暗各 3 项 + 兜底色差异），断言主题真实 CSS 规则、语法树到高亮 class 的映射、不存在无效 `font-style:bold`；`test/code-editor.test.mjs` 补 1 项，验证 CodeEditor / CodeViewer 都把光标色与语法高亮真正下发给 CodeMirror。`pnpm test` 394 项全绿，`pnpm run typecheck` / `koc-codelint` 通过，`pnpm run build` + `pnpm run build:demo` 产物已同步（`dist/ui/display/code-viewer-theme.js:77/104/114/136/143`）。

## Conclusion

核心已修：深色下自绘光标不再恒黑（吃 `--dshpc-fg` token，token 缺失时按明暗判据给浅 / 深兜底）；Markdown 的列表 / 强调标记与强调文字有了独立配色，编辑 md 不再与纯文本同色；顺带修掉标题 `font-style:bold` 这条会被浏览器丢弃的无效 CSS。改动只落 `src/ui/display/code-viewer-theme.ts` 与两份测试，源码与 `dist/` / `packages/demo/dist/client.js` 已重建，未提交、未 bump、未发版。

留坑：`**` 之间「不加粗」在浏览器侧仍缺离线复现（本机无 jsdom / linkedom，未授权装依赖），只能验证到规则存在且 class 分配到 `关键词`；本轮给 strong 补了橙色，真机上一眼可判是否生效。另 `codeMirrorTheme` 是只读与可编辑共用主题，只读 `CodeViewer` 的观感变化需真机确认。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261111-0051-f4b4-修复-codeeditor-高亮与深色光标 --note "...". -->
- 2026-11-11 00:51:46 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-11 00:53:59 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 落实两处根因并写入 Background/Process：code-viewer-theme.ts:44-46 的 caretColor 被 drawSelection 覆盖、:111 tags.strong 无 color；下一步改 cmSurfaceTint 与 HIGHLIGHTS 两套表
- 2026-11-11 01:00:51 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 完成修复并验证：code-viewer-theme.ts 的 cmSurfaceTint 新增 .cm-cursor borderLeftColor、HIGHLIGHTS 补 tags.processingInstruction/strong/heading 配色与字重修正；test/code-viewer-theme.test.mjs 7 项 + code-editor.test.mjs 1 项，pnpm test 394 项全绿、typecheck/codelint 通过，dist 已重建，留宿主真机验收
