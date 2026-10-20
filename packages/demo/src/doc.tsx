/**
 * 文档骨架积木（Bootstrap 文档站式）：提示框 / 示例+代码双栏 / 用法 / API 表。
 *
 * 只管「页面怎么摆」，不进库 —— 库里没有也不该有「文档站外壳」这种东西。
 * 样式真源在 demo.css（由 scripts/gen-css.mjs 生成本包内的 demo-css.generated.ts）。
 * 代码高亮与复制按钮一律走官方 CodeBlock，不自绘（官方件优先，见 docs/requirements.md）。
 */
import { createElement as h, type ReactNode } from 'react'
import { CodeBlock } from '@deepseek-ai/dsh-client-ui-primitives'
import { StripCard } from '../../../dist/ui/index.js'
import { t, type DemoMessageKey } from './i18n.js'

export type ApiRow = {
  name: string
  type: string
  def: string
  descKey: DemoMessageKey
}

/**
 * 页级备注框：直接用核心 StripCard（方角 + 左缘 4px 通高色条 + 同色系浅底，无可见边框），
 * 不自绘 callout —— 演示站里的提示与插件真实用的提示必须是同一个东西。
 */
export function Note(props: { text: string }): ReturnType<typeof h> {
  return h(
    StripCard,
    { accent: 'business', className: 'dshpc-doc-note' },
    h(
      'div',
      { className: 'dshpc-doc-note__body' },
      h('span', { className: 'dshpc-doc-note__mark' }, t('docNote')),
      h('span', null, props.text),
    ),
  )
}

/** 一段代码（用法 / 安装这类没有实时渲染的块）。 */
export function CodeOnly(props: { labelKey: DemoMessageKey; code: string; lang?: string }): ReturnType<typeof h> {
  return h(
    'div',
    { className: 'dshpc-doc-block' },
    h('div', { className: 'dshpc-doc-label' }, t(props.labelKey)),
    h(CodeBlock, {
      code: props.code,
      lang: props.lang ?? 'tsx',
      showHeader: true,
      copyLabel: t('docCopy'),
      copiedLabel: t('docCopied'),
    }),
  )
}

/**
 * 一个示例 = 左边实时渲染 + 右边可滚动的高亮代码。
 * 两栏用 grid auto-fit：容器窄到放不下两列时自动塌成一列（代码落到示例下方）。
 */
export function Example(props: {
  title: string
  hint?: string
  code: string
  children?: ReactNode
}): ReturnType<typeof h> {
  return h(
    'section',
    { className: 'dshpc-doc-example' },
    h(
      'div',
      { className: 'dshpc-doc-example__head' },
      h('div', { className: 'dshpc-doc-example__title' }, props.title),
      props.hint === undefined
        ? null
        : h('div', { className: 'dshpc-doc-example__hint' }, props.hint),
    ),
    h(
      'div',
      { className: 'dshpc-doc-example__body' },
      h(
        'div',
        { className: 'dshpc-doc-example__demo' },
        h('div', { className: 'dshpc-doc-label' }, t('docPreview')),
        props.children ?? null,
      ),
      h(
        'div',
        { className: 'dshpc-doc-example__code' },
        h('div', { className: 'dshpc-doc-label' }, t('docCode')),
        h(
          'div',
          { className: 'dshpc-doc-example__scroll' },
          h(CodeBlock, {
            code: props.code,
            lang: 'tsx',
            showHeader: true,
            copyLabel: t('docCopy'),
            copiedLabel: t('docCopied'),
          }),
        ),
      ),
    ),
  )
}

/** API 表：属性 | 类型 | 默认值 | 说明（说明走字典，随语言切换）。 */
export function ApiTable(props: { rows: readonly ApiRow[] }): ReturnType<typeof h> {
  return h(
    'div',
    { className: 'dshpc-doc-block' },
    h('div', { className: 'dshpc-doc-label' }, t('docApi')),
    h(
      'table',
      { className: 'dshpc-doc-api' },
      h(
        'thead',
        null,
        h(
          'tr',
          null,
          h('th', null, t('docApiName')),
          h('th', null, t('docApiType')),
          h('th', null, t('docApiDefault')),
          h('th', null, t('docApiDesc')),
        ),
      ),
      h(
        'tbody',
        null,
        props.rows.map((row) =>
          h(
            'tr',
            { key: row.name },
            h('td', null, row.name),
            h('td', null, row.type),
            h('td', null, row.def),
            h('td', null, t(row.descKey)),
          ),
        ),
      ),
    ),
  )
}
