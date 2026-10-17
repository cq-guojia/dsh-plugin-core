/**
 * 路径取末段（文件名显示用）。`/` 与 `\` 都认。
 *
 * ⚠️ 必须**先剔尾斜杠**：「目录」常用尾斜杠表达（`a.md` / `b/`），
 * 不剔的话 `baseNameOf('b/')` 会返回空串 ⇒ 目录在界面上渲染成空标签。
 */
export declare function baseNameOf(path: string): string;
/**
 * 按 **UTF-8 字节**截断（中文按 3 字节算，不会截断出半个字）。
 * `suffix` 计入总长度；不需要省略号就传 `suffix: ''`。
 */
export declare function truncateBytes(text: string, maxBytes: number, suffix?: string): string;
/** 去首尾空白；非字符串（null / undefined / number）安全返回空串。 */
export declare function safeTrim(value: unknown): string;
//# sourceMappingURL=string.d.ts.map