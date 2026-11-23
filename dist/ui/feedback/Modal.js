import { createContext, createElement as h, useContext } from 'react';
import { t } from '../../utils/i18n.js';
import { ensureComponentStyles } from '../infra/css.js';
import { FEEDBACK_CSS } from './feedback-css.js';
import { OverlayHead, OverlayLockExempt, OverlayLockedProvider, OverlayMask, useEscapeClose, useLockGuards } from '../infra/overlay.js';
import { PanelSurface } from '../infra/panel.js';
import { FlipText } from '../display/FlipText.js';
/** 收起出口的 Context：让例外控件深处也能拿到 `onBackground`，不必逐层透传。 */
const BackgroundContext = createContext(undefined);
/** 在 `lockExceptions` 子树里取收起出口；无 `onBackground` 时返回 undefined（调用方可据此不渲染收起钮）。 */
export function useModalBackground() {
    return useContext(BackgroundContext);
}
/**
 * 模态弹窗（自绘 overlay，**不用 react-dom 的 portal**，避免多一个必需依赖）。
 *
 * 定位：它是**呈现方式**，不是内容 —— 会话预览这类功能模块要用弹窗时用它来承载（需求文档 §4）。
 */
export function Modal(props) {
    ensureComponentStyles('feedback', FEEDBACK_CSS);
    const tt = props.translate ?? t;
    // busy / locked / backgrounded 都是否决项：三条关闭路径一起封死（✕ 见下面 showClose）。
    // locked 比 busy 多管一层：面板整块不可交互（pointer-events）。
    const busy = props.busy === true;
    const locked = props.locked === true;
    const backgrounded = props.backgrounded === true;
    const denyClose = busy || locked || backgrounded;
    const closeOnMask = !denyClose && props.closeOnMask !== false;
    // 收起后整窗隐藏，Tab/Esc 监听一起撤掉 —— 否则看不见的弹窗还吞键、还能被 Esc 关掉。
    useEscapeClose(!denyClose && props.escClose !== false, denyClose ? undefined : props.onClose);
    useLockGuards(locked && !backgrounded);
    // 空串等同于没给：底栏那块地方复用给下一轮时，传 "" 就把上一句清干净、不留占位。
    const notice = props.notice === '' ? undefined : props.notice;
    // 默认宽高（兄弟项目真值：小框 360px（task-list.tsx:457）/ 大弹窗 min(1120px,100vw-32px) × calc(100%-80px)（archive-session-css.ts:42））。
    // 宽度用 `100%`（相对遮罩盒）而不是 `100vw`：遮罩已按右侧分栏让位（见 feedback.css），
    // 用 `100vw` 算出来的宽在分栏在场时会溢出到分栏上，等于白让（用户 2026-10-22）。
    const sizeStyle = {
        sm: { width: '360px', maxWidth: 'calc(100% - 48px)' },
        md: { width: 'min(720px, calc(100% - 32px))', maxHeight: '86vh' },
        lg: { width: 'min(1120px, calc(100% - 32px))', height: 'calc(100% - 80px)' },
    };
    const s = sizeStyle[props.size ?? 'md'];
    const showClose = props.closable !== false && props.onClose !== undefined && !denyClose;
    const showHeader = props.hideHeader !== true &&
        (props.icon !== undefined ||
            props.title !== undefined ||
            props.subtitle !== undefined ||
            props.headerExtra !== undefined ||
            props.header !== undefined ||
            props.headerActions !== undefined ||
            showClose);
    return h(OverlayMask, {
        kind: 'center',
        closeOnMask,
        onClose: denyClose ? undefined : props.onClose,
        // 面板锁定与整窗收起都标在遮罩上：前者控禁止手势，后者整窗隐藏但保树。
        attrs: {
            ...(locked ? { 'data-dshpc-locked': '' } : {}),
            ...(backgrounded ? { 'data-dshpc-backgrounded': '' } : {}),
        },
    }, h(BackgroundContext.Provider, { value: props.onBackground }, h(OverlayLockedProvider, { value: locked }, 
    // 表面（底色/描边/圆角/阴影）来自 panel.css 的 modal 档；`.dshpc-modal` 只剩家族布局，
    // 且继续作为既有类名别名存在（消费方写在它上面的覆盖不受影响）。
    h(PanelSurface, {
        tier: 'modal',
        role: 'dialog',
        attrs: { 'aria-modal': 'true' },
        className: `dshpc-modal${props.size ? ` dshpc-modal--${props.size}` : ''}${locked ? ' dshpc-modal--locked dshpc-locked' : ''}${props.className !== undefined && props.className !== '' ? ` ${props.className}` : ''}`,
        style: {
            width: props.width ?? s.width,
            maxWidth: props.maxWidth ?? s.maxWidth,
            maxHeight: props.maxHeight ?? s.maxHeight,
            height: props.height ?? s.height,
        },
        stopPropagation: true,
    }, 
    // 头部与遮罩都是浮层公共件（overlay.ts），SideSheet 用的是同一套。
    showHeader
        ? h(OverlayHead, {
            icon: props.icon,
            title: props.title,
            subtitle: props.subtitle,
            extra: props.headerExtra,
            header: props.header,
            actions: props.headerActions,
            closeLabel: tt('modalClose'),
            onClose: showClose ? props.onClose : undefined,
        })
        : null, 
    // body 是**唯一滚动容器**：内距归它、滚动条归它、滚动条贴面板右缘；
    // 内容只管按流排，不许自己定高、不许自己再开滚动条（用户 2026-10-22 定的口径）。
    h('div', { className: 'dshpc-modal__body dshpc-scroll-thin' }, props.children ?? null), props.footer === undefined && notice === undefined
        ? null
        : h('div', { className: `dshpc-modal__foot${props.footerDivider === false ? ' dshpc-modal__foot--bare' : ''}` }, notice === undefined ? null : h(FlipText, { text: notice, className: 'dshpc-modal__notice', sweep: true }), props.footer), 
    // 锁定期间的例外控件：整窗指针锁死时，唯独这一块仍可点、可 Tab。
    // 放在 catcher 原来的位置（面板最后一个子节点），不依赖 DOM 顺序或 z-index。
    props.lockExceptions === undefined ? null : h(OverlayLockExempt, null, props.lockExceptions)))));
}
//# sourceMappingURL=Modal.js.map