/**
 * 按钮 / 图标钮 —— **全站唯一实现**（L2 组件皮肤，P2）
 *
 * 三轴模型：
 *  - `variant`：外观档（形态 + 语义色），共 18 档
 *      primary（黑实心）/ secondary（灰实心）/ outline（描边）/ ghost（无底无边）
 *      danger（红实心）/ success（绿实心）/ warning（黄实心）/ info（蓝实心）
 *      danger-outline（红字描边）/ link（行内链接）
 *      purple / pink / cyan / teal / orange / indigo / rose / slate（扩展八色实心，2026-10-29）
 *  - `size`：`sm`(24) / `md`(28) / `lg`(32) —— 高度一律吃 `--dshpc-control-h-*`，
 *    **有边 / 无边同高**（边框在内部补回）
 *  - `block`：撑满父宽
 *
 * 内容轴：`icon`（前置）/ `iconRight`（后置）/ `loading`（前置小圈并自动禁用）。
 * 颜色轴：任一档都可以再用 `color` 传任意 CSS 色值 —— 只覆盖 `--btn-*` 几个变量，
 * 不新增皮肤（皮肤仍只在 `controls-css.ts` 里）。
 *
 * `IconButton` 是纯图标钮：`plain`（默认无底无边，hover 起灰底）/ `outline`（描边）/ `danger`（红）。
 * 兼容别名：`danger-ink` 仍是 `danger-outline` 的旧类名，可直接挂 className。
 *
 * ⚠️ 不许在任何使用点就地写按钮样式；要多一档外观 ⇒ 改基础层（一处改全站生效）。
 */
import { MarqueeText } from '../display/MarqueeText.js';
import { Loader } from '../feedback/Loader.js';
import { createElement as h, useEffect, useLayoutEffect, useRef, useState, } from 'react';
import { ensureComponentStyles } from '../infra/css.js';
import { useOverlayLocked } from '../infra/overlay.js';
import { BUTTON_CSS } from '../infra/controls-css.js';
import { isThenable } from '../infra/thenable.js';
/**
 * 有 DOM 时用 layout effect（绘制前锁宽，用户看不到中间态），SSR 退化成 useEffect（服务端本就不跑）。
 * 直接用 `useLayoutEffect` 会在服务端渲染时告警。
 */
const useIsoLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;
/** 实心档（color 参数按「底色」处理；其余档按「字色 + 描边色」处理）。 */
const SOLID_VARIANTS = [
    'primary', 'secondary', 'danger', 'success', 'warning', 'info',
    'purple', 'pink', 'cyan', 'teal', 'orange', 'indigo', 'rose', 'slate',
];
/** 把自定义颜色翻译成 5 个局部变量（只覆盖 token，不新增皮肤）。 */
function colorVars(variant, color) {
    if (color === undefined || color === '')
        return undefined;
    if (SOLID_VARIANTS.includes(variant)) {
        return {
            '--btn-bg': color,
            // 亮色主题下 --dshpc-fg 是黑 ⇒ 压深；暗色下是白 ⇒ 提亮。两边都能明确看出变化。
            '--btn-bg-hover': `color-mix(in srgb, ${color} 82%, var(--dshpc-fg))`,
            '--btn-bg-active': `color-mix(in srgb, ${color} 70%, var(--dshpc-fg))`,
        };
    }
    return {
        '--btn-fg': color,
        '--btn-fg-hover': color,
        '--btn-border': color,
        '--btn-bg-hover': `color-mix(in srgb, ${color} 12%, transparent)`,
        '--btn-bg-active': `color-mix(in srgb, ${color} 18%, transparent)`,
    };
}
/** 组装按钮 class（结构一套 + 轴类）。 */
function buttonClass(variant, size, block, hasIcon, extra) {
    return `dshpc-btn dshpc-btn--${variant} dshpc-btn--${size}`
        + `${block ? ' dshpc-btn--block' : ''}`
        // 前置图标标记：block 时靠它把文字拉回视觉中心（见 controls-css 的 --icon-start 规则）
        + `${hasIcon ? ' dshpc-btn--icon-start' : ''}`
        + `${extra !== undefined && extra !== '' ? ` ${extra}` : ''}`;
}
/**
 * 异步点击：`onClick` 返回 thenable 就自己转圈（并禁用），settle 后恢复。
 * 不用 `onBusyChange` 也能单独工作 —— 它只是把状态报给外面（弹窗锁关闭用）。
 * `onBusyStart` 在 setBusy 之前跑：那时按钮还是「有文案」的样子，要量宽度只能抓这一刻。
 */
function useAsyncClick(onClick, onBusyChange, onBusyStart) {
    const [busy, setBusy] = useState(false);
    const click = (event) => {
        if (onClick === undefined)
            return;
        const out = onClick(event);
        if (!isThenable(out))
            return;
        onBusyStart?.(event.currentTarget);
        setBusy(true);
        onBusyChange?.(true);
        const done = () => {
            setBusy(false);
            onBusyChange?.(false);
        };
        void out.then(done, (err) => {
            // 状态先恢复，再让失败可见（不吞：消费方该看到自己抛了什么）
            done();
            console.error('[dsh-plugin-core] Button 异步点击失败，已恢复可点：', err);
        });
    };
    return { busy, click };
}
/**
 * 渲染一个「图标 + 文案」按钮。
 *
 * @param props 见 {@link ButtonProps}。
 * @returns 按钮元素。
 */
export function Button(props) {
    ensureComponentStyles('button', BUTTON_CSS);
    const { variant = 'outline', size = 'lg', icon, iconRight, color, loading: loadingProp = false, loadingText = true, block = false, width, minWidth, maxWidth, className, style, children, onClick, onBusyChange, ...rest } = props;
    const btnRef = useRef(null);
    // 「有文案时的宽度」：只在非 loading 的布局里记，loading 时用它锁宽。
    const idleWidth = useRef(null);
    const [lockWidth, setLockWidth] = useState(null);
    // 调用方自己定了宽（width 参数或 style.width）⇒ 不测量、不锁，照他的来。
    const hasOwnWidth = width !== undefined || (style !== undefined && style.width !== undefined);
    const lockable = !loadingText && !hasOwnWidth && !block;
    const asyncClick = useAsyncClick(onClick, onBusyChange, (el) => {
        if (!lockable)
            return;
        // 点击这一刻 DOM 还是「有文案」的样子，量到的是要锁的那个宽度。
        const w = el.getBoundingClientRect().width;
        if (w > 0) {
            idleWidth.current = w;
            setLockWidth(w);
        }
    });
    // 两个来源取或：外部传的 loading（别处刷新也能点亮它）+ 自己异步在跑
    const loading = loadingProp || asyncClick.busy;
    // 外层浮层锁死：按自己的禁用态渲染，只做「或」—— 不写回调用方的 disabled，解锁即还原。
    const locked = useOverlayLocked();
    // 外部驱动的 loading 没有点击可抓：进 loading 那一次用上次记下的宽度补锁（绘制前重渲染，不见中间态）。
    useIsoLayoutEffect(() => {
        const el = btnRef.current;
        if (el === null)
            return;
        if (!loading) {
            const w = el.getBoundingClientRect().width;
            if (w > 0)
                idleWidth.current = w;
            if (lockWidth !== null)
                setLockWidth(null);
            return;
        }
        if (!lockable) {
            if (lockWidth !== null)
                setLockWidth(null);
            return;
        }
        if (lockWidth === null && idleWidth.current !== null)
            setLockWidth(idleWidth.current);
    }, [loading, lockable, lockWidth]);
    // 三轴互斥：固定宽优先，min / max 失效；否则 min / max 各自生效。
    const widthStyle = {};
    if (width !== undefined) {
        widthStyle.width = width;
    }
    else if (loading && lockWidth !== null) {
        // 锁宽只在 loading 期间生效：结束时这一帧就回到自适应，不留额外一拍。
        widthStyle.width = lockWidth;
    }
    else {
        if (minWidth !== undefined)
            widthStyle.minWidth = minWidth;
        if (maxWidth !== undefined)
            widthStyle.maxWidth = maxWidth;
    }
    // loading 且不保留文案 ⇒ 文字整块不渲染，按钮只剩一枚居中的圈。
    const hideText = loading && !loadingText;
    // 最大宽 + 纯文字标签 ⇒ 折叠省略号、hover 跑马灯（复用全站唯一 MarqueeText）。
    const marqueeLabel = !hideText && maxWidth !== undefined && width === undefined && typeof children === 'string';
    // 文案没了，读屏名称得留住：字符串 children 自动补；复合 children 由调用方传 aria-label。
    const autoLabel = hideText && typeof children === 'string' ? children : undefined;
    const attrs = {
        ...rest,
        ref: btnRef,
        type: rest.type ?? 'button',
        disabled: rest.disabled === true || loading || locked,
        // 与 IconButton 同一口径：文字还在，但让读屏知道它正在忙、不是单纯不可点
        'aria-busy': loading || undefined,
        ...(autoLabel !== undefined && rest['aria-label'] === undefined ? { 'aria-label': autoLabel } : {}),
        onClick: asyncClick.click,
        className: buttonClass(variant, size, block, icon !== undefined && icon !== null && !loading, className),
        style: { ...colorVars(variant, color), ...widthStyle, ...style },
    };
    return h('button', attrs, loading
        // 转圈统一走 Loader：包在图标容器里 ⇒ 尺寸/对齐与常规前置图标完全一致，
        // 「有 icon 的按钮」切 loading 时宽度一点不动（容器内 svg 被 1em 规则接管）。
        ? h('span', { className: 'dshpc-btn__icon' }, h(Loader, { size: 'xs' }))
        : icon !== undefined && icon !== null
            ? h('span', { className: 'dshpc-btn__icon' }, icon)
            : null, hideText
        ? null
        : marqueeLabel
            ? h(MarqueeText, { text: children, className: 'dshpc-btn__label' })
            : children, 
    // 转圈期间所有图标位都让位：前置位被 Loader 顶替，后置位（展开 / 外链）留在禁用态里只会挤版面
    iconRight !== undefined && iconRight !== null && !loading
        ? h('span', { className: 'dshpc-btn__icon-end' }, iconRight)
        : null);
}
/**
 * 渲染一个纯图标按钮。
 *
 * @param props 见 {@link IconButtonProps}。
 * @returns 图标按钮元素。
 */
export function IconButton(props) {
    ensureComponentStyles('button', BUTTON_CSS);
    const { variant = 'plain', size = 'lg', icon, label, color, background, loading: loadingProp = false, className, style, onClick, onBusyChange, ...rest } = props;
    const asyncClick = useAsyncClick(onClick, onBusyChange);
    const loading = loadingProp || asyncClick.busy;
    const locked = useOverlayLocked();
    // 只覆盖 4 个局部变量：图标色 / 底色及其 hover 派生（不新增皮肤，皮肤仍在 controls-css.ts）。
    const accent = {};
    if (color !== undefined && color !== '') {
        accent['--icb-fg'] = color;
        accent['--icb-fg-hover'] = color;
        accent['--icb-bg-hover'] = `color-mix(in srgb, ${color} 14%, transparent)`;
    }
    if (background !== undefined && background !== '') {
        accent['--icb-bg'] = background;
        accent['--icb-bg-hover'] = `color-mix(in srgb, ${background} 85%, var(--dshpc-fg))`;
    }
    const attrs = {
        ...rest,
        type: rest.type ?? 'button',
        title: rest.title ?? label,
        'aria-label': rest['aria-label'] ?? label,
        // 无障碍名不变（仍是 label），只声明「正在忙」，读屏不会把圈读成内容
        'aria-busy': loading || undefined,
        disabled: rest.disabled === true || loading || locked,
        onClick: asyncClick.click,
        className: `dshpc-iconbtn dshpc-iconbtn--${variant} dshpc-iconbtn--${size}${className !== undefined && className !== '' ? ` ${className}` : ''}`,
        style: { ...accent, ...style },
    };
    return h('button', attrs, loading ? h(Loader, { size: 'xs' }) : icon);
}
//# sourceMappingURL=Button.js.map