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
  'Button', 'DiffBlock', 'DisclosureRow', 'FileTypeIcon', 'HoverCard',
  'IconAgentPresetOutlineRegular', 'IconAlarmClockOutlineRegular', 'IconApiOutlineRegular',
  'IconArchiveOutlineRegular', 'IconBranchOutlineRegular', 'IconBrowseOutlineRegular',
  'IconCheckOutlineRegular', 'IconChevronDownOutlineRegular', 'IconChevronRightOutlineRegular',
  'IconChevronUpOutlineRegular', 'IconCloseOutlineRegular', 'IconCodeOutlineRegular',
  'IconContextInjectionOutlineRegular', 'IconCopyOutlineRegular', 'IconCordisPluginOutlineRegular',
  'IconDatabaseOutlineRegular', 'IconDeliverDocRegular', 'IconEditOutlineRegular',
  'IconFolderCloseRegular', 'IconFolderOpenOutlineRegular', 'IconGlobeOutlineRegular',
  'IconGoalOutlineRegular', 'IconNewChatOutlineRegular', 'IconPaperPlaneOutlineRegular',
  'IconPlanOutlineRegular', 'IconQuestionOutlineRegular', 'IconQueueOutlineRegular',
  'IconRefreshOutlineRegular', 'IconSearchOutlineRegular', 'IconSparkleRegular',
  'IconThinkOutlineRegular', 'MarkdownDelegateProvider', 'MarkdownText', 'ReadBlock',
  'SearchBlock', 'StateDot', 'TerminalBlock', 'TextShimmer', 'Tooltip', 'WebBlock',
  'diffTotals', 'fileExtension', 'languageForPath',
  'useAnchoredPosition', 'useCodeHighlighter', 'useDismissOnOutsidePointer', 'writeClipboard',
]

const stub = (name) => {
  const fn = () => null
  fn.displayName = name
  return fn
}

const exported = {}
for (const name of NAMES) exported[name] = stub(name)
// `official.ts` 还 `export { Official }`，消费方可能从 official.js 拿命名空间对象。
exported.Official = Object.fromEntries(NAMES.map((name) => [name, stub(name)]))

export const {
  Button, DiffBlock, DisclosureRow, FileTypeIcon, HoverCard,
  IconAgentPresetOutlineRegular, IconAlarmClockOutlineRegular, IconApiOutlineRegular,
  IconArchiveOutlineRegular, IconBranchOutlineRegular, IconBrowseOutlineRegular,
  IconCheckOutlineRegular, IconChevronDownOutlineRegular, IconChevronRightOutlineRegular,
  IconChevronUpOutlineRegular, IconCloseOutlineRegular, IconCodeOutlineRegular,
  IconContextInjectionOutlineRegular, IconCopyOutlineRegular, IconCordisPluginOutlineRegular,
  IconDatabaseOutlineRegular, IconDeliverDocRegular, IconEditOutlineRegular,
  IconFolderCloseRegular, IconFolderOpenOutlineRegular, IconGlobeOutlineRegular,
  IconGoalOutlineRegular, IconNewChatOutlineRegular, IconPaperPlaneOutlineRegular,
  IconPlanOutlineRegular, IconQuestionOutlineRegular, IconQueueOutlineRegular,
  IconRefreshOutlineRegular, IconSearchOutlineRegular, IconSparkleRegular,
  IconThinkOutlineRegular, MarkdownDelegateProvider, MarkdownText, ReadBlock,
  SearchBlock, StateDot, TerminalBlock, TextShimmer, Tooltip, WebBlock,
  diffTotals, fileExtension, languageForPath,
  useAnchoredPosition, useCodeHighlighter, useDismissOnOutsidePointer, writeClipboard, Official,
} = exported
