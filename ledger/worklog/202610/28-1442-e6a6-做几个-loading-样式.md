# 20261028-1442-e6a6-做几个-loading-样式：做几个 loading 样式

- **标签**：ui、loading、控件
- **状态**：doing · 2026-10-28 15:00:08 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **创建**：2026-10-28 14:42:39 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- 头部四行由脚本维护，顺序固定：标签 → 状态 → 创建 → 封卷。
     「- **标签**：…」按 new --tags 插在最上面，没有标签就不写（分类只进台账与历史，不进本文档）；
     「- **封卷**：…」在结案时加在最后。 -->

## 背景

用户 2026-10-28 原话要点：

- 加载提示原理像引入的 Toast：**所有控件引用都落在同一处**，不许「这个空间加载一次、那个空间又加载一次」；
- 另要可**就地放置**的形态（放进表格 / 任意空间）；
- 参数：默认不带遮罩（后面随便点），传参才拉全屏遮罩挡住；遮罩默认全透明，可传透明度；
- 两种样式：① 仿 Toast（图标换成转圈，灰底 info 色，默认文案「数据加载中」/「loading」）；② 方块卡，padding 更大，转圈在上、文字在下；
- 两种样式通用参数：文案、是否需要遮罩、遮罩透明度；
- 做完补 demo 站与文档。

## 待办

- 待用户验收：demo「反馈」页的两张卡、遮罩与七向按钮（真机看观感 / 屏位 / 遮罩挡不挡点击）。

## 下一步

待用户验收后按需微调样式数值（`src/ui/controls/loading.css` 的 min-width / padding / 遮罩浓度默认值）。



## 过程

- 跨副本单例复刻 `toast-host.ts` 的手法：新建 `src/ui/loading-host.ts`（`Symbol.for('dsh-plugin-core/loading-host')` + `claimLoadingHost`），宿主实现放在 `src/ui/Loading.ts` 的 `createLoadingHost`，entries 攒请求、每次变更重渲染唯一浮层根。
- 位置统一在屏幕正中（`.dshpc-loading-overlay`，`inset:0 var(--dshpc-page-inset-right,0px) 0 0` 与 Modal 遮罩同一套让位口径）；浮层本身 `pointer-events:none`，只有遮罩层 `pointer-events:auto` —— 不开遮罩时页面照常可点。
- 遮罩多条请求同时在场时只铺一层、取最浓的 `maskOpacity`；默认 0 = 全透明但仍挡住点击（用户原话「默认是全透明的」）。
- 两种卡共用灰面：`#f4f4f5 / #3f3f46`（与 `notify` 的 info 卡同色），暗色判据 `body[data-ds-dark-theme]`；转圈沿用 Button 的 SVG 矢量弧画法（border 画环在次像素下会被抗锯齿拉毛，`src/ui/controls/button.css:38-41` 有前车之鉴）。
- 就地组件 `LoadingToast` / `LoadingBlock` 只收文案（不含遮罩）：它们没有自己的层叠上下文，遮罩会盖住自己，位置与遮挡归调用方。
- 默认文案新增字典 key `loadingDefault`（`src/utils/i18n.ts`，中「数据加载中」/ 英「Loading」），死 key 自检盯得住。
- 自检：`test/feedback.test.mjs` 新增 3 条（无 DOM 返回空句柄、宿主单例、两种卡类名与文案）。
- 第二轮（用户验收前微调）：长条卡 min-width 200 → 250（+1/4）；全局默认屏位改 `bottom-center`（与 Toast 同屏位），`LoadingPosition` 七值（六向 + `center`）+ `loadingOverlayClass`（`src/ui/loading-host.ts`），CSS 六个 `--top-*` / `--bottom-*` 修饰类、`center` 走基础规则；同一时刻只有一个屏位，以最后一次调用为准、关掉后回落到还活着的那条（`src/ui/Loading.ts` 的 `flush`）。自检补一条「定位类名 ⇄ CSS 修饰类」对账。
- 第三轮（用户追问「为什么同时出现两个」）：根因是宿主把每次 `show` 都 push 进 entries 各自渲染一张 —— 连点 N 次就叠 N 张。改成**唯一槽位** `createLoadingSlot()`（`src/ui/loading-host.ts`，纯逻辑可测）：后一次直接顶掉前一次，被顶掉那次的句柄 `close()` 按 id 判空操作，旧定时器不会误关新卡。同时确认「不自动消失」：`showLoading` 从来没有任何计时参数，收起只能 `close()`（demo 里的 1.2s 只是演示用的定时器）。自检补一条单槽位语义（顶替 / 旧句柄无效 / 重复关无副作用）。

## 结论

- 新增导出：`showLoading(opts)` → `{ close() }`、`LoadingToast`、`LoadingBlock`，及类型 `LoadingOptions` / `LoadingViewProps` / `LoadingVariant` / `LoadingPosition` / `LoadingHandle`（`src/ui/index.ts`）。全局只有一张卡，不自动消失。
- 样式真源 `src/ui/controls/loading.css`（已生成 `loading-css.generated.ts`），产物 `dist/` 与 demo `packages/demo/dist/` 已重新构建。
- 文档：`docs/help/ui.doc.ts` 反馈件节补两条 prose + 三行 API（投影 `docs/help/ui.md` 与 demo `doc-data.generated.ts` 已重新生成）；demo 反馈页新增「加载提示 · 两种样式」示例。
- 验证：`pnpm run build`、`pnpm run typecheck`、`pnpm run build:demo`、`pnpm test`（146 项全过）、`koc-codelint` 全层通过。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress log --id <任务号> --note "一句话"。 -->
- 2026-10-28 14:42:39 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 创建任务并认领
- 2026-10-28 14:47:19 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 新增 showLoading / LoadingToast / LoadingBlock（src/ui/Loading.ts、loading-host.ts、controls/loading.css），demo 反馈页与 docs/help/ui.doc.ts 已补；build + typecheck + 146 项自检 + codelint 全过，待用户验收
- 2026-10-28 14:53:17 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 按验收意见改：长条卡 200→250px、默认屏位改 bottom-center、新增 position 七向（src/ui/loading-host.ts loadingOverlayClass + loading.css 六个修饰类）；build/typecheck/147 项自检/codelint 全过
- 2026-10-28 15:00:08 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 修「同时出现两个」：宿主 entries 改唯一槽位 createLoadingSlot（后一次顶掉前一次，旧句柄 close 按 id 空操作）；确认 showLoading 无计时参数、只能 close；新增单槽位自检，148 项全过
