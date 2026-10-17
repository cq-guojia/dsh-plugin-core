import { TOKENS_CSS_TEMPLATE } from './tokens-css.js';
/** 明暗判据（宿主启动脚本 `toggleAttribute` 写入 body，是用户在客户端里的选择）。 */
export const DARK_THEME_SELECTOR = 'body[data-ds-dark-theme]';
/** token 原文里写死的前缀，生成时按调用方 prefix 整体替换。 */
const SOURCE_PREFIX = '--tdt-';
/** token 域固定名：变量定义必须先于消费它的规则出现。 */
const TOKENS_DOMAIN = 'tokens';
const PREFIX_RE = /^[a-zA-Z][a-zA-Z0-9-]*$/;
/** 把 token 原文的前缀换成调用方自己的。 */
export function buildTokensCss(prefix) {
    assertPrefix(prefix);
    return TOKENS_CSS_TEMPLATE.split(SOURCE_PREFIX).join(`--${prefix}-`);
}
function assertPrefix(prefix) {
    if (!PREFIX_RE.test(prefix)) {
        throw new Error(`dsh-plugin-core/design: prefix 必须是字母开头、只含字母数字与连字符，收到 ${JSON.stringify(prefix)}`);
    }
}
/**
 * 领一套本插件专属的样式设施。
 *
 * 为什么是工厂而不是模块级单例：单例只有一个固定 style id 与固定变量前缀，
 * 多个插件同处一页时会抢同一个 `<style>` 标签、变量互相覆盖（见需求文档 §5.2）。
 */
export function createStyleKit(options) {
    const { id, prefix } = options;
    assertPrefix(prefix);
    if (id === '')
        throw new Error('dsh-plugin-core/design: id 不能为空');
    const tokensCss = buildTokensCss(prefix);
    const domains = new Map();
    let tag = null;
    let dirty = true;
    const buildCss = () => {
        const entries = [...domains.entries()];
        entries.sort((a, b) => (a[0] === TOKENS_DOMAIN ? -1 : b[0] === TOKENS_DOMAIN ? 1 : 0));
        return entries.map(([, css]) => css).join('\n');
    };
    const flush = () => {
        if (tag === null)
            return;
        tag.textContent = buildCss();
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
        if (tag !== null && tag.isConnected)
            flush();
    };
    return {
        id,
        prefix,
        tokensCss,
        cssVar: (name) => `--${prefix}-${name}`,
        registerStyle,
        ensureStyles,
        applyStyle: (domain, css) => {
            registerStyle(domain, css);
            ensureStyles();
        },
    };
}
//# sourceMappingURL=style-kit.js.map