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

**多选段不许比高还窄**（2026-11-07）：`Segmented` 挂 `multiple` 时每段的 `min-width` = 该档段高
（`calc(var(--dshpc-control-h-*) - 6px)`）—— 最窄正方形、文案更长则横向长方形，绝不出现竖着一小溜。
固定 `width` 的 `weekday` / `--icon-only` 也由这条下限兜住；下限只作用多选，单选外观一个字节不变。
由 `test/css-contract.test.mjs` 盯着。

EN: In `multiple` mode every `Segmented` item has `min-width` equal to its own segment height: square at the
narrowest, landscape when labels are longer, never taller than wide. Single-select rendering is unchanged.

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

## 滚动条让位：只挂 `.dshpc-scroll-thin`

> EN: Scrollbar inset: just hang `.dshpc-scroll-thin`

**唯一真源**：`src/design/tokens.css` 的 tokens 域（`ensureComponentStyles` 每次必注册、且排在
所有控件域之前 ⇒ 任何组件挂类即生效，不必额外注入 `panel` 域）。这个类**同时**给两样东西：

| 它给什么 | 唯一可调值 |
|---|---|
| 细滚动条：线宽、thumb 上下端圆角、track 透明 | 字面量三处同值（`width` / `height` / `border-radius`，现行值见 `tokens.css`） |
| 离边 1px 让位（容器自己的透明边框） | `--dshpc-scroll-inset`（现 1px） |

⚠️ **线宽不能放进 CSS 变量**：WebKit 的 `::-webkit-scrollbar` 系列伪元素不解析 `var()`，带变量的
声明会被静默丢弃 ⇒ 宽度整条作废、退回默认值。2026-11-06 把 `width:2px` 改成
`var(--dshpc-scroll-w)` 后真机当场打回，用户发现。所以线宽与圆角**必须写字面量**，改宽度只改
那一个规则块的三处数字；让位在普通元素上，仍走 `--dshpc-scroll-inset` 一行。
**不在任何别的 CSS 里抄规则、也不在组件里另写透明边框**。

原理：原生滚动条画在 padding box 之外、border 之内 —— 只有 border 能把它推离边缘，加 padding 无效。
实现只写 `::-webkit-scrollbar`，**不要写 `scrollbar-width`**：Chrome 一见它就切到规范化滚动条、
忽略这里设的宽度（2026-11-06 实测宽度回到 ~10px）。2026-11-06 用户口径：1px 太细 ⇒ 线宽起步
2px、thumb 上下端圆角；后续宽度调整只改 `tokens.css` 那三处，自检不写死数字。

### 方向档（CSS 没有 `:scrollable`，推不出滚动方向，只能显式声明）

| 滚动方向 | 挂什么 | 让位落在 |
|---|---|---|
| 竖向（`overflow-y:auto`） | `dshpc-scroll-thin` | 右 1px |
| 横向（`overflow-x:auto`） | `dshpc-scroll-thin dshpc-scroll-thin--x` | 底 1px、右归零 |
| 双向（`overflow:auto`）且底部也要让 | `dshpc-scroll-thin dshpc-scroll-thin--both` | 右 + 底各 1px |

方向档**必须与基类同挂**（线宽规则只认基类），`test/quality.test.mjs` 盯着。只要右让位的双向容器
（贴边面板 body、弹窗 body）挂基类即可，不必加 `--both`。

### 四处例外

- **本身已有实色边框**（▾ 选层菜单挂 `.dshpc-panel`）：`:not(.dshpc-panel)` 跳过让位，滚动条贴
  那条实色线即算让位；无条件叠透明边框会把实色右边框覆盖成透明。挂基类仍拿细滚动条。
- **CodeMirror**：`.cm-scroller` 由官方生成、挂不上类 ⇒ 类挂外层 `.dshpc-cv__editor`，tokens.css
  用后代选择器一并命中线宽与**右**让位；只让右不让底（给底会改 scroller 高度，CodeMirror 的
  测量循环会多算一条横滚条）。外层自己 `overflow:hidden` 不滚 ⇒ 在 `code-viewer.css` 把
  `--dshpc-scroll-inset-right` 设 `0px` 关掉自身让位，免得两层各 1px 叠成 2px。
- **消费方自己的滚动容器**（demo 左导航 / main 主区 / 表格横滚区）：配方相同，挂类即可，
  **不再自己写 `border-right: 1px solid transparent`**。2026-11-02 起 `--dshpc-dock-gap` 已删，
  dock 不替主区让 margin。
- **面板边框本身**：`test/quality.test.mjs` 仍断言 `.dshpc-panel` 带边框（上一条例外的前提）。

### 自检

`test/quality.test.mjs` 三条：① 所有滚动容器都挂基类（含 demo 的内联 `overflowY/X` —— 旧自检
只扫 CSS 文件，漏过 demo）；② 1px 让位边框不许在 tokens.css 之外出现；③ `::-webkit-scrollbar`
只许在 tokens.css 出现一份，且线宽 / 圆角必须是同一个字面量（防这次的 var 化回潮）。旧口径
「CSS 没有 `:scrollable`，只能每个容器自己声明」已被类取代。

EN: `.dshpc-scroll-thin` in `src/design/tokens.css` (tokens domain, registered on every
`ensureComponentStyles` call and sorted first) is the single source of truth for **both** the hairline
(a literal, identical value in `width` / `height` / `border-radius`) and the 1px inset
(`--dshpc-scroll-inset`, 1px). Never put the line width in a CSS variable: WebKit scrollbar
pseudo-elements do not resolve `var()`, so such declarations are silently dropped and the width falls
back to the default (hit in a real client on 2026-11-06). Hang the class; never duplicate the rules.
Native scrollbars sit between the padding box and the border, so only a border can push them off the
edge — padding does nothing. Use `::-webkit-scrollbar` only: adding `scrollbar-width` makes Chrome
switch to the standardized scrollbar and ignore the width (measured ~10px on 2026-11-06).

Direction variants (no `:scrollable` selector exists, so direction must be stated explicitly):
`dshpc-scroll-thin` for vertical (right inset), `+ dshpc-scroll-thin--x` for horizontal (bottom inset,
right zeroed), `+ dshpc-scroll-thin--both` for two-axis (right + bottom). Variants must be hung together
with the base class.

Exceptions: containers already carrying a solid border (`.dshpc-panel`) are skipped via
`:not(.dshpc-panel)` — their border is the inset. CodeMirror generates `.cm-scroller` and cannot take a
class, so the class goes on `.dshpc-cv__editor` and a descendant selector in tokens.css covers line width
and the **right** inset only (a bottom border changes scroller height and makes CodeMirror's measurement
loop add a phantom horizontal scrollbar); the non-scrolling outer layer sets
`--dshpc-scroll-inset-right:0px` in `code-viewer.css` to avoid stacking two 1px gaps. Consumer-owned
scroll containers (demo sidebar / main / table wrappers) just hang the class. `test/quality.test.mjs`
checks all three, including inline `overflowY/X` in the demo.

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
- **整条层级阶梯必须低于官方浮点 1000 档**（2026-11-06 用户定）：官方原语的 `Modal` / `ImageLightbox`
  是 `z-index:1000`（body portal），`Menu` / `Toast` 是 `1100`。我们只是宿主里的一个页面 ⇒ 宿主的浮点
  恒在我们之上。现行阶梯 dock 900 / drawer 920 / modal 940 / ear 950 / menu 960 / tip 970，全部 < 1000。
  反例代价：弹窗里点图片放大，官方原图预览被我们 1070 的遮罩压住（2026-11-06 真机踩到），
  以后在弹窗里再开官方模态也是同一个坑。出处与理由写在 `src/design/tokens.css` 的层级段注释里。
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

## 控件默认字号

> EN: Default type scale for controls

`Surface` 是纯容器，只给外框，`font:inherit` 刻意不接管内容排版；**但承载文字的控件必须在自己的域内给默认字号**
（`font-size:var(--dshpc-font-md)` + `line-height:var(--dshpc-line-md)`，与 `Table` / `Input md` 同档）。
不许把这件事推给每个消费者重复补一遍 —— 2026-11-07 用户拍板：`ListRow` 曾漏设，会话列表标题继承到宿主默认
16px，消费者被迫自己写 `fontSize` 压回去。调用方仍可用内联 style 覆盖这一档。

EN: `Surface` is a pure frame and deliberately inherits typography, but any control that renders text must set its
own default `font-size` / `line-height` from tokens (same tier as `Table` / `Input md`). Do not make every consumer
repeat it; callers can still override that tier inline.

## 行控件的两槽居中

> EN: Symmetric alignment for row slots

`ListRow` 的 `__main` 与 `__actions` 必须**同时**是 `display:flex;align-items:center`。
只给右侧操作槽居中、主内容槽留成普通块级流，调用方按常规写法把主内容包成 `inline-flex`
的 `span` 就会按基线排，基线下方多出 descender 空隙 ⇒ 左侧偏上、左右不齐
（2026-11-08 兄弟项目「附加文件」行真机反馈；用户拍板按正规方式修核心，不接受调用方逐个补）。
`__main` 的子项统一 `min-width:0`，`MarqueeText` 这类可截断内容在 flex 里才不会被自身内容撑破。
主内容内部横排结构仍归调用方 —— 核心只负责两槽的垂直对齐，不接管内容排版。

EN: Both slots of `ListRow` — `__main` and `__actions` — must be `display:flex;align-items:center`.
Centering only the actions slot leaves the main content in normal block flow, so a caller's `inline-flex`
wrapper is laid out on the baseline and gains a descender gap underneath: the left side rides high while
the right stays centered (reported from a consuming plugin on 2026-11-08; fixed in the core, not patched
per consumer). `__main > *` gets `min-width:0` so truncating content such as `MarqueeText` can still shrink
inside a flex container. The internal horizontal layout of main content remains the caller's job.

## 卡片 hover 作用域与底色轴

> EN: Card hover scope and fill switch

`Card` / `StripCard` 的悬停统一吃 `--dshpc-card-hover`（亮 `rgba(37,99,235,.07)` / 暗
`rgba(96,165,250,.13)`），由 `hoverable` 开启、**默认关**；底色由 `filled` 控制、**默认有底**。
底色只改 `--surface-bg` 一个变量，不许写 `background` / `background-image` 属性去覆盖根节点底色 ——
`StripCard` 的浅底也必须走这个变量，否则覆盖顺序会打架（兄弟项目曾用渐变叠加绕过，2026-11-07 收编）。

EN: Hover on `Card` / `StripCard` uses `--dshpc-card-hover` only; it is opt-in via `hoverable`
(default off). The fill is controlled by `filled` (default on) and only rewrites `--surface-bg`; never
override the root background with `background` / `background-image` properties.

开启 `hoverable` 时**同时**给 `cursor:pointer` —— 既然声明可交互，手势不能只换背景不变；
没开这根轴的卡片保持默认光标（2026-11-07 用户反馈）。

EN: Enabling `hoverable` also sets `cursor:pointer`. Cards without the axis keep the default cursor.

### 展开态：hover 只作用「上面那一块」

2026-11-07 用户否决「只中间变色」：外圈 `padding` 圈也要一起变，否则头部像被挖掉一圈；
也否决「给展开区铺一层常态底色去盖住根节点」—— 底色 token 是半透明的，叠两层会更暗，
真机上就是一块深色补丁。

**正解是结构分区，不是遮盖**：根节点 `padding:0`、只铺一层常态底、用 `overflow:hidden` 统一裁圆角；
`__body` 是「上面那一整块」，独立承担四边内距，是 head 作用域下唯一的 hover 目标；`__panel` 是它的
兄弟节点，不铺任何背景、不参与 hover，自己承担左右 / 底部内距。**展开态不改 `__body` 内距**：
上下两圈留白始终对称，色条上下才不会一长一短；两块之间的间隔就是 `__body` 的 `padding-bottom`，
属于头部区、跟着一起变色；`__panel` 的 `margin-top` 与 `padding-top` 双双归 0，紧接其后，
中间不夹任何不变色的带子，消费端自绘的线因此贴得住头部区下沿的 hover 色。
**核心不画任何分隔线**：展开区只负责把内容放到头部区下面；需要线时由消费端在 `panel` 内容里自绘
（有时要、有时不要，消费端自己决定，2026-11-08 用户拍板）。曾经 `__panel` 自带 `border-top`，
和消费端自绘的线重复成「一实一虚两条」。
2026-11-08 又拍掉两条残留：`__panel` 曾垫 `padding-top:8px`，把自绘线顶离 hover 色块；
消费端 `style.padding` 曾只转成 `--card-pad-all` 交给 `__body`，`__panel` 仍读四根轴 ⇒
`bar.inset:0` 的卡片左轴被方位类归零、右轴还是默认 14px，线左贴边、右留白。
现在四根 `--card-pad-t/r/b/l` 是唯一真源，`--card-pad-all` 只由它们派生。
`__body` 不许写 `border-radius` 裸值（圆角契约只认 Surface 一处），圆角由根节点裁切保证。

`StripCard` 的 4px 色条相对根节点绝对定位（`top:0` / `bottom:0`），展开后仍通高贯穿整卡、
包括展开区；它不属于 hover 分区，颜色也不随 hover 变（2026-11-08 拍板）。

`hoverScope` 决定展开区是否跟着变，**默认 `'head'`**：

| 作用域 | 变色范围 | 鼠标落在展开区 | 展开区手势 |
|---|---|---|---|
| `'head'`（默认） | `__body` 整块边到边变色（含内距圈、圆角） | `__body:hover` 不成立 ⇒ 整卡完全不触发 | `cursor:auto` |
| `'card'`（消费端显式选） | 根节点改 `--surface-bg`，整卡含展开区一起变色 | 照常触发 | `cursor:pointer` |

**四根 `--card-pad-t/r/b/l` 是内距唯一真源**（strip / 四方位各自覆盖其中一根）；
`--card-pad-all` 只是它们的组合值，由 CSS 派生、JS 不直接写。消费端 `style.padding`
（1/2/3/4 值简写）由 `Card.ts` 摊成四根轴，`__body` 与 `__panel` 因此同步对齐；根节点永远零内距。

**契约**：消费端必须把展开内容放进 `panel`（`children` 属于头部区），核心才有分区信号；
`__panel` 是 `__body` 的兄弟节点，由 `test/card.test.mjs` 盯着。

EN: The root keeps `padding:0` and paints one resting fill. `__body` is the header block — it owns all four
paddings, inherits the root radius, and is the only hover target under `hoverScope: 'head'`. `__panel` is its
sibling: no background at all, never hovered, with its own horizontal / bottom padding. Expanding never
rewrites the header padding: top and bottom stay symmetric, and the gap between the blocks is the header's
own `padding-bottom`, so it changes color together with the header. `__panel` follows immediately with both
`margin-top:0` and `padding-top:0`, and draws no divider — the core only places the expanded content; callers
who need a line draw it inside `panel` themselves, and it sits flush against the header's hover fill with no
uncoloured strip in between. The four `--card-pad-t/r/b/l` axes are the single source of padding truth;
`--card-pad-all` is derived from them, and `style.padding` expands into all four so the header and expanded
area stay symmetric. The StripCard rail is absolutely positioned against the root
(`top:0` / `bottom:0`), so it stays full-height across the expanded area too. `:has()` and "paint a resting-fill snapshot over the
expanded area" are forbidden — semi-transparent tokens stacked twice render darker. Callers must put
expandable content in `panel`; `children` belongs to the header block.
