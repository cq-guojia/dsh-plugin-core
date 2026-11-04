// 官方对照：packages/client/ui-chat/src/client/chat/MessageItem.tsx（0.1.7-rc.2）
// 用户消息：userRow（右对齐，gap 6px）> userStack（宽 ≤ min(内容宽×.702, 82%)，gap 8px）
//          > bubble（background:--dsw-specific-bubble; radius-xl; padding:10px 16px; 14px/22px 行高）。
// 助手正文不走气泡：AssistantMarkdown（root 14px/24px，body 块间 gap 16px）。
// 重试/轮次失败/限长三件套同在官方 MessageItem.tsx（lib/client.js:1235-1338）：
//   ModelRetryItem   = <details.retryRow data-active> > summary.retrySummary > span.retryText
//                      + div.retryDetails（重试延迟 / 失败原因 两行，retryDetailLabel 标签）；
//                      active（retryState==='scheduled'）时摘要走渐隐 shimmer + 250ms 倒计时。
//   TurnErrorItem    = div.turnErrorRow（grid 10px/1fr/auto）> StateDot(error) + turnErrorCopy
//                      （标题红 600 + 原因灰）+ code.turnErrorCode（右侧机器路由码，如 SERVER）。
//   TurnMaxTokensItem= 同行结构，StateDot(warning) + maxTokensTitle（警示色）+ 提示语。
// 文案逐字抄官方词典（message.retry.* / message.turnError / message.maxTokens*，zh+en）。
import { createElement as h, useEffect, useMemo, useState } from 'react'
import {
  FileTypeIcon,
  fileExtension,
  fileSizeText,
  IconApiOutlineRegular,
  IconChevronDownOutlineRegular,
  IconChevronRightOutlineRegular,
  MarkdownText,
  StateDot,
  TextShimmer,
} from '../../ui/official.js'
import { officialClass } from '../official-classes.js'
import { markdownLabels } from '../../explorer/preview/md-labels.js'
import type { Translate } from '../../utils/i18n.js'

/** 助手正文：官方 MarkdownText 渲染 + 官方 AssistantMarkdown.root 类（fallback 自绘）。
 * U11：fileMentions 词表就位时行内 code 文件引用渲成可点链接（官方语义：resolve 不出保持惰性 code）。 */
export function AssistantMarkdown(props: {
  text: string
  /** 官方 streaming（节点 data.status === 'running'）：MarkdownText 按流式尾渲染。 */
  streaming?: boolean
  fileMentions?: { resolve(value: string): { open(): void; label: string; title: string } | undefined }
}): ReturnType<typeof h> {
  if (props.text.trim() === '') return h('span', null)
  return h('div', { className: officialClass('AssistantMarkdown', 'root') ?? '' },
    h(MarkdownText, {
      text: props.text,
      streaming: props.streaming,
      labels: markdownLabels(),
      fileMentions: props.fileMentions,
    }),
  )
}

/** 用户消息里的官方附件（file 块）：`FileAttachmentRef` 只有 id / 名字 / 字节数，**没有路径**。 */
export interface UserFileFace {
  name: string
  bytes: number
}

/**
 * 用户消息：官方 MessageItem userRow > userStack > bubble（右对齐气泡）
 * + 气泡下方的 **attachmentRow / fileCard**（官方 MessageItem 的附件行）。
 *
 * 官方附件卡 = 图标 + 文件名 + 大小；**不可点开**——引用里没有路径，宿主也没给出
 * 「按 attachmentId 打开」的公开面 ⇒ 如实降级为只读展示，不伪造打开行为。
 */
export function UserMessage(props: {
  text: string
  files?: readonly UserFileFace[]
  /** 官方 referenceLabels：用户 @ 引用的会话标签，气泡后单独一行（非 inline chips）。 */
  referenceLabels?: readonly string[]
  /** 官方 skillNames：本条消息用到的技能，气泡后单独一行（官方走文本工厂内联，此处近似）。 */
  skillNames?: readonly string[]
  t: Translate
}): ReturnType<typeof h> {
  const { text, files, referenceLabels, skillNames, t } = props
  const chips = files ?? []
  const references = referenceLabels ?? []
  const skills = skillNames ?? []
  return h('div', { className: officialClass('MessageItem', 'userRow') ?? '' },
    h('div', { className: officialClass('MessageItem', 'userStack') ?? '' },
      // 官方 UserContent：附件行在气泡**之前**（attachmentRow 先、bubble 后）。
      chips.length === 0
        ? null
        : h('div', {
            className: officialClass('MessageItem', 'attachmentRow') ?? '',
            'data-message-attachments': true,
          },
            chips.map((file, index) => h('span', {
              key: `${file.name}:${index}`,
              className: officialClass('MessageItem', 'fileCard') ?? '',
              title: file.name,
            },
              h(FileTypeIcon, {
                path: file.name,
                className: officialClass('MessageItem', 'fileIcon') ?? '',
              }),
              h('span', { className: officialClass('MessageItem', 'fileContent') ?? '' },
                h('span', { className: officialClass('MessageItem', 'fileName') ?? '' }, file.name),
                h('span', { className: officialClass('MessageItem', 'fileMeta') ?? '' },
                  [fileExtension(file.name).toUpperCase().slice(0, 8), fileSizeText(file.bytes)]
                    .filter(Boolean).join(' ')),
              ),
            )),
          ),
      text === ''
        ? null
        : h('div', { className: officialClass('MessageItem', 'bubble') ?? '' },
            h(MarkdownText, { text, labels: markdownLabels() })),
      // 官方 UserContent（lib/client.js:7377）：referenceLabels 在气泡**之后**单独一行。
      references.length === 0
        ? null
        : h('div', {
            className: officialClass('MessageItem', 'referenceSummary') ?? '',
          }, t('referenceSummary', { labels: references.join(t('referenceSeparator')) })),
      skills.length === 0
        ? null
        : h('div', {
            className: officialClass('MessageItem', 'referenceSummary') ?? '',
          }, t('skillSummary', { names: skills.join(t('skillSeparator')) })),
    ),
  )
}

/** 官方 CompactionNode 数据面（records.d.ts）。 */
export interface CompactionFace {
  shadowedItemCount?: number | null
  shadowedTokenCount?: number | null
  summary?: string | null
  title?: string
  fallbackSummary?: string | null
}

/**
 * 自动压缩节点（官方 CompactionItem，lib/client.js:4322-4390）：
 * compactionRow > compactionButton（disabled=不可展开）> leading(上下文图标 + 展开箭头) + title + sep + summary；
 * 展开体 = compactionBody > MarkdownText(压缩摘要)。
 */
export function CompactionItemMirror(props: { node: CompactionFace; t: Translate }): ReturnType<typeof h> {
  const { node, t } = props
  const [expanded, setExpanded] = useState(false)
  const summaryText = node.summary ?? null
  const expandable = summaryText !== null
  const open = expandable && expanded
  const items = node.shadowedItemCount ?? null
  const tokens = node.shadowedTokenCount ?? null
  const summary = items !== null && tokens !== null
    ? t('compactionCompleted', { items, tokens })
    : node.fallbackSummary ?? (expandable ? t('compactionExpand') : t('compactionUnavailable'))
  return h('div', { className: officialClass('MessageItem', 'compactionRow') ?? '' },
    h('button', {
      type: 'button',
      className: officialClass('MessageItem', 'compactionButton') ?? '',
      disabled: !expandable,
      'aria-expanded': expandable ? open : undefined,
      onClick: () => { setExpanded(value => !value) },
    },
      h('span', { className: officialClass('MessageItem', 'compactionLeading') ?? '', 'aria-hidden': true },
        h('span', {
          className: officialClass('MessageItem', 'compactionContextIcon') ?? '',
          'data-compaction-icon': 'context',
        }, h(IconApiOutlineRegular, {})),
        h('span', {
          className: officialClass('MessageItem', 'compactionDisclosureIcon') ?? '',
          'data-compaction-disclosure': open ? 'expanded' : 'collapsed',
        }, open ? h(IconChevronDownOutlineRegular, {}) : h(IconChevronRightOutlineRegular, {}))),
      h('span', { className: officialClass('MessageItem', 'compactionTitle') ?? '' }, node.title ?? t('compactionTitle')),
      h('span', { className: officialClass('MessageItem', 'compactionSep') ?? '', 'aria-hidden': true }),
      h('span', { className: officialClass('MessageItem', 'compactionSummary') ?? '' }, summary),
    ),
    open && summaryText !== null
      ? h('div', { className: officialClass('MessageItem', 'compactionBody') ?? '' },
          h(MarkdownText, { text: summaryText, labels: markdownLabels() }))
      : null,
  )
}

// ── 重试 / 轮次失败 / 限长三件套（官方 lib/client.js:1235-1338 逐字照抄）──

/** 重试节点消费面（官方 ModelRetryNode = LlmRetryEventData & {retryState}，records.d.ts:112）。 */
export interface RetryAttemptFace {
  retryState?: 'scheduled' | 'started' | 'cancelled'
  mode?: string
  retry?: number
  maxRetries?: number
  delayMs?: number
  failure?: { message?: string; code?: string } | null
}

/** 轮次失败节点消费面（官方 TurnErrorNode，records.d.ts:127）。 */
export interface TurnErrorFace {
  message?: string
  code?: string
}

/** 官方 retrySeconds（lib/client.js:1215）：下限 1 秒。 */
function retrySeconds(milliseconds: number): number {
  return Math.max(1, Math.ceil(milliseconds / 1_000))
}

/**
 * 官方 failureMessage（0.2.x lib/client.js:5278-5284）：已知机器码走本地化文案，其余原样展示。
 * 判定顺序逐字：ACCOUNT_SIGNED_OUT / INTERRUPTED / ACCOUNT_SIGN_IN_REQUIRED / QUOTA|ACCOUNT_QUOTA / AUTH。
 */
function failureMessage(message: string | undefined, code: string | undefined, t: Translate): string {
  if (code === 'ACCOUNT_SIGNED_OUT') return t('failureAccountSignedOut')
  if (code === 'INTERRUPTED') return t('failureInterrupted')
  if (code === 'ACCOUNT_SIGN_IN_REQUIRED') return t('failureAccountSignInRequired')
  if (code === 'QUOTA' || code === 'ACCOUNT_QUOTA') return t('failureQuota')
  return code === 'AUTH' ? t('failureAuth') : (message ?? '')
}

/**
 * 重试行（官方 ModelRetryItem）：折叠 = 「已重试模型请求 (5/5) · 9s ⌄」摘要；
 * 展开 = 重试延迟 / 失败原因 两行。active（等待重试）时官方走 250ms 倒计时 + 渐隐 shimmer。
 */
export function ModelRetryItemMirror(props: { node: RetryAttemptFace; active: boolean; t: Translate }): ReturnType<typeof h> {
  const { active, t } = props
  const node = props.node
  const delayMs = typeof node.delayMs === 'number' ? node.delayMs : 0
  // 官方 maximum：mode==='normal' 给 maxRetries，否则 ∞（mode 缺失且无 maxRetries 时按 ∞ 兜底）。
  const maximum = node.mode === 'normal' && typeof node.maxRetries === 'number'
    ? node.maxRetries
    : '∞'
  const deadline = useMemo(() => Date.now() + delayMs, [delayMs, node.retryState])
  const scheduledSeconds = retrySeconds(delayMs)
  const [countdown, setCountdown] = useState(() => ({ deadline, seconds: retrySeconds(deadline - Date.now()) }))
  const remainingSeconds = countdown.deadline === deadline
    ? countdown.seconds
    : retrySeconds(deadline - Date.now())
  useEffect(() => {
    if (!active) return
    const updateCountdown = (): number => {
      const next = retrySeconds(deadline - Date.now())
      setCountdown(current => current.deadline === deadline && current.seconds === next
        ? current
        : { deadline, seconds: next })
      return next
    }
    if (updateCountdown() === 1) return
    const timer = window.setInterval(() => {
      if (updateCountdown() === 1) window.clearInterval(timer)
    }, 250)
    return () => { window.clearInterval(timer) }
  }, [active, deadline])
  const label = active
    ? t('retryActive')
    : node.retryState === 'cancelled'
      ? t('retryCancelled')
      : node.retryState === 'started' ? t('retryStarted') : t('retryScheduled')
  const seconds = active ? remainingSeconds : scheduledSeconds
  const failure = node.failure
  return h('details', {
    className: officialClass('MessageItem', 'retryRow') ?? '',
    'data-active': active || undefined,
  },
    h('summary', { className: officialClass('MessageItem', 'retrySummary') ?? '' },
      h('span', {
        className: officialClass('MessageItem', 'retryText') ?? '',
        role: 'status',
      }, h(TextShimmer, { active },
        t('retryStatus', { label, retry: node.retry ?? 0, maximum, seconds }))),
    ),
    h('div', { className: officialClass('MessageItem', 'retryDetails') ?? '' },
      h('div', null,
        h('span', { className: officialClass('MessageItem', 'retryDetailLabel') ?? '' }, t('retryDelay')),
        t('durationMilliseconds', { milliseconds: Math.round(delayMs) }),
      ),
      h('div', null,
        h('span', { className: officialClass('MessageItem', 'retryDetailLabel') ?? '' }, t('retryFailure')),
        failureMessage(failure?.message, failure?.code, t),
      ),
    ),
  )
}

/** 轮次失败行（官方 TurnErrorItem）：红点 + 红标题「本轮运行失败」+ 灰原因 + 右侧机器码标签。 */
export function TurnErrorItemMirror(props: { node: TurnErrorFace; t: Translate }): ReturnType<typeof h> {
  const { node, t } = props
  return h('div', { className: officialClass('MessageItem', 'turnErrorRow') ?? '', role: 'status' },
    h(StateDot, {
      state: 'error',
      className: officialClass('MessageItem', 'turnErrorDot') ?? '',
    }),
    h('div', { className: officialClass('MessageItem', 'turnErrorCopy') ?? '' },
      h('span', { className: officialClass('MessageItem', 'turnErrorTitle') ?? '' },
        node.code === 'ACCOUNT_SIGNED_OUT' || node.code === 'INTERRUPTED' ? t('accountStopped') : t('turnErrorTitle'),
      ),
      h('span', { className: officialClass('MessageItem', 'turnErrorMessage') ?? '' },
        failureMessage(node.message, node.code, t),
      ),
    ),
    node.code !== undefined && node.code !== '' && node.code !== 'INTERRUPTED'
      ? h('code', { className: officialClass('MessageItem', 'turnErrorCode') ?? '' }, node.code)
      : null,
  )
}

/** 限长行（官方 TurnMaxTokensItem）：黄点 + 警示标题 + 截断提示。 */
export function TurnMaxTokensItemMirror(props: { t: Translate }): ReturnType<typeof h> {
  const { t } = props
  return h('div', { className: officialClass('MessageItem', 'turnErrorRow') ?? '', role: 'status' },
    h(StateDot, {
      state: 'warning',
      className: officialClass('MessageItem', 'turnErrorDot') ?? '',
    }),
    h('div', { className: officialClass('MessageItem', 'turnErrorCopy') ?? '' },
      h('span', { className: officialClass('MessageItem', 'maxTokensTitle') ?? '' }, t('maxTokensTitle')),
      h('span', { className: officialClass('MessageItem', 'turnErrorMessage') ?? '' }, t('maxTokensHint')),
    ),
  )
}
