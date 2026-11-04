// 官方对照：ui-chat@0.2.1-rc.5 lib/client.js:6986-7045（lastContent / TurnTailNodeView）
//   root（flex column，gap 16px）> [tailSlot] > actions（margin-top 4px / margin-left -6px）
//   data-turn-tail = turn；data-actions-reveal = endsWithResponse ? "always" : "hover"
//     endsWithResponse = 该轮是最后一场 turn，且该轮最后一条内容节点的最后一个可见块算「回复」
//     （reasoning / tool-call 不算，空文本不算）——官方据此决定操作行常显还是悬停才显。
//   closing === null（本轮没有回复）⇒ 只留 turnTail 插槽；弹窗无插槽 ⇒ 整块不渲染。
//   branchUnavailable = data.branchUnavailable || hasLaterChatNode（该轮之后还有内容 ⇒ 不能从这轮开分支）。
import { createElement as h } from 'react';
import { officialClass } from '../official-classes.js';
import { turnOf } from './ChatNodeSeat.js';
import { MessageIconActionsMirror } from './MessageIconActions.js';
import { TurnUsagePanelMirror } from './TurnUsagePanel.js';
/** 官方 hasAssistantReplyContent。 */
export function hasAssistantReplyContent(blocks) {
    return blocks.some((block) => {
        if (block.kind === 'reasoning' || block.kind === 'tool-call')
            return false;
        if (block.kind === 'text')
            return (block.text ?? '').trim() !== '';
        return true;
    });
}
/** 官方 assistantText：只取 text 块。 */
function assistantText(blocks) {
    return blocks.flatMap(block => (block.kind === 'text' ? [block.text ?? ''] : [])).join('');
}
/** 官方 lastContent：该轮最后一个内容节点（跳过 turn-tail / turn-process，可选跳过 turn-max-tokens）。 */
function lastContent(nodes, skipMaxTokens) {
    for (let index = nodes.length - 1; index >= 0; index--) {
        const node = nodes[index];
        if (node === undefined || node.kind === 'turn-tail' || node.kind === 'turn-process')
            continue;
        if (skipMaxTokens && node.kind === 'turn-max-tokens')
            continue;
        return node;
    }
    return undefined;
}
/**
 * 按 order + nodeStore 预计算尾部事实。
 * @param props.order - 渲染顺序（官方 order）。
 * @param props.store - 节点仓库。
 * @param props.lastTurn - 最后一轮的 turn 号（官方 timeline.turnOrder.at(-1)）。
 */
export function buildTurnTailFacts(props) {
    const { order, store, lastTurn } = props;
    const nodesOfTurn = (turn) => {
        const out = [];
        for (const key of order) {
            const node = store.get(key);
            if (node !== undefined && turnOf(node) === turn)
                out.push(node);
        }
        return out;
    };
    return {
        endsWithResponse(turn) {
            if (lastTurn !== turn)
                return false;
            const last = lastContent(nodesOfTurn(turn), false);
            const blocks = last?.kind === 'assistant-step' ? last.data?.blocks : undefined;
            if (!Array.isArray(blocks))
                return false;
            for (let index = blocks.length - 1; index >= 0; index--) {
                const block = blocks[index];
                if (block === undefined)
                    continue;
                // 官方 findLast 条件：非 text/reasoning 块，或文本非空。
                if ((block.kind !== 'text' && block.kind !== 'reasoning') || (block.text ?? '').trim() !== '') {
                    return hasAssistantReplyContent([block]);
                }
            }
            return false;
        },
        hasLaterChatNode(turn, anchorSeq) {
            return (lastContent(nodesOfTurn(turn), true)?.anchorSeq ?? -1) > anchorSeq;
        },
    };
}
/** Turn 尾部操作行：复制 / 分支 / 用量 / 结束时钟。 */
export function TurnTailNodeViewMirror(props) {
    const { data, onBranchAt, tailSlot, facts, t } = props;
    const closing = data.closing;
    if (closing === null || closing === undefined)
        return null;
    const text = assistantText(closing.blocks);
    const anchorSeq = closing.finalNode?.seq ?? data.seq;
    return h('div', {
        className: officialClass('TurnTailNodeView', 'root') ?? '',
        'data-turn-tail': data.turn,
        'data-actions-reveal': facts === undefined || facts.endsWithResponse(data.turn) ? 'always' : 'hover',
    }, tailSlot === undefined || tailSlot === null ? null : tailSlot, h(MessageIconActionsMirror, {
        text,
        time: closing.time,
        clock: 'end',
        // 分支：点分支 = 确认框 → fork({ atSeq: 该轮 tail seq })——从这条消息位置截断开分支；
        // 头部按钮 = 省略 atSeq（最新已完成 turn 前缀）。
        onBranch: onBranchAt === undefined ? undefined : () => { onBranchAt(data.seq); },
        branchUnavailable: data.branchUnavailable === true
            || facts?.hasLaterChatNode(data.turn, anchorSeq),
        className: officialClass('TurnTailNodeView', 'actions') ?? '',
        usageAction: data.tokenUsage === undefined ? undefined : h(TurnUsagePanelMirror, { usage: data.tokenUsage, t }),
        t,
    }));
}
//# sourceMappingURL=TurnTailNodeView.js.map