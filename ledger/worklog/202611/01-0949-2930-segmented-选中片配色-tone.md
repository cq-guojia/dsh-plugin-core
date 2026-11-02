# 20261101-0949-2930-segmented-选中片配色-tone: Segmented 选中片配色（tone）

- **Tags**: Segmented, icon, 控件
- **Status**: doing · 2026-11-02 03:16:01 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-01 09:49:30 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

用户 2026-11-01 原话：Segmented 现在不支持 icon；需要能传一个 icon（官方图标 / 数组 / 调用方自绘节点均可），`label` 也能传节点；布局固定为「icon → 文字 → 小数字」；只有 icon 时该段应是正方形而不是长方形，左右内距要处理。

## To Do

- 无。

## Next

已结案，无后续动作。

## Process

- `SegmentedItem` 新增 `icon` / `ariaLabel`，`label` 放宽为 `ReactNode` 且可选（src/ui/Segmented.ts:61-66）。
- 只有 icon 的判据 = 有 icon 且无 label / count / badge，命中后挂 `dshpc-seg__item--icon-only`，并让 `ariaLabel` 缺省退回 `tooltip`（src/ui/Segmented.ts:219-235）。
- 图标槽 `dshpc-seg__icon` 与 Button 同口径（inline-flex、svg 块级）；icon-only 段宽 = 段高、`padding:0`，sm/md/lg 三档各自对齐（src/ui/controls/segmented.css:18-25）。
- 自检：ui.test.mjs 覆盖渲染顺序 / icon-only / ariaLabel；css-contract.test.mjs 盯「宽 = 段高、内距归零」。
- 验证：`pnpm run build` 干净；`pnpm test` 204 项全过；`pnpm run build:demo` 通过；codelint 六层全过。

## Conclusion

Segmented 已支持段内 icon、节点 label 与 icon-only 正方形；文档（docs/help/ui.doc.ts）与 demo 示例已同步，产物已重新生成。待用户验收。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261101-0949-2930-segmented-选中片配色-tone --note "...". -->
- 2026-11-01 09:49:30 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-01 09:53:41 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · Segmented 已加 icon/节点 label/icon-only 正方形；build + 204 测试 + build:demo + codelint 全过，已交付待验收
- 2026-11-01 10:02:14 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 发版 v0.16.0：两包同号 bump、build/test 204 过、commit 4726e54 + push main、tag v0.16.0 已推
- 2026-11-02 03:16:01 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 收尾：v0.16.0 已发版（commit 4726e54 + tag 已推），To Do 清空、Next 置为无；用户确认结束，准备结案
