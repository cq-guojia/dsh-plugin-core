import { createElement as h, type ReactNode } from 'react'
import type { DemoMessageKey } from '../i18n.js'
import { t } from '../i18n.js'
import { QuickstartPage, HelpIndexPage } from './start.js'
import { FoundationPage } from './foundation.js'
import {
  ButtonPage,
  CardPage,
  ChipPage,
  DateTimePage,
  FeedbackPage,
  InputPage,
  LayoutPage,
  PickerPage,
  TooltipPage,
} from './controls.js'
import { ExplorerPage, SessionPage } from './blocks.js'
import { TablePage } from './tables.js'
import { DatePage, HttpPage, I18nPage, NumberPage, TextPage } from './utils.js'
import { ReferencePage } from './reference.js'
import { Example } from '../doc.js'

/**
 * 两级目录：第一层（group）是能力域的纯标题，不可点；第二层（id）是一个可看页。
 * 一级刻意压到 5 个 —— 侧栏条目一多就糊成一团，看不出来分区。
 */
export type SectionGroup = 'start' | 'components' | 'blocks' | 'utils' | 'reference'

export type SectionId =
  | 'help-index'
  | 'quickstart'
  | 'foundation'
  | 'button'
  | 'input'
  | 'picker'
  | 'datetime'
  | 'tooltip'
  | 'card'
  | 'chip'
  | 'table'
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
  // 入门：帮助索引（读哪一份）在前，然后是快速开始与设计基础
  { id: 'help-index', group: 'start', titleKey: 'secHelpIndex', render: () => h(HelpIndexPage, null) },
  { id: 'quickstart', group: 'start', titleKey: 'secQuickstart', render: () => h(QuickstartPage, null) },
  { id: 'foundation', group: 'start', titleKey: 'secFoundation', render: () => h(FoundationPage, null) },

  { id: 'button', group: 'components', titleKey: 'secButton', render: () => h(ButtonPage, null) },
  { id: 'input', group: 'components', titleKey: 'secInput', render: () => h(InputPage, null) },
  { id: 'picker', group: 'components', titleKey: 'secPicker', render: () => h(PickerPage, null) },
  { id: 'datetime', group: 'components', titleKey: 'secDateTime', render: () => h(DateTimePage, null) },
  { id: 'tooltip', group: 'components', titleKey: 'secTooltip', render: () => h(TooltipPage, null) },
  { id: 'card', group: 'components', titleKey: 'secCard', render: () => h(CardPage, null) },
  { id: 'chip', group: 'components', titleKey: 'secChip', render: () => h(ChipPage, null) },
  { id: 'table', group: 'components', titleKey: 'secTable', render: () => h(TablePage, null) },
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

/**
 * 一个 demo 块：直接就是文档骨架里的 `Example`（标题 + 一句话 + 左示例右代码）。
 * 旧页都在用它 —— 换成同一个实现后，所有页立刻吃到文档站式布局；
 * 逐页补 `code` / 备注 / API 表时不用再动这一层。
 */
export function Demo(props: {
  title: string
  hint?: string
  children?: ReactNode
  code?: string
}): ReturnType<typeof h> {
  return h(Example, props)
}

/**
 * 空位：这一页该有但还没有的东西，画一个灰框把清单写在里面。
 * 用意是让「还有什么没做」看得见 —— 业务空态（无数据占位）不归它管。
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
