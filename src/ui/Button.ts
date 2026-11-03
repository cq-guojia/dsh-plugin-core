/**
 * 按钮 / 图标钮 —— **全站唯一实现**（L2 组件皮肤，P2）
 *
 * 三轴模型：
 *  - `variant`：外观档（形态 + 语义色），共 18 档
 *      primary（黑实心）/ secondary（灰实心）/ outline（描边）/ ghost（无底无边）
 *      danger（红实心）/ success（绿实心）/ warning（黄实心）/ info（蓝实心）
 *      danger-outline（红字描边）/ link（行内链接）
 *      purple / pink / cyan / teal / orange / indigo / rose / slate（扩展八色实心，2026-10-29）
 *  - `size`：`sm`(24) / `md`(28) / `lg`(32) —— 高度一律吃 `--dshpc-control-h-*`，
 *    **有边 / 无边同高**（边框在内部补回）
 *  - `block`：撑满父宽
 *
 * 内容轴：`icon`（前置）/ `iconRight`（后置）/ `loading`（前置小圈并自动禁用）。
 * 颜色轴：任一档都可以再用 `color` 传任意 CSS 色值 —— 只覆盖 `--btn-*` 几个变量，
 * 不新增皮肤（皮肤仍只在 `controls-css.ts` 里）。
 *
 * `IconButton` 是纯图标钮：`plain`（默认无底无边，hover 起灰底）/ `outline`（描边）/ `danger`（红）。
 * 兼容别名：`danger-ink` 仍是 `danger-outline` 的旧类名，可直接挂 className。
 *
 * ⚠️ 不许在任何使用点就地写按钮样式；要多一档外观 ⇒ 改基础层（一处改全站生效）。
 */
import { MarqueeText } from './MarqueeText.js'
import { Loader } from './Loader.js'
import { createElement as h, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { ensureComponentStyles } from './css.js'
import { BUTTON_CSS } from './controls-css.js'
import { isThenable } from './thenable.js'

/** 按钮外观档。 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger-outline'
  | 'link'
  | 'purple' | 'pink' | 'cyan' | 'teal' | 'orange' | 'indigo' | 'rose' | 'slate'

/** 按钮高度档（sm 24 / md 28 / lg 32）。 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/** 实心档（color 参数按「底色」处理；其余档按「字色 + 描边色」处理）。 */
const SOLID_VARIANTS: readonly ButtonVariant[] = [
  'primary', 'secondary', 'danger', 'success', 'warning', 'info',
  'purple', 'pink', 'cyan', 'teal', 'orange', 'indigo', 'rose', 'slate',
]

export interface ButtonProps {
  /** 外观档（默认 outline）。 */
  variant?: ButtonVariant
  /** 高度档（默认 lg）。 */
  size?: ButtonSize
  /** 前置图标（可选；字符串 / 官方图标组件都可以）。 */
  icon?: ReactNode
  /** 后置图标（可选；如「展开 / 外链」箭头）。 */
  iconRight?: ReactNode
  /**
   * 自定义主色（任意 CSS 色值，如 `#7c3aed` / `var(--dshpc-business)`）。
   * 实心档作底色、描边与文字档作主色；hover / active 由基础层按该色混出。
   */
  color?: string
  /** 加载中：文案前显示同色小圈，并自动禁用点击。与「点击自动 loading」是或关系，任一为真就转圈。 */
  loading?: boolean
  /**
   * 点击回调。**返回 Promise 即自动进入 loading**（转圈 + 禁用 + 防连点），settle 后自己恢复；
   * reject 会恢复并把错误打到控制台。同步返回值 = 老行为，不转圈。
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => unknown
  /**
   * 把「这个按钮正在跑」报出去（如锁死所在弹窗的遮罩 / Esc / ✕）。
   * 不改变按钮自己的行为；与 `loading` 无关。
   */
  onBusyChange?: (busy: boolean) => void
  /** 撑满父宽。 */
  block?: boolean
  /**
   * 固定宽（px 或任意 CSS 宽度值）。与 `minWidth` / `maxWidth` 互斥：一旦设定，后两者自动失效。
   */
  width?: number | string
  /** 最小宽：`width` 未设时生效，内容不足此宽时以它为准。 */
  minWidth?: number | string
  /**
   * 最大宽：`width` 未设时生效，文字超出时折叠成省略号，hover 以跑马灯展开全名。
   */
  maxWidth?: number | string
  /** 追加 class（只允许补布局、或挂本文件声明的修饰类，不许覆盖皮肤）。 */
  className?: string
  /** 追加样式（只允许补布局，不许覆盖皮肤）。 */
  style?: CSSProperties
  /** 文案 / 内容。 */
  children?: ReactNode
  /** 其余原生 button 属性（type / disabled / title / aria-* / onClick …）原样透传。 */
  [key: string]: unknown
}

export interface IconButtonProps {
  /** 外观档（默认 plain：无底色、无边框）。 */
  variant?: 'plain' | 'outline' | 'danger'
  /** 高度档（默认 lg）。 */
  size?: ButtonSize
  /** 图标（必填）。 */
  icon: ReactNode
  /** 无障碍名（必填；同时作为默认 title）。 */
  label: string
  /** 图标色（任意 CSS 色值）；hover 按它混出浅底。 */
  color?: string
  /** 底色（任意 CSS 色值）；不传 = 无底色。hover 按它压深。 */
  background?: string
  /** 追加 class。 */
  className?: string
  /** 追加样式。 */
  style?: CSSProperties
  /** 其余原生 button 属性原样透传。 */
  [key: string]: unknown
}

/** 把自定义颜色翻译成 5 个局部变量（只覆盖 token，不新增皮肤）。 */
function colorVars(variant: ButtonVariant, color: string | undefined): CSSProperties | undefined {
  if (color === undefined || color === '') return undefined
  if (SOLID_VARIANTS.includes(variant)) {
    return {
      '--btn-bg': color,
      // 亮色主题下 --dshpc-fg 是黑 ⇒ 压深；暗色下是白 ⇒ 提亮。两边都能明确看出变化。
      '--btn-bg-hover': `color-mix(in srgb, ${color} 82%, var(--dshpc-fg))`,
      '--btn-bg-active': `color-mix(in srgb, ${color} 70%, var(--dshpc-fg))`,
    } as CSSProperties
  }
  return {
    '--btn-fg': color,
    '--btn-fg-hover': color,
    '--btn-border': color,
    '--btn-bg-hover': `color-mix(in srgb, ${color} 12%, transparent)`,
    '--btn-bg-active': `color-mix(in srgb, ${color} 18%, transparent)`,
  } as CSSProperties
}

/** 组装按钮 class（结构一套 + 轴类）。 */
function buttonClass(variant: ButtonVariant, size: ButtonSize, block: boolean, hasIcon: boolean, extra?: string): string {
  return `dshpc-btn dshpc-btn--${variant} dshpc-btn--${size}`
    + `${block ? ' dshpc-btn--block' : ''}`
    // 前置图标标记：block 时靠它把文字拉回视觉中心（见 controls-css 的 --icon-start 规则）
    + `${hasIcon ? ' dshpc-btn--icon-start' : ''}`
    + `${extra !== undefined && extra !== '' ? ` ${extra}` : ''}`
}

/**
 * 异步点击：`onClick` 返回 thenable 就自己转圈（并禁用），settle 后恢复。
 * 不用 `onBusyChange` 也能单独工作 —— 它只是把状态报给外面（弹窗锁关闭用）。
 */
function useAsyncClick(
  onClick: ButtonProps['onClick'],
  onBusyChange: ButtonProps['onBusyChange'],
): { busy: boolean; click: (event: MouseEvent<HTMLButtonElement>) => void } {
  const [busy, setBusy] = useState(false)
  const click = (event: MouseEvent<HTMLButtonElement>): void => {
    if (onClick === undefined) return
    const out = onClick(event)
    if (!isThenable(out)) return
    setBusy(true)
    onBusyChange?.(true)
    const done = (): void => {
      setBusy(false)
      onBusyChange?.(false)
    }
    void out.then(done, (err: unknown) => {
      // 状态先恢复，再让失败可见（不吞：消费方该看到自己抛了什么）
      done()
      console.error('[dsh-plugin-core] Button 异步点击失败，已恢复可点：', err)
    })
  }
  return { busy, click }
}

/**
 * 渲染一个「图标 + 文案」按钮。
 *
 * @param props 见 {@link ButtonProps}。
 * @returns 按钮元素。
 */
export function Button(props: ButtonProps): ReturnType<typeof h> {
  ensureComponentStyles('button', BUTTON_CSS)
  const {
    variant = 'outline', size = 'lg', icon, iconRight, color, loading: loadingProp = false,
    block = false, width, minWidth, maxWidth, className, style, children,
    onClick, onBusyChange, ...rest
  } = props
  const asyncClick = useAsyncClick(onClick, onBusyChange)
  // 两个来源取或：外部传的 loading（别处刷新也能点亮它）+ 自己异步在跑
  const loading = loadingProp || asyncClick.busy
  // 三轴互斥：固定宽优先，min / max 失效；否则 min / max 各自生效。
  const widthStyle: CSSProperties = {}
  if (width !== undefined) {
    widthStyle.width = width
  } else {
    if (minWidth !== undefined) widthStyle.minWidth = minWidth
    if (maxWidth !== undefined) widthStyle.maxWidth = maxWidth
  }
  // 最大宽 + 纯文字标签 ⇒ 折叠省略号、hover 跑马灯（复用全站唯一 MarqueeText）。
  const marqueeLabel = maxWidth !== undefined && width === undefined && typeof children === 'string'
  const attrs = {
    ...rest,
    type: (rest.type as string | undefined) ?? 'button',
    disabled: rest.disabled === true || loading,
    onClick: asyncClick.click,
    className: buttonClass(variant, size, block, icon !== undefined && icon !== null && !loading, className),
    style: { ...colorVars(variant, color), ...widthStyle, ...style },
  }
  return h('button', attrs as never,
    loading
      // 转圈统一走 Loader（12px 档）：全仓只有一套环画法与一套 keyframes，
      // 不再在 button.css 里维护第二份 SVG 弧（旧类名 dshpc-btn__spinner 已删）。
      ? h(Loader, { size: 'xs' })
      : icon !== undefined && icon !== null
        ? h('span', { className: 'dshpc-btn__icon' }, icon)
        : null,
    marqueeLabel
      ? h(MarqueeText, { text: children, className: 'dshpc-btn__label' })
      : children,
    iconRight !== undefined && iconRight !== null
      ? h('span', { className: 'dshpc-btn__icon-end' }, iconRight)
      : null)
}

/**
 * 渲染一个纯图标按钮。
 *
 * @param props 见 {@link IconButtonProps}。
 * @returns 图标按钮元素。
 */
export function IconButton(props: IconButtonProps): ReturnType<typeof h> {
  ensureComponentStyles('button', BUTTON_CSS)
  const { variant = 'plain', size = 'lg', icon, label, color, background, className, style, ...rest } = props
  // 只覆盖 4 个局部变量：图标色 / 底色及其 hover 派生（不新增皮肤，皮肤仍在 controls-css.ts）。
  const accent: Record<string, string> = {}
  if (color !== undefined && color !== '') {
    accent['--icb-fg'] = color
    accent['--icb-fg-hover'] = color
    accent['--icb-bg-hover'] = `color-mix(in srgb, ${color} 14%, transparent)`
  }
  if (background !== undefined && background !== '') {
    accent['--icb-bg'] = background
    accent['--icb-bg-hover'] = `color-mix(in srgb, ${background} 85%, var(--dshpc-fg))`
  }
  const attrs = {
    ...rest,
    type: (rest.type as string | undefined) ?? 'button',
    title: rest.title ?? label,
    'aria-label': rest['aria-label'] ?? label,
    className: `dshpc-iconbtn dshpc-iconbtn--${variant} dshpc-iconbtn--${size}${className !== undefined && className !== '' ? ` ${className}` : ''}`,
    style: { ...accent, ...style } as CSSProperties,
  }
  return h('button', attrs as never, icon)
}
