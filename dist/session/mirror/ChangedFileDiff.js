// 官方 ChangedFilePreview + FileDiff（@deepseek-ai/dsh-client-ui-deliverables client.js:828-1507，
// 0.2.1-rc.2 解包核实）镜像：路径头 + hunk 头（`@@ -a,b +c,d @@`）+ 行（旧行号 / 新行号 / 符号 /
// 文本，grid 四列）。状态机（loading / missing / error+重试 / binary / oversized）、
// 行号计算、hunk 头、note（新建 / 删除 / 无变化）逐值照抄官方。
//
// 数据面：`api/changes.diff`（与 changes.summary 同一个宿主服务，client.js:15/103-110）。
// 承载：官方 HoverCard 的 preview 卡（client.js:1402-1435）—— content 只在 open 时挂载，
// 故每行不会预先发请求（primitives lib/index.js 已核实：card = open && pos !== null && …）。
//
// 高亮：官方 `useCodeHighlighter`（primitive hook）+ 官方 highlightedSide 映射口径
// （按一侧收集文本 → 整段高亮 → 按行号回表）；语法未知 / 语法树未加载返回 undefined ⇒ 纯文本回落。
import { createElement as h, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, languageForPath, useCodeHighlighter } from '../../ui/official.js';
import { DIFF_MAX_RENDERED_LINES, changesDiffUrl, diffNoteKey, hunkHeader, hunkRows, parseChangesDiff, } from '../changes.js';
/** 会话级缓存：同一 (sessionId, seq, index) 只拉一次（官方 ChangesDiffStore 同语义）。 */
const cache = new Map();
/** 官方 highlightedSide：一侧收集 → 整段高亮 → 按行号回表。 */
function highlightedSide(rows, side, highlighter) {
    const source = rows.flatMap((row) => (row[side] === undefined ? [] : [{ no: row[side], text: row.text }]));
    if (source.length === 0)
        return new Map();
    const highlighted = highlighter(source.map((line) => line.text).join('\n'));
    if (highlighted === undefined)
        return undefined;
    return new Map(source.map((line, index) => [line.no, highlighted[index] ?? []]));
}
/** 官方 DiffText：有高亮 spans 就逐段上色，否则纯文本。 */
function DiffText(props) {
    const { text, spans } = props;
    return h('span', { className: 'dshpc-sv-diff-text', 'data-diff-code': spans === undefined ? undefined : '' }, spans === undefined
        ? text
        : spans.map((span, index) => h('span', { key: index, style: span.style }, span.text)));
}
/** 官方 FileDiff 的行：grid 四列（旧号 / 新号 / 符号 / 文本）。 */
function DiffLine(props) {
    const { row } = props;
    const kindClass = row.kind === 'add' ? 'dshpc-sv-diff-add' : row.kind === 'del' ? 'dshpc-sv-diff-del' : 'dshpc-sv-diff-context';
    const spans = row.kind === 'del' ? props.oldSpans : props.newSpans;
    return h('div', { className: `dshpc-sv-diff-line ${kindClass}`, 'data-diff-line': row.kind }, h('span', { className: 'dshpc-sv-diff-number' }, row.old ?? ''), h('span', { className: 'dshpc-sv-diff-number' }, row.new ?? ''), h('span', { className: 'dshpc-sv-diff-sign' }, row.kind === 'add' ? '+' : row.kind === 'del' ? '-' : ' '), h(DiffText, { text: row.text, spans }));
}
/** 一个变更文件的 diff 体（状态机 + unified 行渲染）。 */
export function ChangedFileDiff(props) {
    const { sessionId, seq, index, display, t } = props;
    const url = changesDiffUrl(sessionId, seq, index);
    const [state, setState] = useState(undefined);
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        if (cache.has(url)) {
            setState(cache.get(url));
            return;
        }
        let alive = true;
        void (async () => {
            let next = null;
            try {
                const res = await fetch(url);
                // 官方口径（client.js:227）：404 = missing（这轮的改动内容已不可用），其余非 2xx = error。
                if (res.ok)
                    next = parseChangesDiff(await res.json());
                else if (res.status !== 404) {
                    if (alive)
                        setState('error');
                    return;
                }
            }
            catch {
                // 路由缺席 / 网络失败 = 明确报「无法读取」，并给官方同款重试钮，不猜内容
                if (alive)
                    setState('error');
                return;
            }
            cache.set(url, next);
            if (alive)
                setState(next);
        })();
        return () => { alive = false; };
    }, [url, attempt]);
    const retry = useCallback(() => { setAttempt((value) => value + 1); }, []);
    const path = state === undefined || state === 'error' || state === null ? undefined : state.path;
    const highlighter = useCodeHighlighter(path === undefined ? undefined : languageForPath(path));
    const body = useMemo(() => {
        if (state === undefined)
            return h('p', { className: 'dshpc-sv-diff-status', role: 'status' }, t('diffLoading'));
        if (state === 'error') {
            // 官方 error 态 = 文案 + 官方 sm 按钮重试（client.js:837-845）。
            return h('div', { className: 'dshpc-sv-diff-status' }, h('span', null, t('diffError')), h(Button, { size: 'sm', onClick: retry }, t('errorRetry')));
        }
        if (state === null)
            return h('p', { className: 'dshpc-sv-diff-status' }, t('diffMissing'));
        if (state.kind === 'binary')
            return h('p', { className: 'dshpc-sv-diff-status' }, t('diffBinary'));
        if (state.kind === 'oversized')
            return h('p', { className: 'dshpc-sv-diff-status' }, t('diffOversized'));
        const note = diffNoteKey(state);
        const hunks = state.hunks ?? [];
        // 官方 renderedHunks：行数预算耗尽即停（防巨型对比把预览卡死）。
        let budget = DIFF_MAX_RENDERED_LINES;
        const kept = [];
        let truncated = false;
        for (const hunk of hunks) {
            if (budget <= 0) {
                truncated = true;
                break;
            }
            if (hunk.lines.length > budget) {
                kept.push({ ...hunk, lines: hunk.lines.slice(0, budget) });
                budget = 0;
                truncated = true;
                break;
            }
            kept.push(hunk);
            budget -= hunk.lines.length;
        }
        return h('div', { className: 'dshpc-sv-diff-body', 'data-review-view': 'unified' }, note === undefined ? null : h('p', {
            className: 'dshpc-sv-diff-note',
            'data-diff-note': hunks.length === 0 ? 'empty' : 'metadata',
        }, t(note)), state.coarse === true
            ? h('p', { className: 'dshpc-sv-diff-note', 'data-diff-coarse': true }, t('diffCoarse'))
            : null, truncated
            ? h('p', { className: 'dshpc-sv-diff-note', 'data-diff-truncated': true }, t('diffTruncated', { count: String(DIFF_MAX_RENDERED_LINES) }))
            : null, kept.map((hunk, position) => {
            const rows = hunkRows(hunk);
            const oldSpans = highlightedSide(rows, 'old', highlighter);
            const newSpans = highlightedSide(rows, 'new', highlighter);
            return h('section', { key: position, className: 'dshpc-sv-diff-hunk' }, h('div', { className: 'dshpc-sv-diff-hunkheader', 'data-diff-hunk-header': true }, hunkHeader(hunk)), rows.map((row, at) => h(DiffLine, {
                key: at,
                row,
                oldSpans: oldSpans?.get(row.old ?? -1),
                newSpans: newSpans?.get(row.new ?? -1),
            })));
        }));
    }, [state, highlighter, t, retry]);
    // 官方：FileDiff.root + ChangedFiles.preview（后者限高并在预览里隐掉 note / hunk 头）。
    return h('div', { className: 'dshpc-sv-diff dshpc-sv-changes-preview', 'data-changes-hover-preview': true }, h('div', { className: 'dshpc-sv-diff-header' }, h('span', { className: 'dshpc-sv-changes-previewpath', 'data-changes-preview-path': true }, display)), body);
}
//# sourceMappingURL=ChangedFileDiff.js.map