# 20261107-1215-821b-card-stripcard-补齐整卡-hover-与底色开关: Card / StripCard 补齐整卡 hover 与底色开关

- **Tags**: 卡片, 悬停变色, 底色
- **Status**: doing · 2026-11-07 12:17:20 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-07 12:15:45 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

用户 2026-11-07 在 `/code/dsh-plugins/dsh-task-dispatch-table` 看到 `Card`（边框 + 圆角 + 短色条）与 `StripCard`（浅底 + 通高色条）都在用，但两处「鼠标移上去变色」都是**插件自己写 CSS 伪类**，核心没这个能力。评估后用户拍板三条：① hover = **整卡变色**；② 颜色**统一走 `--dshpc-card-hover`**；③「建个台账认领开工」。评估里第 1 个待拍板项（底色默认）用户未表态，按建议执行：**维持有底，只加显式关的开关**。

只读查证（2026-11-07）：

- 核心 `src/ui/display/Card.ts:30-48` `CardSharedProps` 无 hover / tone / filled 轴；`src/ui/display/card.css:86` 唯一 `:hover` 是折叠箭头，不是整卡。
- 核心 `src/design/tokens.css:57,321` 定义 `--dshpc-card-hover`（亮 `rgba(37,99,235,.07)` / 暗 `rgba(96,165,250,.13)`），全仓 `*.css` **零消费** —— token 早备好了。
- 核心 `src/ui/display/ListRow.ts:18,52` 已有 `hoverable?: boolean` + `hover = hoverable ?? interactive` 的开关先例。
- 兄弟项目 `src/client/task-list.tsx:83` `.dsh-tdt-card-row:hover{background:var(--dshpc-card-hover)}`（Card 的内部子行）；`src/client/records-timeline.tsx:132` `.dsh-tdt-rec-head:hover{background-image:linear-gradient(var(--dshpc-hover),var(--dshpc-hover))}`（StripCard，渐变叠加只为不盖掉浅底）；`task-list.tsx:79` 注释「surface-1 底 + 边框 + 圆角，本仓不再写底色」。
- 兄弟项目 `docs/design/external/plugin-core-controls.md:169` 已把 Card / StripCard 的 hover 缺口登记为「待核心支持」。
- 兄弟项目 `package.json:62` 依赖 `"dsh-plugin-core": "^0.35.3"`（npm registry，非本地路径）⇒ 新能力要发版才到得了，本轮不跨仓改它。

## To Do

- [ ] `CardSharedProps` 加 `hoverable?: boolean`（默认 `false`）与 `filled?: boolean`（默认 `true`），`CardShell` 输出对应类名。
- [ ] `card.css` 把 StripCard 的 `background:` 属性收敛成 `--surface-bg:` 变量，再加整卡 hover 与透明档规则，颜色统一 `--dshpc-card-hover`。
- [ ] 测试：`test/card.test.mjs` 补默认态 / 开关态 / CSS 契约断言。
- [ ] 文档：`docs/help/ui.doc.ts` Card section 的 prose + API 两行；`docs/design/style.md` 记「卡片 hover 统一 token、默认关」口径。
- [ ] demo：`packages/demo/src/sections/controls.tsx` 的 Card / StripCard 展示区加 hover / 透明示例，`packages/demo/src/i18n.ts` 双语文案。
- [ ] `build` / `build:demo` / `pnpm test` / `typecheck` / codelint 全过并核对产物。
- [ ] 待用户真机看效果；任务保持 doing，未提交 / 未发版。
- 范围外：不动 `Surface`（纯框容器四根轴、零业务语义）；不跨仓删兄弟项目那 2 条 CSS（发版后另开）。

## Next

先改 `src/ui/display/card.css:64-68`：把 `background:var(--card-accent-soft,transparent)` 换成 `--surface-bg:var(--card-accent-soft,transparent)`，再按优先级追加 `--no-fill`（transparent）与 `--hoverable:hover`（`--dshpc-card-hover`）两条；随后改 `src/ui/display/Card.ts:30-48,77-85` 输出类名。

## Process

- 归类：不新建控件、不另立模块 —— 给现有 `ui/display` 的 Card / StripCard 加外观轴（`docs/design/structure.md:35,44` 已把两者登记在展示类）。`Surface` 契约（`src/ui/display/Surface.ts:53-56`）是「底 / 边 / 圆角 / 内距四根轴、零业务语义」，hover 属状态轴，不加到基类，避免波及 demo / ListRow / 兄弟项目 editor 的所有 Surface 使用点。
- 必拆雷：`src/ui/display/card.css:67` 现在直接写 `background:` 属性，没走 `--surface-bg` 变量（`surface.css:7-8` 既定契约）；兄弟项目用 `background-image` 渐变叠加正是被这个逼出来的。不先收敛成变量，hover / 透明都会被优先级打架。
- 优先级草案：strip 设 `--surface-bg`（0,2,0）→ `--no-fill` 覆盖为 transparent（0,2,0，写在后面）→ `--hoverable:hover` 用 (0,3,0) 压过前两者；Surface 基类 `background:var(--surface-bg)`（0,1,0）自动吃到新值。
- 兼容性：hover 默认关 = 纯新增、零破坏；`filled` 默认 true = 维持现状，不破坏兄弟项目 4 个使用点与本仓 demo。用户拍板「整卡变色」，hover 作用在根节点，与兄弟项目现在的「内部子行 / 头部变色」视觉不同 —— 迁移由消费方自行决定。
- 颜色统一 `--dshpc-card-hover`，不再混用 `--dshpc-hover` / `--dshpc-plate-hover`；明暗由 token 的 `body[data-ds-dark-theme]` 段自动跟随。

## Conclusion

进行中：现场事实与方案已定、台账已认领，实现未开始。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261107-1215-821b-card-stripcard-补齐整卡-hover-与底色开关 --note "...". -->
- 2026-11-07 12:15:45 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-07 12:17:20 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 建单认领并写清 worklog 前五节：兄弟项目 Card/StripCard 自写 hover CSS 的现场证据、--dshpc-card-hover 零消费、card.css:67 的 background 属性必先收敛成 --surface-bg 变量；用户拍板整卡变色 + 统一 token，底色默认维持有底；下一步 card.css:64-68
