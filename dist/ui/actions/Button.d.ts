import { createElement as h, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
/** 按钮外观档。 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info' | 'danger-outline' | 'link' | 'purple' | 'pink' | 'cyan' | 'teal' | 'orange' | 'indigo' | 'rose' | 'slate';
/** 按钮高度档（sm 24 / md 28 / lg 32）。 */
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps {
    /** 外观档（默认 outline）。 */
    variant?: ButtonVariant;
    /** 高度档（默认 lg）。 */
    size?: ButtonSize;
    /** 前置图标（可选；字符串 / 官方图标组件都可以）。 */
    icon?: ReactNode;
    /** 后置图标（可选；如「展开 / 外链」箭头）。 */
    iconRight?: ReactNode;
    /**
     * 自定义主色（任意 CSS 色值，如 `#7c3aed` / `var(--dshpc-business)`）。
     * 实心档作底色、描边与文字档作主色；hover / active 由基础层按该色混出。
     */
    color?: string;
    /** 加载中：文案前显示同色小圈，并自动禁用点击。与「点击自动 loading」是或关系，任一为真就转圈。 */
    loading?: boolean;
    /**
     * loading 时是否保留文案（默认 true）。
     * 传 `false`：loading 期间**清掉文案**、把按钮锁在「有文案时」的宽度上，只剩一枚居中的圈，
     * settle 后文案与自适应宽度一起回来 —— 用于文案长、不想让按钮被圈撑宽的场景。
     *
     * 两条前提：① 文案被清掉后读屏只剩「按钮」，`children` 不是字符串时请自己传 `aria-label`；
     * ② 首帧就是 loading（没有「有文案的宽度」可量）时不锁宽，请改用 `width` 定宽。
     */
    loadingText?: boolean;
    /**
     * 点击回调。**返回 Promise 即自动进入 loading**（转圈 + 禁用 + 防连点），settle 后自己恢复；
     * reject 会恢复并把错误打到控制台。同步返回值 = 老行为，不转圈。
     */
    onClick?: (event: MouseEvent<HTMLButtonElement>) => unknown;
    /**
     * 把「这个按钮正在跑」报出去（如锁死所在弹窗的遮罩 / Esc / ✕）。
     * 不改变按钮自己的行为；与 `loading` 无关。
     */
    onBusyChange?: (busy: boolean) => void;
    /** 撑满父宽。 */
    block?: boolean;
    /**
     * 固定宽（px 或任意 CSS 宽度值）。与 `minWidth` / `maxWidth` 互斥：一旦设定，后两者自动失效。
     */
    width?: number | string;
    /** 最小宽：`width` 未设时生效，内容不足此宽时以它为准。 */
    minWidth?: number | string;
    /**
     * 最大宽：`width` 未设时生效，文字超出时折叠成省略号，hover 以跑马灯展开全名。
     */
    maxWidth?: number | string;
    /** 追加 class（只允许补布局、或挂本文件声明的修饰类，不许覆盖皮肤）。 */
    className?: string;
    /** 追加样式（只允许补布局，不许覆盖皮肤）。 */
    style?: CSSProperties;
    /** 文案 / 内容。 */
    children?: ReactNode;
    /** 其余原生 button 属性（type / disabled / title / aria-* / onClick …）原样透传。 */
    [key: string]: unknown;
}
export interface IconButtonProps {
    /** 外观档（默认 plain：无底色、无边框）。 */
    variant?: 'plain' | 'outline' | 'danger';
    /** 高度档（默认 lg）。 */
    size?: ButtonSize;
    /** 图标（必填）。 */
    icon: ReactNode;
    /** 无障碍名（必填；同时作为默认 title）。 */
    label: string;
    /** 图标色（任意 CSS 色值）；hover 按它混出浅底。 */
    color?: string;
    /** 底色（任意 CSS 色值）；不传 = 无底色。hover 按它压深。 */
    background?: string;
    /** 加载中：图标位换成小圈并禁用（纯图标钮没有文字，圈就是它的全部内容）。与「点击自动 loading」取或。 */
    loading?: boolean;
    /** 点击回调；**返回 Promise 自动 loading**，settle 后恢复。 */
    onClick?: (event: MouseEvent<HTMLButtonElement>) => unknown;
    /** 把「这个按钮正在跑」报出去（如锁死所在弹窗）。 */
    onBusyChange?: (busy: boolean) => void;
    /** 追加 class。 */
    className?: string;
    /** 追加样式。 */
    style?: CSSProperties;
    /** 其余原生 button 属性原样透传。 */
    [key: string]: unknown;
}
/**
 * 渲染一个「图标 + 文案」按钮。
 *
 * @param props 见 {@link ButtonProps}。
 * @returns 按钮元素。
 */
export declare function Button(props: ButtonProps): ReturnType<typeof h>;
/**
 * 渲染一个纯图标按钮。
 *
 * @param props 见 {@link IconButtonProps}。
 * @returns 图标按钮元素。
 */
export declare function IconButton(props: IconButtonProps): ReturnType<typeof h>;
//# sourceMappingURL=Button.d.ts.map