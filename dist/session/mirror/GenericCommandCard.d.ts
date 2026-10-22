import { createElement as h } from 'react';
import type { Translate } from '../../utils/i18n.js';
/**
 * 工具调用 / 命令卡（官方 GenericToolCard + ToolRow 镜像）。
 * 折叠行 = 图标 + 标题 [+ 分隔点 + 摘要（文件路径链接化）+ 后缀]；展开体按官方分发链。
 */
export declare function GenericCommandCard(props: {
    name: string;
    argsRaw: string;
    output: string;
    isError: boolean;
    errorName?: string;
    /** 官方 ToolResultNode.meta（tool-fs diffs / read 窗口；归档快照透传）。 */
    meta?: unknown;
    /** 上游是否已结算（keyed kind==='tool-result'）；缺省按已结算（legacy 节点）。 */
    settled?: boolean;
    /** running 半截的 phase（官方 Tool block.phase）。 */
    phase?: 'preparing' | 'start';
    /** root.error.code === 'interrupted' ⇒ 官方 stopped 态。 */
    interrupted?: boolean;
    /** 统一 openFile 入口：read/write/edit 摘要路径渲染成官方 fileLink。 */
    onOpenFile?: (path: string) => void;
    t: Translate;
}): ReturnType<typeof h>;
//# sourceMappingURL=GenericCommandCard.d.ts.map