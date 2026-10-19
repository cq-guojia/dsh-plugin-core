import { createElement as h } from 'react'
import { Demo } from './index.js'
import { t } from '../i18n.js'

const TOKENS: { label: string; cssVar: string }[] = [
  { label: 'business', cssVar: '--tdt-business' },
  { label: 'success', cssVar: '--tdt-success' },
  { label: 'warning', cssVar: '--tdt-warning' },
  { label: 'danger', cssVar: '--tdt-danger' },
  { label: 'surface-1', cssVar: '--tdt-surface-1' },
  { label: 'surface-2', cssVar: '--tdt-surface-2' },
  { label: 'surface-sunken', cssVar: '--tdt-surface-sunken' },
  { label: 'border', cssVar: '--tdt-border' },
  { label: 'fg', cssVar: '--tdt-fg' },
  { label: 'fg-3', cssVar: '--tdt-fg-3' },
  { label: 'fg-4', cssVar: '--tdt-fg-4' },
]

export function DesignSection(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(
      Demo,
      { title: t('demoTokenPalette'), hint: t('designTokenHint') },
      h(
        'div',
        { style: { display: 'flex', flexWrap: 'wrap', gap: '10px' } },
        TOKENS.map((t) =>
          h(
            'div',
            { key: t.cssVar, style: { width: '104px' } },
            h('div', {
              style: {
                height: '40px', borderRadius: '6px',
                background: `var(${t.cssVar})`,
                border: '1px solid var(--tdt-border-faint)',
              },
            }),
            h('div', { style: { fontSize: '11px', marginTop: '4px' } }, t.label),
            h('div', { style: { fontSize: '10px', color: 'var(--tdt-fg-4)' } }, t.cssVar),
          ),
        ),
      ),
    ),
    h(
      Demo,
      {
        title: t('demoStyleInject'),
        hint: t('designInjectHint'),
        code: `import { createStyleKit } from 'dsh-plugin-core/design'
import { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

setStyleKit(createStyleKit({ id: 'my-plugin-ui', prefix: 'myplugin' }))
ensureControls()`,
      },
      h('div', { style: { color: 'var(--tdt-fg-3)', fontSize: '12px' } },
        t('designInjectNote')),
    ),
  )
}
