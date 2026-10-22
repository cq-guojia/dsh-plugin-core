import { createElement as h } from 'react';
import type { Translate } from '../../utils/i18n.js';
import type { TurnLocationFace, TurnProcessHandle } from './ChatNodeSeat.js';
/** Turn 过程行：折叠时只有 label + 箭头；点开由外层 seat 把过程节点放出来。 */
export declare function TurnProcessNodeViewMirror(props: {
    turn: TurnLocationFace | undefined;
    turnProcess: TurnProcessHandle;
    t: Translate;
}): ReturnType<typeof h> | null;
//# sourceMappingURL=TurnProcessNodeView.d.ts.map