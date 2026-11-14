// 官方对照：ui-chat@0.2.1-rc.5 lib/client.js:7118-7195（TurnTriggerNodeView）
//   + turn-trigger.js 的 turnTriggerDetails / TRIGGER_ICONS。
// root（section，border .5px border-l1 / radius-xl / bg turn-trigger-bg / hover turn-trigger-bg-hover）
//   > header（button，padding 12px 16px，gap 10px，aria-expanded + aria-controls）
//       > icon（14px）> title（14px）> time（margin-left:auto，xxs-12）
//       > chevron（12px；展开用 openChevron = rotate 180°）
//   > body（展开时）> explanation（8px 0）+ content > ModelFacingContent（每条文本一个
//     pre[data-context-text]，超 20000 字符截断；未知块走 JsonBlock）
// 「非人类触发的 turn」就以这一行开头——官方原图里那句「收到执行请求 9月26日 01:35」就是它。
import { createElement as h, useId, useState } from 'react';
import { IconAgentPresetOutlineRegular, IconBranchOutlineRegular, IconChevronDownOutlineRegular, IconClockOutlineRegular, IconContextInjectionOutlineRegular, IconCordisPluginOutlineRegular, IconGlobeOutlineRegular, IconGoalOutlineRegular, IconPaperPlaneOutlineRegular, IconPlayOutlineRegular, IconQueueOutlineRegular, IconUsersOutlineRegular, } from '../../../ui/official.js';
import { officialClass } from '../official-classes.js';
import { formatMessageClock } from './message-chrome.js';
/** 官方 TRIGGER_ICONS（TurnTriggerNodeView.tsx:16）；continue = 手动继续回执。 */
const TRIGGER_ICONS = {
    request: IconContextInjectionOutlineRegular,
    goal: IconGoalOutlineRegular,
    agent: IconPaperPlaneOutlineRegular,
    team: IconAgentPresetOutlineRegular,
    subagent: IconUsersOutlineRegular,
    github: IconBranchOutlineRegular,
    webhook: IconGlobeOutlineRegular,
    schedule: IconClockOutlineRegular,
    job: IconQueueOutlineRegular,
    plugin: IconCordisPluginOutlineRegular,
    continue: IconPlayOutlineRegular,
};
/** 官方 MAX_CHARS（lib/client.js:4416）：模型面向文本的显示上限。 */
const MAX_CHARS = 20000;
/**
 * 官方 turn-trigger.ts:20-32 `subagentTitle`：按 source.stopReason 六分支选标题。
 * 非字符串 / 空串回落到通用态；未收录的 reason 一律走 unknown，不暗示成功。
 */
export function subagentTitle(reason) {
    if (typeof reason !== 'string' || reason === '')
        return 'triggerSubagent';
    switch (reason) {
        case 'completed': return 'triggerSubagentCompleted';
        case 'aborted': return 'triggerSubagentAborted';
        case 'error': return 'triggerSubagentError';
        case 'max-tokens': return 'triggerSubagentMaxTokens';
        case 'refusal': return 'triggerSubagentRefusal';
        default: return 'triggerSubagentUnknown';
    }
}
/** 官方 turn-trigger.ts:35-46：source.kind → 标题 / 图标 / compact（retry 且 content 为空的继续回执）。 */
export function turnTriggerDetails(data) {
    const record = (value) => (typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {});
    const src = record(data?.source);
    const kind = typeof src.kind === 'string' ? src.kind : '';
    switch (kind) {
        case 'retry':
            return Array.isArray(data?.content) && data.content.length === 0
                ? { title: 'triggerContinuation', icon: 'continue', compact: true }
                : { title: 'triggerRequest', icon: 'request' };
        case 'goal': return { title: 'triggerGoal', icon: 'goal' };
        case 'agent-message': return { title: 'triggerAgent', icon: 'agent' };
        case 'team-message': return { title: 'triggerTeam', icon: 'team' };
        case 'subagent-settled': return { title: subagentTitle(src.stopReason), icon: 'subagent' };
        case 'webhook': {
            const github = src.provider === 'github';
            return github ? { title: 'triggerGithub', icon: 'github' } : { title: 'triggerWebhook', icon: 'webhook' };
        }
        case 'schedule': return { title: 'triggerSchedule', icon: 'schedule' };
        case 'tool-jobs': return { title: 'triggerJob', icon: 'job' };
        case 'cordis-host-runner': return { title: 'triggerPlugin', icon: 'plugin' };
        default: return { title: 'triggerRequest', icon: 'request' };
    }
}
/** 触发行：折叠时只有「图标 + 标题 + 时间 + 箭头」，点开展示注入原文。 */
export function TurnTriggerNodeViewMirror(props) {
    const { data, t } = props;
    const [open, setOpen] = useState(false);
    const bodyId = useId();
    const details = turnTriggerDetails(data);
    const TriggerIcon = TRIGGER_ICONS[details.icon] ?? IconContextInjectionOutlineRegular;
    // 官方 TurnTriggerNodeView.tsx:35-40：compact 早返回，不渲 section.root / header / time / chevron / body。
    if (details.compact === true) {
        return h('div', {
            className: officialClass('TurnTriggerNodeView', 'continuation') ?? '',
            'data-generation-continuation': true,
        }, h('span', { className: officialClass('TurnTriggerNodeView', 'icon') ?? '', 'aria-hidden': true }, h(TriggerIcon, { size: 14 })), h('span', null, t(details.title)));
    }
    const time = typeof data?.time === 'number' ? data.time : undefined;
    return h('section', {
        className: officialClass('TurnTriggerNodeView', 'root') ?? '',
        'data-turn-trigger': true,
    }, h('button', {
        type: 'button',
        className: officialClass('TurnTriggerNodeView', 'header') ?? '',
        'aria-expanded': open,
        'aria-controls': bodyId,
        onClick: () => { setOpen(value => !value); },
    }, h('span', { className: officialClass('TurnTriggerNodeView', 'icon') ?? '', 'aria-hidden': true }, h(TriggerIcon, { size: 14 })), h('span', { className: officialClass('TurnTriggerNodeView', 'title') ?? '' }, t(details.title)), time === undefined
        ? null
        : h('time', {
            className: officialClass('TurnTriggerNodeView', 'time') ?? '',
            dateTime: new Date(time).toISOString(),
        }, formatMessageClock(time, t)), h(IconChevronDownOutlineRegular, {
        size: 12,
        className: open
            ? officialClass('TurnTriggerNodeView', 'openChevron') ?? ''
            : officialClass('TurnTriggerNodeView', 'chevron') ?? '',
    })), open
        ? h('div', { id: bodyId, className: officialClass('TurnTriggerNodeView', 'body') ?? '' }, h('p', { className: officialClass('TurnTriggerNodeView', 'explanation') ?? '' }, t('triggerExplanation')), h('div', { className: officialClass('TurnTriggerNodeView', 'content') ?? '' }, modelFacingRuns(data?.content, t).map((text, index) => h('pre', {
            key: index,
            className: officialClass('ContextBody', 'text') ?? '',
            'data-context-text': true,
        }, text.length > MAX_CHARS
            ? `${text.slice(0, MAX_CHARS)}\n${t('jsonTruncated', { total: text.length })}`
            : text))))
        : null);
}
/** 官方 contentRuns：连续 text 块合并成一段（未知块不参与文本拼接）。 */
export function modelFacingRuns(content, t) {
    if (!Array.isArray(content))
        return [t('sessionEmpty')];
    const runs = [];
    for (const block of content) {
        const b = block;
        if (b === null || typeof b !== 'object' || b.type !== 'text' || typeof b.text !== 'string')
            continue;
        const last = runs.length - 1;
        if (last >= 0)
            runs[last] += b.text;
        else
            runs.push(b.text);
    }
    return runs.length === 0 ? [t('sessionEmpty')] : runs;
}
//# sourceMappingURL=TurnTriggerNodeView.js.map