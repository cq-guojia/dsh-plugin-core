import { createElement as h } from 'react'
import { ensureControls } from '../ui/css.js'
import { Picker } from '../ui/Picker.js'
import { t, type Translate } from '../utils/i18n.js'

export interface WorkspacePickerProps {
  /**
   * 工作区名字列表 —— **由调用方给**。
   *
   * 为什么组件不自己取：工作区列表是 host 侧 `ctx.workspaceRegistry.list()` 取的，
   * 要经插件自己的 HTTP 通道送到 client，那条通道是插件私有的（需求文档 §6）。
   */
  workspaces: readonly string[]
  value?: string | string[]
  mode?: 'single' | 'multiple'
  max?: number
  disabled?: boolean
  placeholder?: string
  translate?: Translate
  onChange?: (value: string | string[]) => void
}

/** 选工作区（交互全管：单选 / 多选 / 上限 / 空态；数据调用方给）。 */
export function WorkspacePicker(props: WorkspacePickerProps): ReturnType<typeof h> {
  ensureControls()
  const tt = props.translate ?? t
  return h(Picker, {
    options: props.workspaces.map((w) => ({ value: w, label: w })),
    value: props.value,
    mode: props.mode,
    max: props.max,
    searchable: true,
    placeholder: props.placeholder ?? tt('explorerRoot'),
    disabled: props.disabled,
    onChange: props.onChange,
  })
}

export interface FilePickerProps {
  /** 候选文件（相对路径）；同样由调用方给。 */
  files: readonly string[]
  value?: string | string[]
  mode?: 'single' | 'multiple'
  max?: number
  disabled?: boolean
  placeholder?: string
  translate?: Translate
  onChange?: (value: string | string[]) => void
}

/** 选文件（同上：交互全管，数据调用方给）。 */
export function FilePicker(props: FilePickerProps): ReturnType<typeof h> {
  ensureControls()
  const tt = props.translate ?? t
  return h(Picker, {
    options: props.files.map((f) => ({ value: f, label: f })),
    value: props.value,
    mode: props.mode,
    max: props.max,
    searchable: true,
    placeholder: props.placeholder ?? tt('pickerPlaceholder'),
    disabled: props.disabled,
    onChange: props.onChange,
  })
}
