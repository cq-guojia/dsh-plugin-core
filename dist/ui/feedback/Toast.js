/**
 * Toast 的界面（**唯一允许 import sonner / React 的一层**）。
 *
 * 它订阅 `toast-queue` 的投递并绘制；不发送提示、不认识通知中心的内部结构。
 * 页面加载时调一次 `mountToasts()` 挂上界面，之后 `notify()` / `showToast()` 只投递数据。
 */
import { createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster, toast } from 'sonner';
import { Button } from '../actions/Button.js';
import { FontIcon } from '../display/font-icon.js';
import { claimToastHost } from './toast-host.js';
import { subscribeToasts, } from './toast-queue.js';
const ROOT_ID = 'dshpc-toast-root';
// 宿主暗色判据是 body[data-ds-dark-theme]（不是 prefers-color-scheme），
// Sonner 的 theme 必须显式传，故从这里读并监听变化。
function currentTheme() {
    return document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light';
}
// core 被打进每个插件 bundle，sonner 的 store 是模块级（各副本一份），所以只能共享
// 「宿主」：先到场的副本建，其余副本把 payload 交给它渲染。
/** 挂上提示界面：建唯一容器 + Toaster，并订阅投递队列。无 DOM 环境直接跳过。 */
export function mountToasts() {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined')
        return;
    claimToastHost(createToasterHost);
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
        }, h(FontIcon, { name: palette.glyph, size: 13 })), h('div', { style: { flex: 1, minWidth: 0 } }, h('div', { style: { fontWeight: 600 } }, payload.message), payload.description !== undefined
            ? h('div', { style: { opacity: 0.9, fontSize: '13px', marginTop: '2px', whiteSpace: 'pre-line' } }, payload.description)
            : null), actions !== undefined && actions.length > 0
            ? h('div', { style: { display: 'flex', gap: '8px', flexShrink: 0 } }, ...actions.slice(0, 2).map((a) => {
                // 绿色成功态：卡里的动作钮一律用 surface-2（中性浅面），不再用蓝。
                // 判据只看 toast 的 variant —— 调用方常显式写 variant:'info'，那正是要换掉的蓝钮，
                // 不能因为它「显式给过」就跳过。其余态沿用调用方指定 / 默认 info（蓝）。
                const successSurface = payload.variant === 'success';
                return h(Button, {
                    variant: successSurface ? 'secondary' : (a.variant ?? 'info'),
                    ...(successSurface ? { color: 'var(--dshpc-surface-2)' } : {}),
                    size: 'md',
                    onClick: () => {
                        a.onClick();
                        toast.dismiss(id);
                    },
                }, a.text);
            }))
            : null), { duration, unstyled: true });
    }
    const host = {
        show(payload) {
            if (payload.position !== undefined)
                position = payload.position;
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
    // 容器只建一次 ⇒ 订阅也只挂一次（多副本共享同一个宿主，不会一条消息弹多次）。
    subscribeToasts((payload) => { host.show(payload); });
    return host;
}
// 我们封装卡片的配色：info 走灰（不是纯黑，随明暗切换）；其余用整条语义色。
function notifyPalette(variant, theme) {
    switch (variant) {
        case 'success':
            return { bg: '#16a34a', fg: '#ffffff', glyph: 'common.base:gou' };
        // error / warning 用哑光降饱和档：实心卡上加透明度会透出底层内容、伤可读性，
        // 故改为压暗一档的色相（设计师口径：冷静的严重度，而非警报荧光）。
        case 'error':
            return { bg: '#c0392b', fg: '#ffffff', glyph: 'common.base:guanbi' };
        case 'warning':
            return { bg: '#e0922f', fg: '#1f2937', glyph: 'common.base:warn' };
        default:
            return theme === 'dark'
                ? { bg: '#3f3f46', fg: '#fafafa', glyph: 'common.base:info' }
                : { bg: '#f4f4f5', fg: '#18181b', glyph: 'common.base:info' };
    }
}
//# sourceMappingURL=Toast.js.map