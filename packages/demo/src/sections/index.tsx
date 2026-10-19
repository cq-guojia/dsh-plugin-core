import { createElement as h, type ReactNode } from 'react'
import type { DemoMessageKey } from '../i18n.js'
import { t } from '../i18n.js'
import { QuickstartPage } from './start.js'
import { FoundationPage } from './foundation.js'
import {
  ButtonPage,
  CardPage,
  ChipPage,
  FeedbackPage,
  InputPage,
  LayoutPage,
  PickerPage,
  TooltipPage,
} from './controls.js'
import { ExplorerPage, SessionPage } from './blocks.js'
import { DatePage, HttpPage, I18nPage, NumberPage, TextPage } from './utils.js'
import { ReferencePage } from './reference.js'

/**
 * 两级目录：第一层（group）是能力域的纯标题，不可点；第二层（id）是一个可看页。
 * 一级刻意压到 5 个 —— 侧栏条目一多就糊成一团，看不出来分区。
 */
export type SectionGroup = 'start' | 'components' | 'blocks' | 'utils' | 'reference'

export type SectionId =
  | 'quickstart'
  | 'foundation'
  | 'button'
  | 'input'
  | 'picker'
  | 'tooltip'
  | 'card'
  | 'chip'
  | 'feedback'
  | 'layout'
  | 'explorer'
  | 'session'
  | 'date'
  | 'text'
  | 'number'
  | 'http'
  | 'i18n'
  | 'reference'

export interface SectionDef {
  id: SectionId
  group: SectionGroup
  titleKey: DemoMessageKey
  render: () => ReturnType<typeof h>
}

/** 第一层：顺序即侧栏顺序。 */
export const SECTION_GROUPS: { id: SectionGroup; titleKey: DemoMessageKey }[] = [
  { id: 'start', titleKey: 'grpStart' },
  { id: 'components', titleKey: 'grpComponents' },
  { id: 'blocks', titleKey: 'grpBlocks' },
  { id: 'utils', titleKey: 'grpUtils' },
  { id: 'reference', titleKey: 'grpReference' },
]

// 归类判据（以后加东西照这条填，不用再开会）：
//   跨页复用、无业务含义        → components
//   要注入数据、有业务语义的整块 → blocks
//   无 UI 的纯函数              → utils
//   说明性 / 元信息             → start / reference
/** 全部二级页（顺序即组内顺序）；侧栏与右侧渲染共用同一份目录（单一事实源）。 */
export const ALL_SECTIONS: SectionDef[] = [
  // 入门：原来的「开始」与「设计基础」两组并成一级，各占一页
  { id: 'quickstart', group: 'start', titleKey: 'secQuickstart', render: () => h(QuickstartPage, null) },
  { id: 'foundation', group: 'start', titleKey: 'secFoundation', render: () => h(FoundationPage, null) },

  { id: 'button', group: 'components', titleKey: 'secButton', render: () => h(ButtonPage, null) },
  { id: 'input', group: 'components', titleKey: 'secInput', render: () => h(InputPage, null) },
  { id: 'picker', group: 'components', titleKey: 'secPicker', render: () => h(PickerPage, null) },
  { id: 'tooltip', group: 'components', titleKey: 'secTooltip', render: () => h(TooltipPage, null) },
  { id: 'card', group: 'components', titleKey: 'secCard', render: () => h(CardPage, null) },
  { id: 'chip', group: 'components', titleKey: 'secChip', render: () => h(ChipPage, null) },
  { id: 'feedback', group: 'components', titleKey: 'secFeedback', render: () => h(FeedbackPage, null) },
  { id: 'layout', group: 'components', titleKey: 'secLayout', render: () => h(LayoutPage, null) },

  { id: 'explorer', group: 'blocks', titleKey: 'secExplorer', render: () => h(ExplorerPage, null) },
  { id: 'session', group: 'blocks', titleKey: 'secSession', render: () => h(SessionPage, null) },

  { id: 'date', group: 'utils', titleKey: 'secDate', render: () => h(DatePage, null) },
  { id: 'text', group: 'utils', titleKey: 'secText', render: () => h(TextPage, null) },
  { id: 'number', group: 'utils', titleKey: 'secNumber', render: () => h(NumberPage, null) },
  { id: 'http', group: 'utils', titleKey: 'secHttp', render: () => h(HttpPage, null) },
  { id: 'i18n', group: 'utils', titleKey: 'secI18n', render: () => h(I18nPage, null) },

  // 参考：无障碍 / 路线图 / 版本构建三条并成一页
  { id: 'reference', group: 'reference', titleKey: 'secReference', render: () => h(ReferencePage, null) },
]

/** 一个 demo 块：标题 + 一句话 + 实时渲染 + 用法（主流文档站的两段式，API 表在 docs/）。 */
export function Demo(props: {
  title: string
  hint?: string
  children?: ReactNode
  code?: string
}): ReturnType<typeof h> {
  return h(
    'section',
    {
      style: {
        marginBottom: '28px', padding: '16px 18px',
        border: '1px solid var(--dshpc-border-faint)', borderRadius: '8px',
        background: 'var(--dshpc-surface-1)',
      },
    },
    h('h3', { style: { margin: '0 0 2px', fontSize: '15px' } }, props.title),
    props.hint === undefined
      ? null
      : h('div', { style: { color: 'var(--dshpc-fg-3)', fontSize: '12px', marginBottom: '12px' } }, props.hint),
    h('div', { style: { marginBottom: props.code === undefined ? 0 : '12px' } }, props.children ?? null),
    props.code === undefined
      ? null
      : h(
          'pre',
          {
            style: {
              margin: 0, padding: '10px 12px', borderRadius: '6px', overflowX: 'auto',
              background: 'var(--dshpc-code-surface)', color: 'var(--dshpc-fg)',
              font: 'var(--dshpc-code-font)', fontSize: '12px',
            },
          },
          props.code,
        ),
  )
}

/**
 * 空位：这一页该有但还没有的东西，画一个灰框把清单写在里面。
 * 用意是让「还有什么没做」看得见 —— 不是 EmptyState 那种「当前无数据」的业务空态。
 */
export function Placeholder(props: { descKey: DemoMessageKey }): ReturnType<typeof h> {
  return h(
    'div',
    {
      style: {
        marginTop: '4px', padding: '16px 18px',
        border: '1px dashed var(--dshpc-border)', borderRadius: '8px',
        background: 'var(--dshpc-surface-sunken)', color: 'var(--dshpc-fg-3)',
      },
    },
    h('div', {
      style: {
        fontSize: '11px', fontWeight: 600, letterSpacing: '.06em',
        textTransform: 'uppercase', color: 'var(--dshpc-fg-4)', marginBottom: '10px',
      },
    }, t('phTodo')),
    h('div', { style: { fontSize: '13px', lineHeight: '1.9', whiteSpace: 'pre-line' } }, t(props.descKey)),
  )
}

function SectionHead(props: { id: SectionId; title: string }): ReturnType<typeof h> {
  return h(
    'div',
    { id: `sec-${props.id}`, style: { margin: '28px 0 14px' } },
    h('h2', { style: { margin: 0, fontSize: '20px' } }, props.title),
    h('div', { style: { height: '3px', width: '36px', background: 'var(--dshpc-business)', borderRadius: '2px', marginTop: '6px' } }),
  )
}

/** 一次只渲染当前小节（文档站式：左栏切换、右侧单页），不再一页堆全部。 */
export function Sections(props: { active: SectionId }): ReturnType<typeof h> {
  const current = ALL_SECTIONS.find((s) => s.id === props.active) ?? ALL_SECTIONS[0]
  return h(
    'div',
    null,
    h(SectionHead, { id: current.id, title: t(current.titleKey) }),
    current.render(),
  )
}
