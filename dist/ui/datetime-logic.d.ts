/** 时间精度：day 只选日期；hour / minute / second 依次多一级时间选择。 */
export type DateTimePrecision = 'day' | 'hour' | 'minute' | 'second';
/** 本地时区的日期时间各部分（毫秒单独存：结束端补全需要 .999）。 */
export interface DateTimeParts {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    ms: number;
}
/** 月历网格中的一格。 */
export interface DayCell {
    /** `YYYY-MM-DD`（本地日历日，用于比对 / 回填）。 */
    iso: string;
    year: number;
    month: number;
    day: number;
    /** 是否属于当前展示月（false = 前后月的补位格）。 */
    inMonth: boolean;
    /** 0 = 周一 … 6 = 周日（周一起排）。 */
    weekday: number;
}
/** 时 / 分 / 秒三个步进列。 */
export type StepUnit = 'hour' | 'minute' | 'second';
/** 日历端选中的日期（可空：时间允许先于日期选，「确定」时才算账）。 */
export interface DayRef {
    year: number;
    month: number;
    day: number;
}
/** 时间部分恒存在（默认零）；没选日期时步进照样能调。 */
export interface TimeParts {
    hour: number;
    minute: number;
    second: number;
    ms: number;
}
/** 一端的草稿：日期（可空）+ 时间（恒存在）。 */
export interface EndDraft {
    day: DayRef | null;
    time: TimeParts;
}
/**
 * 本地 ISO（`YYYY-MM-DDTHH:mm:ss.SSS`，无时区后缀）→ 各部分。
 * 不存在的日期（2026-02-30 / 2026-13-01）经 Date 反向校验后返回 null。
 */
export declare function parseDateTime(iso: string): DateTimeParts | null;
/**
 * 各部分 → 本地 ISO。毫秒恒三位：数据库若只收「到秒」，`23:59:59.999` 被截成
 * `23:59:59` 仍是当天最后一秒，语义不坏（优雅降级，调用方无需特殊处理）。
 */
export declare function formatDateTimeIso(p: DateTimeParts): string;
/** 各部分 → 本地毫秒时间戳（仅用于比较，不涉及时区换算）。 */
export declare function partsToMs(p: DateTimeParts): number;
/** 本地毫秒时间戳 → 各部分。 */
export declare function msToParts(ms: number): DateTimeParts;
/** 当前时刻。 */
export declare function nowParts(): DateTimeParts;
/** 本地 ISO → 一端草稿（日期 / 时间分离）；解析失败或空 ⇒ 日期为空、时间归零。 */
export declare function toEndDraft(iso: string | null | undefined): EndDraft;
/** 一端草稿 → 完整时刻；**没选日期 ⇒ null**（调用方据此不传数据）。 */
export declare function partsOf(e: EndDraft): DateTimeParts | null;
/**
 * 「现在」按钮的时间部分：按精度截断（day ⇒ 全零；hour ⇒ H:00:00；
 * minute ⇒ H:M:00；second ⇒ 完整当前时刻）。
 */
export declare function nowTimeFor(precision: DateTimePrecision): TimeParts;
/**
 * 起始端补全：未选的时间单位归零。
 * day ⇒ `00:00:00.000`；hour ⇒ `H:00:00.000`；minute ⇒ `H:M:00.000`；second ⇒ ms 归零。
 */
export declare function floorToPrecision(p: DateTimeParts, precision: DateTimePrecision): DateTimeParts;
/**
 * 结束端补全：未选的时间单位拉到最大。
 * day ⇒ `23:59:59.999`；hour ⇒ `H:59:59.999`；minute ⇒ `H:M:59.999`；
 * second ⇒ 精确值不动（用户显式选到秒，不猜）。
 */
export declare function ceilToPrecision(p: DateTimeParts, precision: DateTimePrecision): DateTimeParts;
/**
 * 6×7 固定月历网格，周一起排；补位格给真实日期并标 `inMonth: false`。
 * 42 格恒定 ⇒ 弹层高度不随月份跳动。
 */
export declare function buildMonthCells(year: number, month: number): DayCell[];
/** 月历标题：zh `2026年10月`；en `October 2026`。 */
export declare function monthCaption(year: number, month: number, locale: 'zh' | 'en'): string;
/** 星期表头（周一起排）。 */
export declare function weekdayLabels(locale: 'zh' | 'en'): readonly string[];
/** 步进 ±1 循环（23→0、59→0）：免去用户点 60 次选分钟。 */
export declare function stepUnit(value: number, unit: StepUnit, delta: number): number;
/** 步进列的上限（hour 23 / minute 59 / second 59）。 */
export declare function stepMax(unit: StepUnit): number;
/** 把键入 / 滚轮得到的原始值收进合法范围（NaN 归 0）。 */
export declare function clampUnit(value: number, unit: StepUnit): number;
/** 时间段是否成立（起 ≤ 止；任一端解析失败 ⇒ 不成立）。 */
export declare function rangeIsValid(startIso: string, endIso: string): boolean;
/** 两个时刻是否同一本地日历日。 */
export declare function sameLocalDay(a: DateTimeParts, b: DateTimeParts): boolean;
//# sourceMappingURL=datetime-logic.d.ts.map