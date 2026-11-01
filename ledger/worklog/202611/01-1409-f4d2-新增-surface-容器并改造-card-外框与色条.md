# 20261101-1409-f4d2-新增-surface-容器并改造-card-外框与色条: 新增 Surface 容器并改造 Card 外框与色条

- **Tags**: 组件, 圆角, 容器
- **Status**: doing · 2026-11-01 14:23:14 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-01 14:09:51 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

用户 2026-11-01 提出三件事，实为同一根因（缺「纯框容器」这一层）：

1. Card 短色条固定贴左，要求左右上下四向都可放，且「距卡片边缘」「距内容」的距离可设。
2. Card 外框圆角与 Button 不一致：Card 是 `border-radius:var(--dshpc-radius-sm)` = 8（src/ui/card.css:41），Button 是 `--dshpc-radius-md` = 12（src/ui/controls/button.css:21）⇒ 外框比里面放的按钮还小一圈，属圆角倒挂，不是风格差异。
3. 下游 dsh-task-dispatch-table 因为没件可用，自己建「块」，圆角 8/12 混用：task-list.tsx:244(sm)、:459(md)、index.ts:188(sm)、task-editor.tsx:1002(md)；且抄走的 CSS 里 fallback 也不一致（archive-session-css.ts 用 6px，tokens.ts 用 8px）。

## To Do

- [ ] `Surface` 容器：tone(底色) / border(边框) / radius(圆角) / padding(内距) 四轴，零业务语义
- [ ] Card 根节点挂 `.dshpc-surface` 复用外框，删掉自己写的 border / radius；圆角统一 12
- [ ] 色条 props：`side` left|right|top|bottom + `size` / `inset`(距卡片边) / `gap`(距内容) / `length`(上下时的条长)
- [ ] 自检：圆角只许 token 档；`SURFACE_CSS` 进 css-contract 常量表
- [ ] 文档 docs/help/ui.doc.ts 与 demo packages/demo/src/sections/controls.tsx 同步

## Next

写 `src/ui/surface.css`（真源）→ `scripts/gen-css.mjs` MAP 加一行 → `src/ui/surface-css.ts` re-export → 跑生成 → `src/ui/Surface.ts` + `src/ui/index.ts` 导出。

## Process

已核实（revision `8dc1f4b`，2026-11-01）：

- Card 现状：`padding:14px 14px 14px 12px`、`border-radius:var(--dshpc-radius-sm)`（src/ui/card.css:38-43）；色条 = 行内 flex 项，6px 宽、`align-self:stretch`、`border-radius:var(--dshpc-radius-xs)`，`__head` gap 12（src/ui/card.css:44-47）。
- 圆角口径：全站控件统一 `--dshpc-radius-md`(12)，只有 Card 用 sm(8)（button.css:21 / field.css:18 / segmented.css:14 等）。
- 命名调研：MUI 通用容器 `Box`、带皮肤的 `Paper`(elevated surface)；Chakra / Radix 用 `Box`；Ant / Joy / shadcn 用 `Card`；M3 里 `surface` 是色彩角色不是组件。本项目 token 已叫 `--dshpc-surface-*` ⇒ 组件名 `Surface`（用户 2026-11-01 拍板），Card / PanelDock 重名不可用。
- 落地约束：css-contract 要求每个 CSS 常量内选择器唯一；新 CSS 必须进 gen-css MAP 且生成物入库；CSS 引用的 var() 必须来自 token 或本文件（否则按需注入下静默失效）。

## Conclusion

（待完成）

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261101-1409-f4d2-新增-surface-容器并改造-card-外框与色条 --note "...". -->
- 2026-11-01 14:09:51 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created
- 2026-11-01 14:19:59 · claim · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · claimed → doing
- 2026-11-01 14:23:14 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 已认领并写入 Background/To Do/Process；下一步落 src/ui/surface.css
