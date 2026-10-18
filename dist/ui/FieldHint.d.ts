import { createElement as h, type CSSProperties } from 'react';
export interface FieldHintProps {
    /** 气泡里的说明文字（也是读屏播报的 aria-label）。 */
    text: string;
    /** 追加 class。 */
    className?: string;
    /** 追加样式（只允许补布局）。 */
    style?: CSSProperties;
}
/** 问号提示图标：hover / focus 浮出说明气泡。 */
export declare function FieldHint(props: FieldHintProps): ReturnType<typeof h>;
//# sourceMappingURL=FieldHint.d.ts.map