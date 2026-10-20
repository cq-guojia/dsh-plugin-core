// 两个命令式能力（用户 2026-10-20 定义）—— explorer 的对外入口：
//
//  · 方法 A `openFilePreview`：传文件/文件夹路径，打开右侧停靠预览（可拖宽、Esc 关）；
//  · 方法 B `pickWorkspaceFile`：Promise 返回选中的工作区相对路径（弹窗在锚点按钮旁弹出，
//    Esc / 点外部 / ✕ 关，选中即 resolve）。
//
// 两者共用同一套 FileBrowser 面板（用户拍板：同一套内容，两种展现形式）。
// 挂载模式照 ui/modal-host.ts：自建 container + createRoot，关闭即卸载回收，不残留空根。
import { createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { ensureControls, getStyleKit } from '../ui/css.js';
import { startResizeLayoutWidth } from '../ui/resizer.js';
import { FileBrowser } from './FileBrowser.js';
/** 预览侧边栏的挂载容器 id（全站唯一，重复打开先关旧的）。 */
const PREVIEW_HOST_ID = 'dshpc-file-preview-host';
/** 打开工作区文件/文件夹的停靠预览；重复打开会关掉上一个（同侧边栏位）。 */
export function openFilePreview(options) {
    if (typeof document === 'undefined')
        return null;
    // 同位置只允许一个预览：先关旧的
    const previous = document.getElementById(PREVIEW_HOST_ID);
    if (previous !== null)
        previous.remove();
    const container = document.createElement('div');
    container.id = PREVIEW_HOST_ID;
    container.setAttribute('data-dshpc-file-preview', '');
    container.style.cssText =
        'position:fixed;top:0;right:0;bottom:0;z-index:1050;display:flex;' +
            `width:${options.width ?? 460}px;max-width:100vw;background:var(--dshpc-surface-1,#fff);` +
            'border-left:1px solid var(--dshpc-border,#d0d7de);box-shadow:var(--dshpc-shadow-2,none)';
    document.body.appendChild(container);
    let closed = false;
    const root = createRoot(container);
    const close = () => {
        if (closed)
            return;
        closed = true;
        window.removeEventListener('keydown', onKeyDown);
        root.unmount();
        container.remove();
        options.onClose?.();
    };
    const onKeyDown = (event) => {
        if (event.key === 'Escape')
            close();
    };
    window.addEventListener('keydown', onKeyDown);
    ensureControls(getStyleKit());
    root.render(h(FileBrowser, {
        workspaceFiles: options.workspaceFiles,
        officeToPdf: options.officeToPdf ?? null,
        sessionId: options.sessionId,
        path: options.path,
        rootName: options.rootName,
        rootCache: options.rootCache,
        dock: true,
        onClose: close,
        onResizeStart: (event) => {
            const min = options.minWidth ?? 320;
            const max = Math.max(min, Math.round(window.innerWidth * 0.7));
            startResizeLayoutWidth({
                startEvent: event,
                root: container,
                rootClass: 'dshpc-fb--resizing',
                rafThrottle: true,
                compute: (clientX) => {
                    const w = (options.width ?? 460) + (event.clientX - clientX);
                    return Math.min(max, Math.max(min, w));
                },
                onMove: (width) => {
                    container.style.width = `${width}px`;
                },
                onCommit: (width) => {
                    container.style.width = `${width}px`;
                },
            });
        },
        style: { flex: '1 1 auto', minWidth: 0, minHeight: 0 },
    }));
    return { close, path: options.path };
}
/** 弹窗宽度（源实现 480，用户 2026-09-29 微调定值）。 */
const PICKER_WIDTH = 480;
/** 弹窗高度上限 / 保底。 */
const PICKER_MAX_H = 660;
const PICKER_MIN_H = 240;
/**
 * 弹出「选择工作区文件」模态弹窗，Promise 返回选中结果；取消（Esc / 点外部 / ✕）resolve `null`。
 * 关闭路径与 portal 浮层菜单不冲突：点外部用**整屏 backdrop** 接——官方 Menu 的 portal
 * 层级在 backdrop 之上，点菜单项不会误判为「点外部」（源实现自实现点外检测踩过的坑）。
 */
export function pickWorkspaceFile(options) {
    return new Promise((resolve) => {
        if (typeof document === 'undefined') {
            resolve(null);
            return;
        }
        let settled = false;
        const backdrop = document.createElement('div');
        backdrop.setAttribute('data-dshpc-picker-backdrop', '');
        backdrop.style.cssText = 'position:fixed;inset:0;z-index:1099;background:rgba(0,0,0,0.28)';
        const panel = document.createElement('div');
        panel.setAttribute('data-dshpc-picker-panel', '');
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        const anchor = options.anchor ?? null;
        if (anchor !== null) {
            const rect = anchor.getBoundingClientRect();
            panel.style.cssText =
                'position:fixed;z-index:1100;display:flex;flex-direction:column;overflow:hidden;' +
                    `right:${Math.max(12, window.innerWidth - rect.left)}px;` +
                    `bottom:${Math.max(12, window.innerHeight - rect.bottom)}px;` +
                    `width:min(${PICKER_WIDTH}px,calc(100vw - 24px));` +
                    `height:${Math.min(PICKER_MAX_H, Math.max(PICKER_MIN_H, rect.top - 12))}px;` +
                    'background:var(--dshpc-surface-2,#fff);border:1px solid var(--dshpc-border,#d0d7de);' +
                    'border-radius:8px;box-shadow:var(--dshpc-shadow-2,none)';
        }
        else {
            panel.style.cssText =
                'position:fixed;z-index:1100;display:flex;flex-direction:column;overflow:hidden;' +
                    `width:min(${PICKER_WIDTH}px,calc(100vw - 24px));height:${PICKER_MAX_H}px;` +
                    'background:var(--dshpc-surface-2,#fff);border:1px solid var(--dshpc-border,#d0d7de);' +
                    'border-radius:8px;box-shadow:var(--dshpc-shadow-2,none)';
        }
        const finish = (result) => {
            if (settled)
                return;
            settled = true;
            window.removeEventListener('keydown', onKeyDown);
            backdrop.remove();
            root.unmount();
            panel.remove();
            if (result === null)
                options.onCancel?.();
            resolve(result);
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                finish(null);
        };
        backdrop.addEventListener('click', () => finish(null));
        window.addEventListener('keydown', onKeyDown);
        document.body.appendChild(backdrop);
        document.body.appendChild(panel);
        ensureControls(getStyleKit());
        const root = createRoot(panel);
        root.render(h(FileBrowser, {
            workspaceFiles: options.workspaceFiles,
            officeToPdf: options.officeToPdf ?? null,
            sessionId: options.sessionId,
            path: '',
            rootName: options.rootName,
            rootCache: options.rootCache,
            workspaces: options.workspaces,
            onSelectWorkspace: options.onSelectWorkspace,
            picker: true,
            filter: options.filter,
            onPick: (path, isDir) => finish({ path, isDir }),
            onClose: () => finish(null),
            style: { flex: '1 1 auto', width: '100%', minWidth: 0, minHeight: 0 },
        }));
    });
}
//# sourceMappingURL=open.js.map