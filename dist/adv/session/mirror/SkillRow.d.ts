import { createElement as h } from 'react';
import type { Translate } from '../../../utils/i18n.js';
/** `skill` 工具调用的官方专属行（tool.call.toolview key='skill'）。 */
export declare function SkillRowMirror(props: {
    argsRaw: string;
    output: string;
    isError: boolean;
    settled?: boolean;
    phase?: 'start' | 'preparing';
    interrupted?: boolean;
    t: Translate;
}): ReturnType<typeof h>;
//# sourceMappingURL=SkillRow.d.ts.map