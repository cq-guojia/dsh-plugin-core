import { createElement as h, type ReactNode } from 'react';
import { type Translate } from '../utils/i18n.js';
/** 弹窗尺寸档：sm≈确认框 / md(默认) / lg 大窗。 */
export type ModalSize = 'sm' | 'md' | 'lg';
export interface ModalProps {
    /** 头部左侧图标位（可不传）。 */
    icon?: ReactNode;
    title?: ReactNode;
    /** 标题右侧小块：数字 / 标签（ReactNode；demo 用 Chip 演示）。 */
    headerExtra?: ReactNode;
    /** 头部右侧动作区：关闭钮之外的更多按钮（ReactNode）。 */
    headerActions?: ReactNode;
    /** 关闭回调；不传则 ✕ 不显示（必须自己给关闭路径）。 */
    onClose?: () => void;
    /** 是否显示右上角 ✕（默认 = `onClose` 是否传入）。确认框传 false 即可去掉小叉。 */
    closable?: boolean;
    /** 点遮罩是否关闭（默认 true；误触代价大的场景设 false）。 */
    closeOnMask?: boolean;
    /** 按 Esc 是否关闭（默认 true）。 */
    escClose?: boolean;
    /** 尺寸档：sm≈确认框 / md(默认) / lg 大窗；也可直接传 maxWidth 精确覆盖。 */
    size?: ModalSize;
    /** 面板最大宽度，默认随 size（sm 420px / md min(960px,92vw) / lg min(1200px,94vw)）。 */
    maxWidth?: string;
    /** 不渲染头部（沉浸式 / 无标题场景）。 */
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