/**
 * 侧边抽屉（SideSheet）—— 从屏幕左/右缘滑入的**覆盖式**浮层。
 *
 * 与 PanelDock 的关系（用户 2026-11-02 定）：**皮肤一模一样**（同一份 side-panel.css：
 * 头部、拖拽条、关闭钮、背景阴影、入场动画），宽度也能拖；差别只有两点：
 *   · PanelDock 是布局成员（sticky 占宽、挤窄主区，调用方必须给挂载点）；
 *   · SideSheet 是浮层（absolute 贴边、盖住页面，自铺遮罩，不需要挂载点）；
 *   · SideSheet **没有收起**（没有耳朵、没有收起钮）—— 关就是关。
 *
 * 开关行为与 Modal 一致：渲染即显示（`{open && <SideSheet … />}`）、点遮罩 / Esc / ✕ 都能关，
 * 三者都可关掉；遮罩与 Esc 判定走 overlay.ts 的公共件。
 */
import { createElement as h, type ReactNode } from 'react';
import { type Translate } from '../utils/i18n.js';
/** 从哪一侧滑入。默认 `left`。 */
export type SideSheetSide = 'left' | 'right';
export interface SideSheetProps {
    /** 贴哪条边、从哪边滑入（默认 `left`）。 */
    side?: SideSheetSide;
    /** 内置头的标题。 */
    title?: ReactNode;
    /** 标题前的图标位。 */
    icon?: ReactNode;
    /** 标题**右侧**的任意内容（按钮、标签、下拉……）。 */
    extra?: ReactNode;
    /**
     * 整块替换头部：
     *   · 不传 ⇒ 内置头（`icon` + `title` + `extra`）
     *   · `null` ⇒ 不要头部（关闭钮自动浮到右上角）
     *   · 其他 ReactNode ⇒ 你的头部，库不加内边距/边框/背景
     */
    header?: ReactNode | null;
    /** 是否显示关闭钮（默认 true）。 */
    closable?: boolean;
    /** 自定义关闭图标（默认 ✕）。 */
    closeIcon?: ReactNode;
    /** 关闭回调；不传则不出关闭钮（必须自己给关闭路径）。 */
    onClose?: () => void;
    /** 点遮罩是否关闭（默认 true）。 */
    closeOnMask?: boolean;
    /** 按 Esc 是否关闭（默认 true）。 */
    escClose?: boolean;
    /** **初始**宽度（px，默认 460，与 PanelDock 同档）；拖过之后以拖出来的为准。 */
    width?: number;
    /** 可拖宽的下限（默认 320）。 */
    minWidth?: number;
    /** 可拖宽的上限；不传 = 只受遮罩盒宽度约束。 */
    maxWidth?: number;
    /** 能否拖宽（默认 true）。 */
    resizable?: boolean;
    footer?: ReactNode;
    children?: ReactNode;
    translate?: Translate;
}
export declare function SideSheet(props: SideSheetProps): ReturnType<typeof h>;
//# sourceMappingURL=SideSheet.d.ts.map