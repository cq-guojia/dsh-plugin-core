/**
 * 快捷工具栏（UI 基础层）：**右侧悬浮的一列圆钮**，内置「回到顶部」，并可挂自定义按钮。
 *
 * 用法：
 *   <QuickToolbar
 *     anchorId="dshpc-main"
 *     onAction={(id) => …}
 *     items={[{ id: 'search', icon: <SearchIcon />, label: '搜索' }]}
 *   />
 *
 * 行为（2026-10-31 用户拍板）：
 * - **纵向恒定**贴屏幕底边，距离 `offset`（默认 16px）；按钮从下往上排。
 * - **横向默认**贴屏幕右缘、留 `offset`；给了 `anchorId` / `anchor()` 就贴到那个控件的
 *   **右缘外侧**，同样留 `offset`。右侧放不下（再留一个 `offset` 后越界）就退回贴屏幕右缘。
 *   控件找不到按「跟随窗口」处理，不报错。
 * - 内置「回到顶部」默认 `when: 'scroll'`、阈值 320：滚过才出现；可传 `backToTop: false` 关掉，
 *   或用 `{ order, label, threshold }` 调整。
 * - 自定义项：`icon` / `label` / `onClick`；`visible` / `when` / `order` / `threshold` / `color` /
 *   `fgColor` 都可配。点击后先调 `onClick`，再统一回调 `onAction(id, item)`。
 * - 滚动容器默认取工具栏最近的「可纵向滚动」祖先，也可以显式给 `scrollContainer`。
 * - 显隐切换带 0.2s 动画：挂载淡入，消失先淡出、播完才卸载（`reduced-motion` 下关闭）。
 *
 * 样式只注入自己那一份（`controls/quick-toolbar.css`），横向位置 / 尺寸 / 间距由本组件在
 * style 上实时写入，不写死 CSS。
 */
import { createElement as h } from 'react';
import { type QuickToolbarBackToTop, type QuickToolbarItem } from './quick-toolbar-logic.js';
export interface QuickToolbarProps {
    /** 自定义按钮；按数组顺序排在「回到顶部」下面。 */
    items?: QuickToolbarItem[];
    /** 内置回顶部：`false` 关掉；对象可调 `order` / `label` / `threshold`。 */
    backToTop?: boolean | QuickToolbarBackToTop;
    /** 自定义项点击后的统一回调（在单项 `onClick` 之后触发）。 */
    onAction?: (id: string, item: QuickToolbarItem) => void;
    /** 与屏幕 / 锚点右缘、屏幕底边的距离（px，默认 16）。 */
    offset?: number;
    /** 相邻按钮的纵向间距（px，默认 12）。 */
    gap?: number;
    /** 按钮直径（px，默认 44）。 */
    size?: number;
    /** 跟随这个 id 的控件：横向贴它的右缘外侧；不传 = 跟随窗口右缘。 */
    anchorId?: string;
    /** 动态锚点函数（优先于 `anchorId`）：返回 null 时按跟随窗口处理。 */
    anchor?: () => HTMLElement | null;
    /** 滚动容器；不传则取工具栏最近的可纵向滚动祖先，再退回窗口。 */
    scrollContainer?: HTMLElement | (() => HTMLElement | null);
    /** 无障碍名，默认内置字典「快捷工具栏」。 */
    ariaLabel?: string;
    /** 追加 class（只允许补布局）。 */
    className?: string;
}
/** 右侧浮动的快捷工具栏：内置回顶部 + 自定义按钮。 */
export declare function QuickToolbar(props: QuickToolbarProps): ReturnType<typeof h>;
//# sourceMappingURL=QuickToolbar.d.ts.map