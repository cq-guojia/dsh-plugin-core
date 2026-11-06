// 官方对照：@deepseek-ai/dsh-client-ui-chat@0.2.2-rc.1
//   lib/client.js:5715-5812（ContextInjectionRow）+ 5190-5713（ContextBody 各 form 体，见 ContextBody.ts）。
// 折叠行 = DisclosureRow（图标 + 标题「上下文注入」/「跨会话召回」/「工具已更新」+ 分隔点 + 来源 / 摘要）；
// 展开体 = 按 producer 声明的 form 分派（正文见 ContextBody.ts）；工具增删块（tool-addition /
// tool-removal）单独一列，标题与展开体都换成人话的「已添加工具：x / 新增 N 个」。
import { Fragment, createElement as h, useState } from 'react'
import { DisclosureRow, IconBrowseOutlineRegular, IconContextInjectionOutlineRegular } from '../../../ui/official.js'
import { officialClass } from '../official-classes.js'
import type { Translate } from '../../../utils/i18n.js'
import { contextBodyView } from './ContextBody.js'

/** 官方 ContextNode 数据面（content / source / producer / form）。 */
export interface ContextFace {
  content?: readonly unknown[]
  source?: unknown
  producer?: { role?: string; label?: string | null } | null
  form?: string | null
}

/** 官方工具增删块（ContextNode content 里的 tool-addition / tool-removal）。 */
interface ToolChangeBlock {
  type?: string
  toolName?: string
}

/** 折叠行的标题 / 汇总事实（纯函数，冒烟可直接断言）。 */
export interface ContextRowFacts {
  /** 全部内容块都是工具增删块时给出的块集合。 */
  toolBlocks: readonly ToolChangeBlock[] | undefined
  added: string[]
  removed: string[]
  /** 单块时的那一个（标题说清是哪个，行不可展开）。 */
  single: ToolChangeBlock | undefined
  title: string
  /** 折叠行的一行汇总：工具增删多条时有值。 */
  summary: string | null
}

/** 官方 ContextInjectionRow 的标题与汇总口径（纯函数）。 */
export function contextRowFacts(
  content: readonly unknown[],
  producerRole: string | undefined,
  t: Translate,
): ContextRowFacts {
  const toolBlocks = content.length > 0 && content.every(block => {
    const type = (block as ToolChangeBlock | null)?.type
    return type === 'tool-addition' || type === 'tool-removal'
  })
    ? content as readonly ToolChangeBlock[]
    : undefined
  const added = (toolBlocks ?? []).flatMap(block => (block.type === 'tool-addition' && typeof block.toolName === 'string' ? [block.toolName] : []))
  const removed = (toolBlocks ?? []).flatMap(block => (block.type === 'tool-removal' && typeof block.toolName === 'string' ? [block.toolName] : []))
  const single = toolBlocks?.length === 1 ? toolBlocks[0] : undefined
  // 官方 toolSummary：单条不带计数（标题已经说清是哪一个）；多条按增 / 删 / 双向给一行汇总。
  const summary = toolBlocks === undefined || single !== undefined
    ? null
    : added.length > 0 && removed.length > 0
      ? t('toolsChanged', { added: added.length, removed: removed.length })
      : added.length > 0 ? t('toolsAddedCount', { count: added.length }) : t('toolsRemovedCount', { count: removed.length })
  const title = single !== undefined
    ? t(single.type === 'tool-addition' ? 'toolAdded' : 'toolRemoved', { name: single.toolName ?? '' })
    : t(toolBlocks !== undefined ? 'toolsUpdated' : producerRole === 'recall' ? 'contextRecall' : 'contextInjection')
  return { toolBlocks, added, removed, single, title, summary }
}

/** 系统注入上下文行（官方 ContextInjectionRow 镜像）。 */
export function ContextInjectionRowMirror(props: { node: ContextFace; t: Translate }): ReturnType<typeof h> {
  const { node, t } = props
  const [open, setOpen] = useState(false)
  const content = Array.isArray(node.content) ? node.content : []
  const producer = node.producer ?? null
  const label = producer?.label ?? null
  const { rendered, summary: bodySummary, body } = contextBodyView({ form: node.form, content, source: node.source, t })
  const { toolBlocks, added, removed, single, title, summary } = contextRowFacts(content, producer?.role, t)
  const sep = (key: string): ReturnType<typeof h> =>
    h('span', { key, className: officialClass('ContextInjectionRow', 'sep') ?? '', 'aria-hidden': true })
  const collapsedContent = summary !== null
    ? h(Fragment, null,
        sep('sep'),
        h('span', { className: officialClass('ContextInjectionRow', 'summary') ?? '' }, summary))
    : toolBlocks !== undefined || label === null
      ? undefined
      : h(Fragment, null,
          sep('sep'),
          h('span', {
            className: officialClass('ContextInjectionRow', 'source') ?? '',
            'data-context-source': true,
          }, label),
          bodySummary === null
            ? null
            : h(Fragment, null,
                sep('sep2'),
                h('span', {
                  className: officialClass('ContextInjectionRow', 'summary') ?? '',
                  'data-context-summary': true,
                }, bodySummary)))
  return h(DisclosureRow, {
    className: officialClass('ContextInjectionRow', 'root') ?? '',
    icon: toolBlocks === undefined
      ? h(IconContextInjectionOutlineRegular, { size: 14 })
      : h(IconBrowseOutlineRegular, { size: 14 }),
    chevronClassName: officialClass('ContextInjectionRow', 'chevron') ?? '',
    title,
    collapsedContent,
    keepContentWhenOpen: true,
    // 单条工具变更没有展开体（官方 single !== undefined ⇒ expandable false）。
    open: open && single === undefined,
    expandable: single === undefined,
    expandOnRowClick: true,
    onToggle: () => { setOpen(value => !value) },
    children: h('div', {
      className: officialClass('ContextInjectionRow', 'body') ?? '',
      'data-context-injection-body': true,
      'data-context-form': rendered ?? undefined,
    },
      toolBlocks === undefined
        ? body
        : h('div', { className: officialClass('ContextInjectionRow', 'toolChanges') ?? '' },
            added.length > 0 ? h('div', null, t('toolsAdded', { names: added.join(', ') })) : null,
            removed.length > 0 ? h('div', null, t('toolsRemoved', { names: removed.join(', ') })) : null)),
  })
}
