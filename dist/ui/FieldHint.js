/**
 * 问号提示 —— **全站唯一实现、独立组件**（L2，P4）
 *
 * ⚠️ 它**不属于 Input 家族**：任何地方都能挂——表单行尾、标题后面、卡片角落……
 * 调用点自己把它排进自己的 flex / label 里即可（组件只是 16px 的内联图标 + 气泡）。
 *
 * 交互：鼠标悬停（或键盘聚焦）浮出说明气泡；外观对齐真实插件 HelpButton（细圈 ? + 无 hover 底色）。
 * 纯 CSS 实现（见 controls-css 的 HINT_CSS），组件只负责拼结构，无任何 JS 状态。
 *
 * 用法：
 *   h('label', null, '开始时间', h(FieldHint, { text: '任务自该日起开始执行……' }), h(Input, {...}))
 *   h('div', null, h('b', null, '附加文件'), h(FieldHint, { text: '会随任务一起派发给 Agent……' }))
 */
import { ensureControls } from './css.js';
import { createElement as h } from 'react';
/** 问号提示图标：hover / focus 浮出说明气泡。 */
export function FieldHint(props) {
    ensureControls();
    return h('span', {
        className: `dsh-tdt-hint${props.className !== undefined && props.className !== '' ? ' ' + props.className : ''}`,
        style: props.style,
        tabIndex: 0,
        role: 'note',
        'aria-label': props.text,
    }, '?', h('span', { className: 'dsh-tdt-hint__bubble', role: 'tooltip' }, props.text));
}
//# sourceMappingURL=FieldHint.js.map