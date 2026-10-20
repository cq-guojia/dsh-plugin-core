import { type ButtonVariant } from './Button.js';
export type ToastVariant = 'info' | 'success' | 'error' | 'warning';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export interface ToastOptions {
    variant?: ToastVariant;
    /** 停留时长（毫秒），默认 2600。 */
    durationMs?: number;
    /** 整条自定义颜色（背景色）。传了就走 unstyled 自定义卡，覆盖默认语义色。 */
    color?: string;
    /** toast 消失（自动或手动关闭）后触发。 */
    onDismiss?: () => void;
    /** 出现位置（作用于全局唯一 Toaster），默认 'bottom-center'。 */
    position?: ToastPosition;
}
/** 封装好的提示：右侧动作按钮（用我们自己的 Button 样式）。 */
export interface ToastAction {
    text: string;
    /** 按钮样式（我们的 ButtonVariant），默认 'outline'。 */
    variant?: ButtonVariant;
    onClick: () => void;
}
export interface NotifyOptions {
    variant?: ToastVariant;
    /** 次要说明文字（标题下方）。 */
    description?: string;
    durationMs?: number;
    position?: ToastPosition;
    /** 右侧 1–2 个动作按钮；传了就走我们封装的卡片样式并渲染按钮。 */
    actions?: ToastAction[];
}
/**
 * 官方 Sonner 原生提示（**命令式**）。用于「官方的」对比 demo 与需要 Sonner 原味的场景。
 * 变体：info（中性卡）/ success（绿）/ error（红）/ warning（黄，richColors）。
 * 无 `document` 时静默跳过（Node 单测 / SSR 不炸）。
 */
export declare function showToast(message: string, opts?: ToastOptions): void;
/**
 * 我们封装好的提示（**推荐项目内使用**）：统一卡片样式（灰/绿/红/黄，跟随明暗皮肤），
 * 右侧可挂 1–2 个**我们自己的 Button** 动作按钮，点击后自动关闭并调用你的事件。
 *
 * 底层仍是 Sonner（动画 / 定位 / 堆叠），但视觉与交互是我们定制的。
 * 无 `document` 时静默跳过。
 */
export declare function notify(message: string, opts?: NotifyOptions): void;
//# sourceMappingURL=Toast.d.ts.map