// 日期 / 时间格式化。全部走**本机时区**（沿用三家现有口径）；
// 解析失败一律不抛错、按调用方给的兜底返回，不编造时间。
import { t, type Translate } from './i18n.js'

/** 两位补零：`9` → `09`（数字 / 纯数字字符串都收）。 */
export function pad2(value: number | string): string {
  return String(value).padStart(2, '0')
}

const FALLBACK = '—'

/**
 * ISO → `YYYY-MM-DD HH:mm`（`seconds: true` 时补 `:ss`）。
 * 解析失败 ⇒ `fallback`（缺省返回**原串**；要占位符就显式传 `fallback: '—'`）。
 */
export function formatDateTime(iso: string, opts?: { seconds?: boolean; fallback?: string }): string {
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return opts?.fallback ?? iso
  const d = new Date(ms)
  const base = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  return opts?.seconds === true ? `${base}:${pad2(d.getSeconds())}` : base
}

/** `YYYY-MM-DD`（带年份，跨年也能看懂）。解析失败 ⇒ `opts.fallback`，缺省 `—`。 */
export function formatYmd(iso: string, opts?: { fallback?: string }): string {
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return opts?.fallback ?? FALLBACK
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** 只到 `HH:mm:ss`；`null` / `undefined` / 解析失败 ⇒ `opts.fallback`，缺省 `-`。 */
export function formatClock(iso: string | null | undefined, opts?: { fallback?: string }): string {
  const fb = opts?.fallback ?? '-'
  if (iso === null || iso === undefined || iso === '') return fb
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return fb
  const d = new Date(ms)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

/** 时长：有小时 ⇒ `H:MM:SS`；不足 1 小时 ⇒ `MM:SS`。负数 / NaN ⇒ `-`。 */
export function formatDurationHms(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '-'
  const totalSec = Math.round(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`
}

/** 两个时刻是否同一天（本机时区）。 */
export function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  )
}

/**
 * 相对时间（过去）：`3 分钟前` / `2 小时前` / `刚刚`。
 * `nowMs - iso` 为负（未来）⇒ 也返回「刚刚」（不显示「-3 分钟前」）。
 * 不传 `translate` 就用内置字典（可用 `setLocale` 切中英）。
 */
export function relativePast(iso: string, nowMs: number, translate?: Translate): string {
  const tt = translate ?? t
  const diff = nowMs - Date.parse(iso)
  if (Number.isNaN(diff) || !(diff >= 0)) return tt('relNow')
  if (diff < 60_000) return tt('relJustNow')
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return tt('relMinutesAgo', { n: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return tt('relHoursAgo', { n: hours })
  const days = Math.floor(hours / 24)
  if (days < 7) return tt('relDaysAgo', { n: days })
  if (days < 30) return tt('relWeeksAgo', { n: Math.floor(days / 7) })
  const months = Math.floor(days / 30)
  if (months < 12) return tt('relMonthsAgo', { n: months })
  return tt('relYearsAgo', { n: Math.floor(days / 365) })
}

/**
 * 相对时间（**未来**）：`3 分钟后` / `2 小时后` / `1 天后`。
 * 与 `relativePast` 对偶 —— 调度表这类「还没发生」的场景必须用它，
 * 用 `relativePast` 会把未来时间显示成「刚刚」（丢失「计划中」的语义）。
 * 解析失败 ⇒ 回退成 `formatYmd`（不编造）。
 */
export function relativeFuture(iso: string, nowMs: number, translate?: Translate): string {
  const tt = translate ?? t
  const diff = Date.parse(iso) - nowMs
  if (Number.isNaN(diff)) return formatYmd(iso)
  if (diff <= 0) return tt('relNow')
  if (diff < 60_000) return tt('relInJustNow')
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return tt('relInMinutes', { n: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return tt('relInHours', { n: hours })
  const days = Math.floor(hours / 24)
  if (days < 30) return tt('relInDays', { n: days })
  const months = Math.floor(days / 30)
  if (months < 12) return tt('relInMonths', { n: months })
  return tt('relInYears', { n: Math.floor(days / 365) })
}

/**
 * 时间区间：同一天 ⇒ `09:00 – 10:30`；跨天 ⇒ 两端都带日期。
 * 任一解析失败 ⇒ `—`。
 */
export function formatRange(fromIso: string, toIso: string, opts?: { seconds?: boolean }): string {
  const from = Date.parse(fromIso)
  const to = Date.parse(toIso)
  if (Number.isNaN(from) || Number.isNaN(to)) return FALLBACK
  const a = new Date(from)
  const b = new Date(to)
  const clock = (d: Date): string =>
    opts?.seconds === true
      ? `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
      : `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  if (sameCalendarDay(a, b)) return `${clock(a)} – ${clock(b)}`
  const day = (d: Date): string => `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
  return `${day(a)} ${clock(a)} – ${day(b)} ${clock(b)}`
}

/** 区间是否重叠（半开区间 `[from, to)`；NaN 视为不重叠）。 */
export function overlaps(
  aFrom: number,
  aTo: number,
  bFrom: number,
  bTo: number,
): boolean {
  if ([aFrom, aTo, bFrom, bTo].some((v) => Number.isNaN(v))) return false
  return aFrom < bTo && bFrom < aTo
}
