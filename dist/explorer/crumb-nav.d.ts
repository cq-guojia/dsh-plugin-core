/**
 * 文件浏览器的第一排：▾ 选层 + 面包屑 + 右侧动作（选择 / ✕）。
 *
 * 2026-11-03 从 `FileBrowser.ts` 拆出（那里原来五个职责挤在 1000 行里）：
 * 本模块只负责「怎么画」，状态、测量与导航全在调用方。
 * 两个变体：
 *  - {@link CrumbNav}：正常形态（有 ▾ + 可点面包屑）；
 *  - {@link PlainNav}：越界形态（整条换成只读完整路径，不给会失败的入口）。
 */
import { type ReactNode, type RefObject } from 'react';
import type { Translate } from '../utils/i18n.js';
export interface CrumbNavProps {
    translate: Translate;
    /** 落地页：面包屑位留空（还没进任何目录）。 */
    landing: boolean;
    crumbs: ReadonlyArray<{
        label: string;
        path: string;
    }>;
    /** 当前目录这一层是否被换成了「末段单显」（容器放不下）。 */
    overflow: boolean;
    menuItems: ReactNode[];
    menuOpen: boolean;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
    onLoadDir: (path: string) => void;
    /** 右侧「选当前目录」钮（不需要就给 null）。 */
    pickNow: ReactNode;
    onClose?: () => void;
    /** 可见面包屑容器（溢出测量用）。 */
    regionRef: RefObject<HTMLDivElement | null>;
    /** 隐藏测量条（与可见态逐字同构）。 */
    measureRef: RefObject<HTMLSpanElement | null>;
}
export declare function CrumbNav(props: CrumbNavProps): ReactNode;
export interface PlainNavProps {
    translate: Translate;
    /** 越界时的完整路径（只读）。 */
    path: string;
    pickNow: ReactNode;
    onClose?: () => void;
}
/** 越界（工作区外）：第一排整条换成只读完整路径，不给任何会失败的入口。 */
export declare function PlainNav(props: PlainNavProps): ReactNode;
//# sourceMappingURL=crumb-nav.d.ts.map