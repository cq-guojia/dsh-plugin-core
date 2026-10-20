# 20261020-0827-card-圆角-边框-短色条-调整-demo-预览页-card-组件样式-ae39：Card（圆角+边框+短色条）调整 demo 预览页 Card 组件样式

> **创建**：2026-10-20 08:27:40（@GuoJia-Agent）
> **分类**：界面 ｜ **标签**：Card、demo、样式

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

用户原话：「开个新坑，然后建一个新任务。Card（圆角 + 边框 + 短色条）把这一页的组件样式调了。你先去接任务。」

「这一页」= demo 预览站的卡片页 `CardPage`（`packages/demo/src/sections/controls.tsx:544`），展示 `Card` 与 `StripCard` 两个组件。

## 待办

- 待用户确认「调」的具体目标（现状已是圆角+边框+短色条，见「过程」）。

## 下一步

- 用户给出目标后，改 `src/ui/card.css`（真源）→ `pnpm run gen:css` → `pnpm run build` → `pnpm run build:demo` → 跑自检。

## 过程

2026-10-20 只读调查（未改任何文件）：

- `Card`（bordered 外观）现状即用户描述的样式：圆角 8px + 1px 边框 + 色条上下留距（短条）——`src/ui/card.css:13-14`；`StripCard` 是另一外观：无圆角无边框、色条通高（`:17-18`）。
- 链路均同步：生成物 `src/ui/card-css.generated.ts` 与真源一致；`dist/ui/card-css.generated.js` 含相同规则；`CARD_CSS` 已并入注入（`src/ui/css.ts:35`），`Card.ts:37` 调 `ensureControls()`。
- 依赖 token 均已定义：`--dshpc-border`（`src/design/tokens.css:54`）、`--dshpc-surface-1`（`:13`）。
- 工作区干净（`git status` 无改动），无未提交的样式修改。

## 结论

<!-- 做成了什么、留了什么坑 -->

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-20 08:27:40 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-20 08:29:51 · log · @GuoJia-Agent · 只读调查：Card 现状已是圆角8px+1px边框+短色条（card.css:13-14），生成物/dist/注入/token 全同步，待用户确认要调什么
