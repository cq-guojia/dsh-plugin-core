import { createElement, Fragment } from 'react'

// `@deepseek-ai/dsh-client-ui-primitives` 的测试替身（2026-11-03，用户定「不依赖」）。
//
// 为什么需要它：`src/ui/official.ts` 里有一句 `export * from '@deepseek-ai/dsh-client-ui-primitives'`，
// 而那个包只存在于宿主里 —— Node 直接 import 会 ERR_MODULE_NOT_FOUND。SSR 测试只要图里有任何模块
// 从 official.js 取具名导出（图标、hooks），链接阶段就会失败。
//
// 这里是**极简替身**：每个名字都是一个返回 null 的占位函数。只用于「渲染出结构」的断言，
// 不模拟任何真实行为（图标画不出、hook 不返回数据）。新增官方依赖时，把名字补进下面的表 ——
// 漏了会在链接阶段报 "does not provide an export named ..."，指得很准。
const NAMES = [
  'Button', 'CodeBlock', 'CommandText', 'DiffBlock', 'DisclosureRow', 'FileTypeIcon', 'HoverCard', 'ImageLightbox',
  'IconAgentPresetOutlineRegular', 'IconAlarmClockOutlineRegular', 'IconApiOutlineRegular',
  'IconArchiveOutlineRegular', 'IconBranchOutlineRegular', 'IconBrowseOutlineRegular',
  'IconCheckOutlineRegular', 'IconChevronDownOutlineRegular', 'IconChevronLeftOutlineRegular',
  'IconChevronRightOutlineRegular',
  'IconChevronUpOutlineRegular', 'IconClockOutlineRegular', 'IconCloseOutlineRegular', 'IconCodeOutlineRegular',
  'IconContextInjectionOutlineRegular', 'IconCopyOutlineRegular', 'IconCordisPluginOutlineRegular',
  'IconDatabaseOutlineRegular', 'IconDeliverDocRegular', 'IconEditOutlineRegular',
  'IconFolderCloseRegular', 'IconFolderOpenOutlineRegular', 'IconGlobeOutlineRegular',
  'IconGoalOutlineRegular', 'IconNewChatOutlineRegular', 'IconNowrapFillRegular',
  'IconPaperPlaneOutlineRegular',
  'IconPlanOutlineRegular', 'IconPlayOutlineRegular', 'IconQuestionOutlineRegular', 'IconQueueOutlineRegular',
  'IconRefreshOutlineRegular', 'IconSearchOutlineRegular', 'IconSkillOutlineRegular', 'IconSparkleRegular',
  'IconThinkOutlineRegular', 'IconUsersOutlineRegular', 'IconWrapFillRegular', 'MarkdownDelegateProvider', 'MarkdownText', 'ReadBlock',
  'SearchBlock', 'StateDot', 'Tag', 'TerminalBlock', 'TextShimmer', 'Tooltip', 'UserMessageBubble', 'UserTextRun', 'WebBlock',
  'diffTotals', 'fileExtension', 'fileSizeText', 'languageForPath',
  'useCodeHighlighter', 'useDismissOnOutsidePointer', 'writeClipboard',
]

const stub = (name) => {
  const fn = () => null
  fn.displayName = name
  return fn
}

const exported = {}
for (const name of NAMES) exported[name] = stub(name)
// UserMessageBubble 是原生 div 包装：渲染级自检要看到它透传的 data-* 钩子，故不返回 null。
exported.UserMessageBubble = (props) => createElement('div', props)
// Tag 是原生 span + data-tone：渲染级自检要看到胶囊的 tone，故不返回 null。
exported.Tag = ({ tone = 'outline', className, children }) =>
  createElement('span', { className, 'data-tone': tone }, children)
// UserTextRun 是逐字纯文本：自检要看到 ## / ** 原样保留，故返回真实文本。
exported.UserTextRun = ({ text }) => createElement('span', null, text)
// Button 是真按钮：审批卡自检要看到「拒绝 / 允许一次」两个可点按钮（官方 variant 记进 data-variant）。
exported.Button = ({ variant = 'ghost', size, icon, children, ...rest }) =>
  createElement('button', { ...rest, 'data-variant': variant }, children)
// CommandText 是命令滚动槽：自检要看到后台命令原文与 className，故返回真实文本。
exported.CommandText = ({ text, className }) => createElement('span', { className }, text)
// ImageLightbox 是 portal：SSR 不支持 createPortal，替身改成普通容器，自检能断言 src 与标签。
exported.ImageLightbox = ({ src, alt }) => createElement('div', { 'data-image-lightbox': src, 'aria-label': alt })
// TextShimmer 只加高光、不吞 children：自检要看到它包住的 skill 标题与摘要。
exported.TextShimmer = ({ children }) => createElement(Fragment, null, children)
// DisclosureRow 把摘要放在 collapsedContent（不是 children），且 keepContentWhenOpen 时两槽都在：
// 替身分槽标记，断言才能证明 fileLinks / sep 真的落在 collapsedContent 而不是展开体里。
exported.DisclosureRow = ({ collapsedContent, children, open, rowClassName }) =>
  createElement('div', {
    'data-disclosure-row': '',
    'data-open': open === true ? 'true' : 'false',
    className: rowClassName,
  },
    createElement('span', { 'data-slot': 'collapsed' }, collapsedContent),
    createElement('span', { 'data-slot': 'expanded' }, children))
// `official.ts` 还 `export { Official }`，消费方可能从 official.js 拿命名空间对象。
exported.Official = Object.fromEntries(NAMES.map((name) => [name, stub(name)]))

export const {
  Button, CommandText, DiffBlock, DisclosureRow, FileTypeIcon, HoverCard, ImageLightbox,
  IconAgentPresetOutlineRegular, IconAlarmClockOutlineRegular, IconApiOutlineRegular,
  IconArchiveOutlineRegular, IconBranchOutlineRegular, IconBrowseOutlineRegular,
  IconCheckOutlineRegular, IconChevronDownOutlineRegular, IconChevronLeftOutlineRegular,
  IconChevronRightOutlineRegular,
  IconChevronUpOutlineRegular, IconClockOutlineRegular, IconCloseOutlineRegular, IconCodeOutlineRegular,
  IconContextInjectionOutlineRegular, IconCopyOutlineRegular, IconCordisPluginOutlineRegular,
  IconDatabaseOutlineRegular, IconDeliverDocRegular, IconEditOutlineRegular,
  IconFolderCloseRegular, IconFolderOpenOutlineRegular, IconGlobeOutlineRegular,
  IconGoalOutlineRegular, IconNewChatOutlineRegular, IconNowrapFillRegular, IconPaperPlaneOutlineRegular,
  IconPlanOutlineRegular, IconPlayOutlineRegular, IconQuestionOutlineRegular, IconQueueOutlineRegular,
  IconRefreshOutlineRegular, IconSearchOutlineRegular, IconSkillOutlineRegular, IconSparkleRegular,
  IconWrapFillRegular,
  CodeBlock, IconThinkOutlineRegular, IconUsersOutlineRegular, MarkdownDelegateProvider, MarkdownText, ReadBlock,
  SearchBlock, StateDot, Tag, TerminalBlock, TextShimmer, Tooltip, UserMessageBubble, UserTextRun, WebBlock,
  diffTotals, fileExtension, fileSizeText, languageForPath,
  useCodeHighlighter, useDismissOnOutsidePointer, writeClipboard, Official,
} = exported
