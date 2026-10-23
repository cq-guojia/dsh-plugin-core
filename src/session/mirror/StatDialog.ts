// 官方对照：packages/client/ui-chat/src/client/chat/stat-dialog.js（0.1.7-rc.2 lib/client.js:6278-6350）
//   PANEL_MARGIN = 12 / PANEL_GAP = 8（lib/client.js:6281-6283）
//   useStatDialog = 受控开关 + useAnchoredPosition(side:'top') + useDismissOnOutsidePointer + Escape 关闭。
// 官方用的是 primitives 的同名 hook，这里直接复用同一份实现（不是自绘定位）。
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import { useAnchoredPosition, useDismissOnOutsidePointer } from '../../ui/official.js'

const PANEL_MARGIN = 12
const PANEL_GAP = 8

/**
 * 官方 stat-dialog.ts 的 MEASURE_STYLE：首趟（pos 未定）时面板「隐藏但仍布局」，
 * 好让 useAnchoredPosition 量到真实尺寸。官方要求面板铺 `pos ?? MEASURE_STYLE`；
 * 漏了它 ⇒ 首趟完全无定位、面板落进文档流撑长页面（真机 2026-10-23：点用量无反应 + 滚动条变长）。
 */
export const STAT_MEASURE_STYLE: CSSProperties = { visibility: 'hidden', left: 0, top: 0 }

export interface StatDialogSeat {
  open: boolean
  setOpen(open: boolean): void
  rootRef: RefObject<HTMLSpanElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  pos: CSSProperties | undefined
}

/** 官方 useStatDialog：把弹层挂在触发器上方（side: 'top'），点外 / Esc 关闭。 */
export function useStatDialog(controlled?: { open?: boolean; setOpen?(open: boolean): void }): StatDialogSeat {
  const [ownOpen, setOwnOpen] = useState<boolean>(false)
  const open = controlled?.open ?? ownOpen
  const setOpen = controlled?.setOpen ?? setOwnOpen
  const rootRef = useRef<HTMLSpanElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const pos = useAnchoredPosition({ open, anchorRef: rootRef, panelRef, side: 'top', gap: PANEL_GAP, margin: PANEL_MARGIN })
  useDismissOnOutsidePointer(rootRef, open, setOpen, panelRef)
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [open, setOpen])
  return { open, setOpen, rootRef, panelRef, pos }
}
