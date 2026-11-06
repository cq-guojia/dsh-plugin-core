# 20261106-0429-83be-sessionviewmodal-内容插槽: SessionViewModal 内容插槽

- **Tags**: 会话预览, 插槽, 扩展点, 向后兼容
- **Status**: doing · 2026-11-06 04:35:52 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
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

用户 2026-11-06 对标题槽的原话澄清（推翻了「一个标题槽」的草案）：

> 左边那个标题现在其实有两块：第一块是上面那个标题的文字，第二块是那个 sessionid。
> 肯定要开放两层：第一层就是我去定义那个标题的文字（加链接、后面加标签、加按钮），
> 但是那个 sessionid 还是由我们去显示；还有一种方式，就是那个 sessionid 他都不要，
> 整个这一块他自己去定制。我觉得这要开放这两级。

内容顶端 / 底端：随会话一起滚动，内容由调用方自己插（用户已确认）。

## To Do

API 已定稿（决策见 Process「2026-11-06 讨论定稿」），剩下按顺序实现：

1. `src/ui/infra/overlay.ts`：`OverlayHeadProps` 加 `titleArea`，标题组整块可替换。
2. `src/ui/feedback/Modal.ts`：`ModalProps` 加 `titleArea`（透传 + `showHeader` 判据）。
3. `src/adv/session/SessionViewModal.ts`：`heading` 放宽为 `ReactNode`，新增
   `titleArea` / `headerActions` / `bodyLead` / `bodyTail`，四处渲染点接线。
4. `src/adv/session/session.css`：`.dshpc-sv-lead` / `.dshpc-sv-tail`（只 `min-width:0`），
   跑 `scripts/gen-css.mjs` 重新生成。
5. 新建 SSR 渲染测试（`test/` 下，需 `register` primitives stub + 假 `view`）：
   无槽 HTML 一致 / 四状态都有槽 / `lead` 第一 `tail` 最后 / header 动作顺序 / 二级标题生效。
6. demo `packages/demo/src/sections/blocks.tsx` 的 `SessionPage`：标题自定义 + 顶端提示条 +
   底端汇总块示例。
7. 文档 `docs/help/session.doc.ts`（双语真源）→ 跑 `scripts/gen-docs.mjs` 生成 `.md` 与 demo doc-data。
8. 版本：minor（0.35.0）；调试期是否 bump / 打 tag 待用户定（本仓规则：调试期不 bump 不打 tag）。

## Next

从 `src/ui/infra/overlay.ts:107` 的 `OverlayHeadProps` 开始加 `titleArea`，再改 `:134` 的标题组渲染分支
（`titleArea !== undefined` 时用它替掉 titlerow + subtitle，`icon` 与 `headerExtra` 语义一并定案见 Process）。

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

### 2026-11-06 讨论定稿（用户拍板）

**最终 API（5 个 props，全部可选）**

| prop | 位置 | 说明 |
|---|---|---|
| `heading?: ReactNode` | 标题行（第一级） | 现有 prop 由 `string` 放宽（string 是 ReactNode 子集，向后兼容）。**只换标题文字那一行**；下方 `sessionId` 副标题行、归档徽标仍由核心渲染，位置不变 |
| `titleArea?: ReactNode` | 整个标题组（第二级） | 标题行 + `sessionId` 副标题行整块交给调用方，核心不再画这两行。传了就忽略 `heading` |
| `headerActions?: ReactNode` | 头部右侧动作区 | 排在核心「继续对话」之后、关闭 ✕ 之前（`overlay.ts:146-151` 天然顺序） |
| `bodyLead?: ReactNode` | 会话内容最顶端 | `div.dshpc-sv` 内第一个，在「加载更早」与全部节点之前；随会话滚动 |
| `bodyTail?: ReactNode` | 会话内容最底端 | `div.dshpc-sv` 内最后一个（运行中行之后、footer 之前）；随会话滚动 |

**为什么第二级要动核心 `Modal`**：现在 `Modal` 只有 `title` / `subtitle` 两个分槽，没法整块替换标题组；
把整块塞进 `title` 会吃 `.dshpc-overlay-head__title` 的 `font-size:var(--dshpc-font-lg);font-weight:600`
（`src/ui/infra/overlay.css:45`），等于给调用方强加字号字重。故给 `OverlayHead` / `Modal` 加一个
`titleArea`（替换 `.dshpc-overlay-head__titlegroup` 的子内容），算核心控件的通用能力，不是会话专用口子。

**二级模式下归档徽标不丢**：归档标识现在挂 `headerExtra`（`SessionViewModal.ts:1182-1187`，在标题行右侧），
`titleArea` 覆盖标题组后会一起消失。处理 = `titleArea` 存在时把归档徽标挪到 `headerActions` 首位
（`titleArea` 已传时 `headerExtra` 不再传）。归档是数据事实，不能因为调用方自定义标题就消失。

**其余定案（用户「其他都同意」）**

- 两个内容槽在**加载 / 空 / 出错 / 正常**四态都渲染（两条分支各插一处：`SessionViewModal.ts:1144` 与 `:1155`）。
- 槽容器 CSS 只给 `min-width:0`，不给 `display:flex` / `gap` —— 一旦变成 flex，
  单个按钮会被 `align-items:stretch` 拉满宽，等于替调用方决定了排版。
- 测试做 SSR 全套（无槽 HTML 一致 / 四状态 / 顺序 / header 顺序 / 二级标题）。
- 类名 `dshpc-sv-lead` / `dshpc-sv-tail`（沿用 `dshpc-sv-*` 前缀）。

## Conclusion

未开工：API 已定稿（见 Process「2026-11-06 讨论定稿」），按 To Do 顺序实现中。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261106-0429-83be-sessionviewmodal-内容插槽 --note "...". -->
- 2026-11-06 04:29:19 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created
- 2026-11-06 04:35:25 · claim · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · claimed → doing
- 2026-11-06 04:35:52 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 认领；API 定稿 5 props（heading 放宽/二级 titleArea/headerActions/bodyLead/bodyTail），定案见 worklog Process；下一步 overlay.ts:107 加 titleArea
