import { createElement as h } from 'react';
import type { Translate } from '../../utils/i18n.js';
/** 官方 ContextNode 数据面（content / source / producer / form）。 */
export interface ContextFace {
    content?: readonly unknown[];
    source?: unknown;
    producer?: {
        role?: string;
        label?: string | null;
    } | null;
    form?: string | null;
}
/** 系统注入上下文行（官方 ContextInjectionRow 的 opaque 版）。 */
export declare function ContextInjectionRowMirror(props: {
    node: ContextFace;
    t: Translate;
}): ReturnType<typeof h>;
//# sourceMappingURL=ContextInjectionRow.d.ts.map