import { createElement as h } from 'react'
import { Example, DocProse, DocApi } from '../doc.js'
import { t } from '../i18n.js'

const TOKENS: { label: string; cssVar: string }[] = [
  { label: 'business', cssVar: '--dshpc-business' },
  { label: 'success', cssVar: '--dshpc-success' },
  { label: 'warning', cssVar: '--dshpc-warning' },
  { label: 'danger', cssVar: '--dshpc-danger' },
  { label: 'surface-1', cssVar: '--dshpc-surface-1' },
  { label: 'surface-2', cssVar: '--dshpc-surface-2' },
  { label: 'surface-sunken', cssVar: '--dshpc-surface-sunken' },
  { label: 'border', cssVar: '--dshpc-border' },
  { label: 'fg', cssVar: '--dshpc-fg' },
  { label: 'fg-3', cssVar: '--dshpc-fg-3' },
  { label: 'fg-4', cssVar: '--dshpc-fg-4' },
]

/**
 * 设计基础。
 * 原「设计基础」组的四条（Token 色板 / 暗色主题 / 样式注入 / 命名契约）并成一页。
 * 文档体（prose / api）吃 docData['foundation']；token 色板 / 暗色开关 / 样式注入三块是 live 演示，保留。
 */
export function FoundationPage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(DocProse, { id: 'foundation' }),
    // Token 色板：颜色全部来自 design 的 token。
    h(
      Example,
      { title: t('demoTokenPalette'), hint: t('tokensHint') },
      h(
        'div',
        { style: { display: 'flex', flexWrap: 'wrap', gap: '10px' } },
        TOKENS.map((item) =>
          h(
            'div',
            { key: item.cssVar, style: { width: '104px' } },
            h('div', {
              style: {
                height: '40px', borderRadius: '6px',
                background: `var(${item.cssVar})`,
                border: '1px solid var(--dshpc-border-faint)',
              },
            }),
            h('div', { style: { fontSize: '11px', marginTop: '4px' } }, item.label),
            h('div', { style: { fontSize: '10px', color: 'var(--dshpc-fg-4)' } }, item.cssVar),
          ),
        ),
      ),
    ),
    // 暗色主题。判据是在**渲染时**读的，宿主改明暗后重开本页才更新。
    h(
      Example,
      { title: 'body[data-ds-dark-theme]', hint: t('darkHint') },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        h('span', { style: { fontFamily: 'var(--dshpc-font-mono)', fontSize: '12px', color: 'var(--dshpc-fg-3)' } },
          t('darkNow')),
        h('code', {
          style: {
            fontFamily: 'var(--dshpc-font-mono)', fontSize: '13px', padding: '3px 10px',
            borderRadius: '6px', background: 'var(--dshpc-open-bg)',
            color: typeof document !== 'undefined' && document.body.hasAttribute('data-ds-dark-theme')
              ? 'var(--dshpc-success)' : 'var(--dshpc-fg-2)',
          },
        }, typeof document !== 'undefined' && document.body.hasAttribute('data-ds-dark-theme')
          ? 'true（暗色）' : 'false（亮色）'),
      ),
    ),
    h(
      Example,
      {
        title: t('demoStyleInject'),
        hint: t('injectHint'),
        code: `import { createStyleKit } from 'dsh-plugin-core/design'
import { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

setStyleKit(createStyleKit({ id: 'dsh-plugin-core-demo-ui' }))
ensureControls()`,
      },
      h('div', { style: { color: 'var(--dshpc-fg-3)', fontSize: '12px' } }, t('designInjectNote')),
    ),
    // 命名契约（原「命名与前缀契约」页）的 API 表 —— 直接吃 docData['foundation'] 的 api 段。
    h(DocApi, { id: 'foundation' }),
  )
}
