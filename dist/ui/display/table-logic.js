/**
 * 表格纯逻辑：列树 → 表头单元格（colSpan / rowSpan）。
 *
 * 零 React 运行时依赖（只 `import type`，编译后不留痕迹），可被 node 单测直接引。
 * 组件层只负责把这里算好的表头画出来；分组表头到底占几行、跨几列，一律由本文件决定。
 *
 * 列模型：`children` 存在且非空 ⇒ 该列是分组表头（自身 key 不产出单元格，只做表头）；
 * 否则是叶子列，`rows` 里按叶子 key 取单元格内容。
 */
/** 叶子列判断：没有 children 或 children 为空。 */
export function isLeafColumn(column) {
    return column.children === undefined || column.children.length === 0;
}
/**
 * 单元格值是不是「对象写法」（跨列 / 跨行 / 对齐）。
 *
 * 判别不引 React：React 元素一定有 `$$typeof`（内部标记），而单元格对象没有 ——
 * 用它把「传进来一个 React 元素」和「传进来一个单元格配置」分开。
 * 放在纯逻辑层，node 单测可直接覆盖。
 */
export function isTableCellSpec(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    if ('$$typeof' in value)
        return false;
    return 'content' in value;
}
/** 按深度优先顺序取全部叶子列（表格的列顺序 = 数据格的列顺序）。 */
export function leafColumns(columns) {
    const out = [];
    for (const column of columns) {
        const children = column.children;
        if (children === undefined || children.length === 0)
            out.push(column);
        else
            out.push(...leafColumns(children));
    }
    return out;
}
/** 列树深度 = 表头行数（全叶子列时为 1）。 */
export function tableDepth(columns) {
    let depth = 1;
    for (const column of columns) {
        const children = column.children;
        if (children === undefined || children.length === 0)
            continue;
        depth = Math.max(depth, 1 + tableDepth(children));
    }
    return depth;
}
/**
 * 列树 → 逐行表头。
 *
 * - 叶子列：`rowSpan = 深度 - 当前层`，一直竖跨到表头底部；
 * - 分组列：`colSpan = 其下叶子数`，`rowSpan = 1`。
 *
 * 例：`[ID, Patient[Name, Age], Status]` ⇒ 第 0 行 `[ID(1×2), Patient(2×1), Status(1×2)]`，
 * 第 1 行 `[Name(1×1), Age(1×1)]`。
 */
export function headerRows(columns) {
    const rows = [];
    const depth = tableDepth(columns);
    for (let level = 0; level < depth; level += 1)
        rows.push([]);
    const visit = (column, level) => {
        const children = column.children;
        if (children === undefined || children.length === 0) {
            rows[level].push({ column, colSpan: 1, rowSpan: depth - level, leafKeys: [column.key] });
            return [column.key];
        }
        const keys = [];
        for (const child of children)
            keys.push(...visit(child, level + 1));
        rows[level].push({ column, colSpan: keys.length, rowSpan: 1, leafKeys: keys });
        return keys;
    };
    for (const column of columns)
        visit(column, 0);
    return rows;
}
//# sourceMappingURL=table-logic.js.map