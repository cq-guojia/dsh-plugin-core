import { createElement as h } from 'react';
import type { ComponentType } from 'react';
import type { Translate } from '../../utils/i18n.js';
import type { ChatNodeStoreFace } from '../faces.js';
import { type NodeRenderer } from './ChatNodeSeat.js';
import { type ProcessActivity, type ProcessGroupSnapshot } from './process-groups.js';
/** 官方 PROCESS_ICONS（lib/client.js:2187-2201）；工具行图标同源（edit/write=铅笔、generic=sparkle）。 */
export declare const PROCESS_ICONS: Record<ProcessActivity | 'thinking', ComponentType<{
    size?: number;
    className?: string;
}>>;
/** 过程分组（二级收折）：汇总行 + 组内条目。 */
export declare function ChatGroupSeatMirror(props: {
    group: ProcessGroupSnapshot;
    /** 官方 grouped：历史轮（turn 非 open）才收折。 */
    grouped: boolean;
    store?: ChatNodeStoreFace;
    openState: ReadonlyMap<number, number>;
    onSetOpen(turn: number, answerStep: number, open: boolean): void;
    foldCompleted: boolean;
    renderNode: NodeRenderer;
    t: Translate;
}): ReturnType<typeof h> | null;
//# sourceMappingURL=ChatGroupSeat.d.ts.map