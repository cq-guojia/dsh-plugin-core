/**
 * 整页的 flex 行（左侧导航 + 主区 + 分栏）——**分栏的挂载点**。
 *
 * `PanelDock` 是布局成员（挤窄主区），所以 `openFilePreview({ mount })` 必须拿到这一层
 * 元素本身；DemoPage 用 ref 把它登记进来，explorer 那一页的按钮取它当 mount。
 * 拿不到就是还没挂载（理论上按钮已在该页内，不会发生）——调用方如期跳过。
 */
export const pageRow: { element: HTMLElement | null } = { element: null }
