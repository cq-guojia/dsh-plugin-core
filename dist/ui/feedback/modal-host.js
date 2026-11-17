import { createElement as h, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { ensureControls, getStyleKit } from '../infra/css.js';
import { AlertModal } from './AlertModal.js';
import { ConfirmModal } from './ConfirmModal.js';
import { isSuccess, isThenable } from '../infra/thenable.js';
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
    root.render(h(Fragment, null, entries.map((e) => h(Fragment, { key: e.id }, e.render()))));
}
function dismiss(id) {
    entries = entries.filter((e) => e.id !== id);
    flush();
}
let hostHandlers = null;
export function registerHostDialog(handlers) {
    hostHandlers = handlers;
}
// host 原生弹窗只转交固定字段（见 HostConfirmArgs / HostAlertArgs）。其余字段能传进来，
// 但宿主根本不认 —— 静默吞掉会让「同一段代码换 skin 就悄悄变行为 / 外观」。所以按白名单校验：
// 一旦有白名单外的字段被显式传了，就告警并回落 core，绝不静默降级。
const HOST_CONFIRM_FIELDS = ['title', 'message', 'confirmText', 'cancelText', 'tone', 'skin'];
const HOST_ALERT_FIELDS = ['title', 'message', 'confirmText', 'skin'];
function hostIgnoredFields(opts, allowed) {
    const ignored = [];
    for (const [key, value] of Object.entries(opts)) {
        if (value === undefined)
            continue;
        // 空数组 / 空字符串没有任何语义，等价于不传，不该被判成「不支持字段」。
        if (Array.isArray(value) && value.length === 0)
            continue;
        if (value === '')
            continue;
        // alert 的 lockExceptions 是布尔：false = 不要求例外，同样等价于不传。
        if (key === 'lockExceptions' && value === false)
            continue;
        // closeOnMask 默认就是 true（宿主本来点遮罩就关）：true 等同于不传，只有 false 才是宿主没有的能力。
        if (key === 'closeOnMask' && value === true)
            continue;
        if (!allowed.includes(key))
            ignored.push(key);
    }
    return ignored;
}
/**
 * 命令式确认框：Promise 形式，`true`=确定 / `false`=取消（或点遮罩 / Esc）。`skin:"host"` 走宿主原生 Modal。
 * 回调返回 Promise 时进入 loading（按钮转圈 + 遮罩 / Esc 锁死），settle 后才真正关闭。
 */
export function confirmModal(opts) {
    if (opts.skin === 'host') {
        const ignored = hostIgnoredFields(opts, HOST_CONFIRM_FIELDS);
        // host 只有 danger / 普通两档；warning 会静悄悄退化成普通，同样算「传了但不支持」。
        if (opts.tone !== undefined && opts.tone !== 'danger' && opts.tone !== 'primary')
            ignored.push('tone');
        if (ignored.length > 0) {
            console.warn(`[dsh-plugin-core] confirmModal skin:"host" 不支持 ${ignored.join(' / ')}，已回落到 core 皮肤；要保住 host 皮肤请去掉这些字段，或直接省掉 skin:"host" 用 core`);
        }
        if (ignored.length === 0 && hostHandlers !== null) {
            return hostHandlers.confirm({
                title: opts.title == null ? undefined : String(opts.title),
                description: opts.message == null ? undefined : String(opts.message),
                confirmText: opts.confirmText,
                cancelText: opts.cancelText,
                danger: opts.tone === 'danger',
            });
        }
        if (hostHandlers === null) {
            console.warn('[dsh-plugin-core] confirmModal skin:"host" 需先引入官方适配层 official.js，已回落到 core 皮肤');
        }
    }
    const { skin: _skin, onConfirm, onCancel, ...core } = opts;
    void _skin;
    return new Promise((resolve) => {
        const id = ++idSeq;
        let closed = false;
        const close = (result) => {
            if (closed)
                return;
            closed = true;
            dismiss(id);
            resolve(result);
        };
        // 锁只活在这条弹窗里：entry 一走、下一框自然是未锁的初始态。
        const entry = { id, locked: false, render: () => null };
        const ctl = {
            setLocked: (next) => {
                if (closed || entry.locked === next)
                    return;
                entry.locked = next;
                flush();
            },
        };
        // 「跑完关不关」归这里；转圈与锁框归 Button / ConfirmModal。把原 promise 返回给 Button 去转。
        const run = (which) => {
            if (closed)
                return undefined;
            const out = (which === 'confirm' ? onConfirm : onCancel)?.(ctl);
            // 只有明确的 false 表示「这次没成」：框留着让人重试（消费方自己去提示）
            const settle = (value) => {
                if (isSuccess(value))
                    close(which === 'confirm');
            };
            if (!isThenable(out)) {
                settle(out);
                return undefined;
            }
            // reject 也不关：按钮已自己恢复可点，错误由 Button 打到控制台
            void out.then(settle, () => { });
            return out;
        };
        entry.render = () => h(ConfirmModal, { ...core, locked: entry.locked, onConfirm: () => run('confirm'), onCancel: () => run('cancel') });
        entries.push(entry);
        flush();
    });
}
/**
 * 命令式警告框：Promise 在关闭时 resolve（单按钮，关闭即确认）。`skin:"host"` 走宿主原生 Modal。
 * 回调返回 Promise 时进入 loading（按钮转圈 + 遮罩 / Esc 锁死），settle 后才真正关闭。
 * 回调返回 `false`（同步或 resolve 成 `false`）⇒ 本次当作没成，框不关。
 */
export function alertModal(opts) {
    if (opts.skin === 'host') {
        const ignored = hostIgnoredFields(opts, HOST_ALERT_FIELDS);
        if (ignored.length > 0) {
            console.warn(`[dsh-plugin-core] alertModal skin:"host" 不支持 ${ignored.join(' / ')}，已回落到 core 皮肤；要保住 host 皮肤请去掉这些字段，或直接省掉 skin:"host" 用 core`);
        }
        if (ignored.length === 0 && hostHandlers !== null) {
            return hostHandlers.alert({
                title: opts.title == null ? undefined : String(opts.title),
                description: opts.message == null ? undefined : String(opts.message),
                confirmText: opts.confirmText,
            });
        }
        if (hostHandlers === null) {
            console.warn('[dsh-plugin-core] alertModal skin:"host" 需先引入官方适配层 official.js，已回落到 core 皮肤');
        }
    }
    const { skin: _skin, onConfirm, ...core } = opts;
    void _skin;
    return new Promise((resolve) => {
        const id = ++idSeq;
        let closed = false;
        const close = () => {
            if (closed)
                return;
            closed = true;
            dismiss(id);
            resolve();
        };
        // 同 confirmModal：锁只活在这条弹窗里，entry 一走、下一框自然是未锁的初始态。
        const entry = { id, locked: false, render: () => null };
        const ctl = {
            setLocked: (next) => {
                if (closed || entry.locked === next)
                    return;
                entry.locked = next;
                flush();
            },
        };
        // 同 confirmModal：只决定「跑完关不关」，转圈与锁框交给 Button / AlertModal。
        const run = () => {
            if (closed)
                return undefined;
            const out = onConfirm?.(ctl);
            const settle = (value) => {
                if (isSuccess(value))
                    close();
            };
            if (!isThenable(out)) {
                settle(out);
                return undefined;
            }
            void out.then(settle, () => { });
            return out;
        };
        entry.render = () => h(AlertModal, { ...core, locked: entry.locked, onConfirm: () => run() });
        entries.push(entry);
        flush();
    });
}
//# sourceMappingURL=modal-host.js.map