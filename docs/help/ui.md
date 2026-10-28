<!-- 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改；改对应的 .doc.ts 后重跑 node scripts/gen-docs.mjs -->

# ui —— 基础控件

> EN: ui — base controls

导出：Button、IconButton、Segmented、SplitGroup、Input、PrefixedInput、NumberInput、Textarea、Checkbox、fieldMetricsOf、Picker、WorkspacePicker、ModelPicker、DateTimePicker、Card、StripCard、Chip、Modal、FieldHint、setTooltipRenderer、showToast、notify、showHostToast、Loading、RunningBlocks、SectionHead、MarqueeText、LiveText、BackToTop、startResizeLayoutWidth、PanelDock、createPanelDock、DockPanel、ensureControls、setStyleKit

## 概览

> EN: Overview

依赖 design。装的是「用 token 搭出来的零件」，直接用，不再自己写原生控件。纯零件不自己取数：选项、当前值都经 props 给（数据通道是插件私有的）。

> EN: Depends on design. "Parts built from tokens" — use them instead of writing native controls. No self-fetching: options and value come via props (the data channel is plugin-private).

入口零 `@deepseek-ai/*` 依赖（非宿主环境 import 不崩）。官方 primitives 走独立子路径 `dsh-plugin-core/ui/official`，封装一律从这条通路引。

> EN: The entry keeps zero `@deepseek-ai/*` deps (imports never crash outside the host). Official primitives come through the separate subpath `dsh-plugin-core/ui/official`; import them only from there.

定制边界：props 就是定制面，要改行为请组合 props，不要 fork 源码；追加 class/style 只允许补布局，皮肤走 token 覆盖；缺控件请先提需求。

> EN: Customization: props are the surface — compose them instead of forking source; appended class/style may only patch layout, skins go through token overrides; raise a request before writing a missing control yourself.

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

Segmented：`items`（必填）支持单选 / 多选，`size`（默认 lg；三档总高 24 / 28 / 32）、`bordered`（1px 外框，总高不变）、`multiple`（多选）。外观只有一套：灰底轨道 + 白色选中片，选中片的描边环与阴影由宿主 elevation token 提供（离线兜底值没有那圈环）。段内 `count`（弱化灰字）/ `badge`（红角标）接受 `number | string`：数字 ≤0 不显示，字符串原样显示（如 `1K` / `99+`）。

> EN: Segmented: `items` (required) supports single or multiple selection; `size` (default lg; totals 24 / 28 / 32), `bordered` (1px outer frame, same total height), `multiple` (multi-select). One look only: grey track + white selected pill; its stroke ring and shadow come from the host elevation token (the offline fallback has no ring). An item’s `count` (muted text) and `badge` (red pill) take `number | string`: numbers ≤0 render nothing, strings render as given (e.g. `'1K'` / `'99+'`).

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `variant` | `上表 10 档（primary/secondary/danger/success/warning/info/outline/danger-outline/ghost/link）` | 'outline' | 外观档 | Appearance tier |
| `size` | `'sm' \| 'md' \| 'lg'` | 'lg' | 高度档（24 / 28 / 32，有边无边同高） | Height tier (24 / 28 / 32, same height with or without border) |
| `icon` | `ReactNode` | — | 前置图标（官方图标组件 / 字符串均可） | Leading icon (official icon component or string) |
| `iconRight` | `ReactNode` | — | 后置图标（展开箭头、外链） | Trailing icon (expand arrow, external link) |
| `color` | `string` | — | 自定义主色：实心档作底色，线框 / 无底档作主色 | Custom main color: background for solid tiers, main color for outline/bare |
| `loading` | `boolean` | 'false' | 文案前显示同色小圈，并自动 disabled | Shows a same-color spinner before the label and auto-disables |
| `block` | `boolean` | 'false' | 撑满父宽 | Fill parent width |
| `width` | `number \| string` | — | 固定宽（px 或任意 CSS 宽度）；与 minWidth / maxWidth 互斥，一旦设定后两者自动失效 | Fixed width (px or any CSS width); mutually exclusive with minWidth/maxWidth — once set, the other two are ignored |
| `minWidth` | `number \| string` | — | 最小宽：width 未设时生效，内容不足此宽时以它为准 | Minimum width: applies only when width is unset; content shorter than this still takes this width |
| `maxWidth` | `number \| string` | — | 最大宽：width 未设时生效，文字超出折叠成省略号，hover 以跑马灯展开全名 | Maximum width: applies only when width is unset; overflowing text collapses to an ellipsis and marquees on hover |
| `children` | `ReactNode` | — | 文案（由调用方按语言给：中文出中文、英文出英文，中英混排也支持） | Label (caller supplies per locale: zh shows zh, en shows en, mixed is supported) |
| `…rest` | `原生 button 属性` | — | type / disabled / title / aria-* / onClick 原样透传 | type / disabled / title / aria-* / onClick passed through |

## Input 家族（Field.ts）

> EN: Input family (Field.ts)

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `Input` | `value onChange(v) size(默认 sm) error disabled type icon placeholder inputRef onKeyDown onBlur aria-label title hint` | — | 基础输入框；error 描红；hint 给字符串即自动挂标准问号提示；icon 是左侧图标槽（不吃点击，尺寸取 fieldMetricsOf(size).icon）；type=search 时聚焦且有内容才在右侧出清空钮 | Basic input; error turns it red; passing hint as a string auto-attaches a standard question-mark hint; icon is the leading icon slot (does not swallow clicks; size from fieldMetricsOf(size).icon); with type=search a clear button appears on the right only while focused and non-empty |
| `PrefixedInput` | `同 Input + prefix: string` | — | 前置文案（https:// / C:\） | Leading text (https:// / C:\) |
| `NumberInput` | `value: number onChange(v) min max step(默认 1) inputWidth suffix label decreaseLabel increaseLabel hint` | — | 已 clamp；失焦回弹草稿 | Already clamped; reverts to draft on blur |
| `Textarea` | `value onChange(v) placeholder error disabled rows spellCheck(默认关) aria-label hint` | — | hint 的问号钉在右下角（单行控件则在行尾垂直居中） | hint’s question mark pins to the bottom-right (for single-line controls it centers at the row end) |
| `Checkbox` | `checked onChange(next) label accentColor disabled` | — | — | — |
| `fieldMetricsOf(size)` | `→ { height, font, line, icon, gap }` | — | 自己搭同款输入框时对齐尺寸 | Match dimensions when building your own same-style input |

## Picker / WorkspacePicker / ModelPicker

> EN: Picker / WorkspacePicker / ModelPicker

Picker：单 / 多选、上限、搜索、分组、空态，自绘。键盘：Esc 关、↑↓ 移游标、Enter 选。纯逻辑可单用：`toGroups` / `filterGroups` / `toggleValue`。触发器支持 width / minWidth / maxWidth 约束宽度：定宽忽略另两者；内容超长则省略号 + hover 跑马灯。菜单里的选项超长同样省略 + hover 跑马灯，不会把菜单撑出横向滚动条。

> EN: Picker: single/multiple selection, cap, search, grouping, empty state — self-drawn. Keyboard: Esc closes, ↑↓ move the cursor, Enter selects. Logic reusable standalone: `toGroups` / `filterGroups` / `toggleValue`.

WorkspacePicker：数据自带的领域选择器。在插件 apply 里调一次 `connectHost(ctx)`，组件即订阅官方 `workspaces` 快照。未接线 = 空态，不编造数据。

> EN: WorkspacePicker: a domain picker that brings its own data. Call `connectHost(ctx)` once in the plugin apply and it subscribes to the official `workspaces` snapshot. Unwired = empty state, never fabricated data.

ModelPicker：数据自带，`variant` 为 `grouped`（默认）/ `cascade`；`onChange` 一律发 `provider/id` 形式的模型 value。目录来自宿主 `serveModelCatalog`。

> EN: ModelPicker: brings its own data; `variant` is `grouped` (default) or `cascade`; `onChange` always emits the model value as `provider/id`. Catalog comes from the host `serveModelCatalog`.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `groups / options` | `PickerGroup[] / PickerOption[]` | — | 二选一；options 会被当成一个无标题组 | One of the two; options is treated as a single untitled group |
| `value / defaultValue` | `string \| string[]` | — | 给了 value 即受控；否则内部管 | Passing value makes it controlled; otherwise it manages internally |
| `onChange` | `(v: string \| string[]) => void` | — | 单选回 string，多选回 string[] | Single returns string, multiple returns string[] |
| `mode` | `'single' \| 'multiple'` | 'single' | — | — |
| `max` | `number` | — | 多选上限；到上限其余项置灰 + 提示（不静默截断） | Multiple-select cap; at cap others grey out + a hint (no silent truncation) |
| `searchable` | `boolean` | 'false' | 显示搜索框；展开菜单时自动聚焦搜索框 | Shows a search box; auto-focuses it when the menu opens |
| `align` | `'left' \| 'center'` | 'left' | 触发器文字对齐 | Trigger text alignment |
| `clearable` | `boolean` | 'false' | 单选时列表顶部多一项「不选」 | In single mode, adds a "none" item at the top of the list |
| `placeholder` | `string` | 内置「请选择」 | — | — |
| `degraded` | `boolean` | 'false' | 候选可能不完整 ⇒ 顶部如实提示，不编造 | Candidates may be incomplete ⇒ honest top hint, no fabrication |
| `size` | `'sm' \| 'md' \| 'lg'` | 'md' | — | — |
| `placement` | `'down' \| 'up'` | 'down' | 触发器靠近视口底部时用 up | Use up when the trigger is near the viewport bottom |
| `closeOnSelect` | `boolean` | 多选 false / 单选恒关 | 选中后是否收起 | Whether to collapse after selection |
| `showLabels` | `boolean` | 'true' | 多选时触发器列出已选项，而非只显示「已选 N 项」 | In multiple mode the trigger lists selected items instead of just "N selected" |
| `icon` | `ReactNode` | — | 触发器文字前的图标 | Icon before the trigger text |
| `hint` | `string` | — | 问号提示文字：自动在触发器后挂标准 FieldHint | Hint text: auto-attaches a standard FieldHint after the trigger |
| `className` | `string` | — | 定制宽度 / 外边距 | Custom width / margin |
| `width` | `number \| string` | — | 定宽（px 或任意 CSS 长度）；给了即忽略 minWidth / maxWidth，触发器锁定此宽；内容超长则省略 + hover 跑马灯 | Fixed width (px or any CSS length); overrides minWidth/maxWidth and locks the trigger; overflow elides + hover marquee |
| `minWidth` | `number \| string` | 120px（CSS 默认） | 最小宽；内容不到此宽触发器也不更窄 | Minimum width; trigger never narrower than this |
| `maxWidth` | `number \| string` | 100%（CSS 默认） | 最大宽；内容超过此宽则省略 + hover 跑马灯 | Maximum width; overflow elides + hover marquee |
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
| `variant` | `'grouped' \| 'cascade'` | 'grouped' | grouped = 一个下拉完全独立；cascade = 两个下拉联动（先选供应商，模型列表跟着筛；换供应商清空已选） | grouped = one standalone dropdown; cascade = two linked dropdowns (pick provider first, model list filters; switching provider clears selection) |
| `allowDefault / defaultLabel` | `「默认模型」选项：默认提供；false 关闭；选中发 ''` | — | 文案可传 defaultLabel | Pass defaultLabel for the text |
| `placeholder` | `string` | 默认「模型」 | icon：不传 = 默认星形；null = 不显示；传元素 = 自定义 | icon: omitted = default star; null = hidden; element = custom |
| `透传 Picker` | `value / defaultValue / onChange / clearable / searchable / hint / size / placement / className / disabled / degraded / translate` | — | 同 Picker 同名参数 | Same-named params as Picker |

```tsx id="ui-workspacepicker-example"
import { WorkspacePicker, connectHost } from 'dsh-plugin-core/ui'

// apply(ctx) 里：connectHost(ctx)
h(WorkspacePicker, { value: cur, onChange: setCur, clearable: true })
```

## SplitGroup（组合选择框）

> EN: SplitGroup (combined selectors)

只做一件事：把两个控件在**外观上**焊成一体——外框、圆角、两格之间那条 1px 分隔、整体聚焦圈都由外壳画；内件仍是原来的控件（它们把边框、底色、圆角交出来）。形态随便换：滑块 + 下拉、下拉 + 下拉，外壳不变。

> EN: Does one thing: welds two controls into one **visually** — outer frame, corner radius, the 1px divider between the cells and the shared focus ring all come from the shell; the inner controls stay the original ones (they hand over border, background and radius). Swap the cells freely: segmented + dropdown, dropdown + dropdown — the shell does not change.

外壳**不持状态、不出联动回调**：联动就是让左格自己的 `onChange` 去改右格的数据源，两个控件原本怎么用，拼起来还怎么用。固定两格，不做多格。

> EN: The shell holds **no state and emits no linking callback**: linking means the left cell’s own `onChange` updates the right cell’s data. Each control behaves exactly as it does on its own. Exactly two cells, never more.

高度不写死：内件按自己的 `size`（sm 24 / md 28 / lg 32）撑开，外壳跟着长，两格传**同一个 size** 才逐像素等高。下拉菜单 portal 到 body，不受外壳 `overflow:hidden` 裁剪。

> EN: Height is never hard-coded: each cell grows to its own `size` (sm 24 / md 28 / lg 32) and the shell follows; give both cells the **same size** for pixel-identical heights. Menus portal to body, so the shell’s `overflow:hidden` never clips them.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `children` | `ReactNode` | — | 两格内容（左、右）；元素顺序即布局顺序 | Two cells (left, right); order is layout order |
| `label` | `string` | — | 无障碍组名（role=group） | Accessible group name (role=group) |
| `id / className / style` | `string / string / CSSProperties` | — | 锚点 / 只补布局，不覆盖皮肤 | Anchor / layout-only additions, never skin overrides |

```tsx id="ui-splitgroup-example"
import { SplitGroup, Segmented, Picker } from 'dsh-plugin-core/ui'

// 两格焊成一体：外框 / 圆角 / 中间 1px 分隔 / 整体聚焦圈都由外壳画
// 联动不归外壳管 —— 左格选完，在它自己的 onChange 里改右格的数据
h(SplitGroup, null,
  h(Segmented, { size: 'md', items: periods, value: period, onChange: (v) => { setPeriod(v); setBucket('') } }),
  h(Picker, { size: 'md', options: bucketsOf(period), value: bucket, onChange: setBucket, clearable: true }),
)

// 两个下拉同样只是换内件，外壳不变
h(SplitGroup, null,
  h(Picker, { size: 'md', options: scopes, value: scope, onChange: setScope }),
  h(Picker, { size: 'md', options: membersOf(scope), value: member, onChange: setMember, searchable: true }),
)
```

## DateTimePicker（日期时间选择）

> EN: DateTimePicker (date & time)

一个控件覆盖全部诉求：`mode` 选 `single`（一个时刻）/ `range`（时间段——触发器是**一个整条**：两个日期区 + 中间样式画的灰隔条，点整条展开；弹层里左右两块独立日历分别选）；`precision` 选 `day` / `hour` / `minute` / `second`。值为本地 ISO（`YYYY-MM-DDTHH:mm:ss.SSS`），毫秒恒三位。

> EN: One control covers everything: `mode` picks `single` (one instant) or `range` (a span — the trigger is **one bar**: two date zones + a CSS-drawn grey separator, click anywhere to expand; two independent calendars side by side in the popup); `precision` picks `day` / `hour` / `minute` / `second`. Values are local ISO (`YYYY-MM-DDTHH:mm:ss.SSS`), milliseconds always three digits.

补全口径：起始端把未选单位归零（day ⇒ `00:00:00.000`），结束端拉满（day ⇒ `23:59:59.999`；hour ⇒ `H:59:59.999`；second 不动）。数据库只收到秒时 `23:59:59.999` 退化为「当天最后一秒」，语义不坏，无需特殊处理。

> EN: Fill rules: the start floors unselected units (day ⇒ `00:00:00.000`), the end ceils them (day ⇒ `23:59:59.999`; hour ⇒ `H:59:59.999`; second stays exact). If a DB stores seconds only, `23:59:59.999` degrades to "last second of the day" — semantics intact, nothing special to do.

显示口径：传出的数据恒是完整本地 ISO（到毫秒），但**显示只到 precision**——day 只出日期（不出现时分秒），hour / minute 到分，second 才出秒。调用方传的精度就是用户看到的精度。

> EN: Display rule: emitted data is always a complete local ISO (to milliseconds), but **display stops at the precision** — day shows the date only (no clock), hour/minute stop at minutes, second shows seconds. The precision you pass is exactly what the user sees.

弹层与 Picker 同机制（floating-ui 浮层、贴边翻转、点外关闭、无遮罩）：两个端框 + 两块独立月历（左开始、右结束，各选各的，不标跨度）+ 每端自己的时/分/秒步进（▲▼、直接键入、↑↓ 键——不用逐格点 60 分钟；**时间不强制先选日期**，「确定」时没选日期就不传数据）。快捷键：day 精度叫「今天」（只置日期），带时分秒的叫「现在」（日期 + 时间一起置，之后可再改）。草稿态，「确定」才 onChange；Esc / 点外 = 丢弃。日历键盘：方向键移动、PageUp/Down 换月、Home/End 月内首尾、Enter 选中。结束早于开始时「确定」置灰并提示。

> EN: The popup shares Picker’s mechanics (floating-ui layer, edge flip, outside-click close, no mask): two end boxes + two independent calendars (left = start, right = end, each picks its own, no span marking) + per-end hour/minute/second steppers (▲▼, direct typing, ↑↓ keys — no clicking through 60 minutes; **time never requires picking a date first** — on confirm, no date means no data emitted). Quick button: "Today" at day precision (date only), "Now" when hours/minutes/seconds are on (sets date + time together, editable afterwards). Draft state; onChange only on confirm; Esc / outside = discard. Calendar keys: arrows move, PageUp/Down change month, Home/End jump to month bounds, Enter selects. When end precedes start, confirm greys out with a hint.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `mode` | `'single' \| 'range'` | 'single' | single = 一个时刻；range = 一个整条触发器（两个日期区 + 灰隔条） | single = one instant; range = one-bar trigger (two date zones + grey separator) |
| `precision` | `'day' \| 'hour' \| 'minute' \| 'second'` | 'day' | 时间精度；day 不显示时分秒步进 | Time precision; day hides the steppers |
| `value / defaultValue` | `single: string \| null；range: [start, end] \| null` | — | 本地 ISO；给了 value 即受控 | Local ISO; passing value makes it controlled |
| `onChange` | `(v: string \| [string, string] \| null) => void` | — | 「确定」时提交；「清除」发 null | Emitted on confirm; clear emits null |
| `disabled / size / placeholder` | `boolean / 'sm' \| 'md' \| 'lg' / string` | false / 'md' / 内置「请选择日期时间」 | 与 Picker 同名参数对齐 | Aligned with Picker’s same-named params |
| `hint / className / ariaLabel / translate` | `string / string / string / Translate` | — | 同 Picker 同名参数 | Same-named params as Picker |

```tsx id="ui-datetimepicker-example"
import { DateTimePicker } from 'dsh-plugin-core/ui'

// 单个时刻，精确到分（起始端归零：14:30 ⇒ 14:30:00.000）
h(DateTimePicker, { precision: 'minute', value: startAt, onChange: setStartAt })

// 时间段：一个整条触发器（两个日期区 + 灰隔条 -），day 精度下结束端补到当天最后一刻
h(DateTimePicker, {
  mode: 'range',
  precision: 'day',
  value: range,
  onChange: setRange, // → ['2026-10-24T00:00:00.000', '2026-10-24T23:59:59.999']
})
```

## FieldHint（问号提示）

> EN: FieldHint (hint)

独立组件，标题 / 输入框后随处可挂。气泡是官方 Tooltip 本体，启动时用 `setTooltipRenderer((p) => h(OfficialTooltip, p))` 注入，其余 props 透传。

> EN: Standalone — hang it after a title or input. The bubble is the official Tooltip, injected at startup via `setTooltipRenderer((p) => h(OfficialTooltip, p))`; other props pass through.

未注入 renderer 的环境只显示问号图标，不出气泡。

> EN: Without a renderer only the question-mark icon shows, no bubble.

## Card / StripCard

> EN: Card / StripCard

两种外观，两个组件：Card = surface 底 + 1px 边框 + 圆角（padding 14px，左 12 使竖条贴边）；StripCard = 同色浅底 + 占位边框 + 方角。

> EN: Two appearances, two components: Card = surface background + 1px border + rounded corners (padding 14px, left 12 so the strip hugs the edge); StripCard = same-hue light background + placeholder border + square corners.

头部整体垂直居中，`action` 里裸放一个元素即居中。颜色全走 token，明暗跟随宿主。

> EN: The header centers vertically as a whole; drop a bare element into `action` and it centers. Colors come from tokens, so light/dark follows the host.

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

小标签。`tone`：neutral（默认）/ business / success / warning / danger；`size`：sm（默认）/ md（12px）。传 `onClick` 才可点。

> EN: A small tag. `tone`: neutral (default) / business / success / warning / danger; `size`: sm (default) / md (12px). Pass `onClick` to make it clickable.

边界：只做「胶囊标签」。纯图标的小按钮请用 IconButton，别拿 Chip 当图标底板。

> EN: Boundary: pill tags only. For an icon-only button use IconButton; never use Chip as an icon baseplate.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `tone` | `'neutral' \| 'business' \| 'success' \| 'warning' \| 'danger'` | 'neutral' | 语义色（neutral 灰面，其余为实心信号面） | Semantic color (neutral grey; others are solid signal faces) |
| `size` | `'sm' \| 'md' \| 'xs'` | 'sm' | 尺寸档 | Size tier |
| `width` | `number \| string` | — | 固定宽（px 或任意 CSS 宽度）；与 minWidth / maxWidth 互斥，一旦设定后两者自动失效 | Fixed width (px or any CSS width); mutually exclusive with minWidth/maxWidth — once set, the other two are ignored |
| `minWidth` | `number \| string` | — | 最小宽：width 未设时生效，内容不足此宽时以它为准 | Minimum width: applies only when width is unset; content shorter than this still takes this width |
| `maxWidth` | `number \| string` | — | 最大宽：width 未设时生效，文字超出折叠成省略号，hover 以跑马灯展开全名 | Maximum width: applies only when width is unset; overflowing text collapses to an ellipsis and marquees on hover |
| `onClick` | `() => void` | — | 传了才渲染成 <button>（可点），否则是 <span> | When given, renders as <button> (clickable); otherwise a <span> |
| `className` | `string` | — | 追加 class（只允许补布局，不许覆盖皮肤） | Extra class (layout only, never overrides the skin) |
| `children` | `ReactNode` | — | 标签内容（maxWidth + 纯文字时自动接跑马灯） | Tag content (auto-marqueed when maxWidth + plain text) |

## 反馈件

> EN: Feedback

底层是 Sonner。toast 宿主是 globalThis 单例（`Symbol.for('dsh-plugin-core/toast-host')`）：首个副本建容器，其余把 payload 交它渲染。

> EN: Backed by Sonner. The toast host is a singleton on globalThis (`Symbol.for('dsh-plugin-core/toast-host')`): the first copy mounts the container, the rest hand their payload to it.

三条取舍（照用别改）：① 样式取首个副本；② position 全局共享；③ 不做卸载回收。无 document 的环境静默跳过。

> EN: Three trade-offs (accept them): ① styling comes from the first copy; ② position is shared per screen; ③ no unload reclamation. Environments without document skip silently.

加载提示两种样式：`LoadingToast` 横排卡（转圈在左、文字在右，灰底与 notify 的 info 卡同色）、`LoadingBlock` 方块卡（转圈在上、文字在下，内距更大）。默认文案走内置字典「数据加载中」/「Loading」，传 `text` 覆盖。

> EN: Two loading styles: `LoadingToast` — a horizontal card (spinner left, text right, same grey as the notify info card) — and `LoadingBlock` — a square card (spinner above text, roomier padding). The default copy comes from the built-in dictionary (“数据加载中” / “Loading”); pass `text` to override.

命令式 `showLoading(opts)` 同样是 globalThis 单例（`Symbol.for('dsh-plugin-core/loading-host')`）：**屏幕上永远只有一张卡**，任何插件、任何屏位、多少次调用都一样 —— 后一次直接顶掉前一次，被顶掉那次的句柄再 `close()` 是空操作。**不自动消失**，收起只能自己调 `close()`。屏位默认 `bottom-center`（与 Toast 同屏位），`position` 可选 `top-left` / `top-center` / `top-right` / `center` / `bottom-left` / `bottom-center` / `bottom-right`。`mask` 默认 false（后面照常可点）；开了遮罩 `maskOpacity` 默认 0（全透明，但仍挡住点击）。要放进自己的空间（表格、卡片…）就就地渲染 `LoadingToast` / `LoadingBlock`——它们只管外观，位置与遮罩归调用方。

> EN: The imperative `showLoading(opts)` is another globalThis singleton (`Symbol.for('dsh-plugin-core/loading-host')`): **only one card ever exists** — across plugins, placements and call counts alike. A later call replaces the previous one, and the superseded handle’s `close()` is a no-op. It **never dismisses itself**; only your own `close()` removes it. Placement defaults to `bottom-center` (the Toast slot); `position` takes `top-left` / `top-center` / `top-right` / `center` / `bottom-left` / `bottom-center` / `bottom-right`. `mask` defaults to false (the page stays clickable); when enabled, `maskOpacity` defaults to 0 (fully transparent, still blocking clicks). To keep it inside your own area (table cell, card…), render `LoadingToast` / `LoadingBlock` in place — they are appearance only; placement and masking belong to the caller.

Modal 是自绘 overlay，不走 react-dom portal。

> EN: Modal is a self-drawn overlay, not a react-dom portal.

遮罩右边界读 `--dshpc-page-inset-right`（多个 dock 求和），自动让开右侧分栏，弹窗在**剩余区域**居中。弹窗无需任何遮罩参数；也别自己量分栏宽度（挂载异步，恒为 0）。

> EN: The mask’s right edge reads `--dshpc-page-inset-right` (summed across docks) and yields to the right column, centering the dialog in the **remaining** area. The dialog needs no mask props; never measure the column yourself (mounting is async, it always reads 0).

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `showToast(message, opts?)` | `` |  | 官方 Sonner 原生（对比 / demo 用）。opts: `{ variant?, durationMs?, color?, onDismiss?, position? }`，6 向定位，明暗跟随宿主 | Raw official Sonner (comparison / demo). opts `{ variant?, durationMs?, color?, onDismiss?, position? }`, 6-way placement, theme follows host |
| `notify(message, opts?)` | `` |  | 默认用这个。opts: `{ variant?, description?, durationMs?, position?, actions? }`，actions 用自带 Button（1–2 个） | Use this by default. opts `{ variant?, description?, durationMs?, position?, actions? }`, actions use our own Button (1–2) |
| `showHostToast(message, opts?)` | `` |  | 宿主原生 Toast，走 `dsh-plugin-core/ui/host` 子路径。opts: `{ tone?, holdMs?, actions?, onDismiss? }` | Host-native Toast from the `dsh-plugin-core/ui/host` subpath. opts `{ tone?, holdMs?, actions?, onDismiss? }` |
| `showLoading(opts?)` | `` |  | 全局加载提示（全局唯一一处），返回 `{ close() }`。opts: `{ text?, variant?: 'toast' \| 'block', position?, mask?, maskOpacity?, translate? }`；position 默认 bottom-center | Global loading hint (one spot globally) returning `{ close() }`. opts `{ text?, variant?: 'toast' \| 'block', position?, mask?, maskOpacity?, translate? }`; position defaults to bottom-center |
| `LoadingToast({ text? })` | `` |  | 就地渲染的横排加载卡（转圈在左） | In-place horizontal loading card (spinner left) |
| `LoadingBlock({ text? })` | `` |  | 就地渲染的方块加载卡（转圈在上、文字在下） | In-place square loading card (spinner above text) |
| `Loading({ anchorId? })` | `` |  | 贴到主内容容器右下角的加载指示；anchorId 默认 dshpc-main | Loading indicator pinned to the main container’s bottom-right; anchorId defaults to dshpc-main |
| `RunningBlocks()` | `` |  | 运行中的占位块 | Placeholder blocks while running |
| `SectionHead({ icon, title, right? })` | `` |  | 分区标题 | Section heading |
| `MarqueeText({ text, style?, title?, className? })` | `` |  | 超长省略、hover 滚动 | Ellipsis on overflow, scroll on hover |
| `LiveText({ render, style? })` | `` |  | 定时重渲染（相对时间这类） | Periodic re-render (for relative time etc.) |
| `BackToTop({ anchorId? })` | `` |  | 回到顶部，贴主容器右缘外侧 | Back-to-top, outside the main container’s right edge |
| `startResizeLayoutWidth(opts)` | `` |  | 拖拽调整布局宽度（root 不传则回落 #dshpc-root） | Drag to resize layout width (falls back to #dshpc-root if root omitted) |

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `title` | `ReactNode` | — | 标题 | Title |
| `subtitle` | `ReactNode` | — | 标题**下方**的副标题行（等宽小字；会话 id 这类标识放这里，别塞正文） | Subtitle line **under** the title (monospace caption; put identifiers such as a session id here, not in the body) |
| `headerExtra` | `ReactNode` | — | 标题**同一行**右侧的小块（徽标 / 计数）：紧跟标题，不跨标题与副标题两行居中 | Small block (badge / count) on the **same line** as the title: it sits right after the title, never centered across the title and subtitle lines |
| `headerActions` | `ReactNode` | — | 头部右侧动作区（关闭钮之外） | Header actions area (besides the close button) |
| `onClose` | `() => void` | — | 不传则不显示关闭钮 | No close button if omitted |
| `closeOnMask` | `boolean` | 'true' | 点遮罩关闭；误触代价大的场景设 false | Close on mask click; set false where mis-clicks are costly |
| `escClose` | `boolean` | 'true' | Esc 关闭 | Close on Esc |
| `maxWidth` | `string` | 按 size | 任意 CSS 值，覆盖 size 的宽度上限；不要用 vw（遮罩已按右侧分栏让位） | Any CSS value, overriding the size’s max width; avoid vw (the mask already yielded to the right column) |
| `hideHeader` | `boolean` | 'false' | 不渲染头部（沉浸式） | Skip header (immersive) |
| `footer` | `ReactNode` | — | 底栏（按钮区） | Footer (button area) |
| `children` | `ReactNode` | — | 主体 | Body |

## PanelDock（停靠分栏）

> EN: PanelDock (dock)

右侧分栏的通用壳，是**布局成员**而非浮层：占宽挤窄主区，要由调用方放进自己的 flex 根。分工：结构写在调用点（children），显隐归状态（`open` / `close` 只传 id）。

> EN: A generic shell for right-side columns — a **layout member**, not an overlay: it takes width and narrows the main area, so the caller puts it in their own flex root. Split of work: structure at the call site (children), visibility in state (`open`/`close` take only an id).

面板高度默认视口高；嵌在定高容器里时由调用方给 `--dshpc-dock-h`。不支持：同名多实例、tab 切换条、自动淘汰——标签切换请消费方在自己的面板内容里实现。（收起后的耳朵是独立 `fixed` 浮层，不是把面板变成浮层。）

> EN: Panel height defaults to viewport height; in a fixed-height container the caller sets `--dshpc-dock-h`. Not supported: same-name duplicates, tab bars, auto-eviction — tab switching belongs in the consumer’s own panel content. (The collapsed ear is a standalone `fixed` overlay; the panel itself never floats.)

占宽契约：已开栏宽之和（外加开着时给主区滚动条留的 1px 缝，可用 `--dshpc-dock-gap` 调）实时写进根元素 `--dshpc-page-inset-right`（拖拽逐帧更新，全关即移除），全屏遮罩据此让位；同页多个 dock 求和。

> EN: Width contract: the sum of open widths plus a 1px scrollbar gutter while open (tunable via `--dshpc-dock-gap`) goes to `--dshpc-page-inset-right` on the root element (every frame while dragging, removed when all close), and full-screen masks yield to it; multiple docks on one page are summed.

收起 / 展开：`dock.collapse(id)` 让面板退出布局（立刻不占宽）、在右侧出一只固定耳朵；`dock.expand(id)` 把耳朵收回、按记忆宽度还原；`dock.isCollapsed(id)`。耳朵是垂直居中的小图标页签（不放文字），开合带滑入 / 收拢动效；耳朵是独立浮层，与分栏不是一体；`close` 不留耳朵。

> EN: Collapse / expand: `dock.collapse(id)` takes the panel out of the layout (it stops taking width) and shows a fixed ear at the right edge; `dock.expand(id)` pulls the ear back and restores the remembered width; `dock.isCollapsed(id)`. The ear is a small icon-only tab at the vertical center, with slide/collapse animations; it is a standalone overlay, not part of the dock; `close` leaves no ear.

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
| `header` | `ReactNode \| null` | — | 整块替换头部：不传 = 内置头；null = 不要头部；其他 = 你的头 | Whole-header replacement: omitted = built-in; null = no header; else = your header |
| `closable / closeButton / closeIcon` | `—` | — | 关钮开关；位置 auto/header/floating/none | Close-button toggle; position auto/header/floating/none |
| `width / minWidth / maxWidth` | `number` | — | 宽度与可拖动区间 | Width and draggable range |
| `ariaLabel` | `string` | — | 无头部时的无障碍名 | A11y name when no header |

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `onOpen` | `({ id, created: true })` | — | 首次打开 | First open |
| `onBeforeClose` | `({ id, reason: 'button' \| 'api' }) => false?` | — | 关闭之前，返回 false 可取消 | Before close; returning false cancels |
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
