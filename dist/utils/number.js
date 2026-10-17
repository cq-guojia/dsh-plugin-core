/**
 * 字节数 → 人话（`12 KB` / `3.4 MB`）。
 * 0 与负数 ⇒ `—`（不显示「0 B」这种假精确）。
 */
export function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0)
        return '—';
    if (bytes < 1024)
        return `${bytes} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let value = bytes / 1024;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    return `${value >= 10 ? String(Math.round(value)) : value.toFixed(1)} ${units[unit]}`;
}
/** 计数的大众格式：≥1K 用 K、≥1M 用 M（`1234` → `1.2K`、`123456` → `123K`）。 */
export function formatCount(n) {
    if (!Number.isFinite(n))
        return '—';
    const trim = (v) => Math.abs(v) >= 100 ? String(Math.round(v)) : v.toFixed(1).replace(/\.0$/, '');
    if (Math.abs(n) >= 1000000)
        return `${trim(n / 1000000)}M`;
    if (Math.abs(n) >= 1000)
        return `${trim(n / 1000)}K`;
    return String(n);
}
//# sourceMappingURL=number.js.map