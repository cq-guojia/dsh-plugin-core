# 20261020-2317-demo-预览站界面重做-照抄-bootstrap-文档站布局-8427：demo 预览站界面重做（照抄 Bootstrap 文档站布局）

> **创建**：2026-10-20 23:17:28（@GuoJia-Agent）
> **分类**：界面 ｜ **标签**：demo、样式、布局

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

用户 2026-10-20 反馈 demo 预览站「界面丑得死人」，选定照抄 Bootstrap 文档站布局
（https://getbootstrap.com/docs/6.0/components/dialog/）。用户原话要点：
① 页面上方提示框显示备注；② 下方左侧放示例、右侧放代码；③ 代码块可滚动并渲染出来；
④ 不能只有示例，还要有代码示例且要说明「怎么用」（import / API）；现状「纯粹乱堆」。
约束不变：预览效果与实际使用一致（2026-10-17 建站初衷，Hindsight kp-8b65cdcf3dfd）。
用户拍板：每示例一对（左示例右代码）、右栏 PanelDock 保留、代码高亮走官方 CodeBlock；
**先只改 Button 一页做样式试点**，确认后再改其余页。

## 待办

- [x] 布局提案拍板（2026-10-20 深夜，用户「按你的建议来，先改 button 那一页」）
- [x] demo.css 真源 + 生成链路（`scripts/gen-css.mjs` MAP 加一行 → `packages/demo/src/demo-css.generated.ts`，注入点 `packages/demo/src/client/index.tsx` 的 `registerStyle('demo', …)`）
- [x] Button 页试点改造（备注框 + 5 个示例块 + 用法块 + API 表）
- [ ] 用户在宿主里看 Button 页实际效果并拍样式
- [ ] 样式定了之后，其余 17 页照同一模式改造（旧 `Demo` 组件仍在、未动）

## 下一步

等用户在宿主里看 Button 页效果、拍板样式细节；通过后以 `packages/demo/src/doc.tsx`
（Note / Example / CodeOnly / ApiTable）为模板批量改造其余各页，改一页验一页。
⚠️ 台账脚本 `log` 在 ledger/ 有未提交改动时会**拉远端覆盖本地正文** —— 正文写完先提交，
再跑 log（本次正文已在最后一次 log 之后重写，故得以保留）。

## 过程

**勘察与提案（2026-10-20 23:17-23:23）**：
- 现状：外壳 = `packages/demo/src/client/index.tsx:55` `DemoPage`，flex 三栏（左 180px aside 两级导航 + main 单页 + 右 PanelDock），无路由无 anchor，`useState<SectionId>` 切换；`sections/index.tsx:96-130` 的 `Demo` 组件 = 卡片 + h3 + hint + children + 可选 `code`（裸 `<pre>`，无高亮，全站仅 foundation 一页用过）；demo 包零 CSS 文件、布局全 inline style；构建 esbuild 出 `dist/index.js` + `dist/client.js`，库从 `../../dist/` 引入。
- 可复用：官方 `CodeBlock`（Shiki）经 `src/ui/official.ts:21` 再导出（explorer 的 TextPreview 已在用）；`Card`/`StripCard`/`Segmented`/`PanelDock`/`Button`/`IconButton`；token `--dshpc-code-surface` / `--dshpc-code-font`。
- 硬约束：运行时 TS 字符串注入、源码写真 .css 由 `scripts/gen-css.mjs` 生成、`createStyleKit({id})` 单一注入点、`dshpc` 前缀、明暗判据 `body[data-ds-dark-theme]`、dist 入库、调试期 commit+push 不 bump 不打 tag。
- Bootstrap 页结构（web_fetch 实测）：三栏（分组可折叠导航 / 正文 / ON THIS PAGE），正文 = 页头 → 说明 → 示例（大写示例标题 + live demo + 带语言标签的代码块）→ 多张 API 表（Name|Type|Default|Description）。

**实现（2026-10-20 深夜，Button 页试点）**：
- 新增真源 `packages/demo/src/demo.css`（只消费 `var(--dshpc-*)`，明暗交给 token，无 dark 段）：`.dshpc-doc-note`（左色条 callout）/ `.dshpc-doc-block`（用法、API 表外壳）/ `.dshpc-doc-example*`（示例+代码双栏，`grid-template-columns:repeat(auto-fit,minmax(300px,1fr))` 窄容器塌成单列；代码内层 `.dshpc-doc-example__scroll` max-height 320px 可滚，表头不跟着滚）/ `.dshpc-doc-api`。
- `scripts/gen-css.mjs` MAP 加一行（demo 走与库同一条生成闸）；`test/css-contract.test.mjs` 的孤儿生成物自检原只 walk `../src`，补一行 walk `../packages/demo/src` —— 不补则 MAP 多出 packages 路径会红。
- 新增 `packages/demo/src/doc.tsx`：`Note` / `Example` / `CodeOnly` / `ApiTable`；代码一律官方 `CodeBlock`（lang tsx + showHeader + copyLabel/copiedLabel），高亮与复制按钮不自绘。
- `packages/demo/src/primitives.d.ts` 补 `CodeBlock` 与 `Modal` 声明（Modal 与 `src/types/primitives.d.ts:86-101` 同口径）。
- `packages/demo/src/sections/controls.tsx` 的 `ButtonPage` 改为：Note → 5 个 Example（文案/十档外观/尺寸图标/状态/自定义颜色，每块右侧是与左栏一致的真实代码）→ `CodeOnly` 用法（pnpm add + 子路径 import + 最小用法）→ `ApiTable`（9 行，逐条对齐 `src/ui/Button.ts` 的 ButtonProps）。
- 顺手修两处**既有**类型错误（非本次引入）：demo 缺 `Modal` 声明；原生弹窗里 `Input` 缺 value/onChange（`FeedbackPage` 加 `nativeText` 状态）。demo typecheck 由 exit 2 → 0。
- i18n：新增 20 个 key（文档骨架栏位名 + Button 各属性说明）双语齐备。
- 验证：core typecheck 0 / demo typecheck 0 / `gen-css --check` 0 / `node --test test/*.test.mjs` 73 全绿 / koc-codelint 全过（35 文件）；`pnpm run build` + `build:demo` 已出产物，`grep dshpc-doc-note packages/demo/dist/client.js` 命中 3 处。
- 其余 17 页未动（仍用 `sections/index.tsx` 的旧 `Demo` 组件），等样式拍板再批量改。

## 结论

Button 页已按 Bootstrap 文档站式布局改造完成（备注框 + 示例/代码双栏 + 用法 + API 表），
构建与全部自检通过；**未提交、未 bump 版本**（调试期口径）。实际观感待用户在宿主里验收。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-20 23:17:28 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-20 23:23:03 · log · @GuoJia-Agent · 开坑+勘察：demo 现状=三栏无路由、Demo 组件裸 pre 无高亮、demo 零 CSS 全 inline；Bootstrap 页结构实测；布局提案已交用户等拍板
- 2026-10-20 23:33:39 · log · @GuoJia-Agent · Button 页试点完成：新增 demo.css 真源+生成链路、doc.tsx 四件套、Note/5 示例/用法/API 表；typecheck+73 测试+codelint 全绿，产物已 build；等用户在宿主验收
- 2026-10-21 00:43:54 · log · @GuoJia-Agent · 第二轮调整：备注框改核心 StripCard（方角+左4px通高色条+浅底，删自绘边框盒）；外观档按主行动/中性/语义色/弱化四组分行，状态与颜色块同步分层
