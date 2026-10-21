import { createElement as h } from 'react'
import { Placeholder } from './index.js'
import { Example, Note } from '../doc.js'
import { t, type DemoMessageKey } from '../i18n.js'

// 构建时由 packages/demo/build.mjs 的 define 注入（读两份 package.json）。
declare const __CORE_VERSION__: string
declare const __DEMO_VERSION__: string
declare const __BUILD_STAMP__: string

/** 明确不提供的部分。写出来是为了让人不用猜 —— 与 docs/design/features.md 的「不提供什么」同源。 */
const OUT_OF_SCOPE: DemoMessageKey[] = ['roadmapOut', 'roadmapMirror', 'roadmapPreview', 'roadmapSkeleton']

/**
 * 参考与约定。
 * 原「参考」组的三条（无障碍 / 缺口与路线图 / 版本与构建）并成一页 —— 三条都是说明性内容，
 * 分开占三个侧栏条目反而显得碎。
 */
export function ReferencePage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(Note, { text: t('referenceNote') }),
    h(Example, { title: t('secA11y') }, h(Placeholder, { descKey: 'a11yDesc' })),
    h(
      Example,
      { title: t('secRoadmap'), hint: t('roadmapHint') },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        OUT_OF_SCOPE.map((key) =>
          h(
            'div',
            { key, style: { display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px' } },
            h('span', { style: { color: 'var(--dshpc-fg-4)', flex: 'none', lineHeight: '1.7' } }, '·'),
            h('span', { style: { color: 'var(--dshpc-fg-2)', lineHeight: '1.7' } }, t(key)),
          ),
        ),
        h(
          'div',
          { style: { marginTop: '2px', fontSize: '12px', color: 'var(--dshpc-fg-3)' } },
          t('roadmapLayout'),
        ),
      ),
    ),
    h(
      Example,
      { title: t('secBuild'), hint: t('buildDesc') },
      h(
        'table',
        { style: { borderCollapse: 'collapse', fontSize: '13px' } },
        h(
          'tbody',
          null,
          [
            [t('buildCore'), `v${__CORE_VERSION__}`],
            [t('buildDemo'), `v${__DEMO_VERSION__}`],
            [t('buildStamp'), __BUILD_STAMP__],
          ].map(([label, value]) =>
            h('tr', { key: label },
              h('td', { style: { padding: '5px 18px 5px 0', color: 'var(--dshpc-fg-3)', whiteSpace: 'nowrap' } }, label),
              h('td', {
                style: {
                  padding: '5px 14px 5px 0', fontFamily: 'var(--dshpc-font-mono)',
                  color: 'var(--dshpc-fg)', wordBreak: 'break-all',
                },
              }, value)),
          ),
        ),
      ),
    ),
  )
}
