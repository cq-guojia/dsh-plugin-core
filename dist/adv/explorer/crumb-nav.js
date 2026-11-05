/**
 * 文件浏览器的第一排：▾ 选层 + 面包屑 + 右侧动作（选择 / ✕）。
 *
 * 2026-11-03 从 `FileBrowser.ts` 拆出（那里原来五个职责挤在 1000 行里）：
 * 本模块只负责「怎么画」，状态、测量与导航全在调用方。
 * 两个变体：
 *  - {@link CrumbNav}：正常形态（有 ▾ + 可点面包屑）；
 *  - {@link PlainNav}：越界形态（整条换成只读完整路径，不给会失败的入口）。
 */
import { createElement as h, Fragment } from 'react';
import { Button, IconButton } from '../../ui/actions/Button.js';
import { IconChevronDownOutlineRegular, IconChevronRightOutlineRegular, } from '../../ui/official.js';
import { MarqueeText } from '../../ui/display/MarqueeText.js';
import { PanelClose } from '../../ui/infra/panel.js';
import { ensureComponentStyles } from '../../ui/infra/css.js';
import { EXPLORER_CSS } from './explorer-css.js';
/** 一段面包屑（核心 ghost 钮：无底无边；度量条与可见态必须逐字同构）。 */
function crumbButton(label, onClick, current = false) {
    return h(Button, {
        variant: 'ghost',
        size: 'sm',
        className: `dshpc-fb__crumb${current ? ' dshpc-fb__crumb--current' : ''}`,
        disabled: onClick === undefined,
        tabIndex: onClick === undefined ? -1 : 0,
        onClick,
    }, h(MarqueeText, { text: label, className: 'dshpc-fb__crumb-mq' }));
}
function actions(pickNow, tt, onClose) {
    // 只有无壳容器（picker 弹窗）才在这一排补关闭钮；dock 的关闭归 PanelDock（不传 onClose）。
    if (pickNow == null && onClose === undefined)
        return null;
    return h('div', { className: 'dshpc-fb__actions' }, pickNow, onClose === undefined
        ? null
        // 关闭钮只有一枚（PanelClose），与 Modal / SideSheet 同一颗。
        : h(PanelClose, { label: tt('previewClose'), onClick: onClose }));
}
export function CrumbNav(props) {
    ensureComponentStyles('explorer', EXPLORER_CSS);
    const { translate: tt, landing, crumbs, overflow, menuItems, menuOpen, onToggleMenu, onCloseMenu, onLoadDir, pickNow, onClose, regionRef, measureRef, } = props;
    const visibleCrumbs = overflow
        ? crumbButton(crumbs.length > 0 ? crumbs[crumbs.length - 1]?.label ?? tt('explorerRootName') : tt('explorerRootName'), undefined, true)
        : crumbs.length === 0
            ? crumbButton(tt('explorerRootName'), undefined, true)
            : crumbs.map((crumb, index) => h(Fragment, { key: crumb.path }, index > 0 ? h(IconChevronRightOutlineRegular, { className: 'dshpc-fb__crumb-sep', size: 12 }) : null, crumbButton(crumb.label, () => onLoadDir(crumb.path))));
    return h('nav', { className: 'dshpc-fb__bar', 'aria-label': tt('explorerCrumbsAria') }, h('div', { className: 'dshpc-fb__menu-wrap' }, h(IconButton, {
        variant: 'plain',
        size: 'md',
        icon: h(IconChevronDownOutlineRegular, { size: 14 }),
        label: tt('explorerLevels'),
        'aria-expanded': menuOpen,
        onClick: onToggleMenu,
    }), 
    // 选层下拉 = 自写浮层：透明遮罩点一下即收；遮罩层序走 --dshpc-z-popmenu，
    // 高于 picker 面板（--dshpc-z-panel）⇒ 菜单开着时点面板也算「点外部」。
    menuOpen
        ? h(Fragment, null, h('div', { className: 'dshpc-fb__crumbs-backdrop', onClick: onCloseMenu }), 
        // 表皮走 panel.css 的 menu 档；`.dshpc-fb__crumbs-menu` 只留定位与滚动（旧类名作别名）。
        h('div', { className: 'dshpc-panel dshpc-panel--menu dshpc-fb__crumbs-menu', role: 'menu' }, menuItems))
        : null), landing
        ? h('div', { className: 'dshpc-fb__crumbs' })
        : h('div', { ref: regionRef, className: 'dshpc-fb__crumbs' }, 
        // 隐藏测量条：与可见态完全同构的 crumb 按钮，确保溢出判定精确。
        h('span', { ref: measureRef, className: 'dshpc-fb__crumbs-measure', 'aria-hidden': true }, crumbs.length === 0
            ? crumbButton(tt('explorerRootName'))
            : crumbs.map((crumb, index) => h(Fragment, { key: crumb.path }, index > 0 ? h(IconChevronRightOutlineRegular, { className: 'dshpc-fb__crumb-sep', size: 12 }) : null, crumbButton(crumb.label)))), visibleCrumbs), actions(pickNow, tt, onClose));
}
/** 越界（工作区外）：第一排整条换成只读完整路径，不给任何会失败的入口。 */
export function PlainNav(props) {
    ensureComponentStyles('explorer', EXPLORER_CSS);
    const { translate: tt, path, pickNow, onClose } = props;
    return h('nav', { className: 'dshpc-fb__bar', 'aria-label': tt('explorerCrumbsAria') }, h(MarqueeText, {
        text: path,
        title: path,
        className: 'dshpc-fb__bar-plain',
        style: { flex: '1 1 auto', minWidth: 0 },
    }), actions(pickNow, tt, onClose));
}
//# sourceMappingURL=crumb-nav.js.map