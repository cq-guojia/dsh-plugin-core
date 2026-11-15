# 20261115-1413-973d-合并-iconbutton-进-button: 合并 IconButton 进 Button

- **Tags**: Button, 控件, 重构
- **Status**: doing · 2026-11-15 14:42:39 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-15 14:13:13 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

用户 2026-11-15 原话：「我需要一个 button 去支持所有的内容…就是改那个 button 的用法，让它支持更多，不要这个单独标签好吗？」
`IconButton`（`src/ui/actions/Button.ts`）与 `Button` 除 class 名外几乎逐行重复：`ensureComponentStyles` / `useAsyncClick` / `useOverlayLocked` / disabled / aria-busy / loading 各写一遍，且已经漂了（禁用态 Button `opacity:.5`、IconButton `opacity:.4`）。纯图标钮真正多出来的只有「正方形 + 没文字时的无障碍名」。

## To Do

- 待用户验收观感：① `CodeViewer` 复制钮（`outline` 档，边框由 border 变 border-strong）；② `Deliverables` 揭示钮、`TaskBar` 纯图标动作钮（原来默认 `plain` 无底，现显式 `ghost`，观感应一致）；③ `ChangedFileDiff` 的重试钮从官方 Button 换成核心 Button。

## Next

等用户在真宿主里看三处观感：`CodeViewer` 复制钮（outline 边框变 border-strong）、`Deliverables` 揭示钮、`ChangedFileDiff` 重试钮（官方 Button → 核心 Button）。不改就到此为止。

## Process

- 合并口径：`Button` 新增 `label` 参数；`children === undefined\|null` ⇒ 自动加 `dshpc-btn--icon-only`（`src/ui/actions/Button.ts:212`）。
- 正方形尺寸不写三条组合选择器，改为档位各给 `--btn-square`、icon-only 用 `width:var(--btn-square)`（`src/ui/actions/button.css:24-29`）—— 组合选择器 (0,2,0) 会与调用点覆盖（`explorer.css` 的 `.dshpc-fb .dshpc-fb__row-toggle`）打平，胜负按注入顺序，不可靠。
- 外部覆盖点全部改成 `.dshpc-btn--icon-only`：`input-group.css`（输入格）、`field.css`（搜索清空钮 / 数字加减钮）。
- `TaskBar` 的两条分支合并成一条：没有 label 就只传 `label` 不传 children，`background` 参数随之消失（传色走 `primary` + `color`，与带文字分支同口径）。
- `ChangedFileDiff` 原本同时 import 官方 `Button`（重试钮）与核心 `Button`，改后名称冲突 ⇒ 重试钮也走核心 Button，删掉官方那条 import。
- 未选方案：给 Button 加 `background` 参数（只有 TaskBar 一个消费者，且 `secondary` 档底色与之等价）；为纯图标钮新增 `danger` 无边框档（没人用，要红色图标用 `ghost` + `color` 即可）。

## Conclusion

- `IconButton` / `IconButtonProps` 从源码、导出、CSS（`.dshpc-iconbtn` 48 行）、demo、测试、文档（`ui.doc.ts` / `style.md` / `structure.md` / 两个 README）里删净；`grep -rn IconButton src test docs packages/demo/src` 只剩一处说明「不再有该控件」的注释。
- 14 处调用点全部改成同一个 `Button`（`variant: 'plain'` → `'ghost'`）。
- 验证：`pnpm run build` / `pnpm test`（557 项全过）/ `pnpm run typecheck` / `pnpm run build:demo` 全绿；`koc-codelint` 40 文件六层全过。
- 复核收尾：`grep -rn "IconButton\|iconbtn\|--icb"` 全仓（含 dist / 生成物 / demo 产物）零命中；dist 导出面只剩 `Button`。
- 测试同步：icon-only 正方形、`label` 顶 aria-label、`--icon-only` 的 padding/width 断言、"独立图标钮皮肤必须删干净"。
- 发版：0.35.32 → **0.36.0**（core 与 demo 同号，移除导出属破坏性变更；`^0.35.x` 的消费方不会被自动拉上来），tag `v0.36.0` 已推。
- 跨仓影响：`dsh-task-dispatch-table`（38 处）与 `dsh-session-title-pattern`（4 处）仍在用 `IconButton`，但都锁着旧版本（0.35.31 / ^0.35.28）⇒ 现在不会被破坏，升级时要按 `docs/api/ui.md` 的迁移说明改。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261115-1413-973d-合并-iconbutton-进-button --note "...". -->
- 2026-11-15 14:13:13 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-15 14:20:01 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 删掉 IconButton（src/ui/actions/Button.ts 及 button.css 的 .dshpc-iconbtn），改为 Button 无 children 自动 dshpc-btn--icon-only 正方形 + label 顶 aria-label；14 处调用点与 6 处 CSS 覆盖同步改完，build/test(557)/typecheck/build:demo 全绿
- 2026-11-15 14:42:39 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 复核零残留后发版 0.36.0：tag v0.36.0 已推（core/demo 同号）；跨仓两个消费方锁着旧版本 0.35.x，升级时才需迁移
