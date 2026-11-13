/**
 * 图标：字体图标与官方 primitives 图标**同一个组件**，尺寸统一。
 *
 * `name` 的写法（2026-11-13 用户定，组名不可省）：
 *  - `base:sort-down` / `social:jian` —— 字体图标：`库名:图标名`，库名是 {@link ICON_FONTS} 的 key；
 *  - `IconWrapLinesOutlineRegular` —— 官方图标：没有冒号，直接写官方组件名。
 *
 * 找不到就**不渲染**（不回落别的库 —— 显示错图标比空白更难查），并一次性告警。
 * 字体样式仍是运行时 `<link>` 远程加载，字体文件与样式都不入包。
 */
import { createElement as h } from 'react';
import { Official } from '../infra/official-icons.js';
import { parseFontCss } from './icon-parse.js';
export { parseFontCss } from './icon-parse.js';
/** 图标库注册表：加一套库 = 加一项，组件与展示页都不用改。 */
export const ICON_FONTS = {
    base: {
        url: 'https://at.alicdn.com/t/c/font_5252865_mu5upqjaqf.css',
        family: 'dshpc-icons-base',
        baseClass: 'dshpc-icons-base',
        prefix: 'dshpc-i-',
    },
};
/** 尺寸预设（px）；`size` 也可以直接给数字。 */
export const ICON_SIZES = { sm: 14, md: 16, lg: 20, xl: 24 };
/**
 * 保证该库的样式只挂一条 `<link>`。
 *
 * 地址变了就走改 `href`（iconfont 重发布 / 整库换链接都不会插出第二条），
 * 没有 `document`（node 自检）直接返回。
 *
 * @param id - 库 id。
 */
export function ensureIconFont(id) {
    if (typeof document === 'undefined')
        return;
    const font = ICON_FONTS[id];
    let link = document.querySelector(`link[data-dshpc-icon-font="${id}"]`);
    if (link === null) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.dataset.dshpcIconFont = id;
        link.href = font.url;
        document.head.appendChild(link);
    }
    else if (link.href !== font.url) {
        link.href = font.url;
    }
}
const loaded = new Map();
/**
 * 拉取并解析一套库的在线 CSS（同一次会话只发一次请求）。
 *
 * 给「列出这套库有哪些图标」用：远程 CSS 的 CSSOM 跨域读不到，只能读原文。
 *
 * @param id - 库 id。
 * @returns 该库的家族 / 基础类 / 前缀 / 图标名。
 */
export function loadIconFont(id = 'base') {
    const hit = loaded.get(id);
    if (hit !== undefined)
        return hit;
    const task = fetch(ICON_FONTS[id].url)
        .then((res) => res.text())
        .then(parseFontCss);
    loaded.set(id, task);
    task.catch(() => loaded.delete(id));
    return task;
}
const warned = new Set();
function warnMissing(name) {
    if (warned.has(name))
        return;
    warned.add(name);
    console.warn(`[dsh-plugin-core:icons] 找不到图标 "${name}"：字体图标写 "库名:图标名"（如 base:jian），官方图标直接写组件名（如 IconCheckOutlineRegular）`);
}
/**
 * 图标。字体图标渲染成 `<i>`（字形来自远程字体），官方图标渲染官方组件本体。
 *
 * @param props 见 {@link IconProps}。
 * @returns 元素；找不到对应图标时返回 `null`（并一次性告警）。
 */
export function Icon(props) {
    const { name, title, className, style } = props;
    const size = props.size === undefined
        ? ICON_SIZES.md
        : typeof props.size === 'number'
            ? props.size
            : ICON_SIZES[props.size];
    // 有冒号 = 字体图标；冒号前是库名，不许省（用户定：以后一律带组名）。
    const cut = name.indexOf(':');
    if (cut > 0) {
        const id = name.slice(0, cut);
        const font = ICON_FONTS[id];
        if (font === undefined) {
            warnMissing(name);
            return null;
        }
        ensureIconFont(id);
        return h('i', {
            className: `${font.baseClass} ${font.prefix}${name.slice(cut + 1)}${className === undefined || className === '' ? '' : ` ${className}`}`,
            role: title === undefined ? undefined : 'img',
            'aria-label': title,
            title,
            style: { fontSize: size, lineHeight: 1, ...style },
        });
    }
    // 没有冒号 = 官方图标：命名空间里直接按名取，只认图标，别让字符串把 Modal/Button 拉进来。
    const glyph = Official[name];
    if (typeof glyph !== 'function' || !/^Icon[A-Z]/.test(name)) {
        warnMissing(name);
        return null;
    }
    const rendered = h(glyph, { size });
    if (title === undefined)
        return rendered;
    return h('span', { role: 'img', 'aria-label': title, title, style: { display: 'inline-flex', ...style } }, rendered);
}
//# sourceMappingURL=Icon.js.map