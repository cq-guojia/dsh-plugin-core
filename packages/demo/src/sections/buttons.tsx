import { createElement as h, useState, type ComponentType } from 'react'
import type { ButtonSize, ButtonVariant } from '../../../../dist/ui/index.js'
import { Button, Checkbox, FieldHint, IconButton, Input, NumberInput, Segmented, Textarea } from '../../../../dist/ui/index.js'
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
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { Demo } from './index.js'
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

export function ButtonsSection(): ReturnType<typeof h> {
  const [text, setText] = useState('')
  const [num, setNum] = useState(3)
  const [checked, setChecked] = useState(true)
  const [seg, setSeg] = useState<'day' | 'week' | 'month'>('week')
  const [filter, setFilter] = useState('all')
  const [multi, setMulti] = useState<string[]>(['1'])
  const [view, setView] = useState<'render' | 'source'>('render')

  return h(
    'div',
    null,
    // ── 文案与语言 ──────────────────────────────────────────────────────
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

    // ── 10 档外观 ──────────────────────────────────────────────────────
    h(
      Demo,
      { title: t('btnVariantTitle'), hint: t('btnVariantHint') },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        h(Row, null, VARIANTS.map((item) =>
          h(Button, { key: item.value, variant: item.value, icon: iconOf(item.icon, ICON_SIZE.lg) }, item.value))),
        h(Row, null, VARIANTS.map((item) =>
          h(Button, { key: item.value, variant: item.value, size: 'sm', icon: iconOf(item.icon, ICON_SIZE.sm) }, item.value)))),
    ),

    // ── 尺寸 / 图标位置 / block ─────────────────────────────────────────
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

    // ── Tooltip：官方悬停提示，side × align 全组合 + 双锚点类型 + 长文本换行 ──
    h(
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
    ),

    // ── 问号提示：证明它不属于 Input 家族，随处可挂 ──────────────────────
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

    // ── 状态 ───────────────────────────────────────────────────────────
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

    // ── 自定义颜色 ─────────────────────────────────────────────────────
    h(
      Demo,
      { title: t('btnColorTitle'), hint: t('btnColorHint') },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        h(Row, null, CUSTOM_COLORS.map((color) =>
          h(Button, { key: color, variant: 'primary', color, icon: iconOf('sparkle', ICON_SIZE.lg) }, color))),
        h(Row, null, CUSTOM_COLORS.map((color) =>
          h(Button, { key: color, variant: 'outline', color }, color)))),
    ),

    // ── Input 家族 ─────────────────────────────────────────────────────
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
          h(Input, { value: text, onChange: setText, placeholder: '选择日期' }),
          h(FieldHint, { text: t('fieldHintDate') }),
        ),
        h(Input, { value: 'bad value', onChange: () => {}, error: true, placeholder: '校验失败态' }),
        h(NumberInput, { value: num, onChange: setNum, min: 0, max: 10, suffix: '次' }),
        h(Textarea, { value: text, onChange: setText, placeholder: '多行输入' }),
      ),
    ),

    // ── Checkbox / Segmented ───────────────────────────────────────────
    h(
      Demo,
      { title: 'Checkbox / Segmented', hint: t('checkboxHint') },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-start' } },
        h(
          'div',
          { style: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' } },
          h(Checkbox, { checked, onChange: setChecked, label: '启用' }),
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
            size: 'sm',
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
        // default 变体（外描边）：预览顶栏切换这类小场景在用
        h(Segmented<'render' | 'source'>, {
          size: 'sm',
          variant: 'default',
          label: 'default 外观示例',
          items: [
            { value: 'render', label: t('segPreview') },
            { value: 'source', label: t('segSource') },
          ],
          value: view,
          onChange: setView,
        }),
        // bordered 变体（最外 1px 描边 + 选中段描边块）：与上一颗无框版共用同一状态，方便对比总高一致
        h(Segmented<'render' | 'source'>, {
          size: 'sm',
          bordered: true,
          label: 'bordered 外观示例',
          items: [
            { value: 'render', label: t('segPreview') },
            { value: 'source', label: t('segSource') },
          ],
          value: view,
          onChange: setView,
        }),
      ),
    ),
  )
}
