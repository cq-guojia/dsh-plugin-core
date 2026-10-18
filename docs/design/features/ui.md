# ui —— 基础控件

依赖 `design`。装的是「用 token 搭出来的零件」——直接用，不再自己写原生控件。

**纯零件，不自己取数**：选项、当前值都经 props 给（数据要跨 host↔client 边界，通道是插件私有的）。

## 使用前必做（一次）

```ts
import { createStyleKit } from 'dsh-plugin-core/design'
import { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

setStyleKit(createStyleKit({ id: 'dsh-task-reminder-ui', prefix: 'reminder' }))
ensureControls()
```

漏了也不白屏（控件内部会补调），但样式可能晚一帧。

## 控件清单与 props

> 完整签名以 TypeScript 声明为准（`src/ui/*.ts`），下表是导读。
> 「追加 class/style」类参数一律**只允许补布局，不许覆盖皮肤**。

### Button / IconButton

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `variant` | `'primary' \| 'outline' \| 'ghost' \| 'danger'` | `outline` | 外观档 |
| `size` | `'sm' \| 'md' \| 'lg'` | `sm` | 高度档 |
| `icon` | `ReactNode` | — | 前置图标 |
| `children` | `ReactNode` | — | 文案 |
| `…rest` | 原生 button 属性 | — | `type` / `disabled` / `title` / `aria-*` / `onClick` 原样透传 |

`IconButton`：`variant: 'plain' | 'outline' | 'danger'`（默认 `plain`）、`icon`（必填）、`label`（必填，无障碍名兼 title）。

### Segmented

`items: readonly { value: T; label: ReactNode }[]`（必填）+ 单选（`value: T` / `onChange: (v: T) => void`）
或多选（`multiple: true` + `value: T[]`）。另有 `size`（默认 `lg`）、`variant: 'default' | 'inset'`、
`block`（撑满等分）、`label`（无障碍组名）、`id`、`disabled`。

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

**两种卡片外观，拆成两个独立组件**（消费方要用哪个拖哪个，不搞 variant 二合一）：

| 组件 | 外观 | 色条 |
|---|---|---|
| `Card` | 圆角 + 1px 边框 | 短条，上下留距 8px |
| `StripCard` | 无圆角、无边框（贴边） | **通高**（贴顶到底） |

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

色条是绝对定位 + `top/bottom`，**跟着内容高度自适应**；上下是否留距由外观决定（`Card` 留 8px、`StripCard` 通高）。
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

`Chip`：小标签，token 用现成的 `--tdt-chip-bg`；传 `onClick` 才是可点的。

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

| 组件 / 函数 | 说明 |
|---|---|
| `showToast(message, opts?)` | **命令式**，不要求挂组件。`opts: { variant?: 'info' \| 'success' \| 'error', durationMs? }`（默认 2600ms）。无 `document` 静默跳过 |
| `Loading({ anchorId? })` | 贴到主内容容器右下角的加载指示；`anchorId` 默认 `dsh-tdt-main` |
| `RunningBlocks()` | 运行中的占位块 |
| `EmptyState({ text?, icon?, action?, translate? })` | 统一空态 |
| `ErrorBoundary({ fallback?, onError?, translate? })` | class 组件；子组件抛错不让整个插件白屏，默认给「出错了 + 重试」 |
| `SectionHead({ icon, title, right? })` | 分区标题 |
| `MarqueeText({ text, style?, title?, className? })` | 超长省略、hover 滚动 |
| `LiveText({ render, style? })` | 定时重渲染（相对时间这类） |
| `BackToTop({ anchorId? })` | 回到顶部，贴主容器右缘外侧 |
| `startResizeLayoutWidth(opts)` | 拖拽调整布局宽度 |

## 定制边界

- props 就是定制面：要改行为请**组合 props**，不要 fork 源码（fork 会跟不上后续修复）。
- 「追加 class/style」只允许补布局，皮肤一律走 token 覆盖。
- 缺控件时先提需求；实在要自己写，请按 `docs/design/style.md` 的口径用同一套 token，
  并考虑提到本包（一个控件的复用价值高于一次性的私有实现）。
