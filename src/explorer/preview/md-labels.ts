// 官方 MarkdownText 的本地化文案（labels 需引用稳定，从 core 字典构造）。
import type { MarkdownLabels } from '../../ui/official.js'
import { t } from '../../utils/i18n.js'

export function markdownLabels(): MarkdownLabels {
  return {
    code: {
      copyLabel: t('mdCopy'),
      copiedLabel: t('mdCopied'),
      toolbarLabels: { codeLabel: t('mdCode'), wrapLabel: t('mdWrap'), unwrapLabel: t('mdUnwrap') },
    },
    footnotes: t('mdFootnotes'),
  }
}
