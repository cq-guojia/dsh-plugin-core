import { createElement as h, useEffect, useMemo, useRef, useState } from 'react'
import { ensureControls } from './css.js'
import { t, type Translate } from '../utils/i18n.js'
import {
  filterGroups,
  flattenOptions,
  labelsOf,
  toGroups,
  toggleValue,
  type PickerGroup,
  type PickerOption,
} from './picker-logic.js'

export type { PickerGroup, PickerOption }

export type PickerSize = 'sm' | 'md' | 'lg'

export interface PickerProps {
  /** 分组数据（模型选择里一组 = 一个 provider）。 */
  groups?: PickerGroup[]
  /** 扁平数据的快捷写法；与 `groups` 二选一。 */
  options?: PickerOption[]
  /** 受控值。给了它就是受控；不给就内部管（配 `defaultValue`）。 */
  value?: string | string[]
  /** 非受控模式下的初始值。 */
  defaultValue?: string | string[]
  onChange?: (value: string | string[]) => void
  mode?: 'single' | 'multiple'
  /** 多选上限；到上限后其余选项置灰并提示（不静默截断）。 */
  max?: number
  searchable?: boolean
  /** 单选时允许「不选」——选项列表顶部多一项清除。 */
  clearable?: boolean
  placeholder?: string
  /** 候选可能不完整（宿主没接上服务之类）⇒ 如实告诉用户，不编造。 */
  degraded?: boolean
  disabled?: boolean
  size?: PickerSize
  /** 菜单展开方向：靠近视口底部时用 `up`。 */
  placement?: 'down' | 'up'
  /** 选中后是否收起菜单；多选默认**不收起**（方便连续选）。 */
  closeOnSelect?: boolean
  /** 多选时是否把已选项列在触发器上（默认列）。 */
  showLabels?: boolean
  className?: string
  ariaLabel?: string
  translate?: Translate
}

/**
 * 通用选择器：单选 / 多选 / 上限 / 搜索 / 分组 / 空态 / 降级。
 *
 * **纯零件，不自己取数** —— 选项由调用方传入（工作区列表、模型列表这类数据要跨 host↔client
 * 边界，通道是插件私有的，组件取不到，见需求文档 §6）。
 */
export function Picker(props: PickerProps): ReturnType<typeof h> {
  ensureControls()
  const tt = props.translate ?? t
  const mode = props.mode ?? 'single'
  const size = props.size ?? 'md'
  const placement = props.placement ?? 'down'
  const clearable = props.clearable === true
  const showLabels = props.showLabels !== false
  const groups = useMemo(
    () => toGroups(props.groups, props.options),
    [props.groups, props.options],
  )

  const controlled = props.value !== undefined
  const [inner, setInner] = useState<string[]>(
    () => toArray(props.defaultValue),
  )
  const selected: string[] = controlled
    ? toArray(props.value)
    : inner
  const emit = (next: string[]): void => {
    if (!controlled) setInner(next)
    props.onChange?.(mode === 'single' ? (next[0] ?? '') : next)
  }

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(-1)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // 点外面收起
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent): void => {
      const root = rootRef.current
      if (root !== null && !root.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // 收起时清掉搜索词与键盘游标，别让下次打开带着上次的过滤条件
  useEffect(() => {
    if (open) return
    setQuery('')
    setActive(-1)
  }, [open])

  const shown = filterGroups(groups, query)
  const flat = flattenOptions(shown)
  const atMax = mode === 'multiple' && props.max !== undefined && selected.length >= props.max
  const summary =
    selected.length === 0
      ? (props.placeholder ?? tt('pickerPlaceholder'))
      : mode === 'multiple' && !showLabels
        ? tt('pickerSelected', { n: selected.length })
        : labelsOf(groups, selected).join('、') || (props.placeholder ?? tt('pickerPlaceholder'))

  const pick = (value: string): void => {
    if (mode === 'single') {
      emit([value])
      setOpen(false)
      return
    }
    emit(toggleValue(selected, value, props.max))
    if (props.closeOnSelect === true) setOpen(false)
  }

  const clear = (): void => {
    emit([])
    setOpen(false)
  }

  // 键盘可达：Esc 关、上下移、回车选（没有 aria 树那么全，但能用键盘走完一遍）
  const onKeyDown = (e: { key: string; preventDefault: () => void }): void => {
    if (!open) return
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (flat.length === 0) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const dir = e.key === 'ArrowDown' ? 1 : -1
      setActive((cur) => (cur + dir + flat.length) % flat.length)
      return
    }
    if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      const hit = flat[active]
      if (hit !== undefined) pick(hit.value)
    }
  }

  return h(
    'div',
    {
      className: `dsh-tdt-picker${props.className === undefined ? '' : ` ${props.className}`}`,
      ref: rootRef,
      onKeyDown,
    },
    h(
      'button',
      {
        type: 'button',
        'aria-label': props.ariaLabel,
        'aria-expanded': open,
        className: `dsh-tdt-picker__trigger dsh-tdt-picker__trigger--${size}`,
        disabled: props.disabled === true,
        onClick: () => {
          if (props.disabled !== true) setOpen(!open)
        },
      },
      h('span', null, summary),
      h('span', { className: 'dsh-tdt-picker__caret' }, '▾'),
    ),
    open
      ? h(
          'div',
          {
            className:
              placement === 'up'
                ? 'dsh-tdt-picker__menu dsh-tdt-picker__menu--up'
                : 'dsh-tdt-picker__menu',
          },
          props.degraded === true
            ? h('div', { className: 'dsh-tdt-picker__degraded' }, tt('pickerDegraded'))
            : null,
          atMax ? h('div', { className: 'dsh-tdt-picker__degraded' }, tt('pickerMaxReached', { n: props.max ?? 0 })) : null,
          props.searchable === true
            ? h('input', {
                className: 'dsh-tdt-picker__search',
                placeholder: tt('pickerSearch'),
                value: query,
                onChange: (e: { target: { value: string } }) => setQuery(e.target.value),
              })
            : null,
          flat.length === 0 && groups.length === 0
            ? h('div', { className: 'dsh-tdt-picker__empty' }, tt('pickerEmpty'))
            : flat.length === 0
              ? h('div', { className: 'dsh-tdt-picker__empty' }, tt('pickerNoMatch'))
              : [
                  clearable && mode === 'single' && selected.length > 0
                    ? h(
                        'div',
                        {
                          key: '__clear__',
                          className: 'dsh-tdt-picker__option dsh-tdt-picker__option--clear',
                          onClick: clear,
                        },
                        tt('pickerClear'),
                      )
                    : null,
                  ...shown.map((g) =>
                    h(
                      'div',
                      { key: g.value || '_' },
                      g.label === ''
                        ? null
                        : h('div', { className: 'dsh-tdt-picker__group-label' }, g.label),
                      g.options.map((o) => {
                        const activeCls = [
                          'dsh-tdt-picker__option',
                          selected.includes(o.value) ? 'dsh-tdt-picker__option--active' : '',
                          o.disabled === true || atMax ? 'dsh-tdt-picker__option--disabled' : '',
                        ]
                          .filter((s) => s !== '')
                          .join(' ')
                        const idx = flat.indexOf(o)
                        return h(
                          'div',
                          {
                            key: o.value,
                            className: activeCls,
                            'data-active': idx === active ? 'true' : undefined,
                            onClick: () => {
                              if (o.disabled !== true && !atMax) pick(o.value)
                            },
                          },
                          mode === 'multiple'
                            ? h(
                                'span',
                                { className: 'dsh-tdt-picker__tick' },
                                selected.includes(o.value) ? '✓' : '',
                              )
                            : null,
                          h('span', null, o.label),
                        )
                      }),
                    ),
                  ),
                ],
        )
      : null,
  )
}

function toArray(v: string | string[] | undefined): string[] {
  if (v === undefined) return []
  return Array.isArray(v) ? [...v] : [v]
}
