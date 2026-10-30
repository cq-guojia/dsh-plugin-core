// 官方对照：packages/client/ui-chat/src/client/chat/ChatView.tsx（0.1.7-rc.2 lib/client.js:5004-5260）
// 骨架四层：frame（> TurnNavigator）> root[data-chat-following-tail] > scroll > column[data-chat-flow]
//   column 子项：hint（loading）/ openError / older（hasMore）/ 各 flowItem（ChatNodeList）
// root 内另有 toBottomSlot（官方按「是否贴尾」显隐，弹窗恒贴尾 ⇒ 不渲染）。
// ChatNodeList：entries → seat；官方 entries 优先取 grouped('chat')，取不到时 = order.map(key)。
import { createElement as h } from 'react';
import { officialClass } from '../official-classes.js';
import { ChatGroupSeatMirror } from './ChatGroupSeat.js';
import { ChatNodeSeatMirror } from './ChatNodeSeat.js';
import { ensureComponentStyles } from '../../ui/css.js';
import { SESSION_CSS } from '../session-css.js';
/** 会话区骨架：frame > root > scroll > column（类名一律取官方 ChatView.module.css，取不到 = 空类）。
 *
 *  `dshpc-sv-frame` / `dshpc-sv-scroll` = 本包**稳定钩子类**（不走 officialClass 发现，官方类命中时也照样挂）：
 * 会话区**纵向间距的唯一真源**。官方 scroll 自带纵向 16px、官方 frame 的纵向值又不确定，
 * 归一方案（移植自兄弟项目 2026-10-03 定尺）：**scroll 钩子把官方纵向 16px 归零，
 * frame 钩子独自定 17/17**，两条钩子都用双类名提高特异性压过官方 CSS module（0,2,0 > 0,1,0），
 * 不依赖注入顺序 ⇒ 命中 / 未命中两条路径纵向完全一致。
 */
export function ChatViewFrame(props) {
    ensureComponentStyles('session', SESSION_CSS);
    return h('div', { className: `${officialClass('ChatView', 'frame') ?? ''} dshpc-sv-frame dshpc-sv-chat` }, h('div', { className: officialClass('ChatView', 'root') ?? '' }, h('div', { className: `${officialClass('ChatView', 'scroll') ?? ''} dshpc-sv-scroll` }, h('div', { className: officialClass('ChatView', 'column') ?? '', 'data-chat-flow': '' }, props.children))));
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
        // 官方 deferCollapse：**每一轮（turn）的最后那一个过程组**保持 flat
        // （不画「已完成分析…」头、组内条目直接铺开），该轮其余组照常收折。
        // 例：turn 1 切出 2 组 ⇒ 前 1 组收折、最后 1 组平铺；turn 3 切出 5 组 ⇒ 前 4 组收折、最后 1 组平铺。
        // ⚠️ turn = -1 的组（command 节点无 turn location，process-groups.ts:176 `turn ?? -1`）
        // **不开新轮**，并入它前面那一轮 —— 否则会被单独当成一轮、多平铺一处（真机 2026-10-23）。
        const flatKeys = new Set();
        {
            let bucket = [];
            let bucketTurn;
            const closeBucket = () => {
                const last = bucket[bucket.length - 1];
                if (last !== undefined)
                    flatKeys.add(last);
                bucket = [];
            };
            for (const entry of entries) {
                if (entry.kind !== 'group')
                    continue;
                const turn = groups.get(entry.key)?.data.turn ?? -1;
                if (turn >= 1) {
                    if (bucketTurn !== undefined && turn !== bucketTurn)
                        closeBucket();
                    bucketTurn = turn;
                }
                bucket.push(entry.key);
            }
            closeBucket();
        }
        // 官方 ChatNodeList 的 entries 路径：group 条目 → ChatGroupSeat（二级收折）。
        for (const entry of entries) {
            if (entry.kind === 'group') {
                const group = groups.get(entry.key);
                if (group === undefined)
                    continue;
                const latest = flatKeys.has(group.key);
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
    return h('div', { className: officialClass('ChatView', 'hint') ?? '' }, props.text);
}
/** 「加载更早记录」按钮（官方 older：按钮 4px 12px / 12px 字号 / radius-sm / 底色 interactive-bg-hover-solid）。 */
export function ChatOlderButton(props) {
    return h('div', { className: officialClass('ChatView', 'older') ?? '' }, h('button', { type: 'button', onClick: props.onClick }, props.label));
}
/** 「到底部」悬浮钮（官方 toBottom：34×34 圆形悬浮，仅在有更多历史时显示）。 */
export function ChatToBottom(props) {
    return h('div', { className: officialClass('ChatView', 'toBottomSlot') ?? '' }, h('button', { type: 'button', className: officialClass('ChatView', 'toBottom') ?? '', onClick: props.onClick, 'aria-label': props.label }, '↓'));
}
//# sourceMappingURL=ChatView.js.map