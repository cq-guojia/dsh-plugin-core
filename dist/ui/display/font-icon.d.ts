/**
 * 字体图标（iconfont）：**只吃在线字体，不引任何平台模块**。
 *
 * 为什么和 `Icon` 分开：`Icon` 还要按名取官方 primitives 组件，那份静态 import 会把整个官方包
 * 带进引入它的闭包 —— 纯控件入口不许带重依赖（`test/entry-isolation.test.mjs`）。
 * 所以控件层画字体图标一律用它；`Icon` 是「两类来源一个组件」的对外门面，只在需要官方图标时用。
 *
 * 口径与 `Icon` 一致：`库名:图标名`（库名不可省）、找不到就**不渲染**并一次性告警、
 * 多色库在宿主深色下自动换 `<名字>-dark` 字形。
 *
 * 尺寸口径（2026-11-14）：**不传 `size` 就继承所在文字的 `font-size`（1:1）**——字体图标本来
 * 就是一个字形，跟同一行文字用同一个字号；显式传预设名 / px 数字才是「独立摆放」或
 * 「装饰性小箭头」的绝对尺寸。按钮 / 输入框的 `sm|md|lg` 只决定文字字号，不另给图标定值。
 */
import { createElement as h, type CSSProperties } from 'react';
import type { ParsedIconFont } from './icon-parse.js';
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
    /**
     * 多色库（iconfont 的 Color fonts）：颜色随字形走、CSS `color` 改不动。
     * 标了它的库在宿主深色下会改用 `<名字>-dark` 字形（库里没有就仍用原名字）。
     * 单色库不标 —— 单色靠 `color` 跟着文字走，本来就能适应明暗。
     */
    color?: boolean;
}
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
export declare const ICON_FONTS: {
    'common.base': {
        url: string;
        family: string;
        baseClass: string;
        prefix: string;
    };
    'common.base.color': {
        url: string;
        family: string;
        baseClass: string;
        prefix: string;
        color: true;
    };
    'common.logo': {
        url: string;
        family: string;
        baseClass: string;
        prefix: string;
    };
    'common.logo.color': {
        url: string;
        family: string;
        baseClass: string;
        prefix: string;
        color: true;
    };
    'dsh-plugin-core.base': {
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
 * 拉取并解析一套库的在线 CSS（同一次会话只发一次请求，与多色字形判断共用缓存）。
 *
 * 给「列出这套库有哪些图标」用：远程 CSS 的 CSSOM 跨域读不到，只能读原文。
 *
 * @param id - 库 id。
 * @returns 该库的家族 / 基础类 / 前缀 / 图标名。
 */
export declare function loadIconFont(id?: IconFontId): Promise<ParsedIconFont>;
/** 找不到图标时的一次性告警（`Icon` 与 `FontIcon` 共用，同一个名字只喊一次）。 */
export declare function warnMissingIcon(name: string): void;
/** 拆 `库名:图标名`：没有冒号、或库没注册，都算没有。 */
export declare function resolveIconName(name: string): {
    id: IconFontId;
    font: IconFontFace;
    glyph: string;
} | undefined;
/** {@link FontIcon} 的 props。 */
export interface FontIconProps {
    /** 图标标识：`库名:图标名`（库名 = `ICON_FONTS` 的 key，不可省）。 */
    name: string;
    /** 尺寸：不传 = 继承所在文字字号（1:1）；预设名或 px 数字 = 显式绝对尺寸。 */
    size?: number | IconSize;
    /** 无障碍名（同时作原生 tooltip）；装饰性图标不传。 */
    title?: string;
    className?: string;
    style?: CSSProperties;
}
/**
 * 字体图标。渲染成 `<i>`（字形来自远程字体），首次渲染自动挂该库的 `<link>`。
 *
 * @param props 见 {@link FontIconProps}。
 * @returns 元素；库名不认识时返回 `null`（并一次性告警）。
 */
export declare function FontIcon(props: FontIconProps): ReturnType<typeof h> | null;
//# sourceMappingURL=font-icon.d.ts.map