/**
 * 图标：字体图标与官方 primitives 图标**同一个组件**，尺寸统一。
 *
 * `name` 的写法（2026-11-13 用户定，组名不可省）：
 *  - `common.base:sort-down` / `common.logo:github` —— 字体图标：`库名:图标名`，库名是
 *    {@link ICON_FONTS} 的 key（`所属域.库名[.变体]`，库名本身可以带点）；
 *  - `IconWrapLinesOutlineRegular` —— 官方图标：没有冒号，直接写官方组件名。
 *
 * 尺寸（2026-11-14）：两类图标**不传 `size` 就跟随所在文字的字号** —— 字体 `<i>` 带自有
 * 基础类 `dshpc-icon`，由 `icon.css` 的 `font-size:inherit` 中和平台基础类的 16px；官方 SVG
 * 由控件的 `svg{width:1em}` 接管。显式传预设名 / px 才是绝对尺寸，用于独立摆放与装饰性
 * 小箭头。控件的 `sm|md|lg` 只决定文字字号，不另给图标定值。
 *
 * 找不到就**不渲染**（不回落别的库 —— 显示错图标比空白更难查），并一次性告警。
 * 字体样式仍是运行时 `<link>` 远程加载，字体文件与样式都不入包。
 *
 * 字体那条路在 `font-icon.ts`：它**不吃平台模块**，所以纯控件入口要画字体图标时直接引
 * `FontIcon`，别把这个文件拖进去（官方 primitives 一进来就过不了 `test/entry-isolation.test.mjs`）。
 */
import { createElement as h } from 'react'
import { Official } from '../infra/official-icons.js'
import {
  FontIcon,
  ICON_SIZES,
  resolveIconName,
  warnMissingIcon,
  type FontIconProps,
} from './font-icon.js'

export * from './font-icon.js'

/** {@link Icon} 的 props：与字体图标同一套（`name` / `size` / `title` / `className` / `style`）。 */
export type IconProps = FontIconProps

/**
 * 图标。字体图标渲染成 `<i>`（字形来自远程字体），官方图标渲染官方组件本体。
 *
 * @param props 见 {@link IconProps}。
 * @returns 元素；找不到对应图标时返回 `null`（并一次性告警）。
 */
export function Icon(props: IconProps): ReturnType<typeof h> | null {
  const { name, title, style } = props
  // 有冒号 = 字体图标；冒号前是库名，不许省（用户定：以后一律带组名）。
  // 库名不认识就地判死（返回 null），不等到 FontIcon 里才发现 —— 调用方拿到的就是「没有」。
  if (name.indexOf(':') > 0) {
    if (resolveIconName(name) === undefined) {
      warnMissingIcon(name)
      return null
    }
    // 直接调（不是 `h(FontIcon, …)`）：字体那条路没有 hooks，出来的就是最终元素，
    // 调用方拿到的东西与过去一致（元素类型是 `<i>` / 多色库的 ColorGlyph，不是一层包装）。
    return FontIcon(props)
  }

  const size =
    props.size === undefined
      ? undefined
      : typeof props.size === 'number'
        ? props.size
        : ICON_SIZES[props.size]

  // 没有冒号 = 官方图标：命名空间里直接按名取，只认图标，别让字符串把 Modal/Button 拉进来。
  const glyph = (Official as Record<string, unknown>)[name]
  if (typeof glyph !== 'function' || !/^Icon[A-Z]/.test(name)) {
    warnMissingIcon(name)
    return null
  }
  // 不传 size 就一个属性都不给：官方 SVG 交给控件的 `svg{width:1em}` 接管，跟字体图标
  // 继承父级字号是同一条链。显式传了才给绝对 px（独立摆放 / 装饰档）。
  const rendered = h(glyph as (p: { size?: number }) => ReturnType<typeof h>, size === undefined ? {} : { size })
  if (title === undefined) return rendered
  return h(
    'span',
    { role: 'img', 'aria-label': title, title, style: { display: 'inline-flex', ...style } },
    rendered,
  )
}
