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
 *
 * 字体那条路在 `font-icon.ts`：它**不吃平台模块**，所以纯控件入口要画字体图标时直接引
 * `FontIcon`，别把这个文件拖进去（官方 primitives 一进来就过不了 `test/entry-isolation.test.mjs`）。
 */
import { createElement as h } from 'react';
import { type FontIconProps } from './font-icon.js';
export * from './font-icon.js';
/** {@link Icon} 的 props：与字体图标同一套（`name` / `size` / `title` / `className` / `style`）。 */
export type IconProps = FontIconProps;
/**
 * 图标。字体图标渲染成 `<i>`（字形来自远程字体），官方图标渲染官方组件本体。
 *
 * @param props 见 {@link IconProps}。
 * @returns 元素；找不到对应图标时返回 `null`（并一次性告警）。
 */
export declare function Icon(props: IconProps): ReturnType<typeof h> | null;
//# sourceMappingURL=Icon.d.ts.map