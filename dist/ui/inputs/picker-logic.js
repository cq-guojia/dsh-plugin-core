/** 两种输入归一成 groups：给了 `options` 就当成一个无标题的组。 */
export function toGroups(groups, options) {
    if (groups !== undefined && groups.length > 0)
        return groups;
    const flat = options ?? [];
    return flat.length === 0 ? [] : [{ value: '', label: '', options: flat }];
}
export function flattenOptions(groups) {
    const out = [];
    for (const g of groups)
        out.push(...g.options);
    return out;
}
/** 分组目录平铺成「厂商-模型」选项：value 原样不动，只给 label 加组名前缀。 */
export function toFlatOptions(groups) {
    return groups.flatMap((g) => g.options.map((o) => ({
        value: o.value,
        label: g.label === '' ? o.label : `${g.label}-${o.label}`,
    })));
}
/** 按关键词过滤（大小写不敏感，匹配 label 与 keywords 拼起来的串；整组无命中则整组去掉）。 */
export function filterGroups(groups, query) {
    const q = query.trim().toLowerCase();
    if (q === '')
        return groups;
    const out = [];
    for (const g of groups) {
        const hit = g.options.filter((o) => `${o.label} ${o.keywords ?? ''}`.toLowerCase().includes(q));
        if (hit.length > 0)
            out.push({ ...g, options: hit });
    }
    return out;
}
/** 按选项条数跨组切片（首屏 limit 条）；count <= 0 视为不分页，整组没被截到就复用原对象。 */
export function sliceGroups(groups, count) {
    if (!(count > 0))
        return groups;
    const out = [];
    let left = count;
    for (const g of groups) {
        if (left <= 0)
            break;
        out.push(left >= g.options.length ? g : { ...g, options: g.options.slice(0, left) });
        left -= g.options.length;
    }
    return out;
}
/** 多选切换；`max` 达到上限时不再添加（返回原数组，不静默截断）。 */
export function toggleValue(current, value, max) {
    const idx = current.indexOf(value);
    if (idx >= 0)
        return current.filter((v) => v !== value);
    if (max !== undefined && current.length >= max)
        return [...current];
    return [...current, value];
}
export function labelsOf(groups, values) {
    const all = flattenOptions(groups);
    const out = [];
    for (const v of values) {
        const hit = all.find((o) => o.value === v);
        if (hit !== undefined)
            out.push(hit.label);
    }
    return out;
}
/** 值落在哪个组里（按模型值反推供应商等场景）。 */
export function groupOf(groups, value) {
    if (value === '')
        return undefined;
    return groups.find((g) => g.options.some((o) => o.value === value));
}
/** 触发器宽度解析：把 width / minWidth / maxWidth 译成内联样式。
 * 定宽（width）忽略 min/max 并锁定三值；否则各自生效，缺省沿用 CSS 默认（min 120px、max 100%）。
 * 数值按 px 处理，字符串原样透传。 */
export function resolveTriggerSizing(opts) {
    const px = (v) => (typeof v === 'number' ? `${v}px` : v);
    if (opts.width !== undefined) {
        const w = px(opts.width);
        return { width: w, minWidth: w, maxWidth: w };
    }
    const style = {};
    if (opts.minWidth !== undefined)
        style.minWidth = px(opts.minWidth);
    if (opts.maxWidth !== undefined)
        style.maxWidth = px(opts.maxWidth);
    return style;
}
/** 菜单宽度：至少与触发器同宽；搜索框设了下限时菜单跟着加宽，
 * 否则 100% 宽的搜索框会被菜单的 overflow:hidden 裁掉。
 * 8px = .dshpc-picker__head 左右各 4px 内距（改该 CSS 时同步改这里，有自检盯着）。
 * min-width 大于 max-width 时浏览器以 min-width 为准，所以显式设宽不会被 480 上限卡住。 */
export function resolveMenuSizing(referenceWidth, availableWidth, searchSizing) {
    const floor = searchSizing?.width ?? searchSizing?.minWidth;
    const cssLen = (v) => (typeof v === 'number' ? `${v}px` : v);
    return {
        minWidth: floor === undefined
            ? `${referenceWidth}px`
            : `max(${referenceWidth}px, calc(${cssLen(floor)} + 8px))`,
        maxWidth: `${Math.min(480, availableWidth ?? 480)}px`,
    };
}
//# sourceMappingURL=picker-logic.js.map