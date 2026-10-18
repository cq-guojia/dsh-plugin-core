import { createElement as h, type ReactNode } from 'react';
export interface ChipProps {
    children?: ReactNode;
    onClick?: () => void;
    className?: string;
}
/** 小标签（token 用现成的 `--tdt-chip-bg`；传 `onClick` 才是可点的）。 */
export declare function Chip(props: ChipProps): ReturnType<typeof h>;
//# sourceMappingURL=Chip.d.ts.map