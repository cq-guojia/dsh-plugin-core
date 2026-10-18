/** 明暗判据（宿主启动脚本 `toggleAttribute` 写入 body，是用户在客户端里的选择）。 */
export declare const DARK_THEME_SELECTOR = "body[data-ds-dark-theme]";
export interface StyleKitOptions {
    /** `<style>` 标签 id —— 多插件同页靠它互不覆盖，必须插件内唯一。 */
    id: string;
    /** CSS 变量前缀，如 `acme` ⇒ `--acme-fg`。 */
    prefix: string;
}
export interface StyleKit {
    readonly id: string;
    readonly prefix: string;
    /** 已替换前缀的 token CSS（可直接 register 到 tokens 域）。 */
    readonly tokensCss: string;
    /** 拼一个本插件的 CSS 变量名：`cssVar('fg')` ⇒ `--acme-fg`。 */
    cssVar(name: string): string;
    /** 登记一个域的 CSS（同名重复登记 = 覆盖）。 */
    registerStyle(domain: string, css: string): void;
    /** 确保标签已挂载且内容最新（幂等；无 document 时静默跳过）。 */
    ensureStyles(): void;
    /** 登记 + 立刻确保挂载。 */
    applyStyle(domain: string, css: string): void;
    /** 卸载清理：撤掉挂载的 `<style>` 标签并清空登记域（插件卸载 / HMR 时用）。 */
    dispose(): void;
}
/** 把 token 原文的前缀换成调用方自己的。 */
export declare function buildTokensCss(prefix: string): string;
/**
 * 领一套本插件专属的样式设施。
 *
 * 为什么是工厂而不是模块级单例：单例只有一个固定 style id 与固定变量前缀，
 * 多个插件同处一页时会抢同一个 `<style>` 标签、变量互相覆盖（见需求文档 §5.2）。
 */
export declare function createStyleKit(options: StyleKitOptions): StyleKit;
//# sourceMappingURL=style-kit.d.ts.map