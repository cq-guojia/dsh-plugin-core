import { createElement as h, type ReactNode } from 'react';
import { type Translate } from '../utils/i18n.js';
export interface ModalProps {
    title?: ReactNode;
    /** 关闭回调；不传就不显示关闭钮（必须自己给关闭路径）。 */
    onClose?: () => void;
    /** 点遮罩是否关闭（默认 true；误触代价大的场景设 false）。 */
    closeOnMask?: boolean;
    /** 按 Esc 是否关闭（默认 true）。 */
    escClose?: boolean;
    /** 面板最大宽度，默认 `min(960px, 92vw)`。 */
    maxWidth?: string;
    /** 不传 `title` 且传这个为 true ⇒ 不渲染头部（沉浸式场景）。 */
    hideHeader?: boolean;
    footer?: ReactNode;
    children?: ReactNode;
    translate?: Translate;
}
/**
 * 模态弹窗（自绘 overlay，**不用 react-dom 的 portal**，避免多一个必需依赖）。
 *
 * 定位：它是**呈现方式**，不是内容 —— 会话预览这类功能模块要用弹窗时用它来承载（需求文档 §4）。
 */
export declare function Modal(props: ModalProps): ReturnType<typeof h>;
//# sourceMappingURL=Modal.d.ts.map