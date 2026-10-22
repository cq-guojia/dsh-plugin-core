import type { CSSProperties, RefObject } from 'react';
export interface StatDialogSeat {
    open: boolean;
    setOpen(open: boolean): void;
    rootRef: RefObject<HTMLSpanElement | null>;
    panelRef: RefObject<HTMLDivElement | null>;
    pos: CSSProperties | undefined;
}
/** 官方 useStatDialog：把弹层挂在触发器上方（side: 'top'），点外 / Esc 关闭。 */
export declare function useStatDialog(controlled?: {
    open?: boolean;
    setOpen?(open: boolean): void;
}): StatDialogSeat;
//# sourceMappingURL=StatDialog.d.ts.map