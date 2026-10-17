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

export interface PickerProps {
  /** 分组数据（模型选择里一组 = 一个 provider）。 */
  groups?: PickerGroup[]
  /** 扁平数据的快捷写法；与 `groups` 二选一。 */
  options?: PickerOption[]
  value?: string | string[]
  mode?: 'single' | 'multiple'
  /** 多选上限；到上限后不再添加（不静默截断）。 */
  max?: number
  searchable?: boolean
  placeholder?: string
  /** 候选可能不完整（宿主没接上服务之类）⇒ 如实告诉用户，不编造。 */
  degraded?: boolean
  disabled?: boolean
  translate?: Translate
  onChange?: (value: string | string[]) => void
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
  const groups = useMemo(
    () => toGroups(props.groups, props.options),
    [props.groups, props.options],
  )
  const selected: string[] =
    props.value === undefined ? [] : Array.isArray(props.value) ? props.value : [props.value]

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent): void => {
      const root = rootRef.current
      if (root !== null && !root.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const shown = filterGroups(groups, query)
  const empty = flattenOptions(shown).length === 0
  const summary =
    selected.length === 0
      ? (props.placeholder ?? tt('pickerPlaceholder'))
      : mode === 'multiple'
        ? tt('pickerSelected', { n: selected.length })
        : (labelsOf(groups, selected)[0] ?? props.placeholder ?? tt('pickerPlaceholder'))

  const pick = (value: string): void => {
    if (mode === 'single') {
      props.onChange?.(value)
      setOpen(false)
      return
    }
    props.onChange?.(toggleValue(selected, value, props.max))
  }

  return h(
    'div',
    { className: 'dsh-tdt-picker', ref: rootRef },
    h(
      'button',
      {
        type: 'button',
        className: 'dsh-tdt-picker__trigger',
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
          { className: 'dsh-tdt-picker__menu' },
          props.degraded === true
            ? h('div', { className: 'dsh-tdt-picker__degraded' }, tt('pickerDegraded'))
            : null,
          props.searchable === true
            ? h('input', {
                className: 'dsh-tdt-picker__search',
                placeholder: tt('pickerSearch'),
                value: query,
                onChange: (e: { target: { value: string } }) => setQuery(e.target.value),
              })
            : null,
          empty
            ? h(
                'div',
                { className: 'dsh-tdt-picker__empty' },
                flattenOptions(groups).length === 0 ? tt('pickerEmpty') : tt('pickerNoMatch'),
              )
            : shown.map((g) =>
                h(
                  'div',
                  { key: g.value || '_' },
                  g.label === ''
                    ? null
                    : h('div', { className: 'dsh-tdt-picker__group-label' }, g.label),
                  g.options.map((o) =>
                    h(
                      'div',
                      {
                        key: o.value,
                        className: [
                          'dsh-tdt-picker__option',
                          selected.includes(o.value) ? 'dsh-tdt-picker__option--active' : '',
                          o.disabled === true ? 'dsh-tdt-picker__option--disabled' : '',
                        ]
                          .filter((s) => s !== '')
                          .join(' '),
                        onClick: () => {
                          if (o.disabled !== true) pick(o.value)
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
                    ),
                  ),
                ),
              ),
        )
      : null,
  )
}
