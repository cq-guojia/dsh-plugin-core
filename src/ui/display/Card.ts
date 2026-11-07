import { createElement as h, type CSSProperties, type ReactNode } from 'react'
import { Chevron } from '../infra/chevron.js'
import { t, type Translate } from '../../utils/i18n.js'
import { ensureComponentStyles } from '../infra/css.js'
import { CARD_CSS } from './card-css.js'
import { SURFACE_CSS } from './surface-css.js'
import { surfaceClass } from './Surface.js'

/** 色条档位（映射到 design 的 token，不新增 token；也接受任意 CSS 颜色值）。 */
export const CARD_ACCENTS = [
  'business', 'success', 'warning', 'danger', 'neutral',
  'purple', 'pink', 'cyan', 'teal', 'orange', 'indigo', 'rose', 'slate',
] as const
export type CardAccent = (typeof CARD_ACCENTS)[number]

/** 色条方位与几何；不给就用默认（左侧、6px 宽、距边 12、距内容 12）。 */
export interface CardBarOptions {
  /** 贴哪条边（默认 `left`）；`StripCard` 固定贴左，忽略此项。 */
  side?: 'left' | 'right' | 'top' | 'bottom'
  /** 条子粗细（默认 6px）。 */
  size?: number | string
  /** 条子距卡片边缘的距离（默认 12px）。 */
  inset?: number | string
  /** 条子距内容的距离（默认 12px）。 */
  gap?: number | string
  /** 上下方位时的条长（默认 `100%` = 跟内容同宽）；左右方位忽略。 */
  length?: number | string
}

export interface CardSharedProps {
  /** 色条档位或任意 CSS 颜色值（如 `'#f59e0b'`）。 */
  accent?: CardAccent | string
  /** 色条方位与几何；默认左侧。 */
  bar?: CardBarOptions
  /** 展开态（决定箭头朝向与 `panel` 显隐）。 */
  expanded?: boolean
  /** 传了才显示右侧折叠箭头（全站唯一的 Chevron）；由调用方管展开状态。 */
  onToggle?: () => void
  /** 右上角操作区（如「跳过」「查看会话」）。 */
  action?: ReactNode
  /** 主内容：想写几行、左边右边随你。 */
  children?: ReactNode
  /** 展开后才显示的额外内容。 */
  panel?: ReactNode
  className?: string
  style?: CSSProperties
  translate?: Translate
  /** 悬停变色开关：统一走 --dshpc-card-hover。默认 false，纯新增、不改现有外观。 */
  hoverable?: boolean
  /**
   * 悬停作用域（仅 hoverable 为 true 时生效）：
   *  - 'head'（默认）：只有头部区这一整块边到边变色并带手势，展开区 `panel` 完全不受影响；
   *  - 'card'：整卡含展开区一起变色，由消费端显式选。
   * 展开内容必须放进 `panel`（`children` 归头部区），否则核心无从区分两块区域。
   */
  hoverScope?: 'head' | 'card'
  /** 是否带底色：默认 true（Card = surface-1，StripCard = accent 浅底）；false 时底透明、边框仍在。 */
  filled?: boolean
}

/** 数字按 px 写进 CSS 变量，字符串原样透传。 */
function lengthOf(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

/**
 * 内部共享壳：两个公开组件（`Card` / `StripCard`）只是 `kind` 不同——
 * 一个组件一种外观，import 即表明用的是哪种。
 *
 * 外框（底 / 边框 / 圆角）来自 `Surface`（圆角统一 12）；本壳只管色条几何与头部布局。
 * 两种外观的头部都是**整体垂直居中**（`align-items:center`）：调用方在 `action` 里
 * 裸放一个元素（按钮 / 文字 / 图标）即垂直居中，不用自己套容器；框内一行两行、
 * 右侧放什么、悬停浮出的按钮，都由调用方在框内自定——外壳只提供框与居中。
 */
function CardShell(
  kind: 'bordered' | 'strip',
  props: CardSharedProps,
): ReturnType<typeof h> {
  // Surface 是外框契约（圆角统一 12）：先注入它，再注入本皮肤。两份都按需注入、幂等。
  ensureComponentStyles('surface', SURFACE_CSS)
  ensureComponentStyles('card', CARD_CSS)
  const tt = props.translate ?? t
  const accent = props.accent ?? 'business'
  const isPreset = (CARD_ACCENTS as readonly string[]).includes(accent)
  const bar = props.bar ?? {}
  // StripCard 固定贴左；Card 默认左侧，可换任意一边。
  const side = kind === 'strip' ? 'left' : bar.side ?? 'left'
  const classes = [
    // strip = 方角 + 透明占位边框；两种外观都**不吃 Surface 的内距**（内距由色条贴边算）。
    surfaceClass(kind === 'strip' ? { radius: 'none', border: 'none', padding: null } : { padding: null }),
    'dshpc-card',
    kind === 'strip' ? 'dshpc-card--strip' : 'dshpc-card--bordered',
    `dshpc-card--bar-${side}`,
    isPreset ? `dshpc-card--${accent}` : '',
    props.hoverable === true ? 'dshpc-card--hoverable' : '',
    props.hoverable === true ? `dshpc-card--hover-${props.hoverScope ?? 'head'}` : '',
    props.filled === false ? 'dshpc-card--no-fill' : '',
    props.expanded === true ? 'dshpc-card--expanded' : '',
    props.className ?? '',
  ]
    .filter((s) => s !== '')
    .join(' ')
  // 自定义色与色条几何都走 CSS 变量（档位则用 class 里的 token）
  const vars: Record<string, string> = {}
  if (!isPreset) vars['--card-accent'] = accent
  if (bar.size !== undefined) vars['--card-bar-size'] = lengthOf(bar.size)
  if (bar.inset !== undefined) vars['--card-bar-inset'] = lengthOf(bar.inset)
  if (bar.gap !== undefined) vars['--card-bar-gap'] = lengthOf(bar.gap)
  if (bar.length !== undefined) vars['--card-bar-length'] = lengthOf(bar.length)
  // 消费端内联的 padding 不能落在根节点：根节点必须保持 0 内距，__body 才是边到边的头部区。
  // 转成 --card-pad-all 变量交给 __body 的 padding 消费，其余 style 照旧挂根节点。
  const { padding: padOverride, ...restStyle } = (props.style ?? {}) as CSSProperties
  if (padOverride !== undefined) vars['--card-pad-all'] = lengthOf(padOverride as number | string)
  const style = { ...restStyle, ...vars } as CSSProperties

  return h(
    'div',
    { className: classes, style },
    h(
      'div',
      { className: 'dshpc-card__body' },
      // 色条是 body 的第一个子元素：DOM 顺序恒定，左/上 = 天然在前，右/下靠 order 排到头部之后。
      h('span', { className: 'dshpc-card__bar', 'aria-hidden': true }),
      h(
        'div',
        { className: 'dshpc-card__head' },
        h('div', { className: 'dshpc-card__main' }, props.children ?? null),
        props.action === undefined && props.onToggle === undefined
          ? null
          : h(
              'div',
              { className: 'dshpc-card__side' },
              props.action ?? null,
              props.onToggle === undefined
                ? null
                : h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshpc-card__toggle',
                      'aria-label': tt('cardToggle'),
                      'aria-expanded': props.expanded === true,
                      onClick: props.onToggle,
                    },
                    // 箭头走全站唯一的 Chevron（不再写 ▾ 字形）；旋转由外层 .is-open 承担，动画不变。
                    h('span', { className: props.expanded === true ? 'dshpc-card__caret is-open' : 'dshpc-card__caret' }, h(Chevron, { size: 12 })),
                  ),
            ),
      ),
    ),
    props.panel === undefined || props.expanded !== true
      ? null
      : h('div', { className: 'dshpc-card__panel' }, props.panel),
  )
}

/**
 * 卡片（框式）：复用 `Surface` 外框（surface 底 + 1px 边框 + 圆角 12），
 * 色条默认贴左缘、6px 粗、圆角短条（高度随内容）；`bar.side` 可换成右/上/下。
 * 头部整体垂直居中；悬停浮出的按钮、一行两行由调用方在框内自定。
 *
 * ```tsx
 * h(Card, {
 *   accent: 'warning',
 *   bar: { side: 'right', inset: 10, gap: 8 },
 *   action: h(Button, { size: 'sm', variant: 'ghost' }, '跳过'),
 * }, h('div', null, '标题 + 内容'))
 * ```
 */
export function Card(props: CardSharedProps): ReturnType<typeof h> {
  return CardShell('bordered', props)
}

/**
 * 条带卡片（浅底式）：同色系浅底 + 1px 不可见占位边框 + 方角 + 左缘 4px 通高方角色条（贴左缘）。
 * 与 `Card` 同一份 props，头部同样整体垂直居中。
 *
 * ```tsx
 * h(StripCard, {
 *   accent: 'success',
 *   expanded: open, onToggle: () => setOpen(!open),
 *   panel: h('div', null, '展开详情'),
 * }, h('div', null, '标题 + 元信息'))
 * ```
 */
export function StripCard(props: CardSharedProps): ReturnType<typeof h> {
  return CardShell('strip', props)
}
