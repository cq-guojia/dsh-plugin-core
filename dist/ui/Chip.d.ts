import { createElement as h, type ReactNode } from 'react';
/** 标签语义色档（非 neutral 为实心信号面，字色配对见 chip.css）。 */
export type ChipTone = 'neutral' | 'business' | 'success' | 'warning' | 'danger';
/** 标签尺寸档（sm 即旧版默认，逐像素不变；xs 为 2026-10-20 新增的超小档）。 */
export type ChipSize = 'sm' | 'md' | 'xs';
export interface ChipProps {
    children?: ReactNode;
    /** 语义色（默认 neutral 灰面）。 */
    tone?: ChipTone;
    /** 尺寸（默认 sm）。 */
    size?: ChipSize;
    /**
     * 固定宽（px 或任意 CSS 宽度值）。与 `minWidth` / `maxWidth` 互斥：一旦设定，后两者自动失效。
     */
    width?: number | string;
    /** 最小宽：`width` 未设时生效，内容不足此宽时以它为准。 */
    minWidth?: number | string;
    /**
     * 最大宽：`width` 未设时生效，文字超出时折叠成省略号，hover 以跑马灯展开全名。
     */
    maxWidth?: number | string;
    onClick?: () => void;
    /** 追加 class（只允许补布局，不许覆盖皮肤）。 */
    className?: string;
}
/** 小标签（neutral 用现成的 `--dshpc-chip-bg`；传 `onClick` 才是可点的）。 */
export declare function Chip(props: ChipProps): ReturnType<typeof h>;
//# sourceMappingURL=Chip.d.ts.map