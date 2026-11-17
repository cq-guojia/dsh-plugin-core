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
    /**
     * 整块替换头部**左侧标题区**（`icon` + `title` + `subtitle` + `headerExtra` 那一块）：
     *   · 不传 ⇒ 内置标题区
     *   · `null` ⇒ 不画标题区（`headerActions` 与 ✕ 照旧）
     *   · 其他 ReactNode ⇒ 你的标题区，库只给一层布局容器，不加内边距 / 字号 / 字重
     */
    header?: ReactNode | null;
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
     *  · 面板整块关掉**指针命中**（`pointer-events:none`），自绘元素也点不动，鼠标是禁止手势；
     *    命中落到遮罩上 —— 锁定时遮罩不是关闭路径，点它既不关窗也不穿透页面（根因解，不靠透明点击层压层级）；
     *  · 遮罩 / Esc / ✕ 三条关闭路径同时失效。
     *
     * 一律只做「或」，**永不写回调用方的 `disabled`**：本来禁用的解锁后照样禁用，锁定期间你把它改成
     * 能用 / 禁用，解锁后也照你的。不压任何灰色遮罩 —— 整块蒙一层会让人以为界面坏了。
     * 受控项，不落内部 state：关掉重开自然回到未锁。
     */
    locked?: boolean;
    /**
     * 锁定期间的例外控件（1~N 个任意 ReactNode）：整窗锁死时**只有这一块**仍可点、可 Tab，
     * 核心控件在其中也不自我禁用；其余按钮、三条关闭路径照旧封死。不传则 locked 仍是一刀切。
     *
     * 本 prop 渲染在**面板末尾**（footer 之后）。要放到头部 / footer / 正文等其他位置，用同包导出的
     * `ModalLockExempt` 就地包裹：`<ModalLockExempt><Button … /></ModalLockExempt>`，同一套机制。
     */
    lockExceptions?: ReactNode;
    /** 收起出口：例外控件调用它请求收起。核心只发事件、不结算、不隐藏 —— 隐藏由 `backgrounded` 受控。 */
    onBackground?: () => void;
    /**
     * 受控收起态（默认 false）。true = 整窗从界面隐藏但**不卸载**（输入 / 进度 / 滚动原样保留），
     * 同时撤掉 Tab / Esc 监听，避免看不见的弹窗吞键或被 Esc 关掉。还原 = 置回 false。
     */
    backgrounded?: boolean;
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
/** 在 `lockExceptions` 子树里取收起出口；无 `onBackground` 时返回 undefined（调用方可据此不渲染收起钮）。 */
export declare function useModalBackground(): (() => void) | undefined;
/**
 * 模态弹窗（自绘 overlay，**不用 react-dom 的 portal**，避免多一个必需依赖）。
 *
 * 定位：它是**呈现方式**，不是内容 —— 会话预览这类功能模块要用弹窗时用它来承载（需求文档 §4）。
 */
export declare function Modal(props: ModalProps): ReturnType<typeof h>;
//# sourceMappingURL=Modal.d.ts.map