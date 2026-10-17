/**
 * 路径取末段（文件名显示用）。`/` 与 `\` 都认。
 *
 * ⚠️ 必须**先剔尾斜杠**：「目录」常用尾斜杠表达（`a.md` / `b/`），
 * 不剔的话 `baseNameOf('b/')` 会返回空串 ⇒ 目录在界面上渲染成空标签。
 */
export function baseNameOf(path) {
    const trimmed = path.replace(/[\\/]+$/, '');
    if (trimmed === '')
        return path;
    const cut = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'));
    return cut < 0 ? trimmed : trimmed.slice(cut + 1);
}
/**
 * 按 **UTF-8 字节**截断（中文按 3 字节算，不会截断出半个字）。
 * `suffix` 计入总长度；不需要省略号就传 `suffix: ''`。
 */
export function truncateBytes(text, maxBytes, suffix = '…') {
    if (maxBytes <= 0)
        return '';
    const encoder = new TextEncoder();
    if (encoder.encode(text).length <= maxBytes)
        return text;
    const suffixBytes = encoder.encode(suffix).length;
    const budget = maxBytes - suffixBytes;
    if (budget <= 0)
        return suffix.slice(0, maxBytes);
    // 二分找能放进 budget 的最大前缀（按码点切，保证不切半个字符）
    const chars = [...text];
    let lo = 0;
    let hi = chars.length;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (encoder.encode(chars.slice(0, mid).join('')).length <= budget)
            lo = mid;
        else
            hi = mid - 1;
    }
    return chars.slice(0, lo).join('') + suffix;
}
/** 去首尾空白；非字符串（null / undefined / number）安全返回空串。 */
export function safeTrim(value) {
    return typeof value === 'string' ? value.trim() : '';
}
//# sourceMappingURL=string.js.map