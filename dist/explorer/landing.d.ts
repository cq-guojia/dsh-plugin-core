/**
 * 落地页主体（picker 刚打开、还没进任何目录时的那张表）：上面一排根层（「根目录」或盘符），
 * 下面全部工作区。行 = 进去，行尾钮 = 直接选这个目录。
 *
 * 2026-11-03 从 `FileBrowser.ts` 拆出：这里只有「怎么画」，状态与取数全在调用方。
 */
import { type ReactNode } from 'react';
import type { Translate } from '../utils/i18n.js';
import type { WorkspaceAnchorItem } from './types.js';
export interface LandingBodyProps {
    translate: Translate;
    /** 根层条目：POSIX 单条「根目录」，Windows 一排盘符。 */
    roots: ReadonlyArray<{
        label: string;
        path: string;
    }>;
    anchors: readonly WorkspaceAnchorItem[];
    /** 选择器形态：行尾出「选择」钮（浏览器形态不出）。 */
    pickable: boolean;
    /** 进入该目录（点行 / 回车）。 */
    onOpen: (target: string) => void;
    /** 直接选中该目录（行尾钮）。 */
    onPickDir: (target: string) => void;
}
export declare function LandingBody(props: LandingBodyProps): ReactNode;
//# sourceMappingURL=landing.d.ts.map