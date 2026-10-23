import { type ReactNode } from 'react';
import type { Translate } from '../../utils/i18n.js';
/** 官方 CommandNode（conversation-nodes/command.ts / records.d.ts）：斜杠命令生命周期节点。 */
export interface CommandNodeFace {
    readonly name?: string | null;
    readonly args?: string | null;
    readonly outcome?: {
        readonly kind?: string;
        readonly text?: string;
    } | null;
}
/** 命令卡（官方 GenericCommandCard 镜像）：裸命令名 + 落定摘要 + 多行输出可展开。 */
export declare function CommandCard(props: {
    /** 官方 CommandNode（name/args/outcome）。 */
    node: CommandNodeFace;
    t: Translate;
    /** 未决态运行文案；缺省用 t('commandRunning')（官方 command.running）。 */
    runningSummary?: string;
}): ReactNode;
//# sourceMappingURL=CommandCard.d.ts.map