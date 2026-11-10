// ui —— 基础控件（依赖 design）。
// 使用前：插件启动时 `setStyleKit(createStyleKit({ id }))` 一次。
// 控件样式**由各控件自注入**：每个控件只登记自己那份 CSS（幂等），用不到的控件其 CSS 不进包；
// `ensureControls()` 退化为可选的 token 预热，不再需要调。
export { CONTROLS_DOMAIN, ensureControls, getStyleKit, setStyleKit } from './infra/css.js';
export { useLocale } from './infra/locale.js';
export { filterGroups, flattenOptions, groupOf, labelsOf, resolveMenuSizing, resolveTriggerSizing, retainSelectedValue, sliceGroups, toFlatOptions, toGroups, toggleValue, } from './inputs/picker-logic.js';
export { Picker } from './inputs/Picker.js';
export { DateTimePicker, } from './inputs/DateTimePicker.js';
export { buildMonthCells, ceilToPrecision, clampUnit, dayCaption, floorToPrecision, formatDateTimeIso, monthCaption, msToParts, nowParts, nowTimeFor, parseDateTime, partsOf, partsToMs, rangeIsValid, resolvePresetExpr, sameLocalDay, stepMax, stepUnit, toEndDraft, weekdayLabels, } from './inputs/datetime-logic.js';
export { ModelPicker } from './inputs/ModelPicker.js';
export { WorkspacePicker } from './inputs/WorkspacePicker.js';
export { connectHost, getWorkspaceFiles, modelCatalog, refreshModelCatalog, workspaceList, } from './infra/host-data.js';
export { Modal } from './feedback/Modal.js';
export { SideSheet } from './feedback/SideSheet.js';
export { AlertModal, } from './feedback/AlertModal.js';
export { ConfirmModal, } from './feedback/ConfirmModal.js';
export { alertModal, confirmModal, } from './feedback/modal-host.js';
export { CARD_ACCENTS, Card, StripCard, } from './display/Card.js';
export { Surface, surfaceClass, } from './display/Surface.js';
export { Chip } from './display/Chip.js';
// 一行一条的列表条目：外框复用 Surface，整行可点 + 右侧操作槽互不干扰。
export { ListRow } from './display/ListRow.js';
// 表格：第一档外观 = Table（后续 TableGrid / TableZebra 各自独立导出，引哪个打包哪个）。
export { Table } from './display/Table.js';
// 分页：独立控件；Table 也可通过 `pagination` 内建（切片 + 表下渲染）。
export { Pagination, } from './navigation/Pagination.js';
export { clampPage, pageCountOf, pageItems, pageRange, } from './navigation/pagination-logic.js';
export { headerRows, isLeafColumn, isTableCellSpec, leafColumns, tableDepth, } from './display/table-logic.js';
export { showToast, notify, } from './feedback/Toast.js';
export { Button, IconButton } from './actions/Button.js';
export { Segmented } from './inputs/Segmented.js';
export { SplitGroup } from './layout/SplitGroup.js';
export { InputGroup, } from './inputs/InputGroup.js';
export { Textarea } from './inputs/Textarea.js';
export { Checkbox } from './inputs/Checkbox.js';
export { MarqueeText } from './display/MarqueeText.js';
export { FlipText } from './display/FlipText.js';
export { Loader } from './feedback/Loader.js';
export { LoaderBar } from './feedback/LoaderBar.js';
export { Loading, LoadingBlock, LoadingToast, RunningBlocks, showLoading, } from './feedback/Loading.js';
export { claimLoadingHost, createLoadingSlot, loadingOverlayClass, LOADING_HOST_KEY, } from './feedback/loading-host.js';
export { SectionHead } from './display/SectionHead.js';
export { FieldHint } from './display/FieldHint.js';
export { getTooltipRenderer, setTooltipRenderer, } from './infra/tooltip.js';
export { LiveText } from './display/LiveText.js';
export { QuickToolbar, } from './layout/QuickToolbar.js';
export { DEFAULT_SCROLL_THRESHOLD, isToolbarEntryVisible, resolveToolbarLeft, sortToolbarEntries, } from './layout/quick-toolbar-logic.js';
export { startResizeLayoutWidth } from './layout/resizer.js';
export { DockPanel, PanelDock, createPanelDock, } from './layout/PanelDock.js';
export { DEFAULT_PANEL_ID, clampWidth, closePanel, collapsePanel, emptyDock, expandPanel, isCollapsed, isOpen, openPanel, othersWidth, setPanelWidth, } from './layout/panel-dock-logic.js';
export { FIELD_ANCHOR_STYLE, FIELD_LABEL_STYLE, Input, NumberInput, PrefixedInput, fieldMetricsOf, } from './inputs/Field.js';
//# sourceMappingURL=index.js.map