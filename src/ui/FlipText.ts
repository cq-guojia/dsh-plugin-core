/**
 * 翻牌文本 —— 一行文字，换字时旧的上移出、新的从下进（机场翻牌那种）。
 *
 * 与 `MarqueeText` 的分工：跑马灯（三点省略 + hover 滚）由它负责，本组件只管「换字动效 + 裁剪」，
 * 所以两层叠放的每一层就是一个 `MarqueeText`，不重复实现测宽。
 *
 * 宽度三档与 `Button` / `Chip` 同一口径：`width` 优先，`width` 未设时 `minWidth` / `maxWidth` 生效。
 * 全不传 = 随父容器（flex 子项自然伸缩），这也是弹窗 footer 里的用法。
 *
 * 空串 = 没有文案：不渲染、不占位。所以「同一块地方复用」时传 `''` 就把上一句清干净了，
 * 之后第一次给值是从无到有，直接出现（没有上一句可翻）。
 */
import { createElement as h, useEffect, useState, type CSSProperties, type ReactElement } from 'react'
import { ensureComponentStyles } from './css.js'
import { FLIP_CSS } from './flip-css.js'
import { MarqueeText } from './MarqueeText.js'

/** 与 flip.css 的 --dshpc-flip-dur（260ms）对齐，留一点余量给慢帧。 */
const FLIP_MS = 300

export interface FlipTextProps {
  /** 当前文本。变了就翻一次；没变不动（同一句重复设置不会重播）；空串 = 无文案。 */
  text: string
  /** 定宽（px 或任意 CSS 宽度）；给了即忽略 minWidth / maxWidth。 */
  width?: number | string
  /** 最小宽（width 未设时生效）。 */
  minWidth?: number | string
  /** 最大宽（width 未设时生效）；超出折叠成省略号，hover 以跑马灯展开。 */
  maxWidth?: number | string
  /** 追加 class（只允许补字体 / 颜色这类皮肤）。 */
  className?: string
}

/** 当前帧 + 上一帧；`seq` 只用来换 key，让两层每次都重新挂载、动效从头播。 */
export interface FlipSlot {
  curr: string
  prev: string | null
  seq: number
}

/**
 * 换字推导：文本没变原样返回（同一句重复设置不重播）；变了把当前帧降为上一帧、seq+1。
 * 上一帧是空串 ⇒ 不设 prev：第一句直接出现，不从下方翻上来。
 */
export function nextFlipSlot(slot: FlipSlot, text: string): FlipSlot {
  if (slot.curr === text) return slot
  return { curr: text, prev: slot.curr === '' ? null : slot.curr, seq: slot.seq + 1 }
}

export function FlipText(props: FlipTextProps): ReactElement | null {
  ensureComponentStyles('flip', FLIP_CSS)
  const [slot, setSlot] = useState<FlipSlot>({ curr: props.text, prev: null, seq: 0 })
  // 换字在 render 期调整（React 官方推荐的「props 变了就调 state」写法）：
  // 同一次渲染就带上新值，不会先按旧帧画一屏再动画。
  const next = nextFlipSlot(slot, props.text)
  if (next !== slot) setSlot(next)

  // 旧帧到点就摘。用定时器而不是 animationend：reduced-motion 下动画被关掉，
  // 事件永远不会来，旧帧会一直压在新帧上（同格叠放，两层都可见）。
  useEffect(() => {
    if (slot.prev === null) return undefined
    const id = window.setTimeout(() => setSlot((s) => (s.prev === null ? s : { ...s, prev: null })), FLIP_MS)
    return () => window.clearTimeout(id)
  }, [slot.seq, slot.prev])

  if (props.text === '') return null

  const style: CSSProperties =
    props.width !== undefined
      ? { width: props.width }
      : { minWidth: props.minWidth, maxWidth: props.maxWidth }

  const item = 'dshpc-flip__item'
  return h(
    'span',
    { className: props.className === undefined ? 'dshpc-flip' : `dshpc-flip ${props.className}`, style },
    // 旧帧：只在换字后存在，到点摘掉
    slot.prev === null
      ? null
      : h('span', { key: `p${String(slot.seq)}`, className: `${item} dshpc-flip__out` }, h(MarqueeText, { text: slot.prev })),
    // 新帧：没有上一帧（首帧 / 从无到有）不放动画
    h(
      'span',
      { key: `c${String(slot.seq)}`, className: slot.prev === null ? item : `${item} dshpc-flip__in` },
      h(MarqueeText, { text: slot.curr }),
    ),
  )
}
