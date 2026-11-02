import { createElement as h } from 'react';
import { t } from '../utils/i18n.js';
import { ensureComponentStyles } from './css.js';
import { FEEDBACK_CSS } from './feedback-css.js';
import { OverlayHead, OverlayMask, useEscapeClose } from './overlay.js';
/**
 * 模态弹窗（自绘 overlay，**不用 react-dom 的 portal**，避免多一个必需依赖）。
 *
 * 定位：它是**呈现方式**，不是内容 —— 会话预览这类功能模块要用弹窗时用它来承载（需求文档 §4）。
 */
export function Modal(props) {
    ensureComponentStyles('feedback', FEEDBACK_CSS);
    const tt = props.translate ?? t;
    const closeOnMask = props.closeOnMask !== false;
    useEscapeClose(props.escClose !== false, props.onClose);
    // 默认宽高（兄弟项目真值：小框 360px（task-list.tsx:457）/ 大弹窗 min(1120px,100vw-32px) × calc(100%-80px)（archive-session-css.ts:42））。
    // 宽度用 `100%`（相对遮罩盒）而不是 `100vw`：遮罩已按右侧分栏让位（见 feedback.css），
    // 用 `100vw` 算出来的宽在分栏在场时会溢出到分栏上，等于白让（用户 2026-10-22）。
    const sizeStyle = {
        sm: { width: '360px', maxWidth: 'calc(100% - 48px)' },
        md: { width: 'min(720px, calc(100% - 32px))', maxHeight: '86vh' },
        lg: { width: 'min(1120px, calc(100% - 32px))', height: 'calc(100% - 80px)' },
    };
    const s = sizeStyle[props.size ?? 'md'];
    const showClose = props.closable !== false && props.onClose !== undefined;
    const showHeader = props.hideHeader !== true &&
        (props.icon !== undefined ||
            props.title !== undefined ||
            props.subtitle !== undefined ||
            props.headerExtra !== undefined ||
            props.headerActions !== undefined ||
            showClose);
    return h(OverlayMask, { kind: 'center', closeOnMask, onClose: props.onClose }, h('div', {
        className: `dshpc-modal${props.size ? ` dshpc-modal--${props.size}` : ''}${props.className !== undefined && props.className !== '' ? ` ${props.className}` : ''}`,
        style: {
            width: props.width ?? s.width,
            maxWidth: props.maxWidth ?? s.maxWidth,
            maxHeight: props.maxHeight ?? s.maxHeight,
            height: props.height ?? s.height,
        },
        onClick: (e) => e.stopPropagation(),
    }, 
    // 头部与遮罩都是浮层公共件（overlay.ts），SideSheet 用的是同一套。
    showHeader
        ? h(OverlayHead, {
            icon: props.icon,
            title: props.title,
            subtitle: props.subtitle,
            extra: props.headerExtra,
            actions: props.headerActions,
            closeLabel: tt('modalClose'),
            onClose: showClose ? props.onClose : undefined,
        })
        : null, 
    // body 是**唯一滚动容器**：内距归它、滚动条归它、滚动条贴面板右缘；
    // 内容只管按流排，不许自己定高、不许自己再开滚动条（用户 2026-10-22 定的口径）。
    h('div', { className: 'dshpc-modal__body' }, props.children ?? null), props.footer === undefined
        ? null
        : h('div', { className: `dshpc-modal__foot${props.footerDivider === false ? ' dshpc-modal__foot--bare' : ''}` }, props.footer)));
}
//# sourceMappingURL=Modal.js.map