# 20261106-0429-83be-sessionviewmodal-内容插槽: SessionViewModal 内容插槽

- **Tags**: 会话预览, 插槽, 扩展点, 向后兼容
- **Status**: doing · 2026-11-06 04:35:25 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-06 04:29:19 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

消费端提出「SessionViewModal 内容插槽需求（通用能力）」，基线 = dsh-plugin-core@0.34.0 的
`adv/session/SessionViewModal`。性质：**新增可选能力，不改变现有行为**（不传 = 与现状逐字一致）。

要解决的问题（消费端原话归纳，三类诉求）：

1. **标题区**：想自定义标题（加徽标 / 按钮 / 链接，如任务编号、状态徽标），现在只能给 `heading` 字符串。
2. **会话开头**：想在会话内容最顶端注入要展示给用户的东西（例：本次会话要预览的规划、提示条、筛选条）。
3. **会话结尾**：想在会话内容最底端给出产出汇总（例：这个任务 ID 是哪个、会话是什么、本次产出整理了哪些内容）。

消费端现状（为什么提这个）：想在会话预览里加业务内容，只能**整份复制一套会话界面自己维护**
（其项目里 13 个 mirror 文件），或者放弃自己的功能块。

消费端给的原始草案（仅作参考，**命名与设计原则不照抄**，以本仓口径为准）：`titleSlot` /
`headerActionsSlot` / `bodyLead` / `bodyTail` 四个可选 `ReactNode` props，容器类名建议
`dshpc-sv-lead` / `dshpc-sv-tail`。

## To Do

动手前需先与用户讨论定案（当前**未开工**）：

- **最终 prop 命名与数量**：沿用消费端四槽名，还是收成 3 个（标题槽直接复用现有 `heading`）？
  本仓已有 `Modal` 的 `title` / `subtitle` / `headerExtra` / `headerActions` / `footer` 命名口径可对齐。
- **标题槽形态**：新增 `titleSlot`，还是把 `heading?: string` 放宽成 `ReactNode`（后者零新 prop，
  但语义从「人话标题字符串」变成「随便什么」）。
- **空态是否也渲染内容槽**：现在的正文组装有两条分支（空/加载/错误 与 正常），空分支里连
  「加载更早」按钮都没有；契约要求四状态都渲染槽，需要确认这是消费方真实需要还是过度设计。
- **样式落点**：槽容器只给布局（排列 / 间距 / 撑满宽度），还是干脆不给任何 CSS（只给类名）。
- **测试方案**：是否新建 `SessionViewModal` 的 SSR 渲染测试（stub 官方 primitives + 假 `view`），
  覆盖「无槽 DOM 一致 / 四状态 / 顺序断言」。
- **示例与文档**：demo 的 `SessionPage` 加最小示例（标题自定义 + 顶端提示 + 底端汇总）；
  文档改 `docs/help/session.doc.ts`（真源，双语）并重新生成 `.md` 与 demo doc-data。
- **版本**：按 minor（0.35.0）记录；调试期是否 bump / 打 tag 待定（本仓规则：调试期不 bump 不打 tag）。

## Next

与用户逐条讨论上节问题并定稿 API；定稿后 `claim` 本任务，再按定稿实现（先改
`src/adv/session/SessionViewModal.ts:774` 的 props 与 `:1168` 的渲染出口）。

## Process

动手前的现状核查（全部为源码事实，基线 0.34.0）：

- **结构写死**：唯一渲染出口 `src/adv/session/SessionViewModal.ts:1168-1238`，
  `Modal` 的 `title` / `subtitle` / `headerExtra` / `headerActions` / `footer` 全在组件内部决定，
  外部无任何挂点。
- **头部天然可追加**：`Modal` 已支持 ReactNode 的 `title` / `subtitle` / `headerExtra` / `headerActions`
  （`src/ui/feedback/Modal.ts:12-24`）；`OverlayHead` 顺序 = 标题组 → spacer → actions → 关闭钮
  （`src/ui/infra/overlay.ts:146-151`）⇒ 追加动作天然落在「继续对话」之后、✕ 之前，无需改浮层。
- **正文根与滚动容器**：内容根 = `div.dshpc-sv`（`SessionViewModal.ts:1229`）；真正滚动的是核心
  `Modal` 的 body（`:870` 取 `.dshpc-modal__body`），故槽放在 `div.dshpc-sv` 内即随会话一起滚，
  不遮挡 footer（footer 在 body 之外）。
- **正文两条分支**：`:1144-1163`，空态/加载/错误分支 = `[hint, runningRow]`（无「加载更早」按钮），
  正常分支 = `[加载更早, ...rendered, ...pendingRows, runningRow]`；`runningRow` 是永远的最后一项。
- **样式链**：`src/adv/session/session.css`（真源）→ `scripts/gen-css.mjs` → `session-css.generated.ts`；
  `pretest` 带 `gen-css --check`，手改生成物会红。
- **测试现状**：Web 侧单测 = SSR（`react-dom/server.renderToStaticMarkup`）+ 官方 primitives stub
  （`test/session-render.test.mjs:1-16`、`test/primitives-hooks.mjs`）；SSR 可行前提已验证：
  `Modal` 不用 portal（`src/ui/feedback/Modal.ts:76`），`applyStyle` 在无 document 时直接返回
  （`src/design/style-kit.ts:61`）。**`SessionViewModal` 目前没有任何渲染测试**
  （`test/session.test.mjs:1-10` 头注：mirror 组件需 stub loader 才能在 Node 里 import）。
- **空槽一致性判断点**：`div.dshpc-sv` 是 `display:flex;flex-direction:column;gap:10px`
  （`src/adv/session/session.css`）⇒ 槽容器必须「不传就不渲染元素」，否则空容器会多吃一个 10px gap。

## Conclusion

未开工：任务已登记，等与用户讨论定案后实现。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261106-0429-83be-sessionviewmodal-内容插槽 --note "...". -->
- 2026-11-06 04:29:19 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created
- 2026-11-06 04:35:25 · claim · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · claimed → doing
