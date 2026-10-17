/**
 * utils 自带的最小多语言。
 *
 * 原则（需求文档 §5.4）：**核心提供什么，核心就负责它的多语言** —— utils 里要吐文案的函数
 * （如相对时间）自带中英字典；插件**自己界面**的文案仍由插件自己管，这里不提供插件级 i18n 框架。
 * 需要覆盖时传自己的 `t` 进来即可。
 */

export type Locale = 'zh' | 'en'

/** utils 内置文案的 key。 */
export type UtilMessageKey =
  | 'relNow'
  | 'relJustNow'
  | 'relMinutesAgo'
  | 'relHoursAgo'
  | 'relDaysAgo'
  | 'relWeeksAgo'
  | 'relMonthsAgo'
  | 'relYearsAgo'

/** 文案函数：`vars` 用于填 `{n}` 这类占位。 */
export type Translate = (key: UtilMessageKey, vars?: Record<string, number | string>) => string

const DICT: Record<Locale, Record<UtilMessageKey, string>> = {
  zh: {
    relNow: '刚刚',
    relJustNow: '刚刚',
    relMinutesAgo: '{n} 分钟前',
    relHoursAgo: '{n} 小时前',
    relDaysAgo: '{n} 天前',
    relWeeksAgo: '{n} 周前',
    relMonthsAgo: '{n} 个月前',
    relYearsAgo: '{n} 年前',
  },
  en: {
    relNow: 'just now',
    relJustNow: 'just now',
    relMinutesAgo: '{n}m ago',
    relHoursAgo: '{n}h ago',
    relDaysAgo: '{n}d ago',
    relWeeksAgo: '{n}w ago',
    relMonthsAgo: '{n}mo ago',
    relYearsAgo: '{n}y ago',
  },
}

let current: Locale = 'zh'

export function setLocale(locale: Locale): void {
  current = locale
}

export function getLocale(): Locale {
  return current
}

/** 用内置字典翻译一个 key；未知 key 直接回退 key 本身（不抛、不空白）。 */
export function t(key: UtilMessageKey, vars?: Record<string, number | string>): string {
  const template = DICT[current][key] ?? DICT.zh[key] ?? key
  if (vars === undefined) return template
  return template.replace(/\{(\w+)\}/g, (whole, name: string): string => {
    const value = vars[name]
    return value === undefined ? whole : String(value)
  })
}
