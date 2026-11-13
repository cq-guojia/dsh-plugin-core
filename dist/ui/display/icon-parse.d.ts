/**
 * 从 iconfont 在线 CSS 里读出这套库的事实 —— 家族、基础类、前缀、全部图标名。
 *
 * 为什么运行时读而不是构建期生成清单：远程 CSS 带 `access-control-allow-origin: *`，
 * fetch 一次就能拿到原文；平台加图标 / 换链接后页面刷新即见，仓库里不留需要同步的生成物。
 *
 * 只解析结构，不改写样式：@font-face 与 glyph 规则仍由 `<link>` 加载的远程 CSS 提供。
 */
/** 解析结果：一套字体库的全部可枚举事实。 */
export interface ParsedIconFont {
    /** `@font-face` 的 font-family。 */
    family: string;
    /** 带 `font-family` 声明的那个类（基础类）。 */
    baseClass: string;
    /** glyph 类名的公共前缀，如 `dshpc-i-`。 */
    prefix: string;
    /** 图标名（已去掉前缀），可直接喂给 `Icon` 的 `name`。 */
    names: string[];
}
/**
 * 解析一份 iconfont CSS。
 *
 * @param css - 远程 CSS 原文。
 * @returns 家族 / 基础类 / 前缀 / 图标名。
 * @throws 结构不认识（没有 font-family、没有 glyph 类、找不到基础类）时抛错 —— 不静默返回空清单。
 */
export declare function parseFontCss(css: string): ParsedIconFont;
//# sourceMappingURL=icon-parse.d.ts.map