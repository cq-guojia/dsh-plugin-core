import { createElement as h } from 'react';
import type { Translate } from '../../utils/i18n.js';
/** 官方 TurnTokenUsage 的消费面。 */
export interface TurnTokenUsageFace {
    totalTokens: number;
    uncachedInputTokens: number;
    cacheReadTokens?: number;
    cacheWriteTokens?: number;
    outputTokens: number;
    reasoningTokens?: number;
    routes?: ReadonlyArray<{
        provider: string;
        model: string;
    }>;
}
/** 本轮用量 pill + 明细弹层。 */
export declare function TurnUsagePanelMirror(props: {
    usage: TurnTokenUsageFace;
    t: Translate;
}): ReturnType<typeof h>;
//# sourceMappingURL=TurnUsagePanel.d.ts.map