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
    /** 紧凑图标档：高度不变，图标放大、内距收紧（给描边细的文档 / 语言图标用）。 */
    dense?: boolean;
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
    /** 文案 / 内容。**不传 = 纯图标钮**（盒子自动正方形，此时 `label` 必填）。 */
    children?: ReactNode;
    /**
     * 无障碍名。只有图标、没有文字时**必填**（读屏与 hover 都要它）；
     * 有文字时可以省，传了就覆盖文字名。
     */
    label?: string;
    /** 其余原生 button 属性（type / disabled / title / aria-* / onClick …）原样透传。 */
    [key: string]: unknown;
}
/**
 * 渲染一个按钮：有 `children` 就是文字钮，只有 `icon` 就是正方形纯图标钮。
 *
 * @param props 见 {@link ButtonProps}。
 * @returns 按钮元素。
 */
export declare function Button(props: ButtonProps): ReturnType<typeof h>;
//# sourceMappingURL=Button.d.ts.map