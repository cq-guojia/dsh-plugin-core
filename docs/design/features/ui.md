# ui —— 基础控件

依赖 `design`。装的是「用 token 搭出来的零件」——直接用，不再自己写原生控件。

**纯零件，不自己取数**：选项、当前值都经 props 给（数据要跨 host↔client 边界，通道是插件私有的）。

## 使用前必做（一次）

```ts
import { createStyleKit } from 'dsh-plugin-core/design'
import { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

setStyleKit(createStyleKit({ id: 'dsh-task-reminder-ui' }))
ensureControls()
```

漏了也不白屏（控件内部会补调），但样式可能晚一帧。

## 控件清单与 props

> 完整签名以 TypeScript 声明为准（`src/ui/*.ts`），下表是导读。
> 「追加 class/style」类参数一律**只允许补布局，不许覆盖皮肤**。

### Button / IconButton

10 档外观（2026-10-19 扩充，对齐主流 UI 框架的分类口径）：

| 类别 | `variant` 档 |
|---|---|
| 实心（语义色底） | `primary`（黑）/ `secondary`（灰）/ `danger`（红）/ `success`（绿）/ `warning`（黄）/ `info`（蓝） |
| 线框 | `outline`（中性描边）/ `danger-outline`（红字描边，旧别名 `danger-ink` 仍可用） |
| 无底 | `ghost`（灰字，hover 起底）/ `link`（行内链接） |

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `variant` | 上表 10 档 | `outline` | 外观档 |
| `size` | `'sm' \| 'md' \| 'lg'` | `lg` | 高度档（24 / 28 / 32，有边无边同高） |
| `icon` | `ReactNode` | — | 前置图标（官方图标组件 / 字符串均可） |
| `iconRight` | `ReactNode` | — | 后置图标（展开箭头、外链） |
| `color` | `string` | — | 自定义主色（任意 CSS 色值）：实心档作底色，线框 / 无底档作主色 |
| `loading` | `boolean` | `false` | 文案前显示同色小圈，并自动 `disabled` |
| `block` | `boolean` | `false` | 撑满父宽 |
| `children` | `ReactNode` | — | 文案（由调用方按语言给：中文出中文、英文出英文，中英混排也支持） |
| `…rest` | 原生 button 属性 | — | `type` / `disabled` / `title` / `aria-*` / `onClick` 原样透传 |

hover / active 走 token 派生色（**不用 opacity**），幅度见 `docs/design/style.md` §交互态颜色。

`IconButton`：`variant: 'plain' | 'outline' | 'danger'`（默认 `plain`）、`size`（默认 `lg`）、`icon`（必填）、
`label`（必填，无障碍名兼 title）。

### Segmented

`items: readonly { value: T; label: ReactNode }[]`（必填）+ 单选（`value: T` / `onChange: (v: T) => void`）
或多选（`multiple: true` + `value: T[]`）。另有 `size`（默认 `lg`）、`variant: 'default' | 'inset'`、
`block`（撑满等分）、`label`（无障碍组名）、`id`、`disabled`。

选中片 = `--dshpc-surface-raised`（与兄弟项目同取法）+ 1px 描边 + 浮起阴影：两种主题下都比轨道亮一档，
在卡片面上靠描边与阴影分界。未选中项 hover 起浅底（inset 用深一档，避免与轨道同色）。

### Input 家族（`Field.ts`）

| 组件 | 关键参数 | 说明 |
|---|---|---|
| `Input` | `value` `onChange(v)` `size`（默认 `sm`）`error` `disabled` `type` `placeholder` `inputRef` `onKeyDown` `onBlur` `aria-label` `title` | 基础输入框；`error` 描红 |
| `PrefixedInput` | 同 `Input` + `prefix: string` | 前置文案（`https://` / `C:\`） |
| `NumberInput` | `value: number` `onChange(v)` `min` `max` `step`（默认 1）`inputWidth` `suffix` `label` `decreaseLabel` `increaseLabel` | 已 clamp；失焦回弹草稿 |
| `Textarea` | `value` `onChange(v)` `placeholder` `error` `disabled` `rows` `spellCheck`（默认关）`aria-label` | — |
| `Checkbox` | `checked` `onChange(next)` `label` `accentColor` `disabled` | — |
| `fieldMetricsOf(size)` | `→ { height, font, line, icon, gap }` | 自己搭同款输入框时对齐尺寸 |

### Picker（通用选择器）

单选 / 多选 / 上限 / 搜索 / 分组 / 空态 / 降级，**自绘**（不依赖官方 Menu）。

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `groups` / `options` | `PickerGroup[]` / `PickerOption[]` | — | 二选一；`options` 会被当成一个无标题组 |
| `value` / `defaultValue` | `string \| string[]` | — | 给了 `value` 即受控；否则内部管 |
| `onChange` | `(v: string \| string[]) => void` | — | 单选回 `string`，多选回 `string[]` |
| `mode` | `'single' \| 'multiple'` | `single` | — |
| `max` | `number` | — | 多选上限；到上限其余项置灰 + 提示（不静默截断） |
| `searchable` | `boolean` | `false` | 显示搜索框 |
| `clearable` | `boolean` | `false` | 单选时列表顶部多一项「不选」 |
| `placeholder` | `string` | 内置「请选择」 | — |
| `degraded` | `boolean` | `false` | 候选可能不完整 ⇒ 顶部如实提示，不编造 |
| `disabled` | `boolean` | `false` | — |
| `size` | `'sm' \| 'md' \| 'lg'` | `md` | — |
| `placement` | `'down' \| 'up'` | `down` | 触发器靠近视口底部时用 `up` |
| `closeOnSelect` | `boolean` | 多选 `false` / 单选恒关 | 选中后是否收起 |
| `showLabels` | `boolean` | `true` | 多选时触发器列出已选项，而非只显示「已选 N 项」 |
| `className` | `string` | — | 定制宽度 / 外边距 |
| `ariaLabel` | `string` | — | 无障碍名 |
| `translate` | `Translate` | 内置 | 覆盖文案 |

键盘：`Esc` 关、`↑↓` 移游标、`Enter` 选。

纯逻辑也可单用：`toGroups` / `flattenOptions` / `filterGroups` / `toggleValue` / `labelsOf` / `groupOf`。

### WorkspacePicker / FilePicker

领域选择器——`Picker` 的薄封装（**领域数据 + 通用选择器交互**，与 explorer 的浏览/预览无关）。

| 组件 | 数据参数 | 其余 |
|---|---|---|
| `WorkspacePicker` | `workspaces: readonly string[]` | `value` `defaultValue` `mode` `max` `onChange` `clearable` `searchable` `disabled` `size` `placement` `className` `placeholder` `translate` |
| `FilePicker` | `files: readonly string[]` | 同上 |

**为什么在 ui 而不在 explorer**：它俩只是 select，不碰目录树 / 预览 / `WorkspaceFilesFace`。
放在 ui 里，需要「选工作区」的地方不必引入整个 explorer；explorer 内部要用也一样从 ui 引。

**数据由调用方给**：工作区列表是 host 侧 `ctx.workspaceRegistry.list()` 取的，要经插件自己的 HTTP 通道
送到 client，那条通道是插件私有的，组件取不到。

```tsx
import { WorkspacePicker } from 'dsh-plugin-core/ui'

h(WorkspacePicker, { workspaces: wsList, value: cur, onChange: setCur })
```

### ModelPicker

`groups: PickerGroup[]`（一组 = 一个供应商）+ `variant: 'cascade' | 'flat'`（默认 `flat`）。

- `flat`：一个下拉列全部
- `cascade`：一行两个下拉，先选供应商再选模型；换供应商会自动清空已选模型

其余参数透传给 `Picker`：`value` / `defaultValue` / `onChange` / `clearable` / `searchable` /
`size` / `placement` / `className` / `disabled` / `degraded` / `translate`。

「跟随宿主」这类默认项由调用方自己往 `groups` 里塞一项——编码口径（如 `provider/id`）也归调用方。

### Card / StripCard / Chip

**两种卡片外观，两个独立组件**（2026-10-20 对齐兄弟项目：框式照 `dsh-task-ledger` 任务行、
浅底条照 `dsh-task-dispatch-table` 执行记录块；import 即表明用的是哪种）：

| 组件 | 外观 | 色条 |
|---|---|---|
| `Card` | surface 底 + 1px 边框 + 圆角（`--dshpc-radius-sm`），padding 14px（左 12 使竖条贴边） | 行内 **6px** 圆角短条（`--dshpc-radius-xs`），高度跟随内容、最小一行 |
| `StripCard` | 同色系浅底（`--dshpc-*-soft`）+ 1px 不可见占位边框 + 方角 | **4px 通高**、方角、贴左缘 |

两种外观的头部都是**整体垂直居中**（`align-items:center`）：调用方在 `action` 里裸放一个元素
（按钮 / 文字 / 图标）即垂直居中，**不用自己套容器**；框内一行两行、右侧放什么、
悬停浮出的按钮，都由调用方在框内自定——外壳只提供框与居中。

浅底与色条同源（仅 `StripCard`）：`accent` 档位同时驱动 `--card-accent`（条）与
`--card-accent-soft`（底）；`neutral` 档浅底借 `--dshpc-chip-bg`（与兄弟项目 mute 档同款，明暗都成立）。
`StripCard` 的边框写 `1px solid transparent` 只为占位（将来状态态切 `border-color` 不跳布局），**不可见**。

两者共享同一套 props：

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `accent` | 5 档 or 任意 CSS 色值 | `'business'` | 档位：`business`(蓝) / `success`(绿) / `warning`(黄) / `danger`(红) / `neutral`(灰)，映射到 design 的 token；也可传 `'#f59e0b'` 这类自定义值 |
| `expanded` | `boolean` | `false` | 展开态（箭头朝向 + `panel` 显隐） |
| `onToggle` | `() => void` | — | 传了才显示右侧折叠箭头；**展开状态由调用方管** |
| `action` | `ReactNode` | — | 右上角操作区（「跳过」「查看会话」） |
| `children` | `ReactNode` | — | 主内容，排版随你 |
| `panel` | `ReactNode` | — | 展开后才显示的额外内容 |
| `className` / `style` | — | — | 追加类 / 样式 |

色条几何随外观：

- `StripCard`：绝对定位 + `top/bottom` ⇒ **通高**（贴顶到底，含展开区）；左内边距 20px = 16px 留白 + 4px 条宽 ⇒ 内容从色条**右缘**起算（与兄弟项目块同口径）。
- `Card`：行内 flex 短条，**高度跟着内容走**（`align-self:stretch`），最小一行文字（`--dshpc-line-md`）⇒ 一行文字时条子与文字齐高、不把卡撑高；左内边距 12px（较上 / 右 / 下 14 少 2，使竖条贴近边框），竖条↔内容间距 12px 不变。

颜色全走 token ⇒ **亮暗自动跟随宿主**（`body[data-ds-dark-theme]`），不需要调用方处理。

```tsx
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

`Chip`：小标签。两条可选轴（2026-10-20）：

- `tone`：`neutral`（默认，灰面 `--dshpc-chip-bg`）/ `business` / `success` / `warning` / `danger`
  —— 非 neutral 为实心信号面，底 / 字 / hover 配对与 Button 同源（黄底中高明度 ⇒ 字用 `--dshpc-on-warning`）。
- `size`：`sm`（默认，与旧版逐像素一致）/ `md`（`font-size:12px`，卡片元信息行用）。

传 `onClick` 才是可点的。

**语义边界**：`Chip` 只管「胶囊标签」这一件事。**只给图标的小按钮请用 `IconButton`**（`.dshpc-iconbtn`），
不要拿 `Chip` 当图标底板——同一个类名两套皮肤（28px 定宽 vs 胶囊形）会互相覆盖、把文字挤成一列。
现在一套皮肤只允许出现一次，由 `test/css-contract.test.mjs` 盯着。

### Modal

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `title` | `ReactNode` | — | 标题 |
| `onClose` | `() => void` | — | 不传则不显示关闭钮 |
| `closeOnMask` | `boolean` | `true` | 点遮罩关闭；误触代价大的场景设 `false` |
| `escClose` | `boolean` | `true` | Esc 关闭 |
| `maxWidth` | `string` | `min(960px, 92vw)` | — |
| `hideHeader` | `boolean` | `false` | 不渲染头部（沉浸式） |
| `footer` | `ReactNode` | — | 底栏（按钮区） |
| `children` | `ReactNode` | — | 主体 |

自绘 overlay，**不用 react-dom 的 portal**（避免多一个必需依赖）。

### 反馈件

**FieldHint（问号提示）**：独立组件，不属于 Input 家族——标题后、按钮后、文字后、输入框后随处可挂。
气泡 = **官方 Tooltip 本体**（2026-10-19 拍板「必须与悬停提示用同一个」）：插件启动时
`setTooltipRenderer((props) => h(OfficialTooltip, props))` 把官方组件交给 core，`side` / `align` / `maxWidth` 可透传。
**不做降级兜底**（用户同日明确：宿主内官方包恒在；官方改版 = 重新适配，不另造一套）——
未注入 renderer 的非宿主环境（node 自检）只出问号图标、没有气泡。

core 保持零官方依赖：官方 Tooltip 只能由插件侧注入（`src/ui/tooltip.ts`），不许静态 import。

### 反馈件

| 组件 / 函数 | 说明 |
|---|---|
| `showToast(message, opts?)` | **命令式**，不要求挂组件。`opts: { variant?: 'info' \| 'success' \| 'error', durationMs? }`（默认 2600ms）。无 `document` 静默跳过 |
| `Loading({ anchorId? })` | 贴到主内容容器右下角的加载指示；`anchorId` 默认 `dshpc-main` |
| `RunningBlocks()` | 运行中的占位块 |
| `EmptyState({ text?, icon?, action?, translate? })` | 统一空态 |
| `ErrorBoundary({ fallback?, onError?, translate? })` | class 组件；子组件抛错不让整个插件白屏，默认给「出错了 + 重试」 |
| `SectionHead({ icon, title, right? })` | 分区标题 |
| `MarqueeText({ text, style?, title?, className? })` | 超长省略、hover 滚动 |
| `LiveText({ render, style? })` | 定时重渲染（相对时间这类） |
| `BackToTop({ anchorId? })` | 回到顶部，贴主容器右缘外侧 |
| `startResizeLayoutWidth(opts)` | 拖拽调整布局宽度（`root` 不传则回落 `#dshpc-root`） |
| `PanelDock` / `createPanelDock(opts)` | 可停靠分栏容器，见下节 |

### PanelDock（停靠分栏）

「右侧分栏」从业务里剥出来的通用壳。**它是布局成员，不是浮层**：占宽度、把主区挤窄，
不是盖上去。因此必须由调用方放进自己的 flex 根里。

**分工照成熟组件库的通行做法**（Ant Design `Tabs` / `Drawer` 同一套）：
**结构写在调用点（children），显隐归状态（`open/close` 只传 id）**。

```ts
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

| 行为 | 结果 |
|---|---|
| `open()` 不传 `id` | 开默认窗口（保留名 `default`） |
| `open(id)`，已开 | 什么都不做（`created: false`），不新增一栏、不跳位 |
| `open(id)`，未开且未满 | 追加一栏 |
| 已到 `maxPanels` 再开新组名 | **拒绝**，返回 `{ ok: false, reason: 'limit' }` 并回调 `onLimitReached`；库不弹提示、不抛异常 |
| `close(id?, reason?)` | 关一栏（缺省关 `default`）；腾出的位置可再开新组名 |
| `toggle(id)` | 开着就关、关着就开 |

`createPanelDock(opts)`：

| 参数 | 默认 | 说明 |
|---|---|---|
| `maxPanels` | `3` | 同时存在的栏数上限 |
| `defaultWidth` / `minWidth` | `460` / `320` | 兜底宽度与下限（面板自己给了就以面板为准） |
| `storageKey` | `'dshpc-dock'` | 宽度记忆前缀；传 `false` 关闭 |

`<DockPanel>` 的 props：

| 字段 | 说明 |
|---|---|
| `id` | 组名（寻址键），同名唯一 |
| `title` / `icon` | 内置头的标题与标题前图标（ReactNode，可多个） |
| `extra` | 标题**右侧**的任意内容（不只是按钮） |
| `header` | 整块替换头部：不传 = 内置头；`null` = **不要头部**；其他 = 你的头（库不加内边距/边框/背景） |
| `closable` / `closeButton` / `closeIcon` | 关钮开关；位置 `auto`（默认：有头 = 右上 `top10/right8`、无头 = 浮动）/ `header` / `floating` / `none`。关钮一律**绝对定位**：位置固定、不占头部布局宽度（自定义头拿到整行），锚在面板上不随正文滚动；要挪位置或自己画，用 `closeButton="none"` |
| `width` / `minWidth` / `maxWidth` | 宽度与可拖动区间；`maxWidth` 不传 = 只受视口与主区保底约束 |
| `ariaLabel` | 无头部时的无障碍名（缺省退回 `title` / `id`） |

**事件都带 `id` 与原因**（`createPanelDock` 的选项）：

| 回调 | 时机 | 参数 |
|---|---|---|
| `onOpen` | 首次打开 | `{ id, created: true }` |
| `onBeforeClose` | 关闭**之前**，返回 `false` 可取消 | `{ id, reason: 'button' \| 'api' }` |
| `onClose` | 已关闭 | `{ id, reason }` |
| `onResize` | 拖宽松手 | `{ id, width }` |
| `onLimitReached` | 到上限被拒 | `{ id }` |

组件参数 `mainMinWidth`（默认 480）：拖宽时给主区留的最小宽度，算单栏宽度上限用。

面板高度默认视口高（`height: var(--dshpc-dock-h, 100vh)`）：整页场景不用管；嵌在定高容器里时
由调用方在该容器上给 `--dshpc-dock-h`（如 `100%` / `420px`）。

不做的事（拍板留档，别重提）：多份同名（`multi`）、tab 切换条、自动淘汰、浮动层——
**标签切换由消费方在自己的面板内容里实现**。

两条实现约束：面板是 `position:sticky` + `height:100vh` 的 flex 成员，**刻意不设 z-index**
（布局成员一旦有正 z-index 会盖过宿主 portal 的弹窗）；拖动期给 `iframe` 让出指针事件，
否则拖进 PDF/HTML 预览会卡死。

## 定制边界

- props 就是定制面：要改行为请**组合 props**，不要 fork 源码（fork 会跟不上后续修复）。
- 「追加 class/style」只允许补布局，皮肤一律走 token 覆盖。
- 缺控件时先提需求；实在要自己写，请按 `docs/design/style.md` 的口径用同一套 token，
  并考虑提到本包（一个控件的复用价值高于一次性的私有实现）。
