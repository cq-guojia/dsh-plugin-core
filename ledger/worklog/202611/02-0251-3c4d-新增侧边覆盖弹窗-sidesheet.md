# 20261102-0251-3c4d-新增侧边覆盖弹窗-sidesheet: 新增侧边覆盖弹窗 SideSheet

- **Tags**: 控件, 弹窗, 覆盖式, SideSheet
- **Status**: done · 2026-11-02 03:47:04 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-02 02:51:29 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Sealed**: 2026-11-02 03:47:04 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

用户 2026-11-02 提需求：要一个**覆盖式**的侧边弹窗，效果跟现有的 PanelDock 分栏差不多，但**不挤窄主区**（原内容保留），从**左边**滑出。三个方案比较后选第三种（新建独立控件）：

1. 给 PanelDock 加参数改形态 —— 否。PanelDock 一半实现是「占宽专属」（publishInset / mainMinWidth 视口夹 / 收起耳朵），覆盖式一行用不上；且调用契约相反（布局成员要挂载点，浮层自铺遮罩）。
2. 给 Modal 加 side 参数 —— 否。Modal 的 size 体系（sm/md/lg + width/height）全是「居中盒子」假设。
3. 新建 SideSheet —— 采用。

用户另有硬要求：**能公用的必须抽象出来**。

命名：查了 Ant Design（Drawer + placement，默认 right）、shadcn/ui（Sheet + side，默认 right；Drawer 在那边专指底部）、MUI（Drawer + anchor，默认 left）、Material 3（Side sheet / Navigation drawer）—— 没有哪个库把方向写进组件名。定 `SideSheet`（避免与 PanelDock 的中文「分栏 / 抽屉」混淆，也不与 shadcn 的底部 Drawer 撞名）。

## To Do

- **真机验证**（本仓没有浏览器渲染测试）：滑入动效、遮罩与右侧分栏同开时的让位、明暗两套、与宿主弹窗 / 菜单的 z 层叠；**拖宽**（左右两侧、到下限 / 上限的夹取、拖拽期蓝线与分栏是否一致）。
- demo 展示已加（ui 页 → 反馈件 → 「侧边抽屉（覆盖式）」，左 / 右 / 带底栏三颗按钮），但 demo 走 npm 分发，**只有打 tag 才看得到**，当前未发版。
- 宽度记忆不做（拖出来的宽度只活在组件内）；收起 / 耳朵**明确不做**（用户 2026-11-02：抽屉没有收回那个东西）。

## Next

- 真机验收：插件里写 `{open && h(SideSheet, { title, onClose }, children)}`，确认从左侧滑入、遮罩盖住主区但不压暗右侧 PanelDock、Esc 与 ✕ 都能关。
- 要用户在插件市场看到 demo 展示：bump 0.18.0 → build + build:demo → commit + push → tag v0.18.0（等用户明确说「发版」）。

## Process

- 公共件抽成 `src/ui/overlay.ts`（`OverlayMask` / `OverlayHead` / `useEscapeClose`）+ `src/ui/overlay.css`，Modal 与 SideSheet 共用；遮罩**只有这一份**（新增测试钉住）。
- 第二轮（用户要求「样式跟 PanelDock 分栏一模一样、中间能拖、不要收起」）把**面板皮肤**从 `panel-dock.css` 抽成 `src/ui/side-panel.css`：新增中性基类 `.dshpc-side-surface`（背景 / 阴影 / 纵向 flex / 入场动画 `dshpc-side-in`）+ 原有 `dshpc-dock__head|__title|__lead|__extra|__close|__body|__resizer` 与拖拽高亮规则。**类名沿用 dock 前缀**（既有公开面，只搬文件不改名）。
- 拆分口径：**皮肤共用、定位各自写**。`panel-dock.css` 只剩 sticky 占位 / 占宽缝 / 收起钮 / 耳朵 / 拖动期 iframe；`side-sheet.css` 只剩 `position:absolute` + 贴边描边 + 拖拽条镜像 + 底栏。断言由 `css-contract` 的新用例钉住（皮肤类只许在 SIDE_PANEL_CSS 里定义基础规则，后代选择器做镜像不算）。
- SideSheet 改用 PanelDock 那套头部（`icon` / `title` / `extra` / `header` / 关闭钮绝对定位），去掉 subtitle / headerActions；宽度改为 `number`（初始 460、下限 320、上限默认遮罩盒宽），默认 `resizable`，拖宽复用 `resizer.ts`，松手写回组件 state。
- 拖拽条永远在**朝内**那一侧：`.dshpc-sheet--left .dshpc-dock__resizer{right:0}`（左侧抽屉拖右缘，右侧抽屉拖左缘）。
- 旧类名 `dshpc-modal-mask` / `dshpc-modal__head|__heading|__lead|__title*|__close|__extra|__spacer|__actions|__sid` 改为中性的 `dshpc-overlay*`。改名前 grep 过整个 `/code/dsh-plugins`：外部只有 dist 里打进去的 core 副本，没有手写样式覆盖。
- `dshpc-modal` / `dshpc-modal__body` / `dshpc-modal__foot` 保留原样（消费方可能挂家族档）；SM 变体的头部选择器改成 `.dshpc-modal--sm .dshpc-overlay-head`（特异性更高，不依赖注入顺序）。
- z 档：遮罩走 `--dshpc-z-drawer`（1040，token 里早就预留、此前无人使用），夹在 dock(1030) 与 modal(1070) 之间。
- 测试：`test/css-contract.test.mjs` 收进 `OVERLAY_CSS` / `SIDE_SHEET_CSS`，新增「遮罩只有一份：SideSheet 不许自己再写一层」；新建 `test/side-sheet.test.mjs` 5 条 SSR 结构断言。
- 文档：`docs/help/ui.doc.ts` 加 `ui-sidesheet` 一节 + exports，`gen-docs` 重新生成 `docs/help/ui.md` 与 demo 的 `doc-data.generated.ts`（顺带跑 `build:demo`）。

## Conclusion

- 新增 `src/ui/SideSheet.ts` / `overlay.ts` / `overlay.css` / `side-panel.css` / `side-sheet.css`（含 generated）+ 导出 `SideSheet` / `SideSheetProps` / `SideSheetSide`。
- Modal 改用 overlay 公共件（props 面不变）；PanelDock 改用 side-panel 公共皮肤（props 面不变，渲染多一个 `dshpc-side-surface` 类）。
- SideSheet = 与 PanelDock 同一套皮肤 + 同一套拖宽 + 无收起；开关行为与 Modal 同款。
- demo：反馈件页新增「侧边抽屉（覆盖式）」展示（左 / 右 / 带底栏）。
- `pnpm run build` 干净；`pnpm test` 219 条全过；`koc-codelint` 全过（27 文件）。
- 遗留：真机未验（见 To Do）；宽度记忆未做。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261102-0251-3c4d-新增侧边覆盖弹窗-sidesheet --note "...". -->
- 2026-11-02 02:51:29 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created
- 2026-11-02 02:58:14 · claim · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · claimed → doing
- 2026-11-02 03:03:48 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 新增 SideSheet（src/ui/SideSheet.ts）+ 抽公共件 overlay.ts/overlay.css（OverlayMask/OverlayHead/useEscapeClose），Modal 改用公共件；build 干净、test 215 条全过、codelint 全过；待真机验收
- 2026-11-02 03:15:19 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · demo 补 SideSheet 展示（反馈件页：左/右/带底栏）；顺手修掉改名残留 dshpc-modal__sid → dshpc-overlay-head__sid（demo 三处）；typecheck + build:demo + test 215 全过
- 2026-11-02 03:29:38 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · SideSheet 改为与 PanelDock 同一套皮肤：抽 src/ui/side-panel.css（.dshpc-side-surface + 头部/拖拽条/关闭钮），PanelDock 一并改用；加拖宽（resizer.ts 复用、宽度 460/320 默认可拖、朝内侧镜像）、去掉收起；test 219 条全过、codelint 27 文件全过
- 2026-11-02 03:47:04 · close · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · sealed
