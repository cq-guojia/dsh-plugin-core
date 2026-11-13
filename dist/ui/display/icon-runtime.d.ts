import { type ParsedIconFont } from './icon-parse.js';
/** 当前是否深色；宿主切主题时自动重渲染。宿主外（node 自检）恒 false。 */
export declare function useHostDark(): boolean;
/**
 * 拉取并解析一套库的在线 CSS（同会话只请求一次）。
 *
 * @param id - 库 id（同名缓存键）。
 * @param url - 该库的在线样式地址。
 */
export declare function fetchIconFont(id: string, url: string): Promise<ParsedIconFont>;
/**
 * 预取一套库的名字清单（多色库挂 `<link>` 时顺手调，缩短「首次切到深色」的等待）。
 * 失败不抛：清单只是可选优化，缺了仍然按原名字渲染。
 */
export declare function primeIconFont(id: string, url: string): void;
/** 该库的图标名集合；未就绪时 `null`（调用方先用原名字渲染）。 */
export declare function useIconNames(id: string): ReadonlySet<string> | null;
/**
 * 深色下该用哪个字形：库里有 `<名字>-dark` 就换成它，没有就原名字。
 *
 * 纯函数（名字集合由调用方给），便于单测；`names` 为 `null`（清单还没到）时按「没有」处理。
 */
export declare function darkGlyphName(glyph: string, names: ReadonlySet<string> | null): string;
//# sourceMappingURL=icon-runtime.d.ts.map