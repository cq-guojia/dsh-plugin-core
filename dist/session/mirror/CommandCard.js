// 官方 GenericCommandCard（ui-chat/src/client/chat/GenericCommandCard.tsx @ master，原样复刻）镜像：
//   · 行标题 = 裸命令名 node.name，缺席兜底 t('commandTitle')（官方 command.title = 指令 / Command）。
//   · 摘要 = outcome 落定 text：未决(outcome===null) = t('commandRunning')（执行中…）；
//     已决无 text 按 kind 取 t('commandFailed')（指令失败）/ t('commandDone')（已完成）。**不用 args**。
//   · state = running(未决) / error(outcome.kind==='error') / ok；running/error 各挂一个 visually-hidden 读屏状态词。
//   · 展开体仅当 outcome.text 含换行（多行）才可展开；展开体 = 原文 pre-wrap。
//   · 分隔符 = 2×2 小圆点；错误态 summary/body 用 error 色。
// 样式一律取宿主注入的官方 GenericCommandCard.module.css 类（officialClass），**不写自绘兜底**：
// 本包只跑在 DSH 宿主上、官方样式必在场；官方大版本更新我们跟着更，兜底既防不住「官方加东西」也无意义
// （用户 2026-10-23 定）。取不到官方类时退化为空类（裸结构、不白屏）；读屏 visually-hidden 复用 ToolRow 同名工具类。
import { Fragment, createElement as h, useCallback, useState } from 'react';
import { DisclosureRow, IconApiOutlineRegular, TextShimmer } from '../../ui/official.js';
import { officialClass } from '../official-classes.js';
/** 官方 GenericCommandCard 模块类（宿主必注入；缺席 = 空串，裸结构不白屏，不写自绘兜底）。 */
const gcc = (semantic) => officialClass('GenericCommandCard', semantic) ?? '';
/** 官方 stateOf：未决 = running；outcome.kind==='error' = error；否则 ok。 */
function stateOf(outcome) {
    if (outcome === null || outcome === undefined)
        return 'running';
    return outcome.kind === 'error' ? 'error' : 'ok';
}
/** 命令卡（官方 GenericCommandCard 镜像）：裸命令名 + 落定摘要 + 多行输出可展开。 */
export function CommandCard(props) {
    const { node, t, runningSummary } = props;
    const [expanded, setExpanded] = useState(false);
    const outcome = node.outcome ?? null;
    const text = outcome?.text;
    const summary = outcome === null
        ? runningSummary ?? t('commandRunning')
        : text ?? (outcome.kind === 'error' ? t('commandFailed') : t('commandDone'));
    const title = node.name ?? t('commandTitle');
    const state = stateOf(outcome);
    const running = state === 'running';
    // 官方：仅多行 text 才给展开体（单行摘要已够，不出 chevron）。
    const body = text !== undefined && text.includes('\n') ? text : null;
    const open = expanded && body !== null;
    const toggle = useCallback(() => { setExpanded((value) => !value); }, []);
    // 读屏 visually-hidden：复用 ToolRow 同名工具类（既有，非新写兜底）。
    const hidden = officialClass('ToolRow', 'visuallyHidden') ?? '';
    return h('div', { className: gcc('root'), 'data-state': state }, 
    // 官方 a11y：running/error 的读屏状态词（visually-hidden，不占可见空间）。
    state === 'running'
        ? h('span', { className: hidden }, t('rowRunning'))
        : state === 'error'
            ? h('span', { className: hidden }, t('rowFailed'))
            : null, h(DisclosureRow, {
        leadingClassName: gcc('leading'),
        titleClassName: gcc('title'),
        icon: h(IconApiOutlineRegular, { size: 14 }),
        title,
        running,
        open,
        expandable: body !== null,
        expandOnRowClick: true,
        keepContentWhenOpen: true,
        onToggle: toggle,
        collapsedContent: h(Fragment, null, h('span', { className: gcc('separator'), 'aria-hidden': true }), h('span', {
            className: gcc('summary'),
            'data-error': state === 'error' || undefined,
        }, h(TextShimmer, { active: running }, summary))),
        children: open && body !== null
            ? h('div', {
                className: gcc('body'),
                'data-error': state === 'error' || undefined,
            }, body)
            : undefined,
    }));
}
//# sourceMappingURL=CommandCard.js.map