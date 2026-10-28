// ui 子包的使用帮助 —— 真源（TS 数据模块）。内容全在此一处，demo 与 md 都从这份派生。
import type { DocTopic } from '../design/doc-format.js'

const setup = `import { createStyleKit } from 'dsh-plugin-core/design'
import { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

setStyleKit(createStyleKit({ id: 'dsh-task-reminder-ui' }))
ensureControls()`

const cardExample = `import { Card, Chip, StripCard } from 'dsh-plugin-core/ui'

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
}, h('div', null, '标题 + 元信息'))`

const panelDockExample = `const dock = createPanelDock({ maxPanels: 3 })   // 一次，挂在插件级

// 页面里：结构就在这儿写，不塞进任何调用参数
h('div', { style: { display: 'flex' } },
  h(Main, null),                                  // flex:1 1 auto; min-width:0
  h(PanelDock, { dock },
    h(DockPanel, { id: 'files', title: '工作区' }, h(FilePanel)),
    h(DockPanel, { id: 'preview', header: h(PreviewBar) }, h(PreviewBody)),
    h(DockPanel, { id: 'raw', header: null, closeButton: 'floating' }, h(RawBody)),
  ),
)
// 之后任何地方：dock.open('files') / dock.close('files')`

const workspacePickerExample = `import { WorkspacePicker, connectHost } from 'dsh-plugin-core/ui'

// apply(ctx) 里：connectHost(ctx)
h(WorkspacePicker, { value: cur, onChange: setCur, clearable: true })`

const dateTimePickerExample = `import { DateTimePicker } from 'dsh-plugin-core/ui'

// 单个时刻，精确到分（起始端归零：14:30 ⇒ 14:30:00.000）
h(DateTimePicker, { precision: 'minute', value: startAt, onChange: setStartAt })

// 时间段：一个整条触发器（两个日期区 + 灰隔条 -），day 精度下结束端补到当天最后一刻
h(DateTimePicker, {
  mode: 'range',
  precision: 'day',
  value: range,
  onChange: setRange, // → ['2026-10-24T00:00:00.000', '2026-10-24T23:59:59.999']
})`

const splitGroupExample = `import { SplitGroup, Segmented, Picker } from 'dsh-plugin-core/ui'

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
)`

const doc: DocTopic = {
  title: { zh: 'ui —— 基础控件', en: 'ui — base controls' },
  exports: [
    'Button', 'IconButton', 'Segmented', 'SplitGroup', 'Input', 'PrefixedInput', 'NumberInput', 'Textarea',
    'Checkbox', 'fieldMetricsOf', 'Picker', 'WorkspacePicker', 'ModelPicker', 'DateTimePicker', 'Card', 'StripCard',
    'Chip', 'Modal', 'FieldHint', 'setTooltipRenderer', 'showToast', 'notify', 'showHostToast',
    'Loading', 'RunningBlocks', 'SectionHead', 'MarqueeText', 'LiveText',
    'BackToTop', 'startResizeLayoutWidth', 'PanelDock', 'createPanelDock', 'DockPanel',
    'ensureControls', 'setStyleKit',
  ],
  sections: [
    {
      id: 'ui-overview',
      heading: { zh: '概览', en: 'Overview' },
      prose: [
        {
          zh: '依赖 design。装的是「用 token 搭出来的零件」，直接用，不再自己写原生控件。纯零件不自己取数：选项、当前值都经 props 给（数据通道是插件私有的）。',
          en: 'Depends on design. "Parts built from tokens" — use them instead of writing native controls. No self-fetching: options and value come via props (the data channel is plugin-private).',
        },
        {
          zh: '入口零 `@deepseek-ai/*` 依赖（非宿主环境 import 不崩）。官方 primitives 走独立子路径 `dsh-plugin-core/ui/official`，封装一律从这条通路引。',
          en: 'The entry keeps zero `@deepseek-ai/*` deps (imports never crash outside the host). Official primitives come through the separate subpath `dsh-plugin-core/ui/official`; import them only from there.',
        },
        {
          zh: '定制边界：props 就是定制面，要改行为请组合 props，不要 fork 源码；追加 class/style 只允许补布局，皮肤走 token 覆盖；缺控件请先提需求。',
          en: 'Customization: props are the surface — compose them instead of forking source; appended class/style may only patch layout, skins go through token overrides; raise a request before writing a missing control yourself.',
        },
      ],
      code: [{ id: 'ui-setup', lang: 'ts', src: setup }],
    },
    {
      id: 'button',
      heading: { zh: 'Button / IconButton / Segmented', en: 'Button / IconButton / Segmented' },
      prose: [
        {
          zh: 'Button 10 档外观（实心 / 线框 / 无底）。hover / active 走 token 派生色（不用 opacity）。',
          en: 'Button offers 10 variant tiers (solid / outline / bare). hover/active use token-derived colors (no opacity).',
        },
        {
          zh: 'IconButton：variant: plain|outline|danger（默认 plain）、size（默认 lg）、icon（必填）、label（必填，无障碍名兼 title）。',
          en: 'IconButton: variant plain|outline|danger (default plain), size (default lg), icon (required), label (required, doubles as a11y name and title).',
        },
        {
          zh: 'Segmented：`items`（必填）支持单选 / 多选，`size`（默认 lg；三档总高 24 / 28 / 32）、`bordered`（1px 外框，总高不变）、`multiple`（多选）。外观只有一套：灰底轨道 + 白色选中片，选中片的描边环与阴影由宿主 elevation token 提供（离线兜底值没有那圈环）。段内 `count`（弱化灰字）/ `badge`（红角标）接受 `number | string`：数字 ≤0 不显示，字符串原样显示（如 `1K` / `99+`）。',
          en: 'Segmented: `items` (required) supports single or multiple selection; `size` (default lg; totals 24 / 28 / 32), `bordered` (1px outer frame, same total height), `multiple` (multi-select). One look only: grey track + white selected pill; its stroke ring and shadow come from the host elevation token (the offline fallback has no ring). An item’s `count` (muted text) and `badge` (red pill) take `number | string`: numbers ≤0 render nothing, strings render as given (e.g. `\'1K\'` / `\'99+\'`).',
        },
      ],
      api: [
        {
          id: 'ui-button',
          rows: [
            { name: 'variant', type: "上表 10 档（primary/secondary/danger/success/warning/info/outline/danger-outline/ghost/link）", def: "'outline'", desc: { zh: '外观档', en: 'Appearance tier' } },
            { name: 'size', type: "'sm' | 'md' | 'lg'", def: "'lg'", desc: { zh: '高度档（24 / 28 / 32，有边无边同高）', en: 'Height tier (24 / 28 / 32, same height with or without border)' } },
            { name: 'icon', type: 'ReactNode', def: '—', desc: { zh: '前置图标（官方图标组件 / 字符串均可）', en: 'Leading icon (official icon component or string)' } },
            { name: 'iconRight', type: 'ReactNode', def: '—', desc: { zh: '后置图标（展开箭头、外链）', en: 'Trailing icon (expand arrow, external link)' } },
            { name: 'color', type: 'string', def: '—', desc: { zh: '自定义主色：实心档作底色，线框 / 无底档作主色', en: 'Custom main color: background for solid tiers, main color for outline/bare' } },
            { name: 'loading', type: 'boolean', def: "'false'", desc: { zh: '文案前显示同色小圈，并自动 disabled', en: 'Shows a same-color spinner before the label and auto-disables' } },
            { name: 'block', type: 'boolean', def: "'false'", desc: { zh: '撑满父宽', en: 'Fill parent width' } },
            { name: 'width', type: 'number | string', def: '—', desc: { zh: '固定宽（px 或任意 CSS 宽度）；与 minWidth / maxWidth 互斥，一旦设定后两者自动失效', en: 'Fixed width (px or any CSS width); mutually exclusive with minWidth/maxWidth — once set, the other two are ignored' } },
            { name: 'minWidth', type: 'number | string', def: '—', desc: { zh: '最小宽：width 未设时生效，内容不足此宽时以它为准', en: 'Minimum width: applies only when width is unset; content shorter than this still takes this width' } },
            { name: 'maxWidth', type: 'number | string', def: '—', desc: { zh: '最大宽：width 未设时生效，文字超出折叠成省略号，hover 以跑马灯展开全名', en: 'Maximum width: applies only when width is unset; overflowing text collapses to an ellipsis and marquees on hover' } },
            { name: 'children', type: 'ReactNode', def: '—', desc: { zh: '文案（由调用方按语言给：中文出中文、英文出英文，中英混排也支持）', en: 'Label (caller supplies per locale: zh shows zh, en shows en, mixed is supported)' } },
            { name: '…rest', type: '原生 button 属性', def: '—', desc: { zh: 'type / disabled / title / aria-* / onClick 原样透传', en: 'type / disabled / title / aria-* / onClick passed through' } },
          ],
        },
      ],
    },
    {
      id: 'input',
      heading: { zh: 'Input 家族（Field.ts）', en: 'Input family (Field.ts)' },
      api: [
        {
          id: 'ui-input',
          rows: [
            { name: 'Input', type: 'value onChange(v) size(默认 sm) error disabled type icon placeholder inputRef onKeyDown onBlur aria-label title hint', def: '—', desc: { zh: '基础输入框；error 描红；hint 给字符串即自动挂标准问号提示；icon 是左侧图标槽（不吃点击，尺寸取 fieldMetricsOf(size).icon）；type=search 时聚焦且有内容才在右侧出清空钮', en: 'Basic input; error turns it red; passing hint as a string auto-attaches a standard question-mark hint; icon is the leading icon slot (does not swallow clicks; size from fieldMetricsOf(size).icon); with type=search a clear button appears on the right only while focused and non-empty' } },
            { name: 'PrefixedInput', type: '同 Input + prefix: string', def: '—', desc: { zh: '前置文案（https:// / C:\\）', en: 'Leading text (https:// / C:\\)' } },
            { name: 'NumberInput', type: 'value: number onChange(v) min max step(默认 1) inputWidth suffix label decreaseLabel increaseLabel hint', def: '—', desc: { zh: '已 clamp；失焦回弹草稿', en: 'Already clamped; reverts to draft on blur' } },
            { name: 'Textarea', type: 'value onChange(v) placeholder error disabled rows spellCheck(默认关) aria-label hint', def: '—', desc: { zh: 'hint 的问号钉在右下角（单行控件则在行尾垂直居中）', en: 'hint’s question mark pins to the bottom-right (for single-line controls it centers at the row end)' } },
            { name: 'Checkbox', type: 'checked onChange(next) label accentColor disabled', def: '—', desc: { zh: '—', en: '—' } },
            { name: 'fieldMetricsOf(size)', type: '→ { height, font, line, icon, gap }', def: '—', desc: { zh: '自己搭同款输入框时对齐尺寸', en: 'Match dimensions when building your own same-style input' } },
          ],
        },
      ],
    },
    {
      id: 'picker',
      heading: { zh: 'Picker / WorkspacePicker / ModelPicker', en: 'Picker / WorkspacePicker / ModelPicker' },
      prose: [
        {
          zh: 'Picker：单 / 多选、上限、搜索、分组、空态，自绘。键盘：Esc 关、↑↓ 移游标、Enter 选。纯逻辑可单用：`toGroups` / `filterGroups` / `toggleValue`。触发器支持 width / minWidth / maxWidth 约束宽度：定宽忽略另两者；内容超长则省略号 + hover 跑马灯。菜单里的选项超长同样省略 + hover 跑马灯，不会把菜单撑出横向滚动条。',
          en: 'Picker: single/multiple selection, cap, search, grouping, empty state — self-drawn. Keyboard: Esc closes, ↑↓ move the cursor, Enter selects. Logic reusable standalone: `toGroups` / `filterGroups` / `toggleValue`.',
        },
        {
          zh: 'WorkspacePicker：数据自带的领域选择器。在插件 apply 里调一次 `connectHost(ctx)`，组件即订阅官方 `workspaces` 快照。未接线 = 空态，不编造数据。',
          en: 'WorkspacePicker: a domain picker that brings its own data. Call `connectHost(ctx)` once in the plugin apply and it subscribes to the official `workspaces` snapshot. Unwired = empty state, never fabricated data.',
        },
        {
          zh: 'ModelPicker：数据自带，`variant` 为 `grouped`（默认）/ `cascade`；`onChange` 一律发 `provider/id` 形式的模型 value。目录来自宿主 `serveModelCatalog`。',
          en: 'ModelPicker: brings its own data; `variant` is `grouped` (default) or `cascade`; `onChange` always emits the model value as `provider/id`. Catalog comes from the host `serveModelCatalog`.',
        },
      ],
      api: [
        {
          id: 'ui-picker',
          rows: [
            { name: 'groups / options', type: 'PickerGroup[] / PickerOption[]', def: '—', desc: { zh: '二选一；options 会被当成一个无标题组', en: 'One of the two; options is treated as a single untitled group' } },
            { name: 'value / defaultValue', type: 'string | string[]', def: '—', desc: { zh: '给了 value 即受控；否则内部管', en: 'Passing value makes it controlled; otherwise it manages internally' } },
            { name: 'onChange', type: '(v: string | string[]) => void', def: '—', desc: { zh: '单选回 string，多选回 string[]', en: 'Single returns string, multiple returns string[]' } },
            { name: 'mode', type: "'single' | 'multiple'", def: "'single'", desc: { zh: '—', en: '—' } },
            { name: 'max', type: 'number', def: '—', desc: { zh: '多选上限；到上限其余项置灰 + 提示（不静默截断）', en: 'Multiple-select cap; at cap others grey out + a hint (no silent truncation)' } },
            { name: 'searchable', type: 'boolean', def: "'false'", desc: { zh: '显示搜索框；展开菜单时自动聚焦搜索框', en: 'Shows a search box; auto-focuses it when the menu opens' } },
            { name: 'align', type: "'left' | 'center'", def: "'left'", desc: { zh: '触发器文字对齐', en: 'Trigger text alignment' } },
            { name: 'clearable', type: 'boolean', def: "'false'", desc: { zh: '单选时列表顶部多一项「不选」', en: 'In single mode, adds a "none" item at the top of the list' } },
            { name: 'placeholder', type: 'string', def: '内置「请选择」', desc: { zh: '—', en: '—' } },
            { name: 'degraded', type: 'boolean', def: "'false'", desc: { zh: '候选可能不完整 ⇒ 顶部如实提示，不编造', en: 'Candidates may be incomplete ⇒ honest top hint, no fabrication' } },
            { name: 'size', type: "'sm' | 'md' | 'lg'", def: "'md'", desc: { zh: '—', en: '—' } },
            { name: 'placement', type: "'down' | 'up'", def: "'down'", desc: { zh: '触发器靠近视口底部时用 up', en: 'Use up when the trigger is near the viewport bottom' } },
            { name: 'closeOnSelect', type: 'boolean', def: '多选 false / 单选恒关', desc: { zh: '选中后是否收起', en: 'Whether to collapse after selection' } },
            { name: 'showLabels', type: 'boolean', def: "'true'", desc: { zh: '多选时触发器列出已选项，而非只显示「已选 N 项」', en: 'In multiple mode the trigger lists selected items instead of just "N selected"' } },
            { name: 'icon', type: 'ReactNode', def: '—', desc: { zh: '触发器文字前的图标', en: 'Icon before the trigger text' } },
            { name: 'hint', type: 'string', def: '—', desc: { zh: '问号提示文字：自动在触发器后挂标准 FieldHint', en: 'Hint text: auto-attaches a standard FieldHint after the trigger' } },
            { name: 'className', type: 'string', def: '—', desc: { zh: '定制宽度 / 外边距', en: 'Custom width / margin' } },
            { name: 'width', type: 'number | string', def: '—', desc: { zh: '定宽（px 或任意 CSS 长度）；给了即忽略 minWidth / maxWidth，触发器锁定此宽；内容超长则省略 + hover 跑马灯', en: 'Fixed width (px or any CSS length); overrides minWidth/maxWidth and locks the trigger; overflow elides + hover marquee' } },
            { name: 'minWidth', type: 'number | string', def: '120px（CSS 默认）', desc: { zh: '最小宽；内容不到此宽触发器也不更窄', en: 'Minimum width; trigger never narrower than this' } },
            { name: 'maxWidth', type: 'number | string', def: '100%（CSS 默认）', desc: { zh: '最大宽；内容超过此宽则省略 + hover 跑马灯', en: 'Maximum width; overflow elides + hover marquee' } },
            { name: 'ariaLabel', type: 'string', def: '—', desc: { zh: '无障碍名', en: 'Accessible name' } },
            { name: 'translate', type: 'Translate', def: '内置', desc: { zh: '覆盖文案', en: 'Override copy' } },
          ],
        },
        {
          id: 'ui-workspace-picker',
          rows: [
            { name: 'value / defaultValue / onChange', type: '选中值为 workspaceId（不是 title）；\'\' = 「所有工作区」', def: '—', desc: { zh: '不筛', en: 'No filter' } },
            { name: 'allowDefault / defaultLabel', type: '「所有工作区」默认项：默认提供、置顶、只在单选出现；选中发 \'\'；false 关掉', def: '—', desc: { zh: '文案可改', en: 'Text is customizable' } },
            { name: 'mode / max', type: '单选 / 多选 / 上限（到上限已选项仍可反选）', def: '—', desc: { zh: '—', en: '—' } },
            { name: 'placeholder', type: 'string', def: '默认「工作区」', desc: { zh: '想叫「选择工作区」就传它', en: 'Pass it if you want "选择工作区"' } },
            { name: 'icon', type: 'ReactNode', def: '—', desc: { zh: '触发器前置图标：不传 = 默认文件夹；null = 不显示；传元素 = 自定义', en: 'Leading trigger icon: omitted = default folder; null = hidden; element = custom' } },
          ],
        },
        {
          id: 'ui-model-picker',
          rows: [
            { name: 'variant', type: "'grouped' | 'cascade'", def: "'grouped'", desc: { zh: 'grouped = 一个下拉完全独立；cascade = 两个下拉联动（先选供应商，模型列表跟着筛；换供应商清空已选）', en: 'grouped = one standalone dropdown; cascade = two linked dropdowns (pick provider first, model list filters; switching provider clears selection)' } },
            { name: 'allowDefault / defaultLabel', type: '「默认模型」选项：默认提供；false 关闭；选中发 \'\'', def: '—', desc: { zh: '文案可传 defaultLabel', en: 'Pass defaultLabel for the text' } },
            { name: 'placeholder', type: 'string', def: '默认「模型」', desc: { zh: 'icon：不传 = 默认星形；null = 不显示；传元素 = 自定义', en: 'icon: omitted = default star; null = hidden; element = custom' } },
            { name: '透传 Picker', type: 'value / defaultValue / onChange / clearable / searchable / hint / size / placement / className / disabled / degraded / translate', def: '—', desc: { zh: '同 Picker 同名参数', en: 'Same-named params as Picker' } },
          ],
        },
      ],
      code: [{ id: 'ui-workspacepicker-example', lang: 'tsx', src: workspacePickerExample }],
    },
    {
      id: 'split-group',
      heading: { zh: 'SplitGroup（组合选择框）', en: 'SplitGroup (combined selectors)' },
      prose: [
        {
          zh: '只做一件事：把两个控件在**外观上**焊成一体——外框、圆角、两格之间那条 1px 分隔、整体聚焦圈都由外壳画；内件仍是原来的控件（它们把边框、底色、圆角交出来）。形态随便换：滑块 + 下拉、下拉 + 下拉，外壳不变。',
          en: 'Does one thing: welds two controls into one **visually** — outer frame, corner radius, the 1px divider between the cells and the shared focus ring all come from the shell; the inner controls stay the original ones (they hand over border, background and radius). Swap the cells freely: segmented + dropdown, dropdown + dropdown — the shell does not change.',
        },
        {
          zh: '外壳**不持状态、不出联动回调**：联动就是让左格自己的 `onChange` 去改右格的数据源，两个控件原本怎么用，拼起来还怎么用。固定两格，不做多格。',
          en: 'The shell holds **no state and emits no linking callback**: linking means the left cell’s own `onChange` updates the right cell’s data. Each control behaves exactly as it does on its own. Exactly two cells, never more.',
        },
        {
          zh: '高度不写死：内件按自己的 `size`（sm 24 / md 28 / lg 32）撑开，外壳跟着长，两格传**同一个 size** 才逐像素等高。下拉菜单 portal 到 body，不受外壳 `overflow:hidden` 裁剪。',
          en: 'Height is never hard-coded: each cell grows to its own `size` (sm 24 / md 28 / lg 32) and the shell follows; give both cells the **same size** for pixel-identical heights. Menus portal to body, so the shell’s `overflow:hidden` never clips them.',
        },
      ],
      api: [
        {
          id: 'ui-split-group',
          rows: [
            { name: 'children', type: 'ReactNode', def: '—', desc: { zh: '两格内容（左、右）；元素顺序即布局顺序', en: 'Two cells (left, right); order is layout order' } },
            { name: 'label', type: 'string', def: '—', desc: { zh: '无障碍组名（role=group）', en: 'Accessible group name (role=group)' } },
            { name: 'id / className / style', type: 'string / string / CSSProperties', def: '—', desc: { zh: '锚点 / 只补布局，不覆盖皮肤', en: 'Anchor / layout-only additions, never skin overrides' } },
          ],
        },
      ],
      code: [{ id: 'ui-splitgroup-example', lang: 'tsx', src: splitGroupExample }],
    },
    {
      id: 'datetime-picker',
      heading: { zh: 'DateTimePicker（日期时间选择）', en: 'DateTimePicker (date & time)' },
      prose: [
        {
          zh: '一个控件覆盖全部诉求：`mode` 选 `single`（一个时刻）/ `range`（时间段——触发器是**一个整条**：两个日期区 + 中间样式画的灰隔条，点整条展开；弹层里左右两块独立日历分别选）；`precision` 选 `day` / `hour` / `minute` / `second`。值为本地 ISO（`YYYY-MM-DDTHH:mm:ss.SSS`），毫秒恒三位。',
          en: 'One control covers everything: `mode` picks `single` (one instant) or `range` (a span — the trigger is **one bar**: two date zones + a CSS-drawn grey separator, click anywhere to expand; two independent calendars side by side in the popup); `precision` picks `day` / `hour` / `minute` / `second`. Values are local ISO (`YYYY-MM-DDTHH:mm:ss.SSS`), milliseconds always three digits.',
        },
        {
          zh: '补全口径：起始端把未选单位归零（day ⇒ `00:00:00.000`），结束端拉满（day ⇒ `23:59:59.999`；hour ⇒ `H:59:59.999`；second 不动）。数据库只收到秒时 `23:59:59.999` 退化为「当天最后一秒」，语义不坏，无需特殊处理。',
          en: 'Fill rules: the start floors unselected units (day ⇒ `00:00:00.000`), the end ceils them (day ⇒ `23:59:59.999`; hour ⇒ `H:59:59.999`; second stays exact). If a DB stores seconds only, `23:59:59.999` degrades to "last second of the day" — semantics intact, nothing special to do.',
        },
        {
          zh: '显示口径：传出的数据恒是完整本地 ISO（到毫秒），但**显示只到 precision**——day 只出日期（不出现时分秒），hour / minute 到分，second 才出秒。调用方传的精度就是用户看到的精度。',
          en: 'Display rule: emitted data is always a complete local ISO (to milliseconds), but **display stops at the precision** — day shows the date only (no clock), hour/minute stop at minutes, second shows seconds. The precision you pass is exactly what the user sees.',
        },
        {
          zh: '弹层与 Picker 同机制（floating-ui 浮层、贴边翻转、点外关闭、无遮罩）：两个端框 + 两块独立月历（左开始、右结束，各选各的，不标跨度）+ 每端自己的时/分/秒步进（▲▼、直接键入、↑↓ 键——不用逐格点 60 分钟；**时间不强制先选日期**，「确定」时没选日期就不传数据）。快捷键：day 精度叫「今天」（只置日期），带时分秒的叫「现在」（日期 + 时间一起置，之后可再改）。草稿态，「确定」才 onChange；Esc / 点外 = 丢弃。日历键盘：方向键移动、PageUp/Down 换月、Home/End 月内首尾、Enter 选中。结束早于开始时「确定」置灰并提示。',
          en: 'The popup shares Picker’s mechanics (floating-ui layer, edge flip, outside-click close, no mask): two end boxes + two independent calendars (left = start, right = end, each picks its own, no span marking) + per-end hour/minute/second steppers (▲▼, direct typing, ↑↓ keys — no clicking through 60 minutes; **time never requires picking a date first** — on confirm, no date means no data emitted). Quick button: "Today" at day precision (date only), "Now" when hours/minutes/seconds are on (sets date + time together, editable afterwards). Draft state; onChange only on confirm; Esc / outside = discard. Calendar keys: arrows move, PageUp/Down change month, Home/End jump to month bounds, Enter selects. When end precedes start, confirm greys out with a hint.',
        },
      ],
      api: [
        {
          id: 'ui-datetime-picker',
          rows: [
            { name: 'mode', type: "'single' | 'range'", def: "'single'", desc: { zh: 'single = 一个时刻；range = 一个整条触发器（两个日期区 + 灰隔条）', en: 'single = one instant; range = one-bar trigger (two date zones + grey separator)' } },
            { name: 'precision', type: "'day' | 'hour' | 'minute' | 'second'", def: "'day'", desc: { zh: '时间精度；day 不显示时分秒步进', en: 'Time precision; day hides the steppers' } },
            { name: 'value / defaultValue', type: 'single: string | null；range: [start, end] | null', def: '—', desc: { zh: '本地 ISO；给了 value 即受控', en: 'Local ISO; passing value makes it controlled' } },
            { name: 'onChange', type: '(v: string | [string, string] | null) => void', def: '—', desc: { zh: '「确定」时提交；「清除」发 null', en: 'Emitted on confirm; clear emits null' } },
            { name: 'disabled / size / placeholder', type: "boolean / 'sm' | 'md' | 'lg' / string", def: "false / 'md' / 内置「请选择日期时间」", desc: { zh: '与 Picker 同名参数对齐', en: 'Aligned with Picker’s same-named params' } },
            { name: 'hint / className / ariaLabel / translate', type: 'string / string / string / Translate', def: '—', desc: { zh: '同 Picker 同名参数', en: 'Same-named params as Picker' } },
          ],
        },
      ],
      code: [{ id: 'ui-datetimepicker-example', lang: 'tsx', src: dateTimePickerExample }],
    },
    {
      id: 'tooltip',
      heading: { zh: 'FieldHint（问号提示）', en: 'FieldHint (hint)' },
      prose: [
        {
          zh: '独立组件，标题 / 输入框后随处可挂。气泡是官方 Tooltip 本体，启动时用 `setTooltipRenderer((p) => h(OfficialTooltip, p))` 注入，其余 props 透传。',
          en: 'Standalone — hang it after a title or input. The bubble is the official Tooltip, injected at startup via `setTooltipRenderer((p) => h(OfficialTooltip, p))`; other props pass through.',
        },
        {
          zh: '未注入 renderer 的环境只显示问号图标，不出气泡。',
          en: 'Without a renderer only the question-mark icon shows, no bubble.',
        },
      ],
    },
    {
      id: 'card',
      heading: { zh: 'Card / StripCard', en: 'Card / StripCard' },
      prose: [
        {
          zh: '两种外观，两个组件：Card = surface 底 + 1px 边框 + 圆角（padding 14px，左 12 使竖条贴边）；StripCard = 同色浅底 + 占位边框 + 方角。',
          en: 'Two appearances, two components: Card = surface background + 1px border + rounded corners (padding 14px, left 12 so the strip hugs the edge); StripCard = same-hue light background + placeholder border + square corners.',
        },
        {
          zh: '头部整体垂直居中，`action` 里裸放一个元素即居中。颜色全走 token，明暗跟随宿主。',
          en: 'The header centers vertically as a whole; drop a bare element into `action` and it centers. Colors come from tokens, so light/dark follows the host.',
        },
      ],
      api: [
        {
          id: 'ui-card',
          rows: [
            { name: 'accent', type: "5 档 or 任意 CSS 色值（business/success/warning/danger/neutral）", def: "'business'", desc: { zh: '档位映射到 design 的 token；也可传 \'#f59e0b\' 这类自定义值', en: 'Tiers map to design tokens; also accepts custom values like \'#f59e0b\'' } },
            { name: 'expanded', type: 'boolean', def: "'false'", desc: { zh: '展开态（箭头朝向 + panel 显隐）', en: 'Expanded state (arrow direction + panel show/hide)' } },
            { name: 'onToggle', type: '() => void', def: '—', desc: { zh: '传了才显示右侧折叠箭头；展开状态由调用方管', en: 'Only shows the right collapse arrow if provided; caller owns the expanded state' } },
            { name: 'action', type: 'ReactNode', def: '—', desc: { zh: '右上角操作区', en: 'Top-right action area' } },
            { name: 'children', type: 'ReactNode', def: '—', desc: { zh: '主内容，排版随你', en: 'Main content, layout is yours' } },
            { name: 'panel', type: 'ReactNode', def: '—', desc: { zh: '展开后才显示的额外内容', en: 'Extra content shown only when expanded' } },
            { name: 'className / style', type: '—', def: '—', desc: { zh: '追加类 / 样式', en: 'Append class / style' } },
          ],
        },
      ],
      code: [{ id: 'ui-card-example', lang: 'tsx', src: cardExample }],
    },
    {
      id: 'chip',
      heading: { zh: 'Chip', en: 'Chip' },
      prose: [
        {
          zh: '小标签。`tone`：neutral（默认）/ business / success / warning / danger；`size`：sm（默认）/ md（12px）。传 `onClick` 才可点。',
          en: 'A small tag. `tone`: neutral (default) / business / success / warning / danger; `size`: sm (default) / md (12px). Pass `onClick` to make it clickable.',
        },
        {
          zh: '边界：只做「胶囊标签」。纯图标的小按钮请用 IconButton，别拿 Chip 当图标底板。',
          en: 'Boundary: pill tags only. For an icon-only button use IconButton; never use Chip as an icon baseplate.',
        },
      ],
      api: [
        {
          id: 'ui-chip',
          rows: [
            { name: 'tone', type: "'neutral' | 'business' | 'success' | 'warning' | 'danger'", def: "'neutral'", desc: { zh: '语义色（neutral 灰面，其余为实心信号面）', en: 'Semantic color (neutral grey; others are solid signal faces)' } },
            { name: 'size', type: "'sm' | 'md' | 'xs'", def: "'sm'", desc: { zh: '尺寸档', en: 'Size tier' } },
            { name: 'width', type: 'number | string', def: '—', desc: { zh: '固定宽（px 或任意 CSS 宽度）；与 minWidth / maxWidth 互斥，一旦设定后两者自动失效', en: 'Fixed width (px or any CSS width); mutually exclusive with minWidth/maxWidth — once set, the other two are ignored' } },
            { name: 'minWidth', type: 'number | string', def: '—', desc: { zh: '最小宽：width 未设时生效，内容不足此宽时以它为准', en: 'Minimum width: applies only when width is unset; content shorter than this still takes this width' } },
            { name: 'maxWidth', type: 'number | string', def: '—', desc: { zh: '最大宽：width 未设时生效，文字超出折叠成省略号，hover 以跑马灯展开全名', en: 'Maximum width: applies only when width is unset; overflowing text collapses to an ellipsis and marquees on hover' } },
            { name: 'onClick', type: '() => void', def: '—', desc: { zh: '传了才渲染成 <button>（可点），否则是 <span>', en: 'When given, renders as <button> (clickable); otherwise a <span>' } },
            { name: 'className', type: 'string', def: '—', desc: { zh: '追加 class（只允许补布局，不许覆盖皮肤）', en: 'Extra class (layout only, never overrides the skin)' } },
            { name: 'children', type: 'ReactNode', def: '—', desc: { zh: '标签内容（maxWidth + 纯文字时自动接跑马灯）', en: 'Tag content (auto-marqueed when maxWidth + plain text)' } },
          ],
        },
      ],
    },
    {
      id: 'feedback',
      heading: { zh: '反馈件', en: 'Feedback' },
      prose: [
        {
          zh: '底层是 Sonner。toast 宿主是 globalThis 单例（`Symbol.for(\'dsh-plugin-core/toast-host\')`）：首个副本建容器，其余把 payload 交它渲染。',
          en: 'Backed by Sonner. The toast host is a singleton on globalThis (`Symbol.for(\'dsh-plugin-core/toast-host\')`): the first copy mounts the container, the rest hand their payload to it.',
        },
        {
          zh: '三条取舍（照用别改）：① 样式取首个副本；② position 全局共享；③ 不做卸载回收。无 document 的环境静默跳过。',
          en: 'Three trade-offs (accept them): ① styling comes from the first copy; ② position is shared per screen; ③ no unload reclamation. Environments without document skip silently.',
        },
        {
          zh: '加载提示两种样式：`LoadingToast` 横排卡（转圈在左、文字在右，灰底与 notify 的 info 卡同色）、`LoadingBlock` 方块卡（转圈在上、文字在下，内距更大）。默认文案走内置字典「数据加载中」/「Loading」，传 `text` 覆盖。',
          en: 'Two loading styles: `LoadingToast` — a horizontal card (spinner left, text right, same grey as the notify info card) — and `LoadingBlock` — a square card (spinner above text, roomier padding). The default copy comes from the built-in dictionary (“数据加载中” / “Loading”); pass `text` to override.',
        },
        {
          zh: '命令式 `showLoading(opts)` 同样是 globalThis 单例（`Symbol.for(\'dsh-plugin-core/loading-host\')`）：**屏幕上永远只有一张卡**，任何插件、任何屏位、多少次调用都一样 —— 后一次直接顶掉前一次，被顶掉那次的句柄再 `close()` 是空操作。**不自动消失**，收起只能自己调 `close()`。屏位默认 `bottom-center`（与 Toast 同屏位），`position` 可选 `top-left` / `top-center` / `top-right` / `center` / `bottom-left` / `bottom-center` / `bottom-right`。`mask` 默认 false（后面照常可点）；开了遮罩 `maskOpacity` 默认 0（全透明，但仍挡住点击）。要放进自己的空间（表格、卡片…）就就地渲染 `LoadingToast` / `LoadingBlock`——它们只管外观，位置与遮罩归调用方。',
          en: 'The imperative `showLoading(opts)` is another globalThis singleton (`Symbol.for(\'dsh-plugin-core/loading-host\')`): **only one card ever exists** — across plugins, placements and call counts alike. A later call replaces the previous one, and the superseded handle’s `close()` is a no-op. It **never dismisses itself**; only your own `close()` removes it. Placement defaults to `bottom-center` (the Toast slot); `position` takes `top-left` / `top-center` / `top-right` / `center` / `bottom-left` / `bottom-center` / `bottom-right`. `mask` defaults to false (the page stays clickable); when enabled, `maskOpacity` defaults to 0 (fully transparent, still blocking clicks). To keep it inside your own area (table cell, card…), render `LoadingToast` / `LoadingBlock` in place — they are appearance only; placement and masking belong to the caller.',
        },
        {
          zh: 'Modal 是自绘 overlay，不走 react-dom portal。',
          en: 'Modal is a self-drawn overlay, not a react-dom portal.',
        },
        {
          zh: '遮罩右边界读 `--dshpc-page-inset-right`（多个 dock 求和），自动让开右侧分栏，弹窗在**剩余区域**居中。弹窗无需任何遮罩参数；也别自己量分栏宽度（挂载异步，恒为 0）。',
          en: 'The mask’s right edge reads `--dshpc-page-inset-right` (summed across docks) and yields to the right column, centering the dialog in the **remaining** area. The dialog needs no mask props; never measure the column yourself (mounting is async, it always reads 0).',
        },
      ],
      api: [
        {
          id: 'ui-feedback',
          rows: [
            { name: 'showToast(message, opts?)', type: '', def: '', desc: { zh: '官方 Sonner 原生（对比 / demo 用）。opts: `{ variant?, durationMs?, color?, onDismiss?, position? }`，6 向定位，明暗跟随宿主', en: 'Raw official Sonner (comparison / demo). opts `{ variant?, durationMs?, color?, onDismiss?, position? }`, 6-way placement, theme follows host' } },
            { name: 'notify(message, opts?)', type: '', def: '', desc: { zh: '默认用这个。opts: `{ variant?, description?, durationMs?, position?, actions? }`，actions 用自带 Button（1–2 个）', en: 'Use this by default. opts `{ variant?, description?, durationMs?, position?, actions? }`, actions use our own Button (1–2)' } },
            { name: 'showHostToast(message, opts?)', type: '', def: '', desc: { zh: '宿主原生 Toast，走 `dsh-plugin-core/ui/host` 子路径。opts: `{ tone?, holdMs?, actions?, onDismiss? }`', en: 'Host-native Toast from the `dsh-plugin-core/ui/host` subpath. opts `{ tone?, holdMs?, actions?, onDismiss? }`' } },
            { name: 'showLoading(opts?)', type: '', def: '', desc: { zh: '全局加载提示（全局唯一一处），返回 `{ close() }`。opts: `{ text?, variant?: \'toast\' | \'block\', position?, mask?, maskOpacity?, translate? }`；position 默认 bottom-center', en: 'Global loading hint (one spot globally) returning `{ close() }`. opts `{ text?, variant?: \'toast\' | \'block\', position?, mask?, maskOpacity?, translate? }`; position defaults to bottom-center' } },
            { name: 'LoadingToast({ text? })', type: '', def: '', desc: { zh: '就地渲染的横排加载卡（转圈在左）', en: 'In-place horizontal loading card (spinner left)' } },
            { name: 'LoadingBlock({ text? })', type: '', def: '', desc: { zh: '就地渲染的方块加载卡（转圈在上、文字在下）', en: 'In-place square loading card (spinner above text)' } },
            { name: 'Loading({ anchorId? })', type: '', def: '', desc: { zh: '贴到主内容容器右下角的加载指示；anchorId 默认 dshpc-main', en: 'Loading indicator pinned to the main container’s bottom-right; anchorId defaults to dshpc-main' } },
            { name: 'RunningBlocks()', type: '', def: '', desc: { zh: '运行中的占位块', en: 'Placeholder blocks while running' } },
            { name: 'SectionHead({ icon, title, right? })', type: '', def: '', desc: { zh: '分区标题', en: 'Section heading' } },
            { name: 'MarqueeText({ text, style?, title?, className? })', type: '', def: '', desc: { zh: '超长省略、hover 滚动', en: 'Ellipsis on overflow, scroll on hover' } },
            { name: 'LiveText({ render, style? })', type: '', def: '', desc: { zh: '定时重渲染（相对时间这类）', en: 'Periodic re-render (for relative time etc.)' } },
            { name: 'BackToTop({ anchorId? })', type: '', def: '', desc: { zh: '回到顶部，贴主容器右缘外侧', en: 'Back-to-top, outside the main container’s right edge' } },
            { name: 'startResizeLayoutWidth(opts)', type: '', def: '', desc: { zh: '拖拽调整布局宽度（root 不传则回落 #dshpc-root）', en: 'Drag to resize layout width (falls back to #dshpc-root if root omitted)' } },
          ],
        },
        {
          id: 'ui-modal',
          rows: [
            { name: 'title', type: 'ReactNode', def: '—', desc: { zh: '标题', en: 'Title' } },
            { name: 'subtitle', type: 'ReactNode', def: '—', desc: { zh: '标题**下方**的副标题行（等宽小字；会话 id 这类标识放这里，别塞正文）', en: 'Subtitle line **under** the title (monospace caption; put identifiers such as a session id here, not in the body)' } },
            { name: 'headerExtra', type: 'ReactNode', def: '—', desc: { zh: '标题**同一行**右侧的小块（徽标 / 计数）：紧跟标题，不跨标题与副标题两行居中', en: 'Small block (badge / count) on the **same line** as the title: it sits right after the title, never centered across the title and subtitle lines' } },
            { name: 'headerActions', type: 'ReactNode', def: '—', desc: { zh: '头部右侧动作区（关闭钮之外）', en: 'Header actions area (besides the close button)' } },
            { name: 'onClose', type: '() => void', def: '—', desc: { zh: '不传则不显示关闭钮', en: 'No close button if omitted' } },
            { name: 'closeOnMask', type: 'boolean', def: "'true'", desc: { zh: '点遮罩关闭；误触代价大的场景设 false', en: 'Close on mask click; set false where mis-clicks are costly' } },
            { name: 'escClose', type: 'boolean', def: "'true'", desc: { zh: 'Esc 关闭', en: 'Close on Esc' } },
            { name: 'maxWidth', type: 'string', def: '按 size', desc: { zh: '任意 CSS 值，覆盖 size 的宽度上限；不要用 vw（遮罩已按右侧分栏让位）', en: 'Any CSS value, overriding the size’s max width; avoid vw (the mask already yielded to the right column)' } },
            { name: 'hideHeader', type: 'boolean', def: "'false'", desc: { zh: '不渲染头部（沉浸式）', en: 'Skip header (immersive)' } },
            { name: 'footer', type: 'ReactNode', def: '—', desc: { zh: '底栏（按钮区）', en: 'Footer (button area)' } },
            { name: 'children', type: 'ReactNode', def: '—', desc: { zh: '主体', en: 'Body' } },
          ],
        },
      ],
    },
    {
      id: 'layout',
      heading: { zh: 'PanelDock（停靠分栏）', en: 'PanelDock (dock)' },
      prose: [
        {
          zh: '右侧分栏的通用壳，是**布局成员**而非浮层：占宽挤窄主区，要由调用方放进自己的 flex 根。分工：结构写在调用点（children），显隐归状态（`open` / `close` 只传 id）。',
          en: 'A generic shell for right-side columns — a **layout member**, not an overlay: it takes width and narrows the main area, so the caller puts it in their own flex root. Split of work: structure at the call site (children), visibility in state (`open`/`close` take only an id).',
        },
        {
          zh: '面板高度默认视口高；嵌在定高容器里时由调用方给 `--dshpc-dock-h`。不支持：同名多实例、tab 切换条、自动淘汰——标签切换请消费方在自己的面板内容里实现。（收起后的耳朵是独立 `fixed` 浮层，不是把面板变成浮层。）',
          en: 'Panel height defaults to viewport height; in a fixed-height container the caller sets `--dshpc-dock-h`. Not supported: same-name duplicates, tab bars, auto-eviction — tab switching belongs in the consumer’s own panel content. (The collapsed ear is a standalone `fixed` overlay; the panel itself never floats.)',
        },
        {
          zh: '占宽契约：已开栏宽之和（外加开着时给主区滚动条留的 1px 缝，可用 `--dshpc-dock-gap` 调）实时写进根元素 `--dshpc-page-inset-right`（拖拽逐帧更新，全关即移除），全屏遮罩据此让位；同页多个 dock 求和。',
          en: 'Width contract: the sum of open widths plus a 1px scrollbar gutter while open (tunable via `--dshpc-dock-gap`) goes to `--dshpc-page-inset-right` on the root element (every frame while dragging, removed when all close), and full-screen masks yield to it; multiple docks on one page are summed.',
        },
        {
          zh: '收起 / 展开：`dock.collapse(id)` 让面板退出布局（立刻不占宽）、在右侧出一只固定耳朵；`dock.expand(id)` 把耳朵收回、按记忆宽度还原；`dock.isCollapsed(id)`。耳朵是垂直居中的小图标页签（不放文字），开合带滑入 / 收拢动效；耳朵是独立浮层，与分栏不是一体；`close` 不留耳朵。',
          en: 'Collapse / expand: `dock.collapse(id)` takes the panel out of the layout (it stops taking width) and shows a fixed ear at the right edge; `dock.expand(id)` pulls the ear back and restores the remembered width; `dock.isCollapsed(id)`. The ear is a small icon-only tab at the vertical center, with slide/collapse animations; it is a standalone overlay, not part of the dock; `close` leaves no ear.',
        },
      ],
      api: [
        {
          id: 'ui-paneldock-create',
          rows: [
            { name: 'maxPanels', type: 'number', def: '3', desc: { zh: '同时存在的栏数上限', en: 'Max simultaneous panels' } },
            { name: 'defaultWidth / minWidth', type: 'number', def: '460 / 320', desc: { zh: '兜底宽度与下限（面板自己给了就以面板为准）', en: 'Fallback width and floor (panel’s own value wins if given)' } },
            { name: 'storageKey', type: 'string', def: "'dshpc-dock'", desc: { zh: '宽度记忆前缀；传 false 关闭', en: 'Width-memory prefix; false disables' } },
          ],
        },
        {
          id: 'ui-paneldock-panel',
          rows: [
            { name: 'id', type: 'string', def: '—', desc: { zh: '组名（寻址键），同名唯一', en: 'Group name (address key), unique per name' } },
            { name: 'title / icon', type: 'ReactNode', def: '—', desc: { zh: '内置头的标题与标题前图标', en: 'Built-in header title and icon before it' } },
            { name: 'extra', type: 'ReactNode', def: '—', desc: { zh: '标题右侧的任意内容（不只是按钮）', en: 'Any content to the right of the title (not just buttons)' } },
            { name: 'header', type: 'ReactNode | null', def: '—', desc: { zh: '整块替换头部：不传 = 内置头；null = 不要头部；其他 = 你的头', en: 'Whole-header replacement: omitted = built-in; null = no header; else = your header' } },
            { name: 'closable / closeButton / closeIcon', type: '—', def: '—', desc: { zh: '关钮开关；位置 auto/header/floating/none', en: 'Close-button toggle; position auto/header/floating/none' } },
            { name: 'width / minWidth / maxWidth', type: 'number', def: '—', desc: { zh: '宽度与可拖动区间', en: 'Width and draggable range' } },
            { name: 'ariaLabel', type: 'string', def: '—', desc: { zh: '无头部时的无障碍名', en: 'A11y name when no header' } },
          ],
        },
        {
          id: 'ui-paneldock-events',
          rows: [
            { name: 'onOpen', type: '({ id, created: true })', def: '—', desc: { zh: '首次打开', en: 'First open' } },
            { name: 'onBeforeClose', type: '({ id, reason: \'button\' | \'api\' }) => false?', def: '—', desc: { zh: '关闭之前，返回 false 可取消', en: 'Before close; returning false cancels' } },
            { name: 'onClose', type: '({ id, reason })', def: '—', desc: { zh: '已关闭', en: 'Closed' } },
            { name: 'onResize', type: '({ id, width })', def: '—', desc: { zh: '拖宽松手', en: 'Drag released' } },
            { name: 'onLimitReached', type: '({ id })', def: '—', desc: { zh: '到上限被拒', en: 'Rejected at cap' } },
          ],
        },
      ],
      code: [{ id: 'ui-paneldock-example', lang: 'ts', src: panelDockExample }],
    },
  ],
}

export default doc
