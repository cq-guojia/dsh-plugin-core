import { createElement as h } from 'react';
import { type Translate } from '../utils/i18n.js';
import { type DateTimePrecision } from './datetime-logic.js';
export type { DateTimePrecision } from './datetime-logic.js';
/** 触发器高度档（与 Picker 对齐）。 */
export type DateTimeSize = 'sm' | 'md' | 'lg';
/**
 * 传出值：本地 ISO（`YYYY-MM-DDTHH:mm:ss.SSS`）或 null。
 * single 模式传 `string | null`；range 模式传 `[start, end] | null`。
 */
export type DateTimeOutput = string | [string, string] | null;
export interface DateTimePickerProps {
    /** single = 选一个时刻（默认）；range = 选时间段（起 / 止两个独立框，弹层里两块独立日历）。 */
    mode?: 'single' | 'range';
    /** 时间精度：day 只选日期；hour / minute / second 依次多一级（默认 day）。 */
    precision?: DateTimePrecision;
    /** 受控值（single 传 `string | null`；range 传 `[start, end] | null`）。给了它就受控。 */
    value?: DateTimeOutput;
    /** 非受控模式下的初始值。 */
    defaultValue?: DateTimeOutput;
    onChange?: (value: DateTimeOutput) => void;
    disabled?: boolean;
    size?: DateTimeSize;
    placeholder?: string;
    /** 问号提示文字：给了就在触发器后面挂标准 FieldHint（排版收进组件）。 */
    hint?: string;
    className?: string;
    ariaLabel?: string;
    translate?: Translate;
}
/**
 * 日期时间选择器：单值 / 时间段，精度可控（日 / 时 / 分 / 秒）。
 *
 * **纯零件，不自己取数** —— 值由调用方受控传入；弹层内是草稿态，「确定」才提交 onChange。
 * 浮层与 Picker 同机制（floating-ui portal + 贴边翻转 + 点外关闭，**无遮罩**）。
 *
 * 交互口径：
 *  - 时间**不强制先选日期**——步进随时可调；「确定」时没选日期就不传数据。
 *  - 快捷键：day 精度叫「今天」（只置日期）；带时分秒的叫「现在」（日期 + 时间一起置）。
 *  - range 弹层 = 两块独立日历（左开始、右结束），各选各的，不标跨度。
 *  - 补全：起始端把未选单位归零（day ⇒ `00:00:00.000`），结束端拉满（day ⇒ `23:59:59.999`）；
 *    毫秒恒三位输出，数据库只收到秒时优雅退化为「当天最后一秒」。
 */
export declare function DateTimePicker(props: DateTimePickerProps): ReturnType<typeof h>;
//# sourceMappingURL=DateTimePicker.d.ts.map