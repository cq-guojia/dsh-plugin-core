/**
 * 字体图标的运行时状态：**多色库的明暗字形**与**在线名字清单**。
 *
 * 为什么需要这一层：
 *  - 多色（iconfont 的 Color fonts）颜色随字形走，CSS `color` 改不动 ⇒ 宿主切深色时得换成
 *    另一个 `-dark` 字形。约定（用户 2026-11-13 定）：库里有 `<名字>-dark` 就用它，没有就
 *    继续用原名字（说明这个字形亮暗通用）。
 *  - 「有没有」只能查在线 CSS 的类名清单：CSS 无法表达「如果存在则覆盖」—— 两条选择器
 *    特异性相同的规则谁赢取决于 iconfont 生成的顺序，我们控制不了。
 *
 * 名字清单与 `loadIconFont` 共用同一份缓存、同一个请求（同一 URL，浏览器 HTTP 缓存命中），
 * 不额外发第二次。
 */
import { useSyncExternalStore } from 'react';
import { parseFontCss } from './icon-parse.js';
/** 宿主明暗判据（唯一）：`body[data-ds-dark-theme]`。禁用 prefers-color-scheme。 */
const DARK_ATTR = 'data-ds-dark-theme';
function hostDark() {
    if (typeof document === 'undefined')
        return false;
    const body = document.body;
    return body === null ? false : body.hasAttribute(DARK_ATTR);
}
const darkListeners = new Set();
let darkObserver = null;
/** 全局只建一个 observer：第一个订阅者挂上，最后一个走了拆掉。 */
function subscribeDark(listener) {
    darkListeners.add(listener);
    if (darkObserver === null && typeof MutationObserver === 'function' && typeof document !== 'undefined') {
        const body = document.body;
        if (body !== null) {
            darkObserver = new MutationObserver(() => {
                for (const one of darkListeners)
                    one();
            });
            darkObserver.observe(body, { attributeFilter: [DARK_ATTR] });
        }
    }
    return () => {
        darkListeners.delete(listener);
        if (darkListeners.size === 0 && darkObserver !== null) {
            darkObserver.disconnect();
            darkObserver = null;
        }
    };
}
/** 当前是否深色；宿主切主题时自动重渲染。宿主外（node 自检）恒 false。 */
export function useHostDark() {
    return useSyncExternalStore(subscribeDark, hostDark, () => false);
}
const tasks = new Map();
const nameSets = new Map();
const nameListeners = new Set();
/**
 * 拉取并解析一套库的在线 CSS（同会话只请求一次）。
 *
 * @param id - 库 id（同名缓存键）。
 * @param url - 该库的在线样式地址。
 */
export function fetchIconFont(id, url) {
    const hit = tasks.get(id);
    if (hit !== undefined)
        return hit;
    const task = fetch(url)
        .then((res) => res.text())
        .then(parseFontCss)
        .then((font) => {
        nameSets.set(id, new Set(font.names));
        for (const one of nameListeners)
            one();
        return font;
    });
    tasks.set(id, task);
    task.catch(() => {
        tasks.delete(id);
    });
    return task;
}
/**
 * 预取一套库的名字清单（多色库挂 `<link>` 时顺手调，缩短「首次切到深色」的等待）。
 * 失败不抛：清单只是可选优化，缺了仍然按原名字渲染。
 */
export function primeIconFont(id, url) {
    if (nameSets.has(id) || tasks.has(id) || typeof fetch !== 'function')
        return;
    void fetchIconFont(id, url).catch(() => { });
}
function subscribeNames(listener) {
    nameListeners.add(listener);
    return () => {
        nameListeners.delete(listener);
    };
}
/** 该库的图标名集合；未就绪时 `null`（调用方先用原名字渲染）。 */
export function useIconNames(id) {
    return useSyncExternalStore(subscribeNames, () => nameSets.get(id) ?? null, () => null);
}
/**
 * 深色下该用哪个字形：库里有 `<名字>-dark` 就换成它，没有就原名字。
 *
 * 纯函数（名字集合由调用方给），便于单测；`names` 为 `null`（清单还没到）时按「没有」处理。
 */
export function darkGlyphName(glyph, names) {
    return names?.has(`${glyph}-dark`) === true ? `${glyph}-dark` : glyph;
}
//# sourceMappingURL=icon-runtime.js.map