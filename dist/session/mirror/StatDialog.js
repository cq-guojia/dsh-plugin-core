// 官方对照：packages/client/ui-chat/src/client/chat/stat-dialog.js（0.1.7-rc.2 lib/client.js:6278-6350）
//   PANEL_MARGIN = 12 / PANEL_GAP = 8（lib/client.js:6281-6283）
//   useStatDialog = 受控开关 + useAnchoredPosition(side:'top') + useDismissOnOutsidePointer + Escape 关闭。
// 官方用的是 primitives 的同名 hook，这里直接复用同一份实现（不是自绘定位）。
import { useEffect, useRef, useState } from 'react';
import { useAnchoredPosition, useDismissOnOutsidePointer } from '../../ui/official.js';
const PANEL_MARGIN = 12;
const PANEL_GAP = 8;
/** 官方 useStatDialog：把弹层挂在触发器上方（side: 'top'），点外 / Esc 关闭。 */
export function useStatDialog(controlled) {
    const [ownOpen, setOwnOpen] = useState(false);
    const open = controlled?.open ?? ownOpen;
    const setOpen = controlled?.setOpen ?? setOwnOpen;
    const rootRef = useRef(null);
    const panelRef = useRef(null);
    const pos = useAnchoredPosition({ open, anchorRef: rootRef, panelRef, side: 'top', gap: PANEL_GAP, margin: PANEL_MARGIN });
    useDismissOnOutsidePointer(rootRef, open, setOpen, panelRef);
    useEffect(() => {
        if (!open)
            return;
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                setOpen(false);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => { document.removeEventListener('keydown', onKeyDown); };
    }, [open, setOpen]);
    return { open, setOpen, rootRef, panelRef, pos };
}
//# sourceMappingURL=StatDialog.js.map