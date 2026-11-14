// 官方对照（**读源码本体**，`deepseek-ai/deepseek-harness` tag `dsh-v0.2.2-rc.1`）：
// `packages/client/ui-user-questions/src/client/QuestionComposer.tsx`（宿主外壳包，未发 npm）
// + 同目录 `QuestionComposer.module.css`。
//
// 结构（逐节点对齐）：
//   div.frame[data-question-key]
//     > section.card[.cardMinimized]
//         > header.header
//             > div.headingBlock > div.eyebrow[题组标题] + [minimized] h2.title
//             > div.headerActions > span.waitStatus[倒计时/继续态] + 收起钮 + 关闭钮（iconButton）
//         > div.body[data-question-scroll]
//             > div.questionTitle[data-expanded] > h2.title.titlePreview + 展开钮（copyToggle questionToggle）
//             > div.detail > MarkdownText（有 detail 才画）
//             > div.options[role=radiogroup|group]
//                 > div.optionRow[data-option-row][data-expanded][.optionSelected]
//                     > button.option[role=radio|checkbox] > span.number|span.checkbox + span.optionCopy
//                         > span.optionLine[data-option-line] > span.optionLabel + span.badge[推荐]
//                         > span.description[data-option-description]
//                     > 描述展开钮（copyToggle descriptionToggle）
//                 > div.customRow[.customRowActive] > 复选框/编辑号 + div.field > textarea.fieldInput
//         > footer.footer > div.pager（上一题 / 1 / N / 下一题）+ div.feedback + div.footerActions（跳过 / 下一题|提交）
//
// 弹窗不走官方槽位（`conversation.composer` 只能由槽宿主渲染），故按官方 DOM / 类名 1:1 直画：
// 类名运行时从宿主注入的 `@deepseek-ai/dsh-client-ui-user-questions/QuestionComposer.module.css`
// 里发现（official-classes.ts），样式零自绘；作答走载体自己的 `answer()`（官方题面板同一条路）。
// shortcut: 未移植官方「慢慢回答」(takeTime) 与焦点保持（holdFocus / releaseFocus）——都需要载体上
//   与 composer 座位绑定的行为，弹窗里没有那个座位；倒计时按载体快照显示现状。
import { createElement as h, useEffect, useMemo, useReducer, useState } from 'react';
import { Button, IconCheckOutlineRegular, IconChevronDownOutlineRegular, IconChevronLeftOutlineRegular, IconChevronRightOutlineRegular, IconChevronUpOutlineRegular, IconCloseOutlineRegular, IconEditOutlineRegular, MarkdownText, } from '../../../ui/official.js';
import { officialClass } from '../official-classes.js';
import { markdownLabels } from '../../explorer/preview/md-labels.js';
import { parseRecommendedLabel, recommendedOptions, } from '../pending-questions.js';
const cls = (...names) => names.filter((name) => typeof name === 'string' && name !== '').join(' ');
/** 取一个官方题面板类名；官方样式未注入时留空（不写死哈希，也不自绘顶替）。 */
const c = (semantic) => officialClass('QuestionComposer', semantic) ?? '';
/** 官方 QuestionComposer.tsx:637-642：单选已选中某项 ⇒ 抑制自定义输入行的 focus-within 高亮。 */
export function customRowYielded(multiSelect, selectedCount) {
    return multiSelect !== true && selectedCount > 0;
}
const EMPTY_COPIES = new Set();
/**
 * 待答题目面板（官方 QuestionComposer 的 1:1 复刻）。
 * @param props - 题目批次、载体态与作答通道。
 */
export function QuestionPanel(props) {
    const { panelKey, questions, answer, dismiss, dismissal = 'hide', subscribeCard, t } = props;
    const [index, setIndex] = useState(0);
    const [drafts, setDrafts] = useState(() => questions.map((question) => {
        const recommended = recommendedOptions(question);
        return { selected: recommended, custom: '', skipped: false };
    }));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [minimized, setMinimized] = useState(false);
    const [expanded, setExpanded] = useState({ index: 0, copies: new Set() });
    // 载体态自己会变（倒计时每秒一次、open→continued）：订阅后整块重渲染，态现读不走 props 快照。
    const [, force] = useReducer((n) => n + 1, 0);
    useEffect(() => {
        if (subscribeCard === undefined)
            return undefined;
        return subscribeCard(() => { force(); });
    }, [subscribeCard]);
    const card = props.readCard?.() ?? props.card;
    const interactive = answer !== undefined;
    const state = card?.state ?? 'open';
    const current = questions[Math.min(index, questions.length - 1)];
    const draft = drafts[Math.min(index, drafts.length - 1)];
    const hasOptions = (current.options?.length ?? 0) > 0;
    const copies = expanded.index === index ? expanded.copies : EMPTY_COPIES;
    const labelOf = useMemo(() => ({
        expand: t('askPanelExpand'),
        collapse: t('askPanelCollapse'),
        prev: t('askPanelPrev'),
        next: t('askPanelNext'),
        minimize: t('askPanelMinimize'),
        maximize: t('askPanelMaximize'),
        hide: t(dismissal === 'hide' ? 'askPanelClose' : 'askPanelCancel'),
    }), [t, dismissal]);
    const toggleCopy = (copy) => {
        const next = new Set(copies);
        if (!next.delete(copy))
            next.add(copy);
        setExpanded({ index, copies: next });
    };
    const updateDraft = (update, nextIndex = index) => {
        setDrafts(previous => previous.map((item, at) => at === index ? update(item) : item));
        if (nextIndex !== index) {
            setIndex(nextIndex);
            setExpanded({ index: nextIndex, copies: EMPTY_COPIES });
        }
        setError(null);
    };
    const choose = (label) => {
        updateDraft((value) => {
            if (current.multiSelect === true) {
                const selected = value.selected.includes(label)
                    ? value.selected.filter(item => item !== label)
                    : [...value.selected, label];
                return { ...value, selected, skipped: false };
            }
            return { selected: [label], custom: '', skipped: false };
        }, current.multiSelect !== true && index < questions.length - 1 ? index + 1 : index);
    };
    const answers = (values) => questions.map((question, at) => {
        const value = values[at];
        if (value.skipped)
            return { id: question.id, selected: [] };
        const custom = value.custom.trim();
        return {
            id: question.id,
            selected: custom === '' || question.multiSelect === true ? value.selected : [],
            ...(custom === '' ? {} : { custom }),
        };
    });
    const submit = (values) => {
        const missing = values.findIndex(value => value.selected.length === 0 && value.custom.trim() === '' && !value.skipped);
        if (missing >= 0) {
            setIndex(missing);
            setExpanded({ index: missing, copies: EMPTY_COPIES });
            setError({ key: 'incomplete' });
            return;
        }
        if (answer === undefined)
            return;
        setBusy(true);
        setError(null);
        void answer(answers(values)).catch((cause) => {
            setBusy(false);
            setError({ text: cause instanceof Error ? cause.message : String(cause) });
        });
    };
    const answered = (value) => value.selected.length > 0 || value.custom.trim() !== '';
    const continueFlow = () => {
        if (!answered(draft)) {
            setError({ key: 'unanswered' });
            return;
        }
        if (index < questions.length - 1) {
            setIndex(index + 1);
            setExpanded({ index: index + 1, copies: EMPTY_COPIES });
            setError(null);
            return;
        }
        submit(drafts);
    };
    const skipQuestion = () => {
        const next = drafts.map((value, at) => at === index ? { selected: [], custom: '', skipped: true } : value);
        setDrafts(next);
        setError(null);
        if (index < questions.length - 1) {
            setIndex(index + 1);
            setExpanded({ index: index + 1, copies: EMPTY_COPIES });
            return;
        }
        submit(next);
    };
    // 官方 `dismissFlow`：`hide` 型直接离座（不发任何东西）；`cancel` 型是「放弃整组问题」，
    // 官方要求当前得有活通道（`card.channel !== 'none'`）才允许，否则只报 unavailable。
    const dismissFlow = () => {
        if (dismiss === undefined)
            return;
        if (dismissal === 'hide') {
            void dismiss();
            return;
        }
        if ((card?.channel ?? 'none') === 'none') {
            setError({ key: 'unavailable' });
            return;
        }
        setBusy(true);
        setError(null);
        const outcome = dismiss();
        if (outcome !== undefined && typeof outcome.catch === 'function') {
            outcome.catch((cause) => {
                setBusy(false);
                setError({ text: cause instanceof Error ? cause.message : String(cause) });
            });
        }
    };
    const customField = (variant) => h('div', {
        className: cls(c('field'), variant === 'inline' ? c('customInline') : c('customBlock')),
    }, h('div', { 'aria-hidden': true, className: c('fieldMirror') }, `${draft.custom}\n`), h('textarea', {
        className: c('fieldInput'),
        value: draft.custom,
        rows: 1,
        disabled: !interactive || busy,
        placeholder: t('askPanelCustomPlaceholder'),
        onChange: (event) => {
            const value = event.target.value;
            // 单选：填了自定义文本即视为没选选项；多选：勾选保留，自定义是附加说明。
            updateDraft(draftValue => ({
                ...draftValue,
                selected: current.multiSelect === true ? draftValue.selected : [],
                custom: value,
                skipped: false,
            }));
        },
        onKeyDown: (event) => {
            if (event.key !== 'Enter' || event.shiftKey)
                return;
            event.preventDefault();
            continueFlow();
        },
    }));
    const countdown = card?.countdown;
    const feedback = error === null
        ? null
        : 'key' in error
            ? t(error.key === 'incomplete' ? 'askPanelErrorIncomplete' : error.key === 'unanswered' ? 'askPanelErrorUnanswered' : 'askPanelErrorUnavailable')
            : error.text;
    return h('div', { className: c('frame'), 'data-question-key': panelKey }, h('section', { className: cls(c('card'), minimized && c('cardMinimized')) }, h('header', { className: c('header') }, current.header === undefined && !minimized
        ? null
        : h('div', { className: c('headingBlock') }, current.header === undefined ? null : h('div', { className: c('eyebrow') }, current.header), minimized ? h('h2', { className: c('title') }, current.question) : null), h('div', { className: c('headerActions') }, state === 'continued'
        ? h('span', { className: c('waitStatus') }, t('askPanelContinued'))
        : countdown === undefined
            ? null
            : h('span', { className: c('waitStatus') }, countdown.running
                ? t('askPanelCountdown', { seconds: Math.ceil(countdown.remainingMs / 1000) })
                : t('askPanelWaitPaused', { seconds: Math.ceil(countdown.remainingMs / 1000) })), h('button', {
        type: 'button',
        className: c('iconButton'),
        'aria-label': minimized ? labelOf.maximize : labelOf.minimize,
        title: minimized ? labelOf.maximize : labelOf.minimize,
        'aria-expanded': !minimized,
        disabled: busy,
        onClick: () => { setMinimized(value => !value); },
    }, minimized ? h(IconChevronUpOutlineRegular) : h(IconChevronDownOutlineRegular)), dismiss === undefined
        ? null
        : h('button', {
            type: 'button',
            className: c('iconButton'),
            'aria-label': labelOf.hide,
            title: labelOf.hide,
            disabled: busy,
            onClick: dismissFlow,
        }, h(IconCloseOutlineRegular)))), minimized
        ? null
        : h('div', { className: c('body'), 'data-question-scroll': '' }, h('div', { className: cls(c('questionTitle')), ...(copies.has('question') ? { 'data-expanded': '' } : {}) }, h('h2', { className: cls(c('title'), c('titlePreview')) }, current.question), h('button', {
            type: 'button',
            className: cls(c('iconButton'), c('copyToggle'), c('questionToggle')),
            'aria-label': copies.has('question') ? labelOf.collapse : labelOf.expand,
            'aria-expanded': copies.has('question'),
            onClick: () => { toggleCopy('question'); },
        }, copies.has('question') ? h(IconChevronUpOutlineRegular) : h(IconChevronDownOutlineRegular))), current.detail === undefined
            ? null
            : h('div', { className: c('detail') }, h(MarkdownText, { text: current.detail, labels: markdownLabels() })), h('div', {
            className: c('options'),
            role: current.multiSelect === true ? 'group' : 'radiogroup',
        }, (current.options ?? []).map((option, optionIndex) => {
            const selected = draft.selected.includes(option.label);
            const display = parseRecommendedLabel(option.label);
            const description = option.description !== undefined && option.description.trim() !== ''
                ? option.description
                : undefined;
            const key = `${String(optionIndex)}`;
            const isExpanded = copies.has(key);
            return h('div', {
                key: `${option.label}-${key}`,
                className: cls(c('optionRow'), !interactive || busy ? false : c('optionRowInteractive'), selected && current.multiSelect !== true ? c('optionSelected') : false),
                'data-option-row': '',
                ...(isExpanded ? { 'data-expanded': '' } : {}),
            }, h('button', {
                type: 'button',
                className: c('option'),
                role: current.multiSelect === true ? 'checkbox' : 'radio',
                'aria-checked': selected,
                'aria-label': display.label,
                disabled: !interactive || busy,
                onClick: () => { choose(option.label); },
            }, current.multiSelect === true
                ? h('span', {
                    className: cls(c('checkbox'), selected && c('checkboxChecked')),
                    'aria-hidden': true,
                }, selected ? h(IconCheckOutlineRegular, { size: 12 }) : null)
                : h('span', { className: c('number') }, optionIndex + 1), h('span', { className: c('optionCopy') }, h('span', { className: c('optionLine'), 'data-option-line': '' }, h('span', { className: c('optionLabel') }, display.label), display.recommended
                ? h('span', { className: c('badge') }, t('askPanelRecommended'))
                : null), description === undefined
                ? null
                : h('span', { className: c('description'), 'data-option-description': '' }, description))), description === undefined
                ? null
                : h('button', {
                    type: 'button',
                    className: cls(c('iconButton'), c('copyToggle'), c('descriptionToggle')),
                    'aria-label': isExpanded ? labelOf.collapse : labelOf.expand,
                    'aria-expanded': isExpanded,
                    onClick: () => { toggleCopy(key); },
                }, isExpanded ? h(IconChevronUpOutlineRegular) : h(IconChevronDownOutlineRegular)));
        }), hasOptions
            ? h('div', {
                className: cls(c('customRow'), draft.custom !== '' && c('customRowActive'), 
                // 官方 QuestionComposer.tsx:637-642：单选已选中某项时抑制自定义输入行抢焦点高亮。
                customRowYielded(current.multiSelect === true, draft.selected.length) && c('customRowYielded')),
            }, current.multiSelect === true
                ? h('span', {
                    className: cls(c('checkbox'), draft.custom !== '' && c('checkboxChecked')),
                    'aria-hidden': true,
                }, draft.custom !== '' ? h(IconCheckOutlineRegular, { size: 12 }) : null)
                : h('span', { className: c('number'), 'aria-hidden': true }, h(IconEditOutlineRegular, { size: 12 })), customField('inline'))
            : customField('block'))), minimized
        ? null
        : h('footer', { className: c('footer') }, h('div', { className: c('pager') }, h('button', {
            type: 'button',
            className: c('iconButton'),
            'aria-label': labelOf.prev,
            disabled: index === 0 || busy,
            onClick: () => { setIndex(index - 1); setExpanded({ index: index - 1, copies: EMPTY_COPIES }); setError(null); },
        }, h(IconChevronLeftOutlineRegular)), h('span', { className: c('progress') }, `${String(index + 1)} / ${String(questions.length)}`), h('button', {
            type: 'button',
            className: c('iconButton'),
            'aria-label': labelOf.next,
            disabled: index === questions.length - 1 || busy,
            onClick: () => { setIndex(index + 1); setExpanded({ index: index + 1, copies: EMPTY_COPIES }); setError(null); },
        }, h(IconChevronRightOutlineRegular))), h('div', { className: c('feedback'), role: 'status' }, feedback), interactive
            ? h('div', { className: c('footerActions') }, h(Button, { variant: 'outline', disabled: busy, onClick: skipQuestion }, t('askPanelSkip')), h(Button, {
                variant: 'primary',
                disabled: busy || !answered(draft),
                onClick: continueFlow,
            }, busy
                ? t('askPanelSubmitting')
                : index === questions.length - 1 ? t('askPanelSubmit') : t('askPanelNext')))
            : null)));
}
//# sourceMappingURL=QuestionPanel.js.map