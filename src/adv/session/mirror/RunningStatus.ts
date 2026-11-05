// 官方对照：ui-chat@0.2.1-rc.5 lib/client.js:5580-5638（RunningWhaleTail + RunningStatus；
// 0.2.2-alpha.3 仅多 paused/holding 两个占位参数，默认渲染同构）
// root div.running[data-chat-running]
//   > visuallyHidden(role=status) > runningDivider（.5px 顶部横线，官方 CSS 按「前一项是否 tail」显隐）
//   > runningContent > runningIcon（鲸尾：animated APNG mask + still SVG 兜底）+ TextShimmer（label）
// label：startTime 缺失 =「深度求索中」；否则「深度求索中，用时 {duration} ···」（duration = formatRunDuration）。
// ⚠ 0.2.x 起运行态只由这一行代表：turn 未关闭时官方 TurnProcessNodeView 整块不渲染（见 TurnProcessNodeView.ts）。
import { createElement as h, useEffect, useState } from 'react'
import { TextShimmer } from '../../../ui/official.js'
import { officialClass } from '../official-classes.js'
import type { Translate } from '../../../utils/i18n.js'
import { durationText, formatRunDuration } from './message-chrome.js'

/** 官方 LIVE_RUN_CLOCK_INTERVAL_MS（lib/client.js:979）。 */
const LIVE_RUN_CLOCK_INTERVAL_MS = 1_000

/** 官方静态兜底 SVG 的鲸尾路径（lib/client.js:6340 REST_PATH，16×16）。 */
const REST_PATH = 'M8.844 13.742C8.967 12.328 8.45 10.4 8.45 9.65C8.45 8.94 8.88 8.43 9.6 8.43C11.285 8.43 12.106 8.281 12.685 8.104C13.71 7.791 14.585 6.768 15.055 5.945C15.137 5.803 14.99 5.641 14.829 5.671C13.829 5.86 12.828 5.376 11.827 4.978C10.659 4.514 9.491 4.707 8.935 4.876C8.805 4.915 8.658 4.819 8.636 4.686C8.468 3.643 7.405 2.615 5.498 2.238C4.54 2.048 3.748 1.574 3.347 1.202C3.252 1.113 3.088 1.125 3.03 1.242C2.628 2.059 2.168 3.82 5.248 6.115C5.82 6.494 6.31 6.785 6.574 7.637C6.72 8.104 6.157 9.168 6.061 9.368C5.157 11.27 5.089 12.19 4.926 13.742'

/** 官方 RunningWhaleTail：APNG mask 动画（官方 CSS 提供资源）+ 静态 SVG 兜底。 */
function RunningWhaleTail(): ReturnType<typeof h> {
  return h('span', { className: officialClass('ChatView', 'runningIcon') ?? '', 'aria-hidden': 'true' },
    h('span', { className: officialClass('ChatView', 'runningWhaleAnimated') ?? '' }),
    h('svg', {
      className: officialClass('ChatView', 'runningWhaleStill') ?? '',
      width: '100%',
      height: '100%',
      viewBox: '0 0 16 16',
      fill: 'none',
    }, h('path', { d: REST_PATH, stroke: 'currentColor', strokeWidth: 1 })),
  )
}

/**
 * 运行中状态行：会话流末尾一行「深度求索中，用时 N 秒 ···」（蓝色 shimmer）。
 * @param startTime - 当前 turn 开始时间；undefined = 尚未起轮（只显示「深度求索中」）。
 * @param t - 翻译席位。
 */
export function RunningStatusMirror(props: {
  startTime: number | undefined
  t: Translate
}): ReturnType<typeof h> {
  const { startTime, t } = props
  const [now, setNow] = useState<number>(() => Date.now())
  useEffect(() => {
    if (startTime === undefined) return
    setNow(Date.now())
    const timer = setInterval(() => { setNow(Date.now()) }, LIVE_RUN_CLOCK_INTERVAL_MS)
    return () => { clearInterval(timer) }
  }, [startTime])
  const label = startTime === undefined
    ? t('chatDeepDiving')
    : t('chatDeepDivingFor', { duration: durationText(formatRunDuration(Math.max(1_000, now - startTime), t)) })
  return h('div', {
    className: officialClass('ChatView', 'running') ?? '',
    'data-chat-running': true,
  },
    h('span', {
      className: officialClass('accessibility', 'visuallyHidden') ?? '',
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    }, t('chatDeepDiving')),
    h('span', { className: officialClass('ChatView', 'runningDivider') ?? '', 'aria-hidden': 'true' }),
    h('span', { className: officialClass('ChatView', 'runningContent') ?? '' },
      h(RunningWhaleTail, null),
      h(TextShimmer, {
        active: true,
        className: officialClass('ChatView', 'runningText') ?? '',
      }, label),
    ),
  )
}
