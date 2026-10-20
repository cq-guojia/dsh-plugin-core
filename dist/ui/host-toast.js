import { createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { Official } from './official.js';
/**
 * 宿主原生 Toast（直接包 `@deepseek-ai/dsh-client-ui-primitives` 的 `Toast`）。
 *
 * 放在独立子路径 `dsh-plugin-core/ui/host` 导出，**不**经 `dsh-plugin-core/ui` 入口，
 * 避免 `ui` 入口静态 import 官方平台模块导致 Node 单测崩（旧坑）。
 * 仅用于「宿主原生」对比 demo；项目内通常请用 `notify`。
 */
export function showHostToast(message, opts) {
    if (typeof document === 'undefined')
        return;
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const close = () => {
        root.unmount();
        container.remove();
    };
    root.render(h(Official.Toast, {
        text: message,
        tone: opts?.tone,
        holdMs: opts?.holdMs ?? 3000,
        actions: opts?.actions !== undefined
            ? opts.actions.map((a) => ({ label: a.text, onClick: a.onClick }))
            : undefined,
        onDone: () => {
            close();
            opts?.onDismiss?.();
        },
    }));
}
//# sourceMappingURL=host-toast.js.map