// 官方对照：packages/client/ui-chat/src/client/chat/MessageIconActions.tsx（0.1.7-rc.2 lib/client.js:1098-1163）
// data-clock=start|end；start 时时钟在行首，end 时「用量 + 时钟」一起放进 endInfo（右对齐）
//   > 复制（Tooltip「复制 / 已复制」，成功 1 秒后复位，用官方 writeClipboard）
//   > extraActions（官方留给 👍👎 之类的插槽，弹窗没有 ⇒ 不传）
//   > 分支（Tooltip「在新对话中分支 / 仅可从已完成轮次的最后一条消息分支」，unavailable 时 aria-disabled）
//   > endInfo：usageAction + time（官方 formatMessageClock）
import { createElement as h, useEffect, useRef, useState } from 'react';
import { IconBranchOutlineRegular, IconCheckOutlineRegular, IconCopyOutlineRegular, Tooltip, writeClipboard, } from '../../ui/official.js';
import { officialClass } from '../official-classes.js';
import { formatMessageClock } from './message-chrome.js';
/** 官方「已复制」复位时间。 */
const COPIED_RESET_MS = 1000;
/** 消息操作行（复制 / 分支 / 用量 / 时钟）。 */
export function MessageIconActionsMirror(props) {
    const { text, time, clock, onBranch, branchUnavailable = false, className, extraActions, usageAction, t } = props;
    const [copied, setCopied] = useState(false);
    const [pending, setPending] = useState(false);
    const timerRef = useRef(undefined);
    useEffect(() => () => { if (timerRef.current !== undefined)
        clearTimeout(timerRef.current); }, []);
    const copyLabel = copied ? t('copiedLabel') : t('copyLabel');
    const onCopy = () => {
        if (copied || pending)
            return;
        setPending(true);
        void writeClipboard(text).then((ok) => {
            setPending(false);
            if (!ok)
                return;
            setCopied(true);
            timerRef.current = setTimeout(() => { setCopied(false); }, COPIED_RESET_MS);
        });
    };
    // 官方语义名是 timeStart / timeEnd（assistant 尾部 = timeEnd，字号 13px-1px）——**没有 .clock**。
    // 之前写 'clock' 恒取不到 ⇒ 空类 ⇒ 时间吃浏览器默认 16px（真机 2026-10-23「时间偏大」）。
    // 老版本若叫 clock 也做候选兼容（都是官方语义名，不是自绘样式）。
    const clockClass = (clock === 'end'
        ? officialClass('MessageIconActions', 'timeEnd') ?? officialClass('MessageIconActions', 'clock')
        : officialClass('MessageIconActions', 'timeStart') ?? officialClass('MessageIconActions', 'clock')) ?? '';
    const clockEl = time === undefined ? null : h('time', {
        className: clockClass,
        dateTime: new Date(time).toISOString(),
    }, formatMessageClock(time, t));
    const reasonId = 'dshpc-sv-branch-unavailable';
    return h('div', {
        className: `${officialClass('MessageIconActions', 'actions') ?? ''}${className === undefined ? '' : ` ${className}`}`,
        'data-clock': clock,
    }, clock === 'start' ? clockEl : null, h(Tooltip, { label: copyLabel, side: 'bottom' }, h('button', {
        type: 'button',
        className: officialClass('MessageIconActions', 'action') ?? '',
        'aria-label': copyLabel,
        onClick: onCopy,
    }, copied
        ? h(IconCheckOutlineRegular, null)
        : h(IconCopyOutlineRegular, null))), extraActions, onBranch === undefined
        ? null
        : h(Tooltip, { label: branchUnavailable ? t('branchUnavailableLabel') : t('branchLabel'), side: 'bottom' }, h('button', {
            type: 'button',
            className: officialClass('MessageIconActions', 'action') ?? '',
            'aria-label': t('branchLabel'),
            'aria-disabled': branchUnavailable || undefined,
            'aria-describedby': branchUnavailable ? reasonId : undefined,
            'data-unavailable': branchUnavailable || undefined,
            onClick: branchUnavailable ? undefined : onBranch,
        }, h(IconBranchOutlineRegular, null))), onBranch === undefined || !branchUnavailable
        ? null
        : h('span', { id: reasonId, className: officialClass('accessibility', 'visuallyHidden') ?? '' }, t('branchUnavailableLabel')), clock === 'end'
        ? h('span', { className: officialClass('MessageIconActions', 'endInfo') ?? '' }, usageAction, clockEl)
        : usageAction);
}
//# sourceMappingURL=MessageIconActions.js.map