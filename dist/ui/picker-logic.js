// 选择器的纯逻辑（与 React 无关，便于单测）。
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
/** 按关键词过滤（大小写不敏感，匹配 label；整组无命中则整组去掉）。 */
export function filterGroups(groups, query) {
    const q = query.trim().toLowerCase();
    if (q === '')
        return groups;
    const out = [];
    for (const g of groups) {
        const hit = g.options.filter((o) => o.label.toLowerCase().includes(q));
        if (hit.length > 0)
            out.push({ ...g, options: hit });
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
/** 值落在哪个组里（cascade 形态用来反推 provider）。 */
export function groupOf(groups, value) {
    if (value === '')
        return undefined;
    return groups.find((g) => g.options.some((o) => o.value === value));
}
//# sourceMappingURL=picker-logic.js.map