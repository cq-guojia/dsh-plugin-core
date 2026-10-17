import { createElement as h } from 'react';
import { ensureControls } from './css.js';
import { t } from '../utils/i18n.js';
/** 空态：列表没数据 / 取数为空时统一用这一个，别各自手写「暂无」。 */
export function EmptyState(props) {
    ensureControls();
    const tt = props.translate ?? t;
    return h('div', { className: 'dsh-tdt-empty' }, props.icon ?? null, h('div', null, props.text ?? tt('emptyText')), props.action ?? null);
}
//# sourceMappingURL=EmptyState.js.map