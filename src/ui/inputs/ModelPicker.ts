import { createElement as h, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { t, type Translate } from '../../utils/i18n.js'
import { Picker, type PickerSize } from './Picker.js'
import { flattenOptions, groupOf, retainSelectedValue, toFlatOptions, type PickerGroup, type PickerSizing } from './picker-logic.js'
import { modelCatalog } from '../infra/host-data.js'
import { sparkleIcon } from './picker-icons.js'
import { ensureComponentStyles } from '../infra/css.js'
import { PICKER_CSS } from './picker-css.js'

/**
 * 选择模型的三种形态（消费者自选）：
 * - `grouped`（分组，默认）：一个下拉，供应商做组头、模型列在下面。
 * - `flat`（平铺）：一个下拉，所有模型平铺成「厂商-模型」，不分组，搜厂商名即可筛。
 * - `cascade`（联动）：两个下拉，先选供应商、模型列表跟着筛；两个框都带搜索。
 *
 * **返回口径一致**：`onChange` 一律发最终模型值（`${provider}/${id}`）；级联态换供应商先发 `''`。
 * 选「默认模型」也发 `''` —— 表示没选，调用方自己处理。
 *
 * **数据自带**：不传 `groups` 就读 `connectHost(ctx, { modelsPath })` 喂进的真实目录。
 * **宽度**：`width` / `minWidth` / `maxWidth` 管触发器（三种形态通用）；
 * `searchSizing` 管所有搜索框；cascade 的两个框另可分别用 `providerSizing` / `modelSizing` 覆盖。
 */
export type ModelPickerVariant = 'grouped' | 'flat' | 'cascade'

export interface ModelPickerProps extends PickerSizing {
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
  /** 下拉内搜索框（默认开；要关传 false）。三种形态、cascade 两个框一起生效。 */
  searchable?: boolean
  size?: PickerSize
  placement?: 'down' | 'up'
  /** 组件根元素的类名：grouped / flat 落在 Picker 根，cascade 落在两框外层 row。 */
  className?: string
  /** cascade 外层 row 的附加类名（与 className 叠加，单独定制布局用）。 */
  rowClassName?: string
  /** cascade 厂商框的类名。 */
  providerClassName?: string
  /** cascade 模型框的类名。 */
  modelClassName?: string
  /** 下拉内搜索框的宽度三轴（所有形态共用）；不传沿用 CSS 的 100% 铺满。 */
  searchSizing?: PickerSizing
  /** cascade：厂商框单独宽度；不传跟随 width / minWidth / maxWidth。 */
  providerSizing?: PickerSizing
  /** cascade：模型框单独宽度；不传跟随 width / minWidth / maxWidth。 */
  modelSizing?: PickerSizing
  translate?: Translate
}

export function ModelPicker(props: ModelPickerProps): ReturnType<typeof h> {
  ensureComponentStyles('picker', PICKER_CSS)
  const tt = props.translate ?? t
  const value = props.value
  const variant = props.variant ?? 'grouped'
  const searchable = props.searchable ?? true
  const defaultOption = props.allowDefault === false
    ? undefined
    : { value: '', label: props.defaultLabel ?? tt('modelDefault') }

  // 目录状态：外部没喂目录（Node 自检 / 宿主缺服务）⇒ 空 + 如实降级，不编数据。
  const catalog = useSyncExternalStore(modelCatalog.subscribe, modelCatalog.getSnapshot, modelCatalog.getSnapshot)
  const catalogGroups =
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
  // 旧值可能已不在目录里（供应商被摘掉 / 目录刷新）：按真实值补一条保留项，
  // 让触发器与菜单都显示它、级联态也能反推出 provider，绝不静默丢掉用户的选择。
  const retained = retainSelectedValue(catalogGroups, props.value)
  const groups = retained.groups
  // 目录不可用、空目录、或旧值已失效 ⇒ 如实提示「候选可能不完整」，别让空列表看起来像坏了。
  const degraded = props.degraded ?? (
    catalog.status === 'unavailable'
    || (catalog.status === 'ready' && catalogGroups.length === 0)
    || retained.retained
  )
  const icon = props.icon === undefined ? sparkleIcon() : props.icon ?? undefined
  const emitModel = (v: string | string[]): void => {
    props.onChange?.(typeof v === 'string' ? v : v[0] ?? '')
  }
  const sizing: PickerSizing = { width: props.width, minWidth: props.minWidth, maxWidth: props.maxWidth }

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

  if (variant === 'flat') {
    const options = toFlatOptions(groups)
    return h(Picker, {
      options: defaultOption === undefined ? options : [defaultOption, ...options],
      value,
      defaultValue: props.defaultValue,
      ...sizing,
      searchSizing: props.searchSizing,
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
      translate: props.translate,
      onChange: emitModel,
    })
  }

  if (variant === 'grouped') {
    return h(Picker, {
      // 「默认模型」放最上面：空 label 的组，Picker 只渲染选项不渲染组头
      groups: defaultOption === undefined
        ? groups
        : [{ value: '', label: '', options: [defaultOption] }, ...groups],
      value,
      defaultValue: props.defaultValue,
      ...sizing,
      searchSizing: props.searchSizing,
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
      translate: props.translate,
      onChange: emitModel,
    })
  }

  // cascade：两个下拉联动 —— 供应商筛模型；换供应商清空模型
  const group = groups.find((g) => g.value === provider)
  const options = group === undefined ? [] : flattenOptions([group])
  // 根元素统一吃 className（其它形态根就是 Picker），row 另留一条独立定制轴；
  // 两个框各自的类名也交出去，消费方才能分别控制布局。
  const rowClass = ['dshpc-picker__row', props.className, props.rowClassName]
    .filter((part) => part !== undefined && part !== '')
    .join(' ')
  return h(
    'div',
    { className: rowClass },
    h(Picker, {
      options: groups.map((g) => ({ value: g.value, label: g.label })),
      value: provider === '' ? undefined : provider,
      placeholder: tt('modelProvider'),
      degraded,
      disabled: props.disabled,
      ...(props.providerSizing ?? sizing),
      searchSizing: props.searchSizing,
      searchable,
      size: props.size,
      placement: props.placement,
      className: props.providerClassName,
      translate: props.translate,
      onChange: (v) => {
        setPickedProvider(typeof v === 'string' ? v : v[0] ?? '')
        props.onChange?.('')
      },
    }),
    h(Picker, {
      options: defaultOption === undefined ? options : [defaultOption, ...options],
      value,
      defaultValue: props.defaultValue,
      ...(props.modelSizing ?? sizing),
      searchSizing: props.searchSizing,
      icon,
      placeholder: props.placeholder ?? tt('modelModel'),
      degraded,
      disabled: props.disabled === true || provider === '',
      clearable: props.clearable,
      searchable,
      hint: props.hint,
      size: props.size,
      placement: props.placement,
      className: props.modelClassName,
      translate: props.translate,
      onChange: emitModel,
    }),
  )
}
