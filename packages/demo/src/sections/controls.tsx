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
const VARIANTS: readonly { value: ButtonVariant; icon: string }[] = [
  { value: 'primary', icon: 'check' },
  { value: 'secondary', icon: 'copy' },
  { value: 'outline', icon: 'edit' },
  { value: 'ghost', icon: 'refresh' },
  { value: 'danger', icon: 'close' },
  { value: 'success', icon: 'play' },
  { value: 'warning', icon: 'clock' },
  { value: 'info', icon: 'send' },
  { value: 'danger-outline', icon: 'close' },
  { value: 'link', icon: 'search' },
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

export function ButtonPage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    // 文案与语言
    h(
      Demo,
      { title: t('btnTextTitle'), hint: t('btnTextHint') },
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
      Demo,
      { title: t('btnVariantTitle'), hint: t('btnVariantHint') },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        h(Row, null, VARIANTS.map((item) =>
          h(Button, { key: item.value, variant: item.value, icon: iconOf(item.icon, ICON_SIZE.lg) }, item.value))),
        h(Row, null, VARIANTS.map((item) =>
          h(Button, { key: item.value, variant: item.value, size: 'sm', icon: iconOf(item.icon, ICON_SIZE.sm) }, item.value)))),
    ),

    // 尺寸 / 图标位置 / block
    h(
      Demo,
      { title: t('btnSizeTitle'), hint: t('btnSizeHint') },
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
      Demo,
      { title: t('btnStateTitle'), hint: t('btnStateHint') },
      h(Row, null,
        h(Button, { variant: 'primary' }, '默认'),
        h(Button, { variant: 'primary', disabled: true }, '禁用'),
        h(Button, { variant: 'danger', disabled: true, icon: iconOf('close', ICON_SIZE.lg) }, '禁用'),
        h(Button, { variant: 'outline', loading: true }, '加载中'),
        h(Button, { variant: 'primary', loading: true, icon: iconOf('refresh', ICON_SIZE.lg) }, '提交中')),
    ),

    // 自定义颜色
    h(
      Demo,
      { title: t('btnColorTitle'), hint: t('btnColorHint') },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        h(Row, null, CUSTOM_COLORS.map((color) =>
          h(Button, { key: color, variant: 'primary', color, icon: iconOf('sparkle', ICON_SIZE.lg) }, color))),
        h(Row, null, CUSTOM_COLORS.map((color) =>
          h(Button, { key: color, variant: 'outline', color }, color)))),
    ),
  )
}

// ── 录入 ────────────────────────────────────────────────────────────────

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
    // Input 家族
    h(
      Demo,
      { title: t('demoInputFamily'), hint: t('inputHint') },
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
      Demo,
      { title: t('btnHintTitle'), hint: t('btnHintHint') },
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
      Demo,
      { title: t('switchTip'), hint: t('checkboxHint') },
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
    h(
      Demo,
      { title: 'Picker', hint: t('pickerHint') },
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
      Demo,
      { title: 'ModelPicker（真实目录）', hint: t('modelPickerHint') },
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
      Demo,
      { title: 'WorkspacePicker（真实列表）', hint: t('workspacePickerHint') },
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
    h(Placeholder, { descKey: 'pickerLogicDesc' }),
  )
}

// ── 提示 ────────────────────────────────────────────────────────────────

export function TooltipPage(): ReturnType<typeof h> {
  return h(
    Demo,
    { title: t('tooltipTitle'), hint: t('tooltipHint') },
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
  )
}

// ── 卡片与容器 ──────────────────────────────────────────────────────────

export function CardPage(): ReturnType<typeof h> {
  const [seg, setSeg] = useState('all')
  const [kw, setKw] = useState('')
  return h(
    'div',
    null,
    h(
      Demo,
      { title: t('demoCardTitle'), hint: t('cardHint') },
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
      Demo,
      { title: t('demoStripTitle'), hint: t('stripHint') },
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
      Demo,
      { title: t('sectionHeadTitle'), hint: '分区标题：icon + 标题 + 右侧操作区三段式——纯排版壳，icon/标题/右侧都调用方自定；下示 3 组：不同图标 / 标题后缀（计数·彩色标签·小字说明）/ 两种右侧组合' },
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
  )
}

// ── 标签 · 文本 · 状态 ──────────────────────────────────────────────────

export function ChipPage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(
      Demo,
      { title: 'Chip', hint: t('chipHint') },
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
      Demo,
      { title: t('marqueeTitle'), hint: '双层结构：外层裁剪、内层滚动；跑一遍停在尾字，鼠标移开复位成省略号' },
      h('div', { style: { maxWidth: '200px' } },
        h(MarqueeText, { text: '这是一段很长的文字，放不下时 hover 会滚动展示全名' })),
    ),
    h(
      Demo,
      { title: t('liveTitle'), hint: '订阅内部节拍器，走时 Ui 由调用方渲染' },
      h(LiveText, { render: (nowMs: number) => new Date(nowMs).toLocaleTimeString() }),
    ),
    h(
      Demo,
      { title: t('emptyStateTitle'), hint: '业务空态：无数据时的占位，可挂一个操作按钮' },
      h(EmptyState, { text: '暂无数据' }),
    ),
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
                h(Input, { placeholder: '自定义输入框（来自 core 控件）' }),
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


