// 官方对照：packages/client/ui-chat/src/client/chat/ChatNodeSeat.tsx（0.1.7-rc.2 lib/client.js:1668-1771）
//   + 同文件里的 ChatNodeList（lib/client.js:5004-5038，order → seat 列表）。
//
// 这是「官方把一个 turn 折成一行」的全部判定，逐行照抄（源码行号见兄弟项目 ui-map §十七）：
//   liveProcess        = presentation && !turnClosed
//   alwaysOpen         = liveProcess || hasInterleavedInput || turnProcessAlwaysOpen(node)
//   processOpen        = alwaysOpen || stored.answerStep === spec.answerStep
//   processWindowReady = spec && presentation && foldCompleted && presentation.turn === spec.turn && (turnStarted || turnClosed)
//   processMember      = !TURN_PROCESS_INDEPENDENT_KINDS.has(kind) && anchorSeq >= spec.processStartSeq
//                        && (liveProcess || spec.answerAnchorSeq === null || anchorSeq < spec.answerAnchorSeq
//                            || groupPart === 'reasoning' && kind === 'assistant-step' && data.step === spec.answerStep)
//   processAnswer      = !liveProcess && groupPart !== 'reasoning' && kind === 'assistant-step' && data.step === spec.answerStep
//   ownsDisclosure     = kind === 'turn-process' || processAnswer
//   foldable           = processWindowReady && (liveProcess || processMember || ownsDisclosure)
//   controllerInactive = kind === 'turn-process' && foldCompleted && !foldable
//   compactAnswer      = processAnswer && foldable && presentation.compactAnswer && !processOpen
//   processHidden      = controllerInactive || (foldable && processMember && !processOpen)
// 折叠 = 给 flowItem 写 hidden 属性（官方由 useSearchableHidden 响应式置位，这里声明式写）。
// ⚠ 与官方的两点已知偏差（只读历史场景等价，写在此处便于日后 diff）：
//   1. 官方每个 seat 各自订阅 nodeStore/processSource；我们按「外层快照变化 ⇒ 整体重算」读取。
//   2. 官方 grouped('chat') 的分组项（ChatGroupSeat）由 process-groups.ts 算法移植补齐。
import { createElement as h } from 'react';
import { ocOr } from '../official-classes.js';
/**
 * 官方 TURN_PROCESS_INDEPENDENT_KINDS（lib/client.js:1525）：这些 kind 永远不进过程折叠区。
 */
export const TURN_PROCESS_INDEPENDENT_KINDS = new Set([
    'system-prompt',
    'user',
    'steering',
    'turn-trigger',
    'turn-process',
    'turn-error',
    'turn-max-tokens',
    'turn-tail',
]);
/**
 * 读过程席位快照。宿主 API 形态变了也只降级成「不折叠」，不让整个弹窗白屏。
 */
export function readPresentation(store, key) {
    if (store === undefined)
        return undefined;
    try {
        const source = store.processSource;
        if (typeof source !== 'function')
            return undefined;
        return source.call(store, key)?.getSnapshot();
    }
    catch {
        return undefined;
    }
}
/** 取节点所属 turn（官方 turnOf，ChatNodeSeat.tsx:1660）。 */
export function turnOf(node) {
    const location = node?.location;
    return location?.kind === 'turn' || location?.kind === 'step' ? location.turn?.turn : undefined;
}
/** 官方 turnProcessAlwaysOpen（lib/client.js:1558）：live / 已停止 / 失败的 turn 不折叠。 */
export function turnProcessAlwaysOpen(node) {
    const location = node?.location;
    if (location?.kind !== 'turn' && location?.kind !== 'step')
        return false;
    const reason = location.turn?.end?.data?.reason?.kind;
    return location.turn?.status === 'open' || reason === 'aborted' || reason === 'error';
}
/** 一个 keyed 节点 → 一个 flowItem（官方 ChatNodeSeat 的 JSX 等价物）。 */
export function ChatNodeSeatMirror(props) {
    const { node, groupPart, store, openState, onSetOpen, foldCompleted, renderNode } = props;
    const turn = turnOf(node);
    const presentation = readPresentation(store, node.key);
    // 官方 spec 来自 presentation；弹窗读归档会话时投影可能更薄 ⇒ turn-process 自身 data 兜底。
    const spec = (presentation?.spec ?? undefined)
        ?? (node.kind === 'turn-process' ? node.data : undefined);
    const liveProcess = presentation !== undefined && presentation.turnClosed !== true;
    const interleavedInput = presentation?.hasInterleavedInput === true;
    const alwaysOpen = liveProcess || interleavedInput || turnProcessAlwaysOpen(node);
    const storedAnswerStep = turn === undefined ? undefined : openState.get(turn);
    const processOpen = alwaysOpen || (spec !== undefined && storedAnswerStep === (spec.answerStep ?? 0));
    const setOpen = (open) => {
        if (spec !== undefined && !alwaysOpen && turn !== undefined)
            onSetOpen(turn, spec.answerStep ?? 0, open);
    };
    const processWindowReady = spec !== undefined && presentation !== undefined && foldCompleted
        && presentation.turn === spec.turn
        && (presentation.turnStarted === true || presentation.turnClosed === true);
    const dataStep = typeof node.data?.step === 'number' ? node.data.step : undefined;
    const processMember = processWindowReady && spec !== undefined
        && !TURN_PROCESS_INDEPENDENT_KINDS.has(node.kind)
        && node.anchorSeq >= spec.processStartSeq
        && (liveProcess
            || spec.answerAnchorSeq === null
            || node.anchorSeq < spec.answerAnchorSeq
            || (groupPart === 'reasoning' && node.kind === 'assistant-step' && dataStep === spec.answerStep));
    const processAnswer = processWindowReady && spec !== undefined && !liveProcess
        && groupPart !== 'reasoning'
        && node.kind === 'assistant-step'
        && dataStep === spec.answerStep;
    const ownsDisclosure = node.kind === 'turn-process' || processAnswer;
    const foldable = processWindowReady && (liveProcess || processMember || ownsDisclosure);
    const turnProcess = spec === undefined ? undefined : {
        spec,
        foldable,
        hasContent: !interleavedInput && (presentation?.hasExternalProcess === true || spec.inlineReasoning),
        open: processOpen,
        alwaysOpen,
        setOpen,
    };
    const controllerInactive = node.kind === 'turn-process' && foldCompleted && !foldable;
    const compactAnswer = processAnswer && foldable && presentation?.compactAnswer === true && !processOpen;
    const processHidden = controllerInactive || (foldable && processMember && !processOpen);
    // ⚠ groupPart 必须传给节点视图：'reasoning' 只渲染思考块、'response' 只渲染回复正文
    // （官方块渲染器 lib/client.js:5824-5825）。漏传会把整步（思考+文本+工具块）全画出来——
    // 步内工具块再画一张 = 与独立工具节点重复（真机踩过，2026-09-27）。
    const inner = renderNode(node, turnProcess, groupPart);
    if (inner === null || inner === undefined)
        return null;
    const flowKey = groupPart === undefined || groupPart === 'response' ? node.key : JSON.stringify([node.key, groupPart]);
    return h('div', {
        className: ocOr('ChatView', 'flowItem', 'dshpc-sv-flowitem'),
        'data-chat-anchor-key': flowKey,
        'data-chat-flow-key': flowKey,
        'data-chat-paging-anchor': node.kind !== 'turn-process' || undefined,
        'data-chat-node-key': node.key,
        'data-chat-group-part': groupPart,
        'data-chat-flow-kind': node.kind,
        'data-chat-turn': turn,
        'data-turn-process-member': processMember || undefined,
        'data-turn-process-hidden': processHidden || undefined,
        'data-turn-process-answer': compactAnswer || undefined,
        hidden: processHidden || undefined,
    }, inner);
}
//# sourceMappingURL=ChatNodeSeat.js.map