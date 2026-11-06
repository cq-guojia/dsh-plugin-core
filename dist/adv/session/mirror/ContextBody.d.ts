import type { ReactNode } from 'react';
import type { Translate } from '../../../utils/i18n.js';
/** 官方 contextBody 认得的 form 名（未知 / 空 = opaque）。 */
export type ContextForm = 'instructions' | 'catalog' | 'snapshot' | 'notice' | 'relay' | 'recall';
/**
 * 官方 ModelFacingContent：连续 text 块合并为一个 run，一段一个 pre。
 * 非 text 块官方走 JsonBlock，本仓无该原语 ⇒ 保持既有行为（不进正文，不伪造）。
 */
export declare function modelFacingContent(content: unknown, t: Translate): ReactNode;
/** 一个 context 节点的正文：按 form 分派，读不出即回落 opaque（rendered = null）。 */
export interface ContextBodyView {
    /** 实际渲染成的 form（null = opaque）。 */
    rendered: ContextForm | null;
    /** 折叠行的一行话（只有 notice 有）。 */
    summary: string | null;
    body: ReactNode;
}
export declare function contextBodyView(props: {
    form: unknown;
    content: unknown;
    source: unknown;
    t: Translate;
}): ContextBodyView;
//# sourceMappingURL=ContextBody.d.ts.map