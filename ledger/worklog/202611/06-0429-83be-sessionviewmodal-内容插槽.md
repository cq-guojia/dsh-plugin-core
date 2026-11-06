# 20261106-0429-83be-sessionviewmodal-内容插槽: SessionViewModal 内容插槽

- **Tags**: 会话预览, 插槽, 扩展点, 向后兼容
- **Status**: doing · 2026-11-06 04:55:56 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
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

已实现并自检全绿（2026-11-06），剩两项：

- [ ] 真机验收：弹窗里看三处位置、滚动、空态；归档会话下确认归档徽标落在动作区最前。
- [ ] 版本号：minor（0.35.0）。本仓规则 = 调试期不 bump 不打 tag，等用户说发版再走。

实现清单（全部完成）：

1. `src/ui/infra/overlay.ts`：`OverlayHeadProps.header`（`ReactNode | null`）+ 自定义分支。
2. `src/ui/feedback/Modal.ts`：`ModalProps.header` 透传 + `showHeader` 判据。
3. `src/adv/session/SessionViewModal.ts`：`title`（新增）/ `heading`（旧名保留）/ `header` /
   `headerActions` / `bodyHeader` / `bodyFooter`。
4. `src/adv/session/session.css`：`.dshpc-sv-body-header` / `.dshpc-sv-body-footer`（只 `min-width:0`）。
5. `test/session-slots.test.mjs`：7 条 SSR 断言（无槽一致 / 四态 / 顺序 / 两级标题 / 动作顺序）。
6. demo `SessionPage`：标题 + 标签、自定义动作、正文两端各一块。
7. `docs/help/session.doc.ts`（双语）+ 生成物 `session.md`、demo doc-data。

## Next

等用户验收：`pnpm test` 全绿（321 条）后，在 dsh 里打开 demo 的「真实会话列表」点开任一会话，
看标题行标签、「示例动作」按钮位置、正文顶端 / 底端两块是否随会话滚动；再看一眼归档会话的徽标位置。

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
| `title?: ReactNode` | 标题行（第一级） | 只换标题文字那一行；下方 `sessionId` 副标题行、归档徽标仍由核心渲染，位置不变。旧名 `heading?: string` 保留（deprecated，`title ?? heading`） |
| `header?: ReactNode` | 整个标题区（第二级） | 标题行 + `sessionId` 副标题行整块交给调用方，核心不再画这两行；归档徽标改挂动作区最前 |
| `headerActions?: ReactNode` | 头部右侧动作区 | 排在核心「继续对话」之后、关闭 ✕ 之前（`overlay.ts:146-151` 天然顺序） |
| `bodyHeader?: ReactNode` | 会话内容最顶端 | 会话滚动容器内第一个，在「加载更早」与全部节点之前；随会话滚动 |
| `bodyFooter?: ReactNode` | 会话内容最底端 | 会话滚动容器内最后一个（运行中行之后、footer 之前）；随会话滚动 |

**命名的依据（用户要求：不拍脑袋，照本仓与市场惯例取）**

| prop | 依据 |
|---|---|
| `title` | 本仓 14 处控件都用 `title`（Modal / SideSheet / PanelDock / SectionHead / AlertModal…），业界 Ant Design / MUI / Element Plus 同为 `title`；`heading` 只有本组件在用，属异类，故降为兼容旧名 |
| `header` | **本仓已有两处同义先例**：`SideSheet.header`（`SideSheet.ts:40`）与 `PanelDock` 的 `header`（`PanelDock.ts:82`），语义都是「不传=内置头 / null=不要头 / 其他=自绘整块」；业界 Element Plus `el-card` `el-dialog` 的 `header` 插槽同义 |
| `headerActions` | 沿用 `Modal.headerActions`（`Modal.ts:24`）既有词汇，不新造 |
| `bodyHeader` / `bodyFooter` | 容器分区在业界是 header / body / footer 三分（MUI CardHeader-CardContent-CardFooter、Element `el-card` header/footer、Primer/shadcn 同构）；弹窗自身已有 `footer`（底栏输入框），故用 `body` 前缀限定作用域，避免同名撞车。**否掉了草案的 `lead` / `tail`**：lead/tail 是排版术语，UI 库几乎不用 |

**为什么第二级要动核心 `Modal`**：现在 `Modal` 只有 `title` / `subtitle` 两个分槽，没法整块替换标题组；
把整块塞进 `title` 会吃 `.dshpc-overlay-head__title` 的 `font-size:var(--dshpc-font-lg);font-weight:600`
（`src/ui/infra/overlay.css:45`），等于给调用方强加字号字重。故给 `OverlayHead` / `Modal` 加
`header`（替换 `.dshpc-overlay-head__titlegroup` 那一块），算核心控件的通用能力，不是会话专用口子。

**二级模式下归档徽标不丢**：归档标识现在挂 `headerExtra`（`SessionViewModal.ts:1182-1187`，在标题行右侧），
`header` 覆盖标题区后会一起消失。处理 = `header` 存在时把归档徽标挪到 `headerActions` 首位
（`header` 已传时 `headerExtra` 不再传）。归档是数据事实，不能因为调用方自定义标题就消失。

**其余定案（用户「其他都同意」）**

- 两个内容槽在**加载 / 空 / 出错 / 正常**四态都渲染（两条分支各插一处）。
- 槽容器 CSS 只给 `min-width:0`，不给 `display:flex` / `gap` —— 一旦变成 flex，
  单个按钮会被 `align-items:stretch` 拉满宽，等于替调用方决定了排版。
- 测试做 SSR 全套（无槽 HTML 一致 / 四状态 / 顺序 / header 顺序 / 二级标题）。
- 类名 `dshpc-sv-body-header` / `dshpc-sv-body-footer`（跟 prop 同名，`dshpc-sv-*` 前缀）。

### 实现记录（2026-11-06）

- `overlay.ts`：`OverlayHeadProps.header`，自定义分支包一层 `__heading--custom`（`flex:1 1 auto` 占满左侧、可换行）。
- `Modal.ts`：`ModalProps.header` 透传 + `showHeader` 判据加 `header !== undefined`（`null` 也要能进头部，免得动作区/✕ 被吞）。
- `SessionViewModal.ts`：`title ?? heading ?? 「会话预览」`；`header` 存在时标题/副标题/headerExtra 全不传；
  `bodyHeader` / `bodyFooter` 两分支各插一处，`undefined` 时不渲染元素（`flex` 的 `gap:10px` 不会凭空多一格）。
- **SSR 坑（本次新增第三参）**：`useSyncExternalStore` 缺 `getServerSnapshot` 在 SSR 直接抛错，原来 chat / session
  两处都没传 ⇒ 本次补成「同一个快照函数」（数据挂在 props 的 `view` 上，不是全局 store，服务端读同值不串数据）。
- **测试坑**：`test/primitives-stub.mjs` 是白名单，缺 `IconClockOutlineRegular` / `IconWrapFillRegular` /
  `IconNowrapFillRegular` / `CodeBlock`，走 `SessionViewModal` 的 import 链会报 "does not provide an export named"；
  已补齐（漏一个就在链接阶段报一次，报错信息指得很准）。
- 自检：`pnpm test` 321 条全绿（新增 `test/session-slots.test.mjs` 7 条）；`codelint` 14 文件六层全过。

### 2026-11-06 用户验收反馈（三条，已改）

1. **`headerActions` 排到「继续对话」左边**：动作区最终顺序 = 归档徽标 → 调用方动作 → 继续对话 → ✕
   （「继续对话」与 ✕ 恒居最右）。改 `SessionViewModal.ts` 的 `headActions` 排序 + 测试断言反转。
2. **标题里徽标下沉**：不是核心的锅 —— demo 示例把文字与 `Chip` 直接并排，`Chip` 是 inline-flex，
   贴基线对齐就显低。示例与文档改成 `display:inline-flex; align-items:center; gap:6px` 包一层；
   文档同时写明这个写法（槽内容排版归调用方）。
3. **`bodyFooter` 位置改到尾部操作行之上**：原来落在整条流末尾（在复制 / 分支 / 用量行下面）。
   现在 = 末尾节点是**带回复的 turn-tail** 时，把它挂在该 tail 节点之前（`renderKeyedNode` 的
   `footerSlot` / `footerKey`），即「最后那条回复之后、操作行之前」；末尾不是 tail 或 `closing` 为空时
   仍回落到流末尾；两种情况都保证只渲染一处（`footerAnchorKey === undefined ? bodyFooterRow : null`）。
   新增 2 条测试钉住：回话时在 `data-turn-tail` 之前且只出现一次；无回话时回落末尾。

## Conclusion

已实现待验收：`SessionViewModal` 新增 `title` / `header` / `headerActions` / `bodyHeader` / `bodyFooter`
（`heading` 保留为旧名），`Modal` 新增 `header`；无槽时 DOM 与 0.34.0 一致（测试钉住）；demo 与
`docs/help/session.*` 同步。版本号未 bump（调试期）。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261106-0429-83be-sessionviewmodal-内容插槽 --note "...". -->
- 2026-11-06 04:29:19 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created
- 2026-11-06 04:35:25 · claim · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · claimed → doing
- 2026-11-06 04:35:52 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 认领；API 定稿 5 props（heading 放宽/二级 titleArea/headerActions/bodyLead/bodyTail），定案见 worklog Process；下一步 overlay.ts:107 加 titleArea
- 2026-11-06 04:47:24 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 实现完成：SessionViewModal 加 title/header/headerActions/bodyHeader/bodyFooter（heading 留旧名）+ Modal.header；命名按本仓 title/header/headerActions + 业界 bodyHeader/bodyFooter；新增 test/session-slots 7 条，pnpm test 321 全绿，codelint 全过
- 2026-11-06 04:55:56 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 按验收反馈改三处：headerActions 移到继续对话左边、bodyFooter 挂到最后 turn-tail 之前（操作行之上，无回复回落末尾）、demo 标题用 inline-flex 修徽标下沉；测试 323 全绿
