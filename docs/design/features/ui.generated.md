<!-- 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改；改对应的 .doc.ts 后重跑 node scripts/gen-docs.mjs -->

# ui —— 基础控件

> EN: ui — base controls

导出：Button、IconButton、Segmented、Input、PrefixedInput、NumberInput、Textarea、Checkbox、fieldMetricsOf、Picker、WorkspacePicker、ModelPicker、Card、StripCard、Chip、Modal、FieldHint、setTooltipRenderer、showToast、notify、showHostToast、Loading、RunningBlocks、EmptyState、SectionHead、MarqueeText、LiveText、BackToTop、startResizeLayoutWidth、PanelDock、createPanelDock、DockPanel、ensureControls、setStyleKit

## 概览

> EN: Overview

依赖 design。装的是「用 token 搭出来的零件」——直接用，不再自己写原生控件。纯零件，不自己取数：选项、当前值都经 props 给（数据要跨 host↔client 边界，通道是插件私有的）。

> EN: Depends on design. Ships "parts built from tokens" — use them directly instead of writing native controls. Pure parts, no self-fetching: options and current value come via props (data crosses the host↔client boundary over the plugin’s private channel).

官方件通路：ui 入口保持零 @deepseek-ai/* 依赖（Node 单测 / 非宿主环境 import 不崩）；官方 primitives 经 src/ui/official.ts 以独立子路径 dsh-plugin-core/ui/official 透出。要消费官方件（FileTypeIcon / MarkdownText / CodeBlock / Menu / writeClipboard / Tooltip …）的封装从这条通路引，不许在别处 import 平台模块。

> EN: Official-component path: the ui entry stays free of @deepseek-ai/* deps (so Node unit tests / non-host imports don’t crash); official primitives are exposed via src/ui/official.ts through the separate subpath dsh-plugin-core/ui/official. Wrappers that consume official parts (FileTypeIcon / MarkdownText / CodeBlock / Menu / writeClipboard / Tooltip …) must import from this path — never import platform modules elsewhere.

定制边界：props 就是定制面，要改行为请组合 props，不要 fork 源码；「追加 class/style」只允许补布局，皮肤一律走 token 覆盖；缺控件时先提需求，实在要自己写请按 style.md 口径用同一套 token，并考虑提到本包。

> EN: Customization: props are the customization surface — compose props to change behavior, don’t fork; "append class/style" may only patch layout, skins always go through token overrides; if a control is missing, raise a request first; if you must write your own, follow style.md with the same tokens and consider upstreaming it.

```ts id="ui-setup"
import { createStyleKit } from 'dsh-plugin-core/design'
import { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

setStyleKit(createStyleKit({ id: 'dsh-task-reminder-ui' }))
ensureControls()
```

## Button / IconButton / Segmented

> EN: Button / IconButton / Segmented

Button 10 档外观（实心 / 线框 / 无底）。hover / active 走 token 派生色（不用 opacity）。

> EN: Button offers 10 variant tiers (solid / outline / bare). hover/active use token-derived colors (no opacity).

IconButton：variant: plain|outline|danger（默认 plain）、size（默认 lg）、icon（必填）、label（必填，无障碍名兼 title）。

> EN: IconButton: variant plain|outline|danger (default plain), size (default lg), icon (required), label (required, doubles as a11y name and title).

Segmented：items（必填）+ 单选或多选；另有 size（默认 lg）、variant: default|inset、block、label、id、disabled。选中片 = --dshpc-surface-raised + 1px 描边 + 浮起阴影。

> EN: Segmented: items (required) + single or multiple selection; also size (default lg), variant default|inset, block, label, id, disabled. Selected segment = --dshpc-surface-raised + 1px border + lift shadow.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `variant` | `上表 10 档（primary/secondary/danger/success/warning/info/outline/danger-outline/ghost/link）` | 'outline' | 外观档 | Appearance tier |
| `size` | `'sm' | 'md' | 'lg'` | 'lg' | 高度档（24 / 28 / 32，有边无边同高） | Height tier (24 / 28 / 32, same height with or without border) |
| `icon` | `ReactNode` | — | 前置图标（官方图标组件 / 字符串均可） | Leading icon (official icon component or string) |
| `iconRight` | `ReactNode` | — | 后置图标（展开箭头、外链） | Trailing icon (expand arrow, external link) |
| `color` | `string` | — | 自定义主色：实心档作底色，线框 / 无底档作主色 | Custom main color: background for solid tiers, main color for outline/bare |
| `loading` | `boolean` | 'false' | 文案前显示同色小圈，并自动 disabled | Shows a same-color spinner before the label and auto-disables |
| `block` | `boolean` | 'false' | 撑满父宽 | Fill parent width |
| `children` | `ReactNode` | — | 文案（由调用方按语言给：中文出中文、英文出英文，中英混排也支持） | Label (caller supplies per locale: zh shows zh, en shows en, mixed is supported) |
| `…rest` | `原生 button 属性` | — | type / disabled / title / aria-* / onClick 原样透传 | type / disabled / title / aria-* / onClick passed through |

## Input 家族（Field.ts）

> EN: Input family (Field.ts)

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `Input` | `value onChange(v) size(默认 sm) error disabled type placeholder inputRef onKeyDown onBlur aria-label title hint` | — | 基础输入框；error 描红；hint 给字符串即自动挂标准问号提示 | Basic input; error turns it red; passing hint as a string auto-attaches a standard question-mark hint |
| `PrefixedInput` | `同 Input + prefix: string` | — | 前置文案（https:// / C:\） | Leading text (https:// / C:\) |
| `NumberInput` | `value: number onChange(v) min max step(默认 1) inputWidth suffix label decreaseLabel increaseLabel hint` | — | 已 clamp；失焦回弹草稿 | Already clamped; reverts to draft on blur |
| `Textarea` | `value onChange(v) placeholder error disabled rows spellCheck(默认关) aria-label hint` | — | hint 的问号钉在右下角（单行控件则在行尾垂直居中） | hint’s question mark pins to the bottom-right (for single-line controls it centers at the row end) |
| `Checkbox` | `checked onChange(next) label accentColor disabled` | — | — | — |
| `fieldMetricsOf(size)` | `→ { height, font, line, icon, gap }` | — | 自己搭同款输入框时对齐尺寸 | Match dimensions when building your own same-style input |

## Picker / WorkspacePicker / ModelPicker

> EN: Picker / WorkspacePicker / ModelPicker

Picker：单选 / 多选 / 上限 / 搜索 / 分组 / 空态 / 降级，自绘（不依赖官方 Menu）。键盘：Esc 关、↑↓ 移游标、Enter 选。纯逻辑也可单用：toGroups / flattenOptions / filterGroups / toggleValue / labelsOf / groupOf。

> EN: Picker: single/multiple/max/search/grouping/empty/degrade, self-drawn (no official Menu). Keyboard: Esc closes, ↑↓ move cursor, Enter selects. Pure logic is also usable standalone: toGroups / flattenOptions / filterGroups / toggleValue / labelsOf / groupOf.

WorkspacePicker：领域选择器，数据自带的现成组件（FilePicker 已删）。数据自动来自宿主：插件 apply 里调一次 connectHost(ctx)，组件即订住官方 workspaces 服务的快照。不接线 = 空态（如实，不编数据）。

> EN: WorkspacePicker: a domain picker, a ready-made data-backed component (FilePicker removed). Data comes automatically from the host: call connectHost(ctx) once in the plugin apply, and the component subscribes to the official workspaces service snapshot. No wiring = empty state (honest, no fabricated data).

ModelPicker：数据自带的现成组件 + variant: grouped|cascade（默认 grouped）。两种形态返回口径一致：onChange 都发最终模型 value（${provider}/${id}）。目录自动来自宿主（serveModelCatalog + connectHost）。

> EN: ModelPicker: a ready-made data-backed component + variant grouped|cascade (default grouped). Both forms return consistently: onChange emits the final model value (${provider}/${id}). Catalog comes automatically from the host (serveModelCatalog + connectHost).

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `groups / options` | `PickerGroup[] / PickerOption[]` | — | 二选一；options 会被当成一个无标题组 | One of the two; options is treated as a single untitled group |
| `value / defaultValue` | `string | string[]` | — | 给了 value 即受控；否则内部管 | Passing value makes it controlled; otherwise it manages internally |
| `onChange` | `(v: string | string[]) => void` | — | 单选回 string，多选回 string[] | Single returns string, multiple returns string[] |
| `mode` | `'single' | 'multiple'` | 'single' | — | — |
| `max` | `number` | — | 多选上限；到上限其余项置灰 + 提示（不静默截断） | Multiple-select cap; at cap others grey out + a hint (no silent truncation) |
| `searchable` | `boolean` | 'false' | 显示搜索框；展开菜单时自动聚焦搜索框 | Shows a search box; auto-focuses it when the menu opens |
| `align` | `'left' | 'center'` | 'left' | 触发器文字对齐 | Trigger text alignment |
| `clearable` | `boolean` | 'false' | 单选时列表顶部多一项「不选」 | In single mode, adds a "none" item at the top of the list |
| `placeholder` | `string` | 内置「请选择」 | — | — |
| `degraded` | `boolean` | 'false' | 候选可能不完整 ⇒ 顶部如实提示，不编造 | Candidates may be incomplete ⇒ honest top hint, no fabrication |
| `size` | `'sm' | 'md' | 'lg'` | 'md' | — | — |
| `placement` | `'down' | 'up'` | 'down' | 触发器靠近视口底部时用 up | Use up when the trigger is near the viewport bottom |
| `closeOnSelect` | `boolean` | 多选 false / 单选恒关 | 选中后是否收起 | Whether to collapse after selection |
| `showLabels` | `boolean` | 'true' | 多选时触发器列出已选项，而非只显示「已选 N 项」 | In multiple mode the trigger lists selected items instead of just "N selected" |
| `icon` | `ReactNode` | — | 触发器文字前的图标 | Icon before the trigger text |
| `hint` | `string` | — | 问号提示文字：自动在触发器后挂标准 FieldHint | Hint text: auto-attaches a standard FieldHint after the trigger |
| `className` | `string` | — | 定制宽度 / 外边距 | Custom width / margin |
| `ariaLabel` | `string` | — | 无障碍名 | Accessible name |
| `translate` | `Translate` | 内置 | 覆盖文案 | Override copy |

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `value / defaultValue / onChange` | `选中值为 workspaceId（不是 title）；'' = 「所有工作区」` | — | 不筛 | No filter |
| `allowDefault / defaultLabel` | `「所有工作区」默认项：默认提供、置顶、只在单选出现；选中发 ''；false 关掉` | — | 文案可改 | Text is customizable |
| `mode / max` | `单选 / 多选 / 上限（到上限已选项仍可反选）` | — | — | — |
| `placeholder` | `string` | 默认「工作区」 | 想叫「选择工作区」就传它 | Pass it if you want "选择工作区" |
| `icon` | `ReactNode` | — | 触发器前置图标：不传 = 默认文件夹；null = 不显示；传元素 = 自定义 | Leading trigger icon: omitted = default folder; null = hidden; element = custom |

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `variant` | `'grouped' | 'cascade'` | 'grouped' | grouped = 一个下拉完全独立；cascade = 两个下拉联动（先选供应商，模型列表跟着筛；换供应商清空已选） | grouped = one standalone dropdown; cascade = two linked dropdowns (pick provider first, model list filters; switching provider clears selection) |
| `allowDefault / defaultLabel` | `「默认模型」选项：默认提供；false 关闭；选中发 ''` | — | 文案可传 defaultLabel | Pass defaultLabel for the text |
| `placeholder` | `string` | 默认「模型」 | icon：不传 = 默认星形；null = 不显示；传元素 = 自定义 | icon: omitted = default star; null = hidden; element = custom |
| `透传 Picker` | `value / defaultValue / onChange / clearable / searchable / hint / size / placement / className / disabled / degraded / translate` | — | 同 Picker 同名参数 | Same-named params as Picker |

```tsx id="ui-workspacepicker-example"
import { WorkspacePicker, connectHost } from 'dsh-plugin-core/ui'

// apply(ctx) 里：connectHost(ctx)
h(WorkspacePicker, { value: cur, onChange: setCur, clearable: true })
```

## FieldHint（问号提示）

> EN: FieldHint (hint)

独立组件，不属于 Input 家族——标题后、按钮后、文字后、输入框后随处可挂。气泡 = 官方 Tooltip 本体：插件启动时 setTooltipRenderer((props) => h(OfficialTooltip, props)) 把官方组件交给 core，side / align / maxWidth 可透传。不做降级兜底——未注入 renderer 的非宿主环境（node 自检）只出问号图标、没有气泡。

> EN: A standalone component, not part of the Input family — attachable after titles, buttons, text, or inputs anywhere. The bubble IS the official Tooltip: at plugin startup, setTooltipRenderer((props) => h(OfficialTooltip, props)) hands the official component to core; side / align / maxWidth pass through. No fallback — a non-host environment that didn’t inject a renderer (node self-check) shows only the question-mark icon, no bubble.

## Card / StripCard

> EN: Card / StripCard

两种卡片外观，两个独立组件：Card = surface 底 + 1px 边框 + 圆角，padding 14px（左 12 使竖条贴边）；StripCard = 同色系浅底 + 1px 不可见占位边框 + 方角。头部整体垂直居中，调用方在 action 里裸放一个元素即垂直居中。颜色全走 token ⇒ 亮暗自动跟随宿主。

> EN: Two card appearances, two separate components: Card = surface background + 1px border + rounded corners, padding 14px (left 12 so the strip hugs the edge); StripCard = same-hue light background + 1px invisible placeholder border + square corners. The header is vertically centered as a whole; drop a bare element in action and it centers. Colors come from tokens ⇒ light/dark follows the host automatically.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `accent` | `5 档 or 任意 CSS 色值（business/success/warning/danger/neutral）` | 'business' | 档位映射到 design 的 token；也可传 '#f59e0b' 这类自定义值 | Tiers map to design tokens; also accepts custom values like '#f59e0b' |
| `expanded` | `boolean` | 'false' | 展开态（箭头朝向 + panel 显隐） | Expanded state (arrow direction + panel show/hide) |
| `onToggle` | `() => void` | — | 传了才显示右侧折叠箭头；展开状态由调用方管 | Only shows the right collapse arrow if provided; caller owns the expanded state |
| `action` | `ReactNode` | — | 右上角操作区 | Top-right action area |
| `children` | `ReactNode` | — | 主内容，排版随你 | Main content, layout is yours |
| `panel` | `ReactNode` | — | 展开后才显示的额外内容 | Extra content shown only when expanded |
| `className / style` | `—` | — | 追加类 / 样式 | Append class / style |

```tsx id="ui-card-example"
import { Card, Chip, StripCard } from 'dsh-plugin-core/ui'

h(Card, {
  accent: 'warning',
  action: h(Button, { size: 'sm', variant: 'ghost' }, '跳过'),
},
  h('div', null, '标题'),
  h(Chip, null, '#npm'),
)

h(StripCard, {
  accent: 'success',
  expanded: open, onToggle: () => setOpen(!open),
  panel: h('div', null, '展开详情'),
}, h('div', null, '标题 + 元信息'))
```

## Chip

> EN: Chip

小标签。两条可选轴：tone（neutral 默认灰面 / business / success / warning / danger——非 neutral 为实心信号面）；size（sm 默认 / md = font-size:12px，卡片元信息行用）。传 onClick 才是可点的。语义边界：Chip 只管「胶囊标签」这一件事；只给图标的小按钮请用 IconButton，不要拿 Chip 当图标底板（同一个类名两套皮肤会互相覆盖）。

> EN: A small tag. Two optional axes: tone (neutral default gray / business / success / warning / danger — non-neutral is a solid signal surface); size (sm default / md = font-size:12px, for card meta rows). Pass onClick to make it clickable. Boundary: Chip only does "pill tag"; for an icon-only small button use IconButton — don’t use Chip as an icon baseplate (one class name with two skins would overwrite each other).

## 反馈件

> EN: Feedback

showToast / notify 等底层仍是 Sonner（动画/定位/堆叠）。跨副本 toast 宿主：core 被打进每个插件 bundle，旧实现 N 个插件同页会挂 N 个同 id 容器；现改为 globalThis 上 Symbol.for('dsh-plugin-core/toast-host') 单例，先到场的副本建唯一容器与 Toaster，其余副本把 ToastPayload 交给宿主渲染。

> EN: showToast / notify etc. are still backed by Sonner (animation/positioning/stacking). Cross-bundle toast host: core is bundled into every plugin, and the old impl would mount N same-id containers on one page; now a globalThis Symbol.for('dsh-plugin-core/toast-host') singleton makes the first bundle create the unique container and Toaster, and later bundles hand their ToastPayload to the host for rendering.

三条取舍（用户拍板接受，不要自行"优化"）：① 样式由第一个副本决定；② position 全局共享（一个屏幕一个区）；③ 不做卸载回收 / 引用计数。无 document 的环境静默跳过、不注册。

> EN: Three trade-offs (accepted by the user, don’t "optimize"): ① styling is decided by the first bundle; ② position is shared globally (one zone per screen); ③ no unload reclamation / ref counting. Environments without document silently skip and don’t register.

Modal：自绘 overlay，不用 react-dom 的 portal（避免多一个必需依赖）。

> EN: Modal: self-drawn overlay, not react-dom’s portal (avoids an extra required dependency).

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `showToast(message, opts?)` | `` |  | 官方 Sonner 原生（对比 / demo 用）。opts: { variant?, durationMs?, color?, onDismiss?, position? }；color 整条自定义背景色；position 6 向（默认 bottom-center）；暗色跟随宿主 | Raw official Sonner (for comparison / demo). opts: { variant?, durationMs?, color?, onDismiss?, position? }; color sets the whole background; position 6-way (default bottom-center); dark follows host |
| `notify(message, opts?)` | `` |  | 项目内推荐：我们封装好的提示。opts: { variant?, description?, durationMs?, position?, actions? }；右侧 actions?: { text, variant?, onClick }[]（1–2 个，用我们自己的 Button）；底层仍是 Sonner | Recommended in-project: our wrapped toast. opts: { variant?, description?, durationMs?, position?, actions? }; right-side actions?: { text, variant?, onClick }[] (1–2, using our own Button); still Sonner underneath |
| `showHostToast(message, opts?)` | `` |  | 宿主原生 Toast（子路径 dsh-plugin-core/ui/host）。opts: { tone?, holdMs?, actions?, onDismiss? }；独立子路径导出，隔离平台模块 | Host-native Toast (subpath dsh-plugin-core/ui/host). opts: { tone?, holdMs?, actions?, onDismiss? }; exported via a separate subpath to isolate platform modules |
| `Loading({ anchorId? })` | `` |  | 贴到主内容容器右下角的加载指示；anchorId 默认 dshpc-main | Loading indicator pinned to the main container’s bottom-right; anchorId defaults to dshpc-main |
| `RunningBlocks()` | `` |  | 运行中的占位块 | Placeholder blocks while running |
| `EmptyState({ text?, icon?, action?, translate? })` | `` |  | 统一空态 | Unified empty state |
| `SectionHead({ icon, title, right? })` | `` |  | 分区标题 | Section heading |
| `MarqueeText({ text, style?, title?, className? })` | `` |  | 超长省略、hover 滚动 | Ellipsis on overflow, scroll on hover |
| `LiveText({ render, style? })` | `` |  | 定时重渲染（相对时间这类） | Periodic re-render (for relative time etc.) |
| `BackToTop({ anchorId? })` | `` |  | 回到顶部，贴主容器右缘外侧 | Back-to-top, outside the main container’s right edge |
| `startResizeLayoutWidth(opts)` | `` |  | 拖拽调整布局宽度（root 不传则回落 #dshpc-root） | Drag to resize layout width (falls back to #dshpc-root if root omitted) |

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `title` | `ReactNode` | — | 标题 | Title |
| `onClose` | `() => void` | — | 不传则不显示关闭钮 | No close button if omitted |
| `closeOnMask` | `boolean` | 'true' | 点遮罩关闭；误触代价大的场景设 false | Close on mask click; set false where mis-clicks are costly |
| `escClose` | `boolean` | 'true' | Esc 关闭 | Close on Esc |
| `maxWidth` | `string` | min(960px, 92vw) | — | — |
| `hideHeader` | `boolean` | 'false' | 不渲染头部（沉浸式） | Skip header (immersive) |
| `footer` | `ReactNode` | — | 底栏（按钮区） | Footer (button area) |
| `children` | `ReactNode` | — | 主体 | Body |

## PanelDock（停靠分栏）

> EN: PanelDock (dock)

「右侧分栏」从业务里剥出来的通用壳。它是布局成员，不是浮层：占宽度、把主区挤窄，不是盖上去。因此必须由调用方放进自己的 flex 根里。分工照成熟组件库的通行做法：结构写在调用点（children），显隐归状态（open/close 只传 id）。

> EN: A generic shell extracted from the business layer for "right-side panels". It is a layout member, not an overlay: it takes width and narrows the main area, not covering it. So the caller must place it inside its own flex root. Following common component-library practice: structure is written at the call site (children), visibility is state (open/close only passes an id).

面板高度默认视口高；嵌在定高容器里时由调用方给 --dshpc-dock-h。不做的事（拍板留档）：多份同名（multi）、tab 切换条、自动淘汰、浮动层——标签切换由消费方在自己的面板内容里实现。两条实现约束：面板是 position:sticky + height:100vh 的 flex 成员，刻意不设 z-index；拖动期给 iframe 让出指针事件。

> EN: Panel height defaults to viewport height; when nested in a fixed-height container, the caller sets --dshpc-dock-h. Deliberately not done (on record): multi same-name, tab-switch bar, auto-eviction, floating layer — tab switching is the consumer’s job inside their own panel content. Two impl constraints: panels are position:sticky + height:100vh flex members with no z-index; during drag, yield pointer events to iframes.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `maxPanels` | `number` | 3 | 同时存在的栏数上限 | Max simultaneous panels |
| `defaultWidth / minWidth` | `number` | 460 / 320 | 兜底宽度与下限（面板自己给了就以面板为准） | Fallback width and floor (panel’s own value wins if given) |
| `storageKey` | `string` | 'dshpc-dock' | 宽度记忆前缀；传 false 关闭 | Width-memory prefix; false disables |

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `id` | `string` | — | 组名（寻址键），同名唯一 | Group name (address key), unique per name |
| `title / icon` | `ReactNode` | — | 内置头的标题与标题前图标 | Built-in header title and icon before it |
| `extra` | `ReactNode` | — | 标题右侧的任意内容（不只是按钮） | Any content to the right of the title (not just buttons) |
| `header` | `ReactNode | null` | — | 整块替换头部：不传 = 内置头；null = 不要头部；其他 = 你的头 | Whole-header replacement: omitted = built-in; null = no header; else = your header |
| `closable / closeButton / closeIcon` | `—` | — | 关钮开关；位置 auto/header/floating/none | Close-button toggle; position auto/header/floating/none |
| `width / minWidth / maxWidth` | `number` | — | 宽度与可拖动区间 | Width and draggable range |
| `ariaLabel` | `string` | — | 无头部时的无障碍名 | A11y name when no header |

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `onOpen` | `({ id, created: true })` | — | 首次打开 | First open |
| `onBeforeClose` | `({ id, reason: 'button' | 'api' }) => false?` | — | 关闭之前，返回 false 可取消 | Before close; returning false cancels |
| `onClose` | `({ id, reason })` | — | 已关闭 | Closed |
| `onResize` | `({ id, width })` | — | 拖宽松手 | Drag released |
| `onLimitReached` | `({ id })` | — | 到上限被拒 | Rejected at cap |

```ts id="ui-paneldock-example"
const dock = createPanelDock({ maxPanels: 3 })   // 一次，挂在插件级

// 页面里：结构就在这儿写，不塞进任何调用参数
h('div', { style: { display: 'flex' } },
  h(Main, null),                                  // flex:1 1 auto; min-width:0
  h(PanelDock, { dock },
    h(DockPanel, { id: 'files', title: '工作区' }, h(FilePanel)),
    h(DockPanel, { id: 'preview', header: h(PreviewBar) }, h(PreviewBody)),
    h(DockPanel, { id: 'raw', header: null, closeButton: 'floating' }, h(RawBody)),
  ),
)
// 之后任何地方：dock.open('files') / dock.close('files')
```
