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
 * 官方 DeliverablesTail 的 presented 网格（改动文件卡 ChangedFiles 依赖 Host git 摘要路由，
 * 本弹窗无该通道 ⇒ 不渲染，与官方「summary 未就绪时不画」同态）。
 */
export declare function DeliverablesGridMirror(props: {
    files: readonly DeliveredFileFace[];
    onOpen?: (path: string) => void;
    t: Translate;
}): ReturnType<typeof h> | null;
//# sourceMappingURL=Deliverables.d.ts.map