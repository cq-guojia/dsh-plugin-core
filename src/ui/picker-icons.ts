/**
 * 领域选择器的默认前置图标（2026-10-20 用户：默认就带一个 icon，可换、可去掉）。
 *
 * ui 零官方依赖 ⇒ 自绘小 SVG（14px，跟 currentColor 走明暗）。
 * 用法：不传 `icon` ⇒ 默认这颗；传 `null` ⇒ 不显示；传任意 ReactNode ⇒ 换成它。
 */
import { createElement as h } from 'react'

function glyph(path: ReturnType<typeof h>): ReturnType<typeof h> {
  return h(
    'svg',
    { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
    path,
  )
}

/** 工作区：文件夹 */
export function folderIcon(): ReturnType<typeof h> {
  return glyph(h('path', {
    d: 'M2 4.5A1.5 1.5 0 0 1 3.5 3h2.6l1.2 1.5h5.2A1.5 1.5 0 0 1 14 6v5.5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z',
    stroke: 'currentColor',
    'stroke-width': 1.3,
    'stroke-linejoin': 'round',
  }))
}

/** 模型：四角星 */
export function sparkleIcon(): ReturnType<typeof h> {
  return glyph(h('path', {
    d: 'M8 1.8l1.6 4.1 4.1 1.6-4.1 1.6L8 13.2 6.4 9.1 2.3 7.5l4.1-1.6z',
    stroke: 'currentColor',
    'stroke-width': 1.2,
    'stroke-linejoin': 'round',
  }))
}
