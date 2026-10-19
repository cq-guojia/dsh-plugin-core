import { createElement as h } from 'react'
import {
  formatBytes,
  formatClock,
  formatDateTime,
  formatDurationHms,
  formatRange,
  formatYmd,
  relativeFuture,
  relativePast,
} from '../../../../dist/utils/index.js'
import { Demo } from './index.js'
import { t } from '../i18n.js'

const NOW = Date.parse('2026-10-18T12:00:00.000Z')

const ROWS: [string, string, string][] = [
  ['formatDateTime', formatDateTime('2026-10-18T09:30:05.000Z', { seconds: true }), '2026-10-18 09:30:05'],
  ['formatYmd', formatYmd('2026-10-18T09:30:05.000Z'), '2026-10-18'],
  ['formatClock', formatClock('2026-10-18T09:30:05.000Z'), '09:30:05'],
  ['formatDurationHms', formatDurationHms(3_725_000), '1:02:05'],
  ['formatRange', formatRange('2026-10-18T09:00:00.000Z', '2026-10-18T10:30:00.000Z'), '同天区间'],
  ['relativePast', relativePast('2026-10-18T11:57:00.000Z', NOW), '3 分钟前'],
  ['relativeFuture', relativeFuture('2026-10-18T12:03:00.000Z', NOW), '3 分钟后'],
  ['formatBytes', formatBytes(125_829), '123 KB'],
]

export function UtilsSection(): ReturnType<typeof h> {
  return h(
    Demo,
    { title: t('demoUtilsTitle'), hint: t('utilsHint') },
    h(
      'table',
      { style: { borderCollapse: 'collapse', fontSize: '13px' } },
      h(
        'thead',
        null,
        h(
          'tr',
          null,
          h('th', { style: th }, '函数'),
          h('th', { style: th }, '返回值'),
        ),
      ),
      h(
        'tbody',
        null,
        ROWS.map(([fn, out]) =>
          h(
            'tr',
            { key: fn },
            h('td', { style: td }, fn),
            h('td', { style: td }, out),
          ),
        ),
      ),
    ),
  )
}

const th: Record<string, string | number> = { textAlign: 'left', padding: '6px 14px 6px 0', color: 'var(--tdt-fg-3)' }
const td: Record<string, string | number> = { padding: '5px 14px 5px 0', borderTop: '1px solid var(--tdt-border-faint)' }
