/**
 * 组合输入框 —— 输入框 + 后置按钮组（+ 可选前置标题）焊成一体（L2 组件皮肤，P3）
 *
 * 外观与 {@link SplitGroup} 同一套口径：外框 / 圆角 / 相邻 1px 分隔 / 整体聚焦圈都由外壳画，
 * 内件（Input、Button、IconButton）把自己的边框、圆角、外圈交出来。区别只有一条：
 * **这里持状态** —— 输入值受控于调用方，提交点与撤销栈在控件内部。
 *
 * 用法：
 *   h(InputGroup, {
 *     label: '任务名', value, onChange: setValue, undoable: true,
 *     actions: [
 *       { label: '返回', variant: 'ghost', onClick: () => close() },
 *       { label: '确定', variant: 'primary', onClick: save },
 *     ],
 *   })
 *
 * 撤销口径：Enter / 失焦 / 点任一动作 = 一次提交，把提交前的值压栈；点撤销弹回栈顶。
 * 父级直接改 `value`（如外部清空）不算编辑，不进栈。
 */
import { createElement as h, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, IconButton, type ButtonVariant } from '../actions/Button.js'
import { Input, withHint, type FieldSize } from './Field.js'
import { FontIcon } from '../display/font-icon.js'
import { ensureComponentStyles } from '../infra/css.js'
import { BUTTON_CSS } from '../actions/button-css.generated.js'
import { FIELD_CSS } from './field-css.generated.js'
import { INPUT_GROUP_CSS } from './input-group-css.generated.js'
import { t } from '../../utils/i18n.js'

/** 后置按钮：只给 icon = 纯图标钮（正方形）；给 label = 文字钮；两个都给 = 图标 + 文字。 */
export interface InputGroupAction {
  /** 图标（任意 ReactNode）。 */
  icon?: ReactNode
  /** 文案。不给且没图标 ⇒ 不渲染。 */
  label?: string
  /**
   * 外观档（默认 `info`）。要语义色就直接传这一档 —— `success` / `info` / `warning` / `danger`
   * 都是 Button 现成的档，不是另外调色（用户 2026-11-02 定：别自造颜色，用这几档语义色，主要 success 与 info）。
   */
  variant?: ButtonVariant
  /** 单钮禁用。 */
  disabled?: boolean
  /** 定宽（px 或任意 CSS 宽度值）；loading 转圈会把按钮撑宽并挤到输入框，定宽后不跳。 */
  width?: number | string
  /**
   * loading 时是否保留按钮文案（默认 true）。传 `false`：loading 期间清文字、
   * 锁在「有文案」的宽度上、只留一枚居中的圈（见 `Button.loadingText`）。
   */
  loadingText?: boolean
  /** 无障碍名：只有图标时必给（否则读屏只知道「按钮」）。 */
  ariaLabel?: string
  /** 点击。**返回 Promise 时按钮自动转圈禁用**（同 Button / IconButton）。 */
  onClick: () => unknown
}

export interface InputGroupProps {
  /** 当前值。 */
  value: string
  /** 变更回调。 */
  onChange: (value: string) => void
  /** 前置标题：与输入框同格、灰底，和控件是一体的。 */
  label?: string
  /** 占位。 */
  placeholder?: string
  /** 高度档（默认 lg）。 */
  size?: FieldSize
  /** 自定义高度（px）：给了就压过 size 档。 */
  height?: number
  /** 校验不通过：整组描红。 */
  error?: boolean
  /** 禁用整组。 */
  disabled?: boolean
  /** 后置按钮，顺序即布局顺序；一枚或多枚都行（如「返回」+「确定」）。 */
  actions?: InputGroupAction[]
  /** 开启撤销：按钮组最前面多一枚撤销钮，回到上一次提交前的值。 */
  undoable?: boolean
  /** 撤销钮的无障碍名（默认「撤销」）。 */
  undoLabel?: string
  /** Enter 提交回调（提交点之一，撤销栈照记）。 */
  onSubmit?: (value: string) => void
  /** 无障碍名（整组 role=group）。 */
  'aria-label'?: string
  /** 根节点 id。 */
  id?: string
  /** 追加 class（只补布局，不覆盖皮肤）。 */
  className?: string
  /** 追加样式（只补布局）。 */
  style?: CSSProperties
  /** 问号提示文字：给了就在整组后面挂标准 FieldHint。 */
  hint?: string
}

/**
 * 渲染一个「输入框 + 按钮组」组合控件。
 *
 * @param props 见 {@link InputGroupProps}。
 * @returns 组合控件元素。
 */
export function InputGroup(props: InputGroupProps): ReturnType<typeof h> {
  ensureComponentStyles('input-group', INPUT_GROUP_CSS)
  ensureComponentStyles('field', FIELD_CSS)
  ensureComponentStyles('button', BUTTON_CSS)
  const {
    value, onChange, label, placeholder, size = 'lg', height, error, disabled,
    actions = [], undoable = false, undoLabel = t('inputUndo'), onSubmit,
  } = props

  const committed = useRef(value)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const commit = (): void => {
    if (value === committed.current) return
    const prev = committed.current
    committed.current = value
    setUndoStack((stack) => [...stack, prev])
  }
  const undo = (): void => {
    const prev = undoStack[undoStack.length - 1]
    if (prev === undefined) return
    setUndoStack((stack) => stack.slice(0, -1))
    committed.current = prev
    onChange(prev)
  }

  const nodes: ReactNode[] = []
  if (label !== undefined) nodes.push(h('span', { key: 'label', className: 'dshpc-igroup__label' }, label))
  nodes.push(h(Input, {
    key: 'input',
    value,
    onChange,
    placeholder,
    size,
    disabled,
    'aria-label': props['aria-label'],
    onBlur: commit,
    onKeyDown: (event: { key: string; preventDefault(): void }) => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      commit()
      if (onSubmit !== undefined) onSubmit(value)
    },
  }))
  if (undoable) {
    nodes.push(h(IconButton, {
      key: 'undo',
      variant: 'plain',
      size,
      icon: h(FontIcon, { name: 'common.base:chexiao' }),
      label: undoLabel,
      disabled: disabled === true || undoStack.length === 0,
      onClick: undo,
    }))
  }
  actions.forEach((action, i) => {
    if (action.label === undefined && (action.icon === undefined || action.icon === null)) return
    // 必须把返回值透出去：Button / IconButton 靠「返回值是不是 Promise」决定要不要转圈
    const run = (): unknown => { commit(); return action.onClick() }
    const off = disabled === true || action.disabled === true
    const onlyIcon = action.label === undefined
    nodes.push(onlyIcon
      ? h(IconButton, {
          key: `action-${String(i)}`,
          variant: 'plain',
          size,
          icon: action.icon,
          label: action.ariaLabel ?? t('inputAction'),
          disabled: off,
          onClick: run,
        })
      : h(Button, {
          key: `action-${String(i)}`,
          variant: action.variant ?? 'info',
          size,
          icon: action.icon,
          width: action.width,
          loadingText: action.loadingText,
          disabled: off,
          onClick: run,
        }, action.label))
  })

  const className = `dshpc-igroup dshpc-igroup--${size}`
    + `${error === true ? ' dshpc-igroup--error' : ''}`
    + `${props.className !== undefined && props.className !== '' ? ` ${props.className}` : ''}`
  return withHint(h('div', {
    role: 'group',
    'aria-label': props['aria-label'] ?? label,
    id: props.id,
    className,
    style: height === undefined ? props.style : { height, ...props.style },
  }, nodes), props.hint)
}
