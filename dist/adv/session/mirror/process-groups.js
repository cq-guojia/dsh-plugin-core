/** 官方 INDEPENDENT（process-groups.js:10565；注意与 ChatNodeSeat 的清单不同）。 */
const INDEPENDENT = new Set([
    'user',
    'steering',
    'turn-trigger',
    'model-retry',
    'turn-error',
    'turn-max-tokens',
    'turn-tail',
    // 题卡作答气泡（外壳包 ui-user-questions 注册的 kind）。这份清单和 ChatNodeSeat 那份是**两张表**：
    // 漏在这一张里会被 buildProcessGroups 折进过程组 ⇒ 组一收起整条就不见了（2026-11-11 就是这个坑：
    // 只补了 ChatNodeSeat 那张，用户看到的还是「什么都没有」）。
    'answered-user-question',
    'question-reply',
]);
/** 宿主默认呈现模式（ui-chat lib/client.js:14814 `DEFAULT_TRANSCRIPT_VIEW_MODE = "detailed"`）。 */
export const DEFAULT_TRANSCRIPT_VIEW_MODE = 'detailed';
/**
 * 官方 `stepGrouping` → 要不要分组（ChatGroupSeat 的 `grouped`）。
 * compact / standard = `collapsed`（恒分组）；detailed = `history`（轮次开着时不分组、条目平铺）；
 * verbose = `none`（从不分组）。
 * @param mode - 呈现模式。
 * @param live - 该组所属 turn 是否还开着。
 */
function groupedOf(mode, live) {
    if (mode === 'verbose')
        return false;
    if (mode === 'detailed')
        return !live;
    return true;
}
/** 节点所属 turn（官方 turnOf，process-groups.js:10574）。 */
function turnOfNode(node) {
    const location = node.location;
    return location?.kind === 'turn' || location?.kind === 'step' ? location.turn?.turn : undefined;
}
/** 官方 reasoning（10578）：assistant-step 带非空思考块。 */
function hasReasoning(node) {
    const blocks = node.data?.blocks;
    if (node.kind !== 'assistant-step' || !Array.isArray(blocks))
        return false;
    return blocks.some(block => block?.kind === 'reasoning' && (block.text ?? '').trim() !== '');
}
/** 官方 reply（10581）：assistant-step 带回复内容（reasoning / tool-call 不算，空文本不算）。 */
function hasReply(node) {
    const blocks = node.data?.blocks;
    if (node.kind !== 'assistant-step' || !Array.isArray(blocks))
        return false;
    return blocks.some((block) => {
        if (block === null || typeof block !== 'object')
            return false;
        if (block.kind === 'reasoning' || block.kind === 'tool-call')
            return false;
        if (block.kind === 'text')
            return (block.text ?? '').trim() !== '';
        return true;
    });
}
/** 官方 activity（10426-10449）：工具名 → 活动类别。 */
export function toolActivity(name) {
    if (name === 'read')
        return 'read';
    if (name === 'read_image')
        return 'readImage';
    if (name === 'grep' || name === 'glob' || name.endsWith('_inspect'))
        return 'search';
    if (name === 'write')
        return 'write';
    if (name === 'edit' || name === 'apply_patch')
        return 'edit';
    if (['bash', 'pwsh', 'exec_command', 'write_stdin'].includes(name) || name.startsWith('terminal_'))
        return 'commands';
    if (name === 'run_code')
        return 'code';
    if (name === 'web_search')
        return 'webSearch';
    if (name === 'web_fetch')
        return 'webFetch';
    if (name === 'subagent' || name.startsWith('subagent_'))
        return 'subagents';
    if (['todo_write', 'create_goal', 'update_goal', 'get_goal'].includes(name))
        return 'plan';
    if (name === 'ask_user_question' || name === 'request_user_input')
        return 'questions';
    return 'tools';
}
/** ToolCallBlock → 本次调用的名字面（running 半截在根上，settled 在 call 里）。 */
function toolCallFace(root) {
    const callId = typeof root.callId === 'string' ? root.callId : '';
    if (root.kind === 'tool-result') {
        const name = typeof root.call?.name === 'string' ? root.call.name : '';
        return callId === '' || name === '' ? null : { callId, name };
    }
    const name = typeof root.name === 'string' ? root.name : '';
    return callId === '' || name === '' ? null : { callId, name };
}
/** 官方 processActivity（10527-10561）：按去重调用数排序的活动类别（含子调用递归）。 */
function processActivity(nodes) {
    const counts = new Map();
    const seen = new Set();
    const visit = (tool) => {
        const face = toolCallFace(tool);
        if (face !== null && !seen.has(face.callId)) {
            seen.add(face.callId);
            const kind = toolActivity(face.name);
            counts.set(kind, (counts.get(kind) ?? 0) + 1);
        }
        for (const child of tool.subCalls ?? [])
            visit(child);
    };
    for (const node of nodes) {
        if (node.kind !== 'tool-call')
            continue;
        const root = node.data?.root;
        if (root !== undefined && root !== null)
            visit(root);
    }
    return [...counts]
        .map(([kind, count]) => ({ kind, count }))
        .sort((left, right) => right.count - left.count);
}
/**
 * 官方 TurnGroups.rebuild 的移植：把 keyed 流切成「独立条目 + 过程分组」。
 * @param order - 官方渲染顺序（node key 列表）。
 * @param readNode - keyed 节点读取。
 * @param isTurnClosed - turn 是否已闭合（官方 turns.get(turn).status === 'closed'）。
 */
export function buildProcessGroups(order, readNode, isTurnClosed, 
/** 官方 `transcriptView`（宿主默认 detailed）：决定 `stepGrouping`，即要不要分组。 */
mode = DEFAULT_TRANSCRIPT_VIEW_MODE) {
    const entries = [];
    const groups = new Map();
    let pending = [];
    let currentTurn;
    const flush = (closed) => {
        const first = pending[0];
        if (first === undefined)
            return;
        const turn = currentTurn;
        const ended = closed || (turn !== undefined && isTurnClosed(turn));
        const live = turn !== undefined && !isTurnClosed(turn);
        const members = pending;
        const nodes = members
            .map(member => readNode(member.key))
            .filter((node) => node !== undefined);
        // 官方组键 = ["process", 首成员 key, groupPart]（process-groups.js:10692-10696）。
        const groupKey = JSON.stringify(['process', first.key, first.groupPart ?? null]);
        groups.set(groupKey, {
            key: groupKey,
            members,
            data: {
                turn: turn ?? -1,
                closed: ended,
                live: live,
                // 官方 ChatGroupSeat：`grouped = stepGrouping === 'collapsed'
                //   || (stepGrouping === 'history' && turn 不是 open && !deferCollapse)`。
                // 宿主默认 collapseTiming = completion ⇒ deferCollapse 恒 false。
                grouped: groupedOf(mode, live),
                summary: { counts: processActivity(nodes) },
            },
        });
        entries.push({ kind: 'group', key: groupKey });
        pending = [];
    };
    for (const key of order) {
        const node = readNode(key);
        if (node === undefined)
            continue;
        const turn = turnOfNode(node);
        if (turn !== currentTurn) {
            flush(true);
            currentTurn = turn;
        }
        if (INDEPENDENT.has(node.kind)) {
            flush(true);
            entries.push({ kind: 'node', key });
        }
        else if (node.kind === 'turn-process') {
            entries.push({ kind: 'node', key });
        }
        else if (node.kind === 'assistant-step') {
            if (hasReasoning(node))
                pending.push({ key, groupPart: 'reasoning' });
            if (hasReply(node)) {
                flush(true);
                entries.push({ kind: 'node', key, groupPart: 'response' });
            }
        }
        else {
            pending.push({ key });
        }
    }
    // 归档只读视图：末组按 turn 状态闭合（live turn 的组官方也不封口）。
    flush(currentTurn === undefined ? true : isTurnClosed(currentTurn));
    return { entries, groups };
}
/** 官方 message.stepProcess.done.* 的键面（zh/en 文案见 utils/i18n 字典）。 */
const STEP_DONE_KEYS = {
    thinking: 'stepProcessDoneThinking',
    read: 'stepProcessDoneRead',
    readImage: 'stepProcessDoneReadImage',
    write: 'stepProcessDoneWrite',
    search: 'stepProcessDoneSearch',
    edit: 'stepProcessDoneEdit',
    commands: 'stepProcessDoneCommands',
    code: 'stepProcessDoneCode',
    webSearch: 'stepProcessDoneWebSearch',
    webFetch: 'stepProcessDoneWebFetch',
    subagents: 'stepProcessDoneSubagents',
    plan: 'stepProcessDonePlan',
    questions: 'stepProcessDoneQuestions',
    tools: 'stepProcessDoneTools',
};
/**
 * 官方 processTitle（1820-1836）：closed 组标题 = 前 3 类活动拼接
 * （2 类用「A并B」且去「已」前缀；≥3 类用「，」连接、超 3 类补「等」）。
 */
export function processTitle(summary, t) {
    const labels = summary.counts.slice(0, 3).map(({ kind }) => t(STEP_DONE_KEYS[kind]));
    const first = labels[0];
    if (first === undefined)
        return t('stepProcessDoneThinking');
    const continuation = (label) => label.charAt(0).toLowerCase() + label.slice(1);
    const second = labels[1];
    if (second === undefined)
        return first;
    if (labels.length === 2) {
        const prefix = t('stepProcessSharedPrefix');
        return t('stepProcessJoinTwo', {
            first,
            second: continuation(prefix !== '' && first.startsWith(prefix) && second.startsWith(prefix) ? second.slice(prefix.length) : second),
        });
    }
    const title = [first, ...labels.slice(1).map(continuation)].join(t('stepProcessComma'));
    return summary.counts.length > 3 ? t('stepProcessMore', { title }) : title;
}
//# sourceMappingURL=process-groups.js.map