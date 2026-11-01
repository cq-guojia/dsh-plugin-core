import { createElement as h } from 'react';
import { ensureComponentStyles } from './css.js';
import { SURFACE_CSS } from './surface-css.js';
/**
 * 拼 Surface 的类名。独立导出是给组合类容器（Card）用的：
 * 容器要把 Surface 当外框、又不想吃它的内距时，传 `padding: null` 即可。
 */
export function surfaceClass(options = {}) {
    const tone = options.tone ?? 'plain';
    const border = options.border ?? true;
    const radius = options.radius ?? 'md';
    const padding = options.padding === undefined ? 'md' : options.padding;
    return [
        'dshpc-surface',
        tone === 'plain' ? '' : `dshpc-surface--tone-${tone}`,
        border === true ? '' : `dshpc-surface--border-${border}`,
        radius === 'md' ? '' : `dshpc-surface--radius-${radius}`,
        padding === null ? '' : `dshpc-surface--pad-${padding}`,
    ]
        .filter((name) => name !== '')
        .join(' ');
}
/**
 * 纯框容器：底 / 边框 / 圆角 / 内距四根轴，零业务语义。
 * 它是**圆角契约的唯一真源**（容器档 12，与控件同档），下游要用「一块一块的面」时用它，
 * 不要再自己写 border + border-radius。
 *
 * ```tsx
 * h(Surface, { tone: 'sunken', padding: 'md' }, h('div', null, '任意内容'))
 * ```
 */
export function Surface(props) {
    ensureComponentStyles('surface', SURFACE_CSS);
    return h('div', {
        className: [surfaceClass(props), props.className ?? ''].filter((s) => s !== '').join(' '),
        style: props.style,
    }, props.children ?? null);
}
//# sourceMappingURL=Surface.js.map