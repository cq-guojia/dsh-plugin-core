import { Component, type ErrorInfo, type ReactNode } from 'react';
import { type Translate } from '../utils/i18n.js';
export interface ErrorBoundaryProps {
    children?: ReactNode;
    /** 兜底渲染；不传就用内置错误块（带「重试」）。 */
    fallback?: (error: Error, retry: () => void) => ReactNode;
    onError?: (error: Error, info: ErrorInfo) => void;
    translate?: Translate;
}
interface State {
    error: Error | null;
}
/** 错误边界：子组件渲染抛错时不让整个插件白屏。 */
export declare class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
    state: State;
    static getDerivedStateFromError(error: Error): State;
    componentDidCatch(error: Error, info: ErrorInfo): void;
    private readonly retry;
    render(): ReactNode;
}
export {};
//# sourceMappingURL=ErrorBoundary.d.ts.map