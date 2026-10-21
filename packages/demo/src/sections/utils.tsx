import { createElement as h } from 'react'
import {
  formatBytes,
  formatClock,
  formatDateTime,
  formatDurationHms,
  formatRange,
  formatYmd,
  getLocale,
  relativeFuture,
  relativePast,
} from '../../../../dist/utils/index.js'
import { Placeholder } from './index.js'
import { Example, CodeOnly, ApiTable, Note, type ApiRow } from '../doc.js'
import { t } from '../i18n.js'

const CODE_DATE = `// 日期时间格式化（全部走当前 locale）
formatDateTime('2026-10-18T09:30:05.000Z', { seconds: true })  // 2026-10-18 09:30:05
formatYmd('2026-10-18T09:30:05.000Z')                          // 2026-10-18
formatClock('2026-10-18T09:30:05.000Z')                        // 09:30:05
formatDurationHms(3_725_000)                                   // 1:02:05
formatRange('2026-10-18T09:00', '2026-10-18T10:30')            // 09:00 – 10:30
relativePast('2026-10-18T11:57', now)                          // 3 分钟前
relativeFuture('2026-10-18T12:03', now)                        // 3 分钟后`

const CODE_NUMBER = `formatBytes(125_829)   // 123 KB`

const CODE_I18N = `import { getLocale, setLocale, t } from 'dsh-plugin-core/utils'

getLocale()     // 当前 locale（由宿主驱动）
setLocale('en') // 切语言（宿主覆盖时以此为准）
t('someKey')    // 取当前语言的文案`

const CODE_UTILS_USAGE = `pnpm add dsh-plugin-core

import {
  formatDateTime, formatYmd, formatClock, formatDurationHms, formatRange,
  relativePast, relativeFuture, formatBytes, getLocale, setLocale, t,
} from 'dsh-plugin-core/utils'`

/** 日期时间格式化函数一览（与 src/utils/datetime.ts 导出逐条对齐）。 */
const DATE_API: readonly ApiRow[] = [
  { name: 'formatDateTime', type: '(iso, opts?) => string', def: '—', descKey: 'apiDateDateTime' },
  { name: 'formatYmd', type: '(iso) => string', def: '—', descKey: 'apiDateYmd' },
  { name: 'formatClock', type: '(iso) => string', def: '—', descKey: 'apiDateClock' },
  { name: 'formatDurationHms', type: '(ms) => string', def: '—', descKey: 'apiDateDuration' },
  { name: 'formatRange', type: '(from, to) => string', def: '—', descKey: 'apiDateRange' },
  { name: 'relativePast', type: '(iso, now) => string', def: '—', descKey: 'apiDatePast' },
  { name: 'relativeFuture', type: '(iso, now) => string', def: '—', descKey: 'apiDateFuture' },
]

/** 数字 / 体积格式化（与 src/utils/format.ts 导出对齐）。 */
const NUMBER_API: readonly ApiRow[] = [
  { name: 'formatBytes', type: '(bytes) => string', def: '—', descKey: 'apiNumberBytes' },
]

/** 多语言 API（与 src/utils/i18n.ts 导出对齐）。 */
const I18N_API: readonly ApiRow[] = [
  { name: 'getLocale', type: '() => string', def: '—', descKey: 'apiI18nGet' },
  { name: 'setLocale', type: '(locale) => void', def: '—', descKey: 'apiI18nSet' },
  { name: 't', type: '(key) => string', def: '—', descKey: 'apiI18nT' },
]

const NOW = Date.parse('2026-10-18T12:00:00.000Z')

const DATE_ROWS: [string, string][] = [
  ['formatDateTime', formatDateTime('2026-10-18T09:30:05.000Z', { seconds: true })],
  ['formatYmd', formatYmd('2026-10-18T09:30:05.000Z')],
  ['formatClock', formatClock('2026-10-18T09:30:05.000Z')],
  ['formatDurationHms', formatDurationHms(3_725_000)],
  ['formatRange', formatRange('2026-10-18T09:00:00.000Z', '2026-10-18T10:30:00.000Z')],
  ['relativePast', relativePast('2026-10-18T11:57:00.000Z', NOW)],
  ['relativeFuture', relativeFuture('2026-10-18T12:03:00.000Z', NOW)],
]

const NUMBER_ROWS: [string, string][] = [
  ['formatBytes', formatBytes(125_829)],
]

/** 一张「函数名 → 返回值」的速查表（这是原 demo 就有的形态，保留）。 */
function FnTable(props: { rows: [string, string][] }): ReturnType<typeof h> {
  return h(
    'table',
    { style: { borderCollapse: 'collapse', fontSize: '13px' } },
    h(
      'thead',
      null,
      h('tr', null,
        h('th', { style: th }, '函数'),
        h('th', { style: th }, '返回值')),
    ),
    h(
      'tbody',
      null,
      props.rows.map(([fn, out]) =>
        h('tr', { key: fn },
          h('td', { style: td }, fn),
          h('td', { style: td }, out)),
      ),
    ),
  )
}

const th: Record<string, string | number> = { textAlign: 'left', padding: '6px 14px 6px 0', color: 'var(--dshpc-fg-3)' }
const td: Record<string, string | number> = { padding: '5px 14px 5px 0', borderTop: '1px solid var(--dshpc-border-faint)' }

export function DatePage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(Note, { text: t('utilsNote') }),
    h(Example, { title: 'date / time', hint: t('dateHint'), code: CODE_DATE }, h(FnTable, { rows: DATE_ROWS })),
    h(CodeOnly, { labelKey: 'docUsage', code: CODE_UTILS_USAGE }),
    h(ApiTable, { title: '日期时间格式化函数', rows: DATE_API }),
  )
}

export function NumberPage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(Note, { text: t('utilsNote') }),
    h(Example, { title: 'number / bytes', hint: t('numberHint'), code: CODE_NUMBER }, h(FnTable, { rows: NUMBER_ROWS })),
    h(CodeOnly, { labelKey: 'docUsage', code: CODE_UTILS_USAGE }),
    h(ApiTable, { title: '数字 / 体积格式化函数', rows: NUMBER_API }),
  )
}

export function TextPage(): ReturnType<typeof h> {
  return h(Placeholder, { descKey: 'textDesc' })
}

export function HttpPage(): ReturnType<typeof h> {
  return h(Placeholder, { descKey: 'httpDesc' })
}

/**
 * 多语言。
 * 只有一个真实可看的：当前语言。它是核心的单一 locale 状态，由宿主驱动 —— 切宿主语言再看这一行。
 */
export function I18nPage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(Note, { text: t('utilsNote') }),
    h(
      Example,
      { title: 'getLocale / setLocale', hint: t('i18nDesc'), code: CODE_I18N },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        h('span', { style: { fontFamily: 'var(--dshpc-font-mono)', fontSize: '12px', color: 'var(--dshpc-fg-3)' } }, t('i18nNow')),
        h('code', {
          style: {
            fontFamily: 'var(--dshpc-font-mono)', fontSize: '13px', padding: '3px 10px',
            borderRadius: '6px', background: 'var(--dshpc-open-bg)', color: 'var(--dshpc-business)',
          },
        }, getLocale()),
      ),
    ),
    h(CodeOnly, { labelKey: 'docUsage', code: CODE_UTILS_USAGE }),
    h(ApiTable, { title: '多语言 API', rows: I18N_API }),
  )
}
