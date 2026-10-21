import { createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster, toast } from 'sonner';
import { Button } from './Button.js';
import { claimToastHost } from './toast-host.js';
const DEFAULT_MS = 2600;
const ROOT_ID = 'dshpc-toast-root';
// 宿主暗色判据是 body[data-ds-dark-theme]（不是 prefers-color-scheme），
// Sonner 的 theme 必须显式传，故从这里读并监听变化。
function currentTheme() {
    return document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light';
}
// ── 跨副本共享宿主 ──
// core 被打进每个插件 bundle，本模块的 root / position 等状态各副本一份；同页多插件
// 会各挂一个同 id 容器 + 一个 Toaster，叠在同一屏位。sonner 的 toast() / toast.custom()
// 是模块级 store（B 副本调自己 bundle 的 sonner，事件只进 B 的 store），所以只能共享
// 「命令式入口」、不能共享 React root：由先到场的副本建宿主，其余副本交给它渲染。
let sharedHost = null;
function toasterHost() {
    if (sharedHost !== null)
        return sharedHost;
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined')
        return null;
    sharedHost = claimToastHost(createToasterHost);
    return sharedHost;
}
function createToasterHost() {
    let root = null;
    let themeObserver = null;
    let position = 'bottom-center';
    function renderToaster() {
        if (root === null)
            return;
        root.render(h(Toaster, {
            theme: currentTheme(),
            position,
            // richColors：success=绿整条 / error=红整条 / warning=黄整条（Sonner 自带）；
            // 不开 closeButton：在宿主里吃不到 Sonner 的 CSS 变量，会渲染成白底方块叉（真机踩过）。
            richColors: true,
        }));
    }
    // 全局唯一 Toaster：命令式 toast() 需要一个挂着的 Toaster 才能渲染。
    function ensureToaster() {
        if (root !== null)
            return;
        // 双闸：容器可能已被他人建过（重复 DOM id 会破坏 getElementById 语义）。
        let container = document.getElementById(ROOT_ID);
        if (container === null) {
            container = document.createElement('div');
            container.id = ROOT_ID;
            document.body.appendChild(container);
        }
        root = createRoot(container);
        renderToaster();
        themeObserver = new MutationObserver(() => renderToaster());
        themeObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-ds-dark-theme'],
        });
    }
    function showNative(payload) {
        const duration = payload.durationMs;
        const onDismiss = payload.onDismiss;
        if (payload.color !== undefined) {
            toast(payload.message, {
                duration,
                unstyled: true,
                onDismiss,
                className: 'dshpc-toast-custom',
                style: {
                    background: payload.color,
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
        const variant = payload.variant;
        if (variant === 'success') {
            toast.success(payload.message, { duration, onDismiss });
        }
        else if (variant === 'error') {
            toast.error(payload.message, { duration, onDismiss });
        }
        else if (variant === 'warning') {
            toast.warning(payload.message, { duration, onDismiss });
        }
        else {
            toast(payload.message, { duration, onDismiss });
        }
    }
    function showCard(payload) {
        const palette = notifyPalette(payload.variant, currentTheme());
        const duration = payload.durationMs;
        const actions = payload.actions;
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
        }, palette.glyph), h('div', { style: { flex: 1, minWidth: 0 } }, h('div', { style: { fontWeight: 600 } }, payload.message), payload.description !== undefined
            ? h('div', { style: { opacity: 0.9, fontSize: '13px', marginTop: '2px' } }, payload.description)
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
    return {
        show(payload) {
            ensureToaster();
            renderToaster(); // 应用最新 position / theme（root 已存在时也要重渲染）
            if (payload.style === 'card')
                showCard(payload);
            else
                showNative(payload);
        },
        setPosition(next) {
            position = next;
            renderToaster();
        },
    };
}
/**
 * 官方 Sonner 原生提示（**命令式**）。用于「官方的」对比 demo 与需要 Sonner 原味的场景。
 * 变体：info（中性卡）/ success（绿）/ error（红）/ warning（黄，richColors）。
 * 无 `document` 时静默跳过（Node 单测 / SSR 不炸）。
 */
export function showToast(message, opts) {
    if (typeof document === 'undefined')
        return;
    const host = toasterHost();
    if (host === null)
        return;
    if (opts?.position !== undefined)
        host.setPosition(opts.position);
    host.show({
        message,
        variant: opts?.variant ?? 'info',
        style: 'native',
        durationMs: opts?.durationMs ?? DEFAULT_MS,
        color: opts?.color,
        onDismiss: opts?.onDismiss,
    });
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
    const host = toasterHost();
    if (host === null)
        return;
    if (opts?.position !== undefined)
        host.setPosition(opts.position);
    host.show({
        message,
        variant: opts?.variant ?? 'info',
        style: 'card',
        description: opts?.description,
        durationMs: opts?.durationMs ?? DEFAULT_MS,
        actions: opts?.actions,
    });
}
//# sourceMappingURL=Toast.js.map