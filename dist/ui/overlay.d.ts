/**
 * 浮层公共件 —— Modal 与 SideSheet 共用，**别各写一份**。
 *
 * 抽出来的判据：这两件在两种浮层里完全同构（遮罩让位分栏、头部四槽、Esc 判定），
 * 差异只在「面板怎么排」（居中 vs 贴边），那部分留在各自的控件里。
 */
import { type ReactNode } from 'react';
/**
 * Esc 关闭。不传 `onClose` 或 `enabled=false` 时完全不挂监听
 * （无回调还挂监听，等于让 Esc 被白白吃掉）。
 */
export declare function useEscapeClose(enabled: boolean, onClose: (() => void) | undefined): void;
/** 浮层档：center = 居中弹窗；side = 贴边抽屉（z 更低，见 overlay.css）。 */
export type OverlayKind = 'center' | 'side';
export interface OverlayMaskProps {
    kind: OverlayKind;
    /** 点遮罩是否关闭。 */
    closeOnMask: boolean;
    onClose?: () => void;
    children?: ReactNode;
}
/** 遮罩 + 承载盒。右边界让位分栏的规则只有这一份。 */
export declare function OverlayMask(props: OverlayMaskProps): ReactNode;
export interface OverlayHeadProps {
    icon?: ReactNode;
    title?: ReactNode;
    /** 标题**下方**的副标题行（等宽小字）。 */
    subtitle?: ReactNode;
    /** 标题**同一行**右侧的小块（徽标 / 计数）。 */
    extra?: ReactNode;
    /** 头部右侧动作区（关闭钮之外）。 */
    actions?: ReactNode;
    /** 关闭钮的无障碍名（走调用方的内置字典）。 */
    closeLabel: string;
    /** 不传则不出关闭钮（调用方没给关闭路径时不该出现小叉）。 */
    onClose?: () => void;
}
/** 头部四槽：icon + 标题组 + 右侧动作 + 关闭钮。 */
export declare function OverlayHead(props: OverlayHeadProps): ReactNode;
//# sourceMappingURL=overlay.d.ts.map