/** 滚过多少像素才触发 `when: 'scroll'`。 */
export const DEFAULT_SCROLL_THRESHOLD = 320;
/**
 * 算出工具栏左缘的 x 坐标。
 *
 * - 没有锚点（或锚点取不到）：贴视口右缘，留 `offset`。
 * - 有锚点：贴锚点右缘外侧，留 `offset`；但右侧还必须再留 `offset`，
 *   放不下（`锚点右缘 + offset + size + offset > 视口宽`）就退回贴视口右缘。
 */
export function resolveToolbarLeft(geometry, anchorRight) {
    const { viewportWidth, offset, size } = geometry;
    const pinned = Math.max(0, viewportWidth - offset - size);
    if (anchorRight === null || !Number.isFinite(anchorRight))
        return pinned;
    const anchored = anchorRight + offset;
    return anchored + size + offset <= viewportWidth ? anchored : pinned;
}
/**
 * 排序：先按 `order`，相同 order 时内置回顶部在前、自定义项按数组顺序。
 * 不修改入参。
 */
export function sortToolbarEntries(entries) {
    return [...entries].sort((a, b) => {
        if (a.order !== b.order)
            return a.order - b.order;
        if (a.kind !== b.kind)
            return a.kind === 'backtop' ? -1 : 1;
        return a.index - b.index;
    });
}
/** 某一项此刻是否该出现（显隐判定）。 */
export function isToolbarEntryVisible(entry, scrollTop) {
    if (entry.visible === false)
        return false;
    if ((entry.when ?? 'always') === 'scroll') {
        return scrollTop > (entry.threshold ?? DEFAULT_SCROLL_THRESHOLD);
    }
    return true;
}
//# sourceMappingURL=quick-toolbar-logic.js.map