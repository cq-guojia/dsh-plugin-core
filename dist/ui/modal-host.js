import { createElement as h, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { ensureControls, getStyleKit } from './css.js';
import { AlertModal } from './AlertModal.js';
import { ConfirmModal } from './ConfirmModal.js';
// ⚠️ core 的 StyleKit / i18n 都是**模块级单例**（见 css.ts 注释），不依赖 React Context，
// 所以命令式弹窗所在的独立 root 天然能读到它们——无需手动注入插件上下文。
// 唯一读不到的是「插件自己定义的 React Context」，那是用户的私有环境，命令式本就不继承。
let hostRoot = null;
let hostContainer = null;
let entries = [];
let idSeq = 0;
/** 取（懒建）常驻挂载根；非浏览器环境返回 null。 */
function getHostRoot() {
    if (typeof document === 'undefined')
        return null;
    if (hostRoot === null) {
        hostContainer = document.createElement('div');
        hostContainer.setAttribute('data-dshpc-modal-host', '');
        document.body.appendChild(hostContainer);
        hostRoot = createRoot(hostContainer);
    }
    return hostRoot;
}
/** 重渲染当前堆叠；空了就卸载回收，不残留空根。 */
function flush() {
    const root = getHostRoot();
    if (root === null)
        return;
    ensureControls(getStyleKit());
    if (entries.length === 0) {
        root.unmount();
        hostContainer?.remove();
        hostRoot = null;
        hostContainer = null;
        return;
    }
    root.render(h(Fragment, null, entries.map((e) => e.node)));
}
function dismiss(id) {
    entries = entries.filter((e) => e.id !== id);
    flush();
}
let hostHandlers = null;
export function registerHostDialog(handlers) {
    hostHandlers = handlers;
}
function isThenable(value) {
    if (value === null || value === undefined)
        return false;
    return typeof value.then === 'function';
}
/**
 * 命令式确认框：Promise 形式，`true`=确定 / `false`=取消（或点遮罩 / Esc）。`skin:"host"` 走宿主原生 Modal。
 * 回调返回 Promise 时进入 loading（按钮转圈 + 遮罩 / Esc 锁死），settle 后才真正关闭。
 */
export function confirmModal(opts) {
    if (opts.skin === 'host') {
        if (hostHandlers !== null) {
            return hostHandlers.confirm({
                title: opts.title == null ? undefined : String(opts.title),
                description: opts.message == null ? undefined : String(opts.message),
                confirmText: opts.confirmText,
                cancelText: opts.cancelText,
                danger: opts.tone === 'danger',
            });
        }
        console.warn('[dsh-plugin-core] confirmModal skin:"host" 需先引入官方适配层 official.js，已回落到 core 皮肤');
    }
    const { skin: _skin, onConfirm, onCancel, ...core } = opts;
    void _skin;
    return new Promise((resolve) => {
        const id = ++idSeq;
        const entry = { id, node: null };
        let busy = null;
        let closed = false;
        const draw = () => {
            entry.node = h(ConfirmModal, {
                ...core,
                confirmLoading: busy === 'confirm',
                cancelLoading: busy === 'cancel',
                onConfirm: () => void run('confirm'),
                onCancel: () => void run('cancel'),
            });
            flush();
        };
        const close = (result) => {
            closed = true;
            dismiss(id);
            resolve(result);
        };
        const run = async (which) => {
            if (closed || busy !== null)
                return;
            const out = (which === 'confirm' ? onConfirm : onCancel)?.();
            if (!isThenable(out)) {
                close(which === 'confirm');
                return;
            }
            busy = which;
            draw();
            try {
                await out;
            }
            catch (err) {
                // 失败：撤回 loading，框留着让人重试 / 取消；错误照常暴露出来，不吞。
                busy = null;
                draw();
                console.error('[dsh-plugin-core] confirmModal 回调失败，弹窗已恢复可操作：', err);
                return;
            }
            busy = null;
            close(which === 'confirm');
        };
        entries.push(entry);
        draw();
    });
}
/**
 * 命令式警告框：Promise 在关闭时 resolve（单按钮，关闭即确认）。`skin:"host"` 走宿主原生 Modal。
 * 回调返回 Promise 时进入 loading（按钮转圈 + 遮罩 / Esc 锁死），settle 后才真正关闭。
 */
export function alertModal(opts) {
    if (opts.skin === 'host') {
        if (hostHandlers !== null) {
            return hostHandlers.alert({
                title: opts.title == null ? undefined : String(opts.title),
                description: opts.message == null ? undefined : String(opts.message),
                confirmText: opts.confirmText,
            });
        }
        console.warn('[dsh-plugin-core] alertModal skin:"host" 需先引入官方适配层 official.js，已回落到 core 皮肤');
    }
    const { skin: _skin, onConfirm, ...core } = opts;
    void _skin;
    return new Promise((resolve) => {
        const id = ++idSeq;
        const entry = { id, node: null };
        let busy = false;
        const draw = () => {
            entry.node = h(AlertModal, { ...core, confirmLoading: busy, onConfirm: () => void run() });
            flush();
        };
        const close = () => {
            dismiss(id);
            resolve();
        };
        const run = async () => {
            if (busy)
                return;
            const out = onConfirm?.();
            if (!isThenable(out)) {
                close();
                return;
            }
            busy = true;
            draw();
            try {
                await out;
            }
            catch (err) {
                busy = false;
                draw();
                console.error('[dsh-plugin-core] alertModal 回调失败，弹窗已恢复可操作：', err);
                return;
            }
            busy = false;
            close();
        };
        entries.push(entry);
        draw();
    });
}
//# sourceMappingURL=modal-host.js.map