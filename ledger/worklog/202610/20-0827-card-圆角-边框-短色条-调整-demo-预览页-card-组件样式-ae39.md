# 20261020-0827-card-圆角-边框-短色条-调整-demo-预览页-card-组件样式-ae39：Card（圆角+边框+短色条）调整 demo 预览页 Card 组件样式

> **创建**：2026-10-20 08:27:40（@GuoJia-Agent）
> **分类**：界面 ｜ **标签**：Card、demo、样式

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

用户原话：「开个新坑，然后建一个新任务。Card（圆角 + 边框 + 短色条）把这一页的组件样式调了。你先去接任务。」

「这一页」= demo 预览站的卡片页 `CardPage`（`packages/demo/src/sections/controls.tsx:544`），展示 `Card` 与 `StripCard` 两个组件。

## 待办

- 待用户验收（第五轮）：框式短条改 -2px；SectionHead 3 组示例（3 图标 / 标题后缀 / 两右侧组合）；icon+标题垂直居中修复。

## 下一步

- 用户在 demo 预览站（或宿主内）看 CardPage 验收；通过后再按用户指示提交（不主动 commit）。

## 过程

2026-10-20 只读调查（未改任何文件）：

- `Card`（bordered 外观）现状即用户描述的样式：圆角 8px + 1px 边框 + 色条上下留距（短条）——`src/ui/card.css:13-14`；`StripCard` 是另一外观：无圆角无边框、色条通高（`:17-18`）。
- 链路均同步：生成物 `src/ui/card-css.generated.ts` 与真源一致；`dist/ui/card-css.generated.js` 含相同规则；`CARD_CSS` 已并入注入（`src/ui/css.ts:35`），`Card.ts:37` 调 `ensureControls()`。
- 依赖 token 均已定义：`--dshpc-border`（`src/design/tokens.css:54`）、`--dshpc-surface-1`（`:13`）。
- 工作区干净（`git status` 无改动），无未提交的样式修改。

2026-10-20 用户纠正方向（非调数值）：贴了两张兄弟项目截图（任务列表卡 + 执行记录块），指出「边框和底色完全不对」，要求把样式搬进核心、只抄样式不搬东西、命名守核心规范。

定位与决策：

- 执行记录块真源 = `dsh-task-dispatch-table/src/client/records-timeline.tsx:112-130`：`border:1px solid transparent` + `background:var(--rec-tone-soft)` + 5px 通高方角色条贴左缘 + 方角；浅底 token `--tdt-*-soft`（浅 8% / 暗 5%）与我们的 `--dshpc-*-soft`（`src/design/tokens.css:97-100,235-238`）同值；neutral 档浅底兄弟用 chip-bg（我们对应 `--dshpc-chip-bg`）。
- 任务列表卡 = `dsh-task-ledger/packages/plugin/src/client/ui.ts:103-115`（surface + 实色边框 + 短 rail）——与我们的旧 Card 同构，不可能是「边框底色不对」的靶子；两张截图自洽（通高左条 + 浅底 + 无可见边框），故以 rec-item 为唯一样式基准。
- 用户第一条消息的「圆角 + 边框 + 短色条」实为 demo 页区块标题（`packages/demo/src/i18n.ts:251` 旧值 `demoCardTitle`），是在给旧样子命名，不是目标。

落地（2026-10-20，改动 6 文件）：

- `src/ui/card.css`：外观统一——浅底 `--card-accent-soft`、`1px solid transparent` 占位边框、色条 5px 通高方角贴左缘、方角、左内边距 21px（16 留白 + 5 条宽，内容从色条右缘起算）；删除 `--bordered` / `--strip` 两套外观规则。
- `src/ui/Card.ts`：`CardShell` 去掉 `kind`；`StripCard` 改为 `Card` 兼容别名（渲染一致）。
- demo `controls.tsx`：StripCard 段改渲染 `Card`，去掉下沉圆角容器，块间 4px（兄弟流水账规格）。
- demo `i18n.ts`：4 条中英文案改为描述新外观。
- `docs/design/features/ui.md`：Card/StripCard 章节同步新规格。

验证：`pnpm run build` + `build:demo` 通过；`pnpm test` 49/49 绿（含 gen-css 同步闸、css-contract 同名选择器闸）；koc-codelint 6 文件全层过；dist 生成物确认无旧外观类。

2026-10-20 第二轮（用户看图后纠正）：两种样式不许合并——第一种（浅底通高条）保留，第二种（图里框式卡）也要抽象进核心；且右侧槽被顶到顶部是 bug，调用方裸放元素应自动垂直居中。

- 框式卡真源 = `dsh-task-ledger/packages/plugin/src/client/ui.ts:103-115`（`.dtl-taskrow` + `.dtl-rail`）：surface-1 + 1px `--dtl-border` + `--tdt-radius-sm` + 行内 6×36 `--tdl-radius-xs` 短条 + `align-items:center` + padding 12/14 + gap 12。token 与我们的 `--dshpc-*` 完全同源（tokens.css:13/54/143-144），直接映射。
- 修正内容：恢复 `CardShell(kind)` 双外观（`--bordered` / `--strip`）；`.dshpc-card__head` 改 `align-items:center`（两种外观都居中）；色条 span 移入头部第一个子元素（bordered 行内短条需参与 flex）；demo 记录流节改回 `StripCard`；i18n 四条案 + `docs/design/features/ui.md` 同步双外观与居中约定。
- 验证：build + build:demo 通过；`pnpm test` 49/49 绿；codelint 6 文件全层过；生成物确认含 `align-items:center` 与两套外观类。

2026-10-20 第三轮（用户继续提规范）：

- **容器职责确认**（用户原话口径）：外壳只提供「外框 + 左竖条颜色 + 整体垂直居中」；里面几列、每列放什么、悬停浮出的按钮，全是调用方自己的事，我们不负责。
- **垂直居中规则定稿**：一级子项目默认垂直居中；调用方自己放了带高度的 div 并在里面自居中的，不动；裸放的 button 等元素必须自动居中。
- **「框式右侧没居中」真因**：demo 框式示例的日期放在调用方自己的内容里（标题 baseline 行），没走 `action` 槽 ⇒ 不受居中路管。已把日期移入 `action` 槽，并加「action 裸放一个 button」的框式示例。
- **竖条修正**（用户指「新建的左边竖条」= 框式短条）：`height:36px` 写死 → `align-self:stretch` + `min-height:var(--dshpc-line-md)`（一行文字时齐高、不撑卡；两行时跟内容）；Card padding 由 `12px 14px` → 全向 `14px` ⇒ 条子距左 / 上 / 下外间距恒等（两行时的匀称间距为准）。StripCard 的 5px 通高绝对定位条不动（上一轮已批准）。
- **demo 清理**：按用户要求删掉右侧小箭头（toggle）示例——「小箭头不是推荐用法」，该示例只留一个 button；连带移除 `open` 状态。 StripCard 节保留两条（DAY:1 + 执行成功）。
- **宽度确认**：两样式默认 100% 宽（block div，无 width 声明）；demo 显示约 640px 是 demo 包装器 `maxWidth:'640px'` 所为，非组件行为，不改。
- 验证：build + build:demo 通过；`pnpm test` 49/49 绿；codelint 6 文件全层过；生成物确认含 `align-self:stretch;min-height` 与 `padding:14px`。

2026-10-20 第四轮（demo 示例补全）：

- StripCard 节补「单行 accent 五档速览」（与 Card 节同款，inline padding 8/12）；第二个事例（执行成功）右侧加 `Button{size:'sm',variant:'secondary'}` Cancel 钮——对应用户截图里深灰底白字圆角钮，尺寸与「查看会话」示例同为 sm（24px）。
- 容器职责再次向用户确认并记录：卡内内容 100% 调用方定制，与控件无关；demo 里的标题 / chips / 按钮都只是从其他控件（Chip / Button / 文本）引进的示例。
- 验证：build + build:demo 通过；`pnpm test` 49/49 绿；codelint 6 文件全层过。

2026-10-20 第五轮（demo 收口）：

- Cancel 钮由 `secondary`（灰实心、无描边）改 `outline`（描边档），尺寸仍 `sm`（与查看会话同档）。
- 核对「示例控件全部来自核心」：demo 无 `h('button')` / `h('input')` / 手写 `dshpc-*` 类；controls / blocks / client 三处控件均 import 自 `dist/ui/index.js`。唯一手写 UI = demo 设置页入口卡（`client/index.tsx:123`，demo 壳、非示例）——未动，已向用户说明。
- 验证：build + build:demo 通过；`pnpm test` 49/49 绿；codelint 6 文件全层过。

## 结论

Card 外壳提供**两种外观 + 整体垂直居中**（2026-10-20 第二轮修正：撤回第一轮的「二合一」，按用户明确要求恢复双外观并补上图示框式卡）：

- `Card`（框式，照 `dsh-task-ledger` 任务行 `.dtl-taskrow`，ui.ts:103-115）：surface 底 + 1px 边框（`--dshpc-border`）+ 圆角（`--dshpc-radius-sm`）+ 行内 6×36 圆角短条（`--dshpc-radius-xs`）；padding 12/14、头部 gap 12。
- `StripCard`（浅底条，照 `dsh-task-dispatch-table` 执行记录块 rec-item）：同色系浅底（`--dshpc-*-soft`，accent 档驱动）+ 1px 不可见占位边框 + 方角 + 5px 通高方角色条贴左缘；左内边距 21px（16 留白 + 5 条宽）。
- **垂直居中修复**：头部由 `align-items:flex-start` 改 `align-items:center`——调用方在 `action` 裸放一个元素即垂直居中，不用自己套容器（用户第一轮指出的「右边垂直居顶」bug）。
- 两种外观共享同一份 props；框内一行两行、右侧放什么、悬停浮出的按钮都由调用方自定，外壳只提供框与居中。
- 色条 DOM 位置调整：`<span class="dshpc-card__bar">` 移入头部第一个子元素（bordered 行内短条需要参与 flex；strip 绝对定位不受影响）。

验证：`pnpm run build` + `build:demo` 通过；`pnpm test` 49/49 绿；koc-codelint 6 文件全层过。产物已重建（dist/），未 commit（等用户验收与指示）。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-20 08:27:40 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-20 08:29:51 · log · @GuoJia-Agent · 只读调查：Card 现状已是圆角8px+1px边框+短色条（card.css:13-14），生成物/dist/注入/token 全同步，待用户确认要调什么
- 2026-10-20 08:30:41 · log · @GuoJia-Agent · 用户确认方向：微调 Card 外观数值，目标值待给（圆角/边框/色条宽/留距）
- 2026-10-20 08:47:31 · log · @GuoJia-Agent · Card 外观统一为兄弟 rec-item 同款（浅底+透明占位边框+5px通高方角色条+方角）：改 card.css/Card.ts/demo 两文件/features-ui.md，build+49 测试+codelint 全过，待验收
- 2026-10-20 08:47:35 · log · @GuoJia-Agent · 收工三步：正文已落本轮事实，下一步=用户验收 CardPage；改动未 commit 等指示
- 2026-10-20 09:04:58 · log · @GuoJia-Agent · 第二轮修正：恢复双外观（Card=框式照 taskrow、StripCard=浅底条照 rec-item）+ 头部改 align-items:center 修右侧居顶；build+49 测试+codelint 全过，待验收
- 2026-10-20 09:25:13 · log · @GuoJia-Agent · 第三轮：框式短条改 stretch+最小一行、padding 全向 14 使左/上/下等距；日期改走 action 槽+加单按钮示例、删小箭头示例；build+49 测试+codelint 全过
- 2026-10-20 09:30:41 · log · @GuoJia-Agent · 第四轮：StripCard 节补单行五档速览+第二事例加 secondary/sm Cancel 钮；确认卡内内容归调用方；build+49 测试+codelint 全过
- 2026-10-20 09:47:37 · log · @GuoJia-Agent · 第五轮：Cancel 钮改 outline（描边档，size 仍 sm）；核对 demo 无手写控件、示例控件全来自核心 dist/ui；build+49 测试+codelint 全过
- 2026-10-20 09:58:59 · log · @GuoJia-Agent · 已 commit 740ab1d（15 文件 +176/-110）：Card 双外观 + 头部居中 + 竖条自适应 + demo 示例收口；用户说稍后继续
- 2026-10-20 10:55:12 · log · @GuoJia-Agent · 第四轮：SectionHead 示例照兄弟 board-home 全部待办段头（Segmented 计数+192 搜索，全核心控件）；框式短条 relative left:-3px；StripCard 条 5→4px（padding 20 保 16 留白）；build+49 测试+codelint 全过
- 2026-10-20 11:24:19 · log · @GuoJia-Agent · 第五轮：框式短条 -2px；SectionHead title 拓宽 ReactNode + icon 补 lineHeight 修居中；demo 三示例（sparkle/clock/refresh 图标 + 计数/彩色标签/小字 + 过滤组/单钮/双钮）；build+49 测试+codelint 全过
