export type ToastVariant = 'info' | 'success' | 'error';
export interface ToastOptions {
    variant?: ToastVariant;
    /** 停留时长（毫秒），默认 2600。 */
    durationMs?: number;
    /** 整条自定义颜色（背景色）。传了就走 unstyled 自定义卡，覆盖默认语义色。 */
    color?: string;
    /** toast 消失（自动或手动关闭）后触发。 */
    onDismiss?: () => void;
}
/**
 * 弹一条轻提示（**命令式**，不要求调用方挂组件）。
 *
 * 底层用 Sonner（第三方，已作为 core 内部依赖封装，不对外 re-export）。
 * 满足：文字 / 时长 / 整条自定义色 / 消失回调；暗色跟随宿主 `body[data-ds-dark-theme]`。
 *
 * 无 `document` 时静默跳过（Node 单测 / SSR 不炸）。
 */
export declare function showToast(message: string, opts?: ToastOptions): void;
//# sourceMappingURL=Toast.d.ts.map