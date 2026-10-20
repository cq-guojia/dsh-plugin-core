# 20261020-0827-card-圆角-边框-短色条-调整-demo-预览页-card-组件样式-ae39：Card（圆角+边框+短色条）调整 demo 预览页 Card 组件样式

> **创建**：2026-10-20 08:27:40（@GuoJia-Agent）
> **分类**：界面 ｜ **标签**：Card、demo、样式

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

用户原话：「开个新坑，然后建一个新任务。Card（圆角 + 边框 + 短色条）把这一页的组件样式调了。你先去接任务。」

「这一页」= demo 预览站的卡片页 `CardPage`（`packages/demo/src/sections/controls.tsx:544`），展示 `Card` 与 `StripCard` 两个组件。

## 待办

- 待用户验收：demo 预览站 CardPage 与兄弟项目截图（任务列表卡 + 执行记录块）对比。
- `StripCard` 已改为 `Card` 的兼容别名（渲染一致）；是否直接删掉这个别名，等用户发话。

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

## 结论

Card 外观已统一为兄弟项目执行记录块同款：同色系浅底（accent 档驱动）+ 1px 不可见占位边框 + 5px 通高方角色条贴左缘 + 方角；`StripCard` 成为 `Card` 兼容别名。demo CardPage 两节均换新外观（记录流节去容器、块间 4px），文案与 `docs/design/features/ui.md` 同步。产物已重建入库路径（dist/），未 commit（等用户验收与指示）。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-20 08:27:40 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-20 08:29:51 · log · @GuoJia-Agent · 只读调查：Card 现状已是圆角8px+1px边框+短色条（card.css:13-14），生成物/dist/注入/token 全同步，待用户确认要调什么
- 2026-10-20 08:30:41 · log · @GuoJia-Agent · 用户确认方向：微调 Card 外观数值，目标值待给（圆角/边框/色条宽/留距）
- 2026-10-20 08:47:31 · log · @GuoJia-Agent · Card 外观统一为兄弟 rec-item 同款（浅底+透明占位边框+5px通高方角色条+方角）：改 card.css/Card.ts/demo 两文件/features-ui.md，build+49 测试+codelint 全过，待验收
