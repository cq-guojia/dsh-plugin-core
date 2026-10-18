import { createElement as h, type ReactNode } from 'react'
import { DesignSection } from './design.js'
import { ButtonsSection } from './buttons.js'
import { PickersSection } from './pickers.js'
import { FeedbackSection } from './feedback.js'
import { DisplaySection } from './display.js'
import { UtilsSection } from './utils.js'
import { ExplorerSection } from './explorer.js'
import { SessionSection } from './session.js'

export type SectionId =
  | 'design'
  | 'buttons'
  | 'pickers'
  | 'feedback'
  | 'display'
  | 'utils'
  | 'explorer'
  | 'session'

export interface SectionsProps {
  active: SectionId
  onNavigate: (id: SectionId) => void
}

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
        border: '1px solid var(--tdt-border-faint)', borderRadius: '8px',
        background: 'var(--tdt-surface-1)',
      },
    },
    h('h3', { style: { margin: '0 0 2px', fontSize: '15px' } }, props.title),
    props.hint === undefined
      ? null
      : h('div', { style: { color: 'var(--tdt-fg-3)', fontSize: '12px', marginBottom: '12px' } }, props.hint),
    h('div', { style: { marginBottom: props.code === undefined ? 0 : '12px' } }, props.children ?? null),
    props.code === undefined
      ? null
      : h(
          'pre',
          {
            style: {
              margin: 0, padding: '10px 12px', borderRadius: '6px', overflowX: 'auto',
              background: 'var(--tdt-code-surface)', color: 'var(--tdt-fg)',
              font: 'var(--tdt-code-font)', fontSize: '12px',
            },
          },
          props.code,
        ),
  )
}

function SectionHead(props: { id: SectionId; title: string }): ReturnType<typeof h> {
  return h(
    'div',
    { id: `sec-${props.id}`, style: { margin: '28px 0 14px' } },
    h('h2', { style: { margin: 0, fontSize: '20px' } }, props.title),
    h('div', { style: { height: '3px', width: '36px', background: 'var(--tdt-business)', borderRadius: '2px', marginTop: '6px' } }),
  )
}

/** 全部小节（顺序即目录顺序）；预览站导航与**插件内预览页**共用同一份目录（单一事实源）。 */
export const ALL_SECTIONS: { id: SectionId; title: string; render: () => ReturnType<typeof h> }[] = [
  { id: 'design', title: '设计基础', render: () => h(DesignSection, null) },
  { id: 'buttons', title: '按钮与输入', render: () => h(ButtonsSection, null) },
  { id: 'pickers', title: '选择器', render: () => h(PickersSection, null) },
  { id: 'feedback', title: '弹窗与反馈', render: () => h(FeedbackSection, null) },
  { id: 'display', title: '卡片与展示', render: () => h(DisplaySection, null) },
  { id: 'utils', title: '通用方法', render: () => h(UtilsSection, null) },
  { id: 'explorer', title: '工作区浏览', render: () => h(ExplorerSection, null) },
  { id: 'session', title: '会话预览', render: () => h(SessionSection, null) },
]

/** 一次只渲染当前小节（文档站式：左栏切换、右侧单页），不再一页堆全部。 */
export function Sections(props: SectionsProps): ReturnType<typeof h> {
  const current = ALL_SECTIONS.find((s) => s.id === props.active) ?? ALL_SECTIONS[0]
  return h(
    'div',
    null,
    h(SectionHead, { id: current.id, title: current.title }),
    current.render(),
  )
}
