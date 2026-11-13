/**
 * 图标：字体图标与官方 primitives 图标**同一个组件**，尺寸统一。
 *
 * `name` 的写法（2026-11-13 用户定，组名不可省）：
 *  - `common.base:sort-down` / `common.logo:github` —— 字体图标：`库名:图标名`，库名是
 *    {@link ICON_FONTS} 的 key（`所属域.库名[.变体]`，库名本身可以带点）；
 *  - `IconWrapLinesOutlineRegular` —— 官方图标：没有冒号，直接写官方组件名。
 *
 * 找不到就**不渲染**（不回落别的库 —— 显示错图标比空白更难查），并一次性告警。
 * 字体样式仍是运行时 `<link>` 远程加载，字体文件与样式都不入包。
 */
import { createElement as h } from 'react';
import { Official } from '../infra/official-icons.js';
import { darkGlyphName, fetchIconFont, primeIconFont, useHostDark, useIconNames } from './icon-runtime.js';
export { parseFontCss } from './icon-parse.js';
/**
 * 图标库注册表：加一套库 = 加一项，组件与展示页都不用改。
 *
 * key = `<所属域>.<库名>[.变体]`，就是 `name` 里冒号前那整段：
 *  - `common.*` —— 所有开源框架共用的基础库（跨项目，不限于本仓）；
 *  - `dsh-plugin-core.*` —— 本框架在 DSH 平台上对外提供的库。
 *
 * 每项必须与 iconfont 在线 CSS 里的实际值逐字一致（family / baseClass / prefix 三项），
 * 平台重发布换的哈希只影响 `url`，但改了前缀就得同步这里 —— 写错的表现是「图标位空白」。
 */
export const ICON_FONTS = {
    'common.base': {
        url: 'https://at.alicdn.com/t/c/font_5252971_2g44prlh04r.css',
        family: 'koc-i-common-base',
        baseClass: 'koc-i-common-base',
        prefix: 'koc-i-common-base-',
    },
    'common.base.color': {
        url: 'https://at.alicdn.com/t/c/font_5252972_tyb3966r1rh.css',
        family: 'koc-i-common-base-c',
        baseClass: 'koc-i-common-base-c',
        prefix: 'koc-i-common-base-c-',
        color: true,
    },
    'common.logo': {
        url: 'https://at.alicdn.com/t/c/font_5252974_y0yj8zp5mvm.css',
        family: 'koc-i-common-logo',
        baseClass: 'koc-i-common-logo',
        prefix: 'koc-i-common-logo-',
    },
    'common.logo.color': {
        url: 'https://at.alicdn.com/t/c/font_5252975_6bexc5n5vn5.css',
        family: 'koc-i-common-logo-c',
        baseClass: 'koc-i-common-logo-c',
        prefix: 'koc-i-common-logo-c-',
        color: true,
    },
    'dsh-plugin-core.base': {
        url: 'https://at.alicdn.com/t/c/font_5252865_zv3n1s2zg3e.css',
        family: 'dshpc-i-base',
        baseClass: 'dshpc-i-base',
        prefix: 'dshpc-i-base-',
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
    // 多色库顺手取一次名字清单：深色下要靠它判断有没有 `-dark` 字形，
    // 现在就发能省掉「首次切深色」的那一次等待。
    if (font.color === true)
        primeIconFont(id, font.url);
}
/**
 * 拉取并解析一套库的在线 CSS（同一次会话只发一次请求，与多色字形判断共用缓存）。
 *
 * 给「列出这套库有哪些图标」用：远程 CSS 的 CSSOM 跨域读不到，只能读原文。
 *
 * @param id - 库 id。
 * @returns 该库的家族 / 基础类 / 前缀 / 图标名。
 */
export function loadIconFont(id = 'common.base') {
    return fetchIconFont(id, ICON_FONTS[id].url);
}
const warned = new Set();
function warnMissing(name) {
    if (warned.has(name))
        return;
    warned.add(name);
    console.warn(`[dsh-plugin-core:icons] 找不到图标 "${name}"：字体图标写 "库名:图标名"（如 common.base:jia），官方图标直接写组件名（如 IconCheckOutlineRegular）`);
}
/** `基础类 前缀+字形名 [调用方补的类]`。 */
function glyphClass(font, glyph, className) {
    const extra = className === undefined || className === '' ? '' : ` ${className}`;
    return `${font.baseClass} ${font.prefix}${glyph}${extra}`;
}
/**
 * 多色库的图标：宿主深色时换 `-dark` 字形（库里没有就继续用原名字）。
 *
 * 单独成组件是为了让 hooks 只在多色库上跑：单色库与官方图标那条路一次渲染都不订阅。
 * 名字清单还没到时先按原字形画，到货后自动重渲染 —— 多色库本来就是远程字体，这段空隙
 * 与字体加载同量级。
 */
function ColorGlyph(props) {
    const dark = useHostDark();
    const names = useIconNames(props.id);
    const glyph = dark ? darkGlyphName(props.glyph, names) : props.glyph;
    return h('i', {
        className: glyphClass(props.font, glyph, props.className),
        role: props.title === undefined ? undefined : 'img',
        'aria-label': props.title,
        title: props.title,
        style: { fontSize: props.size, lineHeight: 1, ...props.style },
    });
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
        const glyph = name.slice(cut + 1);
        // 多色库要走明暗换字形那条路；单色库的颜色跟着文字走，直接画。
        if (font.color === true) {
            return h(ColorGlyph, { id, font, glyph, size, title, className, style });
        }
        return h('i', {
            className: glyphClass(font, glyph, className),
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