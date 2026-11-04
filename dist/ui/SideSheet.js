/**
 * 侧边抽屉（SideSheet）—— 从屏幕左/右缘滑入的**覆盖式**浮层。
 *
 * 与 PanelDock 的关系（用户 2026-11-02 定）：**皮肤一模一样**（同一份 side-panel.css：
 * 头部、拖拽条、关闭钮、背景阴影、入场动画），宽度也能拖；差别只有两点：
 *   · PanelDock 是布局成员（sticky 占宽、挤窄主区，调用方必须给挂载点）；
 *   · SideSheet 是浮层（absolute 贴边、盖住页面，自铺遮罩，不需要挂载点）；
 *   · SideSheet **没有收起**（没有耳朵、没有收起钮）—— 关就是关。
 *
 * 开关行为与 Modal 一致：渲染即显示（`{open && <SideSheet … />}`）、点遮罩 / Esc / ✕ 都能关，
 * 三者都可关掉；遮罩与 Esc 判定走 overlay.ts 的公共件。
 */
import { createElement as h, useEffect, useRef, useState } from 'react';
import { t } from '../utils/i18n.js';
import { ensureComponentStyles } from './css.js';
import { SIDE_PANEL_CSS } from './side-panel-css.js';
import { SIDE_SHEET_CSS } from './side-sheet-css.js';
import { OverlayMask, useEscapeClose } from './overlay.js';
import { startResizeLayoutWidth } from './resizer.js';
import { FlipText } from './FlipText.js';
export function SideSheet(props) {
    ensureComponentStyles('side-panel', SIDE_PANEL_CSS);
    ensureComponentStyles('side-sheet', SIDE_SHEET_CSS);
    const tt = props.translate ?? t;
    const side = props.side ?? 'left';
    // busy 是否决项：三条关闭路径一起封死（✕ 见下面 showClose）。
    const busy = props.busy === true;
    const closeOnMask = !busy && props.closeOnMask !== false;
    useEscapeClose(!busy && props.escClose !== false, busy ? undefined : props.onClose);
    // 空串等同于没给：抽屉常驻渲染时，传 "" 就能把上一轮的提示清干净、不留占位。
    const notice = props.notice === '' ? undefined : props.notice;
    const [width, setWidth] = useState(props.width ?? 460);
    const panelRef = useRef(null);
    // 收起动效（用户 2026-11-02）：open=false 时先播完 dshpc-side-out 再真正卸载；
    // 中途又被打开就撤销，不留残影。
    const leaving = props.open === false;
    // 挂载时就是关着的 ⇒ 直接不渲染（否则开页面会闪一下抽屉）。
    const [unmounted, setUnmounted] = useState(leaving);
    useEffect(() => {
        if (!leaving)
            setUnmounted(false);
    }, [leaving]);
    if (unmounted)
        return null;
    const showClose = props.closable !== false && props.onClose !== undefined && !busy;
    const hasHeader = props.header !== null;
    const beginResize = (event) => {
        const element = panelRef.current;
        if (element === null || typeof window === 'undefined')
            return;
        const startX = event.clientX;
        const startWidth = element.getBoundingClientRect().width;
        const min = props.minWidth ?? 320;
        const businessMax = props.maxWidth ?? Number.POSITIVE_INFINITY;
        element.classList.add('dshpc-side-surface--resizing');
        startResizeLayoutWidth({
            startEvent: event,
            rafThrottle: true,
            compute: (clientX) => {
                // 上限 = 遮罩盒宽度（已按右侧分栏让位），再夹业务上限。
                const box = element.parentElement?.getBoundingClientRect().width ?? window.innerWidth;
                const max = Math.max(min, Math.min(box, businessMax));
                // 左侧抽屉往右拖变宽，右侧抽屉反过来。
                const raw = side === 'left' ? startWidth + (clientX - startX) : startWidth + (startX - clientX);
                return Math.round(Math.min(Math.max(raw, min), max));
            },
            onMove: (next) => {
                element.style.width = `${next}px`;
            },
            onCommit: (next) => {
                element.classList.remove('dshpc-side-surface--resizing');
                setWidth(next);
            },
        });
    };
    const closeButton = (floating) => !showClose
        ? null
        : h('button', {
            type: 'button',
            className: `dshpc-dock__close ${floating ? 'dshpc-dock__close--floating' : 'dshpc-dock__close--abs'}`,
            'aria-label': tt('dockClose'),
            onClick: () => props.onClose?.(),
        }, props.closeIcon ?? '✕');
    const renderHeader = () => {
        if (props.header === null)
            return null;
        if (props.header !== undefined) {
            return h('div', { className: 'dshpc-dock__head dshpc-dock__head--custom' }, props.header);
        }
        return h('div', { className: 'dshpc-dock__head' }, props.icon === undefined ? null : h('div', { className: 'dshpc-dock__lead' }, props.icon), h('div', { className: 'dshpc-dock__title' }, props.title), props.extra === undefined ? null : h('div', { className: 'dshpc-dock__extra' }, props.extra));
    };
    return h(OverlayMask, { kind: 'side', closeOnMask, onClose: busy ? undefined : props.onClose }, h('section', {
        ref: (element) => {
            panelRef.current = element;
        },
        className: `dshpc-side-surface dshpc-sheet dshpc-sheet--${side}${leaving ? ' dshpc-sheet--leaving' : ''}`,
        style: { width: `${width}px` },
        // 收起动画结束才卸载；入场动画结束（leaving=false）在这里不算数。
        onAnimationEnd: () => {
            if (leaving)
                setUnmounted(true);
        },
        'aria-label': typeof props.title === 'string' ? props.title : undefined,
        // 面板上的点击不能再冒到遮罩（否则点正文就把自己关了）。
        onClick: (e) => e.stopPropagation(),
    }, props.resizable === false
        ? null
        : h('div', {
            className: 'dshpc-dock__resizer',
            role: 'separator',
            'aria-orientation': 'vertical',
            'aria-label': tt('dockResize'),
            onPointerDown: (event) => {
                beginResize(event);
            },
        }), renderHeader(), closeButton(!hasHeader), h('div', { className: 'dshpc-dock__body dshpc-sheet__body' }, props.children ?? null), props.footer === undefined && notice === undefined
        ? null
        : h('div', { className: 'dshpc-sheet__foot' }, notice === undefined ? null : h(FlipText, { text: notice, className: 'dshpc-sheet__notice', sweep: true }), props.footer)));
}
//# sourceMappingURL=SideSheet.js.map