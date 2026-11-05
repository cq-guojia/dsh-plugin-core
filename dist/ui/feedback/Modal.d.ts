import { createElement as h, type ReactNode } from 'react';
import { type Translate } from '../../utils/i18n.js';
/** 弹窗尺寸档：sm≈确认框 / md(默认) / lg 大窗。 */
export type ModalSize = 'sm' | 'md' | 'lg';
export interface ModalProps {
    /** 头部左侧图标位（可不传）。 */
    icon?: ReactNode;
    title?: ReactNode;
    /**
     * 标题**下方**的副标题行（等宽小字；会话预览的 sessionId 就放这里 —— 用户 2026-10-22：
     * 标识属于标题区，不占正文）。与标题同宽、可换行。
     */
    subtitle?: ReactNode;
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
    /**
     * 有异步在跑（如 footer 里的 `Button` 正在 loading）：为真时遮罩 / Esc / ✕ **三条关闭路径全失效**，
     * 内容照常渲染。与 `closeOnMask` / `escClose` / `closable` 是"与"关系 —— 它是否决项，不替代它们。
     */
    busy?: boolean;
    /**
     * **锁死全部交互**（与 loading 解耦：按钮转不转圈是另一回事）。为真时：
     *  · 面板内的核心控件各自按**自己的禁用态**渲染（灰掉、点不动、Tab 跳过）；
     *  · 面板上盖一层**全透明**的点击层，消费方自绘的元素也跟着点不动，鼠标是禁止手势；
     *  · 遮罩 / Esc / ✕ 三条关闭路径同时失效。
     *
     * 一律只做「或」，**永不写回调用方的 `disabled`**：本来禁用的解锁后照样禁用，锁定期间你把它改成
     * 能用 / 禁用，解锁后也照你的。不压任何灰色遮罩 —— 整块蒙一层会让人以为界面坏了。
     * 受控项，不落内部 state：关掉重开自然回到未锁。
     */
    locked?: boolean;
    /** 尺寸档：sm=小确认框家族 / md·lg=大弹窗家族；也可用 width/height 精确覆盖。 */
    size?: ModalSize;
    /** 面板宽度（默认随 size：sm 360px / md 720px / lg 1120px，均带视口兜底）。 */
    width?: string;
    /** 面板高度（默认仅 lg 有：calc(100% - 80px)，同兄弟项目大弹窗）。 */
    height?: string;
    /** 面板最大宽度 / 最大高度覆盖（不传走 size 默认）。 */
    maxWidth?: string;
    maxHeight?: string;
    /** 不渲染头部（沉浸式 / 无标题场景）。 */
    hideHeader?: boolean;
    footer?: ReactNode;
    /**
     * footer **左侧**的一行过程提示（换字即翻牌，太长省略、hover 跑马灯）。
     * 不传 = 不占位、与以前完全一样；传了就自动出现（footer 也可不给，它会自己撑起底栏）。
     * 换文案只改这个值，动效由 `FlipText` 负责。
     */
    notice?: string;
    /** footer 上面那条分隔线（默认 true）。传 false 关闭；sm 确认框家族本来就没有。 */
    footerDivider?: boolean;
    /** 追加 class（只允许补布局 / 视觉修饰，不许覆盖皮肤）。 */
    className?: string;
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