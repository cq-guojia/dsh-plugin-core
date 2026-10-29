import { createElement as h, type CSSProperties, type ReactNode } from 'react';
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
    /** 加载中：文案前显示同色小圈，并自动禁用点击。 */
    loading?: boolean;
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
    /** 外观档（默认 plain）。 */
    variant?: 'plain' | 'outline' | 'danger';
    /** 高度档（默认 lg）。 */
    size?: ButtonSize;
    /** 图标（必填）。 */
    icon: ReactNode;
    /** 无障碍名（必填；同时作为默认 title）。 */
    label: string;
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