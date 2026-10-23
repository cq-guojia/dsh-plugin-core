import { type ReactNode } from 'react';
import { type Translate } from '../../utils/i18n.js';
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
    /** 审阅态右上角 ✕ 关闭（hover 预览态不传 = 不显示；复用 FileBrowser 行尾同一个 IconButton + 官方 ✕）。 */
    onClose?: () => void;
}): ReactNode;
//# sourceMappingURL=ChangedFileDiff.d.ts.map