import { createElement as h, type CSSProperties, type ReactNode } from 'react'
import { ensureControls } from './css.js'
import { t, type Translate } from '../utils/i18n.js'

/** 色条档位（映射到 design 的 token，不新增 token；也接受任意 CSS 颜色值）。 */
export const CARD_ACCENTS = ['business', 'success', 'warning', 'danger', 'neutral'] as const
export type CardAccent = (typeof CARD_ACCENTS)[number]

export interface CardSharedProps {
  /** 左侧色条档位或任意 CSS 颜色值（如 `'#f59e0b'`）。 */
  accent?: CardAccent | string
  /** 展开态（决定箭头朝向与 `panel` 显隐）。 */
  expanded?: boolean
  /** 传了才显示右侧折叠箭头；由调用方管展开状态。 */
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
}

/**
 * 内部共享壳：两个公开组件（`Card` / `StripCard`）只是 `kind` 不同。
 *
 * 为什么不导出一个带 variant 的组件：消费方「要用哪个拖哪个」，
 * 一个组件带两种样式等于每次都要记参数；拆成两个，import 即表明用的是哪种外观。
 */
function CardShell(
  kind: 'bordered' | 'strip',
  props: CardSharedProps,
): ReturnType<typeof h> {
  ensureControls()
  const tt = props.translate ?? t
  const accent = props.accent ?? 'business'
  const isPreset = (CARD_ACCENTS as readonly string[]).includes(accent)
  const classes = [
    'dshpc-card',
    kind === 'strip' ? 'dshpc-card--strip' : 'dshpc-card--bordered',
    isPreset ? `dshpc-card--${accent}` : '',
    props.className ?? '',
  ]
    .filter((s) => s !== '')
    .join(' ')
  // 自定义色走 CSS 变量（档位则用 class 里的 token）
  const style: CSSProperties | undefined = isPreset
    ? props.style
    : { ...props.style, ['--card-accent' as string]: accent }

  return h(
    'div',
    { className: classes, style },
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
                  h('span', { className: props.expanded === true ? 'dshpc-card__caret is-open' : 'dshpc-card__caret' }, '▾'),
                ),
          ),
    ),
    props.panel === undefined || props.expanded !== true
      ? null
      : h('div', { className: 'dshpc-card__panel' }, props.panel),
  )
}

/**
 * 卡片：圆角 + 1px 边框，左侧色条上下留距（短条）。
 *
 * ```tsx
 * h(Card, {
 *   accent: 'warning',
 *   action: h(Button, { size: 'sm', variant: 'ghost' }, '跳过'),
 * }, h('div', null, '标题 + 内容'))
 * ```
 */
export function Card(props: CardSharedProps): ReturnType<typeof h> {
  return CardShell('bordered', props)
}

/**
 * 条带卡片：无圆角、无边框，左侧色条**通高**（贴顶到底）。
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
