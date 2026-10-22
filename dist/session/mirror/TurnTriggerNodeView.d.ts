import { createElement as h } from 'react';
import type { UtilMessageKey, Translate } from '../../utils/i18n.js';
/** 官方 turnTriggerDetails：source.kind → 标题与图标家族（默认 request）。 */
export declare function turnTriggerDetails(source: unknown): {
    title: UtilMessageKey;
    icon: string;
};
/** 触发行：折叠时只有「图标 + 标题 + 时间 + 箭头」，点开展示注入原文。 */
export declare function TurnTriggerNodeViewMirror(props: {
    /** turn-trigger 节点 data（ContextMessageNode & { waking? }）。 */
    data: Record<string, unknown> | undefined;
    t: Translate;
}): ReturnType<typeof h>;
//# sourceMappingURL=TurnTriggerNodeView.d.ts.map