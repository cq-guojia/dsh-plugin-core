/**
 * 纯路径方法 —— 只做字符串切分 / 拼接，不碰宿主、不依赖 React / DOM。
 *
 * 约定（与工作区文件 API 一致）：POSIX `/` 分隔；空串 `''` 表示根。
 * 与宿主无关：这里不调任何宿主 API，路径字符串由调用方传入。
 */
/** 扩展名 → 图片 MIME；不是已知图片扩展名返回 `undefined`。 */
export declare function mimeOf(path: string): string | undefined;
/** 取扩展名（小写、不含点）；无扩展名返回 `''`。 */
export declare function extOf(path: string): string;
/** 路径分段（面包屑用）：`a/b/c` ⇒ `['a','b','c']`；空串 = 根。 */
export declare function crumbsOf(path: string): string[];
/** 父目录（无父 = 空串，表示根）。 */
export declare function parentOf(path: string): string;
/** 拼接子路径，避免多余斜杠。 */
export declare function joinPath(dir: string, name: string): string;
//# sourceMappingURL=path.d.ts.map