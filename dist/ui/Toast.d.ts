export type ToastVariant = 'info' | 'success' | 'error';
/**
 * 弹一条轻提示（**命令式**，不要求调用方挂组件）。
 *
 * 为什么不走 React Context：toast 常在数据层 / 回调里触发，拿不到组件树；
 * 直接操作一个固定容器最简单，且无 document 时静默跳过（SSR / 单测不炸）。
 */
export declare function showToast(message: string, opts?: {
    variant?: ToastVariant;
    durationMs?: number;
}): void;
//# sourceMappingURL=Toast.d.ts.map