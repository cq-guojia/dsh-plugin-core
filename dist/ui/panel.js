/**
 * 浮层面板公共件（2026-11-03）：`PanelSurface` = 皮肤载体，`PanelClose` = 唯一那枚关闭钮。
 *
 * 分工（用户 2026-11-03 定，目的就是「样式统一但各家用各家自己的逻辑」）：
 *  - **定位**留在各自控件：Modal 居中、选文件弹窗贴锚点并翻转、菜单挂在触发器下方；
 *  - **表面**全部来自 `panel.css` 的三档（modal / popover / menu），组件里不许再写
 *    底色 / 描边 / 圆角 / 阴影。
 *
 * 为什么不做成「一个万能 Panel 组件」：那会把定位也吞进来，等于要求所有浮层同一套交互。
 * 这里只统一皮肤，不统一行为。
 */
import { createElement as h } from 'react';
import { ensureComponentStyles } from './css.js';
import { PANEL_CSS } from './panel-css.js';
/** 皮肤载体：`dshpc-panel` + 档位类，别的地方不要手拼这两个类。 */
export function PanelSurface(props) {
    ensureComponentStyles('panel', PANEL_CSS);
    const className = `dshpc-panel dshpc-panel--${props.tier}${props.className === undefined || props.className === '' ? '' : ` ${props.className}`}`;
    return h('div', {
        ...props.attrs,
        className,
        style: props.style,
        role: props.role,
        onClick: props.stopPropagation === true ? (event) => event.stopPropagation() : undefined,
    }, props.children ?? null);
}
/** 浮层唯一那枚关闭钮（20×20 方角）；位置由各自的头部决定，这个件不管定位。 */
export function PanelClose(props) {
    ensureComponentStyles('panel', PANEL_CSS);
    return h('button', {
        type: 'button',
        className: `dshpc-panel__close${props.className === undefined ? '' : ` ${props.className}`}`,
        'aria-label': props.label,
        onClick: () => props.onClick(),
    }, props.icon ?? '✕');
}
//# sourceMappingURL=panel.js.map