import { createElement as h, useState, useSyncExternalStore, type ComponentType } from 'react'
import type { AlertSeverity, ButtonSize, ButtonVariant, ConfirmTone } from '../../../../dist/ui/index.js'
import {
  Button,
  Card,
  Checkbox,
  Chip,
  EmptyState,
  FieldHint,
  IconButton,
  Input,
  LiveText,
  MarqueeText,
  Modal,
  AlertModal,
  ConfirmModal,
  ModelPicker,
  NumberInput,
  Picker,
  SectionHead,
  Segmented,
  StripCard,
  Textarea,
  WorkspacePicker,
  showToast,
  notify,
  alertModal,
  confirmModal,
} from '../../../../dist/ui/index.js'
// 宿主原生弹窗：经官方适配层 official.js 取（全仓唯一 import 平台模块处），保持本包 ui 入口零官方依赖。
import { Official } from '../../../../dist/ui/official.js'
// 宿主原生 Toast 封装（独立子路径，避免 ui 入口静态 import 平台模块导致 Node 单测崩）。
import { showHostToast } from '../../../../dist/ui/host-toast.js'
import {
  HoverCard,
  IconCheckOutlineRegular,
  IconChevronDownOutlineRegular,
  IconClockOutlineRegular,
  IconCloseOutlineRegular,
  IconCopyOutlineRegular,
  IconEditOutlineRegular,
  IconPaperPlaneOutlineRegular,
  IconPlayOutlineRegular,
  IconPlusOutlineRegular,
  IconRefreshOutlineRegular,
  IconSearchOutlineRegular,
  IconSparkleRegular,
  Switch,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { Demo, Placeholder } from './index.js'
import { ApiTable, CodeOnly, Example, Note, type ApiRow } from '../doc.js'
import { demoDock } from '../dock.js'
import { t, type DemoMessageKey } from '../i18n.js'

/**
 * 按钮图标集：**先给每颗 icon 起个名字，再按名字取用**。
 * 演示里不写死某个图标组件，而是遍历这份数组 —— 换成官方 / 业务自有图标只改这一处。
 */
const BUTTON_ICONS: readonly { name: string; Icon: ComponentType<{ size?: number }> }[] = [
  { name: 'plus', Icon: IconPlusOutlineRegular },
  { name: 'check', Icon: IconCheckOutlineRegular },
  { name: 'close', Icon: IconCloseOutlineRegular },
  { name: 'refresh', Icon: IconRefreshOutlineRegular },
  { name: 'copy', Icon: IconCopyOutlineRegular },
  { name: 'search', Icon: IconSearchOutlineRegular },
  { name: 'edit', Icon: IconEditOutlineRegular },
  { name: 'play', Icon: IconPlayOutlineRegular },
  { name: 'send', Icon: IconPaperPlaneOutlineRegular },
  { name: 'clock', Icon: IconClockOutlineRegular },
  { name: 'sparkle', Icon: IconSparkleRegular },
  { name: 'chevron', Icon: IconChevronDownOutlineRegular },
]

/** 按名字取一颗图标（找不到返回 null，不抛）。 */
function iconOf(name: string, size = 14): ReturnType<typeof h> | null {
  const found = BUTTON_ICONS.find((item) => item.name === name)
  return found === undefined ? null : h(found.Icon, { size })
}

/** 自绘 SVG：演示 icon 参数不认「名字」——这里直接传一个普通的 React 元素进去。 */
function StarSvg(): ReturnType<typeof h> {
  return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
    h('path', {
      d: 'M8 1.6l1.9 4 4.4.6-3.2 3 .8 4.3L8 11.4l-3.9 2.1.8-4.3-3.2-3 4.4-.6z',
      stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round',
    }))
}

/** 图标尺寸随按钮档位走（24 高配 12 / 28 配 14 / 32 配 16）。 */
const ICON_SIZE: Record<ButtonSize, number> = { sm: 12, md: 14, lg: 16 }

/** 10 档外观各配一颗语义图标，一眼看出「图标在前、文字在后」。 */
const VARIANT_ICON: Record<ButtonVariant, string> = {
  primary: 'check',
  secondary: 'copy',
  outline: 'edit',
  ghost: 'refresh',
  danger: 'close',
  success: 'play',
  warning: 'clock',
  info: 'send',
  'danger-outline': 'close',
  link: 'search',
}

/**
 * 10 档按语义分四组展示。
 * 为什么不横排：10 颗 + 缩小版再 10 颗平铺，主行动、中性、语义色、弱化混在一起，
 * 看不出层次也看不出差别（用户 2026-10-21：纯粹堆着）。分组后每组一行，同组才可比。
 */
const VARIANT_GROUPS: readonly { label: string; items: readonly ButtonVariant[] }[] = [
  { label: '主行动', items: ['primary', 'secondary'] },
  { label: '中性', items: ['outline', 'ghost'] },
  { label: '语义色', items: ['danger', 'success', 'warning', 'info'] },
  { label: '弱化 / 行内', items: ['danger-outline', 'link'] },
]

/** 自定义颜色演示：实心档作底色、线框档作主色。 */
const CUSTOM_COLORS: readonly string[] = ['#7c3aed', '#0ea5e9', '#f97316', '#16a34a']

/** Tooltip 锚点必须是真实 DOM 元素（官方往子元素挂 ref；函数组件挂不上 ⇒ 悬停无气泡，兄弟仓踩过）。 */
function tipAnchor(text: string, side: 'top' | 'bottom' | 'right', align?: 'center' | 'end'): ReturnType<typeof h> {
  const props: Record<string, unknown> = { label: text, side }
  if (align !== undefined) props.align = align
  return h(Tooltip, props as never, h('button', {
    type: 'button',
    style: {
      padding: '4px 10px', border: '1px solid var(--dshpc-border)', borderRadius: '6px',
      background: 'var(--dshpc-surface-1)', color: 'var(--dshpc-fg)', fontSize: '12px', cursor: 'pointer',
    },
  }, text))
}

/** 一行横排（自动换行，间距 8）。 */
function Row(props: { children?: ReturnType<typeof h>[] | ReturnType<typeof h> }): ReturnType<typeof h> {
  return h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } }, props.children)
}

/** 一个标签 + 内容行（标签宽 64，便于纵向对齐）。 */
function Labeled(props: { label: string; children?: ReturnType<typeof h>[] | ReturnType<typeof h> }): ReturnType<typeof h> {
  return h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' } },
    h('span', { style: { width: 'auto', minWidth: '64px', flex: 'none', whiteSpace: 'normal', color: 'var(--dshpc-fg-3)', fontSize: '12px' } }, props.label),
    props.children)
}

// ── 按钮 ────────────────────────────────────────────────────────────────

// 示例右侧的代码：与左边渲染的一点不差，复制出去就能跑（改样式时必须两边一起改）。
const CODE_BTN_TEXT = `<Button variant="primary" icon={<IconCheckOutlineRegular size={16} />}>保存</Button>
<Button variant="outline">取消</Button>
<Button variant="danger" icon={<IconCloseOutlineRegular size={16} />}>删除</Button>`

const CODE_BTN_VARIANT = `// 主行动
<Button variant="primary" icon={<IconCheckOutlineRegular size={16} />}>primary</Button>
<Button variant="secondary" icon={<IconCopyOutlineRegular size={16} />}>secondary</Button>

// 中性
<Button variant="outline" icon={<IconEditOutlineRegular size={16} />}>outline</Button>
<Button variant="ghost" icon={<IconRefreshOutlineRegular size={16} />}>ghost</Button>

// 语义色
<Button variant="danger" icon={<IconCloseOutlineRegular size={16} />}>danger</Button>
<Button variant="success" icon={<IconPlayOutlineRegular size={16} />}>success</Button>
<Button variant="warning" icon={<IconClockOutlineRegular size={16} />}>warning</Button>
<Button variant="info" icon={<IconPaperPlaneOutlineRegular size={16} />}>info</Button>

// 弱化 / 行内
<Button variant="danger-outline" icon={<IconCloseOutlineRegular size={16} />}>danger-outline</Button>
<Button variant="link" icon={<IconSearchOutlineRegular size={16} />}>link</Button>

// 任意一档都能再给 size（这里 sm 24 高）
<Button variant="danger" size="sm" icon={<IconCloseOutlineRegular size={12} />}>danger</Button>`

const CODE_BTN_SIZE = `<Button size="sm" variant="outline" icon={<IconPlusOutlineRegular size={12} />}>sm</Button>
<Button size="md" variant="outline">md</Button>
<Button size="lg" variant="outline">lg</Button>

// icon 收的是 ReactNode：官方图标组件 / 自绘 SVG / 一个字符，三种都能进
<Button variant="primary" icon={<IconSendOutlineRegular size={16} />}>官方图标</Button>
<Button variant="outline" icon={<StarSvg />}>自绘 SVG</Button>
<Button variant="ghost" icon="+">一个字符</Button>

// iconRight 后置；block 撑满父宽（有前置图标时文字仍在视觉中心）
<Button variant="outline" iconRight={<IconChevronDownOutlineRegular size={16} />}>更多</Button>
<Button variant="primary" block icon={<IconCheckOutlineRegular size={16} />}>撑满父宽</Button>

// 纯图标钮：label 是必填的无障碍名（同时作 title）
<IconButton icon={<IconPlusOutlineRegular size={16} />} label="plus" />`

const CODE_BTN_STATE = `<Button variant="primary">默认</Button>
<Button variant="primary" disabled>禁用</Button>
<Button variant="danger" disabled icon={<IconCloseOutlineRegular size={16} />}>禁用</Button>
<Button variant="outline" loading>加载中</Button>
<Button variant="primary" loading icon={<IconRefreshOutlineRegular size={16} />}>提交中</Button>`

const CODE_BTN_COLOR = `<Button variant="primary" color="#7c3aed">#7c3aed</Button>
<Button variant="outline" color="#0ea5e9">#0ea5e9</Button>`

const CODE_BTN_USAGE = `pnpm add dsh-plugin-core

import { Button, IconButton } from 'dsh-plugin-core/ui'

<Button variant="primary" onClick={save}>保存</Button>
<Button variant="danger" size="sm" onClick={remove}>删除</Button>

// 样式不用另配：控件自己 ensureControls()，token 跟随宿主明暗主题`

/** Button 的对外参数（与 src/ui/Button.ts 的 ButtonProps 逐条对齐）。 */
const BUTTON_API: readonly ApiRow[] = [
  { name: 'variant', type: 'ButtonVariant', def: "'outline'", descKey: 'apiVariant' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", def: "'lg'", descKey: 'apiSize' },
  { name: 'icon', type: 'ReactNode', def: '—', descKey: 'apiIcon' },
  { name: 'iconRight', type: 'ReactNode', def: '—', descKey: 'apiIconRight' },
  { name: 'color', type: 'string', def: '—', descKey: 'apiColor' },
  { name: 'loading', type: 'boolean', def: 'false', descKey: 'apiLoading' },
  { name: 'block', type: 'boolean', def: 'false', descKey: 'apiBlock' },
  { name: 'disabled', type: 'boolean', def: 'false', descKey: 'apiDisabled' },
  { name: 'children', type: 'ReactNode', def: '—', descKey: 'apiChildren' },
]

export function ButtonPage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(Note, { text: t('btnNote') }),

    // 文案与语言
    h(
      Example,
      { title: t('btnTextTitle'), hint: t('btnTextHint'), code: CODE_BTN_TEXT },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        h(Labeled, { label: 'locale' },
          h(Button, { variant: 'primary', icon: iconOf('check', ICON_SIZE.lg) }, t('btnLabelSave')),
          h(Button, { variant: 'outline' }, t('btnLabelCancel')),
          h(Button, { variant: 'danger', icon: iconOf('close', ICON_SIZE.lg) }, t('btnLabelDelete'))),
        h(Labeled, { label: 'en' },
          h(Button, { variant: 'primary' }, 'Save'),
          h(Button, { variant: 'outline' }, 'Cancel'),
          h(Button, { variant: 'ghost' }, 'Learn more')),
        h(Labeled, { label: 'zh' },
          h(Button, { variant: 'primary' }, '保存'),
          h(Button, { variant: 'outline' }, '取消'),
          h(Button, { variant: 'ghost' }, '了解更多')),
        h(Labeled, { label: 'zh + en' },
          h(Button, { variant: 'primary', icon: iconOf('sparkle', ICON_SIZE.lg) }, t('btnLabelMixed')),
          h(Button, { variant: 'outline' }, '复制 Copy'),
          h(Button, { variant: 'secondary' }, '重试 Retry'))),
    ),

    // 10 档外观
    h(
      Example,
      { title: t('btnVariantTitle'), hint: t('btnVariantHint'), code: CODE_BTN_VARIANT },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        VARIANT_GROUPS.map((group) =>
          h(Labeled, { key: group.label, label: group.label },
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' } },
              h(Row, null, group.items.map((variant) =>
                h(Button, { key: variant, variant, icon: iconOf(VARIANT_ICON[variant], ICON_SIZE.lg) }, variant))),
              h(Row, null, group.items.map((variant) =>
                h(Button, { key: variant, variant, size: 'sm', icon: iconOf(VARIANT_ICON[variant], ICON_SIZE.sm) }, variant))))))),
    ),

    // 尺寸 / 图标位置 / block
    h(
      Example,
      { title: t('btnSizeTitle'), hint: t('btnSizeHint'), code: CODE_BTN_SIZE },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        h(Labeled, { label: 'size' },
          (['sm', 'md', 'lg'] as const).map((size) =>
            h(Button, { key: size, size, variant: 'outline', icon: iconOf('plus', ICON_SIZE[size]) }, size))),
        // icon 收的是 ReactNode：官方图标组件 / 自绘 SVG / 一个字符，三种来源各一颗
        h(Labeled, { label: 'icon' },
          h(Button, { variant: 'primary', icon: iconOf('send', ICON_SIZE.lg) }, '官方图标'),
          h(Button, { variant: 'outline', icon: h(StarSvg, null) }, '自绘 SVG'),
          h(Button, { variant: 'ghost', icon: '+' }, '一个字符')),
        h(Labeled, { label: 'iconRight' },
          h(Button, { variant: 'outline', iconRight: iconOf('chevron', ICON_SIZE.lg) }, '更多'),
          h(Button, { variant: 'primary' }, '下一步')),
        // block + 前置图标：文字要在视觉中心，不能整组内容居中（那样文字会被图标推右）
        h(Labeled, { label: 'block' },
          h('div', { style: { width: '260px' } },
            h(Button, { variant: 'primary', block: true, icon: iconOf('check', ICON_SIZE.lg) }, '撑满父宽'),
            h('div', { style: { height: '8px' } }),
            h(Button, { variant: 'outline', block: true }, '无图标对照'))),
        h(Labeled, { label: t('btnIconOnly') },
          BUTTON_ICONS.slice(0, 6).map((item) =>
            h(IconButton, { key: item.name, icon: h(item.Icon, { size: 16 }), label: item.name })))),
    ),

    // 状态
    h(
      Example,
      { title: t('btnStateTitle'), hint: t('btnStateHint'), code: CODE_BTN_STATE },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        h(Labeled, { label: '禁用' },
          h(Button, { variant: 'primary' }, '默认'),
          h(Button, { variant: 'primary', disabled: true }, '禁用'),
          h(Button, { variant: 'danger', disabled: true, icon: iconOf('close', ICON_SIZE.lg) }, '禁用')),
        h(Labeled, { label: 'loading' },
          h(Button, { variant: 'outline', loading: true }, '加载中'),
          h(Button, { variant: 'primary', loading: true, icon: iconOf('refresh', ICON_SIZE.lg) }, '提交中'))),
    ),

    // 自定义颜色
    h(
      Example,
      { title: t('btnColorTitle'), hint: t('btnColorHint'), code: CODE_BTN_COLOR },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        h(Labeled, { label: '实心' },
          h(Row, null, CUSTOM_COLORS.map((color) =>
            h(Button, { key: color, variant: 'primary', color, icon: iconOf('sparkle', ICON_SIZE.lg) }, color)))),
        h(Labeled, { label: '描边' },
          h(Row, null, CUSTOM_COLORS.map((color) =>
            h(Button, { key: color, variant: 'outline', color }, color))))),
    ),

    h(CodeOnly, { labelKey: 'docUsage', code: CODE_BTN_USAGE }),
    h(ApiTable, { rows: BUTTON_API }),
  )
}

// ── 录入 ────────────────────────────────────────────────────────────────

// 示例右侧的代码：与左边渲染逐条一致（改内容必须两边一起改）。
const CODE_INPUT_FAMILY = `const [text, setText] = useState('')
const [num, setNum] = useState(3)

// hint 参数版：问号提示由组件自己挂，不用手动拼 FieldHint
<Input value={text} onChange={setText} placeholder="选择日期" hint="选择任务的开始时间" />
// 校验失败态：描红
<Input value={text} onChange={setText} error placeholder="校验失败态" />
// 数字框：超出 min / max 自动收回到边界
<NumberInput value={num} onChange={setNum} min={0} max={10} suffix="次" hint="超出范围会自动收回到 min / max。" />
// 多行输入：问号置右下角
<Textarea value={text} onChange={setText} placeholder="多行输入" hint="多行输入也支持 hint 参数。" />`

const CODE_FIELD_HINT = `// 问号提示是独立组件，放哪都行（14px 内联元素）
<h3>一个标题</h3>
<FieldHint text="说明这一块是干什么的。" side="top" />

<Button variant="outline">一个按钮</Button>
<FieldHint text="解释这个操作会发生什么。" side="right" />

<span>一段普通文字</span>
<FieldHint text="挂在任何文字后面都行。" />`

const CODE_SWITCH_SEG = `// 开关语义用官方 Switch：label 只是无障碍名，可见文案自己画在旁边
<Switch checked={checked} onChange={setChecked} label="启用" />
<Checkbox checked={checked} onChange={setChecked} label="多选" />

// 分段：items = { value, label, count?, badge?, disabled? }；variant 默认 default，inset 是灰底款
<Segmented
  variant="inset"
  items={[{ value: 'day', label: '日' }, { value: 'week', label: '周' }, { value: 'month', label: '月' }]}
  value={seg}
  onChange={setSeg}
/>
// bordered：选中段变描边块；size 三档
<Segmented variant="inset" bordered size="sm" items={...} value={seg} onChange={setSeg} />

// 筛选条：count 给中性计数，badge 给红角标
<Segmented
  variant="inset"
  items={[{ value: 'all', label: '全部', count: 11 }, { value: 'doing', label: '进行中', count: 5 }]}
  value={filter}
  onChange={setFilter}
/>

// 星期多选：multiple + value 是数组
<Segmented
  multiple
  label="星期"
  items={[1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: String(n), label: '一二三四五六日'[n - 1] }))}
  value={multi}
  onChange={setMulti}
/>`

const CODE_INPUT_USAGE = `pnpm add dsh-plugin-core

import { Input, NumberInput, Textarea, Checkbox, Segmented, FieldHint } from 'dsh-plugin-core/ui'

const [text, setText] = useState('')

<Input value={text} onChange={setText} placeholder="选择日期" hint="开始时间" />
<Textarea value={text} onChange={setText} placeholder="多行输入" rows={4} />
<NumberInput value={3} onChange={setNum} min={0} max={10} suffix="次" />

<Segmented
  variant="inset"
  items={[{ value: 'day', label: '日' }, { value: 'week', label: '周' }]}
  value={seg}
  onChange={setSeg}
/>

// 「启用」是开关语义：用官方 Switch，不要用勾选框
import { Switch } from '@deepseek-ai/dsh-client-ui-primitives'
<Switch checked={checked} onChange={setChecked} label="启用" />`

/** Input 家族对外参数（与 src/ui/Field.ts 的 InputProps / NumberInputProps 逐条对齐）。 */
const INPUT_API: readonly ApiRow[] = [
  { name: 'value', type: 'string', def: '—', descKey: 'apiValue' },
  { name: 'onChange', type: '(value: string) => void', def: '—', descKey: 'apiOnChange' },
  { name: 'placeholder', type: 'string', def: '—', descKey: 'apiPlaceholder' },
  { name: 'hint', type: 'string', def: '—', descKey: 'apiHint' },
  { name: 'error', type: 'boolean', def: 'false', descKey: 'apiError' },
  { name: 'disabled', type: 'boolean', def: 'false', descKey: 'apiDisabled' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", def: "'lg'", descKey: 'apiSize' },
]

/** NumberInput 在 InputProps 之上多出的参数（与 src/ui/Field.ts 的 NumberInputProps 对齐）。 */
const NUMBER_API: readonly ApiRow[] = [
  { name: 'value', type: 'number', def: '—', descKey: 'apiValue' },
  { name: 'onChange', type: '(value: number) => void', def: '—', descKey: 'apiOnChange' },
  { name: 'min / max', type: 'number', def: '±Infinity', descKey: 'apiMin' },
  { name: 'suffix', type: 'string', def: '—', descKey: 'apiSuffix' },
]

/** Textarea 在 InputProps 之上多出的参数（与 src/ui/Textarea.ts 的 TextareaProps 对齐）。 */
const TEXTAREA_API: readonly ApiRow[] = [
  { name: 'rows', type: 'number', def: '—', descKey: 'apiRows' },
]

/** Segmented 对外参数（与 src/ui/Segmented.ts 的 SegmentedProps 对齐；单选 / 多选共用基座）。 */
const SEGMENTED_API: readonly ApiRow[] = [
  { name: 'items', type: 'readonly SegmentedItem[]', def: '—', descKey: 'apiItems' },
  { name: 'value', type: 'T | T[]', def: '—', descKey: 'apiValue' },
  { name: 'onChange', type: '(value: T | T[]) => void', def: '—', descKey: 'apiOnChange' },
  { name: 'multiple', type: 'boolean', def: 'false', descKey: 'apiMultiple' },
  { name: 'variant', type: "'default' | 'inset'", def: "'default'", descKey: 'apiVariant' },
  { name: 'bordered', type: 'boolean', def: 'false', descKey: 'apiBordered' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", def: "'lg'", descKey: 'apiSize' },
  { name: 'label', type: 'string', def: '—', descKey: 'apiLabel' },
]

export function InputPage(): ReturnType<typeof h> {
  const [text, setText] = useState('')
  const [num, setNum] = useState(3)
  const [checked, setChecked] = useState(true)
  const [seg, setSeg] = useState<'day' | 'week' | 'month'>('week')
  const [filter, setFilter] = useState('all')
  const [multi, setMulti] = useState<string[]>(['1'])

  return h(
    'div',
    null,
    h(Note, { text: t('inputNote') }),

    // Input 家族
    h(
      Example,
      { title: t('demoInputFamily'), hint: t('inputHint'), code: CODE_INPUT_FAMILY },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '380px' } },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
          h('span', { style: { color: 'var(--dshpc-fg-2)', fontSize: '13px', flex: 'none' } }, '开始时间'),
          // hint 参数版：问号提示由组件自己挂（不再手动拼 FieldHint）
          h(Input, { value: text, onChange: setText, placeholder: '选择日期', hint: t('fieldHintDate') }),
        ),
        h(Input, { value: 'bad value', onChange: () => {}, error: true, placeholder: '校验失败态' }),
        // ⚠️ 外层是 flex column（默认 align-items:stretch）会把 .dshpc-num 拉到全宽；
        //    组件本身是内容自适应宽（inline-flex 无 width），演示区还原成它本来的短宽。
        h(NumberInput, { value: num, onChange: setNum, min: 0, max: 10, suffix: '次', style: { alignSelf: 'flex-start' }, hint: '超出范围会自动收回到 min / max。' }),
        h(Textarea, { value: text, onChange: setText, placeholder: '多行输入', hint: '多行输入也支持 hint 参数。' }),
      ),
    ),

    // 问号提示：证明它不属于 Input 家族，随处可挂
    h(
      Example,
      { title: t('btnHintTitle'), hint: t('btnHintHint'), code: CODE_FIELD_HINT },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        h(Row, null,
          h('b', { style: { fontSize: '13px' } }, '一个标题'),
          h(FieldHint, { text: '挂在标题后面：说明这一块是干什么的。' })),
        h(Row, null,
          h(Button, { variant: 'outline' }, '一个按钮'),
          h(FieldHint, { text: '挂在按钮后面：解释这个操作会发生什么。' })),
        h(Row, null,
          h('span', { style: { fontSize: '13px' } }, '一段普通文字'),
          h(FieldHint, { text: '挂在任何文字后面都行，它只是一个 14px 的内联元素。' }))),
    ),

    // Switch / Checkbox / Segmented
    h(
      Example,
      { title: t('switchTip'), hint: t('checkboxHint'), code: CODE_SWITCH_SEG },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-start' } },
        h(
          'div',
          { style: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' } },
          // 「启用」是开关语义，用官方 Switch（用户 2026-10-20：不要用勾去启用）。
          // 官方 Switch 只画胶囊本体，label 是 aria-label，可见文案由调用方自己画在旁边 ——
          // 文案单独挂 onClick 使其可点（不能挂外层：点胶囊会冒泡触发两次翻转）。
          h(
            'span',
            { style: { display: 'inline-flex', alignItems: 'center', gap: '8px' } },
            h(Switch, { checked, onChange: setChecked, label: '启用' }),
            h('span', {
              style: { fontSize: '13px', cursor: 'pointer', userSelect: 'none' },
              onClick: () => { setChecked(!checked) },
            }, '启用'),
          ),
          h(Checkbox, { checked, onChange: setChecked, label: '多选' }),
          h(Segmented<'day' | 'week' | 'month'>, {
            variant: 'inset',
            items: [
              { value: 'day', label: '日' },
              { value: 'week', label: '周' },
              { value: 'month', label: '月' },
            ],
            value: seg,
            onChange: setSeg,
          }),
          h(Segmented<'day' | 'week' | 'month'>, {
            variant: 'inset',
            bordered: true,
            items: [
              { value: 'day', label: '日' },
              { value: 'week', label: '周' },
              { value: 'month', label: '月' },
            ],
            value: seg,
            onChange: setSeg,
          }),
          h(Segmented<'day' | 'week' | 'month'>, {
            variant: 'inset',
            size: 'sm',
            items: [
              { value: 'day', label: '日' },
              { value: 'week', label: '周' },
              { value: 'month', label: '月' },
            ],
            value: seg,
            onChange: setSeg,
          }),
          h(Segmented<'day' | 'week' | 'month'>, {
            variant: 'inset',
            size: 'sm',
            bordered: true,
            items: [
              { value: 'day', label: '日' },
              { value: 'week', label: '周' },
              { value: 'month', label: '月' },
            ],
            value: seg,
            onChange: setSeg,
          }),
        ),
        // 筛选条形态（真实插件同款）：中性计数 + inset 灰底
        h(Segmented, {
          variant: 'inset',
          items: [
            { value: 'all', label: t('segAll'), count: 11 },
            { value: 'doing', label: t('segDoing'), count: 5 },
            { value: 'claimed', label: t('segClaimed'), count: 11 },
            { value: 'blocked', label: t('segBlocked') },
            { value: 'stalled', label: t('segStalled') },
          ],
          value: filter,
          onChange: setFilter,
        }),
        h(Segmented, {
          variant: 'inset',
          bordered: true,
          items: [
            { value: 'all', label: t('segAll'), count: 11 },
            { value: 'doing', label: t('segDoing'), count: 5 },
            { value: 'claimed', label: t('segClaimed'), count: 11 },
            { value: 'blocked', label: t('segBlocked') },
            { value: 'stalled', label: t('segStalled') },
          ],
          value: filter,
          onChange: setFilter,
        }),
        // 星期多选方块（蓝底选中、近似方形）
        h(Segmented, {
          multiple: true,
          className: 'dshpc-seg--weekday',
          label: '星期',
          items: ([1, 2, 3, 4, 5, 6, 7] as const).map((n) => ({
            value: String(n),
            label: t(`weekday${n}` as DemoMessageKey),
          })),
          value: multi,
          onChange: setMulti,
        }),
        h(Segmented, {
          multiple: true,
          className: 'dshpc-seg--weekday',
          bordered: true,
          label: '星期（带外框）',
          items: ([1, 2, 3, 4, 5, 6, 7] as const).map((n) => ({
            value: String(n),
            label: t(`weekday${n}` as DemoMessageKey),
          })),
          value: multi,
          onChange: setMulti,
        }),
      ),
    ),
    h(CodeOnly, { labelKey: 'docUsage', code: CODE_INPUT_USAGE }),
    h(ApiTable, { rows: INPUT_API }),
    h(ApiTable, { rows: NUMBER_API }),
    h(ApiTable, { rows: TEXTAREA_API }),
    h(ApiTable, { rows: SEGMENTED_API }),
    h(Placeholder, { descKey: 'inputMissingDesc' }),
  )
}

// ── 选择器 ──────────────────────────────────────────────────────────────

/** 选项 icon 演示：三个官方图标各领一个选项（icon 收任意 ReactNode）。 */
const ICON_OPTIONS = [
  { value: 'a', label: '选项 A', icon: h(IconSparkleRegular, { size: 14 }) },
  { value: 'b', label: '选项 B', icon: h(IconClockOutlineRegular, { size: 14 }) },
  { value: 'c', label: '选项 C', icon: h(IconPlayOutlineRegular, { size: 14 }) },
]

const CODE_PICKER = `// 单选：icon + 可搜索 / 可清除
<Picker
  options={[{ value: 'a', label: '选项 A' }, { value: 'b', label: '选项 B' }]}
  value={single}
  onChange={setSingle}
  searchable
  clearable
  placeholder="单选"
/>
// 分组 + 多选：groups 与 options 二选一；max 给上限，可反选
<Picker
  groups={[{ value: 'g1', label: '组一', options }, { value: 'g2', label: '组二', options }]}
  value={multi}
  mode="multiple"
  max={2}
  onChange={setMulti}
  searchable
/>
// hint 挂在触发器后面，不用再手动拼 FieldHint
<Picker options={options} value={v} onChange={setV} hint="挂在触发器后面的问号提示" />`

const CODE_MODEL_PICKER = `// 数据来自宿主模型目录（宿主侧 connectHost(ctx, { modelsPath }) 注入），不能凭空造
// 分组形态：一个下拉，供应商做组头
<ModelPicker value={model} onChange={setModel} variant="grouped" />
// 联动形态：两个下拉，先选供应商、模型列表跟着筛
<ModelPicker value={model} onChange={setModel} variant="cascade" placeholder="选择模型" />`

const CODE_WORKSPACE_PICKER = `// 默认即「工作区」文案与文件夹图标；clearable / searchable 是可选能力
<WorkspacePicker value={ws} onChange={setWs} clearable searchable />`

const CODE_PICKER_USAGE = `pnpm add dsh-plugin-core

import { Picker, ModelPicker, WorkspacePicker } from 'dsh-plugin-core/ui'

<Picker
  options={[{ value: 'a', label: '选项 A' }, { value: 'b', label: '选项 B' }]}
  value={single}
  onChange={setSingle}
  searchable
  clearable
  placeholder="请选择"
/>

// ModelPicker / WorkspacePicker 要真实数据：
// 宿主侧 connectHost(ctx, { modelsPath }) 注入连接，客户端只管渲染`

/** Picker 对外参数（与 src/ui/Picker.ts 的 PickerProps 逐条对齐）。 */
const PICKER_API: readonly ApiRow[] = [
  { name: 'options', type: 'readonly PickerOption[]', def: '—', descKey: 'apiOptions' },
  { name: 'groups', type: 'readonly PickerGroup[]', def: '—', descKey: 'apiGroups' },
  { name: 'value', type: 'string | string[]', def: '—', descKey: 'apiValue' },
  { name: 'onChange', type: '(value: string | string[]) => void', def: '—', descKey: 'apiOnChange' },
  { name: 'mode', type: "'single' | 'multiple'", def: "'single'", descKey: 'apiMode' },
  { name: 'max', type: 'number', def: '—', descKey: 'apiMax' },
  { name: 'searchable', type: 'boolean', def: 'false', descKey: 'apiSearchable' },
  { name: 'clearable', type: 'boolean', def: 'false', descKey: 'apiClearable' },
  { name: 'hint', type: 'string', def: '—', descKey: 'apiHint' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", def: "'md'", descKey: 'apiSize' },
]

/** ModelPicker / WorkspacePicker：业务封装，props 与 Picker 同族（数据由宿主给）。 */
const HOST_PICKER_API: readonly ApiRow[] = [
  { name: 'value', type: 'string | string[]', def: '—', descKey: 'apiValue' },
  { name: 'onChange', type: '(value: string | string[]) => void', def: '—', descKey: 'apiOnChange' },
  { name: 'variant', type: "'grouped' | 'cascade'", def: "'grouped'", descKey: 'apiVariant' },
  { name: 'placeholder', type: 'string', def: '—', descKey: 'apiPlaceholder' },
  { name: 'clearable / searchable', type: 'boolean', def: 'false', descKey: 'apiClearable' },
]

export function PickerPage(): ReturnType<typeof h> {
  const [single, setSingle] = useState<string | undefined>(undefined)
  const [multi, setMulti] = useState<string[]>([])
  const [model, setModel] = useState('')
  // 两种形态各用各的值：演示里互不影响（共用一份 state 会误以为它们是联动的）
  const [model2, setModel2] = useState('')
  const [ws, setWs] = useState<string | undefined>(undefined)

  return h(
    'div',
    null,
    h(Note, { text: t('pickerNote') }),
    h(
      Example,
      { title: 'Picker', hint: t('pickerHint'), code: CODE_PICKER },
      h(
        'div',
        { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' } },
        h(Picker, {
          options: ICON_OPTIONS,
          icon: h(IconSparkleRegular, { size: 14 }),
          value: single,
          onChange: (v) => setSingle(v as string),
          searchable: true,
          clearable: true,
          placeholder: '单选（icon + 可搜索/可清除）',
        }),
        h(Picker, {
          options: ICON_OPTIONS,
          value: single,
          onChange: (v) => setSingle(v as string),
          placeholder: '单选（无搜索框）',
        }),
        h(Picker, {
          groups: [
            { value: 'g1', label: '组一', options: ICON_OPTIONS },
            {
              value: 'g2',
              label: '组二',
              options: [
                { value: 'd', label: '选项 D', icon: h(IconRefreshOutlineRegular, { size: 14 }) },
                { value: 'e', label: '选项 E', icon: h(IconPlusOutlineRegular, { size: 14 }) },
              ],
            },
          ],
          value: multi,
          mode: 'multiple',
          max: 2,
          onChange: (v) => setMulti(v as string[]),
          searchable: true,
          placeholder: '多选（上限 2，可反选）',
        }),
        h(Picker, {
          options: [{ value: 'x', label: '降级示例' }],
          degraded: true,
          disabled: true,
          placeholder: '降级 + 禁用',
        }),
        h(Picker, {
          options: ICON_OPTIONS,
          value: single,
          onChange: (v) => setSingle(v as string),
          hint: '挂在触发器后面的问号提示，不用再手动拼 FieldHint。',
          placeholder: '单选（带 hint）',
        }),
      ),
    ),
    h(
      Example,
      { title: 'ModelPicker（真实目录）', hint: t('modelPickerHint'), code: CODE_MODEL_PICKER },
      h(
        'div',
        { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
        // ① 分组形态：一个下拉、完全独立，供应商做组头（带「默认模型」选项）
        h(ModelPicker, { value: model, onChange: setModel, variant: 'grouped' }),
        // ② 联动形态：两个下拉联动，先选供应商、模型列表跟着筛
        h(ModelPicker, {
          value: model2,
          onChange: setModel2,
          variant: 'cascade',
          placeholder: '选择模型',
        }),
      ),
    ),
    h(
      Example,
      { title: 'WorkspacePicker（真实列表）', hint: t('workspacePickerHint'), code: CODE_WORKSPACE_PICKER },
      h(
        'div',
        { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
        // 默认即我们给的名字（「工作区」）和文件夹图标；自定义文案 / 图标是可选能力，不在演示里铺
        h(WorkspacePicker, {
          value: ws,
          onChange: (v) => setWs(v as string),
          clearable: true,
          searchable: true,
        }),
      ),
    ),
    h(CodeOnly, { labelKey: 'docUsage', code: CODE_PICKER_USAGE }),
    h(ApiTable, { rows: PICKER_API }),
    h(ApiTable, { rows: HOST_PICKER_API }),
    h(Placeholder, { descKey: 'pickerLogicDesc' }),
  )
}

// ── 提示 ────────────────────────────────────────────────────────────────

const CODE_TOOLTIP = `// label + side / align；children 必须是能挂 ref 的真实 DOM（函数组件挂不上 ⇒ 无气泡）
<Tooltip label="top · center" side="top" align="center">
  <button type="button">悬停我</button>
</Tooltip>
<Tooltip label="很长的一段说明，放不下时按 maxWidth 折行" side="bottom" maxWidth={240}>
  <span>悬停我</span>
</Tooltip>

// 两段式：label 里直接写换行
<Tooltip label={'任务名' + String.fromCharCode(10) + '任务正文'} side="top" maxWidth={260}>
  <span>任务名</span>
</Tooltip>

// 富卡片：官方 HoverCard，content 收任意 ReactNode；compact 变体背景恒深，内容色自己给
<HoverCard
  variant="compact"
  openDelayMs={200}
  anchor={<span>任务名</span>}
  content={<div style={{ color: 'var(--dsw-static-neutral-bluish-00,#fff)' }}>…</div>}
/>`

const CODE_TOOLTIP_USAGE = `pnpm add dsh-plugin-core

import { Tooltip, HoverCard } from '@deepseek-ai/dsh-client-ui-primitives'

<Tooltip label="解释这个操作会发生什么" side="right">
  <Button variant="outline">一个按钮</Button>
</Tooltip>

// 问号提示（FieldHint）用的是同一个官方 Tooltip 本体：
// 宿主侧 setTooltipRenderer((props) => h(Tooltip, props))，之后所有问号气泡都是它`

/** Tooltip 对外参数（官方 primitive，宿主内核提供）。 */
const TOOLTIP_API: readonly ApiRow[] = [
  { name: 'label', type: 'string', def: '—', descKey: 'apiText' },
  { name: 'side', type: "'top' | 'bottom' | 'right'", def: "'top'", descKey: 'apiSide' },
  { name: 'align', type: "'center' | 'end'", def: "'center'", descKey: 'apiAlign' },
  { name: 'maxWidth', type: 'number', def: '—', descKey: 'apiMaxWidth' },
  { name: 'delayMs', type: 'number', def: '—', descKey: 'apiDelayMs' },
  { name: 'portal', type: 'boolean', def: 'false', descKey: 'apiPortal' },
  { name: 'children', type: 'ReactElement', def: '—', descKey: 'apiAnchor' },
]

/** HoverCard：另一种悬停富卡片（宿主工作区列表那种「标题 + 正文」卡就是它）。 */
const HOVERCARD_API: readonly ApiRow[] = [
  { name: 'anchor', type: 'ReactNode', def: '—', descKey: 'apiAnchor' },
  { name: 'content', type: 'ReactNode', def: '—', descKey: 'apiChildren' },
  { name: 'variant', type: "'compact' | 'preview'", def: "'compact'", descKey: 'apiVariant' },
  { name: 'openDelayMs', type: 'number', def: '—', descKey: 'apiDelayMs' },
]

export function TooltipPage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(Note, { text: t('tooltipNote') }),
    h(
      Example,
      { title: t('tooltipTitle'), hint: t('tooltipHint'), code: CODE_TOOLTIP },
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
      h(Labeled, { label: t('tooltipAnchorButton') },
        tipAnchor('top · center', 'top', 'center'),
        tipAnchor('top · end', 'top', 'end'),
        tipAnchor('bottom · center', 'bottom', 'center'),
        tipAnchor('bottom · end', 'bottom', 'end'),
        tipAnchor('right', 'right')),
      h(Labeled, { label: t('tooltipAnchorText') },
        h(Tooltip, { label: t('tooltipHint'), side: 'top' },
          h('span', {
            style: { borderBottom: '1px dashed var(--dshpc-border-strong)', cursor: 'pointer', fontSize: '13px' },
          }, t('tooltipAnchorText'))),
        h(Tooltip, { label: t('tooltipLongText'), side: 'bottom', maxWidth: 240 },
          h('span', {
            style: { borderBottom: '1px dashed var(--dshpc-border-strong)', cursor: 'pointer', fontSize: '13px' },
          }, t('tooltipLong')))),
      // 两段式：第一行名字（短）、\n 真实换行、第二行正文（长，受 maxWidth 折行）
      h(Labeled, { label: t('tooltipMultiline') },
        h(Tooltip, { label: `${t('tooltipName')}\n${t('tooltipLongText')}`, side: 'top', maxWidth: 260 },
          h('span', {
            style: { borderBottom: '1px dashed var(--dshpc-border-strong)', cursor: 'pointer', fontSize: '13px' },
          }, t('tooltipName')))),
      // 富卡片：官方 HoverCard（宿主工作区列表那种「标题 + 正文」卡就是它）；content 收任意 ReactNode
      h(Labeled, { label: t('tooltipRich') },
        h(HoverCard, {
          variant: 'compact',
          openDelayMs: 200,
          anchor: h('span', {
            style: { borderBottom: '1px dashed var(--dshpc-border-strong)', cursor: 'pointer', fontSize: '13px' },
          }, t('tooltipName')),
          // ⚠️ 官方 HoverCard 的 compact 变体（.card）背景是硬编码 `#2C2C2E` 且**不设 color**
          // （来源见 docs/design/external/dsh-host.md §10），卡片又被 portal 到 document.body，
          // 文字色因此退化成继承：亮色下继承到近黑 ⇒ 黑字压深底。背景恒深 ⇒ 内容色必须由调用方给，
          // 这里取官方 Tooltip 在同一个深底场景用的常量 `--dsw-static-neutral-bluish-00`（#fff）。
          content: h('div', {
            style: {
              padding: '4px 2px', minWidth: '220px',
              color: 'var(--dsw-static-neutral-bluish-00,#fff)',
            },
          },
            h('div', { style: { fontWeight: 600, fontSize: '14px', marginBottom: '4px' } }, t('tooltipName')),
            h('div', { style: { fontSize: '12px', lineHeight: 1.6, whiteSpace: 'pre-line', opacity: .78 } }, t('tooltipLongText'))),
        }))),
    ),
    h(CodeOnly, { labelKey: 'docUsage', code: CODE_TOOLTIP_USAGE }),
    h(ApiTable, { rows: TOOLTIP_API }),
    h(ApiTable, { rows: HOVERCARD_API }),
  )
}

// ── 卡片与容器 ──────────────────────────────────────────────────────────

const CODE_CARD = `// Card：surface 底 + 1px 边框 + 圆角；action 里裸放一个元素也垂直居中
<Card
  accent="business"
  action={<span style={{ color: 'var(--dshpc-fg-3)', fontSize: 'var(--dshpc-font-xs)' }}>2026-10-18 创建</span>}
>
  <div style={{ fontWeight: 600 }}>将 OpenSSH 上所有 NPM 安装迁移到 PNPM</div>
  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
    <Chip>#npm</Chip>
    <Chip>#迁移</Chip>
  </div>
</Card>

// accent 五档：business / success / warning / danger / neutral（或任意 CSS 色值）
<Card accent="warning"><div>…</div></Card>`

const CODE_STRIP_CARD = `// StripCard：同色系浅底 + 方角 + 左缘 4px 通高色条（备注框、执行记录条同款）
<StripCard
  accent="success"
  action={<Button size="sm" variant="outline">Cancel</Button>}
>
  <div style={{ fontWeight: 600 }}>执行成功</div>
  <div style={{ color: 'var(--dshpc-fg-3)', fontSize: 'var(--dshpc-font-xs)' }}>耗时 12s · 3 个文件变更</div>
</StripCard>`

const CODE_SECTION_HEAD = `// 分区标题：icon + 标题 + 右侧操作区三段式；标题后缀可以是计数 / 彩色标签 / 小字说明
<SectionHead
  icon={<IconSparkleRegular size={16} />}
  title={<span>全部待办 <span style={{ fontSize: 'var(--dshpc-font-xs)', color: 'var(--dshpc-fg-3)' }}>22</span></span>}
  right={[
    <Segmented variant="inset" items={[{ value: 'all', label: '全部', count: 22 }]} value={seg} onChange={setSeg} />,
    <div style={{ width: 192 }}><Input value={kw} onChange={setKw} placeholder="搜索" /></div>,
  ]}
/>`

const CODE_CARD_USAGE = `pnpm add dsh-plugin-core

import { Card, StripCard, SectionHead } from 'dsh-plugin-core/ui'

// 备注框、执行记录条：StripCard（浅底 + 左色条）
<StripCard accent="business"><div>标题 + 内容</div></StripCard>

// 普通卡片：Card（surface 底 + 边框 + 圆角）
<Card accent="business" action={<Button size="sm" variant="ghost">查看会话</Button>}>
  <div>标题 + 内容</div>
</Card>`

/** Card / StripCard 共用同一份 props（与 src/ui/Card.ts 的 CardSharedProps 逐条对齐）。 */
const CARD_API: readonly ApiRow[] = [
  { name: 'accent', type: "CardAccent | string", def: "'business'", descKey: 'apiAccent' },
  { name: 'expanded', type: 'boolean', def: 'false', descKey: 'apiExpanded' },
  { name: 'onToggle', type: '() => void', def: '—', descKey: 'apiOnToggle' },
  { name: 'action', type: 'ReactNode', def: '—', descKey: 'apiAction' },
  { name: 'panel', type: 'ReactNode', def: '—', descKey: 'apiPanel' },
  { name: 'children', type: 'ReactNode', def: '—', descKey: 'apiChildren' },
]

/** SectionHead：纯排版壳，三段都由调用方给。 */
const SECTION_HEAD_API: readonly ApiRow[] = [
  { name: 'icon', type: 'ReactNode', def: '—', descKey: 'apiIcon' },
  { name: 'title', type: 'ReactNode', def: '—', descKey: 'apiText' },
  { name: 'right', type: 'ReactNode | ReactNode[]', def: '—', descKey: 'apiAction' },
]

export function CardPage(): ReturnType<typeof h> {
  const [seg, setSeg] = useState('all')
  const [kw, setKw] = useState('')
  return h(
    'div',
    null,
    h(Note, { text: t('cardNote') }),
    h(
      Example,
      { title: t('demoCardTitle'), hint: t('cardHint'), code: CODE_CARD },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px' } },
        // 真实形态示例（任务卡同款排版）：右侧元信息走 action 槽 ⇒ 外壳自动垂直居中
        h(Card, {
          accent: 'business',
          action: h('span', { style: { color: 'var(--dshpc-fg-3)', fontSize: 'var(--dshpc-font-xs)', flex: 'none' } }, '2026-10-18 创建'),
        },
          h('div', { style: { fontWeight: 600, flex: '1 1 auto', minWidth: 0, fontSize: 'var(--dshpc-font-md)' } },
            '将 OpenSSH 上所有 NPM 安装迁移到 PNPM'),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' } },
            h(Chip, null, 'NAS-Docker'),
            h(Chip, null, '#npm'),
            h(Chip, null, '#pnpm'),
            h(Chip, null, '#OpenSSH'),
            h(Chip, null, '#迁移'),
          ),
        ),
        // action 里裸放一个 button：不套容器也垂直居中；框内排版由调用方自定
        h(Card, {
          accent: 'business',
          action: h(Button, { size: 'sm', variant: 'ghost' }, '查看会话'),
        },
          h('div', { style: { fontWeight: 600, fontSize: 'var(--dshpc-font-md)' } }, 'DAY:1 - Docker 镜像版本检查器'),
          h('div', { style: { color: 'var(--dshpc-fg-3)', fontSize: 'var(--dshpc-font-xs)', marginTop: '4px' } }, 'NAS-Docker · 计划 02:00 · 实际 02:00 · 时长 04:02'),
        ),
        // accent 速览：单行紧凑卡，只看色条档位
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' } },
          (['business', 'success', 'warning', 'danger', 'neutral'] as const).map((a) =>
            h(Card, { key: a, accent: a, style: { padding: '8px 12px' } },
              h('div', { style: { fontSize: 'var(--dshpc-font-sm)', color: 'var(--dshpc-fg-2)' } }, `accent="${a}"`),
            ),
          ),
        ),
      ),
    ),
    h(
      Example,
      { title: t('demoStripTitle'), hint: t('stripHint'), code: CODE_STRIP_CARD },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '640px' } },
        h(StripCard, {
          accent: 'business',
          action: h('span', { style: { color: 'var(--dshpc-fg-3)', fontSize: 'var(--dshpc-font-xs)', flex: 'none' } }, '2026-10-18 开始 · 今天'),
        },
          h('div', { style: { fontWeight: 600, fontSize: 'var(--dshpc-font-md)' } }, 'DAY:1 - Docker 镜像版本检查器'),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' } },
            h(Chip, null, 'NAS-Docker'),
            h('span', { style: { color: 'var(--dshpc-fg-3)', fontSize: 'var(--dshpc-font-xs)' } },
              '计划 02:00 · 实际 02:00 · 时长 04:02 · 2.4M'),
          ),
        ),
        h(StripCard, {
          accent: 'success',
          // 右侧裸放一个描边钮（outline, sm=24px）：不套容器也垂直居中
          action: h(Button, { size: 'sm', variant: 'outline' }, 'Cancel'),
        },
          h('div', { style: { fontWeight: 600, fontSize: 'var(--dshpc-font-md)' } }, '执行成功'),
          h('div', { style: { color: 'var(--dshpc-fg-3)', fontSize: 'var(--dshpc-font-xs)', marginTop: '4px' } }, '耗时 12s · 3 个文件变更'),
        ),
        // accent 速览：单行紧凑卡，只看色条档位（与 Card 节同款）
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' } },
          (['business', 'success', 'warning', 'danger', 'neutral'] as const).map((a) =>
            h(StripCard, { key: a, accent: a, style: { padding: '8px 12px 8px 20px' } },
              h('div', { style: { fontSize: 'var(--dshpc-font-sm)', color: 'var(--dshpc-fg-2)' } }, `accent="${a}"`),
            ),
          ),
        ),
      ),
    ),
    h(
      Example,
      { title: t('sectionHeadTitle'), hint: '分区标题：icon + 标题 + 右侧操作区三段式——纯排版壳，icon/标题/右侧都调用方自定；下示 3 组：不同图标 / 标题后缀（计数·彩色标签·小字说明）/ 两种右侧组合', code: CODE_SECTION_HEAD },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
        // A：sparkle 图标 + “全部待办”后缀计数 + 右侧过滤组（滑轨 + 搜索框）
        h(SectionHead, {
          icon: h(IconSparkleRegular, { size: 16 }),
          title: h('span', { style: { display: 'inline-flex', alignItems: 'baseline', gap: '6px' } },
            '全部待办',
            h('span', { style: { fontSize: 'var(--dshpc-font-xs)', color: 'var(--dshpc-fg-3)', fontWeight: 400 } }, '22'),
          ),
          right: [
            h(Segmented, {
              variant: 'inset',
              items: [
                { value: 'all', label: t('segAll'), count: 22 },
                { value: 'doing', label: t('segDoing'), count: 11 },
                { value: 'claimed', label: t('segClaimed'), count: 11 },
                { value: 'backlog', label: '积压' },
                { value: 'overdue', label: '逾期', count: 4 },
                { value: 'stalled', label: '停滞', count: 8 },
              ],
              value: seg,
              onChange: setSeg,
            }),
            // 搜索框 192px 定宽（兄弟项目 SEARCH_WIDTH 同款），外面套 div 控宽
            h('div', { style: { width: '192px', flex: 'none' } },
              h(Input, { value: kw, onChange: setKw, placeholder: '搜索' })),
          ],
        }),
        // B：clock 图标 + “我的待办” + 彩色标签 + 右侧单个操作钮
        h(SectionHead, {
          icon: h(IconClockOutlineRegular, { size: 16 }),
          title: h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
            '我的待办',
            h(Chip, { tone: 'success', size: 'xs' }, '最新'),
          ),
          right: h(Button, { size: 'sm', variant: 'ghost' }, '刷新'),
        }),
        // C：refresh 图标 + “已归档” + 小字说明 + 右侧操作组（两个钮）
        h(SectionHead, {
          icon: h(IconRefreshOutlineRegular, { size: 16 }),
          title: h('span', { style: { display: 'inline-flex', alignItems: 'baseline', gap: '6px' } },
            '已归档',
            h('span', { style: { fontSize: 'var(--dshpc-font-xs)', color: 'var(--dshpc-fg-3)', fontWeight: 400 } }, '共 8 条'),
          ),
          right: [
          h(Button, { size: 'sm', variant: 'ghost' }, '操作'),
          h(Button, { size: 'sm', variant: 'secondary' }, '设置'),
          ],
          }),
          ),
          ),
          h(CodeOnly, { labelKey: 'docUsage', code: CODE_CARD_USAGE }),
          h(ApiTable, { rows: CARD_API }),
          h(ApiTable, { rows: SECTION_HEAD_API }),
          )
          }

          // ── 标签 · 文本 · 状态 ──────────────────────────────────────────────────

const CODE_CHIP = `// tone 五档 + size 三档；尺寸行固定由大到小（md → sm → xs），同档文案不混排
<Chip size="md" tone="warning">逾期</Chip>
<Chip size="sm" tone="danger">停滞</Chip>
<Chip size="xs" tone="success">完成</Chip>

// 中性 # 标签（语言无关）；传 onClick 才渲染成 button
<Chip>#npm</Chip>
<Chip onClick={() => showToast('点了 chip')}>#可点</Chip>`

const CODE_MARQUEE = `// 外层裁剪、内层滚动：放不下才滚，hover 一遍停在尾字，移开复位成省略号
<MarqueeText text="这是一段很长的文字，放不下时 hover 会滚动展示全名" />`

const CODE_LIVE = `// 订阅内部节拍器，走时内容调用方渲染
<LiveText render={(nowMs) => new Date(nowMs).toLocaleTimeString()} />`

const CODE_EMPTY = `// 业务空态：可挂一个操作按钮
<EmptyState text="暂无数据" action={<Button size="sm" variant="outline">重试</Button>} />`

const CODE_CHIP_USAGE = `pnpm add dsh-plugin-core

import { Chip, MarqueeText, LiveText, EmptyState } from 'dsh-plugin-core/ui'

<Chip tone="success">完成</Chip>
<Chip onClick={openTask}>#可点</Chip>
<MarqueeText text={taskTitle} />`

/** Chip 对外参数（与 src/ui/Chip.ts 的 ChipProps 逐条对齐）。 */
const CHIP_API: readonly ApiRow[] = [
  { name: 'children', type: 'ReactNode', def: '—', descKey: 'apiChildren' },
  { name: 'tone', type: "'neutral' | 'business' | 'success' | 'warning' | 'danger'", def: "'neutral'", descKey: 'apiTone' },
  { name: 'size', type: "'xs' | 'sm' | 'md'", def: "'sm'", descKey: 'apiSize' },
  { name: 'onClick', type: '() => void', def: '—', descKey: 'apiOnClick' },
]

/** MarqueeText / LiveText / EmptyState：三个小件各一行。 */
const TEXT_KIT_API: readonly ApiRow[] = [
  { name: 'MarqueeText · text', type: 'string', def: '—', descKey: 'apiText' },
  { name: 'LiveText · render', type: '(nowMs: number) => ReactNode', def: '—', descKey: 'apiRender' },
  { name: 'EmptyState · text', type: 'ReactNode', def: '「暂无数据」', descKey: 'apiText' },
  { name: 'EmptyState · action', type: 'ReactNode', def: '—', descKey: 'apiAction' },
]

export function ChipPage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(Note, { text: t('chipNote') }),
    h(
      Example,
      { title: 'Chip', hint: t('chipHint'), code: CODE_CHIP },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        // 尺寸 + 语义色：三档各一行，**固定由大到小**（md → sm → xs），每行同组文案同档，杜绝乱序
        ...(['md', 'sm', 'xs'] as const).map((sz) =>
          h('div', { key: sz, style: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' } },
            h(Chip, { size: sz, tone: 'warning' }, t('chipOverdue')),
            h(Chip, { size: sz, tone: 'danger' }, t('chipStalled')),
            h(Chip, { size: sz, tone: 'success' }, t('chipDone')),
            h(Chip, { size: sz, tone: 'business' }, t('chipDoing')),
            h(Chip, { size: sz }, `Tag ${sz.toUpperCase()}`),
          ),
        ),
        // 中性 # 标签（语言无关）+ 长文字回归样
        h(
          'div',
          { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' } },
          h(Chip, null, '#npm'),
          h(Chip, null, '#构建'),
          h(Chip, { onClick: () => showToast('点了 chip') }, '#可点'),
          h(Chip, null, '一整段比较长的标签文字，宽度应该跟着文字走'),
        ),
      ),
    ),
    h(
      Example,
      { title: t('marqueeTitle'), hint: '双层结构：外层裁剪、内层滚动；跑一遍停在尾字，鼠标移开复位成省略号', code: CODE_MARQUEE },
      h('div', { style: { maxWidth: '200px' } },
        h(MarqueeText, { text: '这是一段很长的文字，放不下时 hover 会滚动展示全名' })),
    ),
    h(
      Example,
      { title: t('liveTitle'), hint: '订阅内部节拍器，走时 Ui 由调用方渲染', code: CODE_LIVE },
      h(LiveText, { render: (nowMs: number) => new Date(nowMs).toLocaleTimeString() }),
    ),
    h(
      Example,
      { title: t('emptyStateTitle'), hint: '业务空态：无数据时的占位，可挂一个操作按钮', code: CODE_EMPTY },
      h(EmptyState, { text: '暂无数据' }),
    ),
    h(CodeOnly, { labelKey: 'docUsage', code: CODE_CHIP_USAGE }),
    h(ApiTable, { rows: CHIP_API }),
    h(ApiTable, { rows: TEXT_KIT_API }),
  )
}

// ── 反馈 ────────────────────────────────────────────────────────────────

export function FeedbackPage(): ReturnType<typeof h> {
  const [open, setOpen] = useState(false)
  const [openNative, setOpenNative] = useState(false)
  const [alertState, setAlertState] = useState<{ sev: AlertSeverity; titled: boolean } | null>(null)
  const [confirmCfg, setConfirmCfg] = useState<{ tone: ConfirmTone; confirmText: string; cancelText: string } | null>(null)
  const [confirmResult, setConfirmResult] = useState('')
  const [largeOpen, setLargeOpen] = useState(false)
  const [largeOpenB, setLargeOpenB] = useState(false)
  const [nativeText, setNativeText] = useState('')
  return h(
    'div',
    null,
    h(
      Demo,
      { title: '原生弹窗（宿主）', hint: '宿主内核官方 Modal：遮罩/头部/关闭叉全归宿主管；正文区塞任意内容，footer 任意按钮组合。命令式用 confirmModal/alertModal 加 skin:"host"，与 core 互不覆盖。' },
      h(
        'div',
        { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
        h(Button, { variant: 'outline', onClick: () => setOpenNative(true) }, '打开宿主原生弹窗（组件）'),
        h(Button, { variant: 'ghost', onClick: () => { void alertModal({ title: '宿主提示', message: '这是宿主样式的命令式 alert（skin:"host"），关闭即确认' }) } }, 'alertModal({skin:"host"})'),
        h(Button, { variant: 'ghost', onClick: async () => {
            const ok = await confirmModal({ title: '宿主确认框', message: '官方 Modal 弹出的确认（danger）', tone: 'danger', confirmText: '删除', cancelText: '再想想', skin: 'host' })
            showToast(ok ? '宿主 confirm：你点了删除' : '宿主 confirm：你点了取消')
          } }, 'confirmModal({skin:"host"})'),
        openNative
          ? h(
              Official.Modal,
              {
                open: openNative,
                onClose: () => setOpenNative(false),
                title: '宿主原生弹窗',
                closeLabel: '关闭',
                description: '这是宿主内核提供的 Modal，下面一段是调用方塞进来的自定义内容（输入框 + 勾选）。',
                contentClassName: 'dshpc-native-demo-content',
                footer: h(
                  'div',
                  { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
                  h(Button, { variant: 'outline', onClick: () => setOpenNative(false) }, '取消'),
                  h(Button, { variant: 'danger', onClick: () => setOpenNative(false) }, '删除'),
                  h(Button, { variant: 'primary', onClick: () => setOpenNative(false) }, '确认'),
                ),
              },
              h(
                'div',
                { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
                h(Input, { value: nativeText, onChange: setNativeText, placeholder: '自定义输入框（来自 core 控件）' }),
                h(
                  'label',
                  { style: { display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' } },
                  h(Checkbox, { checked: false, onChange: () => {} }),
                  '自定义勾选项',
                ),
              ),
            )
          : null,
      ),
    ),
    h(
      Demo,
      { title: '小型弹窗（自定义）', hint: '我们的标准小框：AlertModal（单按钮 + severity 图标）/ ConfirmModal（双按钮 + 语义档），以及命令式 alertModal()/confirmModal()（Promise）。名字带 Modal 后缀，不覆盖宿主原生。' },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
        h(
          'div',
          null,
          h('div', { style: { fontSize: '12px', color: 'var(--dshpc-fg-3)', marginBottom: '6px' } }, 'AlertModal（组件）'),
          h(
            'div',
            { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
            h(Button, { onClick: () => setAlertState({ sev: 'info', titled: true }) }, 'info'),
            h(Button, { onClick: () => setAlertState({ sev: 'success', titled: true }) }, 'success'),
            h(Button, { onClick: () => setAlertState({ sev: 'warning', titled: true }) }, 'warning'),
            h(Button, { onClick: () => setAlertState({ sev: 'error', titled: true }) }, 'error'),
            h(Button, { variant: 'outline', onClick: () => setAlertState({ sev: 'warning', titled: false }) }, '无标题'),
          ),
          alertState !== null
            ? h(AlertModal, {
                severity: alertState.sev,
                title: alertState.titled ? '操作结果' : undefined,
                message: '这是一条说明文字：AlertModal 用于只需一个确认动作的提示场景。',
                onConfirm: () => setAlertState(null),
              })
            : null,
        ),
        h(
          'div',
          null,
          h('div', { style: { fontSize: '12px', color: 'var(--dshpc-fg-3)', marginBottom: '6px' } }, 'ConfirmModal（组件）'),
          h(
            'div',
            { style: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' } },
            h(Button, { onClick: () => { setConfirmCfg({ tone: 'primary', confirmText: '确定', cancelText: '取消' }); setConfirmResult('') } }, '默认（primary）'),
            h(Button, { variant: 'outline', onClick: () => { setConfirmCfg({ tone: 'danger', confirmText: '删除', cancelText: '再想想' }); setConfirmResult('') } }, 'danger 变体'),
            h(Button, { variant: 'ghost', onClick: () => { setConfirmCfg({ tone: 'warning', confirmText: '我已知晓', cancelText: '返回' }); setConfirmResult('') } }, '改文案'),
            confirmResult ? h('span', { style: { fontSize: '13px', color: 'var(--dshpc-fg-3)' } }, confirmResult) : null,
          ),
          confirmCfg !== null
            ? h(ConfirmModal, {
                title: '删除任务',
                message: '删除后不可恢复，确定要删除吗？',
                tone: confirmCfg.tone,
                confirmText: confirmCfg.confirmText,
                cancelText: confirmCfg.cancelText,
                onConfirm: () => { setConfirmCfg(null); setConfirmResult(`你点了：${confirmCfg.confirmText}（确认）`) },
                onCancel: () => { setConfirmCfg(null); setConfirmResult(`你点了：${confirmCfg.cancelText}（取消）`) },
              })
            : null,
        ),
        h(
          'div',
          null,
          h('div', { style: { fontSize: '12px', color: 'var(--dshpc-fg-3)', marginBottom: '6px' } }, '命令式（Promise）'),
          h(
            'div',
            { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
            h(Button, { variant: 'outline', onClick: () => { alertModal({ title: '提示', message: '这是命令式 alert，关闭即确认' }).then(() => showToast('alert 已关闭')) } }, 'alertModal()'),
            h(Button, { onClick: async () => {
                const ok = await confirmModal({ title: '确认提交', message: '提交后不可撤销', tone: 'danger', confirmText: '提交', cancelText: '取消' })
                showToast(ok ? '你点了：提交' : '你点了：取消')
              } }, 'confirmModal()'),
          ),
        ),
      ),
    ),
    h(
      Demo,
      { title: '大型弹窗（自定义）', hint: '我们的内容弹窗：Modal（size md/lg），承载任意内容，不是「确定/取消」命令式。三张示例：默认 md / 带 footer / 无 footer（内容自定义），头部排法可不同。' },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
        h(
          'div',
          null,
          h('div', { style: { fontSize: '12px', color: 'var(--dshpc-fg-3)', marginBottom: '6px' } }, '默认（md）'),
          h(Button, { onClick: () => setOpen(true) }, '打开大弹窗（md 默认）'),
          open
            ? h(Modal, {
                title: '任务详情',
                onClose: () => setOpen(false),
                footer: h(Button, { variant: 'primary', onClick: () => setOpen(false) }, '知道了'),
              }, h('div', null, '弹窗主体内容——会话预览这类功能就用它来承载。'))
            : null,
        ),
        h(
          'div',
          null,
          h('div', { style: { fontSize: '12px', color: 'var(--dshpc-fg-3)', marginBottom: '6px' } }, '带 footer（lg）'),
          h(Button, { variant: 'outline', onClick: () => setLargeOpen(true) }, '打开大弹窗（带 footer）'),
          largeOpen
            ? h(
                Modal,
                {
                  size: 'lg',
                  title: '会话记录',
                  headerActions: h(
                    Button,
                    { variant: 'outline', size: 'sm', icon: iconOf('chevron', 14) },
                    '更多',
                  ),
                  onClose: () => setLargeOpen(false),
                  footer: h(
                    'div',
                    { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
                    h(Button, { variant: 'outline', onClick: () => setLargeOpen(false) }, '关闭'),
                    h(Button, { variant: 'primary', onClick: () => setLargeOpen(false) }, '完成'),
                  ),
                },
                h(
                  'div',
                  null,
                  Array.from({ length: 40 }, (_, i) =>
                    h('div', { key: i, style: { padding: '10px 0', borderBottom: '1px solid var(--dshpc-border-faint)', fontSize: '13px' } }, `列表项 ${i + 1}：这是一段可滚动的内容示例`),
                  ),
                  h('div', { className: 'dshpc-modal__sid' }, '共 128 条 · 最近更新 2 分钟前'),
                ),
              )
            : null,
        ),
        h(
          'div',
          null,
          h('div', { style: { fontSize: '12px', color: 'var(--dshpc-fg-3)', marginBottom: '6px' } }, '无 footer（内容自定义）'),
          h(Button, { variant: 'outline', onClick: () => setLargeOpenB(true) }, '打开大弹窗（无 footer）'),
          largeOpenB
            ? h(
                Modal,
                {
                  size: 'lg',
                  title: h(
                    'div',
                    null,
                    h('div', { style: { fontWeight: 600 } }, '任务详情'),
                    h('div', { className: 'dshpc-modal__sid' }, 'sid-2026-1020-7f3a · 5 个步骤'),
                  ),
                  onClose: () => setLargeOpenB(false),
                },
                h(
                  'div',
                  null,
                  h('div', { style: { fontSize: '13px', lineHeight: '1.7' } }, '这里整个弹窗都由调用方自己定义：没有 footer，头部也换了一种排法（多排标题 + 副标题行）。内容区可放任意业务组件。'),
                  h('div', { style: { marginTop: '12px', border: '1px solid var(--dshpc-border-faint)', borderRadius: '8px', padding: '12px', fontSize: '13px' } }, '任意内容，例如一段说明或一个业务卡片。'),
                ),
              )
            : null,
        ),
      ),
    ),
    h(
      Demo,
      { title: 'Toast · 官方 Sonner', hint: 'showToast()：第三方库原味，对比用' },
      h(
        'div',
        { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h(Button, { onClick: () => showToast('已保存') }, '普通(info)'),
        h(Button, { onClick: () => showToast('保存成功', { variant: 'success' }) }, '成功'),
        h(Button, { onClick: () => showToast('保存失败', { variant: 'error' }) }, '失败'),
        h(Button, { onClick: () => showToast('注意一下', { variant: 'warning' }) }, '警告'),
        h(Button, { onClick: () => showToast('整条自定义色', { color: '#7c3aed' }) }, '自定义色'),
        h(
          Button,
          {
            onClick: () =>
              showToast('消失后回调', {
                onDismiss: () => showToast('上一条消失了'),
              }),
          },
          '带回调',
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h(Button, { onClick: () => showToast('顶部-左', { position: 'top-left' }) }, 'top-left'),
        h(Button, { onClick: () => showToast('顶部-中', { position: 'top-center' }) }, 'top-center'),
        h(Button, { onClick: () => showToast('顶部-右', { position: 'top-right' }) }, 'top-right'),
        h(Button, { onClick: () => showToast('底部-左', { position: 'bottom-left' }) }, 'bottom-left'),
        h(Button, { onClick: () => showToast('底部-中', { position: 'bottom-center' }) }, 'bottom-center'),
        h(Button, { onClick: () => showToast('底部-右', { position: 'bottom-right' }) }, 'bottom-right'),
      ),
    ),
    h(
      Demo,
      { title: 'Toast · 宿主原生', hint: 'showHostToast()：直接包 @deepseek-ai 官方 Toast（顶部横幅）' },
      h(
        'div',
        { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h(Button, { onClick: () => showHostToast('这是宿主原生提示') }, '普通'),
        h(Button, { onClick: () => showHostToast('操作成功', { tone: 'success' }) }, '成功(success)'),
        h(
          Button,
          {
            onClick: () =>
              showHostToast('有动作的原生提示', {
                actions: [{ text: '查看', onClick: () => showToast('点了「查看」') }],
              }),
          },
          '带动作',
        ),
      ),
    ),
    h(
      Demo,
      { title: 'Toast · 我们封装 notify', hint: 'notify()：统一灰/绿/红/黄 + 右侧我们自己的按钮' },
      h(
        'div',
        { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h(Button, { onClick: () => notify('已保存草稿') }, '普通(info)'),
        h(Button, { onClick: () => notify('保存成功', { variant: 'success' }) }, '成功'),
        h(Button, { onClick: () => notify('保存失败', { variant: 'error' }) }, '失败'),
        h(Button, { onClick: () => notify('磁盘空间不足', { variant: 'warning' }) }, '警告'),
        h(
          Button,
          {
            onClick: () =>
              notify('已删除该文件', {
                variant: 'success',
                description: '可在 10 秒内撤销',
                actions: [{ text: '撤销', variant: 'outline', onClick: () => notify('已撤销') }],
              }),
          },
          '单按钮+描述',
        ),
        h(
          Button,
          {
            onClick: () =>
              notify('确认提交吗？', {
                description: '提交后将通知相关成员',
                actions: [
                  { text: '取消', variant: 'outline', onClick: () => notify('已取消') },
                  { text: '提交', variant: 'primary', onClick: () => notify('已提交', { variant: 'success' }) },
                ],
              }),
          },
          '双按钮',
        ),
      ),
    ),
  )
}

// ── 布局与滚动 ──────────────────────────────────────────────────────────

export function LayoutPage(): ReturnType<typeof h> {
  // 控制器与「页面右侧那份 PanelDock」都在 client/index.tsx（页面级），这里只负责触发与读状态。
  const state = useSyncExternalStore(demoDock.subscribe, demoDock.getSnapshot, demoDock.getSnapshot)
  const [notice, setNotice] = useState<string | null>(null)

  const open = (id: string): void => {
    const result = demoDock.open(id)
    setNotice(result.ok ? null : t('dockLimitWarn'))
  }
  const close = (id: string): void => {
    demoDock.close(id)
    setNotice(null)
  }
  const opened = state.ids

  return h(
    'div',
    null,
    h(
      Demo,
      { title: 'PanelDock', hint: t('dockHint') },
      h(
        'div',
        { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' } },
        h(Button, { size: 'sm', onClick: () => open('A') }, t('dockBtnOpenA')),
        h(Button, { size: 'sm', onClick: () => open('B') }, t('dockBtnOpenB')),
        h(Button, { size: 'sm', variant: 'primary', onClick: () => open('A') }, t('dockBtnOpenA2')),
        h(Button, { size: 'sm', onClick: () => close('A') }, t('dockBtnCloseA')),
        h(Button, { size: 'sm', onClick: () => open('default') }, t('dockBtnDefault')),
        h(Button, { size: 'sm', onClick: () => open('C') }, t('dockBtnOpenC')),
        h(
          Button,
          {
            size: 'sm',
            variant: 'ghost',
            onClick: () => {
              for (const id of demoDock.ids()) demoDock.close(id)
              setNotice(null)
            },
          },
          t('dockBtnReset'),
        ),
      ),
      h(
        'div',
        { style: { fontSize: '12px', color: 'var(--dshpc-fg-3)' } },
        `${t('dockOpened')}${opened.length === 0 ? '—' : opened.join(', ')}`,
        notice === null ? '' : `　${notice}`,
      ),
      h(
        'div',
        { style: { marginTop: '10px', fontSize: '12px', color: 'var(--dshpc-fg-3)', lineHeight: '1.9' } },
        t('dockMainText'),
      ),
    ),
  )
}


