// 官方 UI primitives 的本地最小类型声明（demo 用；与 src/types/primitives.d.ts 同源同口径）。
// 官方包是 dsh 浏览器内核的平台模块：运行时由内核模块表解析，构建时 external 掉，故无需写进依赖。
declare module '@deepseek-ai/dsh-client-ui-primitives' {
  import type { ComponentType } from 'react'

  /** 官方图标（1px 线宽）。demo 只声明用到的那几颗。 */
  export const IconPlusOutlineRegular: ComponentType<{ size?: number; className?: string }>
  export const IconCheckOutlineRegular: ComponentType<{ size?: number; className?: string }>
  export const IconCloseOutlineRegular: ComponentType<{ size?: number; className?: string }>
  export const IconRefreshOutlineRegular: ComponentType<{ size?: number; className?: string }>
  export const IconCopyOutlineRegular: ComponentType<{ size?: number; className?: string }>
  export const IconSearchOutlineRegular: ComponentType<{ size?: number; className?: string }>
  export const IconEditOutlineRegular: ComponentType<{ size?: number; className?: string }>
  export const IconPlayOutlineRegular: ComponentType<{ size?: number; className?: string }>
  export const IconPaperPlaneOutlineRegular: ComponentType<{ size?: number; className?: string }>
  export const IconChevronDownOutlineRegular: ComponentType<{ size?: number; className?: string }>
  export const IconClockOutlineRegular: ComponentType<{ size?: number; className?: string }>
  export const IconSparkleRegular: ComponentType<{ size?: number; className?: string }>
  /** 归档标识（官方 ui-workspace 行数据同款；0.2.0-rc.2 icons/index.d.ts:310）。 */
  export const IconArchiveOutlineRegular: ComponentType<{ size?: number; className?: string }>

  /** 官方悬停富卡片：anchor 原位渲染，content 任意 ReactNode（compact 紧凑卡）。 */
  export const HoverCard: ComponentType<{
    anchor: import('react').ReactNode
    content: import('react').ReactNode
    openDelayMs?: number
    variant?: 'compact' | 'preview'
    inline?: boolean
  }>

  /** 官方开关：胶囊 36×20，className 落在 button[role=switch] 本体上（无包裹元素）；
      选中底 `--dsw-alias-brand-primary`、关闭 `--dsw-alias-border-l3`。label 只作无障碍名，可见文案调用方自己画。 */
  export const Switch: ComponentType<{
    checked: boolean
    onChange: (next: boolean) => void
    label: string
    disabled?: boolean
    title?: string | undefined
    className?: string | undefined
  }>

  /** 官方弹窗（声明与 src/types/primitives.d.ts 同源同口径，版本钉死）。 */
  export function Modal(props: {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    children?: import('react').ReactNode
    footer?: import('react').ReactNode
    className?: string
    contentClassName?: string
    shortcutModal?: string
    backdropBlur?: boolean
  } & (
    | { headless: true; closeLabel?: never }
    | { headless?: false; closeLabel: string }
  )): import('react').ReactPortal | null

  /** 官方 Shiki 代码块：本仓用它在示例右侧渲染可复制的高亮代码（demo 页唯一高亮实现，不自绘）。 */
  export const CodeBlock: ComponentType<{
    code: string
    lang?: string
    streaming?: boolean
    lineNumbers?: boolean
    /** 表头（语言标签 + 复制按钮）；示例块要复制按钮 ⇒ 传 true。 */
    showHeader?: boolean
    copyLabel?: string
    copiedLabel?: string
    toolbarLabels?: Record<string, string>
    wrap?: boolean
    className?: string
  }>

  /** 官方气泡提示：label + side；children 为唯一锚点元素（须能挂 ref 的真实 DOM）。 */
  export const Tooltip: ComponentType<{
    label: string
    side?: 'right' | 'bottom' | 'top'
    align?: 'center' | 'end'
    gap?: number
    maxWidth?: number
    delayMs?: number
    portal?: boolean
    children?: import('react').ReactElement
  }>
}
