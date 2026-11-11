/**
 * 从 chat 快照直接读「还没结算的 ask_user_question 调用」——投影缺席或暂时为空时的等价来源。
 * 官方 tool 卡就是这么判 pending 的（`model.state === 'running'`，ui-tool lib/client.js:2369），
 * 问题与选项都记在调用参数里，所以卡片能连选项一起画。
 * @param order - chat 快照的节点键顺序。
 * @param read - 按 key 读节点。
 * @returns 最后一组未结算的提问；没有则 null。
 */
export function pendingQuestionsFromNodes(order, read) {
    const started = new Map();
    const ended = new Set();
    for (const key of order) {
        const node = read(key);
        if (node === undefined || node.kind !== 'tool-call')
            continue;
        const root = node.data?.root;
        if (typeof root !== 'object' || root === null)
            continue;
        const call = root;
        if (typeof call.callId !== 'string' || call.callId === '')
            continue;
        if (call.phase === 'end') {
            ended.add(call.callId);
            continue;
        }
        if (call.phase !== 'start' || call.name !== 'ask_user_question' || typeof call.argsRaw !== 'string')
            continue;
        started.set(call.callId, { argsRaw: call.argsRaw });
    }
    let pending = null;
    for (const [callId, { argsRaw }] of started) {
        if (ended.has(callId))
            continue;
        const questions = questionsOf(argsRaw);
        if (questions === null)
            continue;
        pending = { callId, state: 'open', questions };
    }
    return pending;
}
/** 官方 toolArgumentsSchema 的子集：questions[].options[] 用 `multi_select` 拼法（dsh-user-questions :113-129）。 */
function questionsOf(argsRaw) {
    let parsed;
    try {
        parsed = JSON.parse(argsRaw);
    }
    catch {
        return null;
    }
    if (typeof parsed !== 'object' || parsed === null)
        return null;
    const raw = parsed.questions;
    if (!Array.isArray(raw) || raw.length === 0)
        return null;
    const items = [];
    for (const entry of raw) {
        if (typeof entry !== 'object' || entry === null)
            continue;
        const q = entry;
        if (typeof q.id !== 'string' || typeof q.question !== 'string')
            continue;
        const options = Array.isArray(q.options)
            ? q.options.flatMap((option) => {
                if (typeof option !== 'object' || option === null)
                    return [];
                const o = option;
                return typeof o.label === 'string'
                    ? [{ label: o.label, ...(typeof o.description === 'string' ? { description: o.description } : {}) }]
                    : [];
            })
            : undefined;
        items.push({
            id: q.id,
            question: q.question,
            ...(typeof q.header === 'string' ? { header: q.header } : {}),
            ...(typeof q.detail === 'string' ? { detail: q.detail } : {}),
            ...(options === undefined || options.length === 0 ? {} : { options }),
            ...(q.multi_select === true || q.multiSelect === true ? { multiSelect: true } : {}),
        });
    }
    return items.length === 0 ? null : items;
}
/**
 * 订阅该会话当前待答的一组问题（官方一次只展示一组：`ahead of any other pending question`）。
 * 能力缺席（宿主没注册该投影）返回 null ⇒ 不画题卡。
 * @param projections - `session.projections`（与 inbox 同一入口）。
 */
export function openPendingQuestions(projections) {
    const face = projections?.faceOf?.('userQuestions');
    if (face === undefined || face === null || typeof face.getSnapshot !== 'function' || typeof face.subscribe !== 'function')
        return null;
    // 投影每次 publish 都换引用；缓存映射结果，React 的 getSnapshot 才稳定。
    let raw;
    let mapped = null;
    let primed = false;
    const read = () => {
        let next;
        try {
            next = face.getSnapshot();
        }
        catch {
            return null;
        }
        if (primed && next === raw)
            return mapped;
        primed = true;
        raw = next;
        mapped = firstActive(next);
        return mapped;
    };
    return { getSnapshot: read, subscribe: (onChange) => face.subscribe(onChange) };
}
/** 形状校验后取第一条 active（官方的 active 行必须 questions 非空、callId 非空）。 */
/** 形状不符只提示一次（避免每次 publish 刷屏）。 */
let shapeWarned = false;
function firstActive(view) {
    if (typeof view !== 'object' || view === null)
        return null;
    const record = view;
    // 投影的 wire 视图是 `{ active, settled }`（dsh-user-questions lib/index.js:288-291 `wire.view = state => state.questions`）；
    // 若拿到的是未 map 的 state（`{ inheritedEventCount, timed, questions:{ active, settled } }`）也认。
    const active = Array.isArray(record.active)
        ? record.active
        : typeof record.questions === 'object' && record.questions !== null
            ? record.questions.active
            : undefined;
    if (!Array.isArray(active)) {
        if (!shapeWarned) {
            shapeWarned = true;
            console.info(`[dsh-plugin-core:session] userQuestions 快照形状未识别，键=[${Object.keys(record).join(',')}]`);
        }
        return null;
    }
    for (const row of active) {
        const parsed = questionSet(row);
        if (parsed !== null)
            return parsed;
    }
    return null;
}
/**
 * 官方 `QuestionComposer.parseRecommendedLabel`：把选项标签里的「(推荐) / (recommended)」尾缀
 * 拆出来做徽标，作答值仍用原标签。
 * @param label - 选项原始标签。
 * @returns 展示用标签 + 是否推荐。
 */
export function parseRecommendedLabel(label) {
    const suffix = /\s*(?:\((?:recommended|推荐)\)|（(?:recommended|推荐)）)\s*$/i;
    return suffix.test(label)
        ? { label: label.replace(suffix, ''), recommended: true }
        : { label, recommended: false };
}
/**
 * 官方 `recommendedOptions`：单选取「标记了推荐的第一项」，多选取全部推荐项（隐式草稿）。
 * @param question - 一道题。
 * @returns 该题默认勾选的标签。
 */
export function recommendedOptions(question) {
    const labels = (question.options ?? []).map(option => option.label);
    const candidates = question.multiSelect === true ? labels : labels.slice(0, 1);
    return candidates.filter(label => parseRecommendedLabel(label).recommended);
}
/**
 * 由活体载体推出面板的作答入参。**作答与关闭钮是两件事**：两种 `dismissal` 官方都给关闭钮，
 * 只是语义不同 —— `hide`（有 callId）= 收起面板、可从工具调用重开；`cancel`（无 callId）= 放弃整组问题。
 * 所以这里永远给 `answer`，`dismiss` 只要载体有就给，语义交给 `dismissal` 区分。
 * @param live - 活体载体；undefined = 载体缺席 ⇒ 返回空对象，面板走只读。
 */
export function questionPanelWiring(live) {
    if (live === undefined)
        return {};
    return {
        answer: async (answers) => { await live.answer({ answers }); },
        subscribeCard: live.subscribe,
        readCard: live.snapshot,
        dismissal: live.dismissal,
        // `dismiss()` 是原型方法（内部读 this.dismissal），必须经对象调用，不能直接传引用。
        ...(live.dismiss === undefined ? {} : { dismiss: () => live.dismiss?.() }),
    };
}
/**
 * 订阅某个会话此刻的题卡活体（`uiSession.sessionStatus.pendingInteraction`，kind = 'question'）。
 * 能力缺席（没有 uiSession / 宿主没装题面板外壳包）返回 null ⇒ 题卡退回只读投影渲染。
 * @param uiSession - 宿主 client 服务 `uiSession`。
 * @param sessionId - 预览中的会话 id。
 */
export function openLiveQuestion(uiSession, sessionId) {
    const status = uiSession?.sessionStatus;
    if (status === undefined || typeof status.getSnapshot !== 'function' || typeof status.subscribe !== 'function')
        return null;
    const read = () => {
        try {
            return questionFace(status.getSnapshot().get(sessionId)?.pendingInteraction);
        }
        catch {
            return undefined;
        }
    };
    return { getSnapshot: read, subscribe: (onChange) => status.subscribe(onChange) };
}
/** 只认题卡域（`kind === 'question'`）且真能作答的载体；计划审阅走自己的呈现，这里不当题卡。 */
function questionFace(value) {
    if (typeof value !== 'object' || value === null)
        return undefined;
    const record = value;
    if (record.kind !== 'question')
        return undefined;
    if (typeof record.key !== 'string' || !Array.isArray(record.questions) || record.questions.length === 0)
        return undefined;
    if (typeof record.answer !== 'function' || typeof record.snapshot !== 'function')
        return undefined;
    return value;
}
function questionSet(row) {
    if (typeof row !== 'object' || row === null)
        return null;
    const record = row;
    if (typeof record.callId !== 'string' || record.callId === '')
        return null;
    const state = record.state === 'continued' ? 'continued' : record.state === 'open' ? 'open' : undefined;
    if (state === undefined || !Array.isArray(record.questions) || record.questions.length === 0)
        return null;
    const questions = [];
    for (const item of record.questions) {
        if (typeof item !== 'object' || item === null)
            return null;
        const q = item;
        if (typeof q.id !== 'string' || typeof q.question !== 'string')
            return null;
        const options = Array.isArray(q.options)
            ? q.options.flatMap((option) => {
                if (typeof option !== 'object' || option === null)
                    return [];
                const o = option;
                return typeof o.label === 'string'
                    ? [{ label: o.label, ...(typeof o.description === 'string' ? { description: o.description } : {}) }]
                    : [];
            })
            : undefined;
        questions.push({
            id: q.id,
            question: q.question,
            ...(typeof q.header === 'string' ? { header: q.header } : {}),
            ...(typeof q.detail === 'string' ? { detail: q.detail } : {}),
            ...(options === undefined || options.length === 0 ? {} : { options }),
            ...(q.multiSelect === true ? { multiSelect: true } : {}),
        });
    }
    return { callId: record.callId, state, questions };
}
//# sourceMappingURL=pending-questions.js.map