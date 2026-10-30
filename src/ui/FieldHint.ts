/**
 * 问号提示 —— **全站唯一实现、独立组件**（L2，P4）
 *
 * ⚠️ 它**不属于 Input 家族**：任何地方都能挂——表单行尾、标题后面、卡片角落……
 * 调用点自己把它排进自己的 flex / label 里即可（组件只是 14px 的内联图标 + 气泡）。
 *
 * 气泡渲染 = **官方 Tooltip 本体**（2026-10-19 用户拍板「必须和悬停提示用同一个」）：
 * 插件启动时 `setTooltipRenderer` 把官方 Tooltip 交给 core，本组件直接走它。
 * ⚠️ **不做降级兜底**（用户同日明确：宿主内官方包恒在；官方改版 = 我们重新适配，不另造一套）。
 * 未注入 renderer 的环境（node 自检）只出问号图标、没有气泡——那是非宿主环境，不是产品形态。
 */
import { getTooltipRenderer } from './tooltip.js'
import { createElement as h, type CSSProperties } from 'react'
import { ensureComponentStyles } from './css.js'
import { HINT_CSS } from './controls-css.js'

export interface FieldHintProps {
  /** 气泡里的说明文字（也是读屏播报的 aria-label）；`\n` 是真实换行。 */
  text: string
  /** 气泡方位（走官方；默认 top）。 */
  side?: 'top' | 'bottom' | 'right'
  /** 上 / 下气泡的水平对齐（走官方）。 */
  align?: 'center' | 'end'
  /** 气泡宽度上限 px（走官方）。 */
  maxWidth?: number
  /** 追加 class。 */
  className?: string
  /** 追加样式（只允许补布局）。 */
  style?: CSSProperties
}

/** 问号提示图标：hover / focus 浮出说明气泡（官方 Tooltip 渲染）。 */
export function FieldHint(props: FieldHintProps): ReturnType<typeof h> {
  ensureComponentStyles('hint', HINT_CSS)
  const { text, side, align, maxWidth, className, style } = props
  // 官方往子元素挂 ref / 事件 ⇒ 锚点必须是真实 DOM 元素（兄弟仓踩过两次的坑），这里恒为原生 span。
  const anchor = h('span', {
    className: `dshpc-hint${className !== undefined && className !== '' ? ` ${className}` : ''}`,
    style,
    tabIndex: 0,
    role: 'note',
    'aria-label': text,
  }, '?')
  const renderer = getTooltipRenderer()
  // 宿主内 renderer 恒被注入（demo 与各插件启动时做一次）；未注入 ⇒ 非宿主环境，只出图标。
  if (renderer === undefined) return anchor
  return renderer({
    label: text,
    side: side ?? 'top',
    ...(align !== undefined ? { align } : {}),
    ...(maxWidth !== undefined ? { maxWidth } : {}),
    children: anchor,
  })
}
