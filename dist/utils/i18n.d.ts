/**
 * utils 自带的最小多语言。
 *
 * 原则（需求文档 §5.4）：**核心提供什么，核心就负责它的多语言** —— utils 里要吐文案的函数
 * （如相对时间）自带中英字典；插件**自己界面**的文案仍由插件自己管，这里不提供插件级 i18n 框架。
 * 需要覆盖时传自己的 `t` 进来即可。
 */
export type Locale = 'zh' | 'en';
/** utils 内置文案的 key（ui 的选择器也复用这套字典，保持单一 locale 状态）。 */
export type UtilMessageKey = 'sessionLoading' | 'sessionFailed' | 'sessionEmpty' | 'sessionAttachments' | 'sessionRoleUser' | 'sessionRoleAssistant' | 'sessionRoleTool' | 'explorerLoading' | 'explorerFailed' | 'explorerUnsupported' | 'explorerRoot' | 'explorerUp' | 'explorerRefresh' | 'explorerTruncated' | 'explorerEmptyDir' | 'cardToggle' | 'modalClose' | 'emptyText' | 'errorTitle' | 'errorRetry' | 'pickerPlaceholder' | 'pickerClear' | 'pickerEmpty' | 'pickerNoMatch' | 'pickerSearch' | 'pickerSelected' | 'pickerMaxReached' | 'pickerDegraded' | 'modelProvider' | 'modelModel' | 'relNow' | 'relInJustNow' | 'relInMinutes' | 'relInHours' | 'relInDays' | 'relInMonths' | 'relInYears' | 'relJustNow' | 'relMinutesAgo' | 'relHoursAgo' | 'relDaysAgo' | 'relWeeksAgo' | 'relMonthsAgo' | 'relYearsAgo';
/** 文案函数：`vars` 用于填 `{n}` 这类占位。 */
export type Translate = (key: UtilMessageKey, vars?: Record<string, number | string>) => string;
export declare function setLocale(locale: Locale): void;
export declare function getLocale(): Locale;
/** 用内置字典翻译一个 key；未知 key 直接回退 key 本身（不抛、不空白）。 */
export declare function t(key: UtilMessageKey, vars?: Record<string, number | string>): string;
//# sourceMappingURL=i18n.d.ts.map