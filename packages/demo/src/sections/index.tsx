import { createElement as h, type ReactNode } from 'react'
import { Surface } from '../../../../dist/ui/index.js'
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
  FlipTextPage,
  InputPage,
  LayoutPage,
  PickerPage,
  TooltipPage,
} from './controls.js'
import { ExplorerPage, SessionPage } from './blocks.js'
import { TablePage } from './tables.js'
import { ToolbarPage } from './toolbar.js'
import { PaginationPage } from './navigation.js'
import { TaskNotificationsPage } from './task-notifications.js'
import { DatePage, HttpPage, I18nPage, NumberPage, TextPage } from './utils.js'
import { ReferencePage } from './reference.js'
import { Example } from '../doc.js'

/**
 * 两级目录：第一层（group）是能力域，不可点；第二层（id）是一个可看页。
 * 分类规则见 docs/design/structure.md（区 → 类 → 控件）；一级固定 5 个，二级按「类」成页。
 */
export type SectionGroup = 'start' | 'infra' | 'components' | 'blocks' | 'utils'

export type SectionId =
  | 'help-index'
  | 'quickstart'
  | 'reference'
  | 'foundation'
  | 'task-notifications'
  | 'actions'
  | 'inputs'
  | 'display'
  | 'feedback'
  | 'layout'
  | 'navigation'
  | 'explorer'
  | 'session'
  | 'date'
  | 'text'
  | 'number'
  | 'http'
  | 'i18n'

export interface SectionDef {
  id: SectionId
  group: SectionGroup
  titleKey: DemoMessageKey
  render: () => ReturnType<typeof h>
}

/** 第一层：顺序即侧栏顺序。 */
export const SECTION_GROUPS: { id: SectionGroup; titleKey: DemoMessageKey }[] = [
  { id: 'start', titleKey: 'grpStart' },
  { id: 'infra', titleKey: 'grpInfra' },
  { id: 'components', titleKey: 'grpComponents' },
  { id: 'blocks', titleKey: 'grpBlocks' },
  { id: 'utils', titleKey: 'grpUtils' },
]

/** 把几页顺序串成一页（合并后的二级页就是这么来的，旧页面组件原样复用）。 */
const stack = (...pages: (() => ReturnType<typeof h>)[]): (() => ReturnType<typeof h>) => () =>
  h('div', null, ...pages.map((Page) => h(Page, { key: Page.name })))

/** 全部二级页（顺序即组内顺序）；侧栏与右侧渲染共用同一份目录（单一事实源）。 */
export const ALL_SECTIONS: SectionDef[] = [
  // ① 入门：帮助索引 → 快速开始 → 参考
  { id: 'help-index', group: 'start', titleKey: 'secHelpIndex', render: () => h(HelpIndexPage, null) },
  { id: 'quickstart', group: 'start', titleKey: 'secQuickstart', render: () => h(QuickstartPage, null) },
  { id: 'reference', group: 'start', titleKey: 'secReference', render: () => h(ReferencePage, null) },

  // ② 基础设施
  { id: 'foundation', group: 'infra', titleKey: 'secFoundation', render: () => h(FoundationPage, null) },
  { id: 'task-notifications', group: 'infra', titleKey: 'secTaskNotifications', render: () => h(TaskNotificationsPage, null) },

  // ③ 控件：一页一类，页内按控件族顺序排列
  { id: 'actions', group: 'components', titleKey: 'secActions', render: () => h(ButtonPage, null) },
  { id: 'inputs', group: 'components', titleKey: 'secInputs', render: stack(InputPage, PickerPage, DateTimePage) },
  {
    id: 'display',
    group: 'components',
    titleKey: 'secDisplay',
    render: stack(CardPage, ChipPage, FlipTextPage, TooltipPage, TablePage),
  },
  { id: 'feedback', group: 'components', titleKey: 'secFeedback', render: () => h(FeedbackPage, null) },
  { id: 'layout', group: 'components', titleKey: 'secLayout', render: stack(LayoutPage, ToolbarPage) },
  { id: 'navigation', group: 'components', titleKey: 'secNavigation', render: () => h(PaginationPage, null) },

  // ④ 应用模块
  { id: 'explorer', group: 'blocks', titleKey: 'secExplorer', render: () => h(ExplorerPage, null) },
  { id: 'session', group: 'blocks', titleKey: 'secSession', render: () => h(SessionPage, null) },

  // ⑤ 工具方法
  { id: 'date', group: 'utils', titleKey: 'secDate', render: () => h(DatePage, null) },
  { id: 'text', group: 'utils', titleKey: 'secText', render: () => h(TextPage, null) },
  { id: 'number', group: 'utils', titleKey: 'secNumber', render: () => h(NumberPage, null) },
  { id: 'http', group: 'utils', titleKey: 'secHttp', render: () => h(HttpPage, null) },
  { id: 'i18n', group: 'utils', titleKey: 'secI18n', render: () => h(I18nPage, null) },
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
    Surface,
    {
      tone: 'sunken',
      border: 'dashed',
      padding: 'lg',
      style: { marginTop: '4px', marginBottom: '16px', color: 'var(--dshpc-fg-3)' },
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
    h('div', { style: { height: '3px', width: '36px', background: 'var(--dshpc-business)', borderRadius: 'var(--dshpc-radius-xs)', marginTop: '6px' } }),
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
