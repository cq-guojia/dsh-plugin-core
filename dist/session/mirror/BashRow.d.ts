import { createElement as h } from 'react';
import type { Translate } from '../../utils/i18n.js';
/** bash / pwsh 行（官方 BashRow 镜像）。 */
export declare function BashRowMirror(props: {
    name: string;
    argsRaw: string;
    output: string;
    isError: boolean;
    settled?: boolean;
    phase?: 'start' | 'preparing';
    interrupted?: boolean;
    t: Translate;
}): ReturnType<typeof h>;
//# sourceMappingURL=BashRow.d.ts.map