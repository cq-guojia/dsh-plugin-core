/** 未显式给下限时控件根盒的默认占位宽度。尺寸只由根盒持有，触发器不自带下限。 */
export const PICKER_DEFAULT_MIN_WIDTH = 120;
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
/**
 * 把「不在候选里的受控值」作为一条真实保留项插回目录（领域选择器用）。
 *
 * 目录刷新 / 供应商被摘掉后，调用方持有的旧值仍然真实存在；通用 `labelsOf` 找不到它就
 * 会让触发器退回 placeholder，级联态还会因反推不出 provider 把模型框禁用 —— 表现为
 * 静默丢掉用户的选择。这里按 `provider/id` 的前缀把旧值归到对应组（没有该组就补一组），
 * label 一律用旧值原文，绝不编造模型名。返回值 `retained` 供 degraded 提示使用。
 *
 * 通用 `Picker` 不调用它：纯零件的数据由调用方给，是否保留旧值由调用方决定。
 */
export function retainSelectedValue(groups, value) {
    if (value === undefined || value === '')
        return { groups, retained: false };
    if (flattenOptions(groups).some((o) => o.value === value))
        return { groups, retained: false };
    const slash = value.indexOf('/');
    const provider = slash > 0 ? value.slice(0, slash) : '';
    const option = { value, label: value };
    const group = groups.find((g) => g.value === provider && g.value !== '');
    if (group !== undefined) {
        return {
            groups: groups.map((g) => (g === group ? { value: g.value, label: g.label, options: [option, ...g.options] } : g)),
            retained: true,
        };
    }
    return {
        groups: [...groups, { value: provider, label: provider, options: [option] }],
        retained: true,
    };
}
/** 控件宽度解析：把 width / minWidth / maxWidth 译成内联样式（Picker 根盒与下拉搜索框共用）。
 * 定宽（width）忽略 min/max 并锁定三值；否则各自生效，缺省下限由 Picker 根盒补
 * PICKER_DEFAULT_MIN_WIDTH，上限沿用 CSS 根盒的 100%。搜索框不补默认下限（它铺满菜单）。
 * 数值按 px 处理，字符串原样透传（含百分比的 clamp 也照传，由根盒按父宽解析）。 */
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
 * min-width 必须自己带上可用宽度上限：CSS 里 min-width 大于 max-width 时浏览器取 min-width，
 * 靠右的触发器会因此被撑出视口，不能靠 max-width 兜底（2026-11-10 真机）。 */
export function resolveMenuSizing(referenceWidth, availableWidth, searchSizing) {
    const floor = searchSizing?.width ?? searchSizing?.minWidth;
    const cssLen = (v) => (typeof v === 'number' ? `${v}px` : v);
    const upper = Math.min(480, availableWidth ?? 480);
    const desired = floor === undefined
        ? `${referenceWidth}px`
        : `max(${referenceWidth}px, calc(${cssLen(floor)} + 8px))`;
    return {
        minWidth: `min(${desired}, ${upper}px)`,
        maxWidth: `${upper}px`,
    };
}
//# sourceMappingURL=picker-logic.js.map