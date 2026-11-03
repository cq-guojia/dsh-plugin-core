/**
 * 落地页主体（picker 刚打开、还没进任何目录时的那张表）：上面一排根层（「根目录」或盘符），
 * 下面全部工作区。行 = 进去，行尾钮 = 直接选这个目录。
 *
 * 2026-11-03 从 `FileBrowser.ts` 拆出：这里只有「怎么画」，状态与取数全在调用方。
 */
import { createElement as h, type ReactNode } from 'react'
import { Button } from '../ui/Button.js'
import { IconFolderCloseRegular } from '../ui/official.js'
import { ensureComponentStyles } from '../ui/css.js'
import type { Translate } from '../utils/i18n.js'
import { EXPLORER_CSS } from './explorer-css.js'
import type { WorkspaceAnchorItem } from './types.js'

export interface LandingBodyProps {
  translate: Translate
  /** 根层条目：POSIX 单条「根目录」，Windows 一排盘符。 */
  roots: ReadonlyArray<{ label: string; path: string }>
  anchors: readonly WorkspaceAnchorItem[]
  /** 选择器形态：行尾出「选择」钮（浏览器形态不出）。 */
  pickable: boolean
  /** 进入该目录（点行 / 回车）。 */
  onOpen: (target: string) => void
  /** 直接选中该目录（行尾钮）。 */
  onPickDir: (target: string) => void
}

export function LandingBody(props: LandingBodyProps): ReactNode {
  ensureComponentStyles('explorer', EXPLORER_CSS)
  const { translate: tt, roots, anchors, pickable, onOpen, onPickDir } = props

  const row = (key: string, label: string, target: string): ReactNode =>
    h(
      'div',
      {
        key,
        className: 'dshpc-fb__row',
        role: 'button',
        tabIndex: 0,
        onClick: () => onOpen(target),
        onKeyDown: (event: { key: string }) => {
          if (event.key === 'Enter' || event.key === ' ') onOpen(target)
        },
      },
      h('span', { className: 'dshpc-fb__row-icon' }, h(IconFolderCloseRegular, { size: 18 })),
      h('span', { className: 'dshpc-fb__row-name' }, label),
      // 行 = 展开进去；行尾钮 = 直接选这个目录（根目录 / 盘符 / 工作区根本身都能选）。
      pickable
        ? h(
            Button,
            {
              variant: 'outline',
              size: 'sm',
              className: 'dshpc-fb__row-act',
              'aria-label': tt('explorerPickDirAria'),
              onClick: (event: { stopPropagation: () => void }) => {
                event.stopPropagation()
                onPickDir(target)
              },
            },
            tt('explorerPickDir'),
          )
        : null,
    )

  return h(
    'div',
    { className: 'dshpc-fb__tree' },
    roots.map((root) => row(`root:${root.path}`, root.label, root.path)),
    anchors
      .filter((item) => item.path !== undefined && item.path !== '')
      .map((item) => row(`ws:${item.title}`, item.title, item.path as string)),
  )
}
