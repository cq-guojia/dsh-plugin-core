import { TOKENS_CSS_TEMPLATE } from './tokens-css.js';
/** 明暗判据（宿主启动脚本 `toggleAttribute` 写入 body，是用户在客户端里的选择）。 */
export const DARK_THEME_SELECTOR = 'body[data-ds-dark-theme]';
/** 全生态统一的 CSS 变量前缀。 */
const CSS_PREFIX = 'dshpc';
/** token 域固定名：变量定义必须先于消费它的规则出现。 */
const TOKENS_DOMAIN = 'tokens';
/**
 * 领一套本插件专属的样式设施。
 *
 * 为什么是工厂而不是模块级单例：单例只有一个固定 style id，
 * 多个插件同处一页时会抢同一个 `<style>` 标签、后挂载的覆盖先挂载的（见需求文档 §5.2）。
 */
export function createStyleKit(options) {
    const { id } = options;
    if (id === '')
        throw new Error('dsh-plugin-core/design: id 不能为空');
    const tokensCss = TOKENS_CSS_TEMPLATE;
    const domains = new Map();
    let tag = null;
    let dirty = true;
    const composeCss = () => {
        const entries = [...domains.entries()];
        entries.sort((a, b) => (a[0] === TOKENS_DOMAIN ? -1 : b[0] === TOKENS_DOMAIN ? 1 : 0));
        return entries.map(([, css]) => css).join('\n');
    };
    const flush = () => {
        if (tag === null)
            return;
        tag.textContent = composeCss();
        dirty = false;
    };
    const ensureStyles = () => {
        if (typeof document === 'undefined')
            return;
        if (tag === null || !tag.isConnected) {
            const head = document.head;
            if (head === null)
                return;
            const found = document.getElementById(id);
            if (found !== null)
                tag = found;
            else {
                const el = document.createElement('style');
                el.id = id;
                head.appendChild(el);
                tag = el;
            }
            dirty = true;
        }
        if (dirty)
            flush();
    };
    const registerStyle = (domain, css) => {
        if (domains.get(domain) === css)
            return;
        domains.set(domain, css);
        dirty = true;
        if (tag?.isConnected === true)
            flush();
    };
    const dispose = () => {
        if (tag?.isConnected === true)
            tag.remove();
        tag = null;
        domains.clear();
        dirty = true;
    };
    return {
        id,
        tokensCss,
        cssVar: (name) => `--${CSS_PREFIX}-${name}`,
        registerStyle,
        ensureStyles,
        dispose,
        applyStyle: (domain, css) => {
            registerStyle(domain, css);
            ensureStyles();
        },
    };
}
//# sourceMappingURL=style-kit.js.map