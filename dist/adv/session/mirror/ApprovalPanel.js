// 官方对照：`@deepseek-ai/dsh-client-ui-approval@0.2.2-rc.1`：
//  · lib/client.js:20-32（ApprovalPanel.module.css 类名表：root / card / strip / body / headline /
//    command / actionRow / reject / subject / description / withSubject）
//  · :41-165（ApprovalCard：strip=StateDot+「等待审批」、body=headline[+description][+command]、
//    actionRow=拒绝(outline)+允许一次(primary)，`disabled: answered`）
//  · :302-310（zh 词表；本包同文案走自有 i18n 字典）
//  · ui-chat :151-172（ApprovalCommand）：命令文本 = 按 callId 找 tool-call 起始节点的 args.command
// 弹窗不走官方槽位（`conversation.approval.card` 只能由槽宿主渲染），故按官方 DOM / 类名 1:1 直画。
import { createElement as h, useRef, useState } from 'react';
import { Button, StateDot } from '../../../ui/official.js';
import { officialClass } from '../official-classes.js';
import { getLocale } from '../../../utils/i18n.js';
const cls = (semantic) => officialClass('ApprovalPanel', semantic) ?? '';
function defaultResolveReason(shown) {
    return shown[getLocale()] ?? shown.en;
}
function headline(approval, t, resolveReason) {
    const reason = approval.displayReason === undefined
        ? approval.reason
        : resolveReason(approval.displayReason);
    return reason ?? t('approvalEscalation', { toolName: approval.toolName });
}
/** 官方 ApprovalCommand（ui-chat lib/client.js:151-172）：callId → tool-call 起始节点的 args.command。 */
export function approvalCommand(order, read, callId) {
    if (callId === undefined)
        return undefined;
    for (const key of order) {
        const node = read(key);
        if (node === undefined || node.kind !== 'tool-call')
            continue;
        const root = node.data?.root;
        if (typeof root !== 'object' || root === null)
            continue;
        const call = root;
        if (call.callId !== callId || call.phase !== 'start' || typeof call.argsRaw !== 'string')
            continue;
        try {
            const args = JSON.parse(call.argsRaw);
            const command = typeof args === 'object' && args !== null ? args.command : undefined;
            return typeof command === 'string' ? command : undefined;
        }
        catch {
            return undefined;
        }
    }
    return undefined;
}
/**
 * 待审批卡（官方 ApprovalPanel）。作答直接调 `pendingInteraction.answer()`——官方两个按钮的同一调用，
 * 答完官方 publish 会让 pendingInteraction 变空 ⇒ 卡自行消失。
 * shortcut: 未移植官方 root 上的 Enter/Esc 快捷键（要求焦点在卡内），需要键盘作答时补。
 */
export function ApprovalPanelMirror(props) {
    const { approval, command, subject, description, t } = props;
    const resolveReason = props.resolveReason ?? defaultResolveReason;
    const [answered, setAnswered] = useState(false);
    const waiting = useRef(false);
    const answer = (outcome) => {
        if (waiting.current || !approval.answerable)
            return;
        waiting.current = true;
        setAnswered(true);
        // 失败（请求已失效 / 传输断了）⇒ 恢复可点，别把按钮永久卡死。
        void approval.answer(outcome).catch(() => {
            waiting.current = false;
            setAnswered(false);
        });
    };
    return h('div', { className: cls('root'), 'data-approval-key': approval.key, 'aria-busy': answered }, h('div', { className: subject === undefined ? cls('card') : `${cls('card')} ${cls('withSubject')}` }, h('div', { className: cls('strip') }, h(StateDot, { state: answered ? 'ongoing' : 'warning' }), t('approvalWaiting')), h('div', {
        className: cls('body'),
        'data-approval-scroll': '',
        tabIndex: 0,
        role: 'group',
        'aria-label': t('approvalDetailAria'),
    }, subject === undefined
        ? null
        : h('div', { className: cls('subject') }, subject.icon === undefined
            ? null
            : h('img', { src: subject.icon, alt: '', width: 40, height: 40, draggable: false }), h('strong', null, subject.name)), h('div', { className: cls('heading') }, h('div', { className: cls('headline') }, headline(approval, t, resolveReason))), description === undefined ? null : h('p', { className: cls('description') }, description), command === undefined ? null : h('div', { className: cls('command') }, command)), h('div', { className: cls('actionRow') }, h(Button, {
        variant: 'outline',
        className: cls('reject'),
        disabled: answered,
        onClick: () => { answer('rejected'); },
    }, t('approvalReject')), h(Button, {
        variant: 'primary',
        disabled: answered,
        onClick: () => { answer('allowed-once'); },
    }, t('approvalAllowOnce')))));
}
//# sourceMappingURL=ApprovalPanel.js.map