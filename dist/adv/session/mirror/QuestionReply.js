// 官方对照（**读源码本体**，`deepseek-ai/deepseek-harness` tag `dsh-v0.2.2-rc.1`）：
// `packages/client/ui-user-questions/src/client/QuestionReplyView.tsx` + 同目录 `QuestionReplyView.module.css`。
//
// 结构（逐节点对齐）：
//   div.row[data-question-reply=callId][data-reply-outcome][role=group][aria-label=reply.label]
//     > div.bubbleWidth
//         > UserMessageBubble.bubble
//             > p.text（题面读不出来时才用 payload 原话）
//             | dl.details > div > dt.question（span.header + span 题干）+ dd.answer
//     > div.actions > span.time（HH:mm，hour12:false）+ Tooltip > button.action（复制 / 已复制）
//
// 数据 = 官方会话节点 `question-reply` / `answered-user-question` 的 `data`（官方定义已投影好，
// 见 `answeredQuestionDefinition` / `questionReplyDefinition`）；本文件只负责画，不重新解析会话事件。
// 类名运行时从 `@deepseek-ai/dsh-client-ui-user-questions/QuestionReplyView.module.css` 发现。
import { createElement as h, useEffect, useRef, useState } from 'react';
import { IconCheckOutlineRegular, IconCopyOutlineRegular, Tooltip, UserMessageBubble, writeClipboard, } from '../../../ui/official.js';
import { officialClass } from '../official-classes.js';
/** 官方「已复制」复位时间（与 MessageIconActions 一致）。 */
const COPIED_RESET_MS = 1000;
const c = (semantic) => officialClass('QuestionReplyView', semantic) ?? '';
/**
 * 官方 `replyAnswerValues`：某题的作答值 = 选中项按原顺序 + 非空自定义文本。
 * @param data - 一条 reply 节点数据。
 * @param id - 题目 id。
 * @returns 展示用的作答值，空数组表示这题被跳过。
 */
export function replyAnswerValues(data, id) {
    const answer = (data.answers ?? []).find(item => item.id === id);
    const custom = answer?.custom?.trim() ?? '';
    return [...(answer?.selected ?? []), ...(custom === '' ? [] : [custom])];
}
/**
 * 官方 `replyClipboardText`：每题「题（组标题 — 题干）+ 作答」一段，题面读不出来时退回原话。
 * @param data - 一条 reply 节点数据。
 * @param t - 翻译函数。
 * @returns 可复制的纯文本。
 */
export function replyClipboardText(data, t) {
    const questions = data.questions ?? [];
    if (questions.length === 0)
        return data.text ?? '';
    return questions.map((question) => {
        const values = replyAnswerValues(data, question.id);
        const heading = question.header !== undefined && question.header !== question.question
            ? `${question.header} — ${question.question}`
            : question.question;
        const answer = values.length === 0 ? t('replySkipped') : `${t('replyAnswerLabel')}${values.join(', ')}`;
        return `${heading}\n${answer}`;
    }).join('\n\n');
}
function clockOf(time) {
    const at = time instanceof Date ? time.getTime() : typeof time === 'number' ? time : undefined;
    if (at === undefined || !Number.isFinite(at))
        return null;
    try {
        return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }).format(at);
    }
    catch {
        return null;
    }
}
/**
 * 已作答/已跳过的一批题（官方 `QuestionReplyBubble`）：右对齐气泡，题在上、答案在下，带时间与复制。
 * @param props - 节点数据与翻译函数。
 */
export function QuestionReplyBubble(props) {
    const { data, t } = props;
    const [copied, setCopied] = useState(false);
    const timerRef = useRef(undefined);
    useEffect(() => () => { if (timerRef.current !== undefined)
        clearTimeout(timerRef.current); }, []);
    const label = copied ? t('copiedLabel') : t('copyLabel');
    const questions = data.questions ?? [];
    const clock = clockOf(data.time);
    return h('div', {
        className: c('row'),
        'data-question-reply': data.callId,
        'data-reply-outcome': data.outcome,
        role: 'group',
        'aria-label': t('replyLabel'),
    }, h('div', { className: c('bubbleWidth') }, h(UserMessageBubble, { className: c('bubble') }, questions.length === 0
        ? h('p', { className: c('text') }, data.text ?? '')
        : h('dl', { className: c('details') }, questions.map((question) => {
            const values = replyAnswerValues(data, question.id);
            const headed = question.header !== undefined && question.header !== question.question;
            return h('div', { key: question.id }, h('dt', { className: c('question') }, headed ? h('span', { className: c('header') }, question.header) : null, h('span', null, question.question)), h('dd', { className: c('answer') }, values.length === 0 ? t('replySkipped') : values.join(', ')));
        })))), h('div', { className: c('actions') }, clock === null ? null : h('span', { className: c('time') }, clock), h(Tooltip, { label, side: 'bottom' }, h('button', {
        type: 'button',
        className: c('action'),
        'aria-label': label,
        onClick: () => {
            if (copied)
                return;
            void writeClipboard(replyClipboardText(data, t)).then((ok) => {
                if (!ok)
                    return;
                setCopied(true);
                timerRef.current = setTimeout(() => { setCopied(false); }, COPIED_RESET_MS);
            });
        },
    }, copied ? h(IconCheckOutlineRegular) : h(IconCopyOutlineRegular)))));
}
//# sourceMappingURL=QuestionReply.js.map