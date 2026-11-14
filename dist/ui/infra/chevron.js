/**
 * 全站唯一的箭头：现在就是图标库的 `move-*` 字形（2026-11-14 用户定：图标统一走新图标库，
 * 自绘那条路径删掉）。四向各有一颗字形，不再旋转同一个图形。
 *
 * 用法不变：`h(Chevron, { dir: 'up' })`（默认 12px）。要动画就在外层套一个带 transform 的类
 * （如卡片折叠的 `.dshpc-card__caret.is-open`），不要在组件里写死。
 *
 * 为什么用 `FontIcon` 而不是 `Icon`：控件层不许把官方 primitives 拖进产物闭包
 * （`test/entry-isolation.test.mjs`），字体那条路本来也不需要它。
 */
import { createElement as h } from 'react';
import { FontIcon } from '../display/font-icon.js';
/** 方向 → 图标库字形。 */
const GLYPH = {
    down: 'common.base:move-down',
    up: 'common.base:move-up',
    left: 'common.base:move-left',
    right: 'common.base:move-right',
};
/** 箭头。 */
export function Chevron(props) {
    return h(FontIcon, {
        name: GLYPH[props.dir ?? 'down'],
        size: props.size ?? 12,
        className: props.className,
    });
}
//# sourceMappingURL=chevron.js.map