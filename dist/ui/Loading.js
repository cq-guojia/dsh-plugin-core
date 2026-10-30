/**
 * 全局浮动 Loading 指示器（UI 基础层 · P1）。
 *
 * 用法：
 *   <Loading />
 *
 * 行为：
 * - fixed 定位在主内容容器右下角，**不占布局空间**；
 * - 右侧贴齐主内容容器右边缘（`anchorId` 默认 `dshpc-main`），底部留 16px；
 * - **三个小方块依次脉动，无任何文案**（基础抽象统一外观，禁止加字；用户 2026-10-06）；
 * - 监听窗口 resize / scroll / 内容盒 resize，自动跟住内容宽度。
 *
 * 配套 also 导出 `<RunningBlocks />`：同样的三个脉动方块（无文案），
 * 用于表格单元格里的「运行中」状态指示。
 *
 * 文档登记：docs/design/ui-foundation.md §二「唯一实现表」。
 */
import { createElement as h, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { t } from '../utils/i18n.js';
import { claimLoadingHost, createLoadingSlot, loadingOverlayClass, } from './loading-host.js';
import { ensureComponentStyles, getStyleKit } from './css.js';
import { LOADING_CSS } from './controls-css.js';
const pillStyle = {
    position: 'fixed',
    bottom: '16px',
    zIndex: 'var(--dshpc-z-dock)',
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '5px 10px', borderRadius: 'var(--dshpc-radius-md)',
    background: 'var(--dshpc-surface-1)', border: '1px solid var(--dshpc-border)',
    boxShadow: 'var(--dshpc-shadow-1, 0 2px 8px rgba(0,0,0,.12))',
    color: 'var(--dshpc-fg-2)', fontSize: 'var(--dshpc-font-xs)', lineHeight: 'var(--dshpc-line-sm)',
    // 纯提示，不吃鼠标事件（别挡住底下的内容）。
    pointerEvents: 'none',
};
const RIGHT_MARGIN_PX = 0;
function useContentRight(anchorId) {
    const [right, setRight] = useState(`${RIGHT_MARGIN_PX}px`);
    useEffect(() => {
        const update = () => {
            const el = document.getElementById(anchorId);
            if (!el)
                return;
            const rect = el.getBoundingClientRect();
            const viewportW = document.documentElement.clientWidth;
            setRight(`${Math.max(0, viewportW - rect.right + RIGHT_MARGIN_PX)}px`);
        };
        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        const ro = new ResizeObserver(update);
        const el = document.getElementById(anchorId);
        if (el)
            ro.observe(el);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
            ro.disconnect();
        };
    }, [anchorId]);
    return right;
}
/** 浮动 Loading pill：三个脉动方块（无文案；基础抽象统一外观）。 */
export function Loading(props) {
    ensureComponentStyles('loading', LOADING_CSS);
    ensureComponentStyles('loading', LOADING_CSS);
    const right = useContentRight(props.anchorId ?? 'dshpc-main');
    return h('div', { style: { ...pillStyle, right }, role: 'status', 'aria-live': 'polite' }, h('span', { className: 'dshpc-run-blocks' }, h('i', null), h('i', null), h('i', null)));
}
/** 运行中状态用的三个脉动方块（无文案），颜色跟随 `currentColor`。 */
export function RunningBlocks() {
    ensureComponentStyles('loading', LOADING_CSS);
    return h('span', { className: 'dshpc-run-blocks' }, h('i', null), h('i', null), h('i', null));
}
// 转圈同样走 SVG 矢量弧（border 圆在次像素下会被抗锯齿拉毛，见 Button.ts）。
function spin(size) {
    return h('svg', { className: 'dshpc-loading-spin', viewBox: '0 0 16 16', width: size, height: size, 'aria-hidden': true }, h('circle', {
        cx: 8, cy: 8, r: 6.5, fill: 'none',
        stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round',
        // 周长 ≈ 40.8，画 30 的弧 ⇒ 约 265° 的开口环
        strokeDasharray: '30 41',
    }));
}
function textOf(props) {
    return props.text ?? (props.translate ?? t)('loadingDefault');
}
/** 样式一：横排提示卡（转圈在左、文字在右），灰色底与 notify 的 info 卡同色。就地渲染，位置随调用方。 */
export function LoadingToast(props) {
    ensureComponentStyles('loading', LOADING_CSS);
    return h('div', { className: 'dshpc-loading-toast', role: 'status', 'aria-live': 'polite' }, spin(16), h('span', null, textOf(props)));
}
/** 样式二：方块卡（转圈在上、文字在下，内距更大）。就地渲染，位置随调用方。 */
export function LoadingBlock(props) {
    ensureComponentStyles('loading', LOADING_CSS);
    return h('div', { className: 'dshpc-loading-block', role: 'status', 'aria-live': 'polite' }, spin(22), h('span', null, textOf(props)));
}
// 宿主实现：唯一浮层根 + 唯一槽位（`createLoadingSlot`）。屏幕上永远最多一张卡。
function createLoadingHost() {
    const slot = createLoadingSlot();
    let root = null;
    let container = null;
    function flush() {
        const state = slot.current();
        if (state === null) {
            root?.unmount();
            container?.remove();
            root = null;
            container = null;
            return;
        }
        if (root === null) {
            container = document.createElement('div');
            container.setAttribute('data-dshpc-loading-host', '');
            document.body.appendChild(container);
            root = createRoot(container);
        }
        ensureComponentStyles('loading', LOADING_CSS, getStyleKit());
        const { request } = state;
        const opacity = Math.min(1, Math.max(0, request.maskOpacity));
        root.render(h('div', { className: loadingOverlayClass(request.position) }, request.mask
            ? h('div', {
                className: 'dshpc-loading-overlay__mask',
                style: { background: `rgba(0, 0, 0, ${opacity})` },
            })
            : null, request.variant === 'block'
            ? h(LoadingBlock, { text: request.text, translate: request.translate })
            : h(LoadingToast, { text: request.text, translate: request.translate })));
    }
    return {
        show(request) {
            const handle = slot.show(request);
            flush();
            return {
                close() {
                    handle.close();
                    flush();
                },
            };
        },
    };
}
/**
 * 命令式加载提示（全局唯一浮层，**不自动消失**）。所有插件、所有位置调用都落在**同一处**
 * （默认屏幕下方居中，与 Toast 同屏位），且屏幕上永远只有一张卡 —— 后一次调用直接顶掉
 * 前一次，被顶掉那次的句柄再 `close()` 是空操作。收起只能靠自己调 `close()`。
 *
 * ```ts
 * const loading = showLoading({ text: '正在保存…', mask: true, maskOpacity: 0.3 })
 * await save()
 * loading.close()
 * ```
 *
 * 无 `document` 时静默返回空句柄（Node 单测 / SSR 不炸）。
 */
export function showLoading(opts) {
    if (typeof document === 'undefined')
        return { close: () => { } };
    return claimLoadingHost(createLoadingHost).show({
        text: opts?.text,
        variant: opts?.variant ?? 'toast',
        position: opts?.position ?? 'bottom-center',
        mask: opts?.mask === true,
        maskOpacity: opts?.maskOpacity ?? 0,
        translate: opts?.translate,
    });
}
//# sourceMappingURL=Loading.js.map