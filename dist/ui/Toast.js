import { ensureControls } from './css.js';
const HOST_ID = 'dsh-tdt-toast-host';
const DEFAULT_MS = 2600;
/**
 * 弹一条轻提示（**命令式**，不要求调用方挂组件）。
 *
 * 为什么不走 React Context：toast 常在数据层 / 回调里触发，拿不到组件树；
 * 直接操作一个固定容器最简单，且无 document 时静默跳过（SSR / 单测不炸）。
 */
export function showToast(message, opts) {
    if (typeof document === 'undefined')
        return;
    ensureControls();
    const variant = opts?.variant ?? 'info';
    const host = ensureHost();
    const el = document.createElement('div');
    el.className = `dsh-tdt-toast${variant === 'info' ? '' : ` dsh-tdt-toast--${variant}`}`;
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => {
        el.remove();
        // 容器空了就撤掉，别在页面上留一个空壳
        if (host.childElementCount === 0)
            host.remove();
    }, opts?.durationMs ?? DEFAULT_MS);
}
function ensureHost() {
    const found = document.getElementById(HOST_ID);
    if (found !== null)
        return found;
    const host = document.createElement('div');
    host.id = HOST_ID;
    host.className = 'dsh-tdt-toast-host';
    document.body.appendChild(host);
    return host;
}
//# sourceMappingURL=Toast.js.map