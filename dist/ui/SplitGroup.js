/**
 * 拼接外壳 —— 两个控件在外观上焊成一体（L2 组件皮肤，P1）
 *
 * 只管样式：外框、圆角、两格之间那条 1px 分隔、整体聚焦圈。**不持状态、不出联动回调** ——
 * 选中与联动全走内件自己的 `value` / `onChange`（2026-10-28 用户拍板：外壳不必知道
 * 右边那个控件管什么，消费方自己拿两个控件去绑）。
 *
 * 固定两格：不做多格（用户 2026-10-28：「就是两个组合，我觉得就足够了」）。
 *
 * 用法：
 *   h(SplitGroup, null,
 *     h(Segmented, { size: 'md', items, value, onChange: v => { setA(v); setB(pickFor(v)) } }),
 *     h(Picker, { size: 'md', options: optsOf(a), value: b, onChange: setB }))
 *
 * 两格要等高，就给内件传**同一个 `size`**（sm 24 / md 28 / lg 32 —— 外壳跟着内件长，不写死高度）。
 */
import { createElement as h } from 'react';
import { ensureComponentStyles } from './css.js';
import { SPLIT_GROUP_CSS } from './controls-css.js';
/**
 * 渲染一个两格拼接外壳。
 *
 * @param props 见 {@link SplitGroupProps}。
 * @returns 外壳元素。
 */
export function SplitGroup(props) {
    ensureComponentStyles('split-group', SPLIT_GROUP_CSS);
    return h('div', {
        role: 'group',
        'aria-label': props.label,
        id: props.id,
        className: `dshpc-split${props.className === undefined ? '' : ` ${props.className}`}`,
        style: props.style,
    }, props.children);
}
//# sourceMappingURL=SplitGroup.js.map