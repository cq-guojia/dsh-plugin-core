// 官方对照：packages/client/ui-chat@0.2.2-alpha.3 lib/client.js:8668-8730（TurnProcessNodeView）
// root（button，高 calc(33px + delta)、border-bottom .5px border-l2、padding 0 0 8px、flex）
//   :disabled{cursor:default} / :hover:not(:disabled){color:secondary} / [data-open] 内 chevron 旋转 180°
//   > label（13px，ellipsis）> chevron（14px，color:inherit）
// label：stopped（aborted/interrupted）→「已停止」；error →「处理失败」；
//   有时长 →「已完成，用时 」+ duration parts（数字段套 durationNumber 等宽数字）；无时长 →「已完成」。
// ⚠ 0.2.x 起 turn 未关闭时**整块不渲染**（`turn?.status !== "closed"` return null）——
//   运行中的「深度求索中，用时 N 秒 ···」改由 ChatView 的 RunningStatus 在流末尾单独一行显示
//   （见 RunningStatus.ts）。别再把 running 分支加回来，否则与官方重叠出两行。
import { Fragment, createElement as h } from 'react'
import { IconChevronDownOutlineRegular } from '../../ui/official.js'
import { officialClass } from '../official-classes.js'
import type { Translate } from '../../utils/i18n.js'
import type { TurnLocationFace, TurnProcessHandle } from './ChatNodeSeat.js'
import { formatRunDuration } from './message-chrome.js'

/** Turn 过程行：折叠时只有 label + 箭头；点开由外层 seat 把过程节点放出来。 */
export function TurnProcessNodeViewMirror(props: {
  turn: TurnLocationFace | undefined
  turnProcess: TurnProcessHandle
  t: Translate
}): ReturnType<typeof h> | null {
  const { turn, turnProcess, t } = props
  if (turn === undefined || turn.status !== 'closed') return null
  const open = !turnProcess.foldable || turnProcess.open
  const canCollapse = turnProcess.foldable && turnProcess.hasContent && !turnProcess.alwaysOpen
  const reason = turn.end?.data?.reason?.kind
  const stopped = reason === 'aborted' || reason === 'interrupted'
  const elapsedMs = turn.start === undefined || turn.end === undefined
    ? undefined
    : Math.max(1_000, turn.end.time - turn.start.time)
  const duration = elapsedMs === undefined || stopped || reason === 'error'
    ? undefined
    : formatRunDuration(elapsedMs, t)
  const label = stopped ? t('turnStopped')
    : reason === 'error' ? t('turnProcessFailed')
      : duration === undefined ? t('turnProcessWorked') : t('turnProcessTook')
  const durationNumberClass = officialClass('TurnProcessNodeView', 'durationNumber') ?? undefined
  const spec = turnProcess.spec
  return h(Fragment, null,
    h('span', {
      className: officialClass('accessibility', 'visuallyHidden') ?? '',
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    }, stopped ? t('turnStopped') : reason === 'error' ? t('turnProcessFailed') : t('turnProcessWorked')),
    h('button', {
      type: 'button',
      className: officialClass('TurnProcessNodeView', 'root') ?? '',
      'data-open': open || undefined,
      'data-turn-process': spec?.turn,
      'data-turn-process-messages': spec?.messageCount,
      'data-turn-process-tool-calls': spec?.toolCallCount,
      'data-turn-process-subagents': spec?.subagentCount,
      disabled: !canCollapse,
      'aria-expanded': turnProcess.hasContent ? open : undefined,
      onClick: (): void => { turnProcess.setOpen(!open) },
    },
      h('span', { className: officialClass('TurnProcessNodeView', 'label') ?? '' },
        label,
        duration?.map((part, index) => h('span', {
          key: index,
          className: part.numeric ? durationNumberClass : undefined,
        }, part.text)),
      ),
      canCollapse
        ? h(IconChevronDownOutlineRegular, { className: officialClass('TurnProcessNodeView', 'chevron') ?? '' })
        : null,
    ),
  )
}
