import { createElement as h, type CSSProperties, type RefObject } from 'react';
/** 输入高度档（sm 24 / md 28 / lg 32）。 */
export type FieldSize = 'sm' | 'md' | 'lg';
export interface InputProps {
    /** 当前值。 */
    value: string;
    /** 变更回调（原生 input value）。 */
    onChange: (value: string) => void;
    /** 占位。 */
    placeholder?: string;
    /** 高度档（默认 sm）。 */
    size?: FieldSize;
    /** 校验不通过：描红。 */
    error?: boolean;
    /** 禁用。 */
    disabled?: boolean;
    /** 原生 type（默认 text）。 */
    type?: string;
    /** 无障碍名。 */
    'aria-label'?: string;
    /** 悬停提示。 */
    title?: string;
    /** 追加 class。 */
    className?: string;
    /** 追加样式（只允许补布局）。 */
    style?: CSSProperties;
    /** 原生 input 的 ref（调用方需要主动聚焦时用，如任务选择器的搜索框）。 */
    inputRef?: RefObject<HTMLInputElement | null>;
    /** 键盘事件（如搜索框里 Enter 直接选中第一项）。 */
    onKeyDown?: (event: {
        key: string;
        preventDefault(): void;
    }) => void;
    /** 失焦（如数字框把「清空 / 输一半」的草稿回弹成已提交值）。 */
    onBlur?: () => void;
}
/** 文本输入。 */
export declare function Input(props: InputProps): ReturnType<typeof h>;
export interface PrefixedInputProps extends Omit<InputProps, 'className'> {
    /** 前置文案（如 https:// / C:\）。 */
    prefix: string;
    /** 追加 class。 */
    className?: string;
}
/** 前缀 + 文本输入。 */
export declare function PrefixedInput(props: PrefixedInputProps): ReturnType<typeof h>;
export interface NumberInputProps {
    /** 当前值（数字）。 */
    value: number;
    /** 变更回调（已 clamp）。 */
    onChange: (value: number) => void;
    /** 最小值（默认 -Infinity）。 */
    min?: number;
    /** 最大值（默认 +Infinity）。 */
    max?: number;
    /** 步进（默认 1）。 */
    step?: number;
    /** 高度档（默认 sm）。 */
    size?: FieldSize;
    /** 内部数字输入区宽度（px；不传取 CSS 规格 36，够 3~4 位数）。 */
    inputWidth?: number;
    /** 禁用。 */
    disabled?: boolean;
    /** 后缀（如「秒」「次」）。 */
    suffix?: string;
    /** 无障碍名。 */
    label?: string;
    /** 减号无障碍名。 */
    decreaseLabel?: string;
    /** 加号无障碍名。 */
    increaseLabel?: string;
    /** 追加 class。 */
    className?: string;
    /** 追加样式（只允许补布局）。 */
    style?: CSSProperties;
}
/**
 * 数字步进输入：显式 `− / +` 按钮 + 可输入数字。
 *
 * @param props 见 {@link NumberInputProps}。
 * @returns 数字步进控件。
 */
export declare function NumberInput(props: NumberInputProps): ReturnType<typeof h>;
/** 下拉 / 日期 / 时分的选项（value = 写进任务定义的真值）。 */
export interface EditorOption {
    value: string;
    label: string;
}
/**
 * 下拉锚点的统一样式（**全站唯一一份**）：`SelectField` 与 `TaskPicker` 共用 —— 两者是同一类锚点，
 * 不许各抄一份（2026-10-04 评审：TaskPicker 曾抄第二/第三份，观感会持续漂移）。
 */
export declare const FIELD_ANCHOR_STYLE: CSSProperties;
/** 下拉锚点里那行文字（省略号三件套收敛到 `.dshpc-ellipsis`，见 ui-style-guide §三 待抽象 #1）。 */
export declare const FIELD_LABEL_STYLE: CSSProperties;
/** 尺寸档 → 锚点几何（高度 / 字号 / 行高 / 图标 / 间距）。**翻译只此一处**，下拉类控件共用。 */
export declare function fieldMetricsOf(size: FieldSize): {
    height: string;
    font: string;
    line: string;
    icon: number;
    gap: string;
};
//# sourceMappingURL=Field.d.ts.map