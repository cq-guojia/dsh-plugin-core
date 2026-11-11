# 20261111-0051-f4b4-修复-codeeditor-高亮与深色光标: 修复 CodeEditor 高亮与深色光标

- **Tags**: CodeEditor, 语法高亮, 深色光标, 缺陷修复
- **Status**: doing · 2026-11-11 01:34:56 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-11 00:51:46 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

用户 2026-11-11 报：Agent 在插件设置页用 `dsh-plugin-core@0.35.20` 的 `dsh-plugin-core/ui/code-viewer` 子路径控件 `CodeEditor`，传 `path: "rules.md"`、`lineNumbers: true`、`height: "200px"`，内容是 `- **关键词**：…` 形式的 Markdown 列表。重启宿主后：① 源码标记与行号显示正常，但整篇文本没有任何语法高亮（`**` 之间不加粗、列表标记和关键词不着色、所有字符同一个前景色）；② 深色主题下输入光标是黑色竖条，在深底上几乎看不见。对照只读 `CodeViewer` 打开同类 md 文件时 `# 标题` 蓝、`<!-- 注释 -->` 灰、`**粗体**` 加粗。调用方未加任何样式覆盖，产物中 `languageForPath` / `markdown()` / `syntaxHighlighting` / `HighlightStyle.define` 均已打包。

用户口径：「你先判断一下，是这边的问题归核心管，还是消费端使用不正确。如果是消费端的问题，我们不要改。」判断结论：**两个都不是消费端用错，都归核心管**，所以按用户 2026-11-11 明确指令「核心就改吧」动核心，不动消费端。

用户 2026-11-11 追加拍板（**推翻上一轮的补丁方向**）：「我就光标的那个是可以的，就是你定义一下是可以的。其他的人家都做好了，你干嘛非得自己去写啊？……给我个规范的做法。然后更新 Worklog 按最规范、成熟的东西去改，不要去给我打补丁了好吗？」即：光标属于表面层自定义，保留；**语法配色必须交给官方实现，核心不得维护手抄配色表**。

## To Do

- ~~定位两个现象归核心还是消费端~~ 已完成（都归核心）
- ~~光标：`cmSurfaceTint` 给 `.cm-cursor` 设 `borderLeftColor`~~ 已完成，用户认可保留
- ~~补 Markdown 配色规则~~ **已作废**：用户判定为打补丁方向，改走官方方案后整张手抄表删除
- ~~按规范做法重做：核心退出语法配色，`theme` 交官方 dark / light~~ 已完成
- ~~重写自检 + build / test / typecheck / codelint~~ 已完成（394 项全绿）
- 宿主真机验收：暗色官方 one-dark 高亮、亮色官方兜底观感、深色光标可见、只读 `CodeViewer` 无回归
- 本轮用户只说改核心，未授权 commit / push / bump / tag，做完留工作区待验收

## Next

等用户在宿主真机装最新 `dist/` 后验收：暗色下 `-` / `**` / `#` 与 `# 标题` 呈现官方 one-dark 配色、深色光标浅色可见、编辑器仍是透明底不吃官方面板背景；亮色确认官方 `defaultHighlightStyle` 兜底的观感可接受；只读 `CodeViewer` 同步验收。通过后再按用户明确指令提交或发版。

## Process

- 落实①（扩展链正常）：Node 实测 `extOf('rules.md')='md'` → `languageForPath` 返回 `LanguageSupport`；`CodeEditor` 实际下发 5 个扩展，含 `LanguageSupport` + `syntaxHighlighting`；真实 `EditorState` 解析出 `StrongEmphasis` / `ListMark` / `ATXHeading1` / `CommentBlock`，`highlightingFor(state,[tags.strong])` 返回 class。故 `path` 传法正确，不是使用错误。
- 落实②（配色表缺规则）：用核心真实 `HighlightStyle` 对 `- **关键词**：内容` 跑 `highlightTree`，得到 `-`→`ͼ17`、`**`→`ͼ1b ͼ17`、`关键词`→`ͼ1b`、`：内容`→无 class；`ͼ17` 是 `tags.meta` 弱灰，`ͼ1b` 只有 `font-weight:bold` 无颜色。`src/ui/display/code-viewer-theme.ts:111` 的 `tags.strong` 无 `color`，两套表均无 `tags.list` / `tags.processingInstruction` 规则；只有 `tags.heading`（蓝，`:109`）与 `tags.comment`（灰，`:88`）有颜色，所以这段内容必然「整篇同色」。
- 落实③（光标）：`node_modules/@codemirror/view/dist/index.js:6960-6961` 定义 `.cm-cursor{borderLeft:1.2px solid black}`，只有 `:6968-6969` 的 `&dark .cm-cursor` 改浅色且要求编辑器带 `cm-dark`；核心 `src/ui/infra/code-mirror-surface.ts:88` 传 `theme:'none'`，`node_modules/@uiw/react-codemirror/src/getDefaultExtensions.ts:51-52` 因此不挂官方 light/dark 主题 ⇒ 光标恒黑。且 `basicSetup` 默认开 `drawSelection()`（`@uiw/codemirror-extensions-basic-setup/esm/index.js:80`），它把 `.cm-content` 的 `caretColor` 设成 `transparent !important`（`@codemirror/view/dist/index.js:9700-9701`），核心 `src/ui/display/code-viewer-theme.ts:44-46` 设的 `caretColor` 完全无效。只读查看器没有光标，故 v0.35.20 开放 `CodeEditor` 才暴露。
- 未完全落实项：`**` 之间「不加粗」在 Node 层只验证到规则存在且 class 确实分配到 `关键词`，浏览器侧是否生效无法离线复现（本机无 jsdom / linkedom；`agent-browser` CLI 在，但缺 Chrome 二进制，`agent-browser install` 属装组件、未获授权故未执行）。已用 esbuild 在 /tmp 打出真实 CodeMirror 页面，因无浏览器未跑成，临时目录已清理。修复后由宿主真机验收确认；不凭猜测写结论。
- 修复（本轮）：`src/ui/display/code-viewer-theme.ts` 的 `cmSurfaceTint(dark)` 新增 `.cm-cursor, .cm-dropCursor { borderLeftColor: var(--dshpc-fg, <按 dark 兜底>) }`；`cmSurfaceTheme` 的 caretColor 加注释说明它不是光标色来源。HIGHLIGHTS 明暗两套表把 heading 的无效 `fontStyle:'bold'` 改成 `fontWeight:'bold'`，给 `tags.strong` / `tags.emphasis` 补颜色，并在表尾新增 `tags.processingInstruction` 规则（放最后压过前面的 meta 弱灰）。
- 改前 / 改后实测对照（Node，用核心真实 HighlightStyle 对 `- **关键词**：内容` 跑 highlightTree）：改前 `-`→`ͼ17`（meta 弱灰）、`关键词`→`ͼ1b`（仅 font-weight）、主题 CSS 里没有 borderLeftColor 规则；改后亮色 `-`→`ͼ1g`、`关键词`→`ͼ1b`（`color:#986801; font-weight:bold`），暗色 `-`→`ͼ28`、`关键词`→`ͼ23`（`color:#d19a66; font-weight:bold`），光标 CSS 亮色 `var(--dshpc-fg,#383a42)` / 暗色 `var(--dshpc-fg,#abb2bf)`，且是主题作用域下的后代选择器（可盖过官方单类 `.cm-cursor`）。
- 自检：`test/code-viewer-theme.test.mjs` 7 项（明暗各 3 项 + 兜底色差异），断言主题真实 CSS 规则、语法树到高亮 class 的映射、不存在无效 `font-style:bold`；`test/code-editor.test.mjs` 补 1 项，验证 CodeEditor / CodeViewer 都把光标色与语法高亮真正下发给 CodeMirror。`pnpm test` 394 项全绿，`pnpm run typecheck` / `koc-codelint` 通过，`pnpm run build` + `pnpm run build:demo` 产物已同步（`dist/ui/display/code-viewer-theme.js:77/104/114/136/143`）。

- 架构复核（用户 2026-11-11 质疑）：`@uiw/codemirror-extensions-basic-setup/esm/index.js:84-86` 装 `syntaxHighlighting(defaultHighlightStyle,{fallback:true})`；`@codemirror/language/dist/index.js:1718-1721` 的 `getHighlighters` 是「有正式 highlighter 就忽略 fallback」。核心旧 `code-viewer-theme.ts:167` 注册了不带 fallback 的自造 `HighlightStyle`，把官方兜底整份顶掉。官方 `oneDarkHighlightStyle` 本来就有 `tags.processingInstruction` 着色（`@codemirror/theme-one-dark/dist/index.js:123-124`），是移植时抄漏 —— 故上一轮「补 4 条 tag 规则」确属「发现一个补一个」的补丁，用户判定不成立。`docs/requirements.md` 无该架构的拍板记录，源码注释只写「移植自兄弟项目」，无需推翻正式决策。
- 规范做法（本轮落地）：`src/ui/infra/code-mirror-surface.ts` 的 `theme` 从 `'none'` 改为 `dark ? 'dark' : 'light'`；`node_modules/@uiw/react-codemirror/src/getDefaultExtensions.ts:44-50` 据此挂官方 `oneDark`（官方主题 + `oneDarkHighlightStyle`）或官方亮色表面，亮色高亮由 `basicSetup` 的 `defaultHighlightStyle` 兜底。`src/ui/display/code-viewer-theme.ts` 删掉 `ONE_DARK` / `ONE_LIGHT` / `HIGHLIGHTS_DARK` / `HIGHLIGHTS_LIGHT` / `HighlightRule` 共 70+ 行，`codeMirrorTheme(dark)` 只返回 `cmSurfaceTheme` + `cmSurfaceTint(dark)` 两层表面，颜色吃 `--dshpc-*`。零新增依赖（`theme` 走已声明的 `@uiw/react-codemirror`），`package.json` 未改。
- 覆盖顺序实测（Node）：`EditorState.facet(EditorView.styleModule)` 共 11 个模块，官方 oneDark 主题在 index 2、核心 `cmSurfaceTheme` 在 4、`cmSurfaceTint` 在 5 ⇒ 核心后注入，`backgroundColor: transparent` 能盖过官方 `#282c34`，光标 / 选区同理；顺序由 `useCodeMirror.ts:98` 的 `getExtensions.concat(extensions)` 保证。`getDefaultExtensions({theme:'dark'})` 实测 `darkTheme=true`，`theme:'light'` 实测 `darkTheme=false`；两套下 heading / processingInstruction / strong / comment 都拿到官方高亮 class。
- 自检重写：`test/code-viewer-theme.test.mjs` 改为断言「核心不含 HighlightStyle」「明暗两套官方 highlighter 生效」「官方规则带颜色」「核心表面层排在官方之后」「光标兜底明暗不同」；`test/code-editor.test.mjs` 链路用例改为断言 `theme` 不再是 `'none'`、光标色与语言包仍下发、核心扩展里查不到自有 highlighter。`pnpm test` 394 项全绿，`pnpm run typecheck` / `koc-codelint` 通过，`pnpm run build` + `pnpm run build:demo` 产物已同步。

## Conclusion

按用户 2026-11-11 拍板重做完毕：核心**彻底退出语法配色**，明暗主题与高亮全部交给 `@uiw/react-codemirror` 的官方实现（暗色 oneDark、亮色 `defaultHighlightStyle` 兜底），零新增依赖；核心只保留表面层 —— 透明底、字体、行号槽、选区、自绘光标，全部吃 `--dshpc-*` token，光标的自定义经用户认可保留。上一轮「在手抄表里补 4 条 tag 规则」的补丁已整体删除，没有留在标准里。

代价（已确认）：官方 `oneDarkHighlightStyle` 对 `tags.strong` 只有 `fontWeight:bold`、不单独着色，亮色 `defaultHighlightStyle` 也较朴素；这是官方标准观感，不再自行补色。改动落 `src/ui/display/code-viewer-theme.ts`、`src/ui/infra/code-mirror-surface.ts` 与两份测试，`dist/` / `packages/demo/dist/client.js` 已重建，未提交、未 bump、未发版。

留坑：`**` 之间「不加粗」的浏览器侧离线复现仍缺（本机无 Chrome，`agent-browser install` 属装组件未获授权）；官方观感在所有语言、只读与可编辑两端都需在宿主真机整体验收。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261111-0051-f4b4-修复-codeeditor-高亮与深色光标 --note "...". -->
- 2026-11-11 00:51:46 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-11 00:53:59 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 落实两处根因并写入 Background/Process：code-viewer-theme.ts:44-46 的 caretColor 被 drawSelection 覆盖、:111 tags.strong 无 color；下一步改 cmSurfaceTint 与 HIGHLIGHTS 两套表
- 2026-11-11 01:00:51 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 完成修复并验证：code-viewer-theme.ts 的 cmSurfaceTint 新增 .cm-cursor borderLeftColor、HIGHLIGHTS 补 tags.processingInstruction/strong/heading 配色与字重修正；test/code-viewer-theme.test.mjs 7 项 + code-editor.test.mjs 1 项，pnpm test 394 项全绿、typecheck/codelint 通过，dist 已重建，留宿主真机验收
- 2026-11-11 01:04:59 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 补充落实边界：agent-browser 缺 Chrome 二进制、install 属装组件未获授权故未执行；esbuild 已在 /tmp 打出真实 CodeMirror 页面但无浏览器可跑，临时目录已清理；真 DOM 字重与光标色仍留宿主真机验收
- 2026-11-11 01:34:56 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 按用户拍板重做为官方方案：code-mirror-surface.ts 的 theme 改 dark/light 交给官方主题，code-viewer-theme.ts 删掉 ONE_*/HIGHLIGHTS_* 手抄表只留表面层，零新增依赖；实测核心 StyleModule 排在官方之后可覆盖面板背景，自检改为断言官方 highlighter 与覆盖顺序，pnpm test 394 项全绿、typecheck/codelint 通过，Worklog 已更新，留宿主真机验收
