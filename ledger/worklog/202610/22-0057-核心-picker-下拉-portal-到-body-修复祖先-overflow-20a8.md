# 20261022-0057-核心-picker-下拉-portal-到-body-修复祖先-overflow-20a8：核心 Picker 下拉 portal 到 body，修复祖先 overflow 裁剪

> **创建**：2026-10-22 00:57:10（@GuoJia-Agent）
> **分类**：缺陷 ｜ **标签**：Picker、浮层、裁剪

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

用户发现 demo 选择器下拉较长时，超出包裹它的「框」(`.dshpc-doc-example { overflow:hidden }`，`packages/demo/src/demo.css:56`) 的部分被裁掉，只显示框内部分。硬要求：**别人（其他插件）引用时绝不能再发生**。

经排查（2026-10-22）：根因在核心，不在 demo。
- `Picker` 下拉菜单是根节点内联子元素（`src/ui/Picker.ts` 菜单 div 挂在 root 内）、`position:absolute` 相对 `.dshpc-picker`（`src/ui/picker.css:17-22`），**没有 portal**。祖先只要有 `overflow`/`transform`/固定高度即被裁。
- demo 的 `overflow:hidden` 只是把这个缺陷暴露出来的那个容器。
- 全仓 `src/ui` 里只有 Picker 这一处会外溢的弹出层（Tooltip/HoverCard 走官方 primitives 自带 portal；`field/card/panel-dock` 的 absolute 都是组件内装饰）。`ModelPicker`/`WorkspacePicker` 包 Picker，修一个全受益。

定调（用户 2026-10-22）：不要最小改动、不要最省——要**最正规 / 最通用 / 架构最健壮**。

## 待办

- 核心 `Picker` 菜单 portal 到 `document.body` + 工业级浮层定位（已定 **Floating UI**）。
- 键盘 / 外部点击 handler 改到跨 portal 工作（React portal 合成事件仍沿 React 树冒泡，键盘天然可用；外部点击 containment 须认 portal 节点）。
- 重建 dist + demo；跑 typecheck/test/lint；视觉裁剪验证交用户（属视觉现象）。

## 下一步

改 `src/ui/Picker.ts`：用 `useFloating`(`flip`/`shift`/`offset`/`autoUpdate`/`size`) + `FloatingPortal`；trigger 挂 `refs.setReference`、菜单挂 `refs.setFloating` + `floatingStyles`；外部点击 `mousedown` 同时认 `rootRef` 与 `refs.floating`。
改 `src/ui/picker.css`：去掉菜单 `position:absolute/top/left/min-width`（改由 Floating UI 内联控制），宽度/最大高由 `size` 中间件内联设置。
随后 `gen-css` 重生成 → `build` → `build:demo` → `test`。

## 过程

- `package.json`：`dependencies` 新增 `@floating-ui/react ^0.27.20`（与既有 `@uiw/react-codemirror`/`sonner` 同列，非 `@deepseek-ai/*`，不破 ui 零官方依赖）。
- `src/ui/Picker.ts`：
  - 导入 `useFloating / FloatingPortal / flip / shift / offset / autoUpdate / size`。
  - 新增 `useFloating({ placement:'bottom-start'|'top-start', middleware:[offset(4),flip(),shift({padding:8}),size({apply→width/ maxHeight 内联})], whileElementsMounted:autoUpdate, strategy:'fixed' })` —— viewport 相对、`position:fixed`、滚动/缩放自动跟随、贴边自动翻转，彻底避开祖先 `overflow`/`transform` 裁剪。
  - 触发器挂 `refs.setReference`；菜单包进 `FloatingPortal` 渲染到 `document.body`，挂 `refs.setFloating` + `floatingStyles`。
  - 外部点击 `mousedown` 同时认 `rootRef` 与 `refs.floating`（否则点选项会被误关）。
  - 键盘 handler 仍挂在 root：React portal 合成事件沿 React 树冒泡，从浮层输入框/选项的 keydown 仍能到达，无需改动。
  - 踩坑：`size` 中间件与局部 `const size = props.size ?? 'md'`（PickerSize）重名 → 导入改名 `floatingSize`。
- `src/ui/picker.css`：菜单去掉 `position:absolute / top / left / min-width`（改由 Floating UI 内联控制），删除已废弃的 `--up` 变体（翻转交给 `flip`）。
- `gen-css` 已重生成 `picker-css.generated.ts`，`build:demo` 已重打 `dist/client.js`。

## 结论

- 核心 Picker 下拉从「根节点内联绝对定位」改为「`FloatingPortal` 到 `document.body` + 工业级浮层定位」，祖先后裔的 `overflow`/`transform`/固定高度不再裁它；这是 Radix/MUI 同款最健壮做法。
- `pnpm run build` + `build:demo` 通过，`pnpm test` 77/77 绿，无 tsc/lint 错误。
- 待办/边界：① 视觉裁剪属布局现象，仓库内无独立 demo 运行环境，需真实浏览器（或 CI 视觉）确认；② 极端场景「Picker 嵌在 Modal 内」时菜单 z-index(60) 可能被宿主弹窗层盖住，属已知边角、不在本次裁剪缺陷范围内；③ 如需更进一步 a11y，可接 Floating UI `useListNavigation`/`useRole`（当前键盘/外部点击已可用，非阻塞）。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-22 00:57:10 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-22 01:08:57 · log · @GuoJia-Agent · 实施：Picker 菜单 FloatingPortal 到 body + Floating UI 定位（flip/shift/offset/autoUpdate/size）；build/typecheck/test 77 绿；视觉裁剪待浏览器确认
