/**
 * 字节数 → 人话（`12 KB` / `3.4 MB`）。
 * 0 与负数 ⇒ `—`（不显示「0 B」这种假精确）。
 */
export declare function formatBytes(bytes: number): string;
/** 计数的大众格式：≥1K 用 K、≥1M 用 M（`1234` → `1.2K`、`123456` → `123K`）。 */
export declare function formatCount(n: number): string;
//# sourceMappingURL=number.d.ts.map