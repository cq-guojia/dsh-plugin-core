/**
 * 浮层面板公共件（2026-11-03）：`PanelSurface` = 皮肤载体，`PanelClose` = 唯一那枚关闭钮。
 *
 * 分工（用户 2026-11-03 定，目的就是「样式统一但各家用各家自己的逻辑」）：
 *  - **定位**留在各自控件：Modal 居中、选文件弹窗贴锚点并翻转、菜单挂在触发器下方；
 *  - **表面**全部来自 `panel.css` 的三档（modal / popover / menu），组件里不许再写
 *    底色 / 描边 / 圆角 / 阴影。
 *
 * 为什么不做成「一个万能 Panel 组件」：那会把定位也吞进来，等于要求所有浮层同一套交互。
 * 这里只统一皮肤，不统一行为。
 */
import { createElement as h, type CSSProperties, type ReactNode } from 'react'
import { ensureComponentStyles } from './css.js'
import { PANEL_CSS } from './panel-css.js'

/** 面板档位：居中模态 / 贴锚点面板 / 下拉菜单。 */
export type PanelTier = 'modal' | 'popover' | 'menu'

export interface PanelSurfaceProps {
  tier: PanelTier
  /** 容器角色（`dialog` / `menu` 这类；不传则不写 role）。 */
  role?: string
  /** 追加类名：**只允许补布局 / 定位**，皮肤归档位管。 */
  className?: string
  /** 内联样式：同样只放定位与尺寸。 */
  style?: CSSProperties
  /** 原样铺到节点上的属性（`aria-*` / `data-*` 这类钩子）。 */
  attrs?: Record<string, string | number | undefined>
  /** 面板上的点击不再冒到遮罩（否则点正文等于点了外部，会把自己关掉）。 */
  stopPropagation?: boolean
  children?: ReactNode
}

/** 皮肤载体：`dshpc-panel` + 档位类，别的地方不要手拼这两个类。 */
export function PanelSurface(props: PanelSurfaceProps): ReactNode {
  ensureComponentStyles('panel', PANEL_CSS)
  const className = `dshpc-panel dshpc-panel--${props.tier}${props.className === undefined || props.className === '' ? '' : ` ${props.className}`}`
  return h(
    'div',
    {
      ...props.attrs,
      className,
      style: props.style,
      role: props.role,
      onClick: props.stopPropagation === true ? (event: { stopPropagation: () => void }) => event.stopPropagation() : undefined,
    },
    props.children ?? null,
  )
}

export interface PanelCloseProps {
  /** 无障碍名（走调用方的内置字典）。 */
  label: string
  onClick: () => void
  /** 自定义图标（默认 ✕）。 */
  icon?: ReactNode
  className?: string
}

/** 浮层唯一那枚关闭钮（20×20 方角）；位置由各自的头部决定，这个件不管定位。 */
export function PanelClose(props: PanelCloseProps): ReactNode {
  ensureComponentStyles('panel', PANEL_CSS)
  return h(
    'button',
    {
      type: 'button',
      className: `dshpc-panel__close${props.className === undefined ? '' : ` ${props.className}`}`,
      'aria-label': props.label,
      onClick: () => props.onClick(),
    },
    props.icon ?? '✕',
  )
}
