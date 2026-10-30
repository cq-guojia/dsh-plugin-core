/**
 * 输入类控件 —— **全站唯一实现**（L2 组件皮肤，P3）
 *
 * - `Input`：文本输入（size sm 24 / md 28 / lg 32，error 描红）；
 * - `PrefixedInput`：前缀 + 文本输入（如路径 / 接口前缀）；
 * - `NumberInput`：数字步进（显式 `− / +`，替换原生 `<input type="number">` 的浏览器 spinner，
 *   支持 step / min / max、clamp、Enter 提交、失焦回弹）。
 *
 * 高度一律吃 `--dshpc-control-h-*`；有边 / 无边同高（边框在内部补回）。
 */
import { createElement as h, useEffect, useState, type CSSProperties, type ReactElement, type ReactNode, type RefObject } from 'react'
import { IconButton } from './Button.js'
import { FieldHint } from './FieldHint.js'
import { ensureComponentStyles } from './css.js'
import { FIELD_CSS } from './controls-css.js'

/**
 * 字段 hint 的统一包法：控件 + 问号提示同一行（间距/对齐收进组件，调用方传个
 * `hint` 字符串就行，不再手动拼排版 —— 用户 2026-10-20 拍板）。
 */
export function withHint(control: ReactElement, hint: string | undefined): ReactElement {
  if (hint === undefined) return control
  return h('span', { className: 'dshpc-fieldwrap' }, control, h(FieldHint, { text: hint }))
}

/** 输入高度档（sm 24 / md 28 / lg 32）。 */
export type FieldSize = 'sm' | 'md' | 'lg'

function sizeClass(size: FieldSize): string {
  return size === 'lg' ? '--lg' : size === 'md' ? '--md' : '--sm'
}

export interface InputProps {
  /** 当前值。 */
  value: string
  /** 变更回调（原生 input value）。 */
  onChange: (value: string) => void
  /** 占位。 */
  placeholder?: string
  /** 高度档（默认 sm）。 */
  size?: FieldSize
  /** 校验不通过：描红。 */
  error?: boolean
  /** 禁用。 */
  disabled?: boolean
  /** 原生 type（默认 text）。 */
  type?: string
  /** 左侧图标（任意 ReactNode；不传就没有这一段）。图标尺寸按档取 `fieldMetricsOf(size).icon`。 */
  icon?: ReactNode
  /** 无障碍名。 */
  'aria-label'?: string
  /** 悬停提示。 */
  title?: string
  /** 追加 class。 */
  className?: string
  /** 追加样式（只允许补布局）。 */
  style?: CSSProperties
  /** 原生 input 的 ref（调用方需要主动聚焦时用，如任务选择器的搜索框）。 */
  inputRef?: RefObject<HTMLInputElement | null>
  /** 键盘事件（如搜索框里 Enter 直接选中第一项）。 */
  onKeyDown?: (event: { key: string; preventDefault(): void }) => void
  /** 失焦（如数字框把「清空 / 输一半」的草稿回弹成已提交值）。 */
  onBlur?: () => void
  /** 问号提示文字：给了就在输入框后面挂标准 FieldHint。 */
  hint?: string
}

/** 文本输入。默认铺满容器（width:100%，与 Textarea 同口径）；要定宽由调用方在外面包壳（如 192px 搜索槽）。 */
export function Input(props: InputProps): ReturnType<typeof h> {
  ensureComponentStyles('field', FIELD_CSS)
  const { value, onChange, placeholder, size = 'lg', error, disabled, type, icon, className, style } = props
  const [focused, setFocused] = useState(false)
  // 搜索框的清空钮：只在「有焦点 + 有内容」时出现。原生 ::-webkit-search-cancel-button 由壳的 CSS 隐掉，
  // 换成与 NumberInput 加减号同款的 plain IconButton（2026-10-28 用户：原生那个不好看）。
  const search = type === 'search'
  const showClear = search && value !== '' && focused && disabled !== true
  const input = h('input', {
    ref: props.inputRef,
    type: type ?? 'text',
    value,
    placeholder,
    disabled,
    'aria-label': props['aria-label'],
    title: props.title,
    className: `dshpc-input dshpc-input${sizeClass(size)}${error === true ? ' dshpc-input--error' : ''}${className !== undefined && className !== '' ? ` ${className}` : ''}`,
    style,
    onChange: (event: { target: { value: string } }) => { onChange(event.target.value) },
    onKeyDown: props.onKeyDown,
    onFocus: () => { setFocused(true) },
    onBlur: () => { setFocused(false); if (props.onBlur !== undefined) props.onBlur() },
  } as never)
  // 定位壳：图标槽和清空钮都得有个壳挂（两样都没有时 DOM 不变，className / style / ref 仍落在 <input> 上）。
  const hasIcon = icon !== undefined && icon !== null
  if (!hasIcon && !search) return withHint(input, props.hint)
  return withHint(
    h('span', { className: `dshpc-iwrap dshpc-iwrap${sizeClass(size)}${showClear ? ' dshpc-iwrap--clear' : ''}` },
      hasIcon ? h('span', { className: 'dshpc-iwrap__icon' }, icon) : null,
      input,
      // 只在 mousedown 上拦焦点：不拦的话 input 先 blur ⇒ 按钮被卸掉 ⇒ 随后的 click 落空。
      showClear
        ? h(IconButton, {
            className: 'dshpc-iwrap__clear', variant: 'plain', size, icon: '×', label: '清空',
            onMouseDown: (event: { preventDefault(): void }) => { event.preventDefault() },
            onClick: () => { onChange('') },
          })
        : null),
    props.hint,
  )
}

export interface PrefixedInputProps extends Omit<InputProps, 'className'> {
  /** 前置文案（如 https:// / C:\）。 */
  prefix: string
  /** 追加 class。 */
  className?: string
}

/** 前缀 + 文本输入。 */
export function PrefixedInput(props: PrefixedInputProps): ReturnType<typeof h> {
  ensureComponentStyles('field', FIELD_CSS)
  const { prefix, value, onChange, placeholder, size = 'lg', error, disabled, type, className, style } = props
  return h('div', {
    className: `dshpc-pfx dshpc-pfx${sizeClass(size)}${error === true ? ' dshpc-pfx--error' : ''}${className !== undefined && className !== '' ? ` ${className}` : ''}`,
    style,
  },
    h('span', { className: 'dshpc-pfx__label' }, prefix),
    h('input', {
      type: type ?? 'text',
      value,
      placeholder,
      disabled,
      'aria-label': props['aria-label'],
      title: props.title,
      className: 'dshpc-pfx__input',
      onChange: (event: { target: { value: string } }) => { onChange(event.target.value) },
    } as never))
}

export interface NumberInputProps {
  /** 当前值（数字）。 */
  value: number
  /** 变更回调（已 clamp）。 */
  onChange: (value: number) => void
  /** 最小值（默认 -Infinity）。 */
  min?: number
  /** 最大值（默认 +Infinity）。 */
  max?: number
  /** 步进（默认 1）。 */
  step?: number
  /** 高度档（默认 sm）。 */
  size?: FieldSize
  /** 内部数字输入区宽度（px；不传取 CSS 规格 36，够 3~4 位数）。 */
  inputWidth?: number
  /** 禁用。 */
  disabled?: boolean
  /** 后缀（如「秒」「次」）。 */
  suffix?: string
  /** 无障碍名。 */
  label?: string
  /** 减号无障碍名。 */
  decreaseLabel?: string
  /** 加号无障碍名。 */
  increaseLabel?: string
  /** 追加 class。 */
  className?: string
  /** 追加样式（只允许补布局）。 */
  style?: CSSProperties
  /** 问号提示文字：给了就在控件后面挂标准 FieldHint。 */
  hint?: string
}

/**
 * 数字步进输入：显式 `− / +` 按钮 + 可输入数字。
 *
 * @param props 见 {@link NumberInputProps}。
 * @returns 数字步进控件。
 */
export function NumberInput(props: NumberInputProps): ReturnType<typeof h> {
  ensureComponentStyles('field', FIELD_CSS)
  const {
    value, onChange, min = -Infinity, max = Infinity, step = 1, size = 'lg', inputWidth,
    disabled, suffix, label, decreaseLabel = '减少', increaseLabel = '增加', className, style,
  } = props
  const [text, setText] = useState(String(value))
  // 外部值变化（如切档位重置）时同步回输入框。
  useEffect(() => { setText(String(value)) }, [value])
  const clamp = (n: number): number => Math.min(max, Math.max(min, n))
  const commit = (raw: string): void => {
    // ⚠️ 空串按「输入无效」回弹，**不能**当成 0（2026-10-08 真机 bug：`Number('') === 0` ⇒
    // 用户按 Delete 把数字删空后失焦，值被 clamp 成 min，看起来就是「按 Delete 不管用」）。
    if (raw.trim() === '') { setText(String(value)); return }
    const n = Number(raw)
    if (!Number.isFinite(n)) { setText(String(value)); return }
    const next = clamp(n)
    setText(String(next))
    if (next !== value) onChange(next)
  }
  const bump = (dir: number): void => {
    const base = Number.isFinite(Number(text)) ? Number(text) : value
    const next = clamp(base + dir * step)
    setText(String(next))
    if (next !== value) onChange(next)
  }
  return withHint(h('div', {
    className: `dshpc-num dshpc-num${sizeClass(size)}${disabled === true ? ' dshpc-num--disabled' : ''}${className !== undefined && className !== '' ? ` ${className}` : ''}`,
    style,
  },
    h(IconButton, { variant: 'plain', size, icon: '−', label: decreaseLabel, disabled, onClick: () => { bump(-1) } }),
    // 中段（数字 + 后缀）成组居中：消费端把宽度拉大时，「−」钉最左、「+」钉最右、数字组始终居中
    // （用户 2026-10-18：加减号必须在最左 / 最右，宽度由消费端调）。
    h('span', { className: 'dshpc-num__mid' },
      h('input', {
        className: 'dshpc-num__input',
        ...(inputWidth === undefined ? {} : { style: { width: `${inputWidth}px` } }),
        value: text,
        disabled,
        inputMode: 'numeric',
        'aria-label': label,
        onChange: (event: { target: { value: string } }) => { setText(event.target.value) },
        onBlur: () => { commit(text) },
        onKeyDown: (event: { key: string }) => { if (event.key === 'Enter') commit(text) },
      } as never),
      suffix !== undefined ? h('span', { className: 'dshpc-num__suffix' }, suffix) : null),
    h(IconButton, { variant: 'plain', size, icon: '+', label: increaseLabel, disabled, onClick: () => { bump(1) } })), props.hint)
}

// ─────────────────────── 下拉（官方 Menu）P6 ───────────────────────

/** 下拉 / 日期 / 时分的选项（value = 写进任务定义的真值）。 */
export interface EditorOption {
  value: string
  label: string
}

/**
 * 下拉锚点的统一样式（**全站唯一一份**）：`SelectField` 与 `TaskPicker` 共用 —— 两者是同一类锚点，
 * 不许各抄一份（2026-10-04 评审：TaskPicker 曾抄第二/第三份，观感会持续漂移）。
 */
export const FIELD_ANCHOR_STYLE: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px', height: 'var(--dshpc-control-h-lg)', boxSizing: 'border-box',
  minWidth: 0, maxWidth: '100%', padding: '0 var(--dshpc-space-2)',
  border: '0.5px solid var(--dshpc-border-heavy)', borderRadius: 'var(--dshpc-radius-md)', background: 'var(--dshpc-surface-1)',
  color: 'var(--dshpc-fg)', font: 'inherit', fontSize: 'var(--dshpc-font-md)', lineHeight: 'var(--dshpc-line-md)', cursor: 'pointer',
  transition: 'background var(--dshpc-dur-fast) var(--dshpc-ease), color var(--dshpc-dur-fast) var(--dshpc-ease), border-color var(--dshpc-dur-fast) var(--dshpc-ease)',
}

/** 下拉锚点里那行文字（省略号三件套收敛到 `.dshpc-ellipsis`，见 ui-style-guide §三 待抽象 #1）。 */
export const FIELD_LABEL_STYLE: CSSProperties = {
  flex: '1 1 auto', minWidth: 0, textAlign: 'left',
}

/** 尺寸档 → 锚点几何（高度 / 字号 / 行高 / 图标 / 间距）。**翻译只此一处**，下拉类控件共用。 */
export function fieldMetricsOf(size: FieldSize): { height: string; font: string; line: string; icon: number; gap: string } {
  return {
    height: size === 'sm' ? 'var(--dshpc-control-h-sm)' : size === 'md' ? 'var(--dshpc-control-h-md)' : 'var(--dshpc-control-h-lg)',
    font: size === 'sm' ? 'var(--dshpc-font-sm)' : 'var(--dshpc-font-md)',
    line: size === 'sm' ? 'var(--dshpc-line-sm)' : 'var(--dshpc-line-md)',
    icon: size === 'sm' ? 14 : 16,
    gap: size === 'sm' ? 'var(--dshpc-space-1)' : '6px',
  }
}
