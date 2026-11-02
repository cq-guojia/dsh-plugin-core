# 20261102-0251-3c4d-新增侧边覆盖弹窗-sidesheet: 新增侧边覆盖弹窗 SideSheet

- **Tags**: 控件, 弹窗, 覆盖式, SideSheet
- **Status**: doing · 2026-11-02 03:15:19 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-02 02:51:29 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

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

- **真机验证**（本仓没有浏览器渲染测试）：左侧滑入动效、遮罩与右侧分栏同开时的让位、明暗两套、与宿主弹窗 / 菜单的 z 层叠。
- demo 展示已加（ui 页 → 反馈件 → 「侧边抽屉（覆盖式）」，左 / 右 / 带底栏三颗按钮），但 demo 走 npm 分发，**只有打 tag 才看得到**，当前未发版。
- 拖宽、宽度记忆、收起耳朵**明确不做**（那是 PanelDock 的能力）。

## Next

- 真机验收：插件里写 `{open && h(SideSheet, { title, onClose }, children)}`，确认从左侧滑入、遮罩盖住主区但不压暗右侧 PanelDock、Esc 与 ✕ 都能关。
- 要用户在插件市场看到 demo 展示：bump 0.18.0 → build + build:demo → commit + push → tag v0.18.0（等用户明确说「发版」）。

## Process

- 公共件抽成 `src/ui/overlay.ts`（`OverlayMask` / `OverlayHead` / `useEscapeClose`）+ `src/ui/overlay.css`，Modal 与 SideSheet 共用；遮罩**只有这一份**（新增测试钉住）。
- 旧类名 `dshpc-modal-mask` / `dshpc-modal__head|__heading|__lead|__title*|__close|__extra|__spacer|__actions|__sid` 改为中性的 `dshpc-overlay*`。改名前 grep 过整个 `/code/dsh-plugins`：外部只有 dist 里打进去的 core 副本，没有手写样式覆盖。
- `dshpc-modal` / `dshpc-modal__body` / `dshpc-modal__foot` 保留原样（消费方可能挂家族档）；SM 变体的头部选择器改成 `.dshpc-modal--sm .dshpc-overlay-head`（特异性更高，不依赖注入顺序）。
- z 档：遮罩走 `--dshpc-z-drawer`（1040，token 里早就预留、此前无人使用），夹在 dock(1030) 与 modal(1070) 之间。
- 测试：`test/css-contract.test.mjs` 收进 `OVERLAY_CSS` / `SIDE_SHEET_CSS`，新增「遮罩只有一份：SideSheet 不许自己再写一层」；新建 `test/side-sheet.test.mjs` 5 条 SSR 结构断言。
- 文档：`docs/help/ui.doc.ts` 加 `ui-sidesheet` 一节 + exports，`gen-docs` 重新生成 `docs/help/ui.md` 与 demo 的 `doc-data.generated.ts`（顺带跑 `build:demo`）。

## Conclusion

- 新增 `src/ui/SideSheet.ts` / `overlay.ts` / `overlay.css` / `side-sheet.css`（含 generated）+ 导出 `SideSheet` / `SideSheetProps` / `SideSheetSide`。
- Modal 改用公共件，对外 props 面不变。
- `pnpm run build` 干净；`pnpm test` 215 条全过；`koc-codelint` 全过（20 文件）。
- 遗留：真机未验（见 To Do）；拖宽 / 耳朵 / demo 页未做。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261102-0251-3c4d-新增侧边覆盖弹窗-sidesheet --note "...". -->
- 2026-11-02 02:51:29 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created
- 2026-11-02 02:58:14 · claim · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · claimed → doing
- 2026-11-02 03:03:48 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 新增 SideSheet（src/ui/SideSheet.ts）+ 抽公共件 overlay.ts/overlay.css（OverlayMask/OverlayHead/useEscapeClose），Modal 改用公共件；build 干净、test 215 条全过、codelint 全过；待真机验收
- 2026-11-02 03:15:19 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · demo 补 SideSheet 展示（反馈件页：左/右/带底栏）；顺手修掉改名残留 dshpc-modal__sid → dshpc-overlay-head__sid（demo 三处）；typecheck + build:demo + test 215 全过
