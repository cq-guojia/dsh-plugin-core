import { type ReactNode } from 'react';
import { type Translate } from '../../../utils/i18n.js';
/** 一个变更文件的 diff 体（状态机 + unified 行渲染）。 */
export declare function ChangedFileDiff(props: {
    sessionId: string;
    seq: number;
    index: number;
    /** 官方 display（工作区相对路径，作卡头）。 */
    display: string;
    /** 文案翻译；缺省用核心字典（demo 自带字典不认 changes/diff 这些 key）。 */
    t?: Translate;
    /**
     * 渲染变体（官方两套壳）：
     * - `preview`（默认）= hover 预览，`ChangedFiles.preview` 紧凑壳：限高、隐 note / hunk 头；
     * - `review` = 点开后的完整 FileDiff：hunk 头（`@@ -a,b +c,d @@`）与 note 正常显示。
     * 之前一律用 preview 壳，导致审阅视图里 hunk 头被 CSS 隐掉（用户截图对照官方）。
     */
    variant?: 'preview' | 'review';
    /**
     * 关掉承载它的面板（审阅态右上角那枚 ✕，与换行钮同排）。
     * 用户 2026-11-04：无头面板的关钮归内容自己画 ⇒ 审阅入口必须传它。
     */
    onClose?: () => void;
}): ReactNode;
//# sourceMappingURL=ChangedFileDiff.d.ts.map