# 20261101-1409-f4d2-新增-surface-容器并改造-card-外框与色条: 新增 Surface 容器并改造 Card 外框与色条

- **Tags**: 组件, 圆角, 容器
- **Status**: done · 2026-11-01 15:04:31 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-01 14:09:51 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Sealed**: 2026-11-01 15:04:31 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

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

- [x] `Surface` 容器：tone(底色) / border(边框) / radius(圆角) / padding(内距) 四轴，零业务语义
- [x] Card 根节点挂 `.dshpc-surface` 复用外框，删掉自己写的 border / radius；圆角统一 12
- [x] 色条 props：`side` left|right|top|bottom + `size` / `inset`(距卡片边) / `gap`(距内容) / `length`(上下时的条长)
- [x] 自检：圆角契约（Surface=md、Card/Surface 无裸值）；`SURFACE_CSS` 进 css-contract 常量表
- [x] 文档 docs/help/ui.doc.ts（新增 Surface 节 + Card 的 bar 行）与 demo（Surface / 四向色条两例）同步
- [x] demo 自身收口：文档骨架 `.dshpc-doc-block` / `.dshpc-doc-example`、Placeholder 与虚线占位框改走 Surface；demo 内 6px/8px 裸圆角全部改 token 档；Surface 增 `border:'dashed'` 档
- [x] 修掉 demo 级联冲突：`.dshpc-doc-block` 的 padding 与 `.dshpc-surface` 同权被覆盖成 0 → 内距改由 Surface `md` 档提供
- [ ] 下游 dsh-task-dispatch-table 改用 Surface（**不在本任务范围**，另开任务，等用户指令）

## Next

无。本任务已发版 `v0.17.0`（核心与 demo 同号）。下游 `dsh-task-dispatch-table` 的改造另开任务。

## Process

已核实（revision `8dc1f4b`，2026-11-01）：

- Card 现状：`padding:14px 14px 14px 12px`、`border-radius:var(--dshpc-radius-sm)`（src/ui/card.css:38-43）；色条 = 行内 flex 项，6px 宽、`align-self:stretch`、`border-radius:var(--dshpc-radius-xs)`，`__head` gap 12（src/ui/card.css:44-47）。
- 圆角口径：全站控件统一 `--dshpc-radius-md`(12)，只有 Card 用 sm(8)（button.css:21 / field.css:18 / segmented.css:14 等）。
- 命名调研：MUI 通用容器 `Box`、带皮肤的 `Paper`(elevated surface)；Chakra / Radix 用 `Box`；Ant / Joy / shadcn 用 `Card`；M3 里 `surface` 是色彩角色不是组件。本项目 token 已叫 `--dshpc-surface-*` ⇒ 组件名 `Surface`（用户 2026-11-01 拍板），Card / PanelDock 重名不可用。
- 落地约束：css-contract 要求每个 CSS 常量内选择器唯一；新 CSS 必须进 gen-css MAP 且生成物入库；CSS 引用的 var() 必须来自 token 或本文件（否则按需注入下静默失效）。
- 踩坑（用户 2026-11-01 截图指出）：`.dshpc-doc-block` 自己写了 `padding:12px 14px`，而它同时挂 `.dshpc-surface`（基类 `padding:var(--surface-pad)`），两者 (0,1,0) 同权 ⇒ demo 页先注入 DEMO_CSS、控件后注入 surface ⇒ **内距被吃成 0**，代码块标签贴边。修法：内距交给 Surface 的 `md` 档，demo.css 只留 margin 并加注释禁止再写框属性。

## Conclusion

- 核心：`Surface`（四轴容器，圆角唯一真源 12）+ Card 复用外框；色条四向（`bar.side`）与 `size`/`inset`/`gap`/`length` 可配。
- 收口：demo 文档骨架（CodeOnly / Example / ApiTable）、Placeholder、toolbar 两处虚线框改走 Surface；`.dshpc-doc-block` / `.dshpc-doc-example` 的 border/radius/background 从 demo.css 删除（只留排版）。
- 裸值清零：demo 内 6px/8px 圆角全部改 `--dshpc-radius-sm` / `-xs` / `-pill`；Surface 新增 `border:'dashed'`（只改 `--surface-border-style` 变量，不改 border 属性，避免依赖注入顺序）。
- 验证：`pnpm run build` / `build:demo` 干净；`node --test test/*.test.mjs` 209 全过；`koc-codelint` 25 文件六层全过。
- 仍手写框的 3 处是按钮 / 色卡本体（blocks.tsx:258 会话行按钮、controls.tsx:144 Tooltip 锚点、foundation.tsx:52 色卡），非容器，圆角已走 token。
- 发布：核心与 demo 同步 bump 到 `0.17.0`，打 tag `v0.17.0`（两个 workflow 同时发 `dsh-plugin-core` / `dsh-plugin-core-demo`）。
- 下游 dsh-task-dispatch-table 未改（另开任务）。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261101-1409-f4d2-新增-surface-容器并改造-card-外框与色条 --note "...". -->
- 2026-11-01 14:09:51 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created
- 2026-11-01 14:19:59 · claim · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · claimed → doing
- 2026-11-01 14:23:14 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 已认领并写入 Background/To Do/Process；下一步落 src/ui/surface.css
- 2026-11-01 14:32:21 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · Surface 组件 + Card 复用外框（圆角 8→12）+ 色条四向/间距/props 完成；build、209 测试、codelint 全过；文档与 demo 已同步；未提交
- 2026-11-01 14:43:02 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · demo 收口完成：Surface 加 dashed 档（src/ui/surface.css:33），doc.tsx 三处骨架与 Placeholder/toolbar 虚线框改走 Surface，demo 裸圆角全改 token；build+build:demo+209 测试+codelint 全过；未提交
- 2026-11-01 14:48:06 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 修 demo 级联冲突：.dshpc-doc-block 的 padding 与 .dshpc-surface 同权被覆盖成 0，改由 Surface md 档提供（doc.tsx:83/154、demo.css:37）；build+build:demo+209 测试+codelint 全过
- 2026-11-01 15:04:16 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 收尾：SurfaceProps.padding 补 null（src/ui/Surface.ts:19，demo 类型检查暴露）；两包 bump 0.17.0；build+build:demo+pnpm test 209 全过+codelint 27 文件全过；准备提交并发版
- 2026-11-01 15:04:31 · close · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · sealed
