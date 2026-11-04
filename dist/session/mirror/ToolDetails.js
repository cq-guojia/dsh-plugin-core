// 官方对照：ui-tool `components/ToolDetails`（lib/client.js:1357-1492）
//   + `models/details-card-model`（:2988-3010、:3805-3821、:3854-3977、:3985-4029）。
//
// 本轮只移植「目标 / 定时任务」两族的模型（官方 `controlDetails` / `inspectionDetails`
// 那 400+ 行仍落回 ioCard）；视图保留这两族真正会用到的字段。
// shortcut: control/inspection 系工具无专属详情，等宿主真机有样本再按同一模型接口补。
import { createElement as h } from 'react';
import { CodeBlock, IconCheckOutlineRegular, IconChevronRightOutlineRegular, IconPlayOutlineRegular, MarkdownText, } from '../../ui/official.js';
import { officialClass } from '../official-classes.js';
import { markdownLabels } from '../../explorer/preview/md-labels.js';
import { getLocale } from '../../utils/i18n.js';
import { controlDetails, inspectionDetails } from './control-details.js';
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const nonempty = (value) => typeof value === 'string' && value.trim() !== '';
const count = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
function detailJson(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return undefined;
    }
}
/** 官方 formatDate（3808-3821）：本地化绝对时间，格式化失败退回原始 ISO 串。 */
function formatDate(date, fallback) {
    try {
        return new Intl.DateTimeFormat(getLocale(), {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short',
        }).format(date);
    }
    catch {
        return fallback;
    }
}
/** 官方 goalDetail（3854-3883）：形状不全一律返回 null ⇒ 落回 ioCard，不半渲染。 */
function goalDetail(value, t) {
    if (!isRecord(value))
        return null;
    if (value.goal === null)
        return { items: [], empty: t('detailGoalEmpty') };
    const goal = value.goal;
    if (!isRecord(goal) || !nonempty(goal.id) || !nonempty(goal.objective))
        return null;
    if (!count(goal.revision) || !count(goal.roundsStarted) || !count(goal.maxGoalRounds))
        return null;
    const phase = goal.phase;
    if (phase !== 'active' && phase !== 'paused' && phase !== 'blocked' && phase !== 'complete')
        return null;
    if (value.activation !== 'armed' && value.activation !== 'disarmed')
        return null;
    const phases = {
        active: () => t('detailGoalActive'),
        paused: () => t('detailGoalPaused'),
        blocked: () => t('detailGoalBlocked'),
        complete: () => t('detailGoalComplete'),
    };
    const fields = [
        {
            label: t('detailState'),
            value: phase === 'active' && value.activation === 'disarmed' ? t('detailGoalDisarmed') : phases[phase](),
        },
        { label: t('detailGoalRounds'), value: `${goal.roundsStarted} / ${goal.maxGoalRounds}` },
    ];
    if (goal.blockedReason !== undefined) {
        const reason = goal.blockedReason;
        if (!isRecord(reason) || !nonempty(reason.code) || !nonempty(reason.message))
            return null;
        fields.push({ label: t('detailGoalReason'), value: reason.message });
    }
    return { items: [{ title: goal.objective, fields }] };
}
const WEEKDAY_KEYS = [
    'detailWeekday1', 'detailWeekday2', 'detailWeekday3', 'detailWeekday4',
    'detailWeekday5', 'detailWeekday6', 'detailWeekday7',
];
/** 官方 interval（3894-3899）。 */
function interval(seconds, t) {
    if (seconds % 86400 === 0)
        return t('detailDays', { count: seconds / 86400 });
    if (seconds % 3600 === 0)
        return t('detailHours', { count: seconds / 3600 });
    if (seconds % 60 === 0)
        return t('detailMinutes', { count: seconds / 60 });
    return t('detailSeconds', { count: seconds });
}
const shortTime = (time) => time.replace(/:00\.000$/, '').replace(/\.000$/, '');
function weekdayText(days, t) {
    if (!Array.isArray(days) || days.length === 0)
        return undefined;
    const labels = [];
    for (const day of days) {
        if (typeof day !== 'number' || !Number.isInteger(day))
            return undefined;
        const key = WEEKDAY_KEYS[day - 1];
        if (key === undefined)
            return undefined;
        labels.push(t(key));
    }
    return labels.join(t('detailWeekdayJoin'));
}
/** 官方 scheduleItem（3916-3977）：只认形状齐全、时间可解析的记录。 */
function scheduleItem(value, t) {
    if (!isRecord(value) || !nonempty(value.id) || !nonempty(value.prompt))
        return null;
    if (typeof value.scheduledAt !== 'string')
        return null;
    if (value.deliveryMode !== 'host' && value.deliveryMode !== 'session-local')
        return null;
    if (value.state !== 'scheduled' && value.state !== 'overdue')
        return null;
    const date = new Date(value.scheduledAt);
    if (!Number.isFinite(date.getTime()) || date.toISOString() !== value.scheduledAt)
        return null;
    let frequency;
    switch (value.kind) {
        case 'at':
            frequency = t('detailScheduleOnce');
            break;
        case 'after':
            if (!count(value.afterSeconds) || value.afterSeconds === 0)
                return null;
            frequency = t('detailScheduleOnce');
            break;
        case 'every':
            if (!count(value.everySeconds) || value.everySeconds === 0)
                return null;
            frequency = t('detailScheduleEvery', { interval: interval(value.everySeconds, t) });
            break;
        case 'daily':
            if (!nonempty(value.time) || !nonempty(value.timeZone))
                return null;
            frequency = t('detailScheduleDaily', { time: shortTime(value.time), zone: value.timeZone });
            break;
        case 'weekly': {
            const days = weekdayText(value.weekdays, t);
            if (!nonempty(value.time) || !nonempty(value.timeZone) || days === undefined)
                return null;
            frequency = t('detailScheduleWeekly', { days, time: shortTime(value.time), zone: value.timeZone });
            break;
        }
        case 'cron':
            if (!nonempty(value.expression) || !nonempty(value.timeZone))
                return null;
            frequency = t('detailScheduleCron', { expression: value.expression, zone: value.timeZone });
            break;
        default:
            return null;
    }
    return {
        title: nonempty(value.title) ? value.title : value.prompt,
        fields: [
            { label: t('detailScheduleWhen'), value: formatDate(date, value.scheduledAt) },
            { label: t('detailScheduleFrequency'), value: frequency },
            { label: t('detailState'), value: value.state === 'scheduled' ? t('detailScheduleScheduled') : t('detailScheduleOverdue') },
        ],
    };
}
/**
 * 官方 detailsCardModel（3985-4029）的「目标 / 定时任务」子集。
 * 结算成功且结果为合法 JSON 才出详情卡；其余一律 null ⇒ 调用方走 ioCard 兜底。
 */
export function detailsCardModel(name, argsRaw, output, settled, isError, t) {
    if (!settled || isError || output === '')
        return null;
    const args = detailJson(argsRaw);
    if (!isRecord(args))
        return null;
    const value = detailJson(output);
    // 官方顺序（3992）：control → inspection → goal/schedule；前两者吃文本格式，JSON 解析失败也可能出卡。
    const recorded = controlDetails(name, args, output, value, t) ?? inspectionDetails(name, args, output, value, t);
    if (recorded !== null)
        return recorded;
    if (value === undefined)
        return null;
    switch (name) {
        case 'create_goal':
        case 'get_goal':
        case 'update_goal':
            return goalDetail(value, t);
        case 'schedule_create':
        case 'schedule_update': {
            const item = scheduleItem(value, t);
            return item === null ? null : { items: [item] };
        }
        case 'schedule_list': {
            if (!Array.isArray(value))
                return null;
            const items = [];
            for (const entry of value) {
                const item = scheduleItem(entry, t);
                if (item === null)
                    return null;
                items.push(item);
            }
            return { items, summary: t('detailScheduleCount', { count: items.length }), empty: t('detailScheduleEmpty') };
        }
        case 'schedule_delete':
            if (!isRecord(value) || !nonempty(value.id) || value.deleted !== true)
                return null;
            return { items: [{ title: value.id, fields: [{ label: t('detailState'), value: t('detailScheduleDeleted') }] }] };
        default:
            return null;
    }
}
/** 官方 DetailsRow 的摘要优先级（4080）：summary → 第一项 title → empty → 原摘要。 */
export function detailsSummary(model) {
    return model.summary ?? model.items[0]?.title ?? model.empty;
}
/** 官方 DetailItem（1357-1449）本轮用到的字段；markdown/code/groups 由后续模型补齐。 */
function DetailItem({ item, t, onOpenFile }) {
    const cls = (semantic) => officialClass('ToolDetails', semantic) ?? '';
    const status = item.status;
    return h('li', { className: cls('item'), 'data-change': item.change?.value }, item.title !== undefined
        ? h('div', { className: cls('heading') }, status !== undefined
            ? h('span', { className: cls('status'), role: 'img', 'aria-label': item.change?.label ?? status.label }, item.change?.value === 'added' ? '+' : item.change?.value === 'removed' ? '−'
                : status.value === 'completed' ? h(IconCheckOutlineRegular, { size: 14 })
                    : status.value === 'in_progress' ? h(IconPlayOutlineRegular, { size: 14 })
                        : h('span', { className: cls('pending') }))
            : null, item.location !== undefined && onOpenFile !== undefined
            ? h('button', {
                className: cls('path'), type: 'button',
                onClick: () => {
                    const location = item.location;
                    if (location !== undefined) {
                        if (location.line === undefined)
                            onOpenFile(location.path);
                        else
                            onOpenFile(location.path, { line: location.line });
                    }
                },
            }, item.title)
            : h('span', { className: cls('text') }, item.title), item.badge !== undefined
            ? h('span', { className: cls('badge'), 'data-tone': item.badge.tone }, item.badge.label)
            : null, status !== undefined
            ? h('span', { className: cls('statusText') }, item.previousStatus !== undefined
                ? h('span', null, h('span', { className: cls('previous') }, item.previousStatus), h('span', null, ' → '))
                : null, h('span', null, status.label), item.change?.value === 'updated' && item.previousStatus === undefined
                ? h('span', null, ' · ', item.change.label)
                : null)
            : null)
        : null, item.subtitle !== undefined ? h('div', { className: cls('subtitle') }, item.subtitle) : null, item.description !== undefined ? h('p', { className: cls('description') }, item.description) : null, item.fields.length > 0
        ? h('dl', { className: cls('fields') }, item.fields.map(field => h('div', { key: field.label, className: cls('field') }, h('dt', null, field.label), h('dd', null, field.value))))
        : null, item.lines !== undefined
        ? h('ul', { className: cls('lines') }, item.lines.map((line, index) => h('li', { key: index }, line)))
        : null, item.markdown !== undefined
        ? h('div', { className: cls('prose') }, h(MarkdownText, { text: item.markdown, labels: markdownLabels() }))
        : null, item.code !== undefined
        ? h(CodeBlock, {
            code: item.code.text,
            lang: item.code.language,
            toolbarLabels: { codeLabel: t('codeBlockLabel'), wrapLabel: t('diffWrapLabel'), unwrapLabel: t('diffUnwrapLabel') },
            copyLabel: t('copyLabel'),
            copiedLabel: t('copiedLabel'),
            className: cls('code'),
        })
        : null, ...(item.groups ?? []).map((group, index) => h('details', { key: index, className: cls('group') }, h('summary', null, h(IconChevronRightOutlineRegular), h('span', null, group.label)), h('ul', { className: cls('list') }, group.items.map((child, childIndex) => h(DetailItem, { key: childIndex, item: child, t, onOpenFile }))))));
}
/** 官方 ToolDetails（1458-1492）：caption + 空态 / 列表 + 可折叠的「未变更」组。 */
export function ToolDetailsView({ model, t, onOpenFile }) {
    const cls = (semantic) => officialClass('ToolDetails', semantic) ?? '';
    return h('div', { className: cls('root'), 'data-caption': model.caption !== undefined || undefined }, model.caption !== undefined ? h('div', { className: cls('caption') }, model.caption) : null, model.items.length === 0
        ? h('p', { className: cls('empty') }, model.empty)
        : h('ul', { className: cls('list') }, model.items.map((item, index) => h(DetailItem, { key: index, item, t, onOpenFile }))), model.unchanged !== undefined
        ? h('details', { className: cls('unchanged') }, h('summary', null, h(IconChevronRightOutlineRegular), model.unchanged.label), h('ul', { className: cls('list') }, model.unchanged.items.map((item, index) => h(DetailItem, { key: index, item, t, onOpenFile }))))
        : null);
}
//# sourceMappingURL=ToolDetails.js.map