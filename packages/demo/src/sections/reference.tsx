import { createElement as h } from 'react'
import { Demo, Placeholder } from './index.js'
import { t, type DemoMessageKey } from '../i18n.js'

// 构建时由 packages/demo/build.mjs 的 define 注入（读两份 package.json）。
declare const __CORE_VERSION__: string
declare const __DEMO_VERSION__: string
declare const __BUILD_STAMP__: string

export function A11yPage(): ReturnType<typeof h> {
  return h(Placeholder, { descKey: 'a11yDesc' })
}

/** 明确不提供的部分。写出来是为了让人不用猜 —— 这些条目与 docs/design/features.md 的「不提供什么」同源。 */
const OUT_OF_SCOPE: DemoMessageKey[] = ['roadmapOut', 'roadmapMirror', 'roadmapPreview', 'roadmapSkeleton']

export function RoadmapPage(): ReturnType<typeof h> {
  return h(
    Demo,
    { title: 'out of scope', hint: t('roadmapHint') },
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
      // SidebarLayout / SplitPane 属于「待补」但没那么绝对，单独标一行
      h(
        'div',
        { style: { marginTop: '2px', fontSize: '12px', color: 'var(--dshpc-fg-3)' } },
        t('roadmapLayout'),
      ),
    ),
  )
}

/**
 * 版本与构建。
 * 这部分原先吊在侧栏底部；按新的两级 IA 它是「参考」里的一页，不占导航。
 */
export function BuildPage(): ReturnType<typeof h> {
  const rows: [string, string][] = [
    [t('buildCore'), `v${__CORE_VERSION__}`],
    [t('buildDemo'), `v${__DEMO_VERSION__}`],
    [t('buildStamp'), __BUILD_STAMP__],
  ]
  return h(
    Demo,
    { title: 'version / build', hint: t('buildDesc') },
    h(
      'table',
      { style: { borderCollapse: 'collapse', fontSize: '13px' } },
      h(
        'tbody',
        null,
        rows.map(([label, value]) =>
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
  )
}
