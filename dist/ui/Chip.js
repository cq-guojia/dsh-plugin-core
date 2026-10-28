import { createElement as h } from 'react';
import { ensureControls } from './css.js';
import { MarqueeText } from './MarqueeText.js';
/** 小标签（neutral 用现成的 `--dshpc-chip-bg`；传 `onClick` 才是可点的）。 */
export function Chip(props) {
    ensureControls();
    const { children, tone = 'neutral', size = 'sm', width, minWidth, maxWidth, onClick, className, } = props;
    const clickable = onClick !== undefined;
    // 三轴互斥：固定宽优先，min / max 失效；否则 min / max 各自生效。
    const widthStyle = {};
    if (width !== undefined) {
        widthStyle.width = width;
    }
    else {
        if (minWidth !== undefined)
            widthStyle.minWidth = minWidth;
        if (maxWidth !== undefined)
            widthStyle.maxWidth = maxWidth;
    }
    // 最大宽 + 纯文字内容 ⇒ 折叠省略号、hover 跑马灯（复用全站唯一 MarqueeText）。
    const marqueeLabel = maxWidth !== undefined && width === undefined && typeof children === 'string';
    return h(clickable ? 'button' : 'span', {
        type: clickable ? 'button' : undefined,
        className: `dshpc-chip`
            + `${tone !== 'neutral' ? ` dshpc-chip--${tone}` : ''}`
            + `${size !== 'sm' ? ` dshpc-chip--${size}` : ''}`
            + `${clickable ? ' dshpc-chip--clickable' : ''}`
            + `${className === undefined ? '' : ` ${className}`}`,
        style: widthStyle,
        onClick,
    }, marqueeLabel
        ? h(MarqueeText, { text: children, className: 'dshpc-chip__label' })
        : children ?? null);
}
//# sourceMappingURL=Chip.js.map