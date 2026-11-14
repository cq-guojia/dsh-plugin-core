/**
 * ▾ 选层下拉的**条目构造**（picker 与 dock 共用同一段代码，差别只在入参 —— 源实现用户 2026-09-29
 * 点名提炼，严禁两处各写一份）。
 *
 *  - 根层常驻最上面：POSIX 一条「根目录」，Windows 是一排盘符（用户 2026-11-03）；
 *  - 当前工作区排第一（打开文件夹图标 + 加粗），**其下路径紧跟**（每层一个右箭头位缩进），
 *    再列其他工作区（关合图标 + 灰）—— 「打开哪个就跟在哪个下面」；点当前工作区 = 回到其根目录；
 *  - 当前工作区未知（rootName 空或不在清单）时路径段置顶、全部工作区按「其他」罗列；
 *  - workspaces 为空（宿主还没给工作区快照）= 只出路径段（根无箭头、其下逐层缩进）。
 *
 * 条目是**自写浮层**（核心没有「带缩进的选择层菜单」这类控件 ⇒ 按兄弟项目
 * dsh-task-dispatch-table 的 .dsh-tdt-sv-crumbs-menu* 逐条照抄间距）：backdrop + 菜单本体 +
 * `-item`（4px 8px / 最大宽 280 / 超出滚动 / 空态）。
 *
 * 2026-11-03 从 FileBrowser.ts 拆出来（原来单文件 1000+ 行、五个职责）：这里只有「菜单里放什么」，
 * 浮层外壳与表皮在 FileBrowser（`panel.css` 的 menu 档），互不掺。
 */
import { createElement as h, Fragment, type ReactNode } from 'react'
import { IconFolderCloseRegular, IconFolderOpenOutlineRegular } from '../../ui/official.js'
import { Chevron } from '../../ui/infra/chevron.js'
import { ensureComponentStyles } from '../../ui/infra/css.js'
import { EXPLORER_CSS } from './explorer-css.js'

export interface CrumbsMenuEntryParams {
  workspaces: readonly string[]
  /** 根层条目：POSIX 只有「根目录」；Windows 是盘符清单（用户 2026-11-03）。 */
  roots: ReadonlyArray<{ label: string; path: string }>
  rootName: string
  rootFallbackLabel: string
  crumbs: ReadonlyArray<{ label: string; path: string }>
  onPickWorkspace?: (name: string) => void
  onLoadDir?: (path: string) => void
}

/** 菜单条目（根层 → 当前工作区 + 其下路径 → 其他工作区）。 */
export function crumbsMenuEntries(params: CrumbsMenuEntryParams): ReactNode[] {
  // 条目样式在 explorer.css（调用方 FileBrowser 也会注入；这里再写一次是幂等的，
  // 免得将来有人单独调本模块时样式缺失 —— 自检也会盯这一条）。
  ensureComponentStyles('explorer', EXPLORER_CSS)
  const { workspaces, roots, rootName, rootFallbackLabel, crumbs, onPickWorkspace, onLoadDir } = params
  const out: ReactNode[] = []
  // 根层常驻最上面（用户 2026-11-03：原来拉开的只有工作区，根目录要放最上面）。
  for (const root of roots) {
    out.push(
      h(
        'button',
        {
          key: `root:${root.path}`,
          type: 'button',
          role: 'menuitem',
          className: 'dshpc-fb__menu-item',
          style: { paddingLeft: 8, display: 'flex', alignItems: 'center', gap: '6px' },
          onClick: () => onLoadDir?.(root.path),
        },
        h('span', { className: 'dshpc-fb__menu-icon', style: { color: 'var(--dshpc-fg-2)' } },
          h(IconFolderCloseRegular, { size: 13 })),
        h('span', { className: 'dshpc-fb__menu-label' }, root.label),
      ),
    )
  }
  // 内联样式照抄兄弟项目（wsEntry 的 gap 6px 覆盖类的 2px：图标与文字的间距以它为准）。
  const wsEntry = (ws: string, current: boolean): ReactNode =>
    h(
      'button',
      {
        key: `ws:${ws}`,
        type: 'button',
        role: 'menuitem',
        className: 'dshpc-fb__menu-item',
        style: { paddingLeft: 8, display: 'flex', alignItems: 'center', gap: '6px' },
        // 点当前工作区 = 回到该工作区根目录（浏览深处时唯一的「回根」入口，兄弟 2026-10-10）；
        // 点其他工作区才走 onPickWorkspace（换会话）。
        onClick: () => {
          if (current) onLoadDir?.('')
          else onPickWorkspace?.(ws)
        },
      },
      h(
        'span',
        { className: 'dshpc-fb__menu-icon', style: { color: current ? 'var(--dshpc-fg)' : 'var(--dshpc-fg-2)' } },
        h(current ? IconFolderOpenOutlineRegular : IconFolderCloseRegular, { size: 13 }),
      ),
      h('span', { className: 'dshpc-fb__menu-label', style: { fontWeight: current ? 600 : 400 } }, ws),
    )
  const pathEntry = (crumb: { label: string; path: string }, depth: number, withArrow = true): ReactNode =>
    h(
      'button',
      {
        key: `dir:${crumb.path}`,
        type: 'button',
        role: 'menuitem',
        className: 'dshpc-fb__menu-item',
        style: { paddingLeft: 8 },
        onClick: () => {
          onLoadDir?.(crumb.path)
        },
      },
      withArrow
        ? h(
            Fragment,
            null,
            Array.from({ length: depth }, (_, s) => h('span', { key: `s${s}`, className: 'dshpc-fb__menu-chev-slot', 'aria-hidden': true })),
            h('span', { className: 'dshpc-fb__menu-chev' }, h(Chevron, { dir: 'right', size: 8 })),
          )
        : null,
      h('span', { className: 'dshpc-fb__menu-label' }, crumb.label),
    )
  if (workspaces.length === 0) {
    // 宿主还没给工作区快照 ⇒ 只出路径段（不出空的工作区组）。
    if (crumbs.length === 0) return [h('div', { key: 'empty', className: 'dshpc-fb__menu-empty' }, rootFallbackLabel)]
    return crumbs.map((crumb, index) => pathEntry(crumb, index === 0 ? 0 : index - 1, index !== 0))
  }
  // 路径段：第一段是「根」（工作区名 / 根目录 / 盘符）时由上面那组行表达，剔除后再从下一层起算。
  const head = crumbs[0]
  const isRootHead = head !== undefined
    && (head.path === '' || roots.some((root) => root.path === head.path))
  const segments = isRootHead ? crumbs.slice(1) : crumbs
  if (rootName !== '' && workspaces.includes(rootName)) {
    // 当前工作区排第一，其下路径紧跟，然后是其他工作区（保持原相对顺序）。
    out.push(wsEntry(rootName, true))
    segments.forEach((crumb, i) => {
      out.push(pathEntry(crumb, i))
    })
    for (const ws of workspaces) {
      if (ws !== rootName) out.push(wsEntry(ws, false))
    }
  } else {
    segments.forEach((crumb, i) => {
      out.push(pathEntry(crumb, i))
    })
    for (const ws of workspaces) out.push(wsEntry(ws, false))
  }
  return out
}
