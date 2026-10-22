/** 语义名 → 真实（带哈希）类名。 */
export type OfficialClassMap = Map<string, string>;
/**
 * 解析一段官方 CSS module 文本，抽出 {语义名 → 真实类名}。
 * 纯函数、无 DOM 依赖（冒烟可直接对夹具断言）。
 * @param css - style 标签的 textContent。
 * @returns 语义名到真实类名的映射；解析不出哈希前缀时为空表。
 */
export declare function parseOfficialCss(css: string): OfficialClassMap;
/**
 * 扫描 document 里官方 chat 包注入的 style 标签，按模块缓存解析结果。
 * 无 document（SSR / 冒烟）时返回空表。
 */
export declare function discoverOfficialClasses(): Map<string, OfficialClassMap>;
/** 已发现的官方模块数（0 = 官方样式未注入，调用方应走自绘兜底）。 */
export declare function officialModuleCount(): number;
/**
 * 取一个官方类名；取不到返回 null（调用方回退自绘样式）。
 * @param module - 模块名（如 `ChatView`）。
 * @param semantic - 语义名（如 `frame`）。
 */
export declare function officialClass(module: string, semantic: string): string | null;
/**
 * 取多个官方类名并拼成 className；取不到的项自动跳过。
 * @param pairs - [模块名, 语义名] 列表。
 */
export declare function officialClasses(...pairs: Array<[string, string]>): string;
/** className 拼接：官方类优先，缺失时回退自绘类（两者只取其一，避免样式打架）。 */
export declare function ocOr(module: string, semantic: string, fallback: string): string;
/** 拼接非空类名片段。 */
export declare function cx(...parts: Array<string | null | undefined>): string;
//# sourceMappingURL=official-classes.d.ts.map