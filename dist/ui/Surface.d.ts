import { createElement as h, type CSSProperties, type ReactNode } from 'react';
/** 底色档（映射到 design 的 surface token）。 */
export type SurfaceTone = 'plain' | 'raised' | 'sunken' | 'subtle';
/** 边框档：默认 1px 实线；`faint` 更淡；`none` 透明（保留 1px 占位，不跳高）；`dashed` 虚线（占位框）。 */
export type SurfaceBorder = true | 'faint' | 'none' | 'dashed';
/** 圆角档：默认 `md`(12)，与 Button / Input 同档。 */
export type SurfaceRadius = 'sm' | 'md' | 'lg' | 'none';
/** 内距档（四拍）：`sm`=8 / `md`=12 / `lg`=16。 */
export type SurfacePadding = 'none' | 'sm' | 'md' | 'lg';
export interface SurfaceProps {
    tone?: SurfaceTone;
    border?: SurfaceBorder;
    radius?: SurfaceRadius;
    /** `null` = 不带内距：给「四边内距要自己算」的容器（Card 的色条贴边）用。 */
    padding?: SurfacePadding | null;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
}
interface SurfaceClassOptions {
    tone?: SurfaceTone;
    border?: SurfaceBorder;
    radius?: SurfaceRadius;
    /** `null` = 不带内距：给「四边内距要自己算」的容器（Card 的色条贴边）用。 */
    padding?: SurfacePadding | null;
}
/**
 * 拼 Surface 的类名。独立导出是给组合类容器（Card）用的：
 * 容器要把 Surface 当外框、又不想吃它的内距时，传 `padding: null` 即可。
 */
export declare function surfaceClass(options?: SurfaceClassOptions): string;
/**
 * 纯框容器：底 / 边框 / 圆角 / 内距四根轴，零业务语义。
 * 它是**圆角契约的唯一真源**（容器档 12，与控件同档），下游要用「一块一块的面」时用它，
 * 不要再自己写 border + border-radius。
 *
 * ```tsx
 * h(Surface, { tone: 'sunken', padding: 'md' }, h('div', null, '任意内容'))
 * ```
 */
export declare function Surface(props: SurfaceProps): ReturnType<typeof h>;
export {};
//# sourceMappingURL=Surface.d.ts.map