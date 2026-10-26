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
  /** 外链（访问 GitHub 按钮前置图标）。 */
  export const IconLinkOutlineRegular: ComponentType<{ size?: number; className?: string }>
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

  /** 官方菜单项按钮：在 Menu 内渲染一行（图标 + 文案），宿主统一样式与键盘导航。 */
  export const MenuItemButton: ComponentType<{
    icon?: import('react').ReactNode
    onSelect: () => void
    current?: boolean
    separatorBefore?: boolean
    disabled?: boolean
    children?: import('react').ReactNode
  }>

  // —— 官方设置表单（settings-form 子系统）——
  // 插件详情页那张配置表单就是它：草稿态 + 「保存」一次性落地，脏 / 只读 / 失败全套状态官方管，
  // 插件不带状态机。类型照 @deepseek-ai/dsh-client-ui-primitives 0.2.0-rc.1 的
  // `lib/types/settings-form/*.d.ts` 抄最小子集。

  /** 表单整体状态（每个插件设置卡片共用的一套）。 */
  export interface SettingsFormShell {
    /** 命名空间还没被宿主提供时为 false —— 此时官方外壳渲染 unavailable 文案，不出控件。 */
    available: boolean
    writable: boolean
    dirty: boolean
    invalid: boolean
    saving: boolean
    failed: boolean
  }

  /** 一个字段的控件态：草稿文本 + 保存后是否留痕 + 该草稿是否被字段接受。 */
  export interface SettingsFieldState {
    text: string
    overridden: boolean
    invalid: boolean
  }

  /** 一次写入：落值为 set、清除为 clear（undefined = 草稿文本不是本字段接受的值，拦住保存）。 */
  export type SettingsFieldWrite = { kind: 'set'; value: unknown } | { kind: 'clear' }

  /** 字段在「存储值 ↔ 草稿文本」之间的转换契约（官方只出 number / text，布尔照此自己写 spec）。 */
  export interface SettingsFieldSpec {
    field: string
    format: (value: unknown) => string
    parse: (text: string) => SettingsFieldWrite | undefined
  }

  /** 官方的 observable store（getSnapshot / subscribe 两件套）。 */
  export interface SnapshotStore<S> {
    getSnapshot(): S
    subscribe(listener: () => void): () => void
  }

  /** 一个设置命名空间的只读快照面（官方 ConfigForm 的子集，够 SettingsFormModel 用）。 */
  export interface SettingsFormScope<T> {
    getSnapshot(): {
      status: 'loading' | 'ready' | 'unavailable'
      value: T | undefined
      writable: boolean
      revision: number | undefined
    }
    subscribe(listener: () => void): () => void
    mutate(ops: readonly unknown[], expectedRevision?: number): Promise<boolean>
  }

  /** 表单动作（槽位 entry 的 inject 把它们交给面板组件）。 */
  export interface SettingsFormActions {
    edit: (field: string, text: string) => void
    resetField: (field: string) => void
    save: () => void
    discard: () => void
  }

  /** 官方 staged form：临时草稿、原子提交、失败保留草稿——插件侧不带状态机。 */
  export class SettingsFormModel<T> {
    constructor(scope: SettingsFormScope<T>, specs: SettingsFieldSpec[])
    bind<S>(project: () => S): SnapshotStore<S>
    shell(): SettingsFormShell
    field(field: string): SettingsFieldState
    actions(): SettingsFormActions
    save(): Promise<void>
    dispose(): void
  }

  /** 官方表单外壳：只读提示 / 保存按钮 / unavailable 分支 / 离开页面自动 discard。 */
  export function SettingsForm(props: {
    labels: { unavailable: string; readOnly: string; saveFailed: string; save: string; saving: string }
    state: SettingsFormShell
    onSave: () => void
    onDiscard: () => void
    children?: import('react').ReactNode
  }): import('react').JSX.Element
}
