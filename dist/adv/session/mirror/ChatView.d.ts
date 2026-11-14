import { createElement as h } from 'react';
import type { ReactNode } from 'react';
import type { Translate } from '../../../utils/i18n.js';
import type { ChatNodeStoreFace } from '../faces.js';
import type { NodeRenderer } from './ChatNodeSeat.js';
import type { ChatEntry, ProcessGroupSnapshot } from './process-groups.js';
/** 会话区骨架：frame > root > scroll > column（类名一律取官方 ChatView.module.css，取不到 = 空类）。
 *
 *  `dshpc-sv-frame` / `dshpc-sv-scroll` = 本包**稳定钩子类**（不走 officialClass 发现，官方类命中时也照样挂）：
 * 会话区**纵向间距的唯一真源**。官方 scroll 自带纵向 16px、官方 frame 的纵向值又不确定，
 * 归一方案（移植自兄弟项目 2026-10-03 定尺）：**scroll 钩子把官方纵向 16px 归零，
 * frame 钩子独自定 17/17**，两条钩子都用双类名提高特异性压过官方 CSS module（0,2,0 > 0,1,0），
 * 不依赖注入顺序 ⇒ 命中 / 未命中两条路径纵向完全一致。
 */
export declare function ChatViewFrame(props: {
    children?: ReactNode;
}): ReturnType<typeof h>;
/** 官方 ChatNodeList：order → seat 列表（grouped 视图 = entries + groups 路径）。 */
export declare function ChatNodeListMirror(props: {
    order: readonly string[];
    store?: ChatNodeStoreFace;
    /** 官方 grouped('chat') 的 entries + 组快照（buildProcessGroups 产出）；缺省走 order 兜底。 */
    entries?: ReadonlyArray<ChatEntry>;
    groups?: ReadonlyMap<string, ProcessGroupSnapshot>;
    openState: ReadonlyMap<number, number>;
    onSetOpen(turn: number, answerStep: number, open: boolean): void;
    foldCompleted: boolean;
    renderNode: NodeRenderer;
    t: Translate;
}): Array<ReturnType<typeof h> | null>;
/** 加载 / 空态提示行（13px tertiary）。 */
export declare function ChatHint(props: {
    text: string;
}): ReturnType<typeof h>;
/** 打开历史失败行（官方 openError：与 hint 同排版但走错误色）。 */
export declare function ChatOpenError(props: {
    text: string;
}): ReturnType<typeof h>;
/** 官方 CommandNodeView / ManualCompactionNodeView 的 callRow 外壳（斜杠命令 / 手动压缩生命周期行）。 */
export declare function ChatCallRow(props: {
    children?: ReactNode;
}): ReturnType<typeof h>;
/** 官方 ChatView.tsx:253-272：older 按钮内 5 个叠放 span，只有当前态可见，其余挂 historyHidden 避免按钮宽度跳变。 */
export type ChatHistoryState = 'more' | 'loading' | 'processing' | 'error' | 'start';
export declare function ChatOlderButton(props: {
    labels: Record<ChatHistoryState, string>;
    hasMore: boolean;
    loadingOlder?: boolean;
    historyLoadStatus?: 'idle' | 'loading' | 'error' | 'pendingConsumption';
    historyInputHeld?: boolean;
    historyProcessing?: boolean;
    onClick: () => void;
}): ReturnType<typeof h>;
/** 「到底部」悬浮钮（官方 toBottom：34×34 圆形悬浮，仅在有更多历史时显示）。 */
export declare function ChatToBottom(props: {
    label: string;
    onClick: () => void;
}): ReturnType<typeof h>;
//# sourceMappingURL=ChatView.d.ts.map