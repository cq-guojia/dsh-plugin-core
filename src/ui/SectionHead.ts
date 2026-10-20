/**
 * 模块标题行（UI 基础层）：**icon + 标题 + 右侧控件** 三段式。
 *
 * 2026-10-08 设置页重构时定型：每块 = 标题行 + 一块内容，标题行左侧 icon、右侧留给该块的控件
 * （日志块的自动刷新 / 刷新钮，表查询块的表切换）。此前三个块各写一个 `h3`，形态不统一。
 *
 * 排版规则：字号 / 行高 / 字色走 `--dshpc-*` token；`right` 用 `flex:1` + `justifyContent:flex-end`
 * 靠右（比 `marginLeft:auto` 稳：内容再宽也始终贴右，不会塌成靠左）；标题 `flex:none` 不被压缩。
 */
import { createElement as h, type ReactNode } from 'react'

export function SectionHead(props: { icon: ReactNode; title: ReactNode; right?: ReactNode }): ReturnType<typeof h> {
  return h('div', {
    style: { display: 'flex', alignItems: 'center', gap: 'var(--dshpc-space-2)', marginBottom: 'var(--dshpc-space-3)' },
  },
  h('span', { style: { display: 'inline-flex', alignItems: 'center', flex: 'none', lineHeight: 'var(--dshpc-line-lg)', color: 'var(--dshpc-fg-3)' } }, props.icon),
  h('span', { style: { fontSize: 'var(--dshpc-font-lg)', lineHeight: 'var(--dshpc-line-lg)', fontWeight: 600, color: 'var(--dshpc-fg)', flex: 'none' } }, props.title),
  props.right === undefined
    ? null
    : h('div', { style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--dshpc-space-2)', minWidth: 0 } }, props.right),
  )
}
