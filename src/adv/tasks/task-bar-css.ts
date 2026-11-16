// TaskBar（后台任务中心的通用展示栏）样式。
//
// 语义边界：触发器本体是 Button、下拉容器是 PanelSurface，两边的皮肤都不在本文件；
// 这里只登记「栏」独有的小绿点、计数与行内排版。类名固定 `dshpc-taskbar*`，
// 颜色一律吃 --dshpc-* token，深色由 design 的 token 深色段自动生效。
export { TASK_BAR_CSS } from './task-bar-css.generated.js'
