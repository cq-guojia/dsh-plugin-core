import { createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster, toast } from 'sonner';
import { Button } from './Button.js';
const DEFAULT_MS = 2600;
const ROOT_ID = 'dshpc-toast-root';
let root = null;
let themeObserver = null;
let currentPosition = 'bottom-center';
// 宿主暗色判据是 body[data-ds-dark-theme]（不是 prefers-color-scheme），
// Sonner 的 theme 必须显式传，故从这里读并监听变化。
function currentTheme() {
    if (typeof document === 'undefined')
        return 'light';
    return document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light';
}
function renderToaster() {
    if (root === null)
        return;
    root.render(h(Toaster, {
        theme: currentTheme(),
        position: currentPosition,
        // richColors：success=绿整条 / error=红整条 / warning=黄整条（Sonner 自带）；
        // 不开 closeButton：在宿主里吃不到 Sonner 的 CSS 变量，会渲染成白底方块叉（真机踩过）。
        richColors: true,
    }));
}
// 全局唯一 Toaster：命令式 toast() 需要一个挂着的 Toaster 才能渲染；
// 首次调用时懒挂载一个 React root，避免无 document 环境（SSR / 单测）崩。
function ensureToaster() {
    if (root !== null)
        return;
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined')
        return;
    const container = document.createElement('div');
    container.id = ROOT_ID;
    document.body.appendChild(container);
    root = createRoot(container);
    renderToaster();
    themeObserver = new MutationObserver(() => renderToaster());
    themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-ds-dark-theme'],
    });
}
/**
 * 官方 Sonner 原生提示（**命令式**）。用于「官方的」对比 demo 与需要 Sonner 原味的场景。
 * 变体：info（中性卡）/ success（绿）/ error（红）/ warning（黄，richColors）。
 * 无 `document` 时静默跳过（Node 单测 / SSR 不炸）。
 */
export function showToast(message, opts) {
    if (typeof document === 'undefined')
        return;
    if (opts?.position !== undefined)
        currentPosition = opts.position;
    ensureToaster();
    renderToaster(); // 应用最新 position / theme（root 已存在时也要重渲染）
    const duration = opts?.durationMs ?? DEFAULT_MS;
    const onDismiss = opts?.onDismiss;
    if (opts?.color !== undefined) {
        toast(message, {
            duration,
            unstyled: true,
            onDismiss,
            className: 'dshpc-toast-custom',
            style: {
                background: opts.color,
                color: '#fff',
                minWidth: '320px',
                minHeight: '48px',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.18)',
                fontSize: '14px',
                lineHeight: '20px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
            },
        });
        return;
    }
    const variant = opts?.variant ?? 'info';
    if (variant === 'success') {
        toast.success(message, { duration, onDismiss });
    }
    else if (variant === 'error') {
        toast.error(message, { duration, onDismiss });
    }
    else if (variant === 'warning') {
        toast.warning(message, { duration, onDismiss });
    }
    else {
        toast(message, { duration, onDismiss });
    }
}
// 我们封装卡片的配色：info 走灰（不是纯黑，随明暗切换）；其余用整条语义色。
function notifyPalette(variant, theme) {
    switch (variant) {
        case 'success':
            return { bg: '#16a34a', fg: '#ffffff', glyph: '✓' };
        // error / warning 用哑光降饱和档：实心卡上加透明度会透出底层内容、伤可读性，
        // 故改为压暗一档的色相（设计师口径：冷静的严重度，而非警报荧光）。
        case 'error':
            return { bg: '#c0392b', fg: '#ffffff', glyph: '✕' };
        case 'warning':
            return { bg: '#e0922f', fg: '#1f2937', glyph: '!' };
        default:
            return theme === 'dark'
                ? { bg: '#3f3f46', fg: '#fafafa', glyph: 'i' }
                : { bg: '#f4f4f5', fg: '#18181b', glyph: 'i' };
    }
}
/**
 * 我们封装好的提示（**推荐项目内使用**）：统一卡片样式（灰/绿/红/黄，跟随明暗皮肤），
 * 右侧可挂 1–2 个**我们自己的 Button** 动作按钮，点击后自动关闭并调用你的事件。
 *
 * 底层仍是 Sonner（动画 / 定位 / 堆叠），但视觉与交互是我们定制的。
 * 无 `document` 时静默跳过。
 */
export function notify(message, opts) {
    if (typeof document === 'undefined')
        return;
    if (opts?.position !== undefined)
        currentPosition = opts.position;
    ensureToaster();
    renderToaster();
    const variant = opts?.variant ?? 'info';
    const palette = notifyPalette(variant, currentTheme());
    const duration = opts?.durationMs ?? DEFAULT_MS;
    const actions = opts?.actions;
    const id = toast.custom(() => h('div', {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '320px',
            minHeight: '48px',
            padding: '12px 16px',
            borderRadius: '10px',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.18)',
            background: palette.bg,
            color: palette.fg,
            boxSizing: 'border-box',
            fontSize: '14px',
            lineHeight: '20px',
        },
    }, h('span', {
        style: {
            flexShrink: 0,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700,
        },
    }, palette.glyph), h('div', { style: { flex: 1, minWidth: 0 } }, h('div', { style: { fontWeight: 600 } }, message), opts?.description !== undefined
        ? h('div', { style: { opacity: 0.9, fontSize: '13px', marginTop: '2px' } }, opts.description)
        : null), actions !== undefined && actions.length > 0
        ? h('div', { style: { display: 'flex', gap: '8px', flexShrink: 0 } }, ...actions.slice(0, 2).map((a) => h(Button, {
            variant: a.variant ?? 'outline',
            size: 'md',
            onClick: () => {
                a.onClick();
                toast.dismiss(id);
            },
        }, a.text)))
        : null), { duration, unstyled: true });
}
//# sourceMappingURL=Toast.js.map