/**
 * 浮层公共件 —— Modal 与 SideSheet 共用，**别各写一份**。
 *
 * 抽出来的判据：这两件在两种浮层里完全同构（遮罩让位分栏、头部四槽、Esc 判定），
 * 差异只在「面板怎么排」（居中 vs 贴边），那部分留在各自的控件里。
 */
import { type ReactNode } from 'react';
/** 外层浮层是否锁死（不在浮层里 = false）。 */
export declare function useOverlayLocked(): boolean;
export declare const OverlayLockedProvider: import("react").Provider<boolean>;
/**
 * 锁定期间的两道保险（消费方自绘的控件不是我们的，管不到它们的 `disabled`）：
 *  ① Tab 整个吃掉 —— 否则能 Tab 进他们的 input 打字；
 *  ② 把面板里没被禁用的活动元素 `blur` 掉 —— 否则锁定前已经停在里面的光标还能继续打字。
 * 只认 `.dshpc-locked` 子树里的元素，不碰面板外面的焦点。
 */
export declare function useLockGuards(enabled: boolean): void;
/**
 * 锁定时的**透明点击层**：盖住整块面板、不遮任何像素，只吃掉指针事件
 * （消费方自绘的元素也跟着点不动）。变灰由各控件自己的 `:disabled` 负责，这里不管外观。
 * 不做焦点接管：核心控件此刻已是真 disabled，Tab 自己就跳过它们。
 */
export declare function OverlayLockCatcher(): ReactNode;
/**
 * Esc 关闭。不传 `onClose` 或 `enabled=false` 时完全不挂监听
 * （无回调还挂监听，等于让 Esc 被白白吃掉）。
 */
export declare function useEscapeClose(enabled: boolean, onClose: (() => void) | undefined): void;
/**
 * 浮层档：center = 居中弹窗；side = 贴边抽屉；plain = 不居中的锚定面板（选文件弹窗用，
 * 面板自己 `position:fixed` 贴锚点，遮罩只负责压暗与「点外部关闭」）。
 * 三档的遮罩视觉同一套，只差布局与 z（见 overlay.css）。
 */
export type OverlayKind = 'center' | 'side' | 'plain';
export interface OverlayMaskProps {
    kind: OverlayKind;
    /** 点遮罩是否关闭。 */
    closeOnMask: boolean;
    onClose?: () => void;
    /** 原样铺到遮罩节点上的属性（`data-*` 这类既有钩子）。 */
    attrs?: Record<string, string | undefined>;
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