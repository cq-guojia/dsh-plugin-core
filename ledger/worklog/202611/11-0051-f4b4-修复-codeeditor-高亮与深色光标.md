# 20261111-0051-f4b4-修复-codeeditor-高亮与深色光标: 修复 CodeEditor 高亮与深色光标

- **Tags**: CodeEditor, 语法高亮, 深色光标, 缺陷修复
- **Status**: doing · 2026-11-11 00:53:59 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-11 00:51:46 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

用户 2026-11-11 报：Agent 在插件设置页用 `dsh-plugin-core@0.35.20` 的 `dsh-plugin-core/ui/code-viewer` 子路径控件 `CodeEditor`，传 `path: "rules.md"`、`lineNumbers: true`、`height: "200px"`，内容是 `- **关键词**：…` 形式的 Markdown 列表。重启宿主后：① 源码标记与行号显示正常，但整篇文本没有任何语法高亮（`**` 之间不加粗、列表标记和关键词不着色、所有字符同一个前景色）；② 深色主题下输入光标是黑色竖条，在深底上几乎看不见。对照只读 `CodeViewer` 打开同类 md 文件时 `# 标题` 蓝、`<!-- 注释 -->` 灰、`**粗体**` 加粗。调用方未加任何样式覆盖，产物中 `languageForPath` / `markdown()` / `syntaxHighlighting` / `HighlightStyle.define` 均已打包。

用户口径：「你先判断一下，是这边的问题归核心管，还是消费端使用不正确。如果是消费端的问题，我们不要改。」判断结论：**两个都不是消费端用错，都归核心管**，所以按用户 2026-11-11 明确指令「核心就改吧」动核心，不动消费端。

## To Do

- 补 `.cm-cursor` / `.cm-dropCursor` 的 `borderLeftColor`，跟随明暗判据（核心 bug）
- 补 Markdown 列表 / 强调标记的配色规则，让编辑 md 时与纯文本可区分
- 补自检：断言主题 CSS 规则 + 语法树到高亮 class 的真实映射，不靠产物字符串匹配
- `pnpm run build`、`pnpm test`、`pnpm run typecheck`、`koc-codelint` 全绿
- 宿主真机验收：`**关键词**` 加粗且着色、深色光标可见、只读 `CodeViewer` 观感无回归
- 本轮用户只说改核心，未授权 commit / push / bump / tag，做完留工作区待验收

## Next

改 `src/ui/display/code-viewer-theme.ts:33-58`（cmSurfaceTheme 光标）与 `:87-145`（HIGHLIGHTS 明暗两套表），随后在 `test/code-viewer-theme.test.mjs` 加自检。

## Process

- 落实①（扩展链正常）：Node 实测 `extOf('rules.md')='md'` → `languageForPath` 返回 `LanguageSupport`；`CodeEditor` 实际下发 5 个扩展，含 `LanguageSupport` + `syntaxHighlighting`；真实 `EditorState` 解析出 `StrongEmphasis` / `ListMark` / `ATXHeading1` / `CommentBlock`，`highlightingFor(state,[tags.strong])` 返回 class。故 `path` 传法正确，不是使用错误。
- 落实②（配色表缺规则）：用核心真实 `HighlightStyle` 对 `- **关键词**：内容` 跑 `highlightTree`，得到 `-`→`ͼ17`、`**`→`ͼ1b ͼ17`、`关键词`→`ͼ1b`、`：内容`→无 class；`ͼ17` 是 `tags.meta` 弱灰，`ͼ1b` 只有 `font-weight:bold` 无颜色。`src/ui/display/code-viewer-theme.ts:111` 的 `tags.strong` 无 `color`，两套表均无 `tags.list` / `tags.processingInstruction` 规则；只有 `tags.heading`（蓝，`:109`）与 `tags.comment`（灰，`:88`）有颜色，所以这段内容必然「整篇同色」。
- 落实③（光标）：`node_modules/@codemirror/view/dist/index.js:6960-6961` 定义 `.cm-cursor{borderLeft:1.2px solid black}`，只有 `:6968-6969` 的 `&dark .cm-cursor` 改浅色且要求编辑器带 `cm-dark`；核心 `src/ui/infra/code-mirror-surface.ts:88` 传 `theme:'none'`，`node_modules/@uiw/react-codemirror/src/getDefaultExtensions.ts:51-52` 因此不挂官方 light/dark 主题 ⇒ 光标恒黑。且 `basicSetup` 默认开 `drawSelection()`（`@uiw/codemirror-extensions-basic-setup/esm/index.js:80`），它把 `.cm-content` 的 `caretColor` 设成 `transparent !important`（`@codemirror/view/dist/index.js:9700-9701`），核心 `src/ui/display/code-viewer-theme.ts:44-46` 设的 `caretColor` 完全无效。只读查看器没有光标，故 v0.35.20 开放 `CodeEditor` 才暴露。
- 未完全落实项：`**` 之间「不加粗」在 Node 层只验证到规则存在且 class 确实分配到 `关键词`，浏览器侧是否生效无法离线复现（本机无 jsdom / linkedom，未授权装依赖）。修复后由宿主真机验收确认；不凭猜测写结论。

## Conclusion

待本轮改完再补。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261111-0051-f4b4-修复-codeeditor-高亮与深色光标 --note "...". -->
- 2026-11-11 00:51:46 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-11 00:53:59 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 落实两处根因并写入 Background/Process：code-viewer-theme.ts:44-46 的 caretColor 被 drawSelection 覆盖、:111 tags.strong 无 color；下一步改 cmSurfaceTint 与 HIGHLIGHTS 两套表
