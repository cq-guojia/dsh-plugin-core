// 领域选择器：WorkspacePicker（选工作区）。
// 通用交互由 ui 的 Picker 承担；工作区数据由本组件自己订（host-data.ts 的
// workspaceList，connectHost 喂官方 `workspaces` 服务快照）—— 消费方不再传数组
// （用户 2026-10-20 拍板）。FilePicker 已删（用户同日：文件选择框没有用）。
import { createElement as h, useSyncExternalStore, type ReactNode } from 'react'
import { ensureControls } from './css.js'
import { Picker, type PickerSize } from './Picker.js'
import { t, type Translate } from '../utils/i18n.js'
import { workspaceList } from './host-data.js'
import { folderIcon } from './picker-icons.js'

export interface WorkspacePickerProps {
  value?: string | string[]
  defaultValue?: string | string[]
  mode?: 'single' | 'multiple'
  max?: number
  onChange?: (value: string | string[]) => void
  /**
   * 是否提供「所有工作区」默认项（**默认提供**；只在单选形态下出现）：
   * 选中即发 `''` —— 表示不筛，是否当「全部」由消费方自己处理。
   */
  allowDefault?: boolean
  /** 「所有工作区」的文案（默认取内置字典）。 */
  defaultLabel?: string
  /** 允许「不选」。 */
  clearable?: boolean
  /** 下拉内搜索框（默认关；要就传 true）。 */
  searchable?: boolean
  disabled?: boolean
  size?: PickerSize
  placement?: 'down' | 'up'
  className?: string
  /** 未选时的文字（默认「工作区」；想叫「选择工作区」就传它）。 */
  placeholder?: string
  /** 触发器前置图标：不传 = 默认文件夹；传 `null` = 不显示；传元素 = 自定义。 */
  icon?: ReactNode | null
  /** 问号提示文字（传了才显示）。 */
  hint?: string
  translate?: Translate
}

/** 选工作区（交互全管：单选 / 多选 / 上限 / 空态；数据自动来自宿主工作区快照）。 */
export function WorkspacePicker(props: WorkspacePickerProps): ReturnType<typeof h> {
  ensureControls()
  const tt = props.translate ?? t
  const items = useSyncExternalStore(workspaceList.subscribe, workspaceList.getSnapshot)
  const options = items.map((w) => ({ value: w.workspaceId, label: w.title }))
  // 「所有工作区」放最上面（单选才有意义）；选中发 '' —— 空串表示不筛
  const allOption =
    props.allowDefault !== false && props.mode !== 'multiple'
      ? { value: '', label: props.defaultLabel ?? tt('workspaceAll') }
      : undefined
  return h(Picker, {
    options: allOption === undefined ? options : [allOption, ...options],
    value: props.value,
    defaultValue: props.defaultValue,
    mode: props.mode,
    max: props.max,
    onChange: props.onChange,
    clearable: props.clearable,
    searchable: props.searchable,
    hint: props.hint,
    icon: props.icon === undefined ? folderIcon() : props.icon ?? undefined,
    placeholder: props.placeholder ?? tt('explorerRoot'),
    disabled: props.disabled,
    size: props.size,
    placement: props.placement,
    className: props.className,
  })
}
