/**
 * utils 自带的最小多语言。
 *
 * 原则（需求文档 §5.4）：**核心提供什么，核心就负责它的多语言** —— utils 里要吐文案的函数
 * （如相对时间）自带中英字典；插件**自己界面**的文案仍由插件自己管，这里不提供插件级 i18n 框架。
 * 需要覆盖时传自己的 `t` 进来即可。
 */

export type Locale = 'zh' | 'en'

/** utils 内置文案的 key（ui 的选择器也复用这套字典，保持单一 locale 状态）。 */
export type UtilMessageKey =
  | 'modalClose'
  | 'emptyText'
  | 'errorTitle'
  | 'errorRetry'
  | 'pickerPlaceholder'
  | 'pickerEmpty'
  | 'pickerNoMatch'
  | 'pickerSearch'
  | 'pickerSelected'
  | 'pickerMaxReached'
  | 'pickerDegraded'
  | 'modelProvider'
  | 'modelModel'
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
    modalClose: '关闭',
    emptyText: '暂无数据',
    errorTitle: '出错了',
    errorRetry: '重试',
    pickerPlaceholder: '请选择',
    pickerEmpty: '暂无可选',
    pickerNoMatch: '无匹配项',
    pickerSearch: '搜索…',
    pickerSelected: '已选 {n} 项',
    pickerMaxReached: '最多选 {n} 项',
    pickerDegraded: '候选可能不完整',
    modelProvider: '供应商',
    modelModel: '模型',
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
    modalClose: 'Close',
    emptyText: 'No data',
    errorTitle: 'Something went wrong',
    errorRetry: 'Retry',
    pickerPlaceholder: 'Select…',
    pickerEmpty: 'No options',
    pickerNoMatch: 'No match',
    pickerSearch: 'Search…',
    pickerSelected: '{n} selected',
    pickerMaxReached: 'Up to {n}',
    pickerDegraded: 'List may be incomplete',
    modelProvider: 'Provider',
    modelModel: 'Model',
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
