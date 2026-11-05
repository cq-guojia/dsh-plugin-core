// 官方对照：ui-chat@0.2.1-rc.5 lib/client.js:4967-5050（ContextInjectionRow）+ 4530-4540（OpaqueBody）。
// 折叠行 = DisclosureRow（图标 + 标题「上下文注入」/「跨会话召回」+ producer 来源）；
// 展开体 = 模型面向文本（content 里的 text 块拼成 pre[data-context-text]）。
// shortcut: form 细分（instructions/catalog/snapshot/notice/relay/recall 各带 Body + source 解析）未复刻，
//   一律走 opaque 文本；这些 form 低频，等确实需要精确还原时再补。
import { Fragment, createElement as h, useState } from 'react'
import { DisclosureRow, IconBrowseOutlineRegular, IconContextInjectionOutlineRegular } from '../../../ui/official.js'
import { officialClass } from '../official-classes.js'
import type { Translate } from '../../../utils/i18n.js'
import { modelFacingRuns } from './TurnTriggerNodeView.js'

/** 官方 ContextNode 数据面（content / source / producer / form）。 */
export interface ContextFace {
  content?: readonly unknown[]
  source?: unknown
  producer?: { role?: string; label?: string | null } | null
  form?: string | null
}

/** 系统注入上下文行（官方 ContextInjectionRow 的 opaque 版）。 */
export function ContextInjectionRowMirror(props: { node: ContextFace; t: Translate }): ReturnType<typeof h> {
  const { node, t } = props
  const [open, setOpen] = useState(false)
  const content = Array.isArray(node.content) ? node.content : []
  const producer = node.producer ?? null
  const label = producer?.label ?? null
  const toolBlocks = content.length > 0 && content.every(block => {
    const type = (block as { type?: string } | null)?.type
    return type === 'tool-addition' || type === 'tool-removal'
  })
  return h(DisclosureRow, {
    className: officialClass('ContextInjectionRow', 'root') ?? '',
    icon: toolBlocks
      ? h(IconBrowseOutlineRegular, { size: 14 })
      : h(IconContextInjectionOutlineRegular, { size: 14 }),
    chevronClassName: officialClass('ContextInjectionRow', 'chevron') ?? '',
    title: t(producer?.role === 'recall' ? 'contextRecall' : 'contextInjection'),
    collapsedContent: label === null
      ? undefined
      : h(Fragment, null,
          h('span', { className: officialClass('ContextInjectionRow', 'sep') ?? '', 'aria-hidden': true }),
          h('span', {
            className: officialClass('ContextInjectionRow', 'source') ?? '',
            'data-context-source': true,
          }, label)),
    keepContentWhenOpen: true,
    open,
    expandable: true,
    expandOnRowClick: true,
    onToggle: () => { setOpen(value => !value) },
    children: h('div', {
      className: officialClass('ContextInjectionRow', 'body') ?? '',
      'data-context-injection-body': true,
      'data-context-form': node.form ?? undefined,
    },
      modelFacingRuns(content, t).map((text, index) => h('pre', {
        key: index,
        className: officialClass('ContextBody', 'text') ?? '',
        'data-context-text': true,
      }, text))),
  })
}
