import { createElement as h } from 'react';
import type { UtilMessageKey, Translate } from '../../../utils/i18n.js';
/**
 * 官方 turn-trigger.ts:20-32 `subagentTitle`：按 source.stopReason 六分支选标题。
 * 非字符串 / 空串回落到通用态；未收录的 reason 一律走 unknown，不暗示成功。
 */
export declare function subagentTitle(reason: unknown): UtilMessageKey;
/** 官方 turn-trigger.ts:35-46：source.kind → 标题 / 图标 / compact（retry 且 content 为空的继续回执）。 */
export declare function turnTriggerDetails(data: Record<string, unknown> | undefined): {
    title: UtilMessageKey;
    icon: string;
    compact?: true;
};
/** 触发行：折叠时只有「图标 + 标题 + 时间 + 箭头」，点开展示注入原文。 */
export declare function TurnTriggerNodeViewMirror(props: {
    /** turn-trigger 节点 data（ContextMessageNode & { waking? }）。 */
    data: Record<string, unknown> | undefined;
    t: Translate;
}): ReturnType<typeof h>;
/** 官方 contentRuns：连续 text 块合并成一段（未知块不参与文本拼接）。 */
export declare function modelFacingRuns(content: unknown, t: Translate): string[];
//# sourceMappingURL=TurnTriggerNodeView.d.ts.map