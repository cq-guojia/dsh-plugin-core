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
function firstActive(view) {
    if (typeof view !== 'object' || view === null)
        return null;
    const active = view.active;
    if (!Array.isArray(active))
        return null;
    for (const row of active) {
        const parsed = questionSet(row);
        if (parsed !== null)
            return parsed;
    }
    return null;
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