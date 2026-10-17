import { createElement as h, type CSSProperties, type ReactNode } from 'react';
/** 按钮外观档。 */
export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
/** 按钮高度档（sm 24 / md 28 / lg 32）。 */
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps {
    /** 外观档（默认 outline）。 */
    variant?: ButtonVariant;
    /** 高度档（默认 sm）。 */
    size?: ButtonSize;
    /** 前置图标（可选）。 */
    icon?: ReactNode;
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
    /** 高度档（默认 sm）。 */
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
 * 渲染一个文字 / 图标 + 文字按钮。
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