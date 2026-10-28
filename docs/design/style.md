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

`ui` 层零官方依赖，箭头一律走 `src/ui/chevron.ts` 的自绘 chevron（`h(Chevron, { dir, size })`，
四向共用一条路径，靠旋转实现）。**不许再写 `'▾'` / `'↑'` 这类字形**——各系统字体下粗细、角度、
基线都不一样，同一套界面里会冒出第二种箭头（2026-10-26：卡片折叠箭头就是这么来的）。
有自检盯着：`test/quality.test.mjs`。

EN: The `ui` layer has no official dependency, so every arrow comes from the self-drawn chevron in
`src/ui/chevron.ts`. Never write a glyph arrow again; a test enforces it.

## 拼成一体：外壳持框，内件交边

> EN: Welding controls together: the shell owns the frame, the cells hand over their borders

多个控件拼成一个外观（`SplitGroup`、`PrefixedInput`、`NumberInput`、`DateTimePicker` 的 range 触发器）
只有一种写法：**外壳持边框 + 圆角 + `overflow:hidden` + 整体 `:focus-within`；内件把边框、底色、圆角
交出来**（`border:0; border-radius:0; background:transparent`）。不给内件再套第二个外框，也不让内件
自己画 `:focus-visible` 圈——否则格子里会冒出半圈描边。

`SplitGroup` 用后代选择器直接压内件（`.dshpc-split .dshpc-picker__trigger` / `.dshpc-split .dshpc-seg`），
所以**内件类名就是耦合点**：改这些类名或结构必须同步改 `src/ui/controls/split-group.css`，否则拼接
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
rename them and you must update `src/ui/controls/split-group.css`, or the weld fails silently.

## 三条硬规矩

> EN: Three hard rules

1. 不许再有第二处 `document.createElement('style')` —— 一律走 kit。
2. 不许再出现第二套 style 标签 id —— 一个插件一套 kit。
3. 域内的规则只能消费 `var(--dshpc-*)`，颜色 / 尺寸 / 字号一律来自 token 层，不写死值。

EN: No second `document.createElement('style')` — always go through the kit. No second style tag id — one kit
per plugin. Rules inside a domain consume `var(--dshpc-*)` only; never hard-code colors, sizes or fonts.
