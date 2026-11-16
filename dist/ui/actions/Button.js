/**
 * 按钮 —— **全站唯一实现**（L2 组件皮肤，P2）
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
 *  - `dense`：图标放大一档、内距收紧（高度不变）
 *
 * 内容轴：`icon`（前置）/ `iconRight`（后置）/ `loading`（前置小圈并自动禁用）。
 * **没有文字（不传 children）就是纯图标钮**：盒子自动变正方形（边长 = 同档高度），
 * 此时必须给 `label` 当无障碍名 —— 不再有独立的 IconButton 控件（用户 2026-11-15）。
 * 颜色轴：任一档都可以再用 `color` 传任意 CSS 色值 —— 只覆盖 `--btn-*` 几个变量，
 * 不新增皮肤（皮肤只在自己的 `button.css` 真源里，构建期编译成字符串常量）。
 * 底色另有独立一条轴 `background`：与 `color` 正交，用于「浅色底 + 同色系字/图标」
 * （2026-11-15 用户：合并 IconButton 后少了这条，消费方得自己覆盖变量）。
 *
 * 兼容别名：`danger-ink` 仍是 `danger-outline` 的旧类名，可直接挂 className。
 *
 * ⚠️ 不许在任何使用点就地写按钮样式；要多一档外观 ⇒ 改基础层（一处改全站生效）。
 */
import { MarqueeText } from '../display/MarqueeText.js';
import { Loader } from '../feedback/Loader.js';
import { createElement as h, useEffect, useLayoutEffect, useRef, useState, } from 'react';
import { ensureComponentStyles } from '../infra/css.js';
import { useOverlayLocked } from '../infra/overlay.js';
import { BUTTON_CSS } from './button-css.generated.js';
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
/** 把自定义颜色 / 底色翻译成局部变量（只覆盖 token，不新增皮肤）。 */
function colorVars(variant, color, background) {
    const vars = {};
    if (color !== undefined && color !== '') {
        if (SOLID_VARIANTS.includes(variant)) {
            vars['--btn-bg'] = color;
            // 自定义底色与主题无关 ⇒ 字色也必须固定：--dshpc-fg-inverse 在暗色下是近黑，
            // 压在用户给的橙 / 蓝实心上会看不清。--dshpc-on-signal 是两主题都白的常量。
            vars['--btn-fg'] = 'var(--dshpc-on-signal)';
            vars['--btn-fg-hover'] = 'var(--dshpc-on-signal)';
            // 亮色主题下 --dshpc-fg 是黑 ⇒ 压深；暗色下是白 ⇒ 提亮。两边都能明确看出变化。
            vars['--btn-bg-hover'] = `color-mix(in srgb, ${color} 82%, var(--dshpc-fg))`;
            vars['--btn-bg-active'] = `color-mix(in srgb, ${color} 70%, var(--dshpc-fg))`;
        }
        else {
            vars['--btn-fg'] = color;
            vars['--btn-fg-hover'] = color;
            vars['--btn-border'] = color;
            vars['--btn-bg-hover'] = `color-mix(in srgb, ${color} 12%, transparent)`;
            vars['--btn-bg-active'] = `color-mix(in srgb, ${color} 18%, transparent)`;
        }
    }
    // 底色最后写：实心档的 `color` 也在管底色，显式给了 background 就以它为准。
    if (background !== undefined && background !== '') {
        vars['--btn-bg'] = background;
        if (SOLID_VARIANTS.includes(variant)) {
            vars['--btn-fg'] = 'var(--dshpc-on-signal)';
            vars['--btn-fg-hover'] = 'var(--dshpc-on-signal)';
        }
        vars['--btn-bg-hover'] = `color-mix(in srgb, ${background} 88%, var(--dshpc-fg))`;
        vars['--btn-bg-active'] = `color-mix(in srgb, ${background} 76%, var(--dshpc-fg))`;
    }
    return Object.keys(vars).length === 0 ? undefined : vars;
}
/** 组装按钮 class（结构一套 + 轴类）。 */
function buttonClass(variant, size, block, hasIcon, dense, iconOnly, extra) {
    return `dshpc-btn dshpc-btn--${variant} dshpc-btn--${size}`
        + `${dense ? ' dshpc-btn--dense' : ''}`
        + `${iconOnly ? ' dshpc-btn--icon-only' : ''}`
        + `${block ? ' dshpc-btn--block' : ''}`
        // 前置图标标记：block 时靠它把文字拉回视觉中心（见 button.css 的 --icon-start 规则）
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
/** 纯图标钮漏 label 只报一次，别刷屏。 */
let warnedNoLabel = false;
/**
 * 渲染一个按钮：有 `children` 就是文字钮，只有 `icon` 就是正方形纯图标钮。
 *
 * @param props 见 {@link ButtonProps}。
 * @returns 按钮元素。
 */
export function Button(props) {
    ensureComponentStyles('button', BUTTON_CSS);
    const { variant = 'outline', size = 'lg', icon, iconRight, color, background, loading: loadingProp = false, loadingText = true, block = false, dense = false, width, minWidth, maxWidth, className, style, children, label, onClick, onBusyChange, ...rest } = props;
    // 没有文案 = 纯图标钮：盒子走正方形（button.css 的 --icon-only），无障碍名只能靠 label。
    const iconOnly = children === undefined || children === null;
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
    // 纯图标钮没有文字可读，label 就是它的名字 —— 漏了等于一颗无名按钮，当场报出来。
    const ariaLabel = rest['aria-label'] ?? label ?? autoLabel;
    if (iconOnly && ariaLabel === undefined && !warnedNoLabel) {
        warnedNoLabel = true;
        console.warn('[dsh-plugin-core] Button 没有 children 也没有 label：纯图标钮必须给 label 当无障碍名。');
    }
    const attrs = {
        ...rest,
        // 核心全站不渲染原生 title：显式压掉，调用方即使经 rest 传也不会冒出 tooltip。
        title: undefined,
        ref: btnRef,
        type: rest.type ?? 'button',
        disabled: rest.disabled === true || loading || locked,
        // 文字还在，但让读屏知道它正在忙、不是单纯不可点
        'aria-busy': loading || undefined,
        ...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {}),
        onClick: asyncClick.click,
        className: buttonClass(variant, size, block, icon !== undefined && icon !== null && !loading && !iconOnly, dense, iconOnly, className),
        style: { ...colorVars(variant, color, background), ...widthStyle, ...style },
    };
    const kids = [
        loading
            // 转圈统一走 Loader：包在图标容器里 ⇒ 尺寸/对齐与常规前置图标完全一致，
            // 「有 icon 的按钮」切 loading 时宽度一点不动（容器内 svg 被 1em 规则接管）。
            ? h('span', { className: 'dshpc-btn__icon' }, h(Loader, { size: 'xs' }))
            : icon !== undefined && icon !== null
                ? h('span', { className: 'dshpc-btn__icon' }, icon)
                : null,
        hideText
            ? null
            : marqueeLabel
                ? h(MarqueeText, { text: children, className: 'dshpc-btn__label' })
                : children,
        // 转圈期间所有图标位都让位：前置位被 Loader 顶替，后置位（展开 / 外链）留在禁用态里只会挤版面
        iconRight !== undefined && iconRight !== null && !loading
            ? h('span', { className: 'dshpc-btn__icon-end' }, iconRight)
            : null,
    ];
    // link 档整块包进一层内容盒：下划线由 button.css 的 ::after 铺满这层的宽度，
    // 才能横跨图标、间距与文字；非 link 档不需要这层（见 button.css）。
    return variant === 'link'
        ? h('button', attrs, h('span', { className: 'dshpc-btn__content' }, ...kids))
        : h('button', attrs, ...kids);
}
//# sourceMappingURL=Button.js.map