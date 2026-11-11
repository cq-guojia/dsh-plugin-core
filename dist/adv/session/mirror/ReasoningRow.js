// 官方对照：ui-chat@0.2.1-rc.5 lib/client.js:6107-6260（reasoningText / latestCompletedParagraphFirstLine /
// ReasoningRow）+ ReasoningContent（lib/client.js:6568-6576）。
// root[data-variant=think][data-state=running|ok][data-expanded][data-preview]
//   > [running] visuallyHidden「正在思考」
//   > DisclosureRow（icon=IconThinkOutlineRegular 14px，title=t("message.think")=「思考」，running ⇒ 整行 shimmer）
//       collapsedContent = separator(data-shimmer-decoration, 2×2px) + summary[data-streaming]
//                           > summaryText > TextShimmer(summary)
//       content = thinkBody > MarkdownText(compact, streaming=running)
// 折叠态 root 固定一行高（contain:size layout + height 24px+delta）；[data-preview] 缺失 ⇒ separator/summary 隐藏。
import { Fragment, createElement as h, useMemo, useState } from 'react';
import { DisclosureRow, IconThinkOutlineRegular, MarkdownText, TextShimmer } from '../../../ui/official.js';
import { officialClass } from '../official-classes.js';
import { markdownLabels } from '../../explorer/preview/md-labels.js';
/** 官方 firstLine（lib/client.js:6140 区）：首行。 */
function firstLine(text) {
    const newline = text.indexOf('\n');
    return newline === -1 ? text : text.slice(0, newline);
}
/** 官方 reasoningText：剥掉模型签名包裹（`<signature>…</signature>`），无可见内容返回空串。 */
function reasoningText(text) {
    if (text[0] !== '<')
        return text;
    const opening = '<signature>';
    if (opening.startsWith(text))
        return '';
    if (!text.startsWith(opening))
        return text;
    const end = text.indexOf('</signature>', 11);
    if (end === -1)
        return '';
    let start = end + 12;
    while (start < text.length) {
        if (text[start] === '\n')
            start += 1;
        else if (text[start] === '\r' && text[start + 1] === '\n')
            start += 2;
        else
            break;
    }
    return text.slice(start);
}
/** 官方 latestCompletedParagraphFirstLine：最后一段已结束段落的首行（流式预览用）。 */
function latestCompletedParagraphFirstLine(text) {
    let summary = '';
    let paragraphStart = 0;
    const separator = /\r?\n(?:[\t ]*\r?\n)+/g;
    for (;;) {
        const nextParagraph = separator.exec(text);
        const paragraphEnd = nextParagraph === null ? text.length : nextParagraph.index + nextParagraph[0].indexOf('\n');
        const newline = text.indexOf('\n', paragraphStart);
        if (newline !== -1 && newline <= paragraphEnd) {
            const candidate = text.slice(paragraphStart, newline).trim();
            if (candidate !== '')
                summary = candidate;
        }
        if (nextParagraph === null)
            return summary;
        paragraphStart = nextParagraph.index + nextParagraph[0].length;
    }
}
/** 思考行：折叠 = 「思考 · 首行预览 ⌄」；展开 = thinkBody 全文（MarkdownText compact）。 */
export function ReasoningRowMirror(props) {
    const { text: rawText, running = false, preview: settledPreview = true, t } = props;
    const [open, setOpen] = useState(false);
    // 官方实测行为（用户 2026-11-11 对照官方会话）：**还在思考时正文是一直展开的**，
    // 思考结束才收成一行摘要并出现可折叠。所以展开态 = 用户展开 || 正在流式。
    const expanded = open || running;
    const text = useMemo(() => reasoningText(rawText), [rawText]);
    if (text !== rawText && text.trim() === '')
        return null;
    const summaryText = running ? latestCompletedParagraphFirstLine(text) : firstLine(text);
    // lib 目标是 ES2020（无 String.replaceAll）⇒ split/join 等价去 `**`。
    const summary = summaryText.split('**').join('');
    const preview = !expanded && summary !== '' && (running || settledPreview);
    return h('div', {
        className: officialClass('ReasoningRow', 'root') ?? '',
        'data-variant': 'think',
        'data-state': running ? 'running' : 'ok',
        'data-expanded': expanded || undefined,
        'data-preview': preview || undefined,
    }, running
        ? h('span', { className: officialClass('accessibility', 'visuallyHidden') ?? '' }, t('reasoningRunning'))
        : null, h(DisclosureRow, {
        icon: h(IconThinkOutlineRegular, { size: 14 }),
        title: t('thinkLabel'),
        running,
        open: expanded,
        expandable: true,
        expandOnRowClick: true,
        onToggle: () => { setOpen(value => !value); },
        rowClassName: officialClass('ReasoningRow', 'row') ?? '',
        leadingClassName: officialClass('ReasoningRow', 'leading') ?? '',
        titleClassName: officialClass('ReasoningRow', 'title') ?? '',
        collapsedContent: h(Fragment, null, h('span', {
            className: officialClass('ReasoningRow', 'separator') ?? '',
            'data-shimmer-decoration': true,
            'aria-hidden': true,
        }), 
        // 官方是 summary > summaryText 两层：外层 nowrap 截断、内层 text-overflow:ellipsis（省略号）。
        h('span', {
            className: officialClass('ReasoningRow', 'summary') ?? '',
            'data-streaming': running || undefined,
        }, h('span', { className: officialClass('ReasoningRow', 'summaryText') ?? '' }, h(TextShimmer, null, summary)))),
        children: expanded
            ? h('div', { className: officialClass('ReasoningRow', 'thinkBody') ?? '' }, h(MarkdownText, {
                text,
                streaming: running,
                labels: markdownLabels(),
                variant: 'compact',
            }))
            : undefined,
    }));
}
//# sourceMappingURL=ReasoningRow.js.map