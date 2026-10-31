/**
 * QuickToolbar 的纯逻辑（零 DOM、零 React 运行时）。
 *
 * 只回答三件事：横向贴哪、按钮按什么顺序排、某一项此刻该不该出现。
 * 真机尺寸 / 滚动 / 锚点解析留在组件里 —— 这里全部可直接进 Node 单测。
 */
import type { ReactNode } from 'react';
/** 某一项的显隐时机：`always` 一直显示，`scroll` 滚过阈值才显示。 */
export type QuickToolbarWhen = 'always' | 'scroll';
/** 自定义按钮。 */
export interface QuickToolbarItem {
    /** 唯一标识；`onAction` 里原样回传。 */
    id: string;
    /** 图标（自绘或调用方自己的图标组件渲染结果）。 */
    icon: ReactNode;
    /** 无障碍名，同时作为 title。 */
    label: string;
    /** 单项点击回调（与 `onAction` 都会触发）。 */
    onClick?: () => void;
    /** `false` = 永久隐藏；默认显示。 */
    visible?: boolean;
    /** 默认 `always`。 */
    when?: QuickToolbarWhen;
    /** 排序值，越小越靠上；默认按数组下标 + 1（内置回顶部默认 0 在最上）。 */
    order?: number;
    /** `when: 'scroll'` 的触发阈值（px），默认 320。 */
    threshold?: number;
    /** 覆盖底色（任意 CSS 颜色值）。 */
    color?: string;
    /** 覆盖图标 / 文字色（任意 CSS 颜色值）。 */
    fgColor?: string;
}
/** 内置回顶部的配置；传 `false` 关掉。 */
export interface QuickToolbarBackToTop {
    /** 排序值，默认 0（最上）。 */
    order?: number;
    /** 无障碍名，默认内置字典「回到顶部」。 */
    label?: string;
    /** 滚动超过这个距离（px）才出现，默认 320。 */
    threshold?: number;
}
/** 滚过多少像素才触发 `when: 'scroll'`。 */
export declare const DEFAULT_SCROLL_THRESHOLD = 320;
/** 排序用条目：组件把内置回顶部与自定义项都摊平成这个形状。 */
export interface ToolbarEntry {
    id: string;
    kind: 'backtop' | 'custom';
    order: number;
    /** 自定义项在 `items` 里的下标；内置项固定 0。 */
    index: number;
}
/** 横向贴边所需的三个数。 */
export interface ToolbarGeometry {
    /** 视口宽（documentElement.clientWidth）。 */
    viewportWidth: number;
    /** 与屏幕 / 锚点右缘的距离。 */
    offset: number;
    /** 按钮直径。 */
    size: number;
}
/**
 * 算出工具栏左缘的 x 坐标。
 *
 * - 没有锚点（或锚点取不到）：贴视口右缘，留 `offset`。
 * - 有锚点：贴锚点右缘外侧，留 `offset`；但右侧还必须再留 `offset`，
 *   放不下（`锚点右缘 + offset + size + offset > 视口宽`）就退回贴视口右缘。
 */
export declare function resolveToolbarLeft(geometry: ToolbarGeometry, anchorRight: number | null): number;
/**
 * 排序：先按 `order`，相同 order 时内置回顶部在前、自定义项按数组顺序。
 * 不修改入参。
 */
export declare function sortToolbarEntries<T extends ToolbarEntry>(entries: readonly T[]): T[];
/** 某一项此刻是否该出现（显隐判定）。 */
export declare function isToolbarEntryVisible(entry: Pick<QuickToolbarItem, 'visible' | 'when' | 'threshold'>, scrollTop: number): boolean;
//# sourceMappingURL=quick-toolbar-logic.d.ts.map