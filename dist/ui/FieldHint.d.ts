import { createElement as h, type CSSProperties } from 'react';
export interface FieldHintProps {
    /** 气泡里的说明文字（也是读屏播报的 aria-label）；`\n` 是真实换行。 */
    text: string;
    /** 气泡方位（注入路径走官方；默认 top）。 */
    side?: 'top' | 'bottom' | 'right';
    /** 上 / 下气泡的水平对齐（注入路径走官方）。 */
    align?: 'center' | 'end';
    /** 气泡宽度上限 px（注入路径走官方）。 */
    maxWidth?: number;
    /** 追加 class。 */
    className?: string;
    /** 追加样式（只允许补布局）。 */
    style?: CSSProperties;
}
/** 问号提示图标：hover / focus 浮出说明气泡。 */
export declare function FieldHint(props: FieldHintProps): ReturnType<typeof h>;
//# sourceMappingURL=FieldHint.d.ts.map