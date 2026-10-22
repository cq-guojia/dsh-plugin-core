import { createElement as h, useEffect } from 'react';
import { ensureControls } from './css.js';
import { t } from '../utils/i18n.js';
/**
 * 模态弹窗（自绘 overlay，**不用 react-dom 的 portal**，避免多一个必需依赖）。
 *
 * 定位：它是**呈现方式**，不是内容 —— 会话预览这类功能模块要用弹窗时用它来承载（需求文档 §4）。
 */
export function Modal(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const closeOnMask = props.closeOnMask !== false;
    const escClose = props.escClose !== false;
    useEffect(() => {
        if (!escClose || props.onClose === undefined)
            return;
        const onKey = (e) => {
            if (e.key === 'Escape')
                props.onClose?.();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [escClose, props.onClose]);
    // 默认宽高（兄弟项目真值：小框 360px（task-list.tsx:457）/ 大弹窗 min(1120px,100vw-32px) × calc(100%-80px)（archive-session-css.ts:42））。
    const sizeStyle = {
        sm: { width: '360px', maxWidth: 'calc(100vw - 48px)' },
        md: { width: 'min(720px, calc(100vw - 32px))', maxHeight: '86vh' },
        lg: { width: 'min(1120px, calc(100vw - 32px))', height: 'calc(100% - 80px)' },
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
    // mask=false：透明 + 不吃点击（弹窗成为页面上的普通浮层，旁边的 dock 照常可交互）。
    const plainMask = props.mask === false;
    return h('div', {
        className: plainMask ? 'dshpc-modal-mask dshpc-modal-mask--plain' : 'dshpc-modal-mask',
        style: plainMask && props.maskInsetRight !== undefined && props.maskInsetRight > 0
            ? { paddingRight: `${props.maskInsetRight}px` }
            : undefined,
        onClick: () => {
            if (closeOnMask && !plainMask)
                props.onClose?.();
        },
    }, h('div', {
        className: `dshpc-modal${props.size ? ` dshpc-modal--${props.size}` : ''}`,
        style: {
            width: props.width ?? s.width,
            maxWidth: props.maxWidth ?? s.maxWidth,
            maxHeight: props.maxHeight ?? s.maxHeight,
            height: props.height ?? s.height,
        },
        onClick: (e) => e.stopPropagation(),
    }, showHeader
        ? h('div', { className: 'dshpc-modal__head' }, h('div', { className: 'dshpc-modal__heading' }, props.icon === undefined ? null : h('span', { className: 'dshpc-modal__lead' }, props.icon), 
        // 标题组：第一行 = 标题 + 右侧小块（徽标**紧跟标题**，不跨两行居中），
        // 第二行 = 副标题（会话 id 这类标识）。
        h('div', { className: 'dshpc-modal__titlegroup' }, h('div', { className: 'dshpc-modal__titlerow' }, h('div', { className: 'dshpc-modal__title' }, props.title ?? ''), props.headerExtra === undefined
            ? null
            : h('div', { className: 'dshpc-modal__extra' }, props.headerExtra)), props.subtitle === undefined
            ? null
            : h('div', { className: 'dshpc-modal__sid' }, props.subtitle))), h('div', { className: 'dshpc-modal__spacer' }), props.headerActions === undefined
            ? null
            : h('div', { className: 'dshpc-modal__actions' }, props.headerActions), showClose
            ? h('button', {
                type: 'button',
                className: 'dshpc-modal__close',
                'aria-label': tt('modalClose'),
                onClick: () => props.onClose?.(),
            }, '✕')
            : null)
        : null, 
    // body 是**唯一滚动容器**：内距归它、滚动条归它、滚动条贴面板右缘；
    // 内容只管按流排，不许自己定高、不许自己再开滚动条（用户 2026-10-22 定的口径）。
    h('div', { className: 'dshpc-modal__body' }, props.children ?? null), props.footer === undefined ? null : h('div', { className: 'dshpc-modal__foot' }, props.footer)));
}
//# sourceMappingURL=Modal.js.map