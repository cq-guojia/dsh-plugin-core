/**
 * 图标（字体图标）：远程字体 CSS + 类名拼装，**样式与字体都不入本仓、不进产物**。
 *
 * 约定：
 *  - 一个 iconfont 项目 = 一种字体 = 一个类前缀 = 一条 `<link>`；加库只往 {@link ICON_FONTS} 加一项。
 *  - 图标名就是平台里的名字（如 `shanchu`），本层不做语义别名 —— 改名的唯一真源在 iconfont 后台。
 *  - 基础类只提供字体族，尺寸由组件给（默认 `1em` 跟随所在文字）。
 */
import { createElement as h, type CSSProperties } from 'react'
import { parseFontCss, type ParsedIconFont } from './icon-parse.js'

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
}

/** 图标库注册表：加一套库 = 加一项，组件与展示页都不用改。 */
export const ICON_FONTS = {
  base: {
    url: 'https://at.alicdn.com/t/c/font_5252865_mu5upqjaqf.css',
    family: 'dshpc-icons-base',
    baseClass: 'dshpc-icons-base',
    prefix: 'dshpc-i-',
  },
} satisfies Record<string, IconFontFace>

/** 已注册的库 id。 */
export type IconFontId = keyof typeof ICON_FONTS

/**
 * 保证该库的样式只挂一条 `<link>`。
 *
 * 地址变了就走改 `href`（iconfont 重发布 / 整库换链接都不会插出第二条），
 * 没有 `document`（node 自检）直接返回。
 *
 * @param id - 库 id，缺省 `base`。
 */
export function ensureIconFont(id: IconFontId = 'base'): void {
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
}

const loaded = new Map<IconFontId, Promise<ParsedIconFont>>()

/**
 * 拉取并解析一套库的在线 CSS（同一次会话只发一次请求）。
 *
 * 给「列出这套库有哪些图标」用：远程 CSS 的 CSSOM 跨域读不到，只能读原文。
 *
 * @param id - 库 id，缺省 `base`。
 * @returns 该库的家族 / 基础类 / 前缀 / 图标名。
 */
export function loadIconFont(id: IconFontId = 'base'): Promise<ParsedIconFont> {
  const hit = loaded.get(id)
  if (hit !== undefined) return hit
  const task = fetch(ICON_FONTS[id].url)
    .then((res) => res.text())
    .then(parseFontCss)
  loaded.set(id, task)
  task.catch(() => loaded.delete(id))
  return task
}

/** {@link Icon} 的 props。 */
export interface IconProps {
  /** 图标名（iconfont 里的名字，不带前缀）。 */
  name: string
  /** 用哪套库，缺省 `base`。 */
  set?: IconFontId
  /** 字号；数字按 px，字符串原样（如 `'1.25em'`）。缺省 `1em` 跟随所在文字。 */
  size?: number | string
  /** 无障碍名（同时作原生 tooltip）；装饰性图标不传。 */
  title?: string
  className?: string
  style?: CSSProperties
}

/**
 * 字体图标。
 *
 * @param props 见 {@link IconProps}。
 * @returns `<i>` 元素，字形由远程字体提供。
 */
export function Icon(props: IconProps): ReturnType<typeof h> {
  const { name, set = 'base', size = '1em', title, className, style } = props
  ensureIconFont(set)
  const font: IconFontFace = ICON_FONTS[set]
  return h('i', {
    className: `${font.baseClass} ${font.prefix}${name}${className === undefined || className === '' ? '' : ` ${className}`}`,
    role: title === undefined ? undefined : 'img',
    'aria-label': title,
    title,
    style: { fontSize: size, lineHeight: 1, ...style },
  })
}
