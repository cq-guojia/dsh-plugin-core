export interface HostToastAction {
    text: string;
    onClick: () => void;
}
export interface HostToastOptions {
    /** 仅宿主原生支持 'success' 一个语义色；不传则是默认中性条。 */
    tone?: 'success';
    /** 停留时长（毫秒），默认 3000。 */
    holdMs?: number;
    /** 右侧动作（宿主原生渲染为蓝色可点文字）。 */
    actions?: HostToastAction[];
    /** 淡出完成后触发。 */
    onDismiss?: () => void;
}
/**
 * 宿主原生 Toast（直接包 `@deepseek-ai/dsh-client-ui-primitives` 的 `Toast`）。
 *
 * 放在独立子路径 `dsh-plugin-core/ui/host` 导出，**不**经 `dsh-plugin-core/ui` 入口，
 * 避免 `ui` 入口静态 import 官方平台模块导致 Node 单测崩（旧坑）。
 * 仅用于「宿主原生」对比 demo；项目内通常请用 `notify`。
 */
export declare function showHostToast(message: string, opts?: HostToastOptions): void;
//# sourceMappingURL=host-toast.d.ts.map