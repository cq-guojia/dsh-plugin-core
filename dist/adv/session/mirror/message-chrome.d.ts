import { pad2 } from '../../../utils/date.js';
import type { Translate } from '../../../utils/i18n.js';
export { pad2 };
/** 本机当日零点（官方 startOfLocalDay）。 */
export declare function startOfLocalDay(ms: number): number;
/** 距下一个本机零点（官方 msUntilNextLocalMidnight）。 */
export declare function msUntilNextLocalMidnight(ms: number): number;
/** 官方 formatRunDuration 的片段（numeric = 数字段，调用方按官方套等宽数字字体）。 */
export interface DurationPart {
    text: string;
    numeric: boolean;
}
/**
 * 官方 formatRunDuration（0.2.x，lib/client.js:5067-5095）：整秒；≥1 分带分；≥1 小时带小时。
 * 单位是独立片段（`duration.hourUnit` / `minuteUnit` / `secondUnit`），不是一条带占位的模板。
 */
export declare function formatRunDuration(ms: number, tt: Translate): readonly DurationPart[];
/** 时长片段拼成单行文本（塞进带占位符的文案 / aria 用）。 */
export declare function durationText(parts: readonly DurationPart[]): string;
/**
 * 官方 formatMessageClock：同日 → `HH:mm`；同年 → `{m}月{d}日 HH:mm`；跨年 → `{y}年{m}月{d}日 HH:mm`。
 */
export declare function formatMessageClock(time: number, tt: Translate, now?: number): string;
/** 官方 useCalendarDay：跨本机零点自动重渲染（时钟文案与「今天」判定跟着走）。 */
export declare function useCalendarDay(): number;
/** 官方 formatTokens：517 / 12.2K / 517K / 1.2M。 */
export declare function formatTokens(value: number, tt: Translate): string;
/** 官方 formatCompactCount：紧凑 token 数 + 「 tok」。 */
export declare function formatCompactCount(value: number, tt: Translate): string;
/** 官方 formatExactTokens：按本地千分位分组（number.groupSeparator）。 */
export declare function formatExactTokens(value: number, tt: Translate): string;
/** 官方 formatExactCount：精确计数 + 「 tok」。 */
export declare function formatExactCount(value: number, tt: Translate): string;
/**
 * 官方 formatCacheHitPercent：缓存命中率；部分命中不四舍五入成 100%（自动加精度）。
 * @returns 百分比文本；无输入时 null。
 */
export declare function formatCacheHitPercent(cacheReadTokens: number, promptTokens: number, decimalPlaces?: number): string | null;
//# sourceMappingURL=message-chrome.d.ts.map