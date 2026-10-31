// ui —— 基础控件（依赖 design）。
// 使用前：插件启动时 `setStyleKit(createStyleKit({ id }))` 一次。
// 控件样式**由各控件自注入**：每个控件只登记自己那份 CSS（幂等），用不到的控件其 CSS 不进包；
// `ensureControls()` 退化为可选的 token 预热，不再需要调。
export { CONTROLS_DOMAIN, ensureControls, getStyleKit, setStyleKit } from './css.js'
export {
  filterGroups,
  flattenOptions,
  groupOf,
  labelsOf,
  resolveTriggerSizing,
  toGroups,
  toggleValue,
  type PickerGroup,
  type PickerOption,
} from './picker-logic.js'
export { Picker, type PickerProps, type PickerSize } from './Picker.js'
export {
  DateTimePicker,
  type DateTimeOutput,
  type DateTimePickerProps,
  type DateTimeSize,
} from './DateTimePicker.js'
export {
  buildMonthCells,
  ceilToPrecision,
  clampUnit,
  floorToPrecision,
  formatDateTimeIso,
  monthCaption,
  msToParts,
  nowParts,
  nowTimeFor,
  parseDateTime,
  partsOf,
  partsToMs,
  rangeIsValid,
  sameLocalDay,
  stepMax,
  stepUnit,
  toEndDraft,
  weekdayLabels,
  type DateTimeParts,
  type DateTimePrecision,
  type DayCell,
  type DayRef,
  type EndDraft,
  type StepUnit,
  type TimeParts,
} from './datetime-logic.js'
export { ModelPicker, type ModelPickerProps, type ModelPickerVariant } from './ModelPicker.js'
export { WorkspacePicker, type WorkspacePickerProps } from './WorkspacePicker.js'
export {
  connectHost,
  getWorkspaceFiles,
  modelCatalog,
  workspaceList,
  type ConnectHostOptions,
  type HostClientContext,
  type HostWorkspaceItem,
  type HostWorkspaceSource,
  type ModelCatalogState,
  type ModelRoute,
} from './host-data.js'
export { Modal, type ModalProps, type ModalSize } from './Modal.js'
export {
  AlertModal,
  type AlertModalProps,
  type AlertSeverity,
} from './AlertModal.js'
export {
  ConfirmModal,
  type ConfirmModalProps,
  type ConfirmTone,
} from './ConfirmModal.js'
export {
  alertModal,
  confirmModal,
  type AlertOptions,
  type ConfirmOptions,
} from './modal-host.js'
export {
  CARD_ACCENTS,
  Card,
  StripCard,
  type CardAccent,
  type CardSharedProps,
} from './Card.js'
export { Chip, type ChipProps, type ChipSize, type ChipTone } from './Chip.js'
// 表格：第一档外观 = Table（后续 TableGrid / TableZebra 各自独立导出，引哪个打包哪个）。
export { Table, type TableProps } from './Table.js'
// 分页：独立控件；Table 也可通过 `pagination` 内建（切片 + 表下渲染）。
export {
  Pagination,
  type PaginationProps,
  type TablePaginationConfig,
} from './Pagination.js'
export {
  clampPage,
  pageCountOf,
  pageItems,
  pageRange,
  type PageItem,
  type PageTotalRenderer,
  type PaginationAlign,
} from './pagination-logic.js'
export {
  headerRows,
  isLeafColumn,
  isTableCellSpec,
  leafColumns,
  tableDepth,
  type TableAlign,
  type TableBorders,
  type TableCell,
  type TableCellSpec,
  type TableColumn,
  type TableDensity,
  type TableGroup,
  type TableHeaderCell,
  type TableRow,
  type TableTone,
} from './table-logic.js'
export {
  showToast,
  notify,
  type ToastVariant,
  type ToastPosition,
  type ToastOptions,
  type ToastAction,
  type NotifyOptions,
} from './Toast.js'

export { Button, IconButton, type ButtonProps, type ButtonSize, type ButtonVariant, type IconButtonProps } from './Button.js'
export { Segmented, type SegmentedProps, type SegmentedTone } from './Segmented.js'
export { SplitGroup, type SplitGroupProps } from './SplitGroup.js'
export { Textarea, type TextareaProps } from './Textarea.js'
export { Checkbox, type CheckboxProps } from './Checkbox.js'
export { MarqueeText } from './MarqueeText.js'
export { Loader, type LoaderProps, type LoaderSize, type LoaderVariant } from './Loader.js'
export { LoaderBar, type LoaderBarProps } from './LoaderBar.js'
export {
  Loading,
  LoadingBlock,
  LoadingToast,
  RunningBlocks,
  showLoading,
  type LoadingOptions,
  type LoadingProps,
  type LoadingViewProps,
} from './Loading.js'
export {
  claimLoadingHost,
  createLoadingSlot,
  loadingOverlayClass,
  LOADING_HOST_KEY,
  type LoadingHandle,
  type LoadingPosition,
  type LoadingSlotState,
  type LoadingVariant,
} from './loading-host.js'
export { SectionHead, type SectionHeadAccent, type SectionHeadProps } from './SectionHead.js'
export { FieldHint, type FieldHintProps } from './FieldHint.js'
export {
  getTooltipRenderer,
  setTooltipRenderer,
  type TooltipRenderProps,
  type TooltipRenderer,
} from './tooltip.js'
export { LiveText } from './LiveText.js'
export {
  QuickToolbar,
  type QuickToolbarProps,
} from './QuickToolbar.js'
export {
  DEFAULT_SCROLL_THRESHOLD,
  isToolbarEntryVisible,
  resolveToolbarLeft,
  sortToolbarEntries,
  type QuickToolbarBackToTop,
  type QuickToolbarItem,
  type QuickToolbarWhen,
  type ToolbarEntry,
  type ToolbarGeometry,
} from './quick-toolbar-logic.js'
export { startResizeLayoutWidth, type ResizeOptions } from './resizer.js'
export {
  DockPanel,
  PanelDock,
  createPanelDock,
  type DockCloseButton,
  type DockCloseReason,
  type DockPanelProps,
  type PanelDockController,
  type PanelDockOptions,
  type PanelDockProps,
} from './PanelDock.js'
export {
  DEFAULT_PANEL_ID,
  clampWidth,
  closePanel,
  collapsePanel,
  emptyDock,
  expandPanel,
  isCollapsed,
  isOpen,
  openPanel,
  othersWidth,
  setPanelWidth,
  type DockState,
  type OpenResult,
} from './panel-dock-logic.js'
export {
  FIELD_ANCHOR_STYLE,
  FIELD_LABEL_STYLE,
  Input,
  NumberInput,
  PrefixedInput,
  fieldMetricsOf,
  type EditorOption,
  type FieldSize,
  type InputProps,
  type NumberInputProps,
  type PrefixedInputProps,
} from './Field.js'
