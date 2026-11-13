/**
 * 从 iconfont 在线 CSS 里读出这套库的事实 —— 家族、基础类、前缀、全部图标名。
 *
 * 为什么运行时读而不是构建期生成清单：远程 CSS 带 `access-control-allow-origin: *`，
 * fetch 一次就能拿到原文；平台加图标 / 换链接后页面刷新即见，仓库里不留需要同步的生成物。
 *
 * 只解析结构，不改写样式：@font-face 与 glyph 规则仍由 `<link>` 加载的远程 CSS 提供。
 */

/** 解析结果：一套字体库的全部可枚举事实。 */
export interface ParsedIconFont {
  /** `@font-face` 的 font-family。 */
  family: string
  /** 带 `font-family` 声明的那个类（基础类）。 */
  baseClass: string
  /** glyph 类名的公共前缀，如 `dshpc-i-`。 */
  prefix: string
  /** 图标名（已去掉前缀），可直接喂给 `Icon` 的 `name`。 */
  names: string[]
}

/** glyph 类名的公共前缀，截到最后一个 `-` 之后。 */
function commonPrefix(classes: string[]): string {
  let prefix = classes[0] ?? ''
  for (const name of classes) {
    let i = 0
    while (i < prefix.length && i < name.length && prefix[i] === name[i]) i += 1
    prefix = prefix.slice(0, i)
  }
  return prefix.slice(0, prefix.lastIndexOf('-') + 1)
}

/**
 * 解析一份 iconfont CSS。
 *
 * @param css - 远程 CSS 原文。
 * @returns 家族 / 基础类 / 前缀 / 图标名。
 * @throws 结构不认识（没有 font-family、没有 glyph 类、找不到基础类）时抛错 —— 不静默返回空清单。
 */
export function parseFontCss(css: string): ParsedIconFont {
  const family = /font-family:\s*["']([^"']+)["']/.exec(css)?.[1]
  const classes = [...css.matchAll(/\.([\w-]+):before\s*\{[^}]*content:/g)].map((m) => m[1] ?? '')
  const baseClass = [...css.matchAll(/\.([\w-]+)\s*\{([^}]*)\}/g)]
    .find((m) => (m[2] ?? '').includes('font-family'))?.[1]
  if (family === undefined || baseClass === undefined || classes.length === 0) {
    throw new Error('[dsh-plugin-core:icons] 图标 CSS 结构不认识（缺 font-family / 基础类 / glyph 类）')
  }
  const prefix = commonPrefix(classes)
  return {
    family,
    baseClass,
    prefix,
    names: classes.map((name) => name.slice(prefix.length)),
  }
}
