// 官方对照：packages/client/ui-chat/src/client/chat/ReasoningRow.tsx（0.1.7-rc.2 lib/client.js:5718-5778）
// root[data-variant=think][data-state=running|ok][data-expanded][data-preview]
//   > DisclosureRow（icon=IconThinkOutlineRegular 14px，title=t("message.think")=「思考」，
//     collapsedContent = separator(2×2px) + summary（首行、去 **），content = thinkBody MarkdownText compact)
// 折叠态 root 固定一行高（contain:size layout + height 24px+delta）；预览受 settledReasoningPreview 政策控制。
// 官方截图里组内思考行 = 「思考 · Let me submit the receipt now.」——标题是「思考」，不是「思考过程」。
import { Fragment, createElement as h, useState } from 'react';
import { DisclosureRow, IconThinkOutlineRegular, MarkdownText } from '../../ui/official.js';
import { ocOr } from '../official-classes.js';
import { markdownLabels } from '../../explorer/preview/md-labels.js';
/** 官方 firstLine（lib/client.js:5687）：首行。 */
function firstLine(text) {
    const newline = text.indexOf('\n');
    return newline === -1 ? text : text.slice(0, newline);
}
/** 思考行：折叠 = 「思考 · 首行预览 ⌄」；展开 = thinkBody 全文（MarkdownText compact）。 */
export function ReasoningRowMirror(props) {
    const { text, running = false, preview = true, t } = props;
    const [open, setOpen] = useState(false);
    if (text.trim() === '')
        return null;
    // lib 目标是 ES2020（无 String.replaceAll）⇒ split/join 等价去 `**`。
    const summary = firstLine(text).split('**').join('');
    return h('div', {
        className: ocOr('ReasoningRow', 'root', 'dshpc-sv-reasoning'),
        'data-variant': 'think',
        'data-state': running ? 'running' : 'ok',
        'data-expanded': open || undefined,
        'data-preview': preview && summary !== '' || undefined,
    }, h(DisclosureRow, {
        icon: h(IconThinkOutlineRegular, { size: 14 }),
        title: t('thinkLabel'),
        open,
        expandable: true,
        expandOnRowClick: true,
        onToggle: () => { setOpen(value => !value); },
        rowClassName: ocOr('ReasoningRow', 'row', 'dshpc-sv-reasoning-row'),
        leadingClassName: ocOr('ReasoningRow', 'leading', 'dshpc-sv-reasoning-leading'),
        titleClassName: ocOr('ReasoningRow', 'title', 'dshpc-sv-reasoning-title'),
        chevronClassName: ocOr('ReasoningRow', 'chevron', 'dshpc-sv-reasoning-chevron'),
        collapsedContent: h(Fragment, null, h('span', { className: ocOr('ReasoningRow', 'separator', 'dshpc-sv-reasoning-sep'), 'aria-hidden': true }), 
        // 官方是 summary > summaryText 两层：外层 nowrap 截断、内层 text-overflow:ellipsis（省略号）。
        h('span', { className: ocOr('ReasoningRow', 'summary', 'dshpc-sv-reasoning-preview') }, h('span', { className: ocOr('ReasoningRow', 'summaryText', 'dshpc-sv-reasoning-preview-text') }, summary))),
        children: open
            ? h('div', { className: ocOr('ReasoningRow', 'thinkBody', 'dshpc-sv-reasoning-body') }, h(MarkdownText, { text, labels: markdownLabels(), variant: 'compact' }))
            : undefined,
    }));
}
//# sourceMappingURL=ReasoningRow.js.map