// 日期时间选择器的纯逻辑（与 React 运行时无关，便于 node 单测；React 只进类型引用，编译期擦除）。
//
// 口径（与 utils/date.ts 一致）：全部走**本机时区**；解析失败一律返回 null，不抛错、不编造时间。
import { pad2 } from '../utils/date.js'

/** 时间精度：day 只选日期；hour / minute / second 依次多一级时间选择。 */
export type DateTimePrecision = 'day' | 'hour' | 'minute' | 'second'

/** 本地时区的日期时间各部分（毫秒单独存：结束端补全需要 .999）。 */
export interface DateTimeParts {
  year: number
  month: number // 1-12
  day: number // 1-31
  hour: number // 0-23
  minute: number // 0-59
  second: number // 0-59
  ms: number // 0-999
}

/** 月历网格中的一格。 */
export interface DayCell {
  /** `YYYY-MM-DD`（本地日历日，用于比对 / 回填）。 */
  iso: string
  year: number
  month: number
  day: number
  /** 是否属于当前展示月（false = 前后月的补位格）。 */
  inMonth: boolean
  /** 0 = 周一 … 6 = 周日（周一起排）。 */
  weekday: number
}

/** 时 / 分 / 秒三个步进列。 */
export type StepUnit = 'hour' | 'minute' | 'second'

/** 日历端选中的日期（可空：时间允许先于日期选，「确定」时才算账）。 */
export interface DayRef {
  year: number
  month: number
  day: number
}

/** 时间部分恒存在（默认零）；没选日期时步进照样能调。 */
export interface TimeParts {
  hour: number
  minute: number
  second: number
  ms: number
}

/** 一端的草稿：日期（可空）+ 时间（恒存在）。 */
export interface EndDraft {
  day: DayRef | null
  time: TimeParts
}

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?)?$/

const STEP_MAX: Record<StepUnit, number> = { hour: 23, minute: 59, second: 59 }

const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

/** 星期表头（周一起排；中文一~日，英文 Mon~Sun）。 */
const WEEKDAYS = {
  zh: ['一', '二', '三', '四', '五', '六', '日'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
} as const

const pad3 = (ms: number): string => String(ms).padStart(3, '0')
const pad4 = (year: number): string => String(year).padStart(4, '0')

/**
 * 本地 ISO（`YYYY-MM-DDTHH:mm:ss.SSS`，无时区后缀）→ 各部分。
 * 不存在的日期（2026-02-30 / 2026-13-01）经 Date 反向校验后返回 null。
 */
export function parseDateTime(iso: string): DateTimeParts | null {
  const m = ISO_RE.exec(iso.trim())
  if (m === null) return null
  const parts: DateTimeParts = {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4] ?? '0'),
    minute: Number(m[5] ?? '0'),
    second: Number(m[6] ?? '0'),
    ms: Number((m[7] ?? '0').padEnd(3, '0')),
  }
  const d = new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, parts.ms)
  if (
    d.getFullYear() !== parts.year ||
    d.getMonth() !== parts.month - 1 ||
    d.getDate() !== parts.day ||
    d.getHours() !== parts.hour ||
    d.getMinutes() !== parts.minute ||
    d.getSeconds() !== parts.second
  ) {
    return null
  }
  return parts
}

/**
 * 各部分 → 本地 ISO。毫秒恒三位：数据库若只收「到秒」，`23:59:59.999` 被截成
 * `23:59:59` 仍是当天最后一秒，语义不坏（优雅降级，调用方无需特殊处理）。
 */
export function formatDateTimeIso(p: DateTimeParts): string {
  return `${pad4(p.year)}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}:${pad2(p.second)}.${pad3(p.ms)}`
}

/** 各部分 → 本地毫秒时间戳（仅用于比较，不涉及时区换算）。 */
export function partsToMs(p: DateTimeParts): number {
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second, p.ms).getTime()
}

/** 本地毫秒时间戳 → 各部分。 */
export function msToParts(ms: number): DateTimeParts {
  const d = new Date(ms)
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
    second: d.getSeconds(),
    ms: d.getMilliseconds(),
  }
}

/** 当前时刻。 */
export function nowParts(): DateTimeParts {
  return msToParts(Date.now())
}

/** 本地 ISO → 一端草稿（日期 / 时间分离）；解析失败或空 ⇒ 日期为空、时间归零。 */
export function toEndDraft(iso: string | null | undefined): EndDraft {
  const p = iso === undefined || iso === null || iso === '' ? null : parseDateTime(iso)
  if (p === null) return { day: null, time: { hour: 0, minute: 0, second: 0, ms: 0 } }
  return {
    day: { year: p.year, month: p.month, day: p.day },
    time: { hour: p.hour, minute: p.minute, second: p.second, ms: p.ms },
  }
}

/** 一端草稿 → 完整时刻；**没选日期 ⇒ null**（调用方据此不传数据）。 */
export function partsOf(e: EndDraft): DateTimeParts | null {
  return e.day === null ? null : { ...e.day, ...e.time }
}

/**
 * 「现在」按钮的时间部分：按精度截断（day ⇒ 全零；hour ⇒ H:00:00；
 * minute ⇒ H:M:00；second ⇒ 完整当前时刻）。
 */
export function nowTimeFor(precision: DateTimePrecision): TimeParts {
  const n = nowParts()
  if (precision === 'day') return { hour: 0, minute: 0, second: 0, ms: 0 }
  if (precision === 'hour') return { hour: n.hour, minute: 0, second: 0, ms: 0 }
  if (precision === 'minute') return { hour: n.hour, minute: n.minute, second: 0, ms: 0 }
  return { hour: n.hour, minute: n.minute, second: n.second, ms: n.ms }
}

/**
 * 起始端补全：未选的时间单位归零。
 * day ⇒ `00:00:00.000`；hour ⇒ `H:00:00.000`；minute ⇒ `H:M:00.000`；second ⇒ ms 归零。
 */
export function floorToPrecision(p: DateTimeParts, precision: DateTimePrecision): DateTimeParts {
  switch (precision) {
    case 'day':
      return { ...p, hour: 0, minute: 0, second: 0, ms: 0 }
    case 'hour':
      return { ...p, minute: 0, second: 0, ms: 0 }
    case 'minute':
      return { ...p, second: 0, ms: 0 }
    case 'second':
      return { ...p, ms: 0 }
  }
}

/**
 * 结束端补全：未选的时间单位拉到最大。
 * day ⇒ `23:59:59.999`；hour ⇒ `H:59:59.999`；minute ⇒ `H:M:59.999`；
 * second ⇒ 精确值不动（用户显式选到秒，不猜）。
 */
export function ceilToPrecision(p: DateTimeParts, precision: DateTimePrecision): DateTimeParts {
  switch (precision) {
    case 'day':
      return { ...p, hour: 23, minute: 59, second: 59, ms: 999 }
    case 'hour':
      return { ...p, minute: 59, second: 59, ms: 999 }
    case 'minute':
      return { ...p, second: 59, ms: 999 }
    case 'second':
      return p
  }
}

/**
 * 6×7 固定月历网格，周一起排；补位格给真实日期并标 `inMonth: false`。
 * 42 格恒定 ⇒ 弹层高度不随月份跳动。
 */
export function buildMonthCells(year: number, month: number): DayCell[] {
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7 // 周一 = 0
  const cells: DayCell[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month - 1, 1 - firstWeekday + i)
    cells.push({
      iso: `${pad4(d.getFullYear())}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      inMonth: d.getMonth() === month - 1 && d.getFullYear() === year,
      weekday: i % 7,
    })
  }
  return cells
}

/** 月历标题：zh `2026年10月`；en `October 2026`。 */
export function monthCaption(year: number, month: number, locale: 'zh' | 'en'): string {
  return locale === 'zh'
    ? `${pad4(year)}年${pad2(month)}月`
    : `${EN_MONTHS[month - 1] ?? ''} ${String(year)}`
}

/** 星期表头（周一起排）。 */
export function weekdayLabels(locale: 'zh' | 'en'): readonly string[] {
  return WEEKDAYS[locale]
}

/** 步进 ±1 循环（23→0、59→0）：免去用户点 60 次选分钟。 */
export function stepUnit(value: number, unit: StepUnit, delta: number): number {
  const max = STEP_MAX[unit] + 1
  return ((value + delta) % max + max) % max
}

/** 步进列的上限（hour 23 / minute 59 / second 59）。 */
export function stepMax(unit: StepUnit): number {
  return STEP_MAX[unit]
}

/** 把键入 / 滚轮得到的原始值收进合法范围（NaN 归 0）。 */
export function clampUnit(value: number, unit: StepUnit): number {
  if (!Number.isFinite(value)) return 0
  const max = STEP_MAX[unit]
  return Math.min(max, Math.max(0, Math.round(value)))
}

/** 时间段是否成立（起 ≤ 止；任一端解析失败 ⇒ 不成立）。 */
export function rangeIsValid(startIso: string, endIso: string): boolean {
  const a = parseDateTime(startIso)
  const b = parseDateTime(endIso)
  if (a === null || b === null) return false
  return partsToMs(a) <= partsToMs(b)
}

/** 两个时刻是否同一本地日历日。 */
export function sameLocalDay(a: DateTimeParts, b: DateTimeParts): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day
}
