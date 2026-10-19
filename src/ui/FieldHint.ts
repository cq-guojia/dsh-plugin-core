/**
 * 问号提示 —— **全站唯一实现、独立组件**（L2，P4）
 *
 * ⚠️ 它**不属于 Input 家族**：任何地方都能挂——表单行尾、标题后面、卡片角落……
 * 调用点自己把它排进自己的 flex / label 里即可（组件只是 14px 的内联图标 + 气泡）。
 *
 * 气泡的渲染分两条路（2026-10-19 用户拍板「必须和悬停提示用**同一个**」）：
 *  - 插件启动时注入了官方 Tooltip（`setTooltipRenderer`，demo 已注入）⇒ 气泡由**官方组件本体**渲染，
 *    定位 / 边界回避 / 明暗用色全归官方；
 *  - 未注入（node 自检、非宿主预览）⇒ 降级自绘气泡（HINT_CSS，皮肤与官方对齐，含 `\n` 换行）。
 */
import { ensureControls } from './css.js'
import { getTooltipRenderer } from './tooltip.js'
import { createElement as h, type CSSProperties } from 'react'

export interface FieldHintProps {
  /** 气泡里的说明文字（也是读屏播报的 aria-label）；`\n` 是真实换行。 */
  text: string
  /** 气泡方位（注入路径走官方；默认 top）。 */
  side?: 'top' | 'bottom' | 'right'
  /** 上 / 下气泡的水平对齐（注入路径走官方）。 */
  align?: 'center' | 'end'
  /** 气泡宽度上限 px（注入路径走官方）。 */
  maxWidth?: number
  /** 追加 class。 */
  className?: string
  /** 追加样式（只允许补布局）。 */
  style?: CSSProperties
}

/** 问号提示图标：hover / focus 浮出说明气泡。 */
export function FieldHint(props: FieldHintProps): ReturnType<typeof h> {
  ensureControls()
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
  if (renderer !== undefined) {
    return renderer({
      label: text,
      side: side ?? 'top',
      ...(align !== undefined ? { align } : {}),
      ...(maxWidth !== undefined ? { maxWidth } : {}),
      children: anchor,
    })
  }
  // 降级：自绘气泡（皮肤已对齐官方：--dshpc-tooltip-bg + pre-line）
  return h('span', {
    className: `dshpc-hint${className !== undefined && className !== '' ? ` ${className}` : ''}`,
    style,
    tabIndex: 0,
    role: 'note',
    'aria-label': text,
  },
    '?',
    h('span', { className: 'dshpc-hint__bubble', role: 'tooltip' }, text),
  )
}
