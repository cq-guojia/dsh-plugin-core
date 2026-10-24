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

## 三条硬规矩

> EN: Three hard rules

1. 不许再有第二处 `document.createElement('style')` —— 一律走 kit。
2. 不许再出现第二套 style 标签 id —— 一个插件一套 kit。
3. 域内的规则只能消费 `var(--dshpc-*)`，颜色 / 尺寸 / 字号一律来自 token 层，不写死值。

EN: No second `document.createElement('style')` — always go through the kit. No second style tag id — one kit
per plugin. Rules inside a domain consume `var(--dshpc-*)` only; never hard-code colors, sizes or fonts.
