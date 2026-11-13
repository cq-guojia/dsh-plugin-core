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
import { createElement as h, type CSSProperties } from 'react';
import { type ParsedIconFont } from './icon-parse.js';
export { parseFontCss, type ParsedIconFont } from './icon-parse.js';
/** 一套字体库的接入事实。 */
export interface IconFontFace {
    /** 在线样式地址（iconfont 每次重发布都会换哈希，整库更换也改这里）。 */
    url: string;
    /** `@font-face` 的 font-family。 */
    family: string;
    /** 基础类名（提供 font-family）。 */
    baseClass: string;
    /** glyph 类名前缀，后面直接接图标名。 */
    prefix: string;
}
/** 图标库注册表：加一套库 = 加一项，组件与展示页都不用改。 */
export declare const ICON_FONTS: {
    base: {
        url: string;
        family: string;
        baseClass: string;
        prefix: string;
    };
};
/** 已注册的库 id（= `name` 里冒号前那段）。 */
export type IconFontId = keyof typeof ICON_FONTS;
/** 尺寸预设（px）；`size` 也可以直接给数字。 */
export declare const ICON_SIZES: {
    readonly sm: 14;
    readonly md: 16;
    readonly lg: 20;
    readonly xl: 24;
};
/** 尺寸预设名。 */
export type IconSize = keyof typeof ICON_SIZES;
/**
 * 保证该库的样式只挂一条 `<link>`。
 *
 * 地址变了就走改 `href`（iconfont 重发布 / 整库换链接都不会插出第二条），
 * 没有 `document`（node 自检）直接返回。
 *
 * @param id - 库 id。
 */
export declare function ensureIconFont(id: IconFontId): void;
/**
 * 拉取并解析一套库的在线 CSS（同一次会话只发一次请求）。
 *
 * 给「列出这套库有哪些图标」用：远程 CSS 的 CSSOM 跨域读不到，只能读原文。
 *
 * @param id - 库 id。
 * @returns 该库的家族 / 基础类 / 前缀 / 图标名。
 */
export declare function loadIconFont(id?: IconFontId): Promise<ParsedIconFont>;
/** {@link Icon} 的 props。 */
export interface IconProps {
    /**
     * 图标标识：`库名:图标名`（字体图标，库名不可省）或官方组件名（无冒号）。
     */
    name: string;
    /** 尺寸：预设名或 px 数字，缺省 `md`（16）。 */
    size?: number | IconSize;
    /** 无障碍名（同时作原生 tooltip）；装饰性图标不传。 */
    title?: string;
    className?: string;
    style?: CSSProperties;
}
/**
 * 图标。字体图标渲染成 `<i>`（字形来自远程字体），官方图标渲染官方组件本体。
 *
 * @param props 见 {@link IconProps}。
 * @returns 元素；找不到对应图标时返回 `null`（并一次性告警）。
 */
export declare function Icon(props: IconProps): ReturnType<typeof h> | null;
//# sourceMappingURL=Icon.d.ts.map