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
  | 'explorerPickDirAria'
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
  | 'previewFailedCode'
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
  | 'codeCopy'
  | 'codeCopied'
  // ── 会话预览（mirror/ 官方会话 UI；文案逐字对齐官方 ui-chat / ui-tool / ui-deliverables 词典）──
  | 'sessionUnknownKind'
  | 'sessionLoadOlder'
  | 'sessionProcess'
  | 'triggerRequest'
  | 'triggerGoal'
  | 'triggerAgent'
  | 'triggerTeam'
  | 'triggerSubagent'
  | 'triggerGithub'
  | 'triggerWebhook'
  | 'triggerSchedule'
  | 'triggerJob'
  | 'triggerPlugin'
  | 'triggerExplanation'
  | 'turnProcessTook'
  | 'turnProcessDeepDiving'
  | 'turnProcessWorked'
  | 'turnProcessFailed'
  | 'turnStopped'
  | 'chatDeepDiving'
  | 'thinkLabel'
  | 'durationSeconds'
  | 'durationMinutes'
  | 'durationHours'
  | 'durationMilliseconds'
  | 'retryActive'
  | 'retryCancelled'
  | 'retryStarted'
  | 'retryScheduled'
  | 'retryStatus'
  | 'retryDelay'
  | 'retryFailure'
  | 'turnErrorTitle'
  | 'accountStopped'
  | 'maxTokensTitle'
  | 'maxTokensHint'
  | 'failureAuth'
  | 'failureQuota'
  | 'failureAccountSignedOut'
  | 'failureAccountSignInRequired'
  | 'clockDate'
  | 'clockDateYear'
  | 'copyLabel'
  | 'copiedLabel'
  | 'branchLabel'
  | 'branchUnavailableLabel'
  | 'turnUsageTitle'
  | 'turnUsageModel'
  | 'turnUsageCacheHit'
  | 'turnUsageInput'
  | 'turnUsageCacheRead'
  | 'turnUsageCacheWrite'
  | 'turnUsageOutput'
  | 'turnUsageReasoning'
  | 'turnUsageConsumed'
  | 'turnUsageCount'
  | 'numberThousand'
  | 'numberMillion'
  | 'numberGroupSeparator'
  | 'stepProcessDoneThinking'
  | 'stepProcessDoneRead'
  | 'stepProcessDoneReadImage'
  | 'stepProcessDoneWrite'
  | 'stepProcessDoneSearch'
  | 'stepProcessDoneEdit'
  | 'stepProcessDoneCommands'
  | 'stepProcessDoneCode'
  | 'stepProcessDoneWebSearch'
  | 'stepProcessDoneWebFetch'
  | 'stepProcessDoneSubagents'
  | 'stepProcessDonePlan'
  | 'stepProcessDoneQuestions'
  | 'stepProcessDoneTools'
  | 'stepProcessJoinTwo'
  | 'stepProcessComma'
  | 'stepProcessSharedPrefix'
  | 'stepProcessMore'
  | 'toolTitleRead'
  | 'toolTitleReadImage'
  | 'toolTitleGrep'
  | 'toolTitleGlob'
  | 'toolTitleBash'
  | 'toolTitleWrite'
  | 'toolTitleEdit'
  | 'toolTitleCode'
  | 'toolTitleWebSearch'
  | 'toolTitleWebFetch'
  | 'toolTitleGeneric'
  | 'toolTitleSearch'
  | 'toolInputLabel'
  | 'toolOutputLabel'
  | 'rowPreparing'
  | 'rowRunning'
  | 'rowFailed'
  | 'rowStopped'
  | 'collapseLabel'
  | 'readWindow'
  | 'readCollapseAria'
  | 'readExpandAria'
  | 'readExpandRest'
  | 'terminalSignal'
  | 'terminalExitCode'
  | 'terminalNoExitCode'
  | 'terminalRunning'
  | 'terminalFailed'
  | 'terminalDone'
  | 'terminalNoOutput'
  | 'terminalCollapseAria'
  | 'terminalExpandAria'
  | 'terminalExpandRest'
  | 'terminalSendInput'
  | 'terminalSession'
  | 'codeBlockLabel'
  | 'diffWrapLabel'
  | 'diffUnwrapLabel'
  | 'diffCollapseAria'
  | 'diffExpandAria'
  | 'diffExpandRest'
  | 'sessionArchived'
  | 'sessionHeading'
  | 'changesSingle'
  | 'changesMulti'
  | 'changesBinary'
  | 'changesAll'
  | 'changesCollapse'
  | 'changesOversized'
  | 'continueBranch'
  | 'forkConfirmTitle'
  | 'forkConfirmText'
  | 'forkConfirmAccept'
  | 'forkWorking'
  | 'forkFailed'
  | 'deliverRowTitle'
  | 'deliverRowPreparing'
  | 'deliverRowRunning'
  | 'deliverRowOk'
  | 'deliverRowError'
  | 'deliverRowStopped'
  | 'deliverFileLabel'
  | 'deliverPreviewHint'
  | 'deliverPreviewCard'
  | 'deliverAll'
  | 'deliverCollapse'
  | 'deliverExpandAria'
  | 'deliverCollapseAria'
  | 'composerPlaceholder'
  | 'composerHint'

/** 文案函数：`vars` 用于填 `{n}` 这类占位。 */
export type Translate = (key: UtilMessageKey, vars?: Record<string, number | string>) => string

const DICT: Record<Locale, Record<UtilMessageKey, string>> = {
  zh: {
    sessionLoading: '加载会话…',
    sessionFailed: '会话加载失败',
    sessionEmpty: '该会话暂无内容',
    explorerLoading: '加载中…',
    explorerFailed: '加载失败',
    explorerRoot: '工作区',
    explorerTruncated: '条目过多，已截断',
    explorerEmptyDir: '空目录',
    explorerLevels: '选择层级',
    explorerExpand: '展开',
    explorerCollapse: '收起',
    explorerEnter: '进入',
    explorerRootName: '（工作区根目录）',
    explorerCrumbsAria: '目录路径',
    explorerPickFile: '选择此文件',
    explorerPickDir: '选择',
    explorerPickDirAria: '选择此目录（连带其下所有文件）',
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
    previewFailedCode: '加载失败（{code}）',
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
    codeCopy: '复制',
    codeCopied: '已复制',
    sessionUnknownKind: '未支持的节点类型：',
    sessionLoadOlder: '加载更早记录',
    sessionProcess: '过程',
    triggerRequest: '收到执行请求',
    triggerGoal: '继续执行目标',
    triggerAgent: '收到任务消息',
    triggerTeam: '收到团队消息',
    triggerSubagent: '子任务状态更新',
    triggerGithub: '收到 GitHub 事件',
    triggerWebhook: '收到外部事件',
    triggerSchedule: '定时任务',
    triggerJob: '后台任务状态更新',
    triggerPlugin: '插件状态更新',
    triggerExplanation: '这条通知触发了本轮回复。',
    turnProcessTook: '用时 {duration}',
    turnProcessDeepDiving: '深度求索中，用时{duration}',
    turnProcessWorked: '已完成工作',
    turnProcessFailed: '处理失败',
    turnStopped: '已停止',
    chatDeepDiving: '深度求索中',
    thinkLabel: '思考',
    durationSeconds: '{seconds}秒',
    durationMinutes: '{minutes}分{seconds}秒',
    durationHours: '{hours}小时{minutes}分{seconds}秒',
    durationMilliseconds: '{milliseconds}毫秒',
    retryActive: '正在重试模型请求',
    retryCancelled: '模型请求重试已取消',
    retryStarted: '已重试模型请求',
    retryScheduled: '等待重试模型请求',
    retryStatus: '{label}（{retry}/{maximum}） · {seconds}s',
    retryDelay: '重试延迟：',
    retryFailure: '失败原因：',
    turnErrorTitle: '本轮运行失败',
    accountStopped: '任务已停止',
    maxTokensTitle: '已达到输出 token 上限',
    maxTokensHint: '回答被截断，已有输出保留在对话中。发送“继续”可让模型接着输出。',
    failureAuth: 'API 密钥无效',
    failureQuota: '当前请求的额度已用尽',
    failureAccountSignedOut: '任务已因退出 DeepSeek 登录而停止。',
    failureAccountSignInRequired: '请先登录 DeepSeek，并确认请求地址支持账号认证。',
    clockDate: '{m}月{d}日',
    clockDateYear: '{y}年{m}月{d}日',
    copyLabel: '复制',
    copiedLabel: '已复制',
    branchLabel: '在新对话中分支',
    branchUnavailableLabel: '只读会话记录不可分支',
    turnUsageTitle: '本轮用量',
    turnUsageModel: '提供方 / 模型',
    turnUsageCacheHit: '缓存命中',
    turnUsageInput: '未缓存输入',
    turnUsageCacheRead: '缓存读取',
    turnUsageCacheWrite: '缓存写入',
    turnUsageOutput: '输出',
    turnUsageReasoning: '（其中推理 {tokens}）',
    turnUsageConsumed: '用量 {total}',
    turnUsageCount: '{count} tok',
    numberThousand: '{value}K',
    numberMillion: '{value}M',
    numberGroupSeparator: ',',
    stepProcessDoneThinking: '已完成分析',
    stepProcessDoneRead: '已读取文件',
    stepProcessDoneReadImage: '已读取图片',
    stepProcessDoneWrite: '已写入文件',
    stepProcessDoneSearch: '已搜索代码',
    stepProcessDoneEdit: '修改了文件',
    stepProcessDoneCommands: '执行了命令',
    stepProcessDoneCode: '运行了代码',
    stepProcessDoneWebSearch: '已搜索网页',
    stepProcessDoneWebFetch: '已访问网页',
    stepProcessDoneSubagents: '已协调子智能体',
    stepProcessDonePlan: '更新了计划',
    stepProcessDoneQuestions: '向用户提出了问题',
    stepProcessDoneTools: '已调用工具',
    stepProcessJoinTwo: '{first}并{second}',
    stepProcessComma: '，',
    stepProcessSharedPrefix: '已',
    stepProcessMore: '{title}等',
    toolTitleRead: '读取',
    toolTitleReadImage: '读取图片',
    toolTitleGrep: '搜索文件内容',
    toolTitleGlob: '查找文件',
    toolTitleBash: '运行命令',
    toolTitleWrite: '写入',
    toolTitleEdit: '编辑',
    toolTitleCode: '代码',
    toolTitleWebSearch: '网页搜索',
    toolTitleWebFetch: '网页获取',
    toolTitleGeneric: '工具调用',
    toolTitleSearch: '搜索',
    toolInputLabel: '输入',
    toolOutputLabel: '输出',
    rowPreparing: '正在准备调用',
    rowRunning: '运行中',
    rowFailed: '失败',
    rowStopped: '已停止',
    collapseLabel: '收起',
    readWindow: '显示 {shown} / {total} 行',
    readCollapseAria: '收起内容',
    readExpandAria: '展开其余 {count} 行',
    readExpandRest: '… 其余 {count} 行',
    terminalSignal: '信号 {signal}',
    terminalExitCode: '退出码 {code}',
    terminalNoExitCode: '未正常退出',
    terminalRunning: '运行中',
    terminalFailed: '失败',
    terminalDone: '已完成',
    terminalNoOutput: '无输出',
    terminalCollapseAria: '收起输出',
    terminalExpandAria: '展开其余 {n} 行输出',
    terminalExpandRest: '… 其余 {n} 行',
    terminalSendInput: '（发送输入）',
    terminalSession: '终端 {sessionId}',
    codeBlockLabel: '代码块',
    diffWrapLabel: '自动换行',
    diffUnwrapLabel: '取消换行',
    diffCollapseAria: '收起差异',
    diffExpandAria: '展开其余 {count} 行差异',
    diffExpandRest: '… 其余 {count} 行',
    sessionArchived: '已归档',
    sessionHeading: '会话预览',
    changesSingle: '已编辑 {name}',
    changesMulti: '已编辑 {count} 个文件',
    changesBinary: '二进制文件',
    changesAll: '全部 {count} 个文件',
    changesCollapse: '收起',
    changesOversized: '文件过大',
    continueBranch: '继续对话',
    forkConfirmTitle: '开分支继续对话',
    forkConfirmText: '是否需要基于此会话开一个新分支继续对话？原会话保持只读留档，新分支复制本会话内容并可继续对话。',
    forkConfirmAccept: '开分支并跳转',
    forkWorking: '正在开分支…',
    forkFailed: '开分支失败：{error}',
    deliverRowTitle: '交付文件',
    deliverRowPreparing: '准备交付',
    deliverRowRunning: '正在交付',
    deliverRowOk: '已交付',
    deliverRowError: '交付失败',
    deliverRowStopped: '已中断',
    deliverFileLabel: '文件',
    deliverPreviewHint: '预览',
    deliverPreviewCard: '预览 {name}',
    deliverAll: '全部 {count} 个文件',
    deliverCollapse: '收起',
    deliverExpandAria: '展开全部 {count} 个交付文件',
    deliverCollapseAria: '收起交付文件列表',
    composerPlaceholder: '继续说点什么…',
    composerHint: '点「确定」后基于本会话开分支，并在官方会话中开始这轮对话',
  },
  en: {
    sessionLoading: 'Loading session…',
    sessionFailed: 'Failed to load session',
    sessionEmpty: 'No content in this session',
    explorerLoading: 'Loading…',
    explorerFailed: 'Failed to load',
    explorerRoot: 'Workspace',
    explorerTruncated: 'Too many entries, truncated',
    explorerEmptyDir: 'Empty folder',
    explorerLevels: 'Jump to level',
    explorerExpand: 'Expand',
    explorerCollapse: 'Collapse',
    explorerEnter: 'Open',
    explorerRootName: '(workspace root)',
    explorerCrumbsAria: 'Breadcrumb',
    explorerPickFile: 'Pick this file',
    explorerPickDir: 'Select',
    explorerPickDirAria: 'Pick this folder (with everything under it)',
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
    previewFailedCode: 'Failed to load ({code})',
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
    codeCopy: 'Copy',
    codeCopied: 'Copied',
    sessionUnknownKind: 'Unsupported node kind: ',
    sessionLoadOlder: 'Load earlier messages',
    sessionProcess: 'Process',
    triggerRequest: 'Execution request received',
    triggerGoal: 'Continuing the goal',
    triggerAgent: 'Task message received',
    triggerTeam: 'Team message received',
    triggerSubagent: 'Subagent status update',
    triggerGithub: 'GitHub event received',
    triggerWebhook: 'External event received',
    triggerSchedule: 'Scheduled task',
    triggerJob: 'Background task status update',
    triggerPlugin: 'Plugin status update',
    triggerExplanation: 'This notification triggered the reply below.',
    turnProcessTook: 'Took {duration}',
    turnProcessDeepDiving: 'Thinking, {duration}',
    turnProcessWorked: 'Work completed',
    turnProcessFailed: 'Failed',
    turnStopped: 'Stopped',
    chatDeepDiving: 'Thinking',
    thinkLabel: 'Think',
    durationSeconds: '{seconds}s',
    durationMinutes: '{minutes}m {seconds}s',
    durationHours: '{hours}h {minutes}m {seconds}s',
    durationMilliseconds: '{milliseconds}ms',
    retryActive: 'Retrying model request',
    retryCancelled: 'Model request retry cancelled',
    retryStarted: 'Retried model request',
    retryScheduled: 'Waiting to retry model request',
    retryStatus: '{label} ({retry}/{maximum}) · {seconds}s',
    retryDelay: 'Retry delay: ',
    retryFailure: 'Failure reason: ',
    turnErrorTitle: 'This turn failed',
    accountStopped: 'Task stopped',
    maxTokensTitle: 'Output token limit reached',
    maxTokensHint: 'The reply was cut off; earlier output is preserved in the conversation. Send "continue" to let the model resume.',
    failureAuth: 'API key is invalid',
    failureQuota: 'Request quota exhausted.',
    failureAccountSignedOut: 'Stopped because you signed out of DeepSeek.',
    failureAccountSignInRequired: 'Sign in to DeepSeek and ensure the request destination supports account authentication.',
    clockDate: '{m}/{d}',
    clockDateYear: '{y}/{m}/{d}',
    copyLabel: 'Copy',
    copiedLabel: 'Copied',
    branchLabel: 'Branch into a new conversation',
    branchUnavailableLabel: 'A read-only transcript cannot be branched',
    turnUsageTitle: 'Turn usage',
    turnUsageModel: 'Provider / model',
    turnUsageCacheHit: 'Cache hit',
    turnUsageInput: 'Uncached input',
    turnUsageCacheRead: 'Cached input',
    turnUsageCacheWrite: 'Cache write',
    turnUsageOutput: 'Output',
    turnUsageReasoning: ' ({tokens} reasoning)',
    turnUsageConsumed: 'Usage {total}',
    turnUsageCount: '{count} tok',
    numberThousand: '{value}K',
    numberMillion: '{value}M',
    numberGroupSeparator: ',',
    stepProcessDoneThinking: 'Analysis completed',
    stepProcessDoneRead: 'Read files',
    stepProcessDoneReadImage: 'Read images',
    stepProcessDoneWrite: 'Wrote files',
    stepProcessDoneSearch: 'Searched code',
    stepProcessDoneEdit: 'Edited files',
    stepProcessDoneCommands: 'Ran commands',
    stepProcessDoneCode: 'Ran code',
    stepProcessDoneWebSearch: 'Searched the web',
    stepProcessDoneWebFetch: 'Fetched web pages',
    stepProcessDoneSubagents: 'Coordinated subagents',
    stepProcessDonePlan: 'Updated the plan',
    stepProcessDoneQuestions: 'Asked you questions',
    stepProcessDoneTools: 'Called tools',
    stepProcessJoinTwo: '{first} and {second}',
    stepProcessComma: ', ',
    stepProcessSharedPrefix: '',
    stepProcessMore: '{title}, etc.',
    toolTitleRead: 'Read',
    toolTitleReadImage: 'Read image',
    toolTitleGrep: 'Grep',
    toolTitleGlob: 'Glob',
    toolTitleBash: 'Bash',
    toolTitleWrite: 'Write',
    toolTitleEdit: 'Edit',
    toolTitleCode: 'Code',
    toolTitleWebSearch: 'Search',
    toolTitleWebFetch: 'Fetch',
    toolTitleGeneric: 'Tool call',
    toolTitleSearch: 'Search',
    toolInputLabel: 'IN',
    toolOutputLabel: 'OUT',
    rowPreparing: 'Preparing tool call',
    rowRunning: 'Running',
    rowFailed: 'Failed',
    rowStopped: 'Stopped',
    collapseLabel: 'Collapse',
    readWindow: 'Showing {shown} of {total} lines',
    readCollapseAria: 'Collapse content',
    readExpandAria: 'Expand {count} more lines',
    readExpandRest: '… {count} more lines',
    terminalSignal: 'signal {signal}',
    terminalExitCode: 'exit code {code}',
    terminalNoExitCode: 'no exit code',
    terminalRunning: 'Running',
    terminalFailed: 'Failed',
    terminalDone: 'Done',
    terminalNoOutput: 'No output',
    terminalCollapseAria: 'Collapse output',
    terminalExpandAria: 'Expand the remaining {n} output lines',
    terminalExpandRest: '… {n} more lines',
    terminalSendInput: '(send input)',
    terminalSession: 'Terminal {sessionId}',
    codeBlockLabel: 'Code',
    diffWrapLabel: 'Wrap lines',
    diffUnwrapLabel: 'Unwrap lines',
    diffCollapseAria: 'Collapse diff',
    diffExpandAria: 'Expand {count} more diff lines',
    diffExpandRest: '… {count} more lines',
    sessionArchived: 'Archived',
    sessionHeading: 'Session preview',
    changesSingle: 'Edited {name}',
    changesMulti: 'Edited {count} files',
    changesBinary: 'Binary file',
    changesAll: 'All {count} files',
    changesCollapse: 'Collapse',
    changesOversized: 'File too large',
    continueBranch: 'Continue conversation',
    forkConfirmTitle: 'Fork to continue',
    forkConfirmText: 'Start a new branch from this session to continue the conversation? The original stays read-only; the branch copies this conversation and can continue.',
    forkConfirmAccept: 'Fork & open',
    forkWorking: 'Forking…',
    forkFailed: 'Fork failed: {error}',
    deliverRowTitle: 'Deliver files',
    deliverRowPreparing: 'Preparing delivery',
    deliverRowRunning: 'Delivering',
    deliverRowOk: 'Delivered',
    deliverRowError: 'Delivery failed',
    deliverRowStopped: 'Interrupted',
    deliverFileLabel: 'File',
    deliverPreviewHint: 'Preview',
    deliverPreviewCard: 'Preview {name}',
    deliverAll: 'All {count} files',
    deliverCollapse: 'Collapse',
    deliverExpandAria: 'Expand all {count} delivered files',
    deliverCollapseAria: 'Collapse the delivered-files list',
    composerPlaceholder: 'Say something to continue…',
    composerHint: 'Confirm forks a branch from this session and starts this turn in the official chat',
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
