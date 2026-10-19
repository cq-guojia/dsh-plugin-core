import { createElement as h } from 'react';
import { ensureControls } from './css.js';
/** 小标签（neutral 用现成的 `--dshpc-chip-bg`；传 `onClick` 才是可点的）。 */
export function Chip(props) {
    ensureControls();
    const clickable = props.onClick !== undefined;
    const tone = props.tone ?? 'neutral';
    const size = props.size ?? 'sm';
    return h(clickable ? 'button' : 'span', {
        type: clickable ? 'button' : undefined,
        className: `dshpc-chip`
            + `${tone !== 'neutral' ? ` dshpc-chip--${tone}` : ''}`
            + `${size !== 'sm' ? ` dshpc-chip--${size}` : ''}`
            + `${clickable ? ' dshpc-chip--clickable' : ''}`
            + `${props.className === undefined ? '' : ` ${props.className}`}`,
        onClick: props.onClick,
    }, props.children ?? null);
}
//# sourceMappingURL=Chip.js.map