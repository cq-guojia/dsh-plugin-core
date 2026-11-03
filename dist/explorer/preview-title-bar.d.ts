/**
 * 预览态的第二排：文件名 + 渲染⇄源码切换 / 复制路径 / 刷新。
 *
 * 2026-11-03 从 `FileBrowser.ts` 拆出。档位照兄弟项目调用点：Segmented `sm` + 图标钮 `md`
 * （核心 Segmented 高度由 CSS 定，不随档变）。
 */
import { type ReactNode } from 'react';
import type { Translate } from '../utils/i18n.js';
export interface PreviewTitleBarProps {
    translate: Translate;
    /** 正在预览的文件绝对路径。 */
    path: string;
    /** md / html 才出「渲染 ⇄ 源码」。 */
    switchable: boolean;
    /** md 用 md 的 aria 文案，html 用 html 的。 */
    isMarkdown: boolean;
    /** 当前是否在看源码。 */
    sourceView: boolean;
    onSourceViewChange: (source: boolean) => void;
    /** 刚复制过（图标切对勾）。 */
    copied: boolean;
    onCopyPath: () => void;
    onReload: () => void;
}
export declare function PreviewTitleBar(props: PreviewTitleBarProps): ReactNode;
//# sourceMappingURL=preview-title-bar.d.ts.map