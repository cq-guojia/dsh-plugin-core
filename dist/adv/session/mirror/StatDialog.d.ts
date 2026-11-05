import type { CSSProperties, RefObject } from 'react';
/**
 * 官方 stat-dialog.ts 的 MEASURE_STYLE：首趟（pos 未定）时面板「隐藏但仍布局」，
 * 好让 useAnchoredPosition 量到真实尺寸。官方要求面板铺 `pos ?? MEASURE_STYLE`；
 * 漏了它 ⇒ 首趟完全无定位、面板落进文档流撑长页面（真机 2026-10-23：点用量无反应 + 滚动条变长）。
 */
export declare const STAT_MEASURE_STYLE: CSSProperties;
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