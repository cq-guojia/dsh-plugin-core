// 官方对照：packages/client/ui-chat/src/client/chat/ChatView.tsx（0.1.7-rc.2 lib/client.js:5004-5260）
// 骨架四层：frame（> TurnNavigator）> root[data-chat-following-tail] > scroll > column[data-chat-flow]
//   column 子项：hint（loading）/ openError / older（hasMore）/ 各 flowItem（ChatNodeList）
// root 内另有 toBottomSlot（官方按「是否贴尾」显隐，弹窗恒贴尾 ⇒ 不渲染）。
// ChatNodeList：entries → seat；官方 entries 优先取 grouped('chat')，取不到时 = order.map(key)。
import { createElement as h } from 'react';
import { ocOr } from '../official-classes.js';
import { ChatGroupSeatMirror } from './ChatGroupSeat.js';
import { ChatNodeSeatMirror } from './ChatNodeSeat.js';
/** 会话区骨架：frame > root > scroll > column（类名取官方 ChatView.module.css，缺失回退自绘）。
 *
 *  `dshpc-sv-frame` / `dshpc-sv-scroll` = 本包**稳定钩子类**（不参与 ocOr，官方类命中时也挂）：
 * 会话区**纵向间距的唯一真源**。官方 scroll 自带纵向 16px、官方 frame 的纵向值又不确定，
 * 归一方案（移植自兄弟项目 2026-10-03 定尺）：**scroll 钩子把官方纵向 16px 归零，
 * frame 钩子独自定 17/17**，两条钩子都用双类名提高特异性压过官方 CSS module（0,2,0 > 0,1,0），
 * 不依赖注入顺序 ⇒ 命中 / 未命中两条路径纵向完全一致。
 */
export function ChatViewFrame(props) {
    return h('div', { className: `${ocOr('ChatView', 'frame', 'dshpc-sv-body')} dshpc-sv-frame dshpc-sv-chat` }, h('div', { className: ocOr('ChatView', 'root', '') }, h('div', { className: `${ocOr('ChatView', 'scroll', '')} dshpc-sv-scroll` }, h('div', { className: ocOr('ChatView', 'column', 'dshpc-sv-col'), 'data-chat-flow': '' }, props.children))));
}
/** 官方 ChatNodeList：order → seat 列表（grouped 视图 = entries + groups 路径）。 */
export function ChatNodeListMirror(props) {
    const { order, store, entries, groups, turns, openState, onSetOpen, foldCompleted, renderNode, t } = props;
    const rows = [];
    const read = store === undefined ? undefined : store.get;
    if (typeof read !== 'function' || store === undefined)
        return rows;
    const readSafe = (key) => {
        try {
            return read.call(store, key);
        }
        catch {
            return undefined;
        }
    };
    if (entries !== undefined && groups !== undefined) {
        // 官方 deferCollapse：最新已完成轮次保持 flat——直接平铺组内条目、不画「已完成分析」过程分组头，
        // 直到下一条输入进来（官方 ChatGroupSeat：deferCollapse = bottom && 策略，bottom = 流末尾那个组）。
        // 锚点取「或」：① order 末尾节点所属轮（= 最新轮）；② entries 里最后一个过程分组（= 流最末的组）。
        // ② 必须要有：command 节点无 turn location ⇒ turnOfNode=undefined ⇒ 该组 data.turn 落到 -1
        // （process-groups.ts:176 `turn ?? -1`），且常排在 turn-tail 之后；只按轮号判断会整组漏掉、
        // 依旧收折成「已完成分析」（真机 2026-10-23）。
        let lastGroupKey;
        for (const entry of entries) {
            if (entry.kind === 'group')
                lastGroupKey = entry.key;
        }
        const lastTurn = (() => {
            for (let i = order.length - 1; i >= 0; i--) {
                const key = order[i];
                if (key === undefined)
                    continue;
                const node = readSafe(key);
                const loc = node?.location;
                if ((loc?.kind === 'turn' || loc?.kind === 'step') && typeof loc.turn?.turn === 'number') {
                    return loc.turn.turn;
                }
            }
            return undefined;
        })();
        // 官方 ChatNodeList 的 entries 路径：group 条目 → ChatGroupSeat（二级收折）。
        for (const entry of entries) {
            if (entry.kind === 'group') {
                const group = groups.get(entry.key);
                if (group === undefined)
                    continue;
                const latest = group.data.turn === lastTurn || group.key === lastGroupKey;
                rows.push(h(ChatGroupSeatMirror, {
                    key: entry.key,
                    group,
                    grouped: turnStatus(turns, group.data.turn) !== 'open' && !latest,
                    store,
                    openState,
                    onSetOpen,
                    foldCompleted,
                    renderNode,
                    t,
                }));
            }
            else {
                const node = readSafe(entry.key);
                if (node === undefined)
                    continue;
                rows.push(h(ChatNodeSeatMirror, {
                    key: JSON.stringify([entry.key, entry.groupPart ?? null]),
                    node,
                    groupPart: entry.groupPart,
                    store,
                    openState,
                    onSetOpen,
                    foldCompleted,
                    renderNode,
                }));
            }
        }
        return rows;
    }
    for (const key of order) {
        const node = readSafe(key);
        if (node === undefined)
            continue;
        rows.push(h(ChatNodeSeatMirror, { key, node, store, openState, onSetOpen, foldCompleted, renderNode }));
    }
    return rows;
}
/** turn 状态（官方 turns.get(turn)?.status）。 */
function turnStatus(turns, turn) {
    const row = turns?.get(turn) ?? turns?.get(String(turn));
    return row?.status;
}
/** 加载 / 空态提示行（13px tertiary）。 */
export function ChatHint(props) {
    return h('div', { className: ocOr('ChatView', 'hint', 'dshpc-sv-hint') }, props.text);
}
/** 「加载更早记录」按钮（官方 older：按钮 4px 12px / 12px 字号 / radius-sm / 底色 interactive-bg-hover-solid）。 */
export function ChatOlderButton(props) {
    return h('div', { className: ocOr('ChatView', 'older', 'dshpc-sv-older') }, h('button', { type: 'button', onClick: props.onClick }, props.label));
}
/** 「到底部」悬浮钮（官方 toBottom：34×34 圆形悬浮，仅在有更多历史时显示）。 */
export function ChatToBottom(props) {
    return h('div', { className: ocOr('ChatView', 'toBottomSlot', 'dshpc-sv-tobottom') }, h('button', { type: 'button', className: ocOr('ChatView', 'toBottom', ''), onClick: props.onClick, 'aria-label': props.label }, '↓'));
}
//# sourceMappingURL=ChatView.js.map