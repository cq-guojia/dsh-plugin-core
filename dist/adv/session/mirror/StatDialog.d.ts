import type { CSSProperties, RefObject } from 'react';
/** React 18 的 CSSProperties 尚未收录 CSS anchor 的两个属性，补齐类型。 */
export type AnchorStyle = CSSProperties & {
    anchorName: string;
};
export type PositionAnchorStyle = CSSProperties & {
    positionAnchor: string;
};
/** 两个 CSS 属性必须指向同一个 anchor 名；抽成纯函数让渲染级自检能直接断言。 */
export declare function statDialogStyles(anchorName: string): {
    anchorStyle: AnchorStyle;
    panelStyle: PositionAnchorStyle;
};
export interface StatDialogSeat {
    open: boolean;
    setOpen(open: boolean): void;
    rootRef: RefObject<HTMLSpanElement | null>;
    panelRef: RefObject<HTMLDivElement | null>;
    anchorName: string;
    anchorStyle: AnchorStyle;
    panelStyle: PositionAnchorStyle;
}
/** 官方 useStatDialog：受控开关 + CSS anchor 定位 + 点外 / Esc 关闭。 */
export declare function useStatDialog(controlled?: {
    open?: boolean;
    setOpen?(open: boolean): void;
}): StatDialogSeat;
//# sourceMappingURL=StatDialog.d.ts.map