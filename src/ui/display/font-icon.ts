/**
 * 字体图标（iconfont）：**只吃在线字体，不引任何平台模块**。
 *
 * 为什么和 `Icon` 分开：`Icon` 还要按名取官方 primitives 组件，那份静态 import 会把整个官方包
 * 带进引入它的闭包 —— 纯控件入口不许带重依赖（`test/entry-isolation.test.mjs`）。
 * 所以控件层画字体图标一律用它；`Icon` 是「两类来源一个组件」的对外门面，只在需要官方图标时用。
 *
 * 口径与 `Icon` 一致：`库名:图标名`（库名不可省）、找不到就**不渲染**并一次性告警、
 * 尺寸收预设名或 px、多色库在宿主深色下自动换 `<名字>-dark` 字形。
 */
import { createElement as h, type CSSProperties } from 'react'
import type { ParsedIconFont } from './icon-parse.js'
import { darkGlyphName, fetchIconFont, primeIconFont, useHostDark, useIconNames } from './icon-runtime.js'

export { parseFontCss, type ParsedIconFont } from './icon-parse.js'

/** 一套字体库的接入事实。 */
export interface IconFontFace {
  /** 在线样式地址（iconfont 每次重发布都会换哈希，整库更换也改这里）。 */
  url: string
  /** `@font-face` 的 font-family。 */
  family: string
  /** 基础类名（提供 font-family）。 */
  baseClass: string
  /** glyph 类名前缀，后面直接接图标名。 */
  prefix: string
  /**
   * 多色库（iconfont 的 Color fonts）：颜色随字形走、CSS `color` 改不动。
   * 标了它的库在宿主深色下会改用 `<名字>-dark` 字形（库里没有就仍用原名字）。
   * 单色库不标 —— 单色靠 `color` 跟着文字走，本来就能适应明暗。
   */
  color?: boolean
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
export const ICON_FONTS = {
  'common.base': {
    url: 'https://at.alicdn.com/t/c/font_5252971_dn4wfq92dar.css',
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
} satisfies Record<string, IconFontFace>

/** 已注册的库 id（= `name` 里冒号前那段）。 */
export type IconFontId = keyof typeof ICON_FONTS

/** 尺寸预设（px）；`size` 也可以直接给数字。 */
export const ICON_SIZES = { sm: 14, md: 16, lg: 20, xl: 24 } as const

/** 尺寸预设名。 */
export type IconSize = keyof typeof ICON_SIZES

/**
 * 保证该库的样式只挂一条 `<link>`。
 *
 * 地址变了就走改 `href`（iconfont 重发布 / 整库换链接都不会插出第二条），
 * 没有 `document`（node 自检）直接返回。
 *
 * @param id - 库 id。
 */
export function ensureIconFont(id: IconFontId): void {
  if (typeof document === 'undefined') return
  const font: IconFontFace = ICON_FONTS[id]
  let link = document.querySelector<HTMLLinkElement>(`link[data-dshpc-icon-font="${id}"]`)
  if (link === null) {
    link = document.createElement('link')
    link.rel = 'stylesheet'
    link.dataset.dshpcIconFont = id
    link.href = font.url
    document.head.appendChild(link)
  } else if (link.href !== font.url) {
    link.href = font.url
  }
  // 多色库顺手取一次名字清单：深色下要靠它判断有没有 `-dark` 字形，
  // 现在就发能省掉「首次切深色」的那一次等待。
  if (font.color === true) primeIconFont(id, font.url)
}

/**
 * 拉取并解析一套库的在线 CSS（同一次会话只发一次请求，与多色字形判断共用缓存）。
 *
 * 给「列出这套库有哪些图标」用：远程 CSS 的 CSSOM 跨域读不到，只能读原文。
 *
 * @param id - 库 id。
 * @returns 该库的家族 / 基础类 / 前缀 / 图标名。
 */
export function loadIconFont(id: IconFontId = 'common.base'): Promise<ParsedIconFont> {
  return fetchIconFont(id, ICON_FONTS[id].url)
}

const warned = new Set<string>()

/** 找不到图标时的一次性告警（`Icon` 与 `FontIcon` 共用，同一个名字只喊一次）。 */
export function warnMissingIcon(name: string): void {
  if (warned.has(name)) return
  warned.add(name)
  console.warn(
    `[dsh-plugin-core:icons] 找不到图标 "${name}"：字体图标写 "库名:图标名"（如 common.base:jia），官方图标直接写组件名（如 IconCheckOutlineRegular）`,
  )
}

/** 拆 `库名:图标名`：没有冒号、或库没注册，都算没有。 */
export function resolveIconName(
  name: string,
): { id: IconFontId; font: IconFontFace; glyph: string } | undefined {
  const cut = name.indexOf(':')
  if (cut <= 0) return undefined
  const font = ICON_FONTS[name.slice(0, cut) as IconFontId] as IconFontFace | undefined
  return font === undefined ? undefined : { id: name.slice(0, cut) as IconFontId, font, glyph: name.slice(cut + 1) }
}

/** `基础类 前缀+字形名 [调用方补的类]`。 */
function glyphClass(font: IconFontFace, glyph: string, className: string | undefined): string {
  const extra = className === undefined || className === '' ? '' : ` ${className}`
  return `${font.baseClass} ${font.prefix}${glyph}${extra}`
}

/** 尺寸：预设名或 px 数字，缺省 `md`。 */
function pxOf(size: number | IconSize | undefined): number {
  if (size === undefined) return ICON_SIZES.md
  return typeof size === 'number' ? size : ICON_SIZES[size]
}

/**
 * 多色库的图标：宿主深色时换 `-dark` 字形（库里没有就继续用原名字）。
 *
 * 单独成组件是为了让 hooks 只在多色库上跑：单色库那条路一次渲染都不订阅。
 * 名字清单还没到时先按原字形画，到货后自动重渲染 —— 多色库本来就是远程字体，这段空隙
 * 与字体加载同量级。
 */
function ColorGlyph(props: {
  id: string
  font: IconFontFace
  glyph: string
  size: number
  title?: string
  className?: string
  style?: CSSProperties
}): ReturnType<typeof h> {
  const dark = useHostDark()
  const names = useIconNames(props.id)
  const glyph = dark ? darkGlyphName(props.glyph, names) : props.glyph
  return h('i', {
    className: glyphClass(props.font, glyph, props.className),
    role: props.title === undefined ? undefined : 'img',
    'aria-label': props.title,
    title: props.title,
    style: { fontSize: props.size, lineHeight: 1, ...props.style },
  })
}

/** {@link FontIcon} 的 props。 */
export interface FontIconProps {
  /** 图标标识：`库名:图标名`（库名 = `ICON_FONTS` 的 key，不可省）。 */
  name: string
  /** 尺寸：预设名或 px 数字，缺省 `md`（16）。 */
  size?: number | IconSize
  /** 无障碍名（同时作原生 tooltip）；装饰性图标不传。 */
  title?: string
  className?: string
  style?: CSSProperties
}

/**
 * 字体图标。渲染成 `<i>`（字形来自远程字体），首次渲染自动挂该库的 `<link>`。
 *
 * @param props 见 {@link FontIconProps}。
 * @returns 元素；库名不认识时返回 `null`（并一次性告警）。
 */
export function FontIcon(props: FontIconProps): ReturnType<typeof h> | null {
  const { name, title, className, style } = props
  const size = pxOf(props.size)

  // 冒号前是库名，不许省（用户定：以后一律带组名）。
  const hit = resolveIconName(name)
  if (hit === undefined) {
    warnMissingIcon(name)
    return null
  }
  const { id, font, glyph } = hit
  ensureIconFont(id)
  // 多色库要走明暗换字形那条路；单色库的颜色跟着文字走，直接画。
  if (font.color === true) {
    return h(ColorGlyph, { id, font, glyph, size, title, className, style })
  }
  return h('i', {
    className: glyphClass(font, glyph, className),
    role: title === undefined ? undefined : 'img',
    'aria-label': title,
    title,
    style: { fontSize: size, lineHeight: 1, ...style },
  })
}
