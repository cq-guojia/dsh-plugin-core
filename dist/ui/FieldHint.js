/**
 * 字段问号提示 —— **全站唯一实现**（L2 组件，P4）
 *
 * 用途：表单行 / 输入框尾部挂一个「?」小圆标，鼠标悬停（或键盘聚焦）浮出说明气泡。
 * 纯 CSS 实现（见 controls-css 的 HINT_CSS），组件只负责拼结构，无任何 JS 状态。
 *
 * 用法：
 *   h('label', null, '开始时间', h(FieldHint, { text: '任务自该日起开始执行……' }), h(Input, {...}))
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