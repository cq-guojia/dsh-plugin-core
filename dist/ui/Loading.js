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
import { ensureControls } from './css.js';
import { createElement as h, useEffect, useState } from 'react';
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
    ensureControls();
    ensureControls();
    const right = useContentRight(props.anchorId ?? 'dshpc-main');
    return h('div', { style: { ...pillStyle, right }, role: 'status', 'aria-live': 'polite' }, h('span', { className: 'dshpc-run-blocks' }, h('i', null), h('i', null), h('i', null)));
}
/** 运行中状态用的三个脉动方块（无文案），颜色跟随 `currentColor`。 */
export function RunningBlocks() {
    ensureControls();
    return h('span', { className: 'dshpc-run-blocks' }, h('i', null), h('i', null), h('i', null));
}
//# sourceMappingURL=Loading.js.map