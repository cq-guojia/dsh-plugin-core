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
  | 'sessionLoading'
  | 'sessionFailed'
  | 'sessionEmpty'
  | 'sessionAttachments'
  | 'sessionRoleUser'
  | 'sessionRoleAssistant'
  | 'sessionRoleTool'
  | 'explorerLoading'
  | 'explorerFailed'
  | 'explorerRoot'
  | 'explorerTruncated'
  | 'explorerEmptyDir'
  | 'explorerLevels'
  | 'explorerExpand'
  | 'explorerCollapse'
  | 'explorerEnter'
  | 'explorerRootName'
  | 'explorerCrumbsAria'
  | 'explorerPickFile'
  | 'explorerPickDir'
  | 'previewClose'
  | 'previewCopyPath'
  | 'previewRefresh'
  | 'previewRender'
  | 'previewSource'
  | 'previewMdSwitchAria'
  | 'previewHtmlSwitchAria'
  | 'previewLoadMore'
  | 'previewTruncated'
  | 'previewOfficeUnavailable'
  | 'previewRenderFailed'
  | 'previewBadPayload'
  | 'previewOutside'
  | 'previewNotFound'
  | 'previewNotDirectory'
  | 'previewTooLarge'
  | 'previewNotText'
  | 'mdCopy'
  | 'mdCopied'
  | 'mdCode'
  | 'mdWrap'
  | 'mdUnwrap'
  | 'mdFootnotes'
  | 'cardToggle'
  | 'modalClose'
  | 'dockClose'
  | 'dockResize'
  | 'emptyText'
  | 'errorRetry'
  | 'confirm'
  | 'cancel'
  | 'dialogOk'
  | 'pickerPlaceholder'
  | 'pickerClear'
  | 'pickerEmpty'
  | 'pickerNoMatch'
  | 'pickerSearch'
  | 'pickerSelected'
  | 'pickerMaxReached'
  | 'pickerDegraded'
  | 'modelProvider'
  | 'modelModel'
  | 'modelDefault'
  | 'workspaceAll'
  | 'relNow'
  | 'relInJustNow'
  | 'relInMinutes'
  | 'relInHours'
  | 'relInDays'
  | 'relInMonths'
  | 'relInYears'
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
    sessionLoading: '加载会话…',
    sessionFailed: '会话加载失败',
    sessionEmpty: '该会话暂无内容',
    sessionAttachments: '附件',
    sessionRoleUser: '用户',
    sessionRoleAssistant: '助手',
    sessionRoleTool: '工具',
    explorerLoading: '加载中…',
    explorerFailed: '加载失败',
    explorerRoot: '工作区',
    explorerTruncated: '条目过多，已截断',
    explorerEmptyDir: '空目录',
    explorerLevels: '选择层级',
    explorerExpand: '展开',
    explorerCollapse: '收起',
    explorerEnter: '进入',
    explorerRootName: '工作区根目录',
    explorerCrumbsAria: '目录路径',
    explorerPickFile: '选择此文件',
    explorerPickDir: '选择此文件夹',
    previewClose: '关闭',
    previewCopyPath: '复制路径',
    previewRefresh: '刷新',
    previewRender: '预览',
    previewSource: '源码',
    previewMdSwitchAria: '切换渲染或源码',
    previewHtmlSwitchAria: '切换渲染或源码',
    previewLoadMore: '加载更多',
    previewTruncated: '内容过大，仅显示前 {n}',
    previewOfficeUnavailable: 'Office 预览不可用',
    previewRenderFailed: '预览渲染失败',
    previewBadPayload: '返回数据不符合预期',
    previewOutside: '路径在工作区之外',
    previewNotFound: '文件不存在',
    previewNotDirectory: '不是文件夹',
    previewTooLarge: '文件过大，无法预览',
    previewNotText: '不是文本文件',
    mdCopy: '复制',
    mdCopied: '已复制',
    mdCode: '代码',
    mdWrap: '换行',
    mdUnwrap: '取消换行',
    mdFootnotes: '脚注',
    cardToggle: '展开/收起',
    modalClose: '关闭',
    dockClose: '关闭面板',
    dockResize: '拖动调整宽度',
    emptyText: '暂无数据',
    errorRetry: '重试',
    confirm: '确定',
    cancel: '取消',
    dialogOk: '知道了',
    pickerPlaceholder: '请选择',
    pickerClear: '不选',
    pickerEmpty: '暂无可选',
    pickerNoMatch: '无匹配项',
    pickerSearch: '搜索…',
    pickerSelected: '已选 {n} 项',
    pickerMaxReached: '最多选 {n} 项',
    pickerDegraded: '候选可能不完整',
    modelProvider: '供应商',
    modelModel: '模型',
    modelDefault: '默认模型',
    workspaceAll: '所有工作区',
    relNow: '刚刚',
    relInJustNow: '即将',
    relInMinutes: '{n} 分钟后',
    relInHours: '{n} 小时后',
    relInDays: '{n} 天后',
    relInMonths: '{n} 个月后',
    relInYears: '{n} 年后',
    relJustNow: '刚刚',
    relMinutesAgo: '{n} 分钟前',
    relHoursAgo: '{n} 小时前',
    relDaysAgo: '{n} 天前',
    relWeeksAgo: '{n} 周前',
    relMonthsAgo: '{n} 个月前',
    relYearsAgo: '{n} 年前',
  },
  en: {
    sessionLoading: 'Loading session…',
    sessionFailed: 'Failed to load session',
    sessionEmpty: 'No content in this session',
    sessionAttachments: 'Attachments',
    sessionRoleUser: 'User',
    sessionRoleAssistant: 'Assistant',
    sessionRoleTool: 'Tool',
    explorerLoading: 'Loading…',
    explorerFailed: 'Failed to load',
    explorerRoot: 'Workspace',
    explorerTruncated: 'Too many entries, truncated',
    explorerEmptyDir: 'Empty folder',
    explorerLevels: 'Jump to level',
    explorerExpand: 'Expand',
    explorerCollapse: 'Collapse',
    explorerEnter: 'Open',
    explorerRootName: 'Workspace root',
    explorerCrumbsAria: 'Breadcrumb',
    explorerPickFile: 'Pick this file',
    explorerPickDir: 'Pick this folder',
    previewClose: 'Close',
    previewCopyPath: 'Copy path',
    previewRefresh: 'Refresh',
    previewRender: 'Preview',
    previewSource: 'Source',
    previewMdSwitchAria: 'Toggle render or source',
    previewHtmlSwitchAria: 'Toggle render or source',
    previewLoadMore: 'Load more',
    previewTruncated: 'Content too large, showing first {n}',
    previewOfficeUnavailable: 'Office preview unavailable',
    previewRenderFailed: 'Failed to render preview',
    previewBadPayload: 'Unexpected response payload',
    previewOutside: 'Path is outside the workspace',
    previewNotFound: 'File not found',
    previewNotDirectory: 'Not a folder',
    previewTooLarge: 'File too large to preview',
    previewNotText: 'Not a text file',
    mdCopy: 'Copy',
    mdCopied: 'Copied',
    mdCode: 'Code',
    mdWrap: 'Wrap',
    mdUnwrap: 'Unwrap',
    mdFootnotes: 'Footnotes',
    cardToggle: 'Expand/Collapse',
    modalClose: 'Close',
    dockClose: 'Close panel',
    dockResize: 'Drag to resize',
    emptyText: 'No data',
    errorRetry: 'Retry',
    confirm: 'Confirm',
    cancel: 'Cancel',
    dialogOk: 'OK',
    pickerPlaceholder: 'Select…',
    pickerClear: 'None',
    pickerEmpty: 'No options',
    pickerNoMatch: 'No match',
    pickerSearch: 'Search…',
    pickerSelected: '{n} selected',
    pickerMaxReached: 'Up to {n}',
    pickerDegraded: 'List may be incomplete',
    modelProvider: 'Provider',
    modelModel: 'Model',
    modelDefault: 'Default model',
    workspaceAll: 'All workspaces',
    relNow: 'just now',
    relInJustNow: 'soon',
    relInMinutes: 'in {n}m',
    relInHours: 'in {n}h',
    relInDays: 'in {n}d',
    relInMonths: 'in {n}mo',
    relInYears: 'in {n}y',
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
