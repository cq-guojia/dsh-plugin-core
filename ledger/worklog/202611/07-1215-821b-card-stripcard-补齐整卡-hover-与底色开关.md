# 20261107-1215-821b-card-stripcard-补齐整卡-hover-与底色开关: Card / StripCard 补齐整卡 hover 与底色开关

- **Tags**: 卡片, 悬停变色, 底色, 发版
- **Status**: done · 2026-11-07 13:30:53 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-07 12:15:45 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Sealed**: 2026-11-07 13:30:53 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

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

- [x] `CardSharedProps` 加 `hoverable?: boolean`（默认 `false`）与 `filled?: boolean`（默认 `true`），`CardShell` 输出 `dshpc-card--hoverable` / `dshpc-card--no-fill`（默认都不输出，零破坏）。
- [x] `card.css` 把 StripCard 的 `background:` 收敛成 `--surface-bg:`，新增 `--no-fill{--surface-bg:transparent}` 与整卡 `--hoverable:hover{--surface-bg:var(--dshpc-card-hover)}`。
- [x] 手势：用户反馈「开关打开手势就该变」⇒ `.dshpc-card--hoverable{cursor:pointer}`（`src/ui/display/card.css:89`）；未开 hover 轴的卡片保持默认光标。
- [x] 演示：用户反馈「没有带底色的演示」⇒ demo 的 Card / StripCard 从 2 档扩成**四档对照**（`filled: true` 带底 / `filled: false` 透明 / `hoverable: true` / `hoverable + filled:false`），外层垫 `--dshpc-surface-sunken` 让白面与透明面看得出来。
- [x] 测试：`test/card.test.mjs` 新增 3 条（默认态 / 开关组合 / CSS 契约），契约里补 `cursor:pointer` 断言。
- [x] 文档：`docs/help/ui.doc.ts` Card section 的 prose / API / 示例；`docs/design/style.md` 新增「卡片整卡 hover 与底色轴」章节（含手势口径）。
- [x] demo：`packages/demo/src/sections/controls.tsx` 四档示例，`packages/demo/src/i18n.ts` 中英 hint 同步。
- [x] `build` / `build:demo` / `pnpm test`（338 pass）/ `typecheck` / codelint（10 文件 L0-L5 全过）全绿；产物核对通过，stamp `261107-203124-607`。
- [x] 用户 2026-11-07 验收（「行，可以了」）⇒ 按指令 bump `v0.35.4`、提交推送、打 tag 发版、close。
- [x] 发版复核：两包 `version` 与 tag 同号 `0.35.4`；重跑 `build` / `build:demo` 后 demo bundle 内 `v0.35.4` ×4、无 `0.35.3` 残留；338 tests / typecheck / codelint（12 文件 L0-L5）全绿。
- 范围外：不动 `Surface`（纯框容器四根轴、零业务语义）；不跨仓删兄弟项目那 2 条 CSS（发版后另开）。

## Next

收尾动作（本轮执行）：补完正文 → 记一条 log → `close` 结案。发版之后单独另开的事：兄弟项目把依赖升到 npm `^0.35.4`，再删掉自己写的 2 条 hover CSS 并改用 `hoverable`（本任务不跨仓改它）。

## Process

- 归类：不新建控件、不另立模块 —— 给现有 `ui/display` 的 Card / StripCard 加外观轴（`docs/design/structure.md:35,44` 已把两者登记在展示类）。`Surface` 契约（`src/ui/display/Surface.ts:53-56`）是「底 / 边 / 圆角 / 内距四根轴、零业务语义」，hover 属状态轴，不加到基类，避免波及 demo / ListRow / 兄弟项目 editor 的所有 Surface 使用点。
- 必拆雷：`src/ui/display/card.css:67` 现在直接写 `background:` 属性，没走 `--surface-bg` 变量（`surface.css:7-8` 既定契约）；兄弟项目用 `background-image` 渐变叠加正是被这个逼出来的。不先收敛成变量，hover / 透明都会被优先级打架。
- 优先级草案：strip 设 `--surface-bg`（0,2,0）→ `--no-fill` 覆盖为 transparent（0,2,0，写在后面）→ `--hoverable:hover` 用 (0,3,0) 压过前两者；Surface 基类 `background:var(--surface-bg)`（0,1,0）自动吃到新值。
- 兼容性：hover 默认关 = 纯新增、零破坏；`filled` 默认 true = 维持现状，不破坏兄弟项目 4 个使用点与本仓 demo。用户拍板「整卡变色」，hover 作用在根节点，与兄弟项目现在的「内部子行 / 头部变色」视觉不同 —— 迁移由消费方自行决定。
- 颜色统一 `--dshpc-card-hover`，不再混用 `--dshpc-hover` / `--dshpc-plate-hover`；明暗由 token 的 `body[data-ds-dark-theme]` 段自动跟随。
- 实现落点：`src/ui/display/Card.ts` 的两个 prop 与类名数组、`src/ui/display/card.css` 的 strip 底色收敛与两条状态规则；`src/design/tokens.css` 未改（token 早已存在，只是此前零消费）。
- 关键验证：CSS 自定义属性在同一元素上按选择器优先级解析，`--hoverable:hover` 是 (0,3,0)，压过 strip / no-fill 的 (0,2,0)；Surface 基类 `background:var(--surface-bg)`（0,1,0）自动吃到新值，所以三态只需改一个变量，`filled:false + hoverable:true` 组合也成立（hover 时显示卡片蓝）。
- 回归证据：`dist/ui/display/card-css.generated.js` 实测 `--surface-bg:var(--card-accent-soft,transparent)` ×1、`--surface-bg:var(--dshpc-card-hover)` ×1、旧 `background:var(--card-accent-soft` ×0；`packages/demo/dist/client.js` 含 `dshpc-card--hoverable` ×2、`dshpc-card--no-fill` ×2、hover 规则 ×1。
- 兼容性复核：`test/card.test.mjs` 原有 5 条断言（含默认 className 精确串、StripCard 类名串）全过 ⇒ 默认渲染一个字节没变；338 tests 全绿。
- 返工一（用户反馈「开关只要打开，鼠标移上去的手势就应该变」）：`hoverable` 的语义是「整卡可交互」，不只是换背景 ⇒ `src/ui/display/card.css:89` 加 `.dshpc-card.dshpc-card--hoverable{cursor:pointer}`，与 `:hover` 规则同源同开关；未开 hover 轴的卡片保持默认光标，不动 `Surface` / 全局。`test/card.test.mjs` 契约测试补 `cursor:pointer` 断言。
- 返工二（用户反馈「Card 没有带底色的演示」）：首版 demo 只摆了透明 / hover 两档，而 `filled` 默认 true 的带底形态反而没显式露出 ⇒ `packages/demo/src/sections/controls.tsx:1434,1510` 把 Card / StripCard 各扩成四档（`filled:true` 带底 / `filled:false` 透明 / `hoverable:true` / `hoverable + filled:false`），外层垫 `--dshpc-surface-sunken` 让白面与透明面分得开；`packages/demo/src/i18n.ts` 中英 hint 改成「四档 · hover 开启带手势」。
- 文档同步：`docs/help/ui.doc.ts` 的 `hoverable` API 行补「整卡 hover 变色 + 光标变 pointer」、prose 补「透明底 + hover 也照常变色」；`docs/design/style.md`「卡片整卡 hover 与底色轴」章节补手势口径。
- 返工回归：`pnpm run build` / `build:demo` / `pnpm test`（338 pass）/ `typecheck` / codelint（10 文件 L0-L5）全绿；`dist/ui/display/card-css.generated.js` 的 `cursor:pointer` ×1、`--surface-bg:var(--dshpc-card-hover)` ×1；demo bundle 里 `cursor=1` / `filledTrue=4` / `hoverPlusNoFill=3`；最终 stamp `261107-203124-607`。
- 发版（用户指令「改 Tag 提交发版」）：发版前两包 `0.35.3`、最新 tag `v0.35.3`，纯新增兼容能力取 patch `v0.35.4`；改两处 `package.json:3` 后必须重跑 `build:demo`，因为 `packages/demo/dist/client.js:70937-70938,71255-71256` 把两包版本号打进了 bundle。同号三道闸：`.github/workflows/publish.yml:50-59`、`demo-publish.yml:48-57`、`test/version-sync.test.mjs:15-23`。
- 提交与发版结果：`git commit` `f11945d`（21 文件，含 `dist/`）→ push `main` → `git tag v0.35.4` → push tag，触发两个 workflow 自动 `npm publish`；未做本地 `npm publish`，`v0.35.4` 指向 `f11945d`。

## Conclusion

- 已完成：Card / StripCard 新增 `hoverable`（整卡变色，默认关）与 `filled`（底色，默认有底）两根轴；hover 统一 `--dshpc-card-hover`；StripCard 底色从 `background` 属性收敛为 `--surface-bg` 变量；测试 / 帮助文档 / 样式规范 / demo 双语同步；产物已生成，本机宿主刷新可见。
- 返工完成：`hoverable` 打开即带 `cursor:pointer`（手势与变色同开关，透明底 hover 照常变色）；demo 补成四档对照，显式展示默认的带底色形态。
- 定案：不新建控件、不动 Surface；hover 作用根节点（用户拍板「整卡变色」），与兄弟项目现在的「内部子行 / 头部变色」不同，迁移由消费方自行决定。
- 发版：`v0.35.4` == 根 `package.json` == `packages/demo/package.json` 的 version；`f11945d` 已推 `main` 且含 `dist/`，tag 已推并触发双包发布；提交前 338 tests / typecheck / codelint（12 文件 L0-L5）全绿。
- 留下的坑：本机无浏览器，真机效果以用户 2026-11-07 验收（「行，可以了」）为准；兄弟项目仍装 npm `^0.35.3`，需自行升到 `^0.35.4` 才能拿到新能力并删掉自写的 2 条 hover CSS（本仓不跨仓改）。
- 台账状态：验收通过、已发版，按用户指令 close 结案。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261107-1215-821b-card-stripcard-补齐整卡-hover-与底色开关 --note "...". -->
- 2026-11-07 12:15:45 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-07 12:17:20 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 建单认领并写清 worklog 前五节：兄弟项目 Card/StripCard 自写 hover CSS 的现场证据、--dshpc-card-hover 零消费、card.css:67 的 background 属性必先收敛成 --surface-bg 变量；用户拍板整卡变色 + 统一 token，底色默认维持有底；下一步 card.css:64-68
- 2026-11-07 12:24:09 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 按拍板实现：Card/StripCard 加 hoverable(默认关,整卡变色)+filled(默认有底)，StripCard 底色 background 属性收敛成 --surface-bg 变量，hover 统一 --dshpc-card-hover；测试+3条(338 pass)、帮助文档/样式规范/demo 双语与示例同步；build/build:demo/typecheck/codelint(10) 全绿，stamp 261107-202133-796，产物核对旧 background ×0；待真机看效果，未提交未发版
- 2026-11-07 12:39:32 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 返工收口：hoverable 打开即 cursor:pointer（src/ui/display/card.css:89），demo Card/StripCard 扩成带底/透明/hover/透明+hover 四档（packages/demo/src/sections/controls.tsx:1434,1510）；test/card.test.mjs 补手势断言、docs/help/ui.doc.ts 与 docs/design/style.md 与双语 hint 同步；build/build:demo/338 tests/typecheck/codelint(10) 全绿，stamp 261107-203124-607；代码与 dist 未提交未发版，doing 待真机验收
- 2026-11-07 13:30:39 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 用户验收通过（行，可以了）并指令改 Tag 提交发版：两包 bump v0.35.4（package.json:3 / packages/demo/package.json:3），重跑 build/build:demo 让 demo bundle 带上新版本号；338 tests / typecheck / codelint(12 文件) 全绿；commit f11945d 推 main（含 dist），tag v0.35.4 已推触发 publish.yml + demo-publish.yml 双包发布；worklog 补发版事实与三处同号校验，下一步 close 结案
- 2026-11-07 13:30:53 · close · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · sealed: Card / StripCard 补齐 hoverable（整卡变色 + cursor:pointer，统一 --dshpc-card-hover）与 filled（底色）两轴，StripCard 底色收敛为 --surface-bg；demo 四档对照、帮助文档/样式规范/双语 hint/回归测试同步；338 tests / typecheck / codelint(12 文件) 全绿；bump v0.35.4，commit f11945d 推 main（含 dist），tag v0.35.4 已推触发双包发版
