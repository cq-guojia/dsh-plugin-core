// 官方对照：@deepseek-ai/dsh-client-ui-chat@0.2.2-rc.3 lib/client.js 的 useStatDialog()。
//   RC.3 删掉了 primitives 的 useAnchoredPosition，定位改走 CSS anchor positioning：
//   useId 生成 `--dsh-stat-*` 名字 → trigger 的 style.anchorName 声明锚点，
//   portal 面板的 style.positionAnchor 指向同一名字；几何、贴边与溢出回退全在官方
//   stat-dialog.module.css 的 anchor() / position-area / @position-try 里，JS 不再测量。
import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import { useDismissOnOutsidePointer } from '../../../ui/official.js'

/** React 18 的 CSSProperties 尚未收录 CSS anchor 的两个属性，补齐类型。 */
export type AnchorStyle = CSSProperties & { anchorName: string }
export type PositionAnchorStyle = CSSProperties & { positionAnchor: string }

/** 两个 CSS 属性必须指向同一个 anchor 名；抽成纯函数让渲染级自检能直接断言。 */
export function statDialogStyles(anchorName: string): { anchorStyle: AnchorStyle; panelStyle: PositionAnchorStyle } {
  return { anchorStyle: { anchorName }, panelStyle: { positionAnchor: anchorName } }
}

export interface StatDialogSeat {
  open: boolean
  setOpen(open: boolean): void
  rootRef: RefObject<HTMLSpanElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  anchorName: string
  anchorStyle: AnchorStyle
  panelStyle: PositionAnchorStyle
}

/** 官方 useStatDialog：受控开关 + CSS anchor 定位 + 点外 / Esc 关闭。 */
export function useStatDialog(controlled?: { open?: boolean; setOpen?(open: boolean): void }): StatDialogSeat {
  const [ownOpen, setOwnOpen] = useState<boolean>(false)
  const open = controlled?.open ?? ownOpen
  const setOpen = controlled?.setOpen ?? setOwnOpen
  const rootRef = useRef<HTMLSpanElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const anchorName = `--dsh-stat-${useId().replace(/:/g, '')}`
  const { anchorStyle, panelStyle } = statDialogStyles(anchorName)
  useDismissOnOutsidePointer(rootRef, open, setOpen, panelRef)
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    // 官方 chat：pointerdown 之外还要捕获阶段 click（只发 click 的交互也得关）。
    const onClick = (event: MouseEvent): void => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target) === true || panelRef.current?.contains(target) === true) return
      setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('click', onClick, true)
    }
  }, [open, setOpen])
  return { open, setOpen, rootRef, panelRef, anchorName, anchorStyle, panelStyle }
}
