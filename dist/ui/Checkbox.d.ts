/**
 * 勾选框（P3 输入类家族唯一实现；U20 #6，2026-10-05）。
 *
 * 以前确认弹窗里是裸 `<input type="checkbox">` + 业务内联样式，现上提为基础层件。
 * 标记色默认随业务色；高危确认可传 `accentColor`（如 `var(--dshpc-warning)`）染橙。
 */
import { createElement as h, type ReactNode } from 'react';
export interface CheckboxProps {
    /** 当前勾选态。 */
    checked: boolean;
    /** 变更回调。 */
    onChange: (next: boolean) => void;
    /** 右侧文案（不传 = 只渲染一个勾选框）。 */
    label?: ReactNode;
    /** 勾选标记色（默认 `var(--dshpc-business)`）。 */
    accentColor?: string;
    /** 禁用。 */
    disabled?: boolean;
    /** 追加 class。 */
    className?: string;
}
/** 勾选框（label + input 一体，整行可点）。 */
export declare function Checkbox(props: CheckboxProps): ReturnType<typeof h>;
//# sourceMappingURL=Checkbox.d.ts.map