// 官方对照：@deepseek-ai/dsh-client-ui-skill@0.2.2-rc.1 lib/client.js:98-267（SkillRow）
// + :69-96（SkillRow.module.css 类名表）。
// 官方 `tool.call.toolview` 槽位按 key='skill' 注册专属卡（lib/client.js:432-437），
// **不走 GenericCommandCard**：标题「加载技能」+ 技能图标 + 摘要只取 args.name；
// 展开体是带「说明」头的 Instructions 卡（pre 原样呈现持久化输出、260px 限高），
// 不是把 skill 正文当 Markdown / 输入输出块铺出来。0.2.1-rc.5 已有此包。
import { Fragment, createElement as h, useState } from 'react';
import { IconChevronDownOutlineRegular, IconSkillOutlineRegular, TextShimmer, } from '../../../ui/official.js';
import { officialClass } from '../official-classes.js';
const cls = (semantic) => officialClass('SkillRow', semantic) ?? '';
const firstLine = (text) => {
    const nl = text.indexOf('\n');
    return nl === -1 ? text : text.slice(0, nl);
};
/** 官方 skillName（lib/client.js:105-114）：只认 args.name；解析失败退回 argsRaw 首行。 */
function skillName(argsRaw) {
    try {
        const parsed = JSON.parse(argsRaw);
        if (typeof parsed === 'object' && parsed !== null) {
            const name = parsed.name;
            if (typeof name === 'string' && name !== '')
                return firstLine(name);
        }
    }
    catch { /* 官方口径：参数不可解析时保持原样 */ }
    return firstLine(argsRaw);
}
/** `skill` 工具调用的官方专属行（tool.call.toolview key='skill'）。 */
export function SkillRowMirror(props) {
    const { argsRaw, output, isError, settled = true, phase, interrupted, t } = props;
    const [expanded, setExpanded] = useState(false);
    const state = !settled
        ? (phase === 'preparing' ? 'preparing' : 'running')
        : interrupted ? 'stopped' : isError ? 'error' : 'ok';
    // 官方 preparing 早返回：只有技能图标 + 标题，不显示技能名、不可展开。
    if (state === 'preparing') {
        return h('div', { className: cls('card'), 'data-tool': 'skill', 'data-state': 'preparing' }, h('div', { className: cls('row') }, h('span', { className: cls('leading') }, h(IconSkillOutlineRegular, { size: 14 })), h('span', { className: cls('visuallyHidden') }, t('skillRowPreparing')), h(TextShimmer, { active: true, className: cls('title') }, t('skillRowTitle'))));
    }
    const running = state === 'running';
    const errorSummary = state === 'error' && output !== '' ? firstLine(output) : null;
    const summary = state === 'stopped' ? t('skillRowStopped') : errorSummary ?? skillName(argsRaw);
    const expandable = output !== '';
    const open = expanded && expandable;
    const status = state === 'running' ? t('skillRowRunning')
        : state === 'error' ? t('skillRowFailed') : null;
    const leading = open
        ? h(IconChevronDownOutlineRegular, { className: cls('chevron') })
        : expandable
            ? h(Fragment, null, h('span', { className: cls('iconIdle') }, h(IconSkillOutlineRegular, { size: 14 })), h(IconChevronDownOutlineRegular, {
                className: `${cls('chevron')} ${cls('chevronHover')}`,
            }))
            : h(IconSkillOutlineRegular, { size: 14 });
    const summaryClassName = `${cls('summary')}${state === 'error' ? ` ${cls('errorSummary')}` : ''}${state === 'stopped' ? ` ${cls('stoppedSummary')}` : ''}`;
    const toggleFromKeyboard = (event) => {
        if (!expandable || (event.key !== 'Enter' && event.key !== ' '))
            return;
        event.preventDefault();
        setExpanded(value => !value);
    };
    return h('div', { className: cls('card'), 'data-tool': 'skill', 'data-state': state }, h('div', {
        className: cls('row'),
        'data-expandable': expandable || undefined,
        role: expandable ? 'button' : undefined,
        tabIndex: expandable ? 0 : undefined,
        'aria-expanded': expandable ? open : undefined,
        onClick: expandable ? () => { setExpanded(value => !value); } : undefined,
        onKeyDown: expandable ? toggleFromKeyboard : undefined,
    }, h('span', { className: cls('leading') }, leading), status !== null
        ? h('span', { className: cls('visuallyHidden') }, status)
        : null, h(TextShimmer, { active: running }, h('span', { className: cls('title') }, h(TextShimmer, null, t('skillRowTitle'))), h('span', {
        className: cls('separator'),
        'data-shimmer-decoration': true,
        'aria-hidden': true,
    }), h('span', { className: summaryClassName }, h(TextShimmer, null, summary)))), open
        ? h('div', { className: cls('bodyWrap') }, 
        // 官方 inspectButton 仅在槽位给了 inspect 回调时才渲染；会话预览没有技能目录 ⇒ 不伪造入口。
        h('section', {
            className: cls('instructionsCard'),
            'aria-label': t('skillRowInstructions'),
        }, h('div', { className: cls('instructionsHeader') }, t('skillRowInstructions')), h('pre', {
            className: cls('instructions'),
            'data-error': state === 'error' || undefined,
        }, output)))
        : null);
}
//# sourceMappingURL=SkillRow.js.map