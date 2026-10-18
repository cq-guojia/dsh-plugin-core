import { type Translate } from './i18n.js';
/** 两位补零：`9` → `09`（数字 / 纯数字字符串都收）。 */
export declare function pad2(value: number | string): string;
/**
 * ISO → `YYYY-MM-DD HH:mm`（`seconds: true` 时补 `:ss`）。
 * 解析失败 ⇒ `fallback`（缺省返回**原串**；要占位符就显式传 `fallback: '—'`）。
 */
export declare function formatDateTime(iso: string, opts?: {
    seconds?: boolean;
    fallback?: string;
}): string;
/** `YYYY-MM-DD`（带年份，跨年也能看懂）。解析失败 ⇒ `opts.fallback`，缺省 `—`。 */
export declare function formatYmd(iso: string, opts?: {
    fallback?: string;
}): string;
/** 只到 `HH:mm:ss`；`null` / `undefined` / 解析失败 ⇒ `opts.fallback`，缺省 `-`。 */
export declare function formatClock(iso: string | null | undefined, opts?: {
    fallback?: string;
}): string;
/** 时长：有小时 ⇒ `H:MM:SS`；不足 1 小时 ⇒ `MM:SS`。负数 / NaN ⇒ `-`。 */
export declare function formatDurationHms(ms: number): string;
/** 两个时刻是否同一天（本机时区）。 */
export declare function sameCalendarDay(a: Date, b: Date): boolean;
/**
 * 相对时间（过去）：`3 分钟前` / `2 小时前` / `刚刚`。
 * `nowMs - iso` 为负（未来）⇒ 也返回「刚刚」（不显示「-3 分钟前」）。
 * 不传 `translate` 就用内置字典（可用 `setLocale` 切中英）。
 */
export declare function relativePast(iso: string, nowMs: number, translate?: Translate): string;
/**
 * 相对时间（**未来**）：`3 分钟后` / `2 小时后` / `1 天后`。
 * 与 `relativePast` 对偶 —— 调度表这类「还没发生」的场景必须用它，
 * 用 `relativePast` 会把未来时间显示成「刚刚」（丢失「计划中」的语义）。
 * 解析失败 ⇒ 回退成 `formatYmd`（不编造）。
 */
export declare function relativeFuture(iso: string, nowMs: number, translate?: Translate): string;
/**
 * 时间区间：同一天 ⇒ `09:00 – 10:30`；跨天 ⇒ 两端都带日期。
 * 任一解析失败 ⇒ `—`。
 */
export declare function formatRange(fromIso: string, toIso: string, opts?: {
    seconds?: boolean;
}): string;
/** 区间是否重叠（半开区间 `[from, to)`；NaN 视为不重叠）。 */
export declare function overlaps(aFrom: number, aTo: number, bFrom: number, bTo: number): boolean;
//# sourceMappingURL=date.d.ts.map