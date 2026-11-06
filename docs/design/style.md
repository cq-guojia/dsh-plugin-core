# 样式规范（本仓内部）

> EN: Style conventions (internal)

使用侧内容（token 清单、明暗判据、定制边界）在帮助文档区 `docs/help/`。
本文件只留**改动本仓样式时要守的东西**。
EN: The caller-facing material (token inventory, dark predicate, customization surface) lives in `docs/help/`.
What stays here is what you must honour when **changing styles in this repo**.

## 为什么样式只能运行时注入

> EN: Why styles can only be injected at runtime

客户端产物是 `window.__ModuleLoader__.load({ id, factory })` 的 CJS 闭包，
`import './x.css'` 只会产出独立 css 资源、**内核不加载它** ⇒ CSS 只能以 TS 字符串在运行时打进 `<style>`。

EN: The client bundle is a CJS closure loaded by `window.__ModuleLoader__.load`, so `import './x.css'` produces a
separate asset the kernel never loads — CSS must be injected at runtime as a TS string.

## 控件样式按需：每个控件只注入自己那份

> EN: Per-control styles: every control injects only its own

（2026-10-30 起）**注入是按控件的，不是一把全量**：每个控件在 render 里调
`ensureComponentStyles('<域>', <自己那份 CSS>)`（幂等，每次 render 调都安全），用不到的控件其 CSS
不进消费方的包 —— 实测只用 `Button` 时样式文本从 71.7 KB 降到 9.4 KB。

EN: Injection is per control, not one big blob. Each control calls `ensureComponentStyles('<domain>', <its own CSS>)`
during render (idempotent); CSS of controls you never use never reaches your bundle.

新增控件照做：import 自己那份 `*_CSS` 常量 + 在组件里调一次 `ensureComponentStyles`。

1. **不要顺手把别人的 CSS 一起传进去** —— 传了就退化成全量，包体省不下来。
2. **跨控件的修饰一律用更高特异性表达**（`.dshpc-split .dshpc-seg`），由提供上下文的那个控件
   负责它自己那份；**绝不靠注入顺序** —— 顺序 = 控件首次渲染顺序，不固定。
   有自检盯着：`test/css-contract.test.mjs` 禁止跨常量出现同名选择器（含 `@media` 内）。
3. **CSS 必须是 `export const X_CSS` 的字符串常量**（被显式引用的值）：`package.json` 的
   `sideEffects: false` 既不会误删它、又能让用不到的那份被摇掉。
   **绝不能退回 `import './x.css'`** —— 那是副作用式导入，webpack 官方点名它会在 `sideEffects:false`
   下被连样式一起摇掉（组件渲染出来没样式）。

EN: (1) never bundle someone else's CSS into your call; (2) express cross-control overrides with higher
specificity, never with injection order (order = first-render order, not fixed) — the contract test forbids
same-name selectors across constants; (3) keep CSS as exported string constants — never go back to
`import './x.css'`, which `sideEffects:false` would drop along with the styles.

### 为什么不用 `@layer` 分层（评估过，有意不做）

> EN: Why we deliberately do not use `@layer`

`@layer`（CSS Cascading and Inheritance L5，Baseline 2022-03）能让层序显式固定、不受注入时机影响，
听上去正好治「顺序不确定」。**但它在这里会适得其反**：

- **未分层样式压过任何层**：层级裁决优先于特异性。一旦把 dshpc 样式包进 `@layer dshpc`，
  宿主任何**未分层的元素级重置**（`button { font-size: 14px }` 之类）就会反过来压过我们，
  层内特异性再高也没用 ⇒ 控件被宿主皮肤吃掉。
- **不分层反而更稳**：现状下我们的 `.dshpc-btn`（0,1,0）靠特异性就能压过宿主的 `button`（0,0,1）。

所以「不分层」是**有意为之，不是遗漏**。真要分层，必须先把宿主的元素级样式摸清楚；而且只能整套一层
（`@layer dshpc`），**不能按组件拆层** —— 层间忽略特异性会直接打掉 `.dshpc-split .dshpc-seg` 这类
靠特异性生效的拼接定制。

EN: `@layer` would let layer order be explicit and immune to injection timing, but here it backfires:
unlayered styles beat anything inside a layer, and layer judgement precedes specificity. Wrapping our styles
in `@layer dshpc` would let the host's unlayered element resets (`button { font-size }`) override our rules no
matter how specific they are. Staying unlayered is deliberate — `.dshpc-btn` (0,1,0) already beats the host's
`button` (0,0,1) on specificity. If layering ever becomes necessary: one layer for the whole kit, never per
control.

## 交互态颜色（hover / active）

> EN: Interaction colors (hover / active)

**实心控件不用 `opacity` 表达 hover**：压 10% opacity 与底色无关，几乎不可见。
改用 token 层的**派生色**（`--dshpc-{accent,danger,success,warning,business}-hover / -active`）：

EN: Solid controls never use `opacity` for hover — it barely reads against the base color. Use the derived
token colors instead.

| 主题 | 黑底（accent） | 红 / 绿 / 黄 / 蓝底 |
|---|---|---|
| 亮色 | 掺白提亮（黑 → 灰） | 掺黑压深（红 → 暗红） |
| 暗色 | 掺黑压深（近白 → 灰） | 掺白提亮 |

- 幅度 22% / 36%（hover / active），两种主题下都「一眼看出变了」。
- 混色对象写成**固定中性色字面量** `#fff` / `#000`，不依赖宿主静态中性色是否存在。
- 旧内核不认 `color-mix` 时整条声明作废 ⇒ 回落该档原色（仍有基本可用性，只是没有 hover 反馈）。

EN: 22% / 36% for hover / active. Mix against literal `#fff` / `#000`, not host-provided neutrals. If an old
core ignores `color-mix`, the declaration drops and falls back to the base tier.

## 彩色实面上的字：只用常量色

> EN: Text on colored surfaces: constants only

语义色 / 扩展色实面（选中片、日期选中格、Chip、实心钮）上的字只能用 `--dshpc-on-signal`（白）或
`--dshpc-on-warning`（黄底深字）—— 这两条与主题无关。**不许用 `--dshpc-fg-inverse`**：它跟的是宿主
`label-primary-foreground`，暗色主题下是近黑 ⇒ 蓝底黑字。2026-10-29 用户实测发现（`Segmented` 多选蓝底与
`DateTimePicker` 起止格各中一次），已由 `test/css-contract.test.mjs` 盯着不再回潮。

EN: Text on semantic solid faces may only use `--dshpc-on-signal` (white) or `--dshpc-on-warning` (dark on
yellow); never `--dshpc-fg-inverse` — it follows the host's `label-primary-foreground`, which is near-black in
the dark theme.

## 外观轴：一个属性只有一套答案

> EN: Appearance axes: one answer per property

**不许留「视觉等价」的外观档。** 2026-10-26 删掉 `Segmented` 的 `variant`（`default` / `inset`）：
两档在 CSS 里只差 1px 内距，而 `default` 还比 `size` 承诺矮 2px ⇒ 下游以为「有得选」，
照 demo 对图时反复怀疑 token / 注入 / 打包，最后才发现拧的是个没接线的旋钮。
新增任何外观轴前先自问：切到另一档，**渲染结果真看得出不同吗**？看不出就别留这个参数。

尺寸类 props 承诺的数值必须有自检盯着（`test/css-contract.test.mjs`：`Segmented` 三档总高 = 24 / 28 / 32）。

EN: Never ship a visually equivalent appearance tier. `Segmented`'s `variant` was removed on 2026-10-26: the two
tiers differed by 1px of padding, and `default` rendered 2px shorter than `size` promised — downstream read it as
"there is a choice", compared against the demo, and chased tokens/bundling instead. Any numeric size promise gets
its own assertion.

## 箭头只有一颗：`Chevron`

> EN: There is only one arrow: `Chevron`

`ui` 层零官方依赖，箭头一律走 `src/ui/infra/chevron.ts` 的自绘 chevron（`h(Chevron, { dir, size })`，
四向共用一条路径，靠旋转实现）。**不许再写 `'▾'` / `'↑'` 这类字形**——各系统字体下粗细、角度、
基线都不一样，同一套界面里会冒出第二种箭头（2026-10-26：卡片折叠箭头就是这么来的）。
有自检盯着：`test/quality.test.mjs`。

EN: The `ui` layer has no official dependency, so every arrow comes from the self-drawn chevron in
`src/ui/infra/chevron.ts`. Never write a glyph arrow again; a test enforces it.

## 拼成一体：外壳持框，内件交边

> EN: Welding controls together: the shell owns the frame, the cells hand over their borders

多个控件拼成一个外观（`SplitGroup`、`PrefixedInput`、`NumberInput`、`DateTimePicker` 的 range 触发器）
只有一种写法：**外壳持边框 + 圆角 + `overflow:hidden` + 整体 `:focus-within`；内件把边框、底色、圆角
交出来**（`border:0; border-radius:0; background:transparent`）。不给内件再套第二个外框，也不让内件
自己画 `:focus-visible` 圈——否则格子里会冒出半圈描边。

`SplitGroup` 用后代选择器直接压内件（`.dshpc-split .dshpc-picker__trigger` / `.dshpc-split .dshpc-seg`），
所以**内件类名就是耦合点**：改这些类名或结构必须同步改 `src/ui/layout/split-group.css`，否则拼接
静默失效（双边框、底色错位），没有自检能替你发现。高度不写死——内件按自己的 `size`（sm 24 /
md 28 / lg 32）撑开，外壳跟着长；两格传同一个 `size` 才逐像素等高。**外壳绝不能用 `height:100%`
拉满内件**：它和 `.dshpc-picker__trigger--lg` / `--sm` 同特异性（两个类）且 `split-group.css`
注入更晚，会把三档高度全吃掉（md/lg 看起来一样大，2026-10-28 踩过）。万一两格 `size` 不一致，
靠外壳内 `align-items:center` 居中即可。

**左格统一灰底**（用户 2026-10-28 拍板）：第一格无论是滑块（保留自己的灰轨
`--dshpc-seg-track`）还是下拉（`> :first-child .dshpc-picker__trigger` 上 `surface-sunken`），
都呈现灰底；右格保持原样。层次感 = 左格选「档位 / 范围」，右格选「值」。

EN: Welding controls into one visual unit has exactly one recipe: the shell owns border, radius,
`overflow:hidden` and the shared `:focus-within` ring; the cells hand over border, background and radius.
`SplitGroup` overrides inner classes with descendant selectors, so those class names are the coupling point —
rename them and you must update `src/ui/layout/split-group.css`, or the weld fails silently.

## 滚动条让位：一律离边缘 1px

> EN: Scrollbars always sit 1px off the edge

本仓每个滚动容器（`overflow:auto` / `overflow-y:auto` / `overflow-x:auto`）都要让滚动条与容器的**可见边框**
之间留出 1px 缝，由容器自己的透明边框提供（横向滚用 `border-bottom`，双向两条）：

```css
border-right: 1px solid transparent;
```

**不要叠加**：容器本身已有实色边框的就不要再加（否则线变粗）。两个具体落点：

- 浮层面板里贴满内容区的滚动层（Picker 列表、日期快捷档列）：**必须**自己写那条透明边框。
  不写就贴在面板边框内壁上，缝隙是 0，看着就是贴死（2026-11-06 用户实测）。
- 容器本身就是带边框的面板（文件浏览器 ▾ 选层 `dshpc-fb__crumbs-menu`）：同一元素不能既保留
  实色边框又让位，只能接受贴边，走 `test/quality.test.mjs` 的 `PANEL_SCROLLERS` 白名单。
- 消费方自己的滚动容器同理，自己加那条边框。

**为什么没有一条全局规则**：CSS 没有 `:scrollable` 这类选择器，写不出通配所有滚动容器的规则，
所以只能每个容器自己声明，由 `test/quality.test.mjs` 扫源码兜住漏写。

原理：原生滚动条画在 padding box 之外、border 之内 —— 只有 border 能把它推离边缘，加 padding 无效。
**滚动条默认用浏览器原生样式。** 2026-11-02 试过 `::-webkit-scrollbar` 改 thumb（留 3px
缝 + 圆角）当场被否：要的就是「让出 1 像素」，不是换一套滚动条外观。
2026-11-06 口径更新：浮层内的滚动区（下拉菜单、日期快捷档列）显式挂 `.dshpc-scroll-thin`
（定义在 panel.css）——**宽度也是 1px 的一条细线**，离边仍是 1px。实现上只写
`::-webkit-scrollbar`，**不要写 `scrollbar-width`**：Chrome 一见它就切到规范化滚动条、忽略
`::-webkit-scrollbar` 的 1px（2026-11-06 实测宽度回到 ~10px）。其余容器仍是原生样式。

- 已有实色边框的容器（如 Picker 菜单的 `border:1px solid`，或挂 `.dshpc-panel` 后由面板提供的边框）
  滚动条贴的就是那条线，算已让位，**不要叠加**。
- 消费方自己的滚动容器（主区 / 侧栏）不在本仓代码里，配方相同：自己加那条 `border-right`。
  2026-11-02 起 `--dshpc-dock-gap` 已删，dock 不再替主区让 margin，改由主区容器自己让。
- 自检：`test/quality.test.mjs` 扫 `src/**/*.css`，滚动规则缺边框即红。

EN: every scroll container in this repo keeps a 1px gap between its scrollbar and its visible border, and the
container owns that gap via its own transparent `border-right` (`border-bottom` when scrolling horizontally).
Never stack it on an existing solid border. Scroll layers filling a floating panel's content box (Picker
list, date-preset column) **must** write it themselves — without it the scrollbar sits flush against the
panel border, zero gap (user-verified 2026-11-06). The one exception is a container that is itself the
bordered panel (the file-browser crumb menu), whitelisted as `PANEL_SCROLLERS` in
`test/quality.test.mjs`. Native scrollbars are painted between the padding box and the border, so only a
border moves them — padding does nothing. There is no global rule to inherit: CSS has no `:scrollable`
selector, so every container declares it itself and the test catches omissions. **Keep the native scrollbar by default**: a `::-webkit-scrollbar`
thumb (3px gap + radius) was tried on 2026-11-02 and rejected — the ask is exactly "give up 1 pixel", not a
different scrollbar look. Updated 2026-11-06: floating-layer scrollers (dropdown menus, the date-preset
column) opt into a 1px-wide hairline via `.dshpc-scroll-thin` (defined in panel.css) — width 1px, inset still
1px. Implement with `::-webkit-scrollbar` only: adding `scrollbar-width` makes Chrome switch to the
standardized scrollbar and ignore the 1px (measured ~10px on 2026-11-06). Everything else stays native.
Containers that already have a solid border count as done. Consumer-owned scroll containers use the same
one-liner; `--dshpc-dock-gap` was removed on 2026-11-02. A test enforces the border.

## 浮层三档：模态 / 锚点面板 / 菜单

> EN: Three tiers for floating surfaces — modal / popover / menu

所有「浮起来的框」的**表面**（底色 · 描边宽 · 圆角 · 阴影）只在 `src/ui/infra/panel.css` 定义，档位只有三个
（2026-11-03 用户定：样式统一，交互各家自己管）：

| 档位 | 用在 | 底色 | 描边 | 圆角 | 阴影 |
|---|---|---|---|---|---|
| `--modal` | `Modal` / `ConfirmModal` / `AlertModal` | `surface-1` | 3px | `radius-xl` | `shadow-2` |
| `--popover` | 选文件弹窗（`pickWorkspaceFile`） | `surface-1` | 1px | `radius-lg` | `shadow-2` |
| `--menu` | ▾ 选层、`Picker` 下拉 | `surface-menu` | 1px | `radius-sm` | `shadow-1` |

- 组件里**不许**再写这四个值；要改外观只改 `panel.css`。
- **定位不归档位管**：Modal 居中、选文件弹窗贴锚点并上下翻转、菜单挂触发器下方，各自实现。
- 关闭钮只有一枚 `.dshpc-panel__close`；旧类名 `.dshpc-overlay-head__close` 保留作别名（消费方覆盖不失效）。
- **关钮可退让**（2026-11-04 定）：`PanelDock` / `SideSheet` 的 ✕ 归壳，但壳允许调用方不要（`closeButton: 'none'`，`openFilePreview` 的默认）——无头面板由内容自己画，画不画、画在哪归调用方；壳画时用 `floating`（右上，占 28px：20 钮 + 6 偏移 + 2 呼吸），内容右上要让位。
- 层序只许用 `--dshpc-z-panel`（面板本体）/ `--dshpc-z-popmenu`（叠在面板上的菜单与其透明遮罩），不许写字面量。
- **不并入三档**：`PanelDock` 与 `SideSheet` 属贴边家族（`side-panel.css` 的 `.dshpc-side-surface`，
  2026-11-02 拍板两者皮肤一模一样），一个是布局成员、一个是贴边抽屉，都不是浮层。
- 组件**内部**的微层序（缩略按钮 5、拖拽条 7、dock 关闭钮 8、Segmented 的 0/1）不走 token ——
  它们只在各自 stacking context 里排序，跟页面浮层层级无关。
- 自检：`test/css-discipline.test.mjs` 盯「色值只进 `tokens.css`」「`--dshpc-panel-*` 只在 `panel.css`」；
  `test/css-contract.test.mjs` 盯「一个类名一套皮肤」。

## 三条硬规矩

> EN: Three hard rules

1. 不许再有第二处 `document.createElement('style')` —— 一律走 kit。
2. 不许再出现第二套 style 标签 id —— 一个插件一套 kit。
3. 域内的规则只能消费 `var(--dshpc-*)`，颜色 / 尺寸 / 字号一律来自 token 层，不写死值。

EN: No second `document.createElement('style')` — always go through the kit. No second style tag id — one kit
per plugin. Rules inside a domain consume `var(--dshpc-*)` only; never hard-code colors, sizes or fonts.
