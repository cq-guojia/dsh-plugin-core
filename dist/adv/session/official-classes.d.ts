/** 本仓会话预览当前对齐的宿主版本（单一真源；升级核对工具读这里，散落的版本注释不作真源）。 */
export declare const ALIGNED_HOST_VERSION = "0.2.2-rc.3";
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
 * 扫描 document 里官方包注入的 style 标签，按模块缓存解析结果。
 * 官方 CSS module 分属多个独立包、可能分批注入，只缓存「第一批」会让后注入的模块
 * 永远取不到类名 ⇒ 标签数一变就重扫。
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
//# sourceMappingURL=official-classes.d.ts.map