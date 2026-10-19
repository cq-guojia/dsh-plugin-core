import { createElement as h } from 'react';
import { ensureControls } from './css.js';
/** 小标签（token 用现成的 `--dshpc-chip-bg`；传 `onClick` 才是可点的）。 */
export function Chip(props) {
    ensureControls();
    const clickable = props.onClick !== undefined;
    return h(clickable ? 'button' : 'span', {
        type: clickable ? 'button' : undefined,
        className: `dshpc-chip${clickable ? ' dshpc-chip--clickable' : ''}${props.className === undefined ? '' : ` ${props.className}`}`,
        onClick: props.onClick,
    }, props.children ?? null);
}
//# sourceMappingURL=Chip.js.map