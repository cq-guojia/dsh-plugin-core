import { createElement as h } from 'react';
import type { Translate } from '../../utils/i18n.js';
/** 官方 PresentedFile 的消费面（presented.d.ts：path 必有，description 可选）。 */
export interface DeliveredFileFace {
    path: string;
    description?: string;
}
/** 官方 PresentRow：present 工具调用的状态行（折叠 = 状态词 + 路径；展开 = 结果原文）。 */
export declare function PresentRowMirror(props: {
    block: unknown;
    t: Translate;
}): ReturnType<typeof h>;
/**
 * 官方 DeliverablesTail 的 presented 网格（FileTypeIcon + 文件名 + 简介，整卡可点 → 预览）。
 * 「已编辑文件」卡（ChangedFiles）不在这里：它走宿主 api/changes.summary，见
 * mirror/ChangedFilesCard.ts。数据真源 = turn 级 `deliverables.presented`
 * （官方 TurnLocation.data.get('deliverables')，见 changes.ts）。
 */
export declare function DeliverablesGridMirror(props: {
    files: readonly DeliveredFileFace[];
    onOpen?: (path: string) => void;
    t: Translate;
}): ReturnType<typeof h> | null;
//# sourceMappingURL=Deliverables.d.ts.map