import { createElement as h, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { ensureControls } from './css.js'
import { t, type Translate } from '../utils/i18n.js'
import { Picker, type PickerSize } from './Picker.js'
import { flattenOptions, groupOf, type PickerGroup } from './picker-logic.js'
import { modelCatalog } from './host-data.js'
import { sparkleIcon } from './picker-icons.js'

/**
 * 模型选择器的两种形态（消费者自选）：
 * - `grouped`（分组，默认）：**一个下拉、完全独立**，供应商做组头、模型列在下面，不与任何东西联动。
 * - `cascade`（联动）：**两个下拉、彼此联动** —— 先选供应商，后面模型列表跟着筛；
 *   换供应商会清空已选模型（旧模型不属于新供应商）。
 *
 * **返回口径一致**：`onChange` 一律发最终模型值（`${provider}/${id}`）；级联态换供应商先发 `''`。
 * 选「默认模型」也发 `''` —— 表示没选，调用方自己处理。
 *
 * **数据自带**：不传 `groups` 就读 `connectHost(ctx, { modelsPath })` 喂进的真实目录。
 */
export type ModelPickerVariant = 'grouped' | 'cascade'

export interface ModelPickerProps {
  /** 覆盖内置目录（一般不用；测试或特殊数据源时才传）。 */
  groups?: PickerGroup[]
  variant?: ModelPickerVariant
  /** 最终模型值；`''` = 默认模型（没选）。 */
  value?: string
  /** 非受控初始值。 */
  defaultValue?: string
  onChange?: (value: string) => void
  /** 是否提供「默认模型」选项（默认提供；不需要就传 false）。 */
  allowDefault?: boolean
  /** 「默认模型」的文案（默认取内置字典）。 */
  defaultLabel?: string
  /** 未选时的文字（默认「模型」）。 */
  placeholder?: string
  /** 触发器前置图标：不传 = 默认星形；传 `null` = 不显示；传元素 = 自定义。 */
  icon?: ReactNode | null
  /** 问号提示文字（传了才显示）。 */
  hint?: string
  /** 目录不可用时的如实提示（不传则由目录状态决定）。 */
  degraded?: boolean
  disabled?: boolean
  clearable?: boolean
  /** 下拉内搜索框（默认开；要关传 false）。 */
  searchable?: boolean
  size?: PickerSize
  placement?: 'down' | 'up'
  className?: string
  translate?: Translate
}

export function ModelPicker(props: ModelPickerProps): ReturnType<typeof h> {
  ensureControls()
  const tt = props.translate ?? t
  const value = props.value
  const variant = props.variant ?? 'grouped'
  const searchable = props.searchable ?? true
  const defaultOption = props.allowDefault === false
    ? undefined
    : { value: '', label: props.defaultLabel ?? tt('modelDefault') }

  // 目录状态：外部没喂目录（Node 自检 / 宿主缺服务）⇒ 空 + 如实降级，不编数据。
  const catalog = useSyncExternalStore(modelCatalog.subscribe, modelCatalog.getSnapshot)
  const groups =
    props.groups ??
    (catalog.status === 'ready'
      ? catalog.routes.map((route) => ({
          value: route.provider,
          label: route.displayName,
          options: route.models.map((model) => ({
            value: `${route.provider}/${model.id}`,
            label: model.name ?? model.id,
          })),
        }))
      : [])
  // 目录不可用、或读出来是空的 ⇒ 如实提示「候选可能不完整」，别让空列表看起来像坏了。
  const degraded = props.degraded ?? (catalog.status === 'unavailable' || (catalog.status === 'ready' && groups.length === 0))
  const icon = props.icon === undefined ? sparkleIcon() : props.icon ?? undefined
  const emitModel = (v: string | string[]): void => {
    props.onChange?.(typeof v === 'string' ? v : v[0] ?? '')
  }

  // 联动态的厂商选择必须组件自己记 —— 值是从模型值反推的，换厂商会把模型清成 ''
  // （拍板口径），反推就再也找不到刚点的厂商（2026-10-20 真机：选完厂商后面仍是黑的）。
  const [pickedProvider, setPickedProvider] = useState('')
  const curGroup = groupOf(groups, value ?? '')
  const provider =
    pickedProvider !== '' && groups.some((g) => g.value === pickedProvider)
      ? pickedProvider
      : curGroup?.value ?? ''
  // 值定到某模型上 ⇒ 临时选的厂商功成身退，回到按值反推
  useEffect(() => {
    if (value !== undefined && value !== '') setPickedProvider('')
  }, [value])

  if (variant === 'grouped') {
    return h(Picker, {
      // 「默认模型」放最上面：空 label 的组，Picker 只渲染选项不渲染组头
      groups: defaultOption === undefined
        ? groups
        : [{ value: '', label: '', options: [defaultOption] }, ...groups],
      value,
      defaultValue: props.defaultValue,
      icon,
      placeholder: props.placeholder ?? tt('modelModel'),
      degraded,
      disabled: props.disabled,
      clearable: props.clearable,
      searchable,
      hint: props.hint,
      size: props.size,
      placement: props.placement,
      className: props.className,
      onChange: emitModel,
    })
  }

  // cascade：两个下拉联动 —— 供应商筛模型；换供应商清空模型
  const group = groups.find((g) => g.value === provider)
  const options = group === undefined ? [] : flattenOptions([group])
  return h(
    'div',
    { className: 'dshpc-picker__row' },
    h(Picker, {
      options: groups.map((g) => ({ value: g.value, label: g.label })),
      value: provider === '' ? undefined : provider,
      placeholder: tt('modelProvider'),
      degraded,
      disabled: props.disabled,
      searchable: false,
      onChange: (v) => {
        setPickedProvider(typeof v === 'string' ? v : v[0] ?? '')
        props.onChange?.('')
      },
    }),
    h(Picker, {
      options: defaultOption === undefined ? options : [defaultOption, ...options],
      value,
      defaultValue: props.defaultValue,
      icon,
      placeholder: props.placeholder ?? tt('modelModel'),
      degraded,
      disabled: props.disabled === true || provider === '',
      clearable: props.clearable,
      searchable,
      hint: props.hint,
      size: props.size,
      placement: props.placement,
      className: props.className,
      onChange: emitModel,
    }),
  )
}
