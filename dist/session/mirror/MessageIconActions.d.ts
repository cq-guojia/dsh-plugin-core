import { createElement as h } from 'react';
import type { ReactNode } from 'react';
import type { Translate } from '../../utils/i18n.js';
/** 消息操作行（复制 / 分支 / 用量 / 时钟）。 */
export declare function MessageIconActionsMirror(props: {
    text: string;
    time?: number;
    clock: 'start' | 'end';
    onBranch?: (() => void) | undefined;
    branchUnavailable?: boolean;
    className?: string;
    extraActions?: ReactNode;
    usageAction?: ReactNode;
    t: Translate;
}): ReturnType<typeof h>;
//# sourceMappingURL=MessageIconActions.d.ts.map