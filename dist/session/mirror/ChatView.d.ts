import { createElement as h } from 'react';
import type { ReactNode } from 'react';
import type { Translate } from '../../utils/i18n.js';
import type { ChatNodeStoreFace, TurnsFace } from '../faces.js';
import type { NodeRenderer } from './ChatNodeSeat.js';
import type { ChatEntry, ProcessGroupSnapshot } from './process-groups.js';
/** 会话区骨架：frame > root > scroll > column（类名取官方 ChatView.module.css，缺失回退自绘）。
 *
 *  `dshpc-sv-frame` / `dshpc-sv-scroll` = 本包**稳定钩子类**（不参与 ocOr，官方类命中时也挂）：
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
    /** 官方 timeline.turns（判 turn 是否 open ⇒ grouped 政策）。 */
    turns?: TurnsFace;
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
/** 「加载更早记录」按钮（官方 older：按钮 4px 12px / 12px 字号 / radius-sm / 底色 interactive-bg-hover-solid）。 */
export declare function ChatOlderButton(props: {
    label: string;
    onClick: () => void;
}): ReturnType<typeof h>;
/** 「到底部」悬浮钮（官方 toBottom：34×34 圆形悬浮，仅在有更多历史时显示）。 */
export declare function ChatToBottom(props: {
    label: string;
    onClick: () => void;
}): ReturnType<typeof h>;
//# sourceMappingURL=ChatView.d.ts.map