# 20261019-2359-亮色下-hovercard-内容黑字的定位与修复-5df3：亮色下 HoverCard 内容黑字的定位与修复

> **✅ 完成封卷**：2026-10-20 00:52:04（@cqguojia@hotmail.com）
> **创建**：2026-10-19 23:59:09（@cqguojia@hotmail.com）
> **分类**：样式 ｜ **标签**：HoverCard、样式、外部事实、实测

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

现象：宿主**亮色**下，demo 里悬停弹出的「标题 + 副文本」浮层是**黑字**（压在深色底上，看不清）；
暗色下正常。用户原话：“到底为什么？我们用不了官方的样式是吧？是不是必须我们自己写？”

用户的硬性要求（必须先执行）：**不许看到现象就动手改**。原话：“别他妈看到一个东西就创创创开始修，
都没搞懂到底是为什么，不然其他地方又踩这个坑。” ⇒ 本任务的工作方式 = 先拿真机读数定性，再改。

前置相关：`20261019-1604-…-823a`（分段控件样式事故，根因是 tokens 模板多一个反斜杠，已修）。
那次踩的坑正是“现象层结论当成机制”，本任务刻意反过来做。

## 待办

- [x] 拉官方源码核实 Tooltip / HoverCard 的配色声明
- [x] 真机读数：先证明官方 Tooltip 本身没问题
- [x] 真机读数：亮色下抓到出问题的那个浮层，读出类名 / 父节点 / color / background
- [x] 按读数定性，改在正确的那一层（调用方，不是官方组件）
- [x] 把官方这条未写明的行为写进 `docs/design/external/dsh-host.md` §10
- [ ] **待用户验收**：亮色下悬停「富卡片」，副文本应为白色、不再黑字压深底

## 下一步

1. 等用户验收（重装 demo → 切亮色 → 悬停「富卡片」）。
2. 验收通过后，可考虑把这条约束做成自检或文档提示给下游插件（目前只在外部事实里记着）。

## 过程

### 第一步：先证明官方 Tooltip 没问题（避免误伤）

读 `@deepseek-ai/dsh-client-ui-primitives@0.2.1-rc.2`：

- `lib/Tooltip.module.css` 的 `.bubble`：`background: var(--dsw-alias-tooltip-bg)` +
  `color: var(--dsw-static-neutral-bluish-00)` —— 两条齐全。
- `@deepseek-ai/dsh-client-ui-theme@0.2.1-rc.2` 的 `lib/client.js`：`--dsw-static-neutral-bluish-00: #fff`；
  `--dsw-alias-tooltip-bg` 亮色 = `bluish-750`(`#43454a`)、暗色 = `bluish-850`(`#2c2c2e`)。
  **全部定义在同一个 `body{…}` 块**（`design-platform.css` 的默认主题）。
- 气泡元素源码（`lib/index.js`）：`jsxs("span", { className: css$23.bubble, role: "tooltip", … })`，
  默认 `portal = false`。

真机读数（用户 hover **官方自己**的气泡）：

```
在body子树内 true | 父元素 BODY | 类名 _bubble_12mhf_1
实际color rgb(255,255,255) | 实际background rgb(44,44,46)
变量00 body/气泡 "#fff" | 变量bg body/气泡 "#2c2c2e"
命中气泡的配色规则 []
```

⇒ **官方 Tooltip 完全正常**，白字深底、变量全在位。我先前提的“给 `[role=tooltip]` 补兜底”方案
**作废**（那是在没数据时提的，别照做）。

顺带两条：这次读数是**暗色**（`#2c2c2e` 是暗色值）⇒ 暗色下本来就正常；官方那个是 portal 模式
（父 = BODY），我们 demo 里是非 portal（父 = DIV）——挂载形态不同，但与颜色无关。

### 第二步：亮色下抓真凶

用户 hover 「下面那个副文本」时，按 `role="tooltip"` 找 → **找不到**。⇒ 出问题的根本不是 Tooltip。

改脚本为扫浮层（`position:fixed` + `zIndex>=100`），并要求**切到亮色**再跑。读数：

```
暗色模式 false
浮层 1 个：
  类名 _card_38jqx_9   role null   父 BODY
  color rgb(15,17,21)  background rgb(44,44,46)
  文本 "Alex ChenA deliberately long hint: the b…"
```

⇒ `_card_38jqx_9` = **HoverCard 的 `.card`**（demo 里“富卡片”那一项，标题 + 副文本）。

### 第三步：从官方源码读出因果

`lib/index.js` 的 `function HoverCard({ …, variant = "compact", … })` —— **默认就是 compact**；
卡片最终 `createPortal(card, document.body)`（与读数「父 = BODY」吻合）。

`lib/HoverCard.module.css`：

```css
.card {                                 /* compact 变体 */
  --dsw-hovercard-bg: #2C2C2E;           /* 硬编码深色，不随明暗变 */
  background: var(--dsw-hovercard-bg);
  /* 没有 color */
}
.preview {                               /* 另一变体 */
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary); /* 这个有 color，所以正常 */
}
```

因果链闭合：`.card` 无 `color` → 卡片 portal 到 body → 文字色继承 → 亮色下继承到 `#0f1115` 近黑
→ **黑字压 `#2C2C2E` 深底**；暗色下继承到近白 → 正常。**只有亮色暴露。**

官方自己为什么不爆：`.card` 的 `content` 收任意 ReactNode，宿主自己传的都是官方组件（自带 color）；
本仓 demo 传的是裸 `div`（`packages/demo/src/sections/buttons.tsx`，只给了 padding / fontSize，无 color）。

## 结论

- **不是官方配色错，也不是“必须用不了官方样式”**。官方 Tooltip 自身完全正确（实测白字深底）。
- 真正原因：`HoverCard` 默认 `variant='compact'` 用的 `.card` **只写背景、不写 `color`**，
  而 demo 传的 `content` 是裸 `div` 也没给 ⇒ 双层都没给 ⇒ 文字色继承 ⇒ 亮色下继承近黑。
- **修在调用方**（`packages/demo/src/sections/buttons.tsx`）：给自己写的 content 加
  `color: var(--dsw-static-neutral-bluish-00,#fff)`（官方在同场景 Tooltip 深底用的同一个常量，值 `#fff`），
  副文本用 `opacity: .78` 做层次，**没有给官方组件打补丁、没有自绘**。
- ⚠️ 别用 `--dsw-alias-label-primary` 补：它在亮色下是近黑，压深底正好复现这个 bug。
- 官方这条未写明的行为已写入 `docs/design/external/dsh-host.md` §10（含来源、版本、实测数据）。
- 提交 `84950b9`；`pnpm test` 48 项全绿、`koc-codelint` 全过。
- **留的坑**：这条只在文档里。以后若 core 也封装 HoverCard 或下游插件用到，需各自记得给 content 上色
  —— 目前没有任何机制强制，只能靠 §10 那条事实。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-19 23:59:09 · new · @cqguojia@hotmail.com · 创建任务（doing）
- 2026-10-19 23:59:43 · log · @cqguojia@hotmail.com · 读数定性：黑字是 HoverCard .card(compact) 不设 color + 我们 content 裸 div 双层缺失，亮色继承近黑；改在调用方给 #fff，dsh-host §10 记官方事实，84950b9 已推
- 2026-10-20 00:52:04 · close · @cqguojia@hotmail.com · 结案：已修复结案：HoverCard compact 的 .card 只写背景不写 color，content 是裸 div ⇒ 亮色下文字继承近黑；修在调用方给 content 上色（--dsw-static-neutral-bluish-00），官方事实已入 dsh-host.md §10
