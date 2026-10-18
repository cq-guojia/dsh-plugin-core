/**
 * utils 自带的最小多语言。
 *
 * 原则（需求文档 §5.4）：**核心提供什么，核心就负责它的多语言** —— utils 里要吐文案的函数
 * （如相对时间）自带中英字典；插件**自己界面**的文案仍由插件自己管，这里不提供插件级 i18n 框架。
 * 需要覆盖时传自己的 `t` 进来即可。
 */
const DICT = {
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
        explorerUnsupported: '暂不支持预览该类型',
        explorerRoot: '工作区',
        explorerUp: '上一级',
        explorerRefresh: '刷新',
        explorerTruncated: '条目过多，已截断',
        explorerEmptyDir: '空目录',
        modalClose: '关闭',
        emptyText: '暂无数据',
        errorTitle: '出错了',
        errorRetry: '重试',
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
        explorerUnsupported: 'Preview not supported',
        explorerRoot: 'Workspace',
        explorerUp: 'Up',
        explorerRefresh: 'Refresh',
        explorerTruncated: 'Too many entries, truncated',
        explorerEmptyDir: 'Empty folder',
        modalClose: 'Close',
        emptyText: 'No data',
        errorTitle: 'Something went wrong',
        errorRetry: 'Retry',
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
};
let current = 'zh';
export function setLocale(locale) {
    current = locale;
}
export function getLocale() {
    return current;
}
/** 用内置字典翻译一个 key；未知 key 直接回退 key 本身（不抛、不空白）。 */
export function t(key, vars) {
    const template = DICT[current][key] ?? DICT.zh[key] ?? key;
    if (vars === undefined)
        return template;
    return template.replace(/\{(\w+)\}/g, (whole, name) => {
        const value = vars[name];
        return value === undefined ? whole : String(value);
    });
}
//# sourceMappingURL=i18n.js.map